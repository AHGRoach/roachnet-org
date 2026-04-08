#!/usr/bin/env node

import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const outputRoot = path.join(repoRoot, 'website-accounts-dist')

async function main() {
  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(outputRoot, { recursive: true })

  const copyTargets = [
    'app.css',
    'account.js',
    'site-account.js',
    'assets',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
  ]

  for (const target of copyTargets) {
    await cp(path.join(repoRoot, target), path.join(outputRoot, target), {
      recursive: true,
      force: true,
    })
  }

  await cp(path.join(repoRoot, 'account/index.html'), path.join(outputRoot, 'index.html'), {
    force: true,
  })

  const releaseVersion = process.env.ROACHNET_RELEASE_VERSION || '1.0.5'
  const authEnabled =
    process.env.ROACHNET_AUTH_ENABLED === '1' &&
    Boolean(process.env.ROACHNET_SUPABASE_URL) &&
    Boolean(process.env.ROACHNET_SUPABASE_ANON_KEY)
  const webChatEnabled = process.env.ROACHNET_WEB_CHAT_ENABLED === '1'

  const config = {
    releaseVersion,
    auth: {
      enabled: authEnabled,
      provider: 'supabase',
      supabaseUrl: process.env.ROACHNET_SUPABASE_URL || '',
      supabaseAnonKey: process.env.ROACHNET_SUPABASE_ANON_KEY || '',
      redirectUrl: process.env.ROACHNET_AUTH_REDIRECT_URL || 'https://accounts.roachnet.org/',
      registerUrl: process.env.ROACHNET_ACCOUNT_REGISTER_URL || '/.netlify/functions/register-account',
    },
    webChat: {
      enabled: webChatEnabled,
      mode: process.env.ROACHNET_WEB_CHAT_MODE || 'planned',
      accountRequired: process.env.ROACHNET_WEB_CHAT_ACCOUNT_REQUIRED !== '0',
    },
    turnstile: {
      enabled:
        process.env.ROACHNET_TURNSTILE_ENABLED === '1' &&
        Boolean(process.env.ROACHNET_TURNSTILE_SITE_KEY),
      siteKey: process.env.ROACHNET_TURNSTILE_SITE_KEY || '',
    },
  }

  await writeFile(
    path.join(outputRoot, 'site-config.js'),
    `window.__ROACHNET_SITE_CONFIG__ = ${JSON.stringify(config, null, 2)}\n`,
    'utf8'
  )

  await writeFile(
    path.join(outputRoot, '_redirects'),
    [
      '/account / 301',
      '/account/* /:splat 301',
      '/* /index.html 200',
    ].join('\n') + '\n',
    'utf8'
  )

  console.log(`Built Accounts site into ${outputRoot}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
