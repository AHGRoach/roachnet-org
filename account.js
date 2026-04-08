import { getSiteAuthState, refreshSiteSession, sessionLabel } from './site-account.js'

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

let accountMode = 'signin'
let authState = null

function setFeedback(message, tone = 'muted') {
  if (!feedback) return
  feedback.textContent = message || ''
  feedback.dataset.tone = tone
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
    setFeedback('This deploy does not have live account auth configured yet.')
    return
  }

  if (session?.user) {
    statusTitle.textContent = 'Signed in.'
    statusBody.textContent = `Website lane is linked to ${sessionLabel(session)}.`
    statusBadge.textContent = 'Live'
    statusBadge.dataset.state = 'live'
    signOutButton.hidden = false
    setDisabled(false)
    setFeedback('Account session is live.', 'live')
    return
  }

  statusTitle.textContent = 'Ready for sign-in.'
  statusBody.textContent = 'Use the account lane for future RoachClaw web chat and remembered site state.'
  statusBadge.textContent = 'Ready'
  statusBadge.dataset.state = 'ready'
  signOutButton.hidden = true
  setDisabled(false)
  setFeedback('')
}

async function loadAuthState() {
  authState = await getSiteAuthState()
  renderStatus()
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
})

signOutButton?.addEventListener('click', async () => {
  if (!authState?.client) return
  setFeedback('Signing out…')
  await authState.client.auth.signOut()
  authState = {
    ...authState,
    session: null,
  }
  renderStatus()
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
      ? await authState.client.auth.signUp({ email, password })
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
  setFeedback(
    accountMode === 'signup'
      ? 'Account created. Check your mail if the provider is set to confirm sign-ups.'
      : 'Signed in.',
    'live'
  )
})

setMode(accountMode)
loadAuthState()
