import {
  clearCachedAuthState,
  getSiteAuthState,
  refreshSiteSession,
  sessionLabel,
} from './site-account.js'

const statusTitle = document.querySelector('#account-status-title')
const statusBody = document.querySelector('#account-status-body')
const statusBadge = document.querySelector('#account-status-badge')
const feedback = document.querySelector('#account-feedback')
const refreshButton = document.querySelector('#account-refresh')
const signOutButton = document.querySelector('#account-signout')
const submitButton = document.querySelector('#account-submit')
const form = document.querySelector('#account-form')
const formNote = document.querySelector('#account-form-note')
const emailInput = document.querySelector('#account-email')
const passwordInput = document.querySelector('#account-password')
const tabs = [...document.querySelectorAll('[data-account-mode]')]
const snapshotTitle = document.querySelector('#account-snapshot-title')
const snapshotBody = document.querySelector('#account-snapshot-body')
const deviceCount = document.querySelector('#account-device-count')
const appCount = document.querySelector('#account-app-count')
const settingsState = document.querySelector('#account-settings-state')

const browserDeviceStorageKey = 'RoachNetAccountBrowserDeviceID'

let accountMode = 'signin'
let authState = null
let authSubscription = null

function setFeedback(message, tone = 'muted') {
  if (!feedback) return
  feedback.textContent = message || ''
  feedback.dataset.tone = tone
}

function setSnapshot({
  title,
  body,
  devices = '—',
  apps = '—',
  settings = '—',
}) {
  if (snapshotTitle) snapshotTitle.textContent = title
  if (snapshotBody) snapshotBody.textContent = body
  if (deviceCount) deviceCount.textContent = devices
  if (appCount) appCount.textContent = apps
  if (settingsState) settingsState.textContent = settings
}

function getBrowserDeviceID() {
  const existing = window.localStorage.getItem(browserDeviceStorageKey)
  if (existing) {
    return existing
  }

  const next = `account-web-${window.crypto.randomUUID()}`
  window.localStorage.setItem(browserDeviceStorageKey, next)
  return next
}

function inferPlatform() {
  const userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.includes('iphone')) return 'ios-web'
  if (userAgent.includes('ipad')) return 'ipados-web'
  if (userAgent.includes('mac os')) return 'macos-web'
  if (userAgent.includes('windows')) return 'windows-web'
  if (userAgent.includes('linux')) return 'linux-web'
  return 'web'
}

function displayNameFor(profile, session) {
  if (profile?.display_name && profile.display_name.trim()) {
    return profile.display_name.trim()
  }

  const email = session?.user?.email || ''
  if (!email) return 'RoachNet account'
  return email.split('@')[0]
}

function setMode(nextMode) {
  accountMode = nextMode === 'signup' ? 'signup' : 'signin'
  tabs.forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.accountMode === accountMode)
  })

  if (submitButton) {
    submitButton.textContent = accountMode === 'signup' ? 'Create account' : 'Sign in'
  }

  if (formNote) {
    formNote.textContent =
      accountMode === 'signup'
        ? 'Create the website account that will hold future RoachClaw web-chat and synced settings state.'
        : 'Sign back in when you want the website lane tied to your existing RoachNet account.'
  }
}

function setDisabled(disabled) {
  for (const input of [emailInput, passwordInput, submitButton]) {
    if (input) {
      input.disabled = disabled
    }
  }
}

function renderStatus() {
  if (!authState) return

  const enabled = authState.enabled === true
  const session = authState.session

  if (!enabled) {
    statusTitle.textContent = 'Auth lane staged, not armed.'
    statusBody.textContent = authState.reason
    statusBadge.textContent = 'Disabled'
    statusBadge.dataset.state = 'disabled'
    signOutButton.hidden = true
    setDisabled(true)
    setSnapshot({
      title: 'Auth is disabled on this deploy.',
      body: 'The hosted account lane is staged, but this site is not carrying live Supabase keys yet.',
    })
    setFeedback('This deploy does not have live account auth configured yet. Your local device lanes still work without it.')
    return
  }

  if (session?.user) {
    statusTitle.textContent = 'Signed in.'
    statusBody.textContent = `Website lane is linked to ${sessionLabel(session)} and ready for future RoachClaw web chat, remembered installs, and device-aware sync state.`
    statusBadge.textContent = 'Live'
    statusBadge.dataset.state = 'live'
    signOutButton.hidden = false
    setDisabled(false)
    setFeedback('Account session is live.', 'live')
    return
  }

  statusTitle.textContent = 'Ready for sign-in.'
  statusBody.textContent = 'Use the account lane for future RoachClaw web chat, remembered site state, and account-linked device metadata.'
  statusBadge.textContent = 'Ready'
  statusBadge.dataset.state = 'ready'
  signOutButton.hidden = true
  setDisabled(false)
  setSnapshot({
    title: 'Sign in to load account state.',
    body: 'Linked lanes, saved installs, and sync-ready settings metadata will show up here once you sign in.',
  })
  setFeedback('')
}

async function syncSnapshot() {
  if (!authState?.client || !authState?.session?.user) {
    return
  }

  const client = authState.client
  const browserDeviceID = getBrowserDeviceID()
  const currentOrigin = window.location.origin

  const [touchResult, profileResult, settingsResult, devicesResult, appsResult] = await Promise.all([
    client.rpc('touch_device_link', {
      p_device_id: browserDeviceID,
      p_device_name: 'Accounts Web',
      p_platform: inferPlatform(),
      p_runtime_lane: 'account-web',
      p_metadata: {
        surface: 'accounts',
        origin: currentOrigin,
      },
    }),
    client
      .from('profiles')
      .select('display_name, email, plan, account_state, last_seen_at')
      .eq('id', authState.session.user.id)
      .maybeSingle(),
    client
      .from('user_settings')
      .select('updated_at, favorite_apps, settings')
      .eq('user_id', authState.session.user.id)
      .maybeSingle(),
    client.from('device_links').select('id', { count: 'exact', head: true }),
    client.from('saved_apps').select('id', { count: 'exact', head: true }),
  ])

  const errors = [
    touchResult.error,
    profileResult.error,
    settingsResult.error,
    devicesResult.error,
    appsResult.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    setFeedback(errors[0].message || 'Could not load the account snapshot.', 'error')
    setSnapshot({
      title: 'Account snapshot needs attention.',
      body: 'The account session is live, but this browser lane could not finish loading its synced state.',
      devices: '—',
      apps: '—',
      settings: 'Error',
    })
    return
  }

  const profile = profileResult.data
  const settings = settingsResult.data
  const devices = devicesResult.count ?? 0
  const apps = appsResult.count ?? 0
  const settingsCount =
    (settings?.favorite_apps?.length || 0) + Object.keys(settings?.settings || {}).length

  setSnapshot({
    title: `${displayNameFor(profile, authState.session)} is linked.`,
    body:
      devices > 0
        ? 'RoachTail and RoachSync metadata can anchor themselves here without dumping local machine details into the public site.'
        : 'This is a fresh account lane. Pair devices or save installs to start building synced state.',
    devices: String(devices),
    apps: String(apps),
    settings: settingsCount > 0 ? 'Remembered' : 'Fresh',
  })
}

async function loadAuthState() {
  authSubscription?.unsubscribe?.()
  authSubscription = null

  authState = await getSiteAuthState()
  renderStatus()

  if (authState?.client) {
    const { data } = authState.client.auth.onAuthStateChange((_event, session) => {
      authState = {
        ...authState,
        session,
      }
      renderStatus()
      void syncSnapshot()
    })
    authSubscription = data.subscription
  }

  await syncSnapshot()
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    setMode(tab.dataset.accountMode)
    setFeedback('')
  })
})

refreshButton?.addEventListener('click', async () => {
  setFeedback('Refreshing account state…')
  const session = await refreshSiteSession()
  if (authState) {
    authState = {
      ...authState,
      session,
    }
  }
  renderStatus()
  await syncSnapshot()
})

signOutButton?.addEventListener('click', async () => {
  if (!authState?.client) return
  setFeedback('Signing out…')
  await authState.client.auth.signOut()
  clearCachedAuthState()
  authState = null
  await loadAuthState()
})

form?.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!authState?.client) {
    setFeedback('Account auth is not armed on this deploy yet.')
    return
  }

  const email = emailInput?.value?.trim() || ''
  const password = passwordInput?.value || ''

  if (!email || !password) {
    setFeedback('Enter both email and password.')
    return
  }

  setFeedback(accountMode === 'signup' ? 'Creating account…' : 'Signing in…')

  const result =
    accountMode === 'signup'
      ? await authState.client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: authState.config?.auth?.redirectUrl,
            data: {
              display_name: email.split('@')[0],
            },
          },
        })
      : await authState.client.auth.signInWithPassword({ email, password })

  if (result.error) {
    setFeedback(result.error.message, 'error')
    return
  }

  authState = {
    ...authState,
    session: result.data?.session || authState.session,
  }
  renderStatus()
  await syncSnapshot()
  setFeedback(
    accountMode === 'signup'
      ? result.data?.session
        ? 'Account created and signed in.'
        : 'Account created. Check your mail if the provider is set to confirm sign-ups.'
      : 'Signed in.',
    'live'
  )
})

setMode(accountMode)
loadAuthState()
