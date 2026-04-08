const allowedOrigins = new Set([
  'https://accounts.roachnet.org',
  'https://roachnet.org',
  'http://localhost:8888',
  'http://localhost:3000',
  'http://127.0.0.1:8888',
  'http://127.0.0.1:3000',
])

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

  return 'https://accounts.roachnet.org'
}

function withCors(request, response) {
  const headers = new Headers(response.headers)
  headers.set('access-control-allow-origin', normalizeOrigin(request))
  headers.set('access-control-allow-methods', 'POST, OPTIONS')
  headers.set('access-control-allow-headers', 'content-type')
  headers.set('vary', 'origin')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function verifyTurnstile({ secret, token, remoteip }) {
  const body = new URLSearchParams({
    secret,
    response: token,
  })

  if (remoteip) {
    body.set('remoteip', remoteip)
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    return { success: false, message: 'Captcha verification did not finish cleanly.' }
  }

  const result = await response.json()
  return {
    success: result.success === true,
    message: result.success === true ? '' : 'Captcha verification failed.',
  }
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return withCors(request, json({ ok: true }))
  }

  if (request.method !== 'POST') {
    return withCors(request, json({ ok: false, message: 'Use POST for account creation.' }, 405))
  }

  const supabaseUrl = process.env.ROACHNET_SUPABASE_URL
  const serviceRoleKey = process.env.ROACHNET_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return withCors(
      request,
      json(
        {
          ok: false,
          message: 'The account lane is missing its secure auth configuration.',
        },
        503
      )
    )
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return withCors(request, json({ ok: false, message: 'Send valid JSON.' }, 400))
  }

  const email = String(payload?.email || '').trim().toLowerCase()
  const password = String(payload?.password || '')
  const displayName = String(payload?.displayName || '').trim()
  const honeypot = String(payload?.company || '').trim()
  const captchaToken = String(payload?.captchaToken || '').trim()
  const startedAt = Number(payload?.startedAt || 0)

  if (honeypot) {
    return withCors(request, json({ ok: false, message: 'Request rejected.' }, 400))
  }

  if (!validateEmail(email)) {
    return withCors(request, json({ ok: false, message: 'Enter a real email address.' }, 400))
  }

  if (password.length < 10) {
    return withCors(
      request,
      json({ ok: false, message: 'Use a password with at least 10 characters.' }, 400)
    )
  }

  if (displayName.length > 60) {
    return withCors(
      request,
      json({ ok: false, message: 'Keep the display name under 60 characters.' }, 400)
    )
  }

  if (startedAt && Date.now() - startedAt < 900) {
    return withCors(
      request,
      json({ ok: false, message: 'Hold for a second and try again.' }, 429)
    )
  }

  const turnstileSecret = process.env.ROACHNET_TURNSTILE_SECRET_KEY || ''
  if (turnstileSecret) {
    if (!captchaToken) {
      return withCors(
        request,
        json({ ok: false, code: 'captcha_required', message: 'Finish the human check first.' }, 400)
      )
    }

    const remoteip =
      request.headers.get('x-nf-client-connection-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      ''

    const captcha = await verifyTurnstile({
      secret: turnstileSecret,
      token: captchaToken,
      remoteip,
    })

    if (!captcha.success) {
      return withCors(
        request,
        json({ ok: false, code: 'captcha_failed', message: captcha.message }, 403)
      )
    }
  }

  const createResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName || email.split('@')[0],
      },
    }),
  })

  const responseBody = await createResponse.json().catch(() => ({}))

  if (!createResponse.ok) {
    const message = String(responseBody?.msg || responseBody?.message || responseBody?.error || '')
    const lowered = message.toLowerCase()

    if (lowered.includes('already been registered') || lowered.includes('already registered')) {
      return withCors(
        request,
        json({ ok: false, code: 'user_exists', message: 'That email already has a RoachNet account. Sign in instead.' }, 409)
      )
    }

    return withCors(
      request,
      json(
        {
          ok: false,
          message: message || 'Account creation did not finish cleanly.',
        },
        createResponse.status
      )
    )
  }

  return withCors(
    request,
    json({
      ok: true,
      message: 'Account created.',
      userId: responseBody?.id || null,
    })
  )
}
