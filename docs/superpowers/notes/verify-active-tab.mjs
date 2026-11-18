// Verifica en un navegador real que la pestaña abierta sobrevive al cambio de idioma.
//
// Uso: node verify-active-tab.mjs <dir de dist | URL>
//   node verify-active-tab.mjs web/dist                      # el build local
//   node verify-active-tab.mjs https://ingefrenreyes.netlify.app
//
// Necesita playwright instalado y resoluble desde este archivo. Con el código anterior al
// arreglo fallan exactamente las tres comprobaciones del cambio de idioma y ninguna otra;
// es la comprobación inversa que demuestra que la prueba no pasa en vacío.
import {createServer} from 'node:http'
import {createReadStream, existsSync, statSync} from 'node:fs'
import {extname, join, normalize} from 'node:path'
import {createRequire} from 'node:module'

const require = createRequire(import.meta.url)
const {chromium} = require('playwright')

const root = process.argv[2]
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.txt': 'text/plain',
}

const server = createServer((req, res) => {
  // decodeURIComponent lanza URIError con una secuencia mal formada (p. ej. /%E0%A4%A).
  // Sin este try el manejador propaga la excepción y tumba el proceso entero.
  let url
  try {
    url = decodeURIComponent(req.url.split('?')[0])
  } catch {
    res.writeHead(400)
    return res.end('ruta mal codificada')
  }
  let file = join(root, normalize(url).replace(/^(\.\.[/\\])+/, ''))
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) {
    res.writeHead(404)
    return res.end('no')
  }
  res.writeHead(200, {'content-type': TYPES[extname(file)] ?? 'application/octet-stream'})
  createReadStream(file).pipe(res)
})
let base = root
if (root.startsWith('http')) {
  base = root.replace(/\/$/, '')
} else {
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  base = `http://127.0.0.1:${server.address().port}`
}

const browser = await chromium.launch()
const page = await browser.newPage({viewport: {width: 1280, height: 900}})

// Astro quita el atributo ssr de <astro-island> al hidratar. Sin esperarlo, un clic
// cae en un botón todavía sin manejador y no hace nada (pasa con latencia de red).
const waitHydrated = () =>
  page.waitForFunction(() => !document.querySelector('astro-island[ssr]'), null, {timeout: 20000})

// Estado visible: qué panel está activo y en qué botón está la pastilla.
const state = () =>
  page.evaluate(() => ({
    lang: document.documentElement.lang,
    panel: document.querySelector('.filters__active[data-content]')?.id ?? null,
    pill: document.querySelector('.filters__button.filter-tab-active')?.dataset.target ?? null,
    pills: document.querySelectorAll('.filter-tab-active').length,
    panels: document.querySelectorAll('.filters__active[data-content]').length,
  }))

// Se registra DESPUÉS del script de la página, así que corre después de applyActiveTab:
// lo que vea aquí es lo que el navegador va a pintar, sin parpadeo intermedio.
const spyOnSwap = () =>
  page.evaluate(() => {
    window.__swaps = []
    document.addEventListener('astro:before-swap', (e) => {
      window.__swaps.push(e.newDocument.querySelector('.filters__active[data-content]')?.id ?? null)
    })
  })

// Por data-target, no por texto: las etiquetas las escribe Efren en Sanity y cambian.
const clickTab = async (key) => {
  await page.click(`.filters__button[data-target="#${key}"]`)
  await page.waitForTimeout(400) // el fundido dura 200 ms
}

const results = []
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  results.push({ok, name, got, want})
  console.log(`${ok ? '  OK  ' : ' FALLA'} ${name}`)
  if (!ok) console.log(`        esperado ${JSON.stringify(want)}\n        obtenido ${JSON.stringify(got)}`)
}

// ---------- es -> en, estando en Aptitudes ----------
await page.goto(`${base}/`, {waitUntil: 'load'})
await waitHydrated()
check('carga inicial: abre la pestaña por defecto', await state(), {
  lang: 'es', panel: 'projects', pill: '#projects', pills: 1, panels: 1,
})

await clickTab('skills')
check('clic en Aptitudes', await state(), {
  lang: 'es', panel: 'skills', pill: '#skills', pills: 1, panels: 1,
})

await spyOnSwap()
await page.click('#language-button')
await page.waitForFunction(() => document.documentElement.lang === 'en')
await waitHydrated()
await page.waitForTimeout(400)
check(
  'el documento entrante ya traía Aptitudes marcada (sin parpadeo)',
  await page.evaluate(() => window.__swaps),
  ['skills'],
)
check('es -> en: se mantiene en Aptitudes', await state(), {
  lang: 'en', panel: 'skills', pill: '#skills', pills: 1, panels: 1,
})
check('la dirección es la del otro idioma', new URL(page.url()).pathname, '/en/')

// ---------- en -> es, estando en Sobre mí ----------
await clickTab('about')
await spyOnSwap()
await page.click('#language-button')
await page.waitForFunction(() => document.documentElement.lang === 'es')
await waitHydrated()
await page.waitForTimeout(400)
check('en -> es: se mantiene en Sobre mí', await state(), {
  lang: 'es', panel: 'about', pill: '#about', pills: 1, panels: 1,
})

// ---------- recargar vuelve a la pestaña configurada ----------
await clickTab('skills')
await page.reload({waitUntil: 'load'})
await waitHydrated()
check('al recargar vuelve a la pestaña por defecto', await state(), {
  lang: 'es', panel: 'projects', pill: '#projects', pills: 1, panels: 1,
})

// ---------- entrar directo a /en/ ----------
await page.goto(`${base}/en/`, {waitUntil: 'load'})
await waitHydrated()
check('entrar directo a /en/ abre la pestaña por defecto', await state(), {
  lang: 'en', panel: 'projects', pill: '#projects', pills: 1, panels: 1,
})

// ---------- entrar directo a /en/ y de ahí cambiar a español ----------
// Importa que este caso NO pase por la raíz. El oyente se registra una sola vez al
// cargar y sobrevive a las navegaciones, así que entrando por / el cambio de idioma
// funcionaría igual aunque /en/ se hubiera publicado con el código anterior.
await clickTab('skills')
check('clic en Skills desde una carga directa en inglés', await state(), {
  lang: 'en', panel: 'skills', pill: '#skills', pills: 1, panels: 1,
})

await spyOnSwap()
await page.click('#language-button')
await page.waitForFunction(() => document.documentElement.lang === 'es')
await waitHydrated()
await page.waitForTimeout(400)
check(
  'entrando por /en/, el documento entrante ya traía Skills marcada',
  await page.evaluate(() => window.__swaps),
  ['skills'],
)
check('/en/ directo -> es: se mantiene en Skills', await state(), {
  lang: 'es', panel: 'skills', pill: '#skills', pills: 1, panels: 1,
})

// ---------- las pestañas siguen funcionando tras un cambio de idioma ----------
// Se viene del cambio de idioma de arriba, con Aptitudes abierta: el primer clic cae
// en la pestaña ya activa (que debe ser inocuo) y el segundo cambia de verdad.
await clickTab('skills')
await clickTab('about')
check('tras cambiar de idioma los clics siguen funcionando', await state(), {
  lang: 'es', panel: 'about', pill: '#about', pills: 1, panels: 1,
})

const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.reload({waitUntil: 'load'})
await waitHydrated()
await page.click('#language-button')
await page.waitForTimeout(600)
check('sin errores de JavaScript', errors, [])

await browser.close()
server.close()

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones pasan`)
process.exit(failed.length ? 1 : 0)
