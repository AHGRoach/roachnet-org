import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const outputPath = process.env.ROACHNET_SITE_CONFIG_OUTPUT || path.join(repoRoot, 'site-config.js')

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
    registerUrl:
      process.env.ROACHNET_ACCOUNT_REGISTER_URL ||
      'https://accounts.roachnet.org/.netlify/functions/register-account',
    remoteConfigUrl: process.env.ROACHNET_AUTH_REMOTE_CONFIG_URL || 'https://accounts.roachnet.org/site-config.js',
  },
  webChat: {
    enabled: webChatEnabled,
    mode: process.env.ROACHNET_WEB_CHAT_MODE || (webChatEnabled ? 'live' : 'planned'),
    accountRequired: process.env.ROACHNET_WEB_CHAT_ACCOUNT_REQUIRED !== '0',
    endpoint:
      process.env.ROACHNET_WEB_CHAT_ENDPOINT ||
      'https://accounts.roachnet.org/.netlify/functions/roachclaw-chat',
    providerLabel:
      process.env.ROACHNET_WEB_CHAT_PROVIDER_LABEL || 'RoachClaw local + RoachBrain Cloud',
    modelLabel: process.env.ROACHNET_WEB_CHAT_MODEL_LABEL || 'Local relay or cloud model',
  },
}

const output = `window.__ROACHNET_SITE_CONFIG__ = ${JSON.stringify(config, null, 2)}\n`
await writeFile(outputPath, output, 'utf8')
