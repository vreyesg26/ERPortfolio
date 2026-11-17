import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe, expect, test} from 'vitest'
import {documents} from '../content'
import {draftWarning, findExisting, refusalMessage, type QueryFn} from '../guard'

// Dataset simulado: solo devuelve lo que existe, y respeta _id in $ids.
const fakeDataset =
  (stored: string[]): QueryFn =>
  async (_groq, params) =>
    stored.filter((id) => (params.ids as string[]).includes(id)).map((_id) => ({_id}))

const ids = documents.map((d) => d._id)

describe('guarda de seed.ts', () => {
  test('dataset vacio: no encuentra nada', async () => {
    expect(await findExisting(ids, fakeDataset([]))).toEqual({published: [], drafts: []})
  })

  test('un documento que solo existe como drafts.<id> dispara la guarda', async () => {
    const found = await findExisting(ids, fakeDataset(['drafts.profile']))
    expect(found.published).toEqual([])
    expect(found.drafts).toEqual(['drafts.profile'])
    expect(refusalMessage(found)).toContain('drafts.profile')
    expect(refusalMessage(found)).toContain('--force')
    expect(refusalMessage(found)).toContain('sobrescribe las ediciones hechas en el Studio')
  })

  test('publicados y borradores se separan; ids ajenos se ignoran', async () => {
    const found = await findExisting(ids, fakeDataset(['seo', 'drafts.project-3', 'otro-doc']))
    expect(found).toEqual({published: ['seo'], drafts: ['drafts.project-3']})
  })

  test('con --force el aviso lista los borradores que no se borran', async () => {
    const msg = draftWarning({published: ['seo'], drafts: ['drafts.seo', 'drafts.about']})
    expect(msg).toContain('drafts.seo')
    expect(msg).toContain('drafts.about')
    expect(msg).toContain('NO borra')
  })

  test('la consulta real fija perspective=raw, no el valor por defecto de la API', () => {
    const api = readFileSync(resolve(import.meta.dirname, '../sanity-api.ts'), 'utf8')
    expect(api).toContain('perspective=raw')
  })
})
