const allowedOrigins = new Set([
  'https://roachnet.org',
  'https://accounts.roachnet.org',
  'http://localhost:8888',
  'http://localhost:3000',
  'http://127.0.0.1:8888',
  'http://127.0.0.1:3000',
])

const defaultSystemPrompt =
  'You are RoachClaw on the RoachNet web lane. Answer clearly, keep user data isolated to the authenticated account lane, never claim access to a local machine you cannot see, and prefer practical help over filler.'

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

function normalizeOrigin(request) {
  const origin = request.headers.get('origin') || ''
  if (allowedOrigins.has(origin)) {
    return origin
  }

  return 'https://roachnet.org'
}

function withCors(request, response) {
  const headers = new Headers(response.headers)
  headers.set('access-control-allow-origin', normalizeOrigin(request))
  headers.set('access-control-allow-methods', 'POST, OPTIONS')
  headers.set('access-control-allow-headers', 'content-type, authorization')
  headers.set('vary', 'origin')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function bearerToken(request) {
  const header = request.headers.get('authorization') || ''
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return ''
  }

  return token.trim()
}

function sanitizeMessageContent(value) {
  const text = String(value || '').trim()
  return text.slice(0, 12000)
}

function summarizePrompt(prompt) {
  const flattened = prompt.replace(/\s+/g, ' ').trim()
  if (!flattened) {
    return 'New chat'
  }

  return flattened.length > 64 ? `${flattened.slice(0, 61)}...` : flattened
}

function summarizeReply(reply) {
  const flattened = reply.replace(/\s+/g, ' ').trim()
  return flattened.length > 180 ? `${flattened.slice(0, 177)}...` : flattened
}

function toAssistantText(result) {
  const content = result?.choices?.[0]?.message?.content

  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part?.type === 'text') return part.text || ''
        return ''
      })
      .join('')
      .trim()
  }

  return ''
}

async function verifyUserSession({ supabaseUrl, publishableKey, token }) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    return { user: null, error: 'This account session is not valid anymore.' }
  }

  const user = await response.json().catch(() => null)
  if (!user?.id) {
    return { user: null, error: 'Could not resolve the signed-in user.' }
  }

  return { user, error: '' }
}

function createDatabaseClient({ supabaseUrl, apiKey, authToken }) {
  function restUrl(table, query = '') {
    const suffix = query ? `?${query}` : ''
    return `${supabaseUrl}/rest/v1/${table}${suffix}`
  }

  async function request(table, { method = 'GET', query = '', body, prefer = 'return=representation' } = {}) {
    const response = await fetch(restUrl(table, query), {
      method,
      headers: {
        'content-type': 'application/json',
        apikey: apiKey,
        authorization: `Bearer ${authToken}`,
        prefer,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      const message =
        payload?.message || payload?.hint || payload?.error || 'Database request did not finish cleanly.'
      throw new Error(message)
    }

    return payload
  }

  return { request }
}

function buildOpenAIBaseUrl(rawBase) {
  const base = String(rawBase || 'https://api.openai.com/v1/chat/completions').trim()
  if (base.endsWith('/chat/completions')) {
    return base
  }

  if (base.endsWith('/v1')) {
    return `${base}/chat/completions`
  }

  return `${base.replace(/\/$/, '')}/chat/completions`
}

async function runHostedChat({ apiKey, apiBaseUrl, model, systemPrompt, messages }) {
  const response = await fetch(buildOpenAIBaseUrl(apiBaseUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      'Hosted RoachClaw could not get a clean response from the model lane.'
    throw new Error(message)
  }

  const text = toAssistantText(payload)
  if (!text) {
    throw new Error('Hosted RoachClaw returned an empty reply.')
  }

  return {
    text,
    provider: payload?.provider || 'openai-compatible',
    model: payload?.model || model,
  }
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return withCors(request, json({ ok: true }))
  }

  if (request.method !== 'POST') {
    return withCors(request, json({ ok: false, message: 'Use POST for RoachClaw chat.' }, 405))
  }

  const supabaseUrl = process.env.ROACHNET_SUPABASE_URL || ''
  const publishableKey = process.env.ROACHNET_SUPABASE_ANON_KEY || ''
  const serviceRoleKey = process.env.ROACHNET_SUPABASE_SERVICE_ROLE_KEY || ''
  const chatEnabled = process.env.ROACHNET_WEB_CHAT_ENABLED === '1'
  const apiKey = process.env.ROACHNET_WEB_CHAT_API_KEY || ''
  const apiBaseUrl = process.env.ROACHNET_WEB_CHAT_API_BASE_URL || ''
  const model = process.env.ROACHNET_WEB_CHAT_MODEL || ''
  const systemPrompt = process.env.ROACHNET_WEB_CHAT_SYSTEM_PROMPT || defaultSystemPrompt

  if (!supabaseUrl || !publishableKey) {
    return withCors(
      request,
      json({ ok: false, message: 'The hosted lane is missing its account backend configuration.' }, 503)
    )
  }

  if (!chatEnabled || !apiKey || !model) {
    return withCors(
      request,
      json(
        {
          ok: false,
          code: 'lane_not_armed',
          message: 'Hosted RoachClaw is staged, but the model lane is not armed on this deploy yet.',
        },
        503
      )
    )
  }

  const token = bearerToken(request)
  if (!token) {
    return withCors(request, json({ ok: false, message: 'Sign in first.' }, 401))
  }

  const { user, error: sessionError } = await verifyUserSession({
    supabaseUrl,
    publishableKey,
    token,
  })

  if (!user) {
    return withCors(request, json({ ok: false, message: sessionError }, 401))
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return withCors(request, json({ ok: false, message: 'Send valid JSON.' }, 400))
  }

  const prompt = sanitizeMessageContent(payload?.message)
  const threadId = String(payload?.threadId || '').trim()

  if (!prompt) {
    return withCors(request, json({ ok: false, message: 'Enter a message first.' }, 400))
  }

  const databaseClient = createDatabaseClient({
    supabaseUrl,
    apiKey: serviceRoleKey || publishableKey,
    authToken: serviceRoleKey || token,
  })

  try {
    let thread = null

    if (threadId) {
      const query = new URLSearchParams({
        select: '*',
        id: `eq.${threadId}`,
        user_id: `eq.${user.id}`,
        limit: '1',
      })
      const rows = await databaseClient.request('chat_threads', { query: query.toString() })
      thread = rows?.[0] || null
      if (!thread) {
        return withCors(request, json({ ok: false, message: 'That chat is not yours anymore.' }, 404))
      }
    } else {
      const inserted = await databaseClient.request('chat_threads', {
        method: 'POST',
        body: {
          user_id: user.id,
          title: summarizePrompt(prompt),
          summary: null,
          lane: 'roachclaw-web',
          source: 'roachnet.org/roachclaw',
          metadata: {
            createdBy: 'web',
          },
        },
      })
      thread = inserted?.[0] || null
    }

    const userInsert = await databaseClient.request('chat_messages', {
      method: 'POST',
      body: {
        thread_id: thread.id,
        user_id: user.id,
        role: 'user',
        content: prompt,
        metadata: {
          source: 'roachnet.org/roachclaw',
        },
      },
    })

    const messageQuery = new URLSearchParams({
      select: 'role,content,created_at',
      thread_id: `eq.${thread.id}`,
      user_id: `eq.${user.id}`,
      order: 'created_at.asc',
      limit: '24',
    })
    const history = await databaseClient.request('chat_messages', { query: messageQuery.toString() })

    const reply = await runHostedChat({
      apiKey,
      apiBaseUrl,
      model,
      systemPrompt,
      messages: history.map((item) => ({
        role: item.role,
        content: item.content,
      })),
    })

    const assistantInsert = await databaseClient.request('chat_messages', {
      method: 'POST',
      body: {
        thread_id: thread.id,
        user_id: user.id,
        role: 'assistant',
        content: reply.text,
        provider: reply.provider,
        model: reply.model,
        metadata: {
          source: 'roachnet.org/roachclaw',
        },
      },
    })

    const shouldRefreshTitle =
      !thread.summary ||
      thread.title === 'New chat' ||
      thread.title === summarizePrompt(prompt)

    const updatedThreadRows = await databaseClient.request('chat_threads', {
      method: 'PATCH',
      query: new URLSearchParams({
        select: '*',
        id: `eq.${thread.id}`,
        user_id: `eq.${user.id}`,
      }).toString(),
      body: shouldRefreshTitle
        ? {
            title: summarizePrompt(prompt),
            summary: summarizeReply(reply.text),
          }
        : {
            summary: thread.summary || summarizeReply(reply.text),
          },
    })

    return withCors(
      request,
      json({
        ok: true,
        thread: updatedThreadRows?.[0] || thread,
        userMessage: userInsert?.[0] || null,
        assistantMessage: assistantInsert?.[0] || null,
        provider: reply.provider,
        model: reply.model,
      })
    )
  } catch (error) {
    return withCors(
      request,
      json(
        {
          ok: false,
          message: error instanceof Error ? error.message : 'RoachClaw could not finish the request.',
        },
        500
      )
    )
  }
}
