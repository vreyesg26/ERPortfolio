import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe, expect, test} from 'vitest'
import {assetPaths, documents} from '../content'

// Test de fidelidad: sin red. Lee el original como texto y comprueba que cada
// string de content.ts sea el del original, caracter por caracter.
const ROOT = resolve(__dirname, '../../../..')
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n')
const html = read('index.html')
const js = read('assets/js/main.js')

// Bloques de idioma del objeto translations.
const enStart = js.indexOf('    en: {')
const esStart = js.indexOf('    es: {')
const blocks = {en: js.slice(enStart, esStart), es: js.slice(esStart)}

const decode = (s: string) => s.replace(/\\(['"\\])/g, '$1')
// Valor exacto de una clave de translations en un idioma (comillas simples o dobles).
const tr = (lang: 'es' | 'en', key: string): string => {
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = blocks[lang].match(
    new RegExp(`'${esc}':\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`),
  )
  if (!m) throw new Error(`No existe la clave ${key} en ${lang}`)
  return decode(m[1] ?? m[2])
}
// Las leyendas llevan <br> en el original; en Sanity son saltos de linea reales.
const brToNewline = (s: string) => s.replace(/ <br> /g, '\n')

type Doc = Record<string, any>
const doc = (id: string): Doc => {
  const d = documents.find((x: Doc) => x._id === id)
  if (!d) throw new Error(`Falta el documento ${id}`)
  return d
}
const pair = (key: string) => ({es: brToNewline(tr('es', key)), en: brToNewline(tr('en', key))})

describe('fidelidad de content.ts con el original', () => {
  test('cada texto es/en de content.ts aparece literal en translations de main.js', () => {
    const profile = doc('profile')
    expect(profile.profession).toEqual(pair('profession'))
    expect(profile.cvLabel).toEqual(pair('cv'))
    expect(profile.whatsappMessage).toEqual(pair('whatsapp'))
    expect(profile.stats.map((s: Doc) => s.label)).toEqual([
      pair('info.years'),
      pair('info.projects'),
      pair('info.customers'),
    ])

    // Los items de array llevan _key y _type; el texto es lo que se compara.
    const bare = ({es, en}: Doc) => ({es, en})
    expect(doc('about').paragraphs.map(bare)).toEqual([1, 2, 3, 4].map((n) => pair(`about.p${n}`)))

    const iface = doc('interfaceText')
    expect(iface.levelIntermediate).toEqual(pair('level.intermediate'))
    expect(iface.levelAdvanced).toEqual(pair('level.advanced'))
    expect(iface.languageToggleLabel).toEqual(pair('language.label'))

    for (const [id, key] of [
      ['tab-about', 'tab.about'],
      ['tab-projects', 'tab.projects'],
      ['tab-skills', 'tab.skills'],
    ]) {
      expect(doc(id).label).toEqual(pair(key))
    }

    expect(doc('skill-category-design').title).toEqual(pair('skills.design'))
    // "Microsoft" no se traduce: esta en el HTML, igual en los dos idiomas.
    expect(html).toContain('<h3 class="skills__title">Microsoft</h3>')
    expect(doc('skill-category-microsoft').title).toEqual({es: 'Microsoft', en: 'Microsoft'})

    for (let n = 1; n <= 11; n++) {
      const p = doc(`project-${n}`)
      expect(p.title).toEqual(pair(`plan${n}.title`))
      expect(p.alt).toEqual(pair(`plan${n}.alt`))
    }

    expect(doc('seo').title).toEqual(pair('page.title'))
  })

  test('los textos en espanol que solo viven en index.html aparecen literales ahi', () => {
    const seo = doc('seo')
    for (const v of [seo.description.es, seo.keywords.es, seo.siteName.es, seo.title.es]) {
      expect(html).toContain(`"${v}"`)
    }
    expect(html).toContain(`name="author" content="${seo.author}"`)
    expect(html).toContain(`property="og:url" content="${seo.siteUrl}"`)
    expect(html).toContain(`name="theme-color" content="${seo.themeColor}"`)

    const profile = doc('profile')
    // El texto de WhatsApp en espanol de index.html coincide con el de main.js.
    expect(html).toContain(`text=${profile.whatsappMessage.es}`)
    expect(html).toContain(`<h2 class="profile__name">${profile.name}</h2>`)
    expect(html).toContain(`href="${profile.messengerUrl}"`)
    for (const s of profile.socialLinks) {
      expect(html).toContain(`href="${s.url}"`)
      expect(html).toContain(`<i class="${s.icon}"></i>`)
    }
    expect(profile.socialLinks.map((s: Doc) => s.icon)).toEqual([
      'ri-instagram-line',
      'ri-linkedin-box-line',
      'ri-facebook-box-line',
    ])
    for (const s of profile.stats) {
      expect(html).toContain(`<h3 class="profile__info-number">${s.value}</h3>`)
    }
    // main.js guarda el telefono con "+"; el schema lo pide solo con digitos.
    expect(js).toContain(`const whatsappNumber = '+${profile.whatsappPhone}'`)
  })

  test('las 11 driveUrl aparecen literales en index.html, en el orden del original', () => {
    const urls = [...html.matchAll(/href="(https:\/\/drive\.google\.com[^"]*)"/g)].map((m) => m[1])
    expect(urls).toHaveLength(11)
    const mine = Array.from({length: 11}, (_, i) => doc(`project-${i + 1}`).driveUrl)
    expect(mine).toEqual(urls)
  })

  test('cada proyecto N usa projectN.webp y los PDF son los de cvFiles', () => {
    for (let n = 1; n <= 11; n++) {
      expect(doc(`project-${n}`).image.__file).toBe(`assets/img/plans/project${n}.webp`)
      expect(html).toContain(`src="assets/img/plans/project${n}.webp"`)
    }
    const profile = doc('profile')
    expect(profile.photo.__file).toBe('assets/img/profile.webp')
    expect(js).toContain(`en: '${profile.cvEn.__file}'`)
    expect(js).toContain(`es: '${profile.cvEs.__file}'`)
    expect(assetPaths).toHaveLength(14)
    expect(new Set(assetPaths).size).toBe(14)
  })

  test('las aptitudes salen del HTML: nombre, nivel y categoria', () => {
    const areas = html.split('<div class="skills__area">').slice(1)
    expect(areas).toHaveLength(2)
    const expected: {name: string; level: string; category: string}[] = []
    const catIds = ['skill-category-design', 'skill-category-microsoft']
    areas.forEach((area, i) => {
      for (const m of area.matchAll(
        /skills__name">([^<]+)<\/h3>\s*<span class="skills__level" data-i18n="level\.(\w+)"/g,
      )) {
        expected.push({name: m[1], level: m[2], category: catIds[i]})
      }
    })
    const skills = documents.filter((d: Doc) => d._type === 'skill') as Doc[]
    const sorted = [...skills].sort((a, b) => a.order - b.order)
    expect(sorted.map((s) => ({name: s.name, level: s.level, category: s.category._ref}))).toEqual(
      expected,
    )
  })

  test('las tres pestanas siguen el orden del HTML y solo projects es la inicial', () => {
    const keys = [...html.matchAll(/data-target="#(\w+)"/g)].map((m) => m[1])
    expect(keys).toEqual(['about', 'projects', 'skills'])
    const tabs = documents.filter((d: Doc) => d._type === 'tab') as Doc[]
    expect([...tabs].sort((a, b) => a.order - b.order).map((t) => t.key)).toEqual(keys)
    expect(tabs.filter((t) => t.isDefault).map((t) => t.key)).toEqual(['projects'])
  })

  test('los recuentos son 11 proyectos, 9 aptitudes, 2 categorias, 3 pestanas, 3 stats, 4 parrafos', () => {
    const count = (t: string) => documents.filter((d: Doc) => d._type === t).length
    expect(count('project')).toBe(11)
    expect(count('skill')).toBe(9)
    expect(count('skillCategory')).toBe(2)
    expect(count('tab')).toBe(3)
    expect(doc('profile').stats).toHaveLength(3)
    expect(doc('about').paragraphs).toHaveLength(4)
    expect(documents).toHaveLength(29)
    expect(new Set(documents.map((d: Doc) => d._id)).size).toBe(29)
  })

  test('los singletons tienen _id igual a su tipo', () => {
    for (const t of ['profile', 'about', 'interfaceText', 'seo']) expect(doc(t)._type).toBe(t)
  })

  test('las leyendas de stat llevan saltos de linea reales, nunca HTML', () => {
    for (const s of doc('profile').stats) {
      for (const lang of ['es', 'en']) {
        expect(s.label[lang]).toMatch(/^[^\n]+\n[^\n]+$/)
        expect(s.label[lang]).not.toMatch(/<|>/)
      }
    }
  })

  test('ningun idioma queda vacio ni con espacios sobrantes', () => {
    const walk = (v: unknown, path: string) => {
      if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`))
      if (v && typeof v === 'object') {
        const o = v as Doc
        if ('es' in o && 'en' in o) {
          for (const l of ['es', 'en']) {
            expect(typeof o[l], `${path}.${l}`).toBe('string')
            expect(o[l].trim(), `${path}.${l}`).toBe(o[l])
            expect(o[l].length, `${path}.${l}`).toBeGreaterThan(0)
          }
        }
        for (const [k, x] of Object.entries(o)) walk(x, `${path}.${k}`)
      }
    }
    documents.forEach((d: Doc) => walk(d, d._id))
  })

  test('el copy de SEO en ingles es el aprobado en el spec', () => {
    const seo = doc('seo')
    expect(seo.title.en).toBe('Civil Engineer - Efren Reyes | Portfolio')
    expect(seo.siteName.en).toBe('Efren Reyes - Civil Engineer')
    expect(seo.description.en).toBe(
      'Civil Engineer from Honduras. Drafting, terrain modeling and quantity takeoffs in AutoCAD and Civil 3D for engineering firms and contractors.',
    )
    expect(seo.keywords.en).toBe(
      'Civil Engineer, Civil Engineering Drafting, AutoCAD, Civil 3D, Road Design, Earthwork, Quantity Takeoff, Infrastructure, Honduras, Efren Reyes',
    )
  })

  // Sin original contra el que comparar: el spec los da como valores nuevos.
  test('los textos sin origen (nivel Basico, ver plano) son los fijados', () => {
    const iface = doc('interfaceText')
    expect(iface.levelBasic).toEqual({es: 'Básico', en: 'Basic'})
    expect(iface.viewPlanLabel).toEqual({es: 'Ver plano', en: 'View drawing'})
    expect(iface.footerText).toBeUndefined()
  })
})
