// Usage: PLAYWRIGHT_DIR=<dir with playwright installed> node capture.mjs <baseUrl> <outDir>
// Defaults to production. Filenames: <width>-<theme>-<tab>-<lang>.png
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
const require = createRequire(process.env.PLAYWRIGHT_DIR + '/')
const { chromium } = require('playwright')
const base = process.argv[2] || 'https://ingefrenreyes.netlify.app/'
const out = process.argv[3] || 'docs/superpowers/notes/baseline'
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
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.reload({ waitUntil: 'networkidle' })
  await page.click(`.filters__button[data-target="#${tab}"]`)
  await page.waitForTimeout(3500) // ScrollReveal (2500ms) + tab fade
  await page.screenshot({ path: `${out}/${w}-${theme}-${tab}-${lang}.png`, fullPage: true })
  console.log('ok', w, theme, tab, lang)
  await ctx.close()
}
await browser.close()
