const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

function ensurePointerLight() {
  if (reduceMotion.matches || document.querySelector('.rn-cursor-light')) {
    return
  }

  const light = document.createElement('div')
  light.className = 'rn-cursor-light'
  light.setAttribute('aria-hidden', 'true')
  document.body.appendChild(light)
}

function initSkipLink() {
  if (document.querySelector('.rn-skip-link')) {
    return
  }

  const target = document.querySelector('main[id], main, [role="main"]')
  if (!target) {
    return
  }

  if (!target.id) {
    target.id = 'main'
  }

  const link = document.createElement('a')
  link.className = 'rn-skip-link'
  link.href = `#${target.id}`
  link.textContent = 'Skip the chrome'
  document.body.prepend(link)
}

function initReadingProgress() {
  if (document.body?.dataset.page === 'landing' || document.querySelector('.rn-scroll-meter')) {
    return
  }

  const meter = document.createElement('div')
  meter.className = 'rn-scroll-meter'
  meter.setAttribute('aria-hidden', 'true')
  document.body.appendChild(meter)

  const sync = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollable))
    meter.style.setProperty('--rn-scroll-progress', `${(progress * 100).toFixed(2)}%`)
  }

  sync()
  window.addEventListener('scroll', sync, { passive: true })
  window.addEventListener('resize', sync, { passive: true })
}

function initDitherField() {
  if (document.body?.dataset.page === 'landing') {
    return
  }

  if (document.querySelector('.rn-dither-field')) {
    return
  }

  const shell = document.createElement('div')
  shell.className = 'rn-dither-field'
  shell.setAttribute('aria-hidden', 'true')

  const canvas = document.createElement('canvas')
  shell.appendChild(canvas)
  document.body.prepend(shell)

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) {
    shell.remove()
    return
  }

  const bayer = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ].map((row) => row.map((value) => value / 16))

  let width = 0
  let height = 0
  let cols = 0
  let rows = 0
  let pointerX = 0.5
  let pointerY = 0.24
  let frame = 0
  let start = performance.now()
  let lastDraw = 0

  function resize() {
    width = window.innerWidth || 1
    height = window.innerHeight || 1
    const scale = width < 720 ? 8 : 6
    cols = Math.max(1, Math.ceil(width / scale))
    rows = Math.max(1, Math.ceil(height / scale))
    canvas.width = cols
    canvas.height = rows
  }

  function draw(now = performance.now()) {
    if (!reduceMotion.matches && lastDraw && now - lastDraw < 42) {
      frame = window.requestAnimationFrame(draw)
      return
    }

    lastDraw = now
    const time = reduceMotion.matches ? 0 : (now - start) / 1000
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const scroll = Math.min(1, Math.max(0, window.scrollY / scrollable))
    const cx = pointerX * 0.62 + 0.19
    const cy = pointerY * 0.48 + 0.15
    const image = ctx.createImageData(cols, rows)
    const data = image.data

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const px = x / cols
        const py = y / rows
        const dx = px - cx
        const dy = py - cy
        const radius = Math.sqrt(dx * dx + dy * dy)
        const tunnel = Math.sin(radius * 46 - time * 2.8 + scroll * 10)
        const drift = Math.sin(px * 16 + py * 7 + time * 0.75 + scroll * 5)
        const contour = Math.cos((px - py) * 20 - time * 0.55)
        const lattice = Math.sin((px + pointerX * 0.4) * 34) * Math.cos((py - pointerY * 0.22) * 26)
        const signal = tunnel * 0.34 + drift * 0.28 + contour * 0.18 + lattice * 0.2
        const vignette = Math.max(0, 1 - radius * 1.7)
        const threshold = bayer[y % 4][x % 4] - 0.36 + vignette * 0.18
        const lit = signal > threshold ? 1 : 0
        const idx = (y * cols + x) * 4
        const blue = 34 + Math.round(vignette * 38)
        const green = 32 + Math.round(vignette * 92)
        const purple = 46 + Math.round((1 - Math.min(radius, 1)) * 42)
        const alpha = lit ? 42 + Math.round(vignette * 58) : 4 + Math.round(vignette * 14)

        data[idx] = lit ? purple : 6
        data[idx + 1] = lit ? green : 8
        data[idx + 2] = lit ? blue : 14
        data[idx + 3] = alpha
      }
    }

    ctx.putImageData(image, 0, 0)
    shell.style.transform = `translate3d(0, ${(-scroll * 34).toFixed(2)}px, 0) scale(1.06)`

    if (!reduceMotion.matches) {
      frame = window.requestAnimationFrame(draw)
    }
  }

  window.addEventListener('resize', () => {
    resize()
    if (reduceMotion.matches) {
      draw()
    }
  })

  window.addEventListener(
    'pointermove',
    (event) => {
      pointerX = Math.max(0, Math.min(1, event.clientX / Math.max(1, width)))
      pointerY = Math.max(0, Math.min(1, event.clientY / Math.max(1, height)))
    },
    { passive: true }
  )

  resize()
  draw()

  reduceMotion.addEventListener?.('change', () => {
    if (frame) {
      window.cancelAnimationFrame(frame)
      frame = 0
    }
    start = performance.now()
    draw()
  })
}

function initSharedMicrointeractions() {
  if (reduceMotion.matches) {
    return
  }

  ensurePointerLight()

  const magneticSelector = [
    '.cta',
    '.rn-btn',
    '.rn-nav-link',
    '.rn-nav-primary',
    '.rn-nav-ghost',
    '.site-action-pill',
    '.site-nav a',
    '.apps-card',
    '.apps-card__install',
    '.apps-card__more',
    '.apps-store-sidebar__quick a',
    '.api-docs-group',
    '.api-route-card',
    '.sitemap-card',
    '.sitemap-card a',
    '.rc-sidebar__link',
    '.rc-starter-card',
    '.account-panel',
    '.account-mini-card',
  ].join(', ')

  let pointerX = window.innerWidth * 0.5
  let pointerY = window.innerHeight * 0.2
  let frame = 0

  const syncPointer = () => {
    frame = 0
    document.documentElement.style.setProperty('--rn-pointer-x', `${pointerX.toFixed(1)}px`)
    document.documentElement.style.setProperty('--rn-pointer-y', `${pointerY.toFixed(1)}px`)
  }

  document.addEventListener(
    'pointermove',
    (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
      document.body.classList.add('is-pointer-live')

      if (!frame) {
        frame = window.requestAnimationFrame(syncPointer)
      }

      const target = event.target?.closest?.(magneticSelector)
      if (!target) {
        return
      }

      const rect = target.getBoundingClientRect()
      const localX = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1
      const localY = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1
      const large = target.matches('.api-route-card, .apps-card, .sitemap-card, .account-panel, .rc-starter-card')
      const strength = large ? 4 : 7

      target.style.setProperty('--rn-magnet-x', `${(localX * strength).toFixed(2)}px`)
      target.style.setProperty('--rn-magnet-y', `${(localY * strength * 0.62).toFixed(2)}px`)
      target.style.setProperty('--rn-hover-x', `${(((localX + 1) / 2) * 100).toFixed(2)}%`)
      target.style.setProperty('--rn-hover-y', `${(((localY + 1) / 2) * 100).toFixed(2)}%`)
    },
    { passive: true }
  )

  document.addEventListener(
    'pointerout',
    (event) => {
      const target = event.target?.closest?.(magneticSelector)
      if (!target || target.contains(event.relatedTarget)) {
        return
      }

      target.style.setProperty('--rn-magnet-x', '0px')
      target.style.setProperty('--rn-magnet-y', '0px')
    },
    { passive: true }
  )

  document.addEventListener('pointerdown', (event) => {
    const target = event.target?.closest?.(magneticSelector)
    if (!target) {
      return
    }

    target.classList.add('is-pressing')
    window.setTimeout(() => target.classList.remove('is-pressing'), 180)
  })
}

function initActiveSectionNav() {
  const pageAnchors = [...document.querySelectorAll('.site-nav a[href^="#"], .rn-nav-link[href^="#"]')]
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1)
      return id ? { link, section: document.getElementById(id) } : null
    })
    .filter((item) => item?.section)

  if (!('IntersectionObserver' in window) || !pageAnchors.length) {
    return
  }

  const navObserver = new IntersectionObserver(
    (entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

      if (!active) {
        return
      }

      pageAnchors.forEach(({ link, section }) => {
        link.classList.toggle('is-current', section === active.target)
      })
    },
    { threshold: [0.18, 0.34, 0.5], rootMargin: '-22% 0px -58% 0px' }
  )

  pageAnchors.forEach(({ section }) => navObserver.observe(section))
}

function initChromeScrollState() {
  const chrome = [
    ...document.querySelectorAll('.site-header, .api-docs-topbar, .apps-store-topbar, .rc-main__topbar'),
  ]

  if (!chrome.length) {
    return
  }

  const sync = () => {
    const scrolled = window.scrollY > 12
    chrome.forEach((element) => {
      element.classList.toggle('is-scrolled', scrolled)
    })
  }

  sync()
  window.addEventListener('scroll', sync, { passive: true })
}

function initRevealObserver() {
  const revealTargets = [...document.querySelectorAll('[data-reveal]')].filter(
    (target) => !target.classList.contains('is-visible') && !target.classList.contains('is-revealed')
  )

  if (!revealTargets.length) {
    return
  }

  if (window.location.hash) {
    const anchored = document.querySelector(window.location.hash)
    if (anchored) {
      anchored.classList.add('is-visible', 'is-revealed')
      anchored.querySelectorAll('[data-reveal]').forEach((target) => {
        target.classList.add('is-visible', 'is-revealed')
      })
    }
  }

  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => {
      target.classList.add('is-visible', 'is-revealed')
    })
    return
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        entry.target.classList.add('is-visible', 'is-revealed')
        revealObserver.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -42px 0px' }
  )

  revealTargets.forEach((target) => revealObserver.observe(target))
}

initDitherField()
initSkipLink()
initReadingProgress()
initSharedMicrointeractions()
initActiveSectionNav()
initChromeScrollState()
initRevealObserver()
