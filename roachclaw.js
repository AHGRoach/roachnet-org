import {
  clearCachedAuthState,
  getSiteAuthState,
  refreshSiteSession,
  sessionLabel,
} from './site-account.js'

const bridgeStorageKey = 'RoachNetRoachClawBridge'
const localProviderLabel = 'RoachBrain Web'
const localModelCandidates = [
  {
    id: 'onnx-community/gemma-3-270m-it-ONNX',
    label: 'Gemma 3 270M',
  },
  {
    id: 'onnx-community/Qwen2.5-0.5B-Instruct',
    label: 'Qwen2.5 0.5B',
  },
]
const localModelLabel = localModelCandidates[0].label

const authTitle = document.querySelector('#roachclaw-auth-title')
const authBody = document.querySelector('#roachclaw-auth-body')
const authBadge = document.querySelector('#roachclaw-auth-badge')
const authForm = document.querySelector('#roachclaw-auth-form')
const authSubmit = document.querySelector('#roachclaw-auth-submit')
const signOutButton = document.querySelector('#roachclaw-signout')
const authNote = document.querySelector('#roachclaw-auth-note')
const authFeedback = document.querySelector('#roachclaw-auth-feedback')
const bridgeTitle = document.querySelector('#roachclaw-bridge-title')
const bridgeBody = document.querySelector('#roachclaw-bridge-body')
const bridgeBadge = document.querySelector('#roachclaw-bridge-badge')
const bridgeForm = document.querySelector('#roachclaw-bridge-form')
const bridgeUrlInput = document.querySelector('#roachclaw-bridge-url')
const bridgeTokenInput = document.querySelector('#roachclaw-bridge-token')
const bridgeLabelInput = document.querySelector('#roachclaw-bridge-label')
const bridgeSubmit = document.querySelector('#roachclaw-bridge-submit')
const bridgeClear = document.querySelector('#roachclaw-bridge-clear')
const bridgeFeedback = document.querySelector('#roachclaw-bridge-feedback')
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
let bridgeBusy = false
let bridgeState = loadBridgeState()
let localGeneratorPromise = null

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

function setBridgeFeedback(message, tone = 'muted') {
  bridgeFeedback.textContent = message || ''
  bridgeFeedback.dataset.tone = tone
}

function setChatFeedback(message, tone = 'muted') {
  chatFeedback.textContent = message || ''
  chatFeedback.dataset.tone = tone
}

function summarizePrompt(value) {
  const flattened = String(value || '').replace(/\s+/g, ' ').trim()
  if (!flattened) return 'New chat'
  return flattened.length > 64 ? `${flattened.slice(0, 61)}...` : flattened
}

function summarizeReply(value) {
  const flattened = String(value || '').replace(/\s+/g, ' ').trim()
  return flattened.length > 180 ? `${flattened.slice(0, 177)}...` : flattened
}

function normalizeBridgeUrl(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return ''
    }
    url.pathname = ''
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return ''
  }
}

function loadBridgeState() {
  try {
    const raw = window.localStorage.getItem(bridgeStorageKey)
    if (!raw) {
      return { url: '', token: '', label: '' }
    }

    const parsed = JSON.parse(raw)
    return {
      url: normalizeBridgeUrl(parsed?.url),
      token: String(parsed?.token || '').trim(),
      label: String(parsed?.label || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120),
    }
  } catch {
    return { url: '', token: '', label: '' }
  }
}

function saveBridgeState(nextState) {
  bridgeState = {
    url: normalizeBridgeUrl(nextState?.url),
    token: String(nextState?.token || '').trim(),
    label: String(nextState?.label || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120),
  }

  if (!bridgeState.url || !bridgeState.token) {
    window.localStorage.removeItem(bridgeStorageKey)
    bridgeState = { url: '', token: '', label: '' }
    return
  }

  window.localStorage.setItem(bridgeStorageKey, JSON.stringify(bridgeState))
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

function setBridgeBusyState(isBusy) {
  bridgeBusy = isBusy
  bridgeUrlInput.disabled = isBusy
  bridgeTokenInput.disabled = isBusy
  bridgeLabelInput.disabled = isBusy
  bridgeSubmit.disabled = isBusy
  bridgeClear.disabled = isBusy
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
    workspaceTitle.textContent = 'Hosted RoachClaw needs account auth first.'
    workspaceBody.textContent = authState?.reason || 'Accounts are not armed on this deploy yet.'
    return
  }

  if (!authState?.session?.user) {
    workspaceTitle.textContent = 'Sign in to open your own chat history.'
    workspaceBody.textContent =
      'RoachClaw on the web keeps chat tied to your account instead of anonymous browser state.'
    return
  }

  if (!bridgeState.url || !bridgeState.token) {
    workspaceTitle.textContent = 'Works in the browser. Better with your Mac behind it.'
    workspaceBody.textContent =
      'No paired device? RoachBrain Cloud keeps chat alive from your account. Pair a RoachClaw device later when you want your own hardware to take over.'
    return
  }

  workspaceTitle.textContent = 'Start a fresh RoachClaw thread.'
  workspaceBody.textContent =
    'New prompts stay tied to your own account history while the actual model work stays on your RoachNet device.'
}

function renderStatusTiles() {
  if (!authState) return

  const accountTile = statusAccount?.closest('.roachclaw-status-tile')
  const providerTile = statusProvider?.closest('.roachclaw-status-tile')
  const modelTile = statusModel?.closest('.roachclaw-status-tile')
  const signedIn = Boolean(authState.session?.user)
  const paired = Boolean(bridgeState.url && bridgeState.token)

  if (accountTile) accountTile.dataset.state = signedIn ? 'live' : authState.enabled ? 'ready' : 'disabled'
  if (providerTile) providerTile.dataset.state = paired ? 'live' : 'ready'
  if (modelTile) modelTile.dataset.state = activeThread()?.model ? 'live' : paired ? 'ready' : 'pending'

  statusAccount.textContent = signedIn ? sessionLabel(authState.session) : 'Sign in required'
  statusProvider.textContent = paired ? bridgeState.label || 'Your device' : 'RoachBrain Cloud'
  statusModel.textContent =
    activeThread()?.model || (paired ? 'Paired model ready' : authState.config?.webChat?.modelLabel || 'Cloud model ready')
}

function renderBridgeState() {
  const paired = Boolean(bridgeState.url && bridgeState.token)

  bridgeUrlInput.value = bridgeState.url
  bridgeTokenInput.value = bridgeState.token
  bridgeLabelInput.value = bridgeState.label

  if (!authState?.enabled) {
    bridgeTitle.textContent = 'Account auth is still required.'
    bridgeBody.textContent =
      'The browser needs account auth for thread ownership before it can pair a RoachClaw device.'
    bridgeBadge.textContent = 'Waiting'
    bridgeBadge.dataset.state = 'disabled'
    setBridgeFeedback('')
    setBridgeBusyState(true)
    return
  }

  bridgeTitle.textContent = paired
    ? `Paired to ${bridgeState.label || 'your RoachClaw device'}.`
    : 'Optional: pair your own RoachClaw device.'
  bridgeBody.textContent = paired
    ? 'This browser will use your stored bridge token to send prompts to your own RoachNet hardware. The site does not rent a model for you.'
    : 'Paste a RoachTail or companion bridge URL plus a device token when you want this page to hand prompts to your own RoachNet hardware. Leave it blank and RoachBrain Cloud handles the signed-in fallback.'
  bridgeBadge.textContent = paired ? 'Paired' : 'Unpaired'
  bridgeBadge.dataset.state = paired ? 'live' : 'ready'
  setBridgeBusyState(bridgeBusy)
}

function threadButtonMarkup(thread) {
  return `
    <button class="roachclaw-thread${thread.id === activeThreadId ? ' is-active' : ''}" type="button" data-thread-id="${thread.id}">
      <strong>${escapeHtml(thread.title || 'New chat')}</strong>
      <span>${escapeHtml(thread.summary || 'Account-owned RoachClaw thread.')}</span>
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
    threadList.innerHTML = '<div class="roachclaw-thread-empty">This deploy does not have accounts armed yet.</div>'
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
        <p>This page keeps chat tied to your account. It does not dump local machine state into the browser by default.</p>
        <div class="roachclaw-starter-grid">
          <button class="roachclaw-starter" data-roachclaw-starter="Summarize what RoachNet can do across desktop, iOS, and the Apps store.">
            <strong>What is RoachNet?</strong>
            <span>Good place to start.</span>
          </button>
          <button class="roachclaw-starter" data-roachclaw-starter="Help me map out a RoachTail + RoachSync device setup without exposing my public IP.">
            <strong>Set up RoachTail</strong>
            <span>Private multi-device bridge, explained.</span>
          </button>
          <button class="roachclaw-starter" data-roachclaw-starter="Give me a practical list of RoachNet Apps packs to install first for maps, medicine, and dev.">
            <strong>What should I install first?</strong>
            <span>First-run app pack suggestions.</span>
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
    authNote.textContent = 'The account system is staged, but this deploy is missing live auth keys.'
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
    authBody.textContent = `This chat is tied to ${sessionLabel(authState.session)}.`
    authBadge.textContent = 'Live'
    authBadge.dataset.state = 'live'
    authNote.textContent = 'Only this account can read or extend the threads shown here.'
    emailInput.value = authState.session.user.email || ''
    passwordInput.value = '************'
    signOutButton.hidden = false
    setAuthFeedback('Account session is live.', 'live')
  } else {
    authTitle.textContent = 'Sign in to use hosted RoachClaw.'
    authBody.textContent =
      'The browser uses your RoachNet account for thread ownership and secure history.'
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
  renderBridgeState()
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
    .select('id,title,summary,last_message_at,created_at,metadata')
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

async function ensureThreadForPrompt(message) {
  if (!authState?.client || !authState?.session?.user) {
    throw new Error('Sign in first.')
  }

  const current = activeThread()
  if (current?.id) {
    return current
  }

  const metadata = bridgeState.url
    ? {
        relay: {
          kind: 'local-device',
          bridgeUrl: bridgeState.url,
          label: bridgeState.label || null,
        },
      }
    : {
        relay: {
          kind: 'browser-local',
        },
      }

  const { data, error } = await authState.client
    .from('chat_threads')
    .insert({
      user_id: authState.session.user.id,
      title: summarizePrompt(message),
      summary: null,
      lane: 'roachclaw-web',
      source: 'roachnet.org/roachclaw',
      metadata,
    })
    .select('id,title,summary,last_message_at,created_at,metadata')
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Could not create a RoachClaw thread.')
  }

  threads = [data, ...threads]
  activeThreadId = data.id
  renderThreadList()
  return data
}

async function persistLocalMessages({ threadId, userMessage, assistantMessage, assistantModelLabel }) {
  if (!authState?.client || !authState?.session?.user) {
    throw new Error('Sign in first.')
  }

  const userInsert = await authState.client
    .from('chat_messages')
    .insert({
      thread_id: threadId,
      user_id: authState.session.user.id,
      role: 'user',
      content: userMessage,
      metadata: {
        source: 'roachnet.org/roachclaw',
        relay: {
          kind: 'browser-local',
        },
      },
    })
    .select('id')
    .single()

  if (userInsert.error) {
    throw new Error(userInsert.error.message || 'Could not save your prompt.')
  }

  const assistantInsert = await authState.client
    .from('chat_messages')
    .insert({
      thread_id: threadId,
      user_id: authState.session.user.id,
      role: 'assistant',
      content: assistantMessage,
      provider: localProviderLabel,
      model: assistantModelLabel || localModelLabel,
      metadata: {
        source: 'roachnet.org/roachclaw',
        relay: {
          kind: 'browser-local',
        },
      },
    })
    .select('id')
    .single()

  if (assistantInsert.error) {
    throw new Error(assistantInsert.error.message || 'Could not save the RoachBrain reply.')
  }

  const update = await authState.client
    .from('chat_threads')
    .update({
      title: summarizePrompt(userMessage),
      summary: summarizeReply(assistantMessage),
      metadata: {
        ...(activeThread()?.metadata || {}),
        relay: {
          kind: 'browser-local',
        },
      },
    })
    .eq('id', threadId)

  if (update.error) {
    throw new Error(update.error.message || 'Could not refresh the thread summary.')
  }
}

async function getLocalGenerator() {
  if (localGeneratorPromise) {
    return localGeneratorPromise
  }

  localGeneratorPromise = (async () => {
    const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1')
    env.useBrowserCache = true
    env.useWasmCache = true
    env.allowLocalModels = false

    let canUseWebGPU = false
    if (window.navigator?.gpu?.requestAdapter) {
      try {
        canUseWebGPU = Boolean(await window.navigator.gpu.requestAdapter())
      } catch {
        canUseWebGPU = false
      }
    }

    const attempts = []
    if (canUseWebGPU) {
      for (const candidate of localModelCandidates) {
        attempts.push({
          ...candidate,
          options: {
            device: 'webgpu',
            dtype: 'q4',
          },
        })
      }
    }

    for (const candidate of localModelCandidates) {
      attempts.push({
        ...candidate,
        options: {
          dtype: 'q4',
        },
      })
      attempts.push({
        ...candidate,
        options: {
          dtype: 'q8',
        },
      })
    }

    let lastError = null
    for (const attempt of attempts) {
      try {
        const generator = await pipeline('text-generation', attempt.id, attempt.options)
        return {
          generator,
          modelLabel: attempt.label,
        }
      } catch (error) {
        lastError = error
        console.warn(`RoachBrain Web model attempt failed for ${attempt.label}.`, error)
      }
    }

    throw lastError || new Error('RoachBrain Web could not load a usable browser model on this device.')
  })().catch((error) => {
    localGeneratorPromise = null
    throw error
  })

  return localGeneratorPromise
}

function extractLocalReply(result) {
  const generated = Array.isArray(result) ? result[0]?.generated_text ?? result[0] : result

  if (Array.isArray(generated)) {
    const assistant = [...generated].reverse().find((entry) => entry?.role === 'assistant' && entry?.content)
    return String(assistant?.content || '').trim()
  }

  if (typeof generated === 'string') {
    return generated.trim()
  }

  return ''
}

async function runBrowserLocalChat(message, history) {
  setChatFeedback('Loading RoachBrain Web…', 'muted')
  const { generator, modelLabel } = await getLocalGenerator()

  const conversation = [
    {
      role: 'system',
      content:
        'You are RoachClaw on the RoachNet web chat page. Keep replies practical, concise, and honest about what you cannot see. Never claim access to local files or devices unless the user explicitly paired a device bridge.',
    },
    ...history
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => ({
        role: entry.role === 'assistant' ? 'assistant' : 'user',
        content: String(entry.content || '').trim(),
      }))
      .filter((entry) => entry.content.length > 0)
      .slice(-10),
    { role: 'user', content: message },
  ]

  setChatFeedback('Running RoachBrain Web in this browser…', 'muted')

  const result = await generator(conversation, {
    max_new_tokens: 96,
    do_sample: false,
    repetition_penalty: 1.04,
  })

  const reply = extractLocalReply(result)
  if (!reply) {
    throw new Error('RoachBrain Web did not return a usable reply.')
  }

  return {
    reply,
    modelLabel,
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

async function handleBridgeSubmit(event) {
  event.preventDefault()

  if (!authState?.enabled) {
    setBridgeFeedback('Sign in first so the bridge has an account to attach to.', 'error')
    return
  }

  const url = normalizeBridgeUrl(bridgeUrlInput.value)
  const token = String(bridgeTokenInput.value || '').trim()
  const label = String(bridgeLabelInput.value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)

  if (!url || !token) {
    setBridgeFeedback('Enter a bridge URL and token first.', 'error')
    return
  }

  setBridgeBusyState(true)
  setBridgeFeedback('Checking your RoachClaw bridge…')

  try {
    const response = await fetch(`${url}/health`, {
      headers: {
        accept: 'application/json',
      },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || payload?.status !== 'ok') {
      throw new Error('That bridge did not answer cleanly.')
    }

    saveBridgeState({ url, token, label })
    setBridgeFeedback('Bridge paired in this browser.', 'live')
    renderBridgeState()
    syncComposerState()
    renderStatusTiles()
    renderWorkspaceSummary()
  } catch (error) {
    setBridgeFeedback(error instanceof Error ? error.message : 'That bridge did not answer cleanly.', 'error')
  } finally {
    setBridgeBusyState(false)
  }
}

function handleBridgeClear() {
  saveBridgeState({ url: '', token: '', label: '' })
  setBridgeFeedback('Bridge cleared from this browser.', 'muted')
  renderBridgeState()
  syncComposerState()
  renderStatusTiles()
  renderWorkspaceSummary()
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
  setChatFeedback(bridgeState.url ? 'Sending through your RoachClaw device…' : 'Sending through RoachBrain Cloud…')

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
        bridgeUrl: bridgeState.url,
        bridgeToken: bridgeState.token,
        bridgeLabel: bridgeState.label,
      }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok || payload?.ok !== true) {
      if (!bridgeState.url) {
        // Browser fallback stays available if the account-scoped cloud lane is unavailable.
        const thread = await ensureThreadForPrompt(message)
        const { reply, modelLabel } = await runBrowserLocalChat(message, previousMessages)
        await persistLocalMessages({
          threadId: thread.id,
          userMessage: message,
          assistantMessage: reply,
          assistantModelLabel: modelLabel,
        })
        setChatFeedback(`Reply from ${localProviderLabel} · ${modelLabel}`, 'live')
        await loadThreads(thread.id)
        return
      }

      throw new Error(payload?.message || 'RoachClaw could not finish the request.')
    }

    activeThreadId = payload.thread?.id || activeThreadId
    setChatFeedback(
      `Reply from ${payload.provider || (bridgeState.url ? 'RoachClaw local relay' : 'RoachBrain Cloud')} · ${payload.model || localModelLabel}`,
      'live'
    )
    await loadThreads(activeThreadId)
  } catch (error) {
    if (!bridgeState.url && /RoachBrain Cloud/i.test(String(error instanceof Error ? error.message : ''))) {
      const thread = await ensureThreadForPrompt(message)
      const { reply, modelLabel } = await runBrowserLocalChat(message, previousMessages)
      await persistLocalMessages({
        threadId: thread.id,
        userMessage: message,
        assistantMessage: reply,
        assistantModelLabel: modelLabel,
      })
      setChatFeedback(`Reply from ${localProviderLabel} · ${modelLabel}`, 'live')
      await loadThreads(thread.id)
    } else {
      messages = previousMessages
      renderMessages()
      promptInput.value = message
      setChatFeedback(error instanceof Error ? error.message : 'RoachClaw could not finish the request.', 'error')
    }
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
bridgeForm.addEventListener('submit', handleBridgeSubmit)
bridgeClear.addEventListener('click', handleBridgeClear)
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
