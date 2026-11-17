import {evaluate, parse} from 'groq-js'
import {describe, expect, it} from 'vitest'
import {ABOUT_QUERY, PROJECTS_QUERY, SEO_QUERY, SKILLS_QUERY, TABS_QUERY} from '../queries'

const run = async (query: string, dataset: unknown[], params: Record<string, unknown>) =>
  (await evaluate(parse(query, {params}), {dataset: dataset as any[], params})).get()

const project = (id: string, extra: Record<string, unknown> = {}) => ({
  _id: id,
  _type: 'project',
  title: {es: `T ${id}`, en: `T-en ${id}`},
  driveUrl: 'https://x',
  image: {_type: 'image'},
  order: 1,
  ...extra,
})

describe('PROJECTS_QUERY (fixtures)', () => {
  it('cae a español cuando falta la traducción en inglés', async () => {
    const [p] = (await run(PROJECTS_QUERY, [project('a', {title: {es: 'Casa'}})], {
      lang: 'en',
    })) as any[]
    expect(p.title).toBe('Casa')
  })

  it('project.alt cae a alt[$lang], luego title[$lang], luego title.es', async () => {
    const docs = [
      project('a', {order: 1, alt: {es: 'alt es', en: 'alt en'}}),
      project('b', {order: 2}),
      project('c', {order: 3, title: {es: 'Solo es'}}),
    ]
    const en = (await run(PROJECTS_QUERY, docs, {lang: 'en'})) as any[]
    expect(en.map((p) => p.alt)).toEqual(['alt en', 'T-en b', 'Solo es'])
    const es = (await run(PROJECTS_QUERY, docs, {lang: 'es'})) as any[]
    expect(es.map((p) => p.alt)).toEqual(['alt es', 'T b', 'Solo es'])
  })

  it('el orden es determinista con dos documentos de igual order', async () => {
    const forward = [project('b'), project('a'), project('c')]
    const ids = async (docs: unknown[]) =>
      ((await run(PROJECTS_QUERY, docs, {lang: 'es'})) as any[]).map((p) => p._id)
    expect(await ids(forward)).toEqual(['a', 'b', 'c'])
    expect(await ids([...forward].reverse())).toEqual(['a', 'b', 'c'])
  })
})

describe('TABS_QUERY (fixtures)', () => {
  it('el orden es determinista con dos pestañas de igual order', async () => {
    const tab = (id: string) => ({
      _id: id,
      _type: 'tab',
      key: id,
      label: {es: id, en: id},
      order: 1,
    })
    const ids = async (docs: unknown[]) =>
      ((await run(TABS_QUERY, docs, {lang: 'es'})) as any[]).map((t) => t._id)
    expect(await ids([tab('y'), tab('x')])).toEqual(['x', 'y'])
    expect(await ids([tab('x'), tab('y')])).toEqual(['x', 'y'])
  })
})

describe('SKILLS_QUERY (fixtures)', () => {
  const cat = (id: string, order: number) => ({
    _id: id,
    _type: 'skillCategory',
    title: {es: id, en: id},
    order,
  })
  const skill = (id: string, category: string, order = 1) => ({
    _id: id,
    _type: 'skill',
    name: id,
    level: 'basic',
    order,
    category: {_type: 'reference', _ref: category},
  })

  it('SKILLS_QUERY descarta la aptitud cuya referencia de categoría no resuelve', async () => {
    const out = (await run(
      SKILLS_QUERY,
      [cat('c1', 1), skill('s1', 'c1'), skill('huerfana', 'no-existe')],
      {lang: 'es'},
    )) as any[]
    expect(out).toHaveLength(1)
    expect(out[0].skills.map((s: any) => s._id)).toEqual(['s1'])
  })

  it('ordena aptitudes de igual order por _id', async () => {
    const docs = [cat('c1', 1), skill('s2', 'c1'), skill('s1', 'c1')]
    const out = (await run(SKILLS_QUERY, docs, {lang: 'es'})) as any[]
    expect(out[0].skills.map((s: any) => s._id)).toEqual(['s1', 's2'])
  })
})

describe('ABOUT_QUERY (fixtures)', () => {
  it('cae a español por párrafo cuando falta la traducción en inglés', async () => {
    const docs = [
      {
        _id: 'a',
        _type: 'about',
        paragraphs: [
          {_key: 'p1', es: 'Hola', en: 'Hello'},
          {_key: 'p2', es: 'Solo español'},
        ],
      },
    ]
    const en = (await run(ABOUT_QUERY, docs, {lang: 'en'})) as any
    expect(en.paragraphs.map((p: any) => p.text)).toEqual(['Hello', 'Solo español'])
    const es = (await run(ABOUT_QUERY, docs, {lang: 'es'})) as any
    expect(es.paragraphs.map((p: any) => p.text)).toEqual(['Hola', 'Solo español'])
  })
})

describe('SEO_QUERY (fixtures)', () => {
  it('cae a español campo por campo cuando falta la traducción en inglés', async () => {
    const docs = [
      {
        _id: 'seo',
        _type: 'seo',
        title: {es: 'Título', en: 'Title'},
        description: {es: 'Descripción'},
        keywords: {es: 'uno, dos'},
        siteName: {es: 'Sitio', en: 'Site'},
      },
    ]
    const en = (await run(SEO_QUERY, docs, {lang: 'en'})) as any
    expect(en).toMatchObject({
      title: 'Title',
      description: 'Descripción',
      keywords: 'uno, dos',
      siteName: 'Site',
    })
    const es = (await run(SEO_QUERY, docs, {lang: 'es'})) as any
    expect(es.title).toBe('Título')
  })
})
