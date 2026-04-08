const defaultSiteConfig = {
  releaseVersion: '1.0.1',
  auth: {
    enabled: false,
    provider: 'supabase',
    supabaseUrl: '',
    supabaseAnonKey: '',
    redirectUrl: 'https://accounts.roachnet.org/',
  },
  webChat: {
    enabled: false,
    mode: 'planned',
    accountRequired: true,
  },
}

let cachedAuthState = null

export function getSiteConfig() {
  const configured = window.__ROACHNET_SITE_CONFIG__ || {}
  return {
    ...defaultSiteConfig,
    ...configured,
    auth: {
      ...defaultSiteConfig.auth,
      ...(configured.auth || {}),
    },
    webChat: {
      ...defaultSiteConfig.webChat,
      ...(configured.webChat || {}),
    },
  }
}

export async function getSiteAuthState() {
  if (cachedAuthState) {
    return cachedAuthState
  }

  const config = getSiteConfig()
  const auth = config.auth || {}
  const enabled =
    auth.enabled === true &&
    auth.provider === 'supabase' &&
    typeof auth.supabaseUrl === 'string' &&
    auth.supabaseUrl.length > 0 &&
    typeof auth.supabaseAnonKey === 'string' &&
    auth.supabaseAnonKey.length > 0

  if (!enabled) {
    cachedAuthState = {
      enabled: false,
      client: null,
      session: null,
      reason:
        'Site accounts are staged, but the auth provider is not armed on this deploy yet. RoachTail, RoachSync, and the local runtime still stay on your own devices until the web lane is turned on.',
      config,
    }
    return cachedAuthState
  }

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
  const client = createClient(auth.supabaseUrl, auth.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })

  const { data, error } = await client.auth.getSession()
  cachedAuthState = {
    enabled: true,
    client,
    session: error ? null : data.session,
    reason: error ? error.message : '',
    config,
  }
  return cachedAuthState
}

export function sessionLabel(session) {
  const email = session?.user?.email
  return email && email.trim() ? email.trim() : 'Signed in'
}

export async function refreshSiteSession() {
  if (!cachedAuthState?.client) {
    return null
  }

  const { data } = await cachedAuthState.client.auth.getSession()
  cachedAuthState = {
    ...cachedAuthState,
    session: data.session,
  }
  return cachedAuthState.session
}

export function clearCachedAuthState() {
  cachedAuthState = null
}
