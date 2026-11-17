import {describe, expect, it} from 'vitest'
import {ogLocale, otherLang, pathFor} from '../i18n'

describe('i18n', () => {
  it('pathFor("es") es "/" y pathFor("en") es "/en/"', () => {
    expect(pathFor('es')).toBe('/')
    expect(pathFor('en')).toBe('/en/')
  })
  it('ogLocale devuelve es_ES y en_US', () => {
    expect(ogLocale('es')).toBe('es_ES')
    expect(ogLocale('en')).toBe('en_US')
  })
  it('otherLang alterna', () => {
    expect(otherLang('es')).toBe('en')
    expect(otherLang('en')).toBe('es')
  })
})
