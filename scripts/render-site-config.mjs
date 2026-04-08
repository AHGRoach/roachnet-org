import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const releaseVersion = process.env.ROACHNET_RELEASE_VERSION || '1.0.6'
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
    redirectUrl: process.env.ROACHNET_AUTH_REDIRECT_URL || 'https://roachnet.org/account/',
  },
  webChat: {
    enabled: webChatEnabled,
    mode: process.env.ROACHNET_WEB_CHAT_MODE || 'planned',
    accountRequired: process.env.ROACHNET_WEB_CHAT_ACCOUNT_REQUIRED !== '0',
  },
}

const output = `window.__ROACHNET_SITE_CONFIG__ = ${JSON.stringify(config, null, 2)}\n`
await writeFile(path.join(repoRoot, 'site-config.js'), output, 'utf8')
