import { getSiteAuthState, sessionLabel } from './site-account.js'

const modes = {
  paired: {
    kicker: 'Paired desktop',
    title: 'The browser talks to your own runtime, not a mystery box.',
    body: 'Pair through RoachTail, keep the model lane on your own machine, and let the site act like a clean front door instead of a fake hosted model wrapper.',
    badge: 'Best first lane',
    badgeState: 'ready',
    primaryLabel: 'Open pairing guide',
    primaryHref: 'https://roachnet.org/iOS/',
    messages: [
      'Browser lane points to your own desktop bridge.',
      'RoachTail keeps the control path private.',
      'Models stay on the machine you already trust.',
    ],
  },
  account: {
    kicker: 'Account lane',
    title: 'Website auth gives the browser somewhere clean to hold history and settings.',
    body: 'Use the account lane when the hosted RoachClaw surface is ready. That keeps chat history, settings, and device metadata out of anonymous browser state.',
    badge: 'Needs auth',
    badgeState: 'pending',
    primaryLabel: 'Open account page',
    primaryHref: 'https://roachnet.org/account/',
    messages: [
      'Accounts give the site a stable identity layer.',
      'That is the clean place for web chat history and synced preferences.',
      'It is not a replacement for the paired local lane.',
    ],
  },
  plan: {
    kicker: 'Build plan',
    title: 'Ship the paired lane first, then layer in the account-backed web lane.',
    body: 'The clean order is paired local bridge first, account-backed website session second, and only then the hosted browser chat surface.',
    badge: 'Roadmap',
    badgeState: 'disabled',
    primaryLabel: 'Read API docs',
    primaryHref: 'https://roachnet.org/api/',
    messages: [
      '1. Paired RoachTail bridge.',
      '2. Account auth and remembered settings.',
      '3. Hosted web-chat lane when the backend is real.',
    ],
  },
}

const buttons = [...document.querySelectorAll('[data-roachclaw-mode]')]
const modeKicker = document.querySelector('#roachclaw-mode-kicker')
const modeTitle = document.querySelector('#roachclaw-mode-title')
const modeBody = document.querySelector('#roachclaw-mode-body')
const modeBadge = document.querySelector('#roachclaw-mode-badge')
const primaryAction = document.querySelector('#roachclaw-primary-action')
const prototypeStatus = document.querySelector('#roachclaw-prototype-status')
const prototypeLog = document.querySelector('#roachclaw-prototype-log')

let activeMode = 'paired'

function renderMode(modeKey, authState) {
  const mode = modes[modeKey] || modes.paired
  activeMode = modeKey

  buttons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.roachclawMode === modeKey)
  })

  modeKicker.textContent = mode.kicker
  modeTitle.textContent = mode.title
  modeBody.textContent = mode.body
  modeBadge.textContent =
    modeKey === 'account' && authState?.enabled && authState?.session?.user
      ? `Live for ${sessionLabel(authState.session)}`
      : mode.badge
  modeBadge.dataset.state =
    modeKey === 'account' && authState?.enabled && authState?.session?.user ? 'live' : mode.badgeState
  primaryAction.textContent = mode.primaryLabel
  primaryAction.href = mode.primaryHref
  prototypeStatus.textContent =
    modeKey === 'account' && authState?.enabled && authState?.session?.user
      ? 'Account lane ready'
      : mode.badge

  prototypeLog.innerHTML = mode.messages
    .map(
      (message, index) => `<div class="roachclaw-chat-prototype__bubble ${
        index === 0 ? 'roachclaw-chat-prototype__bubble--user' : 'roachclaw-chat-prototype__bubble--system'
      }">${message}</div>`
    )
    .join('')
}

const authState = await getSiteAuthState()
renderMode(activeMode, authState)

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    renderMode(button.dataset.roachclawMode, authState)
  })
})
