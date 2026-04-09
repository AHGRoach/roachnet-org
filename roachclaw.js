import {
  clearCachedAuthState,
  getSiteAuthState,
  refreshSiteSession,
  sessionLabel,
} from './site-account.js'

const authTitle = document.querySelector('#roachclaw-auth-title')
const authBody = document.querySelector('#roachclaw-auth-body')
const authBadge = document.querySelector('#roachclaw-auth-badge')
const authForm = document.querySelector('#roachclaw-auth-form')
const authSubmit = document.querySelector('#roachclaw-auth-submit')
const signOutButton = document.querySelector('#roachclaw-signout')
const authNote = document.querySelector('#roachclaw-auth-note')
const authFeedback = document.querySelector('#roachclaw-auth-feedback')
const emailInput = document.querySelector('#roachclaw-email')
const passwordInput = document.querySelector('#roachclaw-password')
const newChatButton = document.querySelector('#roachclaw-new-chat')
const threadList = document.querySelector('#roachclaw-thread-list')
const workspaceTitle = document.querySelector('#roachclaw-workspace-title')
const workspaceBody = document.querySelector('#roachclaw-workspace-body')
const statusAccount = document.querySelector('#roachclaw-status-account')
const statusProvider = document.querySelector('#roachclaw-status-provider')
const statusModel = document.querySelector('#roachclaw-status-model')
const log = document.querySelector('#roachclaw-log')
const composer = document.querySelector('#roachclaw-composer')
const promptInput = document.querySelector('#roachclaw-prompt')
const sendButton = document.querySelector('#roachclaw-send')
const chatFeedback = document.querySelector('#roachclaw-chat-feedback')

let authState = null
let authSubscription = null
let threads = []
let activeThreadId = null
let messages = []
let authBusy = false
let chatBusy = false

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function setAuthFeedback(message, tone = 'muted') {
  authFeedback.textContent = message || ''
  authFeedback.dataset.tone = tone
}

function setChatFeedback(message, tone = 'muted') {
  chatFeedback.textContent = message || ''
  chatFeedback.dataset.tone = tone
}

function formatRelativeTime(value) {
  if (!value) return 'Fresh'

  const date = new Date(value)
  const diff = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const minutes = Math.round(diff / 60000)

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, 'minute')
  }

  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 48) {
    return formatter.format(hours, 'hour')
  }

  const days = Math.round(hours / 24)
  return formatter.format(days, 'day')
}

function activeThread() {
  return threads.find((thread) => thread.id === activeThreadId) || null
}

function syncComposerState() {
  const canChat = Boolean(authState?.enabled && authState?.session?.user && !chatBusy)
  promptInput.disabled = !canChat
  sendButton.disabled = !canChat
  newChatButton.disabled = !Boolean(authState?.enabled && authState?.session?.user)
}

function setAuthBusyState(isBusy) {
  authBusy = isBusy
  emailInput.disabled = isBusy || Boolean(authState?.session?.user) || !authState?.enabled
  passwordInput.disabled = isBusy || Boolean(authState?.session?.user) || !authState?.enabled
  authSubmit.disabled = isBusy || Boolean(authState?.session?.user) || !authState?.enabled
}

function setChatBusyState(isBusy) {
  chatBusy = isBusy
  syncComposerState()
}

function renderWorkspaceSummary() {
  const thread = activeThread()

  if (thread) {
    workspaceTitle.textContent = thread.title || 'RoachClaw thread'
    workspaceBody.textContent =
      thread.summary ||
      'This thread belongs to your signed-in account. Only your own session can read or extend it.'
    return
  }

  if (!authState?.enabled) {
    workspaceTitle.textContent = 'Hosted RoachClaw is staged on this deploy.'
    workspaceBody.textContent = authState?.reason || 'Auth is not armed on this deploy yet.'
    return
  }

  if (!authState?.session?.user) {
    workspaceTitle.textContent = 'Sign in to open your own browser lane.'
    workspaceBody.textContent =
      'RoachClaw on the web keeps chat tied to your account instead of anonymous browser state.'
    return
  }

  workspaceTitle.textContent = 'Start a fresh RoachClaw thread.'
  workspaceBody.textContent =
    'New prompts stay tied to your own account history. Local device control and vault access still stay on the paired runtime path.'
}

function renderStatusTiles() {
  if (!authState) return

  statusAccount.textContent = authState.session?.user ? sessionLabel(authState.session) : 'Sign in required'
  statusProvider.textContent =
    authState.config?.webChat?.enabled === true
      ? authState.config.webChat.providerLabel || 'Hosted RoachClaw lane'
      : 'Hosted lane staged'
  statusModel.textContent =
    authState.config?.webChat?.modelLabel ||
    (authState.config?.webChat?.enabled === true ? 'Live model' : 'Provider not armed')
}

function threadButtonMarkup(thread) {
  return `
    <button class="roachclaw-thread${thread.id === activeThreadId ? ' is-active' : ''}" type="button" data-thread-id="${thread.id}">
      <strong>${escapeHtml(thread.title || 'New chat')}</strong>
      <span>${escapeHtml(thread.summary || 'Account-scoped RoachClaw thread.')}</span>
      <small>${escapeHtml(formatRelativeTime(thread.last_message_at || thread.created_at))}</small>
    </button>
  `
}

function attachThreadHandlers() {
  threadList.querySelectorAll('[data-thread-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const threadId = button.dataset.threadId || ''
      if (!threadId || threadId === activeThreadId) return
      activeThreadId = threadId
      renderThreadList()
      await loadMessages(threadId)
    })
  })
}

function renderThreadList() {
  if (!authState?.enabled) {
    threadList.innerHTML = '<div class="roachclaw-thread-empty">This deploy does not have account auth armed yet.</div>'
    return
  }

  if (!authState?.session?.user) {
    threadList.innerHTML = '<div class="roachclaw-thread-empty">Sign in to load only your own threads.</div>'
    return
  }

  if (!threads.length) {
    threadList.innerHTML =
      '<div class="roachclaw-thread-empty">No saved threads yet. Start the first one from the composer.</div>'
    return
  }

  threadList.innerHTML = threads.map(threadButtonMarkup).join('')
  attachThreadHandlers()
}

function messageMarkup(message) {
  const roleClass =
    message.role === 'user'
      ? 'roachclaw-message--user'
      : message.role === 'assistant'
        ? 'roachclaw-message--assistant'
        : 'roachclaw-message--system'
  const label =
    message.role === 'user' ? 'You' : message.role === 'assistant' ? 'RoachClaw' : 'System'
  const meta = [message.model, message.provider].filter(Boolean).join(' · ')

  return `
    <article class="roachclaw-message ${roleClass}${message.pending ? ' is-pending' : ''}">
      <header>
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(meta || formatRelativeTime(message.created_at))}</span>
      </header>
      <p>${escapeHtml(message.content)}</p>
    </article>
  `
}

function attachStarterHandlers() {
  log.querySelectorAll('[data-roachclaw-starter]').forEach((button) => {
    button.addEventListener('click', () => {
      promptInput.value = button.dataset.roachclawStarter || ''
      promptInput.focus()
    })
  })
}

function renderMessages() {
  if (!messages.length) {
    log.innerHTML = `
      <div class="roachclaw-empty-state">
        <span class="feature-card__eyebrow">First prompt</span>
        <h3>Start a thread from anywhere.</h3>
        <p>This lane keeps the website account-scoped. It does not dump local machine state into the browser by default.</p>
        <div class="roachclaw-starter-grid">
          <button class="roachclaw-starter" data-roachclaw-starter="Summarize what RoachNet can do across desktop, iOS, and the Apps store.">
            <strong>RoachNet overview</strong>
            <span>Get a fast read on the current product surface.</span>
          </button>
          <button class="roachclaw-starter" data-roachclaw-starter="Help me map out a RoachTail + RoachSync device setup without exposing my public IP.">
            <strong>RoachTail plan</strong>
            <span>Draft a secure multi-device lane.</span>
          </button>
          <button class="roachclaw-starter" data-roachclaw-starter="Give me a practical list of RoachNet Apps packs to install first for maps, medicine, and dev.">
            <strong>Starter packs</strong>
            <span>Pick the first content installs.</span>
          </button>
        </div>
      </div>
    `
    attachStarterHandlers()
    renderWorkspaceSummary()
    return
  }

  log.innerHTML = messages.map(messageMarkup).join('')
  log.scrollTop = log.scrollHeight
  renderWorkspaceSummary()
}

function renderAuth() {
  if (!authState) return

  if (!authState.enabled) {
    authTitle.textContent = 'Hosted auth is not armed on this deploy.'
    authBody.textContent = authState.reason
    authBadge.textContent = 'Disabled'
    authBadge.dataset.state = 'disabled'
    authNote.textContent = 'The account lane is staged, but this deploy is missing live auth keys.'
    signOutButton.hidden = true
    setAuthFeedback('This deploy cannot sign in yet.', 'error')
    setAuthBusyState(true)
    syncComposerState()
    renderStatusTiles()
    renderWorkspaceSummary()
    return
  }

  if (authState.session?.user) {
    authTitle.textContent = 'Signed in.'
    authBody.textContent = `Browser lane is tied to ${sessionLabel(authState.session)}.`
    authBadge.textContent = 'Live'
    authBadge.dataset.state = 'live'
    authNote.textContent = 'Only this account can read or extend the threads shown here.'
    emailInput.value = authState.session.user.email || ''
    passwordInput.value = '************'
    signOutButton.hidden = false
    setAuthFeedback('Account session is live.', 'live')
  } else {
    authTitle.textContent = 'Sign in to use the hosted RoachClaw lane.'
    authBody.textContent =
      'The browser lane uses your RoachNet account for thread ownership and secure history.'
    authBadge.textContent = 'Ready'
    authBadge.dataset.state = 'ready'
    authNote.textContent = 'Need an account first? Create it on the Accounts page, then sign in here.'
    emailInput.value = ''
    passwordInput.value = ''
    signOutButton.hidden = true
    setAuthFeedback('')
  }

  setAuthBusyState(authBusy)
  syncComposerState()
  renderStatusTiles()
  renderWorkspaceSummary()
}

async function loadThreads(preferredThreadId = activeThreadId) {
  if (!authState?.client || !authState?.session?.user) {
    threads = []
    activeThreadId = null
    messages = []
    renderThreadList()
    renderMessages()
    return
  }

  const { data, error } = await authState.client
    .from('chat_threads')
    .select('id,title,summary,last_message_at,created_at')
    .order('last_message_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(40)

  if (error) {
    setChatFeedback(error.message || 'Could not load your threads.', 'error')
    return
  }

  threads = data || []
  activeThreadId =
    (preferredThreadId && threads.some((thread) => thread.id === preferredThreadId) && preferredThreadId) ||
    threads[0]?.id ||
    null

  renderThreadList()

  if (activeThreadId) {
    await loadMessages(activeThreadId)
  } else {
    messages = []
    renderMessages()
  }
}

async function loadMessages(threadId) {
  if (!authState?.client || !authState?.session?.user || !threadId) {
    messages = []
    renderMessages()
    return
  }

  const { data, error } = await authState.client
    .from('chat_messages')
    .select('id,role,content,created_at,provider,model')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) {
    setChatFeedback(error.message || 'Could not load that thread.', 'error')
    return
  }

  messages = data || []
  renderMessages()
}

async function handleAuthSubmit(event) {
  event.preventDefault()

  if (!authState?.enabled || !authState?.client) {
    setAuthFeedback('This deploy does not have live auth enabled.', 'error')
    return
  }

  const email = String(emailInput.value || '').trim()
  const password = String(passwordInput.value || '')

  if (!email || !password) {
    setAuthFeedback('Enter your email and password first.', 'error')
    return
  }

  setAuthBusyState(true)
  setAuthFeedback('Signing in…')

  const { error } = await authState.client.auth.signInWithPassword({ email, password })

  if (error) {
    setAuthFeedback(error.message || 'Sign-in did not finish cleanly.', 'error')
    setAuthBusyState(false)
    return
  }

  await refreshSiteSession()
  setAuthBusyState(false)
}

async function handleSignOut() {
  if (!authState?.client) return
  setAuthBusyState(true)
  await authState.client.auth.signOut()
  clearCachedAuthState()
  setAuthBusyState(false)
}

async function handleSend(event) {
  event.preventDefault()

  if (!authState?.enabled || !authState?.session?.user) {
    setChatFeedback('Sign in first.', 'error')
    return
  }

  const message = String(promptInput.value || '').trim()
  if (!message) {
    setChatFeedback('Enter a prompt first.', 'error')
    return
  }

  const accessToken = authState.session.access_token
  if (!accessToken) {
    setChatFeedback('This session is missing its access token. Sign in again.', 'error')
    return
  }

  const previousMessages = [...messages]
  const optimisticTimestamp = new Date().toISOString()

  messages = [
    ...messages,
    {
      id: `local-user-${crypto.randomUUID()}`,
      role: 'user',
      content: message,
      created_at: optimisticTimestamp,
      pending: true,
    },
    {
      id: `local-assistant-${crypto.randomUUID()}`,
      role: 'assistant',
      content: 'RoachClaw is thinking…',
      created_at: optimisticTimestamp,
      pending: true,
    },
  ]
  renderMessages()

  promptInput.value = ''
  setChatBusyState(true)
  setChatFeedback('Sending through the hosted lane…')

  try {
    const response = await fetch(authState.config?.webChat?.endpoint || '/.netlify/functions/roachclaw-chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        threadId: activeThreadId,
        message,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok || payload?.ok !== true) {
      throw new Error(payload?.message || 'RoachClaw could not finish the request.')
    }

    activeThreadId = payload.thread?.id || activeThreadId
    setChatFeedback(`Reply from ${payload.provider || 'hosted lane'} · ${payload.model || 'model'}`, 'live')
    await loadThreads(activeThreadId)
  } catch (error) {
    messages = previousMessages
    renderMessages()
    promptInput.value = message
    setChatFeedback(error instanceof Error ? error.message : 'RoachClaw could not finish the request.', 'error')
  } finally {
    setChatBusyState(false)
  }
}

function resetForSignedOutState() {
  threads = []
  activeThreadId = null
  messages = []
  renderThreadList()
  renderMessages()
}

async function initialize() {
  authState = await getSiteAuthState()
  renderAuth()

  if (authState?.enabled && authState?.client) {
    const { data } = authState.client.auth.onAuthStateChange(async (_event, session) => {
      authState = {
        ...authState,
        session,
      }
      renderAuth()

      if (session?.user) {
        await loadThreads(activeThreadId)
      } else {
        resetForSignedOutState()
      }
    })
    authSubscription = data.subscription
  }

  if (authState?.session?.user) {
    await loadThreads()
  } else {
    resetForSignedOutState()
  }
}

authForm.addEventListener('submit', handleAuthSubmit)
signOutButton.addEventListener('click', handleSignOut)
newChatButton.addEventListener('click', () => {
  activeThreadId = null
  messages = []
  renderThreadList()
  renderMessages()
  setChatFeedback('Fresh thread ready.', 'muted')
  promptInput.focus()
})
composer.addEventListener('submit', handleSend)
promptInput.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    composer.requestSubmit()
  }
})

window.addEventListener('beforeunload', () => {
  authSubscription?.unsubscribe?.()
})

await initialize()
