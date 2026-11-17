// Usage: PLAYWRIGHT_DIR=<dir with playwright installed> node capture.mjs <baseUrl> <outDir> [enPath]
// Defaults to production. enPath is appended to baseUrl for the -en shots (the Astro site takes the
// language from the URL and ignores localStorage, so pass 'en/' there; production needs nothing). Filenames: <width>-<theme>-<tab>-<lang>.png
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
const require = createRequire(process.env.PLAYWRIGHT_DIR + '/')
const { chromium } = require('playwright')
const base = process.argv[2] || 'https://ingefrenreyes.netlify.app/'
const out = process.argv[3] || 'docs/superpowers/notes/baseline'
const enPath = process.argv[4] || ''
mkdirSync(out, { recursive: true })

const combos = []
for (const w of [320, 576, 776, 968, 992, 1280]) combos.push([w, 'light', 'projects', 'es'])
for (const w of [320, 1280])
  for (const theme of ['light', 'dark'])
    for (const tab of ['about', 'projects', 'skills']) combos.push([w, theme, tab, 'es'])
for (const w of [320, 1280]) for (const tab of ['about', 'projects', 'skills']) combos.push([w, 'light', tab, 'en'])
const uniq = [...new Map(combos.map((c) => [c.join('-'), c])).values()]

const browser = await chromium.launch()
for (const [w, theme, tab, lang] of uniq) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 900 }, deviceScaleFactor: 1,
    reducedMotion: 'reduce', locale: lang === 'es' ? 'es-ES' : 'en-US',
  })
  const page = await ctx.newPage()
  await page.addInitScript(([t, l]) => {
    localStorage.setItem('selected-theme', t)
    localStorage.setItem('selected-icon', t === 'dark' ? 'ri-moon-line' : 'ri-sun-line')
    localStorage.setItem('selected-language', l)
  }, [theme, lang])
  const url = lang === 'en' ? base + enPath : base
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.reload({ waitUntil: 'networkidle' })
  // Wait for ScrollReveal to finish moving .filters (it starts translated -60px): clicking a moving
  // target can land on the CV button and leave the pointer hovering it.
  await page.waitForFunction(() => {
    const f = getComputedStyle(document.querySelector('.filters'))
    return f.opacity === '1' && (f.transform === 'none' || f.transform === 'matrix(1, 0, 0, 1, 0, 0)')
  }, null, { timeout: 10000 })
  await page.click(`.filters__button[data-target="#${tab}"]`)
  // Park the pointer in the top-left corner, off any content, so no :hover/transition shows up.
  await page.mouse.move(0, 0)
  await page.waitForTimeout(3500) // ScrollReveal (2500ms) + tab fade
  await page.screenshot({ path: `${out}/${w}-${theme}-${tab}-${lang}.png`, fullPage: true })
  console.log('ok', w, theme, tab, lang)
  await ctx.close()
}
await browser.close()
