import {describe, expect, test} from 'vitest'
import {schemaTypes} from '../index'
import {COLLECTIONS, SINGLETONS, SINGLETON_MENU, TITLES, structure} from '../../structure'
import {profile} from '../documents/profile'
import {about} from '../documents/about'
import {interfaceText} from '../documents/interface-text'
import {seo} from '../documents/seo'
import {tab} from '../documents/tab'
import {project} from '../documents/project'
import {skillCategory} from '../documents/skill-category'
import {skill} from '../documents/skill'

type Call = {method: string; args: unknown[]}
type FieldLike = {
  name: string
  type: string
  of?: {type: string}[]
  to?: {type: string}[]
  options?: {list?: {title: string; value: string}[]; hotspot?: boolean; accept?: string}
  fields?: FieldLike[]
  validation?: (rule: unknown) => unknown
}
type DocLike = {name: string; type: string; fields: FieldLike[]}

const docs = {profile, about, interfaceText, seo, tab, project, skillCategory, skill}
const fieldsOf = (t: unknown): FieldLike[] => (t as DocLike).fields
const field = (t: unknown, name: string): FieldLike => {
  const f = fieldsOf(t).find((x) => x.name === name)
  if (!f) throw new Error(`falta el campo ${name}`)
  return f
}

// Regla simulada: anota cada llamada encadenada para poder afirmar sobre ellas.
const calls = (v?: (rule: unknown) => unknown): Call[] => {
  const log: Call[] = []
  const chain: unknown = new Proxy(
    {},
    {
      get:
        (_t, method) =>
        (...args: unknown[]) => {
          log.push({method: String(method), args})
          return chain
        },
    },
  )
  v?.(chain)
  return log
}
const isRequired = (f: FieldLike) => calls(f.validation).some((c) => c.method === 'required')
const sig = (f: FieldLike) => [f.name, f.type]

describe('tabla de campos del spec', () => {
  test('los 4 singletons y las 4 colecciones existen con sus campos', () => {
    const expected: Record<string, string[][]> = {
      profile: [
        ['photo', 'image'],
        ['name', 'string'],
        ['profession', 'localeString'],
        ['socialLinks', 'array'],
        ['stats', 'array'],
        ['cvLabel', 'localeString'],
        ['cvEs', 'file'],
        ['cvEn', 'file'],
        ['whatsappPhone', 'string'],
        ['whatsappMessage', 'localeString'],
        ['messengerUrl', 'url'],
      ],
      about: [['paragraphs', 'array']],
      interfaceText: [
        ['levelBasic', 'localeString'],
        ['levelIntermediate', 'localeString'],
        ['levelAdvanced', 'localeString'],
        ['languageToggleLabel', 'localeString'],
        ['viewPlanLabel', 'localeString'],
        ['footerText', 'localeString'],
      ],
      seo: [
        ['title', 'localeString'],
        ['description', 'localeText'],
        ['keywords', 'localeString'],
        ['author', 'string'],
        ['siteName', 'localeString'],
        ['siteUrl', 'url'],
        ['ogImage', 'image'],
        ['themeColor', 'string'],
      ],
      tab: [
        ['key', 'string'],
        ['label', 'localeString'],
        ['order', 'number'],
        ['isDefault', 'boolean'],
      ],
      project: [
        ['title', 'localeString'],
        ['image', 'image'],
        ['alt', 'localeString'],
        ['driveUrl', 'url'],
        ['order', 'number'],
      ],
      skillCategory: [
        ['title', 'localeString'],
        ['order', 'number'],
      ],
      skill: [
        ['name', 'string'],
        ['level', 'string'],
        ['category', 'reference'],
        ['order', 'number'],
      ],
    }
    for (const [name, def] of Object.entries(docs)) {
      expect((def as DocLike).name).toBe(name)
      expect((def as DocLike).type).toBe('document')
      expect(fieldsOf(def).map(sig)).toEqual(expected[name])
      expect(schemaTypes.map((t) => t.name)).toContain(name)
    }
  })

  test('arrays e imágenes llevan los tipos internos del spec', () => {
    expect(field(profile, 'socialLinks').of?.map((o) => o.type)).toEqual(['socialLink'])
    expect(field(profile, 'stats').of?.map((o) => o.type)).toEqual(['stat'])
    expect(field(about, 'paragraphs').of?.map((o) => o.type)).toEqual(['localeText'])
    expect(field(profile, 'photo').fields?.map((f) => f.name)).toEqual(['alt'])
  })

  test('SINGLETONS contiene los 4 tipos de documento único', () => {
    expect([...SINGLETONS]).toEqual(['profile', 'about', 'interfaceText', 'seo'])
  })
})

describe('order', () => {
  test('las 4 colecciones tienen order obligatorio', () => {
    for (const def of [project, tab, skill, skillCategory]) {
      expect(field(def, 'order').type).toBe('number')
      expect(isRequired(field(def, 'order'))).toBe(true)
    }
  })
})

describe('tipos puntuales', () => {
  test('skill.name es string plano, no localeString', () => {
    expect(field(skill, 'name').type).toBe('string')
  })

  test('skill.level es lista cerrada basic/intermediate/advanced', () => {
    const f = field(skill, 'level')
    expect(f.options?.list?.map((o) => o.value)).toEqual(['basic', 'intermediate', 'advanced'])
    expect(isRequired(f)).toBe(true)
  })

  test('skill.category referencia skillCategory y es obligatoria', () => {
    const f = field(skill, 'category')
    expect(f.to?.map((t) => t.type)).toEqual(['skillCategory'])
    expect(isRequired(f)).toBe(true)
  })

  test('seo.siteName es localeString', () => {
    expect(field(seo, 'siteName').type).toBe('localeString')
  })

  test('project.alt es opcional y title obligatorio', () => {
    expect(isRequired(field(project, 'alt'))).toBe(false)
    expect(isRequired(field(project, 'title'))).toBe(true)
    expect(isRequired(field(project, 'image'))).toBe(true)
    expect(isRequired(field(project, 'driveUrl'))).toBe(true)
  })

  test('project.image activa el hotspot', () => {
    expect(field(project, 'image').options?.hotspot).toBe(true)
  })
})

describe('profile', () => {
  test('stats se valida a exactamente 3 elementos', () => {
    const c = calls(field(profile, 'stats').validation)
    expect(c).toContainEqual({method: 'length', args: [3]})
    expect(c.some((x) => x.method === 'required')).toBe(true)
    // min/max sueltos no bastan: un min(3) dejaría pasar un cuarto
    expect(c.some((x) => x.method === 'max' || x.method === 'min')).toBe(false)
  })

  test('socialLinks exige al menos 1', () => {
    const c = calls(field(profile, 'socialLinks').validation)
    expect(c).toContainEqual({method: 'min', args: [1]})
    expect(c.some((x) => x.method === 'required')).toBe(true)
  })

  test('los PDF del CV aceptan solo PDF', () => {
    for (const n of ['cvEs', 'cvEn']) {
      const f = field(profile, n)
      expect(f.options?.accept).toBe('application/pdf')
      expect(isRequired(f)).toBe(true)
    }
  })

  test('obligatorios y opcionales del spec', () => {
    for (const n of ['photo', 'name', 'cvEs', 'cvEn', 'whatsappPhone']) {
      expect(isRequired(field(profile, n)), n).toBe(true)
    }
    expect(isRequired(field(profile, 'messengerUrl'))).toBe(false)
  })
})

describe('tab', () => {
  test('key es una lista cerrada de about|projects|skills', () => {
    const f = field(tab, 'key')
    expect(f.options?.list?.map((o) => o.value)).toEqual(['about', 'projects', 'skills'])
    expect(isRequired(f)).toBe(true)
  })

  test('key rechaza cualquier valor fuera de la lista', () => {
    const c = calls(field(tab, 'key').validation)
    const valid = c.find((x) => x.method === 'valid')
    expect(valid?.args[0]).toEqual(['about', 'projects', 'skills'])
  })

  // Contexto simulado: `others` son las pestañas ya guardadas.
  type Tab = {key: string; isDefault?: boolean}
  const ctx = (others: Tab[], id = 'drafts.abc') => ({
    document: {_id: id},
    getClient: () => ({
      fetch: async (_q: string, params: {key?: string}) =>
        params.key !== undefined
          ? others.filter((o) => o.key === params.key).length
          : others.filter((o) => o.isDefault).length,
    }),
  })
  const customOf = (f: FieldLike) => {
    const c = calls(f.validation).find((x) => x.method === 'custom')
    if (!c) throw new Error('sin custom')
    return c.args[0] as (v: unknown, c: unknown) => Promise<true | string>
  }

  test('una segunda pestaña con key projects se rechaza', async () => {
    const check = customOf(field(tab, 'key'))
    expect(await check('projects', ctx([{key: 'projects'}]))).not.toBe(true)
  })

  test('una key aún no usada se acepta', async () => {
    const check = customOf(field(tab, 'key'))
    expect(await check('skills', ctx([{key: 'projects'}, {key: 'about'}]))).toBe(true)
  })

  test('el unique no se cuenta a sí mismo (borrador y publicado)', async () => {
    const check = customOf(field(tab, 'key'))
    let seen: {id?: string; draft?: string} = {}
    const client = {
      fetch: async (_q: string, p: {id?: string; draft?: string}) => {
        seen = p
        return 0
      },
    }
    await check('about', {document: {_id: 'drafts.abc'}, getClient: () => client})
    expect([seen.id, seen.draft].sort()).toEqual(['abc', 'drafts.abc'])
  })

  test('como máximo un tab es isDefault: error solo al marcar true habiendo otro true', async () => {
    const check = customOf(field(tab, 'isDefault'))
    expect(await check(true, ctx([{key: 'about', isDefault: true}]))).not.toBe(true)
    expect(await check(true, ctx([{key: 'about'}]))).toBe(true)
    // ninguno marcado es válido: el frontend cae al de menor order
    expect(await check(false, ctx([{key: 'about'}]))).toBe(true)
    expect(await check(undefined, ctx([{key: 'about'}]))).toBe(true)
    expect(await check(false, ctx([{key: 'about', isDefault: true}]))).toBe(true)
  })
})

describe('protección contra borrado', () => {
  test('sanity.config quita delete/duplicate/unpublish en singletons y en tab, y solo ahí', async () => {
    const {default: config} = await import('../../sanity.config')
    const actions = (
      config as unknown as {
        document: {
          actions: (input: {action?: string}[], ctx: {schemaType: string}) => {action?: string}[]
        }
      }
    ).document.actions
    const input = ['publish', 'delete', 'duplicate', 'unpublish', 'discardChanges'].map((action) => ({
      action,
    }))
    for (const type of ['profile', 'about', 'interfaceText', 'seo', 'tab']) {
      expect(actions(input, {schemaType: type}).map((a) => a.action)).toEqual([
        'publish',
        'discardChanges',
      ])
    }
    // una acción sin campo `action` (de un plugin futuro) se conserva
    expect(actions([...input, {}], {schemaType: 'tab'})).toHaveLength(3)
    for (const type of ['project', 'skill', 'skillCategory']) {
      expect(actions(input, {schemaType: type})).toHaveLength(5)
    }
  })
})

describe('plantillas de "Nuevo documento"', () => {
  test('se ocultan los singletons y tab, y solo esos', async () => {
    const {default: config} = await import('../../sanity.config')
    const templates = (
      config as unknown as {
        schema: {templates: (t: {schemaType: string}[]) => {schemaType: string}[]}
      }
    ).schema.templates
    const all = [...SINGLETONS, 'tab', 'project', 'skill', 'skillCategory'].map((schemaType) => ({
      schemaType,
    }))
    expect(templates(all).map((t) => t.schemaType)).toEqual(['project', 'skill', 'skillCategory'])
  })
})

describe('required() en el campo del documento, no solo dentro del objeto localizado', () => {
  const must: Record<string, [unknown, string[]]> = {
    profile: [profile, ['profession', 'cvLabel', 'whatsappMessage']],
    about: [about, ['paragraphs']],
    interfaceText: [
      interfaceText,
      ['levelBasic', 'levelIntermediate', 'levelAdvanced', 'languageToggleLabel', 'viewPlanLabel'],
    ],
    seo: [seo, ['title', 'description', 'keywords', 'siteName']],
    tab: [tab, ['label']],
    project: [project, ['title']],
    skillCategory: [skillCategory, ['title']],
  }
  test.each(Object.entries(must))('%s', (_n, [def, names]) => {
    for (const n of names) expect(isRequired(field(def, n)), n).toBe(true)
  })

  test('footerText queda opcional', () => {
    expect(isRequired(field(interfaceText, 'footerText'))).toBe(false)
  })

  test('about.paragraphs: el array pide min 1 y cada elemento es obligatorio', () => {
    expect(calls(field(about, 'paragraphs').validation)).toContainEqual({method: 'min', args: [1]})
    const member = field(about, 'paragraphs').of?.[0] as FieldLike
    expect(isRequired(member)).toBe(true)
  })

  test('todo localeString/localeText es obligatorio salvo project.alt e interfaceText.footerText', () => {
    for (const [name, def] of Object.entries(docs)) {
      for (const f of fieldsOf(def)) {
        if (f.type !== 'localeString' && f.type !== 'localeText') continue
        const optional =
          (name === 'project' && f.name === 'alt') ||
          (name === 'interfaceText' && f.name === 'footerText')
        expect(isRequired(f), `${name}.${f.name}`).toBe(!optional)
      }
    }
  })
})

describe('structure.ts', () => {
  test('SINGLETON_MENU es una permutación de SINGLETONS', () => {
    expect([...SINGLETON_MENU].sort()).toEqual([...SINGLETONS].sort())
  })

  test('SINGLETONS + COLLECTIONS cubren exactamente los tipos de documento del esquema', () => {
    const docTypes = schemaTypes.filter((t) => t.type === 'document').map((t) => t.name)
    expect([...SINGLETONS, ...COLLECTIONS].sort()).toEqual([...docTypes].sort())
  })

  test('TITLES repite el title de cada documento', () => {
    for (const t of schemaTypes.filter((x) => x.type === 'document')) {
      expect(TITLES[t.name], t.name).toBe(t.title)
    }
  })

  test('el menú lista singletons, un divisor y las colecciones ordenadas por order', () => {
    type Node = Record<string, unknown>
    const builder = (kind: string, data: Node = {}): Node => {
      const node: Node = {kind, ...data}
      for (const m of ['title', 'id', 'schemaType', 'documentId', 'defaultOrdering', 'child']) {
        node[m] = (v: unknown) => {
          node[m + 'Value'] = v
          return node
        }
      }
      return node
    }
    let items: Node[] = []
    const S = {
      list: () => {
        const l = builder('list')
        l.items = (i: Node[]) => {
          items = i
          return l
        }
        return l
      },
      listItem: () => builder('listItem'),
      document: () => builder('document'),
      divider: () => ({kind: 'divider'}),
      documentTypeListItem: (type: string) => builder('typeItem', {type}),
      documentTypeList: (type: string) => builder('typeList', {type}),
    }
    ;(structure as unknown as (s: unknown) => unknown)(S)

    const n = SINGLETON_MENU.length
    expect(items.slice(0, n).map((i) => i.idValue)).toEqual([...SINGLETON_MENU])
    for (const i of items.slice(0, n)) {
      const doc = i.childValue as Node
      expect(doc.documentIdValue).toBe(i.idValue)
      expect(doc.schemaTypeValue).toBe(i.idValue)
    }
    expect(items[n]).toEqual({kind: 'divider'})
    const cols = items.slice(n + 1)
    expect(cols.map((i) => i.type)).toEqual([...COLLECTIONS])
    for (const i of cols) {
      const list = i.childValue as Node
      expect(list.defaultOrderingValue).toEqual([{field: 'order', direction: 'asc'}])
    }
  })
})
