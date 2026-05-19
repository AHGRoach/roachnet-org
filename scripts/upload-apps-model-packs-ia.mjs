#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdtemp, open, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const sourceRoot =
  process.env.ROACHNET_ROACHSPEECH_PACKS_DIR ||
  path.resolve(repoRoot, '../RoachNet/native/macos/dist/RoachSpeechPacks')

const identifier = process.env.ROACHNET_ARCHIVE_IDENTIFIER || 'roachnet-apps-catalog-v1_0_5'
const dryRun = process.argv.includes('--dry-run')
const statusOnly = process.argv.includes('--status')
const singleObject = process.argv.includes('--single-object')
const skipExisting = process.env.ROACHNET_IA_SKIP_EXISTING !== '0'
const maxParts = Number(process.argv.find((argument) => argument.startsWith('--max-parts='))?.split('=')[1] || 0)
const maxArchives = Number(process.argv.find((argument) => argument.startsWith('--max-archives='))?.split('=')[1] || 0)
const uploadRateLimit = process.env.ROACHNET_IA_LIMIT_RATE || '512k'
const uploadFileAttempts = Number(process.env.ROACHNET_IA_FILE_ATTEMPTS || 6)

const metadataHeaders = {
  'x-archive-meta-title': 'RoachNet v1.0.5 Apps Catalog Optional Content',
  'x-archive-meta-creator': 'RoachWares',
  'x-archive-meta-mediatype': 'data',
  'x-archive-meta-description':
    'First-party optional RoachNet installable content surfaced through Apps.RoachNet.org descriptors. Large archives live on Internet Archive/public rails; the App Store keeps descriptors and checksums.',
  'x-archive-meta-subject': 'RoachNet;RoachWares;Core ML;speech-to-text;text-to-speech;offline AI;local-first software',
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
  })
  if (result.status !== 0) {
    const stderr = result.stderr?.trim()
    const stdout = result.stdout?.trim()
    throw new Error(`${command} failed${stderr ? `: ${stderr}` : stdout ? `: ${stdout}` : ''}`)
  }
  return result.stdout || ''
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function assertReadable(filePath) {
  await access(filePath)
  return filePath
}

async function readIaKeys() {
  const configPath = path.join(os.homedir(), '.config', 'internetarchive', 'ia.ini')
  const config = await readFile(configPath, 'utf8')
  const access = config.match(/^access\s*=\s*(.+)$/m)?.[1]?.trim()
  const secret = config.match(/^secret\s*=\s*(.+)$/m)?.[1]?.trim()
  if (!access || !secret) {
    throw new Error('Internet Archive S3 keys were not found in ~/.config/internetarchive/ia.ini. Run `ia configure` first.')
  }
  return { access, secret }
}

async function readDescriptorIndex() {
  const descriptorIndexPath = path.join(repoRoot, 'downloads', 'model-packs', 'index.json')
  const index = JSON.parse(await readFile(descriptorIndexPath, 'utf8'))
  return (index.descriptors || [])
    .filter((descriptor) => descriptor.sha256 && descriptor.filename && Array.isArray(descriptor.parts) && descriptor.parts.length > 0)
    .map((descriptor) => ({
      ...descriptor,
      filePath: path.join(sourceRoot, descriptor.filename),
      checksumPath: path.join(sourceRoot, `${descriptor.filename}.sha256`),
    }))
}

async function assertDescriptorsMatchLocalFiles(descriptors) {
  for (const descriptor of descriptors) {
    await assertReadable(descriptor.filePath)
    await assertReadable(descriptor.checksumPath)
    const info = await stat(descriptor.filePath)
    if (Number(descriptor.bytes) !== info.size) {
      throw new Error(`Descriptor size mismatch for ${descriptor.filename}. Expected ${descriptor.bytes}, found ${info.size}.`)
    }
    const sidecarDigest = (await readFile(descriptor.checksumPath, 'utf8')).trim().split(/\s+/)[0]?.toLowerCase()
    if (sidecarDigest !== descriptor.sha256) {
      throw new Error(`Checksum sidecar does not match Apps descriptor for ${descriptor.filename}`)
    }
    const expectedBytes = descriptor.parts.reduce((sum, part) => sum + Number(part.bytes || 0), 0)
    if (expectedBytes !== info.size) {
      throw new Error(`Part manifest size mismatch for ${descriptor.filename}. Expected ${info.size}, found ${expectedBytes}.`)
    }
  }
}

function uploadUrl(remoteKey) {
  return `https://s3.us.archive.org/${identifier}/${remoteKey.split('/').map(encodeURIComponent).join('/')}`
}

async function uploadFile(filePath, remoteKey, keys, includeMetadata) {
  const info = await stat(filePath)
  const args = [
    '-fS',
    '-4',
    '--tlsv1.2',
    '--http1.1',
    '--no-progress-meter',
    '--limit-rate',
    uploadRateLimit,
    '--retry',
    '10',
    '--retry-delay',
    '10',
    '--retry-all-errors',
    '--connect-timeout',
    '30',
    '-X',
    'PUT',
    '-T',
    filePath,
    '-H',
    `authorization: LOW ${keys.access}:${keys.secret}`,
    '-H',
    'x-archive-keep-old-version:1',
    '-H',
    'Content-Type: application/octet-stream',
    '-H',
    'Expect:',
  ]

  if (includeMetadata) {
    for (const [header, value] of Object.entries(metadataHeaders)) {
      args.push('-H', `${header}:${value}`)
    }
  }

  args.push(uploadUrl(remoteKey))

  if (dryRun) {
    console.log(`curl PUT ${remoteKey} (${info.size} bytes)`)
    return
  }

  for (let attempt = 1; attempt <= uploadFileAttempts; attempt += 1) {
    try {
      console.log(`uploading ${remoteKey} (${info.size} bytes)${attempt > 1 ? `, script retry ${attempt}/${uploadFileAttempts}` : ''}`)
      run('curl', args, { stdio: 'inherit' })
      return
    } catch (error) {
      if (attempt >= uploadFileAttempts) throw error
      const delaySeconds = Math.min(60, 10 * attempt)
      console.warn(`upload failed for ${remoteKey}; retrying in ${delaySeconds}s`)
      await wait(delaySeconds * 1000)
    }
  }
}

async function remoteObjectLooksPublished(remoteKey, expectedBytes) {
  if (!skipExisting || dryRun) return false
  const result = spawnSync(
    'curl',
    ['-fsIL', '--max-time', '20', `https://archive.org/download/${identifier}/${encodeURIComponent(remoteKey)}`],
    {
      cwd: repoRoot,
      env: process.env,
      encoding: 'utf8',
      stdio: 'pipe',
    }
  )
  if (result.status !== 0) return false
  const lengthMatch = String(result.stdout || '').match(/content-length:\s*(\d+)/i)
  if (!lengthMatch) return true
  return Number(lengthMatch[1]) === Number(expectedBytes)
}

async function writeChunkFile(descriptor, part, tempRoot) {
  const partBytes = Number(part.bytes)
  const partOffset = Number(part.offset)
  if (!Number.isSafeInteger(partBytes) || partBytes <= 0 || !Number.isSafeInteger(partOffset) || partOffset < 0) {
    throw new Error(`Invalid part manifest for ${descriptor.filename} part ${part.index}.`)
  }

  const chunkPath = path.join(tempRoot, `${part.key}.upload-part`)
  const handle = await open(descriptor.filePath, 'r')
  try {
    const buffer = Buffer.allocUnsafe(partBytes)
    const { bytesRead } = await handle.read(buffer, 0, partBytes, partOffset)
    if (bytesRead !== partBytes) {
      throw new Error(`Could not read ${partBytes} bytes from ${descriptor.filename} at offset ${partOffset}.`)
    }
    const actualSha256 = createHash('sha256').update(buffer).digest('hex')
    if (part.sha256 && actualSha256 !== part.sha256) {
      throw new Error(`Part checksum mismatch for ${part.key}. Expected ${part.sha256}, found ${actualSha256}.`)
    }
    const envelope = part.encoding === 'roachnet-ia-chunk-v1' ? Buffer.from(part.header || '', 'utf8') : Buffer.alloc(0)
    await writeFile(chunkPath, envelope.length > 0 ? Buffer.concat([envelope, buffer]) : buffer)
    return chunkPath
  } finally {
    await handle.close()
  }
}

async function uploadDescriptor(descriptor, keys, state) {
  const sidecarRemoteKey = `${descriptor.internetArchiveKey}.sha256`
  if (await remoteObjectLooksPublished(sidecarRemoteKey, (await stat(descriptor.checksumPath)).size)) {
    console.log(`already published ${sidecarRemoteKey}`)
  } else {
    await uploadFile(descriptor.checksumPath, sidecarRemoteKey, keys, state.firstUpload)
  }
  state.firstUpload = false

  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'roachnet-ia-upload-'))
  try {
    for (const part of descriptor.parts) {
      if (maxParts > 0 && state.uploadedParts >= maxParts) {
        return
      }

      if (await remoteObjectLooksPublished(part.key, part.encodedBytes || part.bytes)) {
        console.log(`already published ${part.key}`)
        continue
      }

      const chunkPath = await writeChunkFile(descriptor, part, tempRoot)
      try {
        await uploadFile(chunkPath, part.key, keys, state.firstUpload)
        state.firstUpload = false
        state.uploadedParts += 1
      } finally {
        await rm(chunkPath, { force: true })
      }
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
}

async function uploadSingleObjectDescriptor(descriptor, state) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'roachnet-ia-single-upload-'))
  const archiveRemoteKey = descriptor.internetArchiveKey
  const checksumRemoteKey = `${descriptor.internetArchiveKey}.sha256`
  const archiveLink = path.join(tempRoot, archiveRemoteKey)
  const checksumLink = path.join(tempRoot, checksumRemoteKey)

  await symlink(descriptor.filePath, archiveLink)
  await symlink(descriptor.checksumPath, checksumLink)

  const args = [
    'upload',
    identifier,
    checksumLink,
    archiveLink,
    '--checksum',
    '--verify',
    '--no-derive',
    '--no-collection-check',
    '-R',
    '10',
    '-s',
    '10',
    '-H',
    'x-archive-keep-old-version:1',
  ]

  if (state.firstUpload) {
    for (const [header, value] of Object.entries(metadataHeaders)) {
      args.push('-H', `${header}:${value}`)
    }
  }

  if (dryRun) {
    console.log(`ia ${args.join(' ')}`)
  } else {
    console.log(`ia upload ${checksumRemoteKey}`)
    console.log(`ia upload ${archiveRemoteKey}`)
    run('ia', args, { stdio: 'inherit' })
  }

  state.firstUpload = false
  await rm(tempRoot, { recursive: true, force: true })
  state.uploadedArchives += 1
}

async function main() {
  const descriptors = await readDescriptorIndex()
  await assertDescriptorsMatchLocalFiles(descriptors)

  if (statusOnly) {
    run('ia', ['list', identifier, '--verbose'], { stdio: 'inherit' })
    return
  }

  const keys = singleObject ? null : await readIaKeys()
  const state = { firstUpload: true, uploadedParts: 0, uploadedArchives: 0 }
  const totalParts = descriptors.reduce((sum, descriptor) => sum + descriptor.parts.length, 0)
  console.log(`IA target: https://archive.org/details/${identifier}`)
  const cap = singleObject
    ? maxArchives > 0
      ? `, capped at ${maxArchives} archive(s)`
      : ''
    : maxParts > 0
      ? `, capped at ${maxParts} part(s)`
      : ''
  console.log(`${singleObject ? 'Single-object' : 'Chunk-aware'} upload plan: ${descriptors.length} archives, ${totalParts} parts${cap}.`)

  for (const descriptor of descriptors) {
    if (singleObject && maxArchives > 0 && state.uploadedArchives >= maxArchives) break
    if (!singleObject && maxParts > 0 && state.uploadedParts >= maxParts) break
    console.log(`publishing ${descriptor.filename} (${descriptor.parts.length} parts)`)
    if (singleObject) {
      await uploadSingleObjectDescriptor(descriptor, state)
    } else {
      await uploadDescriptor(descriptor, keys, state)
    }
  }

  console.log(`${singleObject ? 'Single-object' : 'Chunk-aware'} Apps catalog upload finished for https://archive.org/details/${identifier}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
