import { readFile, writeFile } from 'node:fs/promises'

const file = new URL('../collections/kiwix-categories.json', import.meta.url)
const data = JSON.parse(await readFile(file, 'utf8'))

function upsertCategory(spec, category) {
  let existing = spec.categories.find((entry) => entry.slug === category.slug)

  if (!existing) {
    existing = { ...category, tiers: [] }
    spec.categories.push(existing)
  } else {
    Object.assign(existing, { ...category, tiers: existing.tiers || [] })
  }

  return existing
}

function upsertTier(category, tier) {
  let existing = category.tiers.find((entry) => entry.slug === tier.slug)

  if (!existing) {
    existing = { ...tier, resources: [] }
    category.tiers.push(existing)
  } else {
    Object.assign(existing, { ...tier, resources: existing.resources || [] })
  }

  return existing
}

function upsertResource(tier, resource) {
  const index = tier.resources.findIndex((entry) => entry.id === resource.id)

  if (index >= 0) {
    tier.resources[index] = resource
    return
  }

  tier.resources.push(resource)
}

const categoryDefinitions = {
  'science-simulations': {
    name: 'Science & Simulations',
    slug: 'science-simulations',
    icon: 'IconFlask',
    description:
      'Interactive simulations and science-heavy reference shelves for astronomy, physics, chemistry, biology, and lab-minded study.',
    language: 'en',
  },
  'maker-electronics': {
    name: 'Maker & Electronics',
    slug: 'maker-electronics',
    icon: 'IconCpu',
    description:
      'Boards, components, fabrication, and electronics learning packs for bench work, repairs, and hardware curiosity.',
    language: 'en',
  },
  'design-visual-media': {
    name: 'Design & Visual Media',
    slug: 'design-visual-media',
    icon: 'IconBrush',
    description:
      '3D, graphics, photography, and visual-production references that install as named RoachNet shelves.',
    language: 'en',
  },
  'travel-field-guides': {
    name: 'Travel & Field Guides',
    slug: 'travel-field-guides',
    icon: 'IconRouteSquare',
    description:
      'Offline travel guides and route-oriented reference shelves for planning on bad networks or no network at all.',
    language: 'en',
  },
  'dictionaries-primary-sources': {
    name: 'Dictionaries & Primary Sources',
    slug: 'dictionaries-primary-sources',
    icon: 'IconBooks',
    description:
      'Dictionaries, source texts, and deep public-domain shelves for machines that keep a real library close.',
    language: 'en',
  },
}

const tierAdds = [
  {
    category: 'education',
    tier: {
      name: 'Standard',
      slug: 'education-standard',
      description: 'Adds educational videos, university-level tutorials, and STEM textbooks. Includes Essential.',
      includesTier: 'education-essential',
    },
    resources: [
      {
        id: 'libretexts.org_en_k12',
        version: '2026-01',
        title: 'LibreTexts K-12',
        description: 'School-age math, science, and general study textbooks',
        url: 'https://download.kiwix.org/zim/libretexts/libretexts.org_en_k12_2026-01.zim',
        size_mb: 353,
      },
    ],
  },
  {
    category: 'education',
    tier: {
      name: 'Comprehensive',
      slug: 'education-comprehensive',
      description: 'Complete educational library with enhanced textbooks and TED talks. Includes Standard.',
      includesTier: 'education-standard',
    },
    resources: [
      {
        id: 'academia.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Academia Q&A',
        description: 'Research, publishing, grad-school, and academic-workflow discussions',
        url: 'https://download.kiwix.org/zim/stack_exchange/academia.stackexchange.com_en_all_2026-02.zim',
        size_mb: 279,
      },
      {
        id: 'cseducators.stackexchange.com_en_all',
        version: '2026-02',
        title: 'CS Educators Q&A',
        description: 'Teaching computer science, curriculum design, and classroom practice',
        url: 'https://download.kiwix.org/zim/stack_exchange/cseducators.stackexchange.com_en_all_2026-02.zim',
        size_mb: 16,
      },
      {
        id: 'libretexts.org_en_socialsci',
        version: '2025-01',
        title: 'LibreTexts Social Sciences',
        description: 'Politics, sociology, psychology, and society-focused textbooks',
        url: 'https://download.kiwix.org/zim/libretexts/libretexts.org_en_socialsci_2025-01.zim',
        size_mb: 1946,
      },
      {
        id: 'libretexts.org_en_workforce',
        version: '2026-01',
        title: 'LibreTexts Workforce',
        description: 'Career, technical, and workforce-development course texts',
        url: 'https://download.kiwix.org/zim/libretexts/libretexts.org_en_workforce_2026-01.zim',
        size_mb: 490,
      },
    ],
  },
  {
    category: 'computing',
    tier: {
      name: 'Standard',
      slug: 'computing-standard',
      description: 'Add the web stack, version-control training, and container fundamentals. Includes Essential.',
      includesTier: 'computing-essential',
    },
    resources: [
      {
        id: 'freecodecamp_en_coding-interview-prep',
        version: '2026-02',
        title: 'freeCodeCamp: Coding Interview Prep',
        description: 'Challenge-driven prep for whiteboard-style coding and algorithm questions',
        url: 'https://download.kiwix.org/zim/freecodecamp/freecodecamp_en_coding-interview-prep_2026-02.zim',
        size_mb: 6,
      },
      {
        id: 'freecodecamp_en_project-euler',
        version: '2026-02',
        title: 'freeCodeCamp: Project Euler',
        description: 'Math-heavy programming problems for sharpening problem-solving under constraints',
        url: 'https://download.kiwix.org/zim/freecodecamp/freecodecamp_en_project-euler_2026-02.zim',
        size_mb: 7,
      },
      {
        id: 'freecodecamp_en_rosetta-code',
        version: '2026-02',
        title: 'freeCodeCamp: Rosetta Code',
        description: 'Cross-language programming tasks and pattern comparisons in one compact archive',
        url: 'https://download.kiwix.org/zim/freecodecamp/freecodecamp_en_rosetta-code_2026-02.zim',
        size_mb: 7,
      },
      {
        id: 'devdocs_en_typescript',
        version: '2026-04',
        title: 'TypeScript Docs',
        description: 'Types, tooling, and API reference for modern JavaScript work',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_typescript_2026-04.zim',
        size_mb: 1,
      },
      {
        id: 'coreyms_en_javascript-tutorials',
        version: '2025-10',
        title: 'Corey Schafer: JavaScript Tutorials',
        description: 'A practical JavaScript video lane for fundamentals and browser-side workflows',
        url: 'https://download.kiwix.org/zim/videos/coreyms_en_javascript-tutorials_2025-10.zim',
        size_mb: 42,
      },
      {
        id: 'coreyms_en_sql-tutorials',
        version: '2026-04',
        title: 'Corey Schafer: SQL Tutorials',
        description: 'Querying, joins, schema basics, and everyday database work in video form',
        url: 'https://download.kiwix.org/zim/videos/coreyms_en_sql-tutorials_2026-04.zim',
        size_mb: 22,
      },
    ],
  },
  {
    category: 'computing',
    tier: {
      name: 'Comprehensive',
      slug: 'computing-comprehensive',
      description: 'Fill out the language shelf with systems-level references and cloud-native runtime docs. Includes Standard.',
      includesTier: 'computing-standard',
    },
    resources: [
      {
        id: 'coreyms_en_django-tutorials',
        version: '2025-10',
        title: 'Corey Schafer: Django Tutorials',
        description: 'Django apps, models, auth, and practical Python web workflows',
        url: 'https://download.kiwix.org/zim/videos/coreyms_en_django-tutorials_2025-10.zim',
        size_mb: 271,
      },
      {
        id: 'coreyms_en_flask-tutorials',
        version: '2026-04',
        title: 'Corey Schafer: Flask Tutorials',
        description: 'Flask routes, APIs, templating, and small-service patterns',
        url: 'https://download.kiwix.org/zim/videos/coreyms_en_flask-tutorials_2026-04.zim',
        size_mb: 257,
      },
      {
        id: 'devdocs_en_nextjs',
        version: '2026-04',
        title: 'Next.js Docs',
        description: 'App Router patterns, routing, rendering, and deployment reference',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_nextjs_2026-04.zim',
        size_mb: 1,
      },
      {
        id: 'devdocs_en_vite',
        version: '2026-04',
        title: 'Vite Docs',
        description: 'Build tooling and dev-server reference for fast modern frontends',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_vite_2026-04.zim',
        size_mb: 1,
      },
      {
        id: 'devdocs_en_tailwindcss',
        version: '2026-02',
        title: 'Tailwind CSS Docs',
        description: 'Utility-first styling reference for fast UI work inside the vault',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_tailwindcss_2026-02.zim',
        size_mb: 1,
      },
      {
        id: 'devdocs_en_playwright',
        version: '2026-04',
        title: 'Playwright Docs',
        description: 'Browser automation and end-to-end testing reference',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_playwright_2026-04.zim',
        size_mb: 1,
      },
      {
        id: 'devdocs_en_electron',
        version: '2026-04',
        title: 'Electron Docs',
        description: 'Desktop app patterns for Chromium and Node-powered builds',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_electron_2026-04.zim',
        size_mb: 2,
      },
      {
        id: 'devdocs_en_vue',
        version: '2026-02',
        title: 'Vue Docs',
        description: 'Reactive UI reference for Vue components, routing, and state work',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_vue_2026-02.zim',
        size_mb: 1,
      },
      {
        id: 'devdocs_en_svelte',
        version: '2026-01',
        title: 'Svelte Docs',
        description: 'Reactive component patterns and compiler-powered frontend reference',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_svelte_2026-01.zim',
        size_mb: 1,
      },
      {
        id: 'devdocs_en_astro',
        version: '2026-04',
        title: 'Astro Docs',
        description: 'Content-site, islands, and hybrid rendering reference for modern web builds',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_astro_2026-04.zim',
        size_mb: 2,
      },
    ],
  },
  {
    category: 'machine-learning',
    tier: {
      name: 'Essential',
      slug: 'machine-learning-essential',
      description: 'Start with statistics and data-handling fundamentals before you pull the heavier model packs.',
    },
    resources: [
      {
        id: 'learningstatisticswithr.com_en_all',
        version: '2026-02',
        title: 'Learning Statistics with R',
        description: 'Statistics through the lens of R, inference, and practical quantitative thinking',
        url: 'https://download.kiwix.org/zim/zimit/learningstatisticswithr.com_en_all_2026-02.zim',
        size_mb: 15,
      },
    ],
  },
  {
    category: 'machine-learning',
    tier: {
      name: 'Standard',
      slug: 'machine-learning-standard',
      description: 'Layer in the practical model-tool docs most people actually use. Includes Essential.',
      includesTier: 'machine-learning-essential',
    },
    resources: [
      {
        id: 'libretexts.org_en_stats',
        version: '2026-01',
        title: 'LibreTexts Statistics',
        description: 'Probability, inference, regression, and statistical methods textbooks',
        url: 'https://download.kiwix.org/zim/libretexts/libretexts.org_en_stats_2026-01.zim',
        size_mb: 206,
      },
      {
        id: 'coreyms_en_pandas-tutorials',
        version: '2026-03',
        title: 'Corey Schafer: Pandas Tutorials',
        description: 'Dataframes, cleaning, reshaping, and analysis workflows in video form',
        url: 'https://download.kiwix.org/zim/videos/coreyms_en_pandas-tutorials_2026-03.zim',
        size_mb: 165,
      },
      {
        id: 'coreyms_en_matplotlib-tutorials',
        version: '2026-04',
        title: 'Corey Schafer: Matplotlib Tutorials',
        description: 'Plotting, chart composition, and data visualization in Python',
        url: 'https://download.kiwix.org/zim/videos/coreyms_en_matplotlib-tutorials_2026-04.zim',
        size_mb: 104,
      },
      {
        id: 'datascience.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Data Science Q&A',
        description: 'Applied data-science discussion on tooling, modeling, and analysis workflows',
        url: 'https://download.kiwix.org/zim/stack_exchange/datascience.stackexchange.com_en_all_2026-02.zim',
        size_mb: 261,
      },
    ],
  },
  {
    category: 'machine-learning',
    tier: {
      name: 'Comprehensive',
      slug: 'machine-learning-comprehensive',
      description: 'Pull the heavier video shelf once you want a deeper offline ML course library. Includes Standard.',
      includesTier: 'machine-learning-standard',
    },
    resources: [
      {
        id: 'ai.stackexchange.com_en_all',
        version: '2026-02',
        title: 'AI Q&A',
        description: 'General AI discussion, model workflows, and implementation questions',
        url: 'https://download.kiwix.org/zim/stack_exchange/ai.stackexchange.com_en_all_2026-02.zim',
        size_mb: 100,
      },
      {
        id: 'genai.stackexchange.com_en_all',
        version: '2026-02',
        title: 'GenAI Q&A',
        description: 'Practical large-language-model and generative-AI troubleshooting and patterns',
        url: 'https://download.kiwix.org/zim/stack_exchange/genai.stackexchange.com_en_all_2026-02.zim',
        size_mb: 10,
      },
      {
        id: 'devdocs_en_scikit-image',
        version: '2026-04',
        title: 'scikit-image Docs',
        description: 'Image processing reference for computer vision and scientific imaging workflows',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_scikit-image_2026-04.zim',
        size_mb: 11,
      },
    ],
  },
  {
    category: 'music-audio',
    tier: {
      name: 'Standard',
      slug: 'music-audio-standard',
      description: 'Bring in sound-focused talks and listening material for production and audio-thinking. Includes Essential.',
      includesTier: 'music-audio-essential',
    },
    resources: [
      {
        id: 'sound.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Sound Q&A',
        description: 'Questions on acoustics, sound design, live audio, and playback systems',
        url: 'https://download.kiwix.org/zim/stack_exchange/sound.stackexchange.com_en_all_2026-02.zim',
        size_mb: 73,
      },
      {
        id: 'music.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Music Q&A',
        description: 'Harmony, arranging, notation, performance, and composition discussions',
        url: 'https://download.kiwix.org/zim/stack_exchange/music.stackexchange.com_en_all_2026-02.zim',
        size_mb: 323,
      },
    ],
  },
  {
    category: 'music-audio',
    tier: {
      name: 'Comprehensive',
      slug: 'music-audio-comprehensive',
      description: 'The large music shelf for deeper study, inspiration, and long-lived offline reference. Includes Standard.',
      includesTier: 'music-audio-standard',
    },
    resources: [
      {
        id: 'dsp.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Signal Processing Q&A',
        description: 'Filters, transforms, DSP workflows, and practical math for audio and signals',
        url: 'https://download.kiwix.org/zim/stack_exchange/dsp.stackexchange.com_en_all_2026-02.zim',
        size_mb: 360,
      },
    ],
  },
  {
    category: 'it-infrastructure',
    tier: {
      name: 'Standard',
      slug: 'it-infrastructure-standard',
      description: 'Add web and edge-infrastructure learning once the Linux base shelf is in place. Includes Essential.',
      includesTier: 'it-infrastructure-essential',
    },
    resources: [
      {
        id: 'askubuntu.com_en_all',
        version: '2025-12',
        title: 'Ask Ubuntu',
        description: 'Ubuntu setup, troubleshooting, packaging, and admin reference from years of Q&A',
        url: 'https://download.kiwix.org/zim/stack_exchange/askubuntu.com_en_all_2025-12.zim',
        size_mb: 2662,
      },
      {
        id: 'devdocs_en_nginx',
        version: '2026-04',
        title: 'Nginx Docs',
        description: 'HTTP server, reverse proxy, and production web-serving reference',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_nginx_2026-04.zim',
        size_mb: 1,
      },
      {
        id: 'devdocs_en_postgresql',
        version: '2026-02',
        title: 'PostgreSQL Docs',
        description: 'Database administration and query reference for serious local services',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_postgresql_2026-02.zim',
        size_mb: 3,
      },
      {
        id: 'devdocs_en_redis',
        version: '2026-04',
        title: 'Redis Docs',
        description: 'Caching, data structures, and operational reference for fast local services',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_redis_2026-04.zim',
        size_mb: 1,
      },
    ],
  },
  {
    category: 'it-infrastructure',
    tier: {
      name: 'Comprehensive',
      slug: 'it-infrastructure-comprehensive',
      description: 'Pull in the broader security shelf once you want more context around threat models and defensive ops. Includes Standard.',
      includesTier: 'it-infrastructure-standard',
    },
    resources: [
      {
        id: 'serverfault.com_en_all',
        version: '2026-02',
        title: 'Server Fault Q&A',
        description: 'Production server, hosting, and systems administration discussions',
        url: 'https://download.kiwix.org/zim/stack_exchange/serverfault.com_en_all_2026-02.zim',
        size_mb: 1536,
      },
      {
        id: 'superuser.com_en_all',
        version: '2026-02',
        title: 'Superuser Q&A',
        description: 'Desktop ops, utilities, and troubleshooting across long-lived machines',
        url: 'https://download.kiwix.org/zim/stack_exchange/superuser.com_en_all_2026-02.zim',
        size_mb: 3789,
      },
      {
        id: 'unix.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Unix & Linux Q&A',
        description: 'Shell, processes, filesystems, and day-to-day Unix operator knowledge',
        url: 'https://download.kiwix.org/zim/stack_exchange/unix.stackexchange.com_en_all_2026-02.zim',
        size_mb: 1229,
      },
      {
        id: 'security.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Security Q&A',
        description: 'Practical security, privacy, defense, and threat-model discussions',
        url: 'https://download.kiwix.org/zim/stack_exchange/security.stackexchange.com_en_all_2026-02.zim',
        size_mb: 420,
      },
      {
        id: 'networkengineering.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Network Engineering Q&A',
        description: 'Routing, switching, access design, and network troubleshooting reference',
        url: 'https://download.kiwix.org/zim/stack_exchange/networkengineering.stackexchange.com_en_all_2026-02.zim',
        size_mb: 124,
      },
      {
        id: 'devdocs_en_ansible',
        version: '2026-04',
        title: 'Ansible Docs',
        description: 'Automation and configuration-management reference for repeatable machine setup',
        url: 'https://download.kiwix.org/zim/devdocs/devdocs_en_ansible_2026-04.zim',
        size_mb: 30,
      },
      {
        id: 'apple.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Apple Q&A',
        description: 'macOS, iOS, and Apple hardware troubleshooting from years of practical questions',
        url: 'https://download.kiwix.org/zim/stack_exchange/apple.stackexchange.com_en_all_2026-02.zim',
        size_mb: 1126,
      },
    ],
  },
  {
    category: 'science-simulations',
    tier: {
      name: 'Essential',
      slug: 'science-simulations-essential',
      description: 'Start with interactive lab basics and a compact astronomy reference.',
      recommended: true,
    },
    resources: [
      {
        id: 'phet_en_all',
        version: '2026-02',
        title: 'PhET Interactive Simulations',
        description: 'Physics, chemistry, math, and engineering simulations you can actually play with offline',
        url: 'https://download.kiwix.org/zim/phet/phet_en_all_2026-02.zim',
        size_mb: 102,
      },
      {
        id: 'astronomy.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Astronomy Q&A',
        description: 'Space, observation, orbital mechanics, and telescope questions from the field',
        url: 'https://download.kiwix.org/zim/stack_exchange/astronomy.stackexchange.com_en_all_2026-02.zim',
        size_mb: 187,
      },
    ],
  },
  {
    category: 'science-simulations',
    tier: {
      name: 'Standard',
      slug: 'science-simulations-standard',
      description: 'Broaden the lab shelf with practical Q&A across the core sciences. Includes Essential.',
      includesTier: 'science-simulations-essential',
    },
    resources: [
      {
        id: 'physics.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Physics Q&A',
        description: 'Mechanics, electromagnetism, thermodynamics, and theory-heavy troubleshooting',
        url: 'https://download.kiwix.org/zim/stack_exchange/physics.stackexchange.com_en_all_2026-02.zim',
        size_mb: 1741,
      },
      {
        id: 'chemistry.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Chemistry Q&A',
        description: 'Reactions, lab practice, spectroscopy, and chemical reasoning discussion',
        url: 'https://download.kiwix.org/zim/stack_exchange/chemistry.stackexchange.com_en_all_2026-02.zim',
        size_mb: 397,
      },
      {
        id: 'biology.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Biology Q&A',
        description: 'Cell biology, genetics, ecology, and organism-level questions',
        url: 'https://download.kiwix.org/zim/stack_exchange/biology.stackexchange.com_en_all_2026-02.zim',
        size_mb: 403,
      },
    ],
  },
  {
    category: 'science-simulations',
    tier: {
      name: 'Comprehensive',
      slug: 'science-simulations-comprehensive',
      description: 'Specialized scientific reference for longer study sessions. Includes Standard.',
      includesTier: 'science-simulations-standard',
    },
    resources: [
      {
        id: 'bioinformatics.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Bioinformatics Q&A',
        description: 'Sequencing, pipelines, biological data analysis, and computational biology discussion',
        url: 'https://download.kiwix.org/zim/stack_exchange/bioinformatics.stackexchange.com_en_all_2026-02.zim',
        size_mb: 55,
      },
    ],
  },
  {
    category: 'maker-electronics',
    tier: {
      name: 'Essential',
      slug: 'maker-electronics-essential',
      description: 'Start with boards, components, and the electronics basics you actually reach for first.',
      recommended: true,
    },
    resources: [
      {
        id: 'arduino.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Arduino Q&A',
        description: 'Microcontroller questions, hobby hardware builds, and embedded troubleshooting',
        url: 'https://download.kiwix.org/zim/stack_exchange/arduino.stackexchange.com_en_all_2026-02.zim',
        size_mb: 247,
      },
      {
        id: 'avanti-semiconductor-electronics',
        version: '2025-09',
        title: 'Semiconductor Electronics',
        description: 'A focused video shelf on semiconductor devices and electronics fundamentals',
        url: 'https://download.kiwix.org/zim/videos/avanti-semiconductor-electronics_2025-09.zim',
        size_mb: 136,
      },
    ],
  },
  {
    category: 'maker-electronics',
    tier: {
      name: 'Standard',
      slug: 'maker-electronics-standard',
      description: 'Add fabrication and object-making context once the bench basics are in place. Includes Essential.',
      includesTier: 'maker-electronics-essential',
    },
    resources: [
      {
        id: 'ted_mul_3d-printing',
        version: '2026-01',
        title: 'TED: 3D Printing',
        description: 'Talks and demos on rapid prototyping, fabrication, and printed-object workflows',
        url: 'https://download.kiwix.org/zim/ted/ted_mul_3d-printing_2026-01.zim',
        size_mb: 137,
      },
    ],
  },
  {
    category: 'maker-electronics',
    tier: {
      name: 'Comprehensive',
      slug: 'maker-electronics-comprehensive',
      description: 'The deeper hardware shelf with years of practical electronics problem-solving. Includes Standard.',
      includesTier: 'maker-electronics-standard',
    },
    resources: [
      {
        id: 'electronics.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Electronics Q&A',
        description: 'Circuit analysis, components, embedded gear, and real-world electronics troubleshooting',
        url: 'https://download.kiwix.org/zim/stack_exchange/electronics.stackexchange.com_en_all_2026-02.zim',
        size_mb: 3994,
      },
    ],
  },
  {
    category: 'design-visual-media',
    tier: {
      name: 'Essential',
      slug: 'design-visual-media-essential',
      description: 'Start with the visual craft shelves you are likely to open first on a real workstation.',
      recommended: true,
    },
    resources: [
      {
        id: 'graphicdesign.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Graphic Design Q&A',
        description: 'Typography, layout, branding, print prep, and design workflow discussion',
        url: 'https://download.kiwix.org/zim/stack_exchange/graphicdesign.stackexchange.com_en_all_2026-02.zim',
        size_mb: 884,
      },
      {
        id: 'photo.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Photography Q&A',
        description: 'Capture, lighting, lenses, editing, and practical camera problem-solving',
        url: 'https://download.kiwix.org/zim/stack_exchange/photo.stackexchange.com_en_all_2026-02.zim',
        size_mb: 431,
      },
    ],
  },
  {
    category: 'design-visual-media',
    tier: {
      name: 'Standard',
      slug: 'design-visual-media-standard',
      description: 'Bring in 3D production thinking and Blender-specific problem-solving. Includes Essential.',
      includesTier: 'design-visual-media-essential',
    },
    resources: [
      {
        id: 'blender.stackexchange.com_en_all',
        version: '2026-02',
        title: 'Blender Q&A',
        description: 'Modeling, shading, animation, rendering, and Blender workflow fixes',
        url: 'https://download.kiwix.org/zim/stack_exchange/blender.stackexchange.com_en_all_2026-02.zim',
        size_mb: 2662,
      },
    ],
  },
  {
    category: 'design-visual-media',
    tier: {
      name: 'Comprehensive',
      slug: 'design-visual-media-comprehensive',
      description: 'The heavier visual shelf for long sessions in 3D, art direction, and media study. Includes Standard.',
      includesTier: 'design-visual-media-standard',
    },
    resources: [
      {
        id: 'studio.blender.org_en_open-movies',
        version: '2026-03',
        title: 'Blender Studio Open Movies',
        description: 'Open-production films and behind-the-scenes assets from Blender Studio',
        url: 'https://download.kiwix.org/zim/videos/studio.blender.org_en_open-movies_2026-03.zim',
        size_mb: 374,
      },
      {
        id: 'ted_mul_design',
        version: '2026-01',
        title: 'TED: Design',
        description: 'A broad visual-thinking talk archive on design, objects, and creative direction',
        url: 'https://download.kiwix.org/zim/ted/ted_mul_design_2026-01.zim',
        size_mb: 6042,
      },
    ],
  },
  {
    category: 'travel-field-guides',
    tier: {
      name: 'Essential',
      slug: 'travel-field-guides-essential',
      description: 'Start with the compact region-level travel shelf.',
      recommended: true,
    },
    resources: [
      {
        id: 'wikivoyage_en_europe_nopic',
        version: '2026-03',
        title: 'Wikivoyage: Europe',
        description: 'An offline Europe travel guide with city notes, transit guidance, and route context',
        url: 'https://download.kiwix.org/zim/wikivoyage/wikivoyage_en_europe_nopic_2026-03.zim',
        size_mb: 67,
      },
    ],
  },
  {
    category: 'travel-field-guides',
    tier: {
      name: 'Standard',
      slug: 'travel-field-guides-standard',
      description: 'Move up to the broad world guide once the compact travel shelf is in place. Includes Essential.',
      includesTier: 'travel-field-guides-essential',
    },
    resources: [
      {
        id: 'wikivoyage_en_all_nopic',
        version: '2026-03',
        title: 'Wikivoyage: World Guide',
        description: 'Country, city, and route articles for a lightweight global travel reference',
        url: 'https://download.kiwix.org/zim/wikivoyage/wikivoyage_en_all_nopic_2026-03.zim',
        size_mb: 221,
      },
    ],
  },
  {
    category: 'travel-field-guides',
    tier: {
      name: 'Comprehensive',
      slug: 'travel-field-guides-comprehensive',
      description: 'The image-rich travel archive for machines with more storage to burn. Includes Standard.',
      includesTier: 'travel-field-guides-standard',
    },
    resources: [
      {
        id: 'wikivoyage_en_all_maxi',
        version: '2026-03',
        title: 'Wikivoyage: World Guide (With Images)',
        description: 'The broader travel guide with photos and richer article context left intact',
        url: 'https://download.kiwix.org/zim/wikivoyage/wikivoyage_en_all_maxi_2026-03.zim',
        size_mb: 1024,
      },
    ],
  },
  {
    category: 'dictionaries-primary-sources',
    tier: {
      name: 'Essential',
      slug: 'dictionaries-primary-sources-essential',
      description: 'Start with the compact wordbook before you pull the larger archives.',
      recommended: true,
    },
    resources: [
      {
        id: 'wiktionary_en_simple_all_nopic',
        version: '2026-01',
        title: 'Simple English Wiktionary',
        description: 'A lighter offline dictionary and word-reference shelf for fast lookup',
        url: 'https://download.kiwix.org/zim/wiktionary/wiktionary_en_simple_all_nopic_2026-01.zim',
        size_mb: 25,
      },
    ],
  },
  {
    category: 'dictionaries-primary-sources',
    tier: {
      name: 'Standard',
      slug: 'dictionaries-primary-sources-standard',
      description: 'Layer in the full dictionary and source-text shelf. Includes Essential.',
      includesTier: 'dictionaries-primary-sources-essential',
    },
    resources: [
      {
        id: 'wiktionary_en_all_nopic',
        version: '2026-02',
        title: 'English Wiktionary',
        description: 'A deep dictionary shelf with usage, etymology, and cross-language word notes',
        url: 'https://download.kiwix.org/zim/wiktionary/wiktionary_en_all_nopic_2026-02.zim',
        size_mb: 8397,
      },
      {
        id: 'wikisource_en_all_nopic',
        version: '2026-02',
        title: 'English Wikisource',
        description: 'Primary texts, public-domain books, speeches, and historical documents',
        url: 'https://download.kiwix.org/zim/wikisource/wikisource_en_all_nopic_2026-02.zim',
        size_mb: 11264,
      },
    ],
  },
  {
    category: 'dictionaries-primary-sources',
    tier: {
      name: 'Comprehensive',
      slug: 'dictionaries-primary-sources-comprehensive',
      description: 'Deep public-domain shelves for machines with serious storage headroom. Includes Standard.',
      includesTier: 'dictionaries-primary-sources-standard',
    },
    resources: [
      {
        id: 'gutenberg_en_lcc-q',
        version: '2026-03',
        title: 'Project Gutenberg: Science (LCC Q)',
        description: 'Public-domain science texts, manuals, and old technical writing grouped under LCC Q',
        url: 'https://download.kiwix.org/zim/gutenberg/gutenberg_en_lcc-q_2026-03.zim',
        size_mb: 17408,
      },
      {
        id: 'gutenberg_en_lcc-t',
        version: '2026-03',
        title: 'Project Gutenberg: Technology (LCC T)',
        description: 'Public-domain engineering and technology texts grouped under LCC T',
        url: 'https://download.kiwix.org/zim/gutenberg/gutenberg_en_lcc-t_2026-03.zim',
        size_mb: 12288,
      },
      {
        id: 'gutenberg_en_lcc-d',
        version: '2025-12',
        title: 'Project Gutenberg: History (LCC D)',
        description: 'Large historical archive of public-domain history material under LCC D',
        url: 'https://download.kiwix.org/zim/gutenberg/gutenberg_en_lcc-d_2025-12.zim',
        size_mb: 37888,
      },
      {
        id: 'gutenberg_en_lcc-n',
        version: '2026-03',
        title: 'Project Gutenberg: Fine Arts (LCC N)',
        description: 'Public-domain visual arts, design, and fine-arts writing under LCC N',
        url: 'https://download.kiwix.org/zim/gutenberg/gutenberg_en_lcc-n_2026-03.zim',
        size_mb: 21504,
      },
      {
        id: 'gutenberg_en_lcc-p',
        version: '2026-03',
        title: 'Project Gutenberg: Language Studies (LCC P)',
        description: 'Compact language and philology material grouped under LCC P',
        url: 'https://download.kiwix.org/zim/gutenberg/gutenberg_en_lcc-p_2026-03.zim',
        size_mb: 37,
      },
      {
        id: 'gutenberg_en_all',
        version: '2025-11',
        title: 'Project Gutenberg: Full English Mirror',
        description: 'The giant public-domain English shelf for machines that want the whole thing locally',
        url: 'https://download.kiwix.org/zim/gutenberg/gutenberg_en_all_2025-11.zim',
        size_mb: 210944,
      },
    ],
  },
]

for (const addition of tierAdds) {
  const category = upsertCategory(
    data,
    categoryDefinitions[addition.category] || data.categories.find((entry) => entry.slug === addition.category)
  )

  if (!category) continue

  const tier = upsertTier(category, { ...addition.tier, resources: [] })
  for (const resource of addition.resources) {
    upsertResource(tier, resource)
  }
}

const order = [
  'medicine',
  'survival',
  'education',
  'science-simulations',
  'diy',
  'maker-electronics',
  'agriculture',
  'computing',
  'machine-learning',
  'music-audio',
  'design-visual-media',
  'it-infrastructure',
  'travel-field-guides',
  'dictionaries-primary-sources',
]

const orderMap = new Map(order.map((slug, index) => [slug, index]))
data.categories.sort((a, b) => (orderMap.get(a.slug) ?? 999) - (orderMap.get(b.slug) ?? 999))

for (const category of data.categories) {
  const tierOrder = new Map(['essential', 'standard', 'comprehensive'].map((label, index) => [label, index]))
  category.tiers.sort((a, b) => {
    const aKey = a.slug.split('-').pop()
    const bKey = b.slug.split('-').pop()
    return (tierOrder.get(aKey) ?? 999) - (tierOrder.get(bKey) ?? 999)
  })
}

data.spec_version = '2026-04-05'
await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
console.log(`Updated ${file.pathname}`)
