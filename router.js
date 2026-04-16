/**
 * router.js — Minimal client-side router for account ↔ roachclaw page views.
 * Reads the URL path and toggles between the two page-view containers.
 * All internal links with [data-route] are intercepted for SPA navigation.
 */

;(function () {
  const routes = {
    account: { path: '/', view: 'view-account', page: 'account', title: 'RoachNet Account' },
    roachclaw: { path: '/roachclaw', view: 'view-roachclaw', page: 'roachclaw', title: 'RoachClaw — RoachNet' },
  }

  function resolve(pathname) {
    const clean = pathname.replace(/\/+$/, '') || '/'
    if (clean === '/roachclaw' || clean.startsWith('/roachclaw/')) return routes.roachclaw
    return routes.account
  }

  function activate(route, pushState) {
    document.body.dataset.page = route.page
    document.title = route.title

    for (const r of Object.values(routes)) {
      const el = document.getElementById(r.view)
      if (!el) continue
      el.hidden = r !== route
    }

    if (pushState && window.location.pathname !== route.path) {
      window.history.pushState(null, '', route.path)
    }

    // Re-trigger reveal animations on the newly visible view
    requestAnimationFrame(() => {
      const view = document.getElementById(route.view)
      if (!view) return
      view.querySelectorAll('[data-reveal]').forEach((el, i) => {
        el.style.transitionDelay = `${i * 60}ms`
        el.classList.remove('is-revealed')
        void el.offsetWidth // force reflow
        el.classList.add('is-revealed')
      })
    })

    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Intercept clicks on [data-route] links
  document.addEventListener('click', function (e) {
    const link = e.target.closest('[data-route]')
    if (!link) return
    e.preventDefault()
    const route = routes[link.dataset.route]
    if (route) activate(route, true)
  })

  // Handle browser back/forward
  window.addEventListener('popstate', function () {
    activate(resolve(window.location.pathname), false)
  })

  // Initial load
  activate(resolve(window.location.pathname), false)

  // ── RoachClaw sidebar toggle (mobile) ──
  document.addEventListener('click', function (e) {
    const toggle = e.target.closest('#rc-sidebar-toggle')
    if (toggle) {
      const sidebar = document.querySelector('.rc-sidebar')
      const overlay = document.querySelector('.rc-sidebar-overlay')
      if (sidebar) sidebar.classList.toggle('is-open')
      if (overlay) overlay.classList.toggle('is-visible')
      return
    }
    // Close sidebar when clicking overlay
    const overlay = e.target.closest('.rc-sidebar-overlay')
    if (overlay) {
      const sidebar = document.querySelector('.rc-sidebar')
      if (sidebar) sidebar.classList.remove('is-open')
      overlay.classList.remove('is-visible')
    }
  })
})()
