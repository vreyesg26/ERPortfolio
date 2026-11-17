import {describe, expect, test} from 'vitest'
import {schemaTypes} from '../index'
import {localeString} from '../objects/locale-string'
import {localeText} from '../objects/locale-text'
import {socialLink} from '../objects/social-link'
import {stat} from '../objects/stat'

type FieldLike = {
  name: string
  type: string
  title?: string
  validation?: (rule: unknown) => unknown
}
type ObjectLike = {name: string; type: string; fields: FieldLike[]}

const fieldsOf = (t: unknown): FieldLike[] => (t as ObjectLike).fields
const field = (t: unknown, name: string): FieldLike | undefined =>
  fieldsOf(t).find((f) => f.name === name)

// Regla simulada: registra si se llamó a required() y deja encadenar el resto.
const isRequired = (f: FieldLike | undefined): boolean => {
  if (!f?.validation) return false
  let required = false
  const chain: unknown = new Proxy(
    {},
    {
      get: (_t, prop) => {
        if (prop === 'required') {
          return () => {
            required = true
            return chain
          }
        }
        return () => chain
      },
    },
  )
  f.validation(chain)
  return required
}

describe('localeString / localeText', () => {
  test.each([
    ['localeString', localeString, 'string'],
    ['localeText', localeText, 'text'],
  ])('%s tiene exactamente los campos es y en, los dos obligatorios', (name, def, kind) => {
    expect((def as ObjectLike).name).toBe(name)
    expect((def as ObjectLike).type).toBe('object')
    expect(fieldsOf(def).map((f) => f.name)).toEqual(['es', 'en'])
    expect(fieldsOf(def).map((f) => f.title)).toEqual(['Español', 'Inglés'])
    for (const f of fieldsOf(def)) {
      expect(f.type).toBe(kind)
      expect(isRequired(f)).toBe(true)
    }
  })

  test('localeText usa text y localeString usa string', () => {
    expect(field(localeString, 'es')?.type).toBe('string')
    expect(field(localeText, 'es')?.type).toBe('text')
  })
})

describe('stat', () => {
  test('value es string, no number', () => {
    expect(field(stat, 'value')?.type).toBe('string')
    expect(isRequired(field(stat, 'value'))).toBe(true)
  })

  test('label es localeText, no localeString', () => {
    expect(field(stat, 'label')?.type).toBe('localeText')
    expect(isRequired(field(stat, 'label'))).toBe(true)
  })

  test('no tiene más campos que value y label', () => {
    expect(fieldsOf(stat).map((f) => f.name)).toEqual(['value', 'label'])
  })
})

describe('socialLink', () => {
  test('exige name, icon y url, con los tipos del spec', () => {
    expect(fieldsOf(socialLink).map((f) => [f.name, f.type])).toEqual([
      ['name', 'string'],
      ['icon', 'string'],
      ['url', 'url'],
    ])
    for (const n of ['name', 'icon', 'url']) {
      expect(isRequired(field(socialLink, n))).toBe(true)
    }
  })
})

describe('registro', () => {
  test('los cuatro objetos están en schemaTypes', () => {
    const names = schemaTypes.map((t) => t.name)
    for (const n of ['localeString', 'localeText', 'socialLink', 'stat']) {
      expect(names).toContain(n)
    }
  })
})
