#!/usr/bin/env node

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const catalogPath = path.join(repoRoot, 'app-store-catalog.json')
const outputDir = path.join(repoRoot, 'assets', 'app-icons')

const palettes = {
  blue: {
    from: '#08111D',
    to: '#153C70',
    glow: '#74F4FF',
    edge: '#CDE6FF',
    ink: '#F5FAFF',
    band: '#86D0FF',
  },
  cyan: {
    from: '#07151A',
    to: '#0F4957',
    glow: '#7CF9F3',
    edge: '#D0FFFC',
    ink: '#F5FFFF',
    band: '#7CF9F3',
  },
  green: {
    from: '#08150E',
    to: '#164C2F',
    glow: '#73FFA8',
    edge: '#D9FFE8',
    ink: '#F7FFFA',
    band: '#73FFA8',
  },
  gold: {
    from: '#191106',
    to: '#5F4212',
    glow: '#FFCC73',
    edge: '#FFF0D0',
    ink: '#FFF9F0',
    band: '#FFCC73',
  },
  bronze: {
    from: '#160F0D',
    to: '#5A3020',
    glow: '#F3A574',
    edge: '#FFE0D1',
    ink: '#FFF8F4',
    band: '#F3A574',
  },
  violet: {
    from: '#120A1D',
    to: '#3F2575',
    glow: '#BC9CFF',
    edge: '#EEE5FF',
    ink: '#FAF7FF',
    band: '#C9A8FF',
  },
  magenta: {
    from: '#180813',
    to: '#6F1858',
    glow: '#FF86E1',
    edge: '#FFE2F7',
    ink: '#FFF8FD',
    band: '#FF86E1',
  },
}

function xml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function paletteFor(accent) {
  return palettes[accent] || palettes.blue
}

function familyMarkup(family, palette) {
  const stroke = palette.glow
  const edge = palette.edge
  const ink = palette.ink

  switch (family) {
    case 'maps':
      return `
        <rect x="128" y="134" width="256" height="212" rx="34" fill="rgba(255,255,255,0.05)" stroke="${edge}" stroke-width="10"/>
        <path d="M172 170H340" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <path d="M172 240H340" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <path d="M172 310H340" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <path d="M192 154V330" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <path d="M256 154V330" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <path d="M320 154V330" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="256" cy="240" r="28" fill="#09131C" stroke="${edge}" stroke-width="10"/>
      `
    case 'medicine':
      return `
        <circle cx="256" cy="244" r="88" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M256 178V310" stroke="${stroke}" stroke-width="22" stroke-linecap="round"/>
        <path d="M190 244H322" stroke="${stroke}" stroke-width="22" stroke-linecap="round"/>
      `
    case 'survival':
      return `
        <path d="M256 142L340 174V242C340 300 308 350 256 384C204 350 172 300 172 242V174L256 142Z" fill="rgba(255,255,255,0.05)" stroke="${edge}" stroke-width="10"/>
        <path d="M222 242L248 270L296 214" stroke="${stroke}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      `
    case 'education':
      return `
        <path d="M148 188C148 170 162 156 180 156H252C274 156 292 170 300 188V336C292 320 274 308 252 308H180C162 308 148 322 148 340V188Z" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M364 188C364 170 350 156 332 156H260C238 156 220 170 212 188V336C220 320 238 308 260 308H332C350 308 364 322 364 340V188Z" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M256 164V332" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
      `
    case 'science':
      return `
        <circle cx="256" cy="244" r="24" fill="${ink}" opacity="0.92"/>
        <ellipse cx="256" cy="244" rx="106" ry="42" stroke="${stroke}" stroke-width="10"/>
        <ellipse cx="256" cy="244" rx="106" ry="42" transform="rotate(60 256 244)" stroke="${edge}" stroke-width="10"/>
        <ellipse cx="256" cy="244" rx="106" ry="42" transform="rotate(120 256 244)" stroke="${stroke}" stroke-width="10"/>
      `
    case 'kids':
      return `
        <path d="M256 148L282 206H346L294 242L314 304L256 268L198 304L218 242L166 206H230L256 148Z" fill="rgba(255,255,255,0.06)" stroke="${edge}" stroke-width="10" stroke-linejoin="round"/>
        <circle cx="222" cy="244" r="10" fill="${stroke}"/>
        <circle cx="290" cy="244" r="10" fill="${stroke}"/>
        <path d="M220 284C236 300 276 300 292 284" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
      `
    case 'courses':
      return `
        <rect x="148" y="154" width="216" height="152" rx="24" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M202 344H310" stroke="${stroke}" stroke-width="16" stroke-linecap="round"/>
        <path d="M256 306V344" stroke="${edge}" stroke-width="12" stroke-linecap="round"/>
        <path d="M230 198L298 230L230 262V198Z" fill="${stroke}"/>
      `
    case 'math':
      return `
        <path d="M180 170H332" stroke="${edge}" stroke-width="12" stroke-linecap="round"/>
        <path d="M188 176L256 244L188 312H332" stroke="${stroke}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="328" cy="176" r="10" fill="${stroke}"/>
        <circle cx="328" cy="312" r="10" fill="${stroke}"/>
      `
    case 'civic':
      return `
        <path d="M164 192L256 152L348 192" fill="rgba(255,255,255,0.03)" stroke="${edge}" stroke-width="10" stroke-linejoin="round"/>
        <path d="M182 206V320" stroke="${stroke}" stroke-width="16" stroke-linecap="round"/>
        <path d="M230 206V320" stroke="${stroke}" stroke-width="16" stroke-linecap="round"/>
        <path d="M282 206V320" stroke="${stroke}" stroke-width="16" stroke-linecap="round"/>
        <path d="M330 206V320" stroke="${stroke}" stroke-width="16" stroke-linecap="round"/>
        <path d="M152 332H360" stroke="${edge}" stroke-width="12" stroke-linecap="round"/>
      `
    case 'language':
      return `
        <path d="M164 182C164 162 180 146 200 146H312C332 146 348 162 348 182V264C348 284 332 300 312 300H242L202 340V300H200C180 300 164 284 164 264V182Z" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M210 198H302" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <path d="M210 238H278" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
      `
    case 'repair':
      return `
        <path d="M212 168C224 182 226 200 218 216L296 294C312 286 330 288 344 300C362 316 366 344 352 362C338 380 308 382 290 366C278 354 274 338 278 322L200 244C184 252 166 250 152 238C134 222 130 194 144 176C158 158 188 156 206 172L176 202L208 234L238 204L212 168Z" fill="rgba(255,255,255,0.05)" stroke="${edge}" stroke-width="10" stroke-linejoin="round"/>
      `
    case 'maker':
      return `
        <rect x="170" y="160" width="172" height="172" rx="28" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M214 126V160M256 126V160M298 126V160M214 332V366M256 332V366M298 332V366M136 204H170M136 246H170M136 288H170M342 204H376M342 246H376M342 288H376" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <rect x="218" y="208" width="76" height="76" rx="18" fill="#09131C" stroke="${stroke}" stroke-width="10"/>
      `
    case 'agriculture':
      return `
        <path d="M256 148C310 176 340 222 340 278C340 332 302 370 256 388C210 370 172 332 172 278C172 222 202 176 256 148Z" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M256 182V334" stroke="${stroke}" stroke-width="14" stroke-linecap="round"/>
        <path d="M256 232C218 228 198 206 190 186" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <path d="M256 270C294 266 314 244 322 224" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
      `
    case 'finance':
      return `
        <circle cx="210" cy="250" r="48" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <circle cx="302" cy="214" r="34" fill="rgba(255,255,255,0.03)" stroke="${stroke}" stroke-width="10"/>
        <path d="M188 326H324" stroke="${stroke}" stroke-width="16" stroke-linecap="round"/>
        <path d="M210 232V268M196 250H224" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
      `
    case 'development':
      return `
        <rect x="146" y="150" width="220" height="184" rx="28" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M214 210L180 244L214 278" stroke="${stroke}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M298 210L332 244L298 278" stroke="${stroke}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M270 194L242 296" stroke="${edge}" stroke-width="12" stroke-linecap="round"/>
      `
    case 'ml':
      return `
        <circle cx="188" cy="198" r="14" fill="${stroke}"/>
        <circle cx="324" cy="190" r="14" fill="${edge}"/>
        <circle cx="184" cy="304" r="14" fill="${edge}"/>
        <circle cx="316" cy="304" r="14" fill="${stroke}"/>
        <circle cx="256" cy="248" r="20" fill="${ink}" opacity="0.92"/>
        <path d="M202 208L238 234M274 236L310 204M202 294L238 262M274 260L302 292M256 228V208M256 268V288" stroke="${stroke}" stroke-width="10" stroke-linecap="round"/>
      `
    case 'systems':
      return `
        <rect x="136" y="160" width="240" height="152" rx="24" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M170 206H342M170 244H342M170 282H280" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <path d="M202 352H310" stroke="${edge}" stroke-width="14" stroke-linecap="round"/>
      `
    case 'security':
      return `
        <path d="M256 150L340 182V242C340 306 304 356 256 386C208 356 172 306 172 242V182L256 150Z" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10" stroke-linejoin="round"/>
        <rect x="214" y="228" width="84" height="72" rx="18" fill="#09131C" stroke="${stroke}" stroke-width="10"/>
        <path d="M230 228V212C230 197 242 184 256 184C270 184 282 197 282 212V228" stroke="${edge}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="256" cy="262" r="10" fill="${stroke}"/>
        <path d="M256 272V292" stroke="${stroke}" stroke-width="10" stroke-linecap="round"/>
      `
    case 'audio':
      return `
        <path d="M160 246C178 246 184 204 202 204C220 204 226 290 244 290C262 290 268 176 286 176C304 176 310 314 328 314C346 314 352 230 352 230" stroke="${stroke}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="144" y="164" width="224" height="164" rx="30" fill="none" stroke="${edge}" stroke-width="10"/>
      `
    case 'design':
      return `
        <circle cx="198" cy="206" r="48" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <rect x="246" y="170" width="96" height="96" rx="24" fill="rgba(255,255,255,0.04)" stroke="${stroke}" stroke-width="10"/>
        <path d="M212 320L296 320L338 244" stroke="${stroke}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
      `
    case 'infrastructure':
      return `
        <rect x="164" y="154" width="184" height="62" rx="18" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <rect x="164" y="228" width="184" height="62" rx="18" fill="rgba(255,255,255,0.04)" stroke="${stroke}" stroke-width="10"/>
        <rect x="164" y="302" width="184" height="46" rx="18" fill="rgba(255,255,255,0.03)" stroke="${edge}" stroke-width="10"/>
        <circle cx="198" cy="185" r="8" fill="${stroke}"/>
        <circle cx="198" cy="259" r="8" fill="${edge}"/>
        <circle cx="198" cy="325" r="8" fill="${stroke}"/>
      `
    case 'travel':
      return `
        <path d="M256 150C308 150 350 192 350 244C350 310 282 368 256 386C230 368 162 310 162 244C162 192 204 150 256 150Z" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <circle cx="256" cy="244" r="34" fill="#09131C" stroke="${stroke}" stroke-width="10"/>
      `
    case 'culture':
      return `
        <path d="M174 184H338C354 184 366 196 366 212V250C366 266 354 278 338 278H270L234 314V278H174C158 278 146 266 146 250V212C146 196 158 184 174 184Z" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M194 228H316" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <path d="M194 248H286" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
      `
    case 'homestead':
      return `
        <path d="M168 224L256 154L344 224V348H280V286H232V348H168V224Z" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10" stroke-linejoin="round"/>
        <path d="M314 170C330 170 344 184 344 200C344 222 322 236 304 250C286 236 264 222 264 200C264 184 278 170 294 170C302 170 309 174 314 180C319 174 326 170 334 170Z" fill="${stroke}"/>
      `
    case 'library':
      return `
        <rect x="166" y="154" width="56" height="188" rx="18" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <rect x="228" y="132" width="56" height="210" rx="18" fill="rgba(255,255,255,0.04)" stroke="${stroke}" stroke-width="10"/>
        <rect x="290" y="170" width="56" height="172" rx="18" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
      `
    case 'wikipedia':
      return `
        <circle cx="256" cy="240" r="102" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M194 186L222 294L256 214L290 294L318 186" stroke="${stroke}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
      `
    case 'models':
      return `
        <path d="M188 214C188 182 214 156 246 156H266C298 156 324 182 324 214V286C324 318 298 344 266 344H246C214 344 188 318 188 286V214Z" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <circle cx="228" cy="236" r="14" fill="${stroke}"/>
        <circle cx="284" cy="236" r="14" fill="${stroke}"/>
        <path d="M226 294C240 310 272 310 286 294" stroke="${stroke}" stroke-width="12" stroke-linecap="round"/>
        <path d="M214 156L196 126M298 156L316 126" stroke="${edge}" stroke-width="10" stroke-linecap="round"/>
      `
    default:
      return `
        <circle cx="256" cy="240" r="92" fill="rgba(255,255,255,0.04)" stroke="${edge}" stroke-width="10"/>
        <path d="M198 240H314" stroke="${stroke}" stroke-width="16" stroke-linecap="round"/>
      `
  }
}

function buildIconSvg(item) {
  const palette = paletteFor(item.accent)
  const family = item.iconFamily || 'general'
  const band = xml(item.iconBand || item.category || 'RoachNet')
  const mono = xml(item.iconMonogram || 'RN')
  const title = xml(item.title || 'RoachNet')

  return `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} icon">
  <defs>
    <linearGradient id="bg" x1="56" y1="56" x2="456" y2="456" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.from}"/>
      <stop offset="1" stop-color="${palette.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 152) rotate(52) scale(282 282)">
      <stop stop-color="${palette.glow}" stop-opacity="0.28"/>
      <stop offset="1" stop-color="${palette.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="22" y="22" width="468" height="468" rx="106" fill="url(#bg)"/>
  <rect x="22" y="22" width="468" height="468" rx="106" fill="url(#glow)"/>
  <rect x="42" y="42" width="428" height="428" rx="90" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
  ${familyMarkup(family, palette)}
  <rect x="82" y="74" width="168" height="42" rx="21" fill="rgba(7,10,16,0.64)" stroke="rgba(255,255,255,0.10)" stroke-width="2"/>
  <text x="100" y="101" fill="${palette.band}" font-family="Inter, SF Pro Display, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="0.18em">${band}</text>
  <rect x="322" y="368" width="108" height="62" rx="22" fill="rgba(7,10,16,0.72)" stroke="rgba(255,255,255,0.11)" stroke-width="2"/>
  <text x="376" y="408" text-anchor="middle" fill="${palette.ink}" font-family="JetBrains Mono, SF Mono, monospace" font-size="28" font-weight="700" letter-spacing="0.12em">${mono}</text>
</svg>`
}

async function main() {
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
  const items = Array.isArray(catalog.items) ? catalog.items : []

  await rm(outputDir, { recursive: true, force: true })
  await mkdir(outputDir, { recursive: true })

  for (const item of items) {
    const target = path.join(outputDir, `${item.id}.svg`)
    await writeFile(target, buildIconSvg(item), 'utf8')
  }

  console.log(`Generated ${items.length} SVG app icons in ${path.relative(repoRoot, outputDir)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
