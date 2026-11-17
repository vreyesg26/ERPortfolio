import {describe, expect, it, vi} from 'vitest'
import {client} from '../sanity'
import {
  ABOUT_QUERY,
  INTERFACE_TEXT_QUERY,
  PROFILE_QUERY,
  PROJECTS_QUERY,
  SEO_QUERY,
  SKILLS_QUERY,
  TABS_QUERY,
} from '../queries'

// Contra el dataset real y público sembrado en la tarea 5. Sin token.
const params = {lang: 'es'}

// Red real: el límite por defecto de 5 s se agota de forma intermitente.
vi.setConfig({testTimeout: 30_000})

describe('queries contra el dataset real', () => {
  it('las 7 queries devuelven datos, no null ni []', async () => {
    const results = await Promise.all(
      [
        PROFILE_QUERY,
        ABOUT_QUERY,
        INTERFACE_TEXT_QUERY,
        SEO_QUERY,
        TABS_QUERY,
        PROJECTS_QUERY,
        SKILLS_QUERY,
      ].map((q) => client.fetch(q, params)),
    )
    for (const r of results) {
      expect(r).not.toBeNull()
      expect(Array.isArray(r) ? r.length : Object.keys(r!).length).toBeGreaterThan(0)
    }
    const [profile, about, ui, seo, tabs, projects, skills] = results as any[]
    const str = (v: unknown) => expect(typeof v).toBe('string')
    const filled = (v: unknown) => expect(v).toBeTruthy()
    // Un campo mal escrito se proyecta como null sin error: se asierta cada uno que otra tarea lee.
    str(profile.name)
    str(profile.profession)
    str(profile.cvLabel)
    expect(profile.cvUrl).toMatch(/^https:\/\/cdn\.sanity\.io\/files\//)
    expect(profile.stats).toHaveLength(3)
    for (const st of profile.stats) {
      str(st._key)
      str(st.value)
      str(st.label)
    }
    expect(profile.socialLinks.length).toBeGreaterThan(0)
    for (const l of profile.socialLinks) {
      str(l._key)
      str(l.name)
      str(l.icon)
      str(l.url)
    }
    filled(profile.whatsappPhone)
    str(profile.whatsappPhone)
    str(profile.whatsappMessage)
    str(profile.messengerUrl)
    expect(about.paragraphs.length).toBeGreaterThan(0)
    for (const para of about.paragraphs) {
      str(para._key)
      filled(para.text)
    }
    for (const k of [
      'levelBasic',
      'levelIntermediate',
      'levelAdvanced',
      'languageToggleLabel',
      'viewPlanLabel',
    ]) {
      filled(ui[k])
      str(ui[k])
    }
    // footerText es opcional y el dataset no lo trae: no se asierta.
    for (const k of ['title', 'description', 'keywords', 'author', 'siteName', 'siteUrl', 'themeColor']) {
      filled(seo[k])
      str(seo[k])
    }
    expect(seo.ogImage.asset._ref).toMatch(/^image-/)
    expect(tabs).toHaveLength(3)
    for (const tab of tabs) {
      str(tab._id)
      str(tab.label)
      expect(['about', 'projects', 'skills']).toContain(tab.key)
      expect(typeof tab.order).toBe('number')
      expect(typeof tab.isDefault).toBe('boolean')
    }
    for (const pr of projects) {
      str(pr._id)
      filled(pr.title)
      expect(pr.driveUrl).toMatch(/^https?:\/\//)
    }
    for (const cat of skills) {
      str(cat._id)
      filled(cat.title)
      for (const sk of cat.skills) {
        str(sk._id)
        filled(sk.name)
        expect(['basic', 'intermediate', 'advanced']).toContain(sk.level)
      }
    }
  })

  it('PROJECTS_QUERY con $lang "es" y "en" devuelve 11 proyectos con títulos distintos', async () => {
    const es = await client.fetch(PROJECTS_QUERY, {lang: 'es'})
    const en = await client.fetch(PROJECTS_QUERY, {lang: 'en'})
    expect(es).toHaveLength(11)
    expect(en).toHaveLength(11)
    expect(es.map((p) => p.title)).not.toEqual(en.map((p) => p.title))
    expect(es.map((p) => p._id)).toEqual(en.map((p) => p._id))
    for (const p of es) expect(typeof p.alt).toBe('string')
  })

  it('SKILLS_QUERY devuelve 2 categorías con 5 y 4 aptitudes', async () => {
    const cats = await client.fetch(SKILLS_QUERY, params)
    expect(cats).toHaveLength(2)
    expect(cats.map((c) => c.skills.length)).toEqual([5, 4])
  })

  it('las imágenes vuelven como objeto completo, no como asset->{_id,url}', async () => {
    const [p] = await client.fetch(PROJECTS_QUERY, params)
    expect(p.image._type).toBe('image')
    expect(p.image.asset?._ref).toMatch(/^image-/)
    expect((p.image.asset as any).url).toBeUndefined()
    const profile = await client.fetch(PROFILE_QUERY, params)
    expect(profile!.photo.asset?._ref).toMatch(/^image-/)
  })

  it('PROFILE_QUERY entrega el CV del idioma pedido', async () => {
    const es = await client.fetch(PROFILE_QUERY, {lang: 'es'})
    const en = await client.fetch(PROFILE_QUERY, {lang: 'en'})
    expect(es!.cvUrl).not.toBe(en!.cvUrl)
  })
})
