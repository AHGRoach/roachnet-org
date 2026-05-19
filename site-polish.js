const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

function initInputModality() {
  document.addEventListener(
    'keydown',
    (event) => {
      const keyboardIntentKeys = ['Tab', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'Home', 'End']
      if (keyboardIntentKeys.includes(event.key)) {
        document.body.classList.add('is-keyboard-user')
      }
    },
    true
  )

  document.addEventListener(
    'pointerdown',
    () => {
      document.body.classList.remove('is-keyboard-user')
    },
    true
  )
}

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

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
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
  let smoothX = 0.5
  let smoothY = 0.24
  let frame = 0
  let start = performance.now()
  let lastDraw = 0
  let needsDraw = true

  function resize() {
    width = window.innerWidth || 1
    height = window.innerHeight || 1
    const scale = width < 720 ? 10 : width > 1440 ? 7 : 6
    cols = Math.max(1, Math.ceil(width / scale))
    rows = Math.max(1, Math.ceil(height / scale))
    canvas.width = cols
    canvas.height = rows
    needsDraw = true
  }

  function draw(now = performance.now()) {
    if (document.visibilityState === 'hidden') {
      frame = window.requestAnimationFrame(draw)
      return
    }

    if (!reduceMotion.matches && lastDraw && now - lastDraw < 50) {
      frame = window.requestAnimationFrame(draw)
      return
    }

    lastDraw = now
    const time = reduceMotion.matches ? 0 : (now - start) / 1000
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const scroll = Math.min(1, Math.max(0, window.scrollY / scrollable))
    smoothX += (pointerX - smoothX) * 0.08
    smoothY += (pointerY - smoothY) * 0.08

    const cx = smoothX * 0.62 + 0.19
    const cy = smoothY * 0.48 + 0.15
    const scrollParallax = scroll * 0.18
    const image = ctx.createImageData(cols, rows)
    const data = image.data

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const px = x / cols
        const py = y / rows
        const dx = px - cx
        const dy = py - cy + scrollParallax
        const radius = Math.sqrt(dx * dx + dy * dy)
        const horizon = Math.max(0, 1 - Math.abs(py - 0.34 - scroll * 0.08) * 2.2)
        const tunnel = Math.sin(radius * 48 - time * 2.3 + scroll * 11)
        const drift = Math.sin(px * 14 + py * 8 + time * 0.62 + scroll * 5)
        const contour = Math.cos((px - py) * 22 - time * 0.48 + scroll * 2)
        const lattice = Math.sin((px + smoothX * 0.38) * 36) * Math.cos((py - smoothY * 0.2) * 24)
        const signal = tunnel * 0.3 + drift * 0.26 + contour * 0.18 + lattice * 0.2 + horizon * 0.16
        const vignette = Math.max(0, 1 - radius * 1.62)
        const threshold = bayer[y % 4][x % 4] - 0.35 + vignette * 0.16
        const lit = signal > threshold ? 1 : 0
        const idx = (y * cols + x) * 4
        const blue = 32 + Math.round((vignette + horizon) * 34)
        const green = 40 + Math.round(vignette * 98 + horizon * 42)
        const purple = 28 + Math.round((1 - Math.min(radius, 1)) * 46)
        const alpha = lit ? 38 + Math.round(vignette * 54 + horizon * 24) : 3 + Math.round(vignette * 12)

        data[idx] = lit ? purple : 6
        data[idx + 1] = lit ? green : 8
        data[idx + 2] = lit ? blue : 14
        data[idx + 3] = alpha
      }
    }

    ctx.putImageData(image, 0, 0)
    const ditherScale = window.innerWidth < 760 ? 1 : 1.06
    shell.style.transform = `translate3d(0, ${(-scroll * 34).toFixed(2)}px, 0) scale(${ditherScale})`
    needsDraw = false

    if (!reduceMotion.matches || needsDraw) {
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
      needsDraw = true
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
    needsDraw = true
    draw()
  })
}

function initNavAccessibilityState() {
  const navLinks = [...document.querySelectorAll('.site-nav a, .rn-nav-link')]
  navLinks.forEach((link) => {
    if (link.classList.contains('is-current')) {
      link.setAttribute('aria-current', 'page')
    }
  })

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.attributeName !== 'class' || !(record.target instanceof HTMLElement)) {
        return
      }

      if (!record.target.matches('.site-nav a, .rn-nav-link')) {
        return
      }

      if (record.target.classList.contains('is-current')) {
        record.target.setAttribute('aria-current', 'page')
      } else {
        record.target.removeAttribute('aria-current')
      }
    })
  })

  navLinks.forEach((link) => observer.observe(link, { attributes: true }))
}

function initScrollableNavRails() {
  const rails = [
    ...document.querySelectorAll(
      '.site-header .site-nav, .site-header__actions, .rn-nav-links, .rn-nav-cta, .api-docs-topbar__links, .apps-store-topbar__status'
    ),
  ]

  if (!rails.length) {
    return
  }

  const resizeObserver =
    'ResizeObserver' in window
      ? new ResizeObserver((entries) => {
          entries.forEach((entry) => syncRail(entry.target))
        })
      : null

  const syncRail = (rail) => {
    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth)
    const isScrollable = maxScroll > 2
    rail.classList.toggle('is-scrollable-x', isScrollable)
    rail.classList.toggle('is-scrolled-x', isScrollable && rail.scrollLeft > 4)
    rail.classList.toggle('is-at-end-x', !isScrollable || rail.scrollLeft >= maxScroll - 4)
  }

  const revealCurrent = (rail, behavior = 'auto') => {
    const current = rail.querySelector('.is-current, [aria-current="page"], [aria-pressed="true"]')
    if (!current) {
      return
    }

    current.scrollIntoView({
      behavior,
      block: 'nearest',
      inline: 'center',
    })
  }

  rails.forEach((rail) => {
    let frame = 0
    const schedule = () => {
      if (frame) {
        return
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0
        syncRail(rail)
      })
    }

    syncRail(rail)
    window.requestAnimationFrame(() => {
      revealCurrent(rail)
      syncRail(rail)
    })

    rail.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    resizeObserver?.observe(rail)

    rail.addEventListener(
      'wheel',
      (event) => {
        const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth)
        if (maxScroll <= 2 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
          return
        }

        event.preventDefault()
        rail.scrollBy({
          left: event.deltaY,
          behavior: reduceMotion.matches ? 'auto' : 'smooth',
        })
      },
      { passive: false }
    )

    rail.addEventListener('keydown', (event) => {
      const step = Math.max(120, rail.clientWidth * 0.55)
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        rail.scrollBy({ left: step, behavior: reduceMotion.matches ? 'auto' : 'smooth' })
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        rail.scrollBy({ left: -step, behavior: reduceMotion.matches ? 'auto' : 'smooth' })
      } else if (event.key === 'Home') {
        event.preventDefault()
        rail.scrollTo({ left: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' })
      } else if (event.key === 'End') {
        event.preventDefault()
        rail.scrollTo({ left: rail.scrollWidth, behavior: reduceMotion.matches ? 'auto' : 'smooth' })
      }
    })

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(() => {
        revealCurrent(rail, reduceMotion.matches ? 'auto' : 'smooth')
        syncRail(rail)
      })
    })

    observer.observe(rail, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'aria-current', 'aria-pressed'],
    })
  })
}

function initLocalAnchorNavigation() {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }

    const link = event.target?.closest?.('a[href*="#"]')
    if (!link) {
      return
    }

    const href = link.getAttribute('href') || ''
    if (!href || href === '#') {
      return
    }

    let url
    try {
      url = new URL(href, window.location.href)
    } catch (_) {
      return
    }

    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) {
      return
    }

    const id = decodeURIComponent(url.hash.slice(1))
    const target = id ? document.getElementById(id) : null
    if (!target) {
      return
    }

    event.preventDefault()
    target.scrollIntoView({
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
      block: 'start',
    })

    window.history.pushState(null, '', url.hash)
    target.classList.add('rn-anchor-target')

    const hadTabIndex = target.hasAttribute('tabindex')
    if (!hadTabIndex) {
      target.setAttribute('tabindex', '-1')
    }

    window.setTimeout(
      () => {
        target.focus({ preventScroll: true })
        target.classList.remove('rn-anchor-target')
        if (!hadTabIndex) {
          target.removeAttribute('tabindex')
        }
      },
      reduceMotion.matches ? 0 : 320
    )
  })
}

function initMediaLoadStates() {
  const images = [...document.querySelectorAll('.screen-frame__image, .app-screen-shot img')]
  if (!images.length) {
    return
  }

  document.body.classList.add('is-polish-ready')

  const markLoaded = (image) => {
    image.classList.add('is-media-loaded')
    image.closest('.screen-frame, .app-screen-shot, .surface-card__shot, .ios-shot-card')?.classList.add('is-media-loaded')
  }

  images.forEach((image) => {
    if (image.complete) {
      markLoaded(image)
      return
    }

    image.addEventListener('load', () => markLoaded(image), { once: true })
    image.addEventListener('error', () => markLoaded(image), { once: true })
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
      element.dataset.scrolled = scrolled ? 'true' : 'false'
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

initInputModality()
initDitherField()
initSkipLink()
initReadingProgress()
initSharedMicrointeractions()
initActiveSectionNav()
initChromeScrollState()
initScrollableNavRails()
initLocalAnchorNavigation()
initMediaLoadStates()
initRevealObserver()
initNavAccessibilityState()
