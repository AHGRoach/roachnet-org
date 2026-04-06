const owner = 'AHGRoach'
const repo = 'RoachNet'
const releaseVersion = '1.0.3'
const latestReleaseApi = `https://api.github.com/repos/${owner}/${repo}/releases/latest`
const latestReleasePage = `https://github.com/${owner}/${repo}/releases/latest`
const latestDownloadBase = `https://github.com/${owner}/${repo}/releases/latest/download`
const hostedDownloads = {
  mac: {
    url: `${latestDownloadBase}/RoachNet-Setup-macOS.dmg`,
    name: 'RoachNet-Setup-macOS.dmg',
    version: releaseVersion,
  },
  win: {
    url: `${latestDownloadBase}/RoachNet-Setup-windows-x64-beta.exe`,
    name: 'RoachNet-Setup-windows-x64-beta.exe',
    version: '0.0.1 beta',
  },
}

const sectionDefinitions = [
  {
    key: 'Today',
    navLabel: 'Today',
    eyebrow: 'Today in RoachNet Apps',
    title: 'A tighter install lane for the stuff you actually reach for.',
    description:
      'RoachNet Apps is the darker little App Store behind the RoachNet shell: map regions, course packs, field libraries, Wikipedia shelves, and local model lanes that install straight into the native app.',
    icon: '●',
    layout: 'today',
  },
  {
    key: 'Map Regions',
    navLabel: 'Map Regions',
    eyebrow: 'Offline atlas',
    title: 'Regional packs built around real-world use.',
    description:
      'City detail, road networks, coastlines, and small-town coverage grouped into named installs so the Maps lane feels like a real atlas, not a loose pile of tiles.',
    icon: '⌘',
    layout: 'map',
  },
  {
    key: 'Medicine',
    navLabel: 'Medicine',
    eyebrow: 'Care library',
    title: 'A stack of medical shelves that ranges from “what is this pill?” to “how do I stabilize this person?”',
    description:
      'Medicine keeps the practical stuff close: drug references, treatment steps, emergency guides, pathologies, and course-style libraries that stay on your machine.',
    icon: '+',
    layout: 'grid',
  },
  {
    key: 'Survival & Preparedness',
    navLabel: 'Survival',
    eyebrow: 'Field guides',
    title: 'Planning, gear, food, routes, and bad-weather thinking in one lane.',
    description:
      'Video series, manuals, and deep reading for people who actually think about prep, not just people who like the idea of it.',
    icon: '◆',
    layout: 'grid',
  },
  {
    key: 'Education & Reference',
    navLabel: 'Education',
    eyebrow: 'Reference shelf',
    title: 'Study packs and reference sets that make your RoachNet machine feel like a small campus.',
    description:
      'Open textbooks, course bundles, tutorials, and talk archives that turn the RoachNet vault into a proper offline study shelf.',
    icon: '✦',
    layout: 'grid',
  },
  {
    key: 'Science & Simulations',
    navLabel: 'Science',
    eyebrow: 'Lab shelf',
    title: 'Simulations, scientific Q&A, and hard-reference shelves for the curious machine.',
    description:
      'Physics, astronomy, chemistry, biology, and interactive science installs that feel like a compact lab bench inside RoachNet.',
    icon: '⌬',
    layout: 'grid',
  },
  {
    key: 'Kids & Family',
    navLabel: 'Kids',
    eyebrow: 'Family shelf',
    title: 'Youth-friendly shelves, reading packs, and shared-machine installs.',
    description:
      'Story collections, lighter encyclopedias, and family-oriented shelves that make sense on a machine other people touch too.',
    icon: '✷',
    layout: 'grid',
  },
  {
    key: 'Open Courses & Lectures',
    navLabel: 'Courses',
    eyebrow: 'Course shelf',
    title: 'Bigger study installs for people who actually use their desktop as a campus.',
    description:
      'Lecture libraries, open courses, and structured study packs that install like real apps instead of random downloads.',
    icon: '▣',
    layout: 'grid',
  },
  {
    key: 'Math & Problem Solving',
    navLabel: 'Math',
    eyebrow: 'Problem shelf',
    title: 'Proofs, worked examples, and problem-solving lanes with real depth.',
    description:
      'Math shelves for drills, intuition, advanced reference, and the kind of long-form thinking that deserves its own lane.',
    icon: 'Σ',
    layout: 'grid',
  },
  {
    key: 'Law, History & Society',
    navLabel: 'Society',
    eyebrow: 'Civic shelf',
    title: 'Law, history, philosophy, and public-life reference in one lane.',
    description:
      'Useful context for policy, institutions, philosophy, and civic life without turning the machine into a browser graveyard.',
    icon: '⌂',
    layout: 'grid',
  },
  {
    key: 'Language & Writing',
    navLabel: 'Words',
    eyebrow: 'Language shelf',
    title: 'Writing, language study, linguistics, and quote-heavy reference that stays close.',
    description:
      'Editing, reading, language learning, and language-design shelves that feel useful on a working machine.',
    icon: '✎',
    layout: 'grid',
  },
  {
    key: 'DIY & Repair',
    navLabel: 'DIY',
    eyebrow: 'Repair shelf',
    title: 'Fix guides, repair notes, and hands-on practical reference.',
    description:
      'DIY and repair installs keep workshop answers, teardown notes, and field fixes one click away inside the vault.',
    icon: '↺',
    layout: 'grid',
  },
  {
    key: 'Maker & Electronics',
    navLabel: 'Maker',
    eyebrow: 'Bench shelf',
    title: 'Boards, components, fabrication, and electronics learning with real mileage.',
    description:
      'Hardware-minded installs for people who solder, print, breadboard, repair, or just like understanding how the box actually works.',
    icon: '⌁',
    layout: 'grid',
  },
  {
    key: 'Agriculture & Food',
    navLabel: 'Agriculture',
    eyebrow: 'Grow & cook',
    title: 'Food, gardening, and self-reliance packs with practical mileage.',
    description:
      'Cooking, pantry planning, gardening, and homesteading installs that feel useful on a real machine, not just aspirational.',
    icon: '△',
    layout: 'grid',
  },
  {
    key: 'Homestead & Sustainability',
    navLabel: 'Homestead',
    eyebrow: 'Self-reliance',
    title: 'Energy, growing, repair, and practical build-it-yourself reference.',
    description:
      'Longer-lived shelves for self-reliance, field fixes, sustainability, and real-world making.',
    icon: '⌂',
    layout: 'grid',
  },
  {
    key: 'Finance & Crypto',
    navLabel: 'Finance',
    eyebrow: 'Money shelf',
    title: 'Investing, money, crypto, and finance-heavy reference that still feels practical.',
    description:
      'From basic money questions to cryptography and quant-minded reference, this lane keeps the numbers close.',
    icon: '$',
    layout: 'grid',
  },
  {
    key: 'Software Development',
    navLabel: 'Dev',
    eyebrow: 'Dev shelf',
    title: 'Coding docs, focused tutorials, and install-ready dev study packs.',
    description:
      'Good first coding shelves for the native Dev lane: language docs, framework references, and tutorials that stay available when the router starts acting weird.',
    icon: '</>',
    layout: 'grid',
  },
  {
    key: 'Machine Learning & Data Science',
    navLabel: 'ML',
    eyebrow: 'ML shelf',
    title: 'Stats, data, and model-building references that stay local.',
    description:
      'Machine learning and data-science packs that help RoachNet feel like a local lab instead of a tab farm.',
    icon: '∿',
    layout: 'grid',
  },
  {
    key: 'Platforms & Systems',
    navLabel: 'Systems',
    eyebrow: 'Systems shelf',
    title: 'OS docs, package-manager lore, and platform reference for the long machine session.',
    description:
      'Platform-specific shelves for package managers, Linux docs, SBCs, and systems work that always seems to matter at 1 AM.',
    icon: '⌘',
    layout: 'grid',
  },
  {
    key: 'Security & Privacy',
    navLabel: 'Security',
    eyebrow: 'Defense shelf',
    title: 'Privacy, defense, reverse-engineering, and security reference for the machine you actually trust.',
    description:
      'A tighter shelf for threat models, Tor, edge security, and the questions that tend to matter after midnight.',
    icon: '⛨',
    layout: 'grid',
  },
  {
    key: 'Music Production & Audio',
    navLabel: 'Audio',
    eyebrow: 'Audio craft',
    title: 'Theory, sound, and production references for actual studio sessions.',
    description:
      'Open music-theory tracks, sound-focused talk archives, and audio references that belong next to the music tools instead of somewhere in Downloads.',
    icon: '♪',
    layout: 'grid',
  },
  {
    key: 'Design & Visual Media',
    navLabel: 'Design',
    eyebrow: 'Visual craft',
    title: '3D, graphics, photography, and visual-thinking shelves that feel useful on a workstation.',
    description:
      'Design and media installs for visual reference, Blender work, production art, and the questions you only remember when you are already in the middle of the thing.',
    icon: '◩',
    layout: 'grid',
  },
  {
    key: 'IT & Infrastructure',
    navLabel: 'Infra',
    eyebrow: 'Infra shelf',
    title: 'Networking, systems, and operations references for the long session.',
    description:
      'Docs and guides for operators, builders, and anyone who still expects their machine to keep moving when hosted tooling slows down.',
    icon: '⌇',
    layout: 'grid',
  },
  {
    key: 'Travel & Field Guides',
    navLabel: 'Travel',
    eyebrow: 'Route shelf',
    title: 'City guides, region notes, and practical travel reference sized like real installs.',
    description:
      'Travel packs that stay readable offline and slot into the same vault as the maps, instead of disappearing behind a dead connection.',
    icon: '↗',
    layout: 'grid',
  },
  {
    key: 'Travel, Mobility & Outdoors',
    navLabel: 'Mobility',
    eyebrow: 'Move around',
    title: 'Travel problem-solving, route thinking, and moving-around reference.',
    description:
      'Outdoor, travel, bicycle, aviation, expat, and mobility shelves for life away from the desk.',
    icon: '⇢',
    layout: 'grid',
  },
  {
    key: 'Games, Film & Pop Culture',
    navLabel: 'Culture',
    eyebrow: 'Culture shelf',
    title: 'Film, anime, games, genre reference, and media-brain installs.',
    description:
      'A deeper pop-culture lane for fandom reference, worldbuilding, film trivia, and the weirdly useful side shelves.',
    icon: '★',
    layout: 'grid',
  },
  {
    key: 'Dictionaries & Primary Sources',
    navLabel: 'Library',
    eyebrow: 'Deep reference',
    title: 'Dictionaries, source texts, and oversized public-domain shelves for the machine that keeps everything close.',
    description:
      'Wordbooks, source libraries, and enormous public-domain archives when you want the vault to feel more like a study room than a download folder.',
    icon: '⌘K',
    layout: 'grid',
  },
  {
    key: 'Wikipedia',
    navLabel: 'Wikipedia',
    eyebrow: 'Quick reference',
    title: 'Wikipedia installs sized like real choices, not one giant commitment.',
    description:
      'Pick the small quick-reference lane or go all the way up to the full archive, depending on how much space you want to spend.',
    icon: 'W',
    layout: 'grid',
  },
  {
    key: 'Model Packs',
    navLabel: 'Models',
    eyebrow: 'RoachClaw models',
    title: 'Contained local model lanes for RoachClaw.',
    description:
      'Small starter models, bigger coding lanes, and generalist packs that RoachNet can queue straight into the contained local AI stack.',
    icon: 'AI',
    layout: 'grid',
  },
]

const sectionLookup = new Map(sectionDefinitions.map((section) => [section.key, section]))
const sectionSlugLookup = new Map(sectionDefinitions.map((section) => [slugify(section.navLabel), section.key]))

const todayFeaturedId = 'course-wikibooks_en_all_nopic'
const todayRows = [
  {
    title: 'Quick installs',
    note: 'Good first adds once the shell is in place.',
    sections: [
      'Map Regions',
      'Medicine',
      'Open Courses & Lectures',
      'Science & Simulations',
      'Software Development',
      'Agriculture & Food',
      'Model Packs',
    ],
  },
  {
    title: 'Editors’ picks',
    note: 'A mix of field packs, learning shelves, and RoachClaw lanes worth adding next.',
    sections: [
      'Math & Problem Solving',
      'Law, History & Society',
      'Security & Privacy',
      'Music Production & Audio',
      'Platforms & Systems',
      'Games, Film & Pop Culture',
      'Dictionaries & Primary Sources',
      'Wikipedia',
      'Model Packs',
    ],
  },
]

const itemCopy = {
  'course-wikibooks_en_all_nopic': {
    blurb:
      'Open textbooks for math, science, computing, languages, and more, all pulled into one clean study shelf.',
    detail: [
      'Good for brushing up on core subjects or wandering into something new at 2 AM without ending up in a maze of tabs.',
      'Wikibooks installs as its own RoachNet course app, so this lane shows up in Education as a single named library instead of a mess of separate files.',
    ],
  },
  'course-wikiversity_en_all_maxi': {
    blurb:
      'Community-built courses and tutorials that feel more like guided paths than isolated articles.',
    detail: [
      'Wikiversity is good when you want the “walk me through it” version instead of a dry reference page.',
      'It lands in Education as a distinct study lane with tutorials, course outlines, and practice-oriented material.',
    ],
  },
  'course-ted_mul_ted-ed': {
    blurb:
      'Short, tightly-produced lessons on specific ideas, from black holes to literary devices and historical weirdness.',
    detail: [
      'TED-Ed is the quick-hit study shelf: concise explainers, clean pacing, and just enough polish to keep the learning lane lively.',
      'It works well as a lightweight watch-later install inside the RoachNet vault.',
    ],
  },
  'course-openmusictheory.com_en_all': {
    blurb:
      'Harmony, notation, rhythm, and ear-training in one clean music-theory lane.',
    detail: [
      'Open Music Theory is useful for production, arranging, scoring, and the occasional “wait, what chord am I actually hearing?” moment.',
      'It installs as a real course app in the audio/education shelf instead of hiding in a generic provider bundle.',
    ],
  },
  'base-atlas': {
    blurb:
      'Shared basemap and renderer assets that every regional map install stacks on top of.',
    detail: [
      'Base Atlas is the first thing to install if you want the map lane to behave like a real offline atlas instead of a partial shelf.',
      'It provides the shared renderer and baseline assets so every regional pack opens cleanly inside RoachNet Maps.',
    ],
  },
  'map-pacific': {
    blurb:
      'A full Pacific rim atlas: West Coast city grids, mountain passes, shoreline routes, and the big empty stretches between them.',
  },
  'map-mountain': {
    blurb:
      'Mountain West coverage from ski towns and canyon roads to high-desert connectors and all the strange mileage in between.',
  },
  'map-west-south-central': {
    blurb:
      'Highways, farm roads, oilfield routes, and Gulf corridors across Arkansas, Oklahoma, Louisiana, and Texas.',
  },
  'map-east-south-central': {
    blurb:
      'Backroads, river crossings, and hill-country routes for four linked states that often share the same drives and supply chains.',
  },
  'map-south-atlantic': {
    blurb:
      'Coastal sprawl, hurricane corridors, and inland connectors running from Delaware down through Florida.',
  },
  'map-west-north-central': {
    blurb:
      'A classic flyover pack: grain routes, rail towns, river cities, and a lot of straight lines done properly.',
  },
  'map-east-north-central': {
    blurb:
      'Lake shoreline cities, industrial belts, and the connector towns that hold the middle of the region together.',
  },
  'map-mid-atlantic': {
    blurb:
      'Dense Northeast corridors, upstate routes, and the weird stuff between exits from New Jersey through Pennsylvania.',
  },
  'map-new-england': {
    blurb:
      'Coastal towns, mountain roads, and small-state border crossings from Connecticut up through northern Maine.',
  },
  'course-zimgit-medicine_en': {
    blurb:
      'Field and emergency medicine books and guides: trauma care, assessment checklists, treatment steps, and reference tables in one package.',
  },
  'course-nhs.uk_en_medicines': {
    blurb:
      'Drug monographs laid out clearly: what each medicine does, when it is used, typical doses, side effects, and interaction notes.',
  },
  'course-fas-military-medicine_en': {
    blurb:
      'Tactical and field-medicine manuals covering bleeding control, shock, prolonged care, and treatment in improvised settings.',
  },
  'course-wwwnc.cdc.gov_en_all': {
    blurb:
      'Plain-language CDC material on disease prevention, travel advisories, vaccinations, outbreaks, and basic public-health guidance.',
  },
  'course-medlineplus.gov_en_all': {
    blurb:
      'NIH reference on conditions, symptoms, procedures, drugs, supplements, and wellness topics in one encyclopedia-style lane.',
  },
  'course-wikipedia_en_medicine_maxi': {
    blurb:
      'Picked-through Wikipedia medical articles with images kept where they actually help: conditions, anatomy, procedures, and pathologies.',
  },
  'course-libretexts.org_en_med': {
    blurb:
      'Course-style medical textbooks on systems, pathophysiology, diagnostics, and treatment chapters laid out like a proper curriculum.',
  },
  'course-librepathology_en_all_maxi': {
    blurb:
      'Microscopic findings, disease patterns, differential tables, and pathology case write-ups in one tight specialist lane.',
  },
  'course-canadian_prepper_winterprepping_en': {
    blurb:
      'A focused cold-weather shelf for layering systems, shelter choices, heating, vehicle prep, and what realistically fails first in deep winter.',
  },
  'course-canadian_prepper_bugoutroll_en': {
    blurb:
      'A gear-first lane for packs, pouches, rolls, and how to build a setup where everything has a clear job.',
  },
  'course-canadian_prepper_bugoutconcepts_en': {
    blurb:
      'The thinking half of bug-out planning: trigger points, route planning, staging, family plans, and what you leave behind.',
  },
  'course-urban-prepper_en_all': {
    blurb:
      'City-focused scenarios: outages, supply shocks, protests, elevators that stop, and how to navigate dense environments when systems stutter.',
  },
  'course-canadian_prepper_preppingfood_en': {
    blurb:
      'Storage methods, staple choices, rotation systems, and actual meal ideas built around prep, not restaurant cooking.',
  },
  'course-gutenberg_en_lcc-u': {
    blurb:
      'Doctrine-era texts on tactics, campaigns, field craft, and command; more how armies move and think than quote-poster military history.',
  },
  'course-libretexts.org_en_math': {
    blurb:
      'A full math sequence in one lane: algebra, trig, calculus, linear algebra, stats, and more, laid out like a real course track.',
  },
  'course-libretexts.org_en_phys': {
    blurb:
      'Mechanics, E&M, thermodynamics, and modern physics in lecture-style chapters with worked examples and problems.',
  },
  'course-libretexts.org_en_chem': {
    blurb:
      'General chemistry through organic and beyond: reactions, lab skills, problem sets, and exam-style questions.',
  },
  'course-libretexts.org_en_bio': {
    blurb:
      'Cell bio, genetics, ecology, human systems, and more for both formal study and “I actually want to understand this” reading.',
  },
  'course-wikibooks_en_all_maxi': {
    blurb:
      'The image-rich Wikibooks lane, keeping diagrams, figures, and illustrations where they actually teach something.',
  },
  'course-ted_mul_ted-conference': {
    blurb:
      'Flagship TED talks across science, design, policy, culture, and human stories; a good ideas lane for background watching.',
  },
  'course-libretexts.org_en_human': {
    blurb:
      'Literature, philosophy, history, political science, and sociology collections so the humanities are not an afterthought on a dev machine.',
  },
  'course-libretexts.org_en_geo': {
    blurb:
      'Earth systems, rocks, climate, natural hazards, and environmental impact in textbook-level detail.',
  },
  'course-libretexts.org_en_eng': {
    blurb:
      'Statics, circuits, fluids, materials, and other engineering fundamentals organized like a proper program track.',
  },
  'course-libretexts.org_en_business': {
    blurb:
      'Accounting, management, marketing, finance, and entrepreneurship texts useful for running a label, studio, or any small independent shop.',
  },
}

const root = document.documentElement
const sidebarNav = document.querySelector('#apps-sidebar-nav')
const sectionHead = document.querySelector('#apps-section-head')
const storeStage = document.querySelector('#apps-store-stage')
const viewKicker = document.querySelector('#apps-view-kicker')
const searchInput = document.querySelector('#apps-search')
const primaryDownloadButton = document.querySelector('#apps-primary-download')
const downloadMeta = document.querySelector('#apps-download-meta')
const detailOverlay = document.querySelector('#apps-detail-overlay')
const detailContent = document.querySelector('#apps-detail-content')
const detailClose = document.querySelector('#apps-detail-close')
const returnHomeButtons = [...document.querySelectorAll('[data-return-home]')]
const timeNode = document.querySelector('[data-store-time]')
const connectivityNode = document.querySelector('[data-store-connectivity]')
const storageNode = document.querySelector('[data-store-storage]')

const state = {
  latestRelease: null,
  catalog: null,
  activeSection: resolveInitialSection(),
  query: '',
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveInitialSection() {
  const hash = window.location.hash.replace(/^#/, '')
  return sectionSlugLookup.get(hash) || 'Today'
}

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase()
  const platform = navigator.platform.toLowerCase()

  if (platform.includes('mac') || ua.includes('mac os')) return 'mac'
  if (platform.includes('win') || ua.includes('windows')) return 'win'
  return 'linux'
}

function setDownloadButton() {
  if (!primaryDownloadButton) return

  const platformKey = detectPlatform()
  const asset = hostedDownloads[platformKey] || hostedDownloads.mac
  const label = platformKey === 'mac' ? 'macOS' : platformKey === 'win' ? 'Windows 11' : 'Linux'

  primaryDownloadButton.textContent = `Download RoachNet ${asset.version} for ${label}`
  primaryDownloadButton.onclick = () => {
    window.location.href = asset.url
  }

  if (downloadMeta) {
    downloadMeta.textContent = `Starts with RoachNet Setup v${asset.version} · ${asset.name}`
  }
}

async function loadLatestRelease() {
  setDownloadButton()

  try {
    const response = await fetch(latestReleaseApi, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    })
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    state.latestRelease = await response.json()
    const platformKey = detectPlatform()
    const asset =
      state.latestRelease.assets?.find((candidate) =>
        platformKey === 'win'
          ? /RoachNet-Setup-windows-x64-beta\.exe/i.test(candidate.name)
          : /RoachNet-Setup-macOS\.dmg/i.test(candidate.name)
      ) || null
    const version = platformKey === 'win'
      ? '0.0.1 beta'
      : state.latestRelease.tag_name?.replace(/^v/i, '') || releaseVersion
    const label = platformKey === 'win' ? 'Windows 11' : 'macOS'

    primaryDownloadButton.textContent = `Download RoachNet ${version} for ${label}`
    primaryDownloadButton.onclick = () => {
      window.location.href = asset?.browser_download_url || (hostedDownloads[platformKey] || hostedDownloads.mac).url
    }

    if (downloadMeta) {
      const fallbackAsset = hostedDownloads[platformKey] || hostedDownloads.mac
      downloadMeta.textContent = `Starts with RoachNet Setup v${version} · ${asset?.name || fallbackAsset.name}`
    }
  } catch (error) {
    primaryDownloadButton.onclick = () => {
      window.open(latestReleasePage, '_blank', 'noopener,noreferrer')
    }
    console.error(error)
  }
}

function formatCompactBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 GB'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const precision = value >= 10 || unitIndex === 0 ? 0 : 1
  return `${value.toFixed(precision)} ${units[unitIndex]}`
}

function updateStoreTime() {
  if (!timeNode) return

  timeNode.textContent = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
}

function updateConnectivity() {
  if (!connectivityNode) return

  const isOnline = navigator.onLine
  connectivityNode.dataset.state = isOnline ? 'online' : 'offline'
  connectivityNode.textContent = isOnline ? 'Online now' : 'Offline ready'
}

async function updateStorageEstimate() {
  if (!storageNode) return

  if (!navigator.storage?.estimate) {
    storageNode.textContent = 'Storage estimate unavailable'
    return
  }

  try {
    const { quota = 0, usage = 0 } = await navigator.storage.estimate()
    const available = Math.max(0, quota - usage)
    storageNode.textContent = available ? `${formatCompactBytes(available)} storage est.` : 'Storage estimate unavailable'
  } catch (error) {
    storageNode.textContent = 'Storage estimate unavailable'
    console.error(error)
  }
}

function startTelemetry() {
  updateStoreTime()
  updateConnectivity()
  updateStorageEstimate()
  window.setInterval(updateStoreTime, 30_000)
  window.addEventListener('online', updateConnectivity)
  window.addEventListener('offline', updateConnectivity)
}

function normalizeValue(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function deriveTier(status = '') {
  const normalized = status.toLowerCase()

  if (
    normalized.includes('deep archive') ||
    normalized.includes('largest install') ||
    normalized.includes('heavy') ||
    normalized.includes('full')
  ) {
    return { label: 'Comprehensive', tone: 'comprehensive' }
  }

  if (
    normalized.includes('recommended next install') ||
    normalized.includes('balanced') ||
    normalized.includes('popular') ||
    normalized.includes('ready')
  ) {
    return { label: 'Standard', tone: 'standard' }
  }

  return { label: 'Essential', tone: 'essential' }
}

function deriveIconMonogram(item) {
  if (item.iconMonogram) return item.iconMonogram

  const segments = String(item.title || 'RN')
    .split(/[\s:/-]+/)
    .filter(Boolean)

  if (segments.length >= 2) {
    return segments
      .slice(0, 3)
      .map((segment) => segment[0].toUpperCase())
      .join('')
      .slice(0, 4)
  }

  return segments.join('').replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase() || 'RN'
}

function deriveIconFamily(item) {
  if (item.iconFamily) return item.iconFamily

  const haystack = normalizeValue([item.section, item.category, item.title].join(' '))

  if (haystack.includes('map')) return 'maps'
  if (haystack.includes('medicine')) return 'medicine'
  if (haystack.includes('survival') || haystack.includes('preparedness')) return 'survival'
  if (haystack.includes('education') || haystack.includes('reference')) return 'education'
  if (
    haystack.includes('science') ||
    haystack.includes('simulation') ||
    haystack.includes('astronomy') ||
    haystack.includes('physics') ||
    haystack.includes('chemistry') ||
    haystack.includes('biology') ||
    haystack.includes('bioinformatics')
  ) {
    return 'science'
  }
  if (haystack.includes('kids') || haystack.includes('family') || haystack.includes('story')) return 'kids'
  if (haystack.includes('course') || haystack.includes('lecture')) return 'courses'
  if (haystack.includes('math') || haystack.includes('problem solving')) return 'math'
  if (haystack.includes('law') || haystack.includes('history') || haystack.includes('society')) return 'civic'
  if (haystack.includes('language') || haystack.includes('writing') || haystack.includes('linguistics')) return 'language'
  if (haystack.includes('repair') || haystack.includes('diy')) return 'repair'
  if (
    haystack.includes('maker') ||
    haystack.includes('electronics') ||
    haystack.includes('arduino') ||
    haystack.includes('semiconductor') ||
    haystack.includes('3d printing')
  ) {
    return 'maker'
  }
  if (haystack.includes('homestead') || haystack.includes('sustainability')) return 'homestead'
  if (haystack.includes('finance') || haystack.includes('crypto')) return 'finance'
  if (haystack.includes('agriculture') || haystack.includes('food')) return 'agriculture'
  if (haystack.includes('software') || haystack.includes('dev')) return 'development'
  if (haystack.includes('machine learning') || haystack.includes('data science')) return 'ml'
  if (haystack.includes('platform') || haystack.includes('systems')) return 'systems'
  if (haystack.includes('security') || haystack.includes('privacy') || haystack.includes('tor')) return 'security'
  if (haystack.includes('audio') || haystack.includes('music')) return 'audio'
  if (
    haystack.includes('design') ||
    haystack.includes('blender') ||
    haystack.includes('graphic') ||
    haystack.includes('photo')
  ) {
    return 'design'
  }
  if (haystack.includes('infrastructure') || haystack.includes('it')) return 'infrastructure'
  if (haystack.includes('travel') || haystack.includes('voyage') || haystack.includes('guide')) return 'travel'
  if (haystack.includes('culture') || haystack.includes('games') || haystack.includes('film')) return 'culture'
  if (
    haystack.includes('dictionary') ||
    haystack.includes('primary sources') ||
    haystack.includes('wiktionary') ||
    haystack.includes('wikisource') ||
    haystack.includes('gutenberg')
  ) {
    return 'library'
  }
  if (haystack.includes('wikipedia')) return 'wikipedia'
  if (haystack.includes('model')) return 'models'
  return 'general'
}

function deriveIconGlyph(item, family = deriveIconFamily(item)) {
  switch (family) {
    case 'maps':
      return 'GRID'
    case 'medicine':
      return 'MED'
    case 'survival':
      return 'FIELD'
    case 'education':
      return 'READ'
    case 'science':
      return 'LAB'
    case 'kids':
      return 'KIDS'
    case 'courses':
      return 'COURSE'
    case 'math':
      return 'MATH'
    case 'civic':
      return 'CIVIC'
    case 'language':
      return 'WORDS'
    case 'repair':
      return 'FIX'
    case 'maker':
      return 'MKR'
    case 'agriculture':
      return 'ROOT'
    case 'finance':
      return 'FIN'
    case 'development':
      return 'DEV'
    case 'ml':
      return 'ML'
    case 'systems':
      return 'SYS'
    case 'security':
      return 'SEC'
    case 'audio':
      return 'AUDIO'
    case 'design':
      return 'VIS'
    case 'infrastructure':
      return 'NET'
    case 'travel':
      return 'TRVL'
    case 'culture':
      return 'PLAY'
    case 'homestead':
      return 'HOME'
    case 'library':
      return 'LIB'
    case 'wikipedia':
      return 'WIKI'
    case 'models':
      return 'AI'
    default:
      return 'RN'
  }
}

function renderStoreIcon(item, variant = 'card') {
  if (item.iconAsset) {
    return `
      <div
        class="store-generated-icon store-generated-icon--${variant} store-generated-icon--asset"
        data-icon-family="${escapeHtml(deriveIconFamily(item))}"
        data-accent="${item.accent || 'blue'}"
        role="img"
        aria-label="${escapeHtml(item.title)} icon"
      >
        <img class="store-generated-icon__art" src="${escapeHtml(item.iconAsset)}" alt="" loading="lazy" decoding="async" />
      </div>
    `
  }

  const family = deriveIconFamily(item)
  const glyph = deriveIconGlyph(item, family)
  const band = item.iconBand || item.category || 'RoachNet'

  return `
    <div
      class="store-generated-icon store-generated-icon--${variant}"
      data-icon-family="${family}"
      data-accent="${item.accent || 'blue'}"
      role="img"
      aria-label="${escapeHtml(item.title)} icon"
    >
      <span class="store-generated-icon__mesh" aria-hidden="true"></span>
      <span class="store-generated-icon__glyph" aria-hidden="true">${escapeHtml(glyph)}</span>
      <span class="store-generated-icon__band">${escapeHtml(band)}</span>
      <strong class="store-generated-icon__mono">${escapeHtml(deriveIconMonogram(item))}</strong>
    </div>
  `
}

function buildInstallUrl(item) {
  if (!item?.installIntent) return ''

  const params = new URLSearchParams()
  Object.entries(item.installIntent).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.set(key, value)
    }
  })

  const query = params.toString()
  return query ? `roachnet://install-content?${query}` : 'roachnet://install-content'
}

function attemptNativeInstall(url) {
  if (!url) return

  let completed = false
  let fallbackTimer = null

  const clearFallback = () => {
    completed = true
    if (fallbackTimer) {
      window.clearTimeout(fallbackTimer)
      fallbackTimer = null
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('pagehide', clearFallback)
    window.removeEventListener('blur', handleBlur)
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      clearFallback()
    }
  }

  const handleBlur = () => {
    window.setTimeout(() => {
      if (document.visibilityState === 'hidden') {
        clearFallback()
      }
    }, 120)
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('pagehide', clearFallback)
  window.addEventListener('blur', handleBlur)

  fallbackTimer = window.setTimeout(() => {
    if (completed) return
    clearFallback()
    window.location.href = 'https://roachnet.org/#downloads'
  }, 1400)

  window.location.href = url
}

function getCatalogItems() {
  return Array.isArray(state.catalog?.items) ? state.catalog.items : []
}

function enrichItem(item) {
  const copy = itemCopy[item.id] || {}
  const section = sectionLookup.get(item.section) || sectionLookup.get('Today')
  const tier = deriveTier(item.status)
  const blurb = copy.blurb || item.summary
  const detail = copy.detail || [
    blurb,
    `${item.title} installs into the ${section.navLabel} lane as its own named RoachNet app instead of disappearing into a loose download folder.`,
  ]

  return {
    ...item,
    tier,
    blurb,
    detail,
    sectionMeta: section,
    codeLabel: `${item.iconBand || section.navLabel} · ${deriveIconMonogram(item)}`,
    installUrl: buildInstallUrl(item),
    metaRow: [section.navLabel, tier.label, item.size].filter(Boolean),
  }
}

function matchesQuery(item, query) {
  if (!query) return true

  const haystack = normalizeValue([
    item.title,
    item.subtitle,
    item.category,
    item.section,
    item.status,
    item.source,
    item.summary,
    item.blurb,
    item.machineFit,
    ...(item.includes || []),
    ...(item.detail || []),
  ].join(' '))

  return haystack.includes(query)
}

function getEnrichedItems() {
  return getCatalogItems().map(enrichItem)
}

function getSectionItems(sectionKey, query = state.query.trim()) {
  const normalizedQuery = normalizeValue(query)
  const items = getEnrichedItems()

  return items.filter((item) => {
    const matchesSection = sectionKey === 'Today' ? true : item.section === sectionKey
    return matchesSection && matchesQuery(item, normalizedQuery)
  })
}

function findItemById(id) {
  return getEnrichedItems().find((item) => item.id === id)
}

function byIds(ids) {
  return ids.map(findItemById).filter(Boolean)
}

function bySections(sectionKeys, limit = sectionKeys.length) {
  const picks = []
  const seen = new Set()

  for (const section of sectionKeys) {
    const candidate = getSectionItems(section).find((item) => {
      if (seen.has(item.id)) return false
      return item.id !== todayFeaturedId
    })

    if (!candidate) continue
    seen.add(candidate.id)
    picks.push(candidate)

    if (picks.length >= limit) break
  }

  return picks
}

function renderSidebarNav() {
  if (!sidebarNav) return

  const items = getEnrichedItems()
  const counts = items.reduce((map, item) => {
    map.set(item.section, (map.get(item.section) || 0) + 1)
    return map
  }, new Map())

  sidebarNav.innerHTML = sectionDefinitions
    .map((section) => {
      const count = section.key === 'Today' ? items.length : counts.get(section.key) || 0
      const active = state.activeSection === section.key

      return `
        <button
          class="apps-nav-item${active ? ' apps-nav-item--active' : ''}"
          type="button"
          data-section="${section.key}"
          aria-current="${active ? 'page' : 'false'}"
        >
          <span class="apps-nav-item__icon" aria-hidden="true">${escapeHtml(section.icon)}</span>
          <span class="apps-nav-item__label">${escapeHtml(section.navLabel)}</span>
          <span class="apps-nav-item__count">${count}</span>
        </button>
      `
    })
    .join('')
}

function renderSectionHead(content = '') {
  if (!sectionHead) return

  if (!content) {
    sectionHead.hidden = true
    sectionHead.innerHTML = ''
    return
  }

  sectionHead.hidden = false
  sectionHead.innerHTML = content
}

function renderBadgeRow(item) {
  return `
    <div class="apps-badge-row">
      <span class="apps-pill apps-pill--${item.tier.tone}">${item.tier.label}</span>
      <span class="apps-pill">${escapeHtml(item.status)}</span>
      <span class="apps-pill">${escapeHtml(item.size)}</span>
    </div>
  `
}

function renderCard(item) {
  return `
    <article class="apps-card" data-accent="${item.accent || 'blue'}" data-tier="${item.tier.tone}">
      <div class="apps-card__head">
        <div class="apps-card__icon">${renderStoreIcon(item, 'compact')}</div>
        <div class="apps-card__copy">
          <span class="apps-card__code">${escapeHtml(item.codeLabel)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.blurb)}</p>
        </div>
      </div>
      <div class="apps-card__meta">
        ${item.metaRow.map((value) => `<span>${escapeHtml(value)}</span>`).join('')}
      </div>
      <div class="apps-card__actions">
        ${
          item.installUrl
            ? `<a class="apps-card__install" href="${item.installUrl}">${escapeHtml(item.installLabel || 'Install to RoachNet')}</a>`
            : ''
        }
        <button class="apps-card__more" type="button" data-preview-id="${item.id}">More</button>
      </div>
    </article>
  `
}

function renderShelfRow(title, note, items) {
  if (!items.length) return ''

  return `
    <section class="apps-row">
      <div class="apps-row__head">
        <div>
          <p class="apps-row__eyebrow">${escapeHtml(title)}</p>
          <h2>${escapeHtml(note)}</h2>
        </div>
      </div>
      <div class="apps-row__scroller">
        ${items.map((item) => renderCard(item)).join('')}
      </div>
    </section>
  `
}

function renderTodayView() {
  const featured = findItemById(todayFeaturedId) || getEnrichedItems()[0]
  const quickRows = todayRows
    .map((row) => renderShelfRow(row.title, row.note, row.ids ? byIds(row.ids) : bySections(row.sections || [])))
    .join('')

  renderSectionHead('')

  storeStage.innerHTML = `
    <section class="apps-hero-panel" data-accent="${featured.accent || 'blue'}">
      <div class="apps-hero-panel__copy">
        <p class="apps-hero-panel__eyebrow">Today in RoachNet Apps</p>
        <span class="apps-card__code apps-card__code--hero">${escapeHtml(featured.codeLabel)}</span>
        <h1>${escapeHtml(featured.title)}</h1>
        <p class="apps-hero-panel__lead">${escapeHtml(featured.blurb)}</p>
        <p class="apps-hero-panel__body">${escapeHtml(featured.detail[0])}</p>
        <p class="apps-hero-panel__body">${escapeHtml(featured.detail[1] || '')}</p>
        ${renderBadgeRow(featured)}
        <div class="apps-hero-panel__actions">
          ${
            featured.installUrl
              ? `<a class="apps-card__install apps-card__install--hero" href="${featured.installUrl}">${escapeHtml(featured.installLabel || 'Install to RoachNet')}</a>`
              : ''
          }
          <button class="apps-card__more apps-card__more--hero" type="button" data-preview-id="${featured.id}">Preview</button>
          ${
            featured.detailUrl
              ? `<a class="apps-card__secondary" href="${featured.detailUrl}">${escapeHtml(featured.detailLabel || 'Open manifest')}</a>`
              : ''
          }
        </div>
      </div>

      <div class="apps-hero-panel__art" aria-hidden="true">
        <div class="apps-hero-panel__icon">
          ${renderStoreIcon(featured, 'hero')}
        </div>
        <div class="apps-hero-panel__strip">
          <span>${escapeHtml(featured.section)}</span>
          <strong>${escapeHtml(featured.machineFit || 'Install-ready')}</strong>
        </div>
        <div class="apps-hero-panel__stack">
          <span>Open textbooks</span>
          <span>Math, science, computing, languages</span>
          <span>Installs as its own named course app</span>
        </div>
      </div>
    </section>

    ${quickRows}
  `
}

function renderCategoryView() {
  const activeSection = sectionLookup.get(state.activeSection) || sectionLookup.get('Today')
  const items = getSectionItems(state.activeSection)
  const isSearch = Boolean(state.query.trim())
  const countLabel = `${items.length} app${items.length === 1 ? '' : 's'}`

  renderSectionHead(`
    <div class="apps-section-head__copy">
      <p class="apps-section-head__eyebrow">${escapeHtml(isSearch ? 'Search results' : activeSection.eyebrow)}</p>
      <h1>${escapeHtml(isSearch ? `Results in ${activeSection.navLabel}` : activeSection.title)}</h1>
      <p>${escapeHtml(isSearch ? `Showing ${countLabel} in ${activeSection.navLabel} matching “${state.query.trim()}”.` : activeSection.description)}</p>
    </div>
    <div class="apps-section-head__meta">
      <span>${countLabel}</span>
      <span>${escapeHtml(activeSection.navLabel)}</span>
    </div>
  `)

  if (!items.length) {
    storeStage.innerHTML = `
      <section class="apps-empty-state">
        <strong>No apps matched this view.</strong>
        <p>Try a broader search or switch to another section.</p>
      </section>
    `
    return
  }

  const layoutClass =
    activeSection.layout === 'map'
      ? 'apps-card-grid--map'
      : activeSection.layout === 'grid'
        ? 'apps-card-grid--standard'
        : 'apps-card-grid--standard'

  storeStage.innerHTML = `
    <section class="apps-card-grid ${layoutClass}">
      ${items.map((item) => renderCard(item)).join('')}
    </section>
  `
}

function renderStore() {
  renderSidebarNav()

  const activeSection = sectionLookup.get(state.activeSection) || sectionLookup.get('Today')
  if (viewKicker) {
    viewKicker.textContent = state.query.trim() ? `${activeSection.navLabel} Search` : activeSection.navLabel
  }

  root.style.setProperty('--apps-accent-name', activeSection.key)

  if (state.activeSection === 'Today' && !state.query.trim()) {
    renderTodayView()
    return
  }

  renderCategoryView()
}

function renderDetail(item) {
  const detailUrl = item.detailUrl || item.primaryUrl

  return `
    <article class="apps-detail">
      <div class="apps-detail__hero" data-accent="${item.accent || 'blue'}">
        <div class="apps-detail__icon">
          ${renderStoreIcon(item, 'detail')}
        </div>
        <div class="apps-detail__copy">
          <span class="apps-card__code apps-card__code--hero">${escapeHtml(item.codeLabel)}</span>
          <h2 id="apps-detail-title">${escapeHtml(item.title)}</h2>
          <p class="apps-detail__subtitle">${escapeHtml(item.subtitle || item.source || item.section)}</p>
          ${renderBadgeRow(item)}
          <div class="apps-detail__actions">
            ${
              item.installUrl
                ? `<a class="apps-card__install apps-card__install--hero" href="${item.installUrl}">${escapeHtml(item.installLabel || 'Install to RoachNet')}</a>`
                : ''
            }
            ${
              detailUrl
                ? `<a class="apps-card__secondary" href="${detailUrl}">${escapeHtml(item.detailLabel || 'Open manifest')}</a>`
                : ''
            }
          </div>
        </div>
      </div>

      <div class="apps-detail__body">
        <section class="apps-detail__story">
          <h3>What’s inside</h3>
          ${item.detail.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </section>

        <aside class="apps-detail__meta">
          <section>
            <h3>Install notes</h3>
            <dl>
              <div><dt>Shelf</dt><dd>${escapeHtml(item.section)}</dd></div>
              <div><dt>Tier</dt><dd>${escapeHtml(item.tier.label)}</dd></div>
              <div><dt>Size</dt><dd>${escapeHtml(item.size || 'Unknown')}</dd></div>
              <div><dt>Source</dt><dd>${escapeHtml(item.source || 'RoachNet mirror')}</dd></div>
            </dl>
          </section>
          <section>
            <h3>Included topics</h3>
            <ul>
              ${(item.includes || ['Direct native install handoff into the right RoachNet lane.'])
                .map((entry) => `<li>${escapeHtml(entry)}</li>`)
                .join('')}
            </ul>
          </section>
        </aside>
      </div>
    </article>
  `
}

function openDetail(id) {
  const item = findItemById(id)
  if (!item || !detailOverlay || !detailContent) return

  detailContent.innerHTML = renderDetail(item)
  detailOverlay.hidden = false
  document.body.classList.add('app-detail-open')
}

function closeDetail() {
  if (!detailOverlay || !detailContent) return

  detailOverlay.hidden = true
  detailContent.innerHTML = ''
  document.body.classList.remove('app-detail-open')
}

function returnToRoachNetHome(event) {
  event?.preventDefault()

  const referrer = document.referrer || ''
  const cameFromHome = /^https:\/\/roachnet\.org(?:\/|$)/i.test(referrer)
  if (cameFromHome && window.history.length > 1) {
    window.history.back()
    return
  }

  window.location.href = 'https://roachnet.org/'
}

async function loadCatalog() {
  try {
    const response = await fetch('./app-store-catalog.json', {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    state.catalog = await response.json()
    renderStore()
  } catch (error) {
    console.error(error)
    storeStage.innerHTML = `
      <section class="apps-empty-state">
        <strong>Catalog unavailable right now.</strong>
        <p>The App Store manifest could not be loaded. Try again in a moment.</p>
      </section>
    `
  }
}

function setActiveSection(sectionKey) {
  state.activeSection = sectionKey
  if (sectionKey !== 'Today') {
    window.location.hash = slugify(sectionLookup.get(sectionKey)?.navLabel || sectionKey)
  } else {
    history.replaceState(null, '', window.location.pathname)
  }
  renderStore()
}

sidebarNav?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-section]')
  if (!button) return

  setActiveSection(button.dataset.section || 'Today')
})

searchInput?.addEventListener('input', (event) => {
  state.query = event.currentTarget.value || ''
  renderStore()
})

storeStage?.addEventListener('click', (event) => {
  const previewButton = event.target.closest('[data-preview-id]')
  if (previewButton) {
    event.preventDefault()
    openDetail(previewButton.dataset.previewId)
  }
})

detailClose?.addEventListener('click', closeDetail)

detailOverlay?.addEventListener('click', (event) => {
  if (event.target === detailOverlay) {
    closeDetail()
  }
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && detailOverlay && !detailOverlay.hidden) {
    event.preventDefault()
    closeDetail()
  }
})

document.addEventListener('click', (event) => {
  const installLink = event.target.closest('a[href^="roachnet://install-content"]')
  if (!installLink) return

  event.preventDefault()
  attemptNativeInstall(installLink.getAttribute('href') || '')
})

returnHomeButtons.forEach((button) => {
  button.addEventListener('click', returnToRoachNetHome)
})

startTelemetry()
loadLatestRelease()
loadCatalog()
