import {describe, expect, it} from 'vitest'
import {imageAlt, imageUrl} from '../image'

const raster = {
  _type: 'image' as const,
  asset: {_type: 'reference' as const, _ref: 'image-abc123-800x600-jpg'},
}
const svg = {
  _type: 'image' as const,
  asset: {_type: 'reference' as const, _ref: 'image-abc123-120x120-svg'},
}

describe('imageUrl', () => {
  it('devuelve undefined cuando el asset es null, para que el src se omita', () => {
    expect(imageUrl(null, 400)).toBeUndefined()
    expect(imageUrl(undefined, 400)).toBeUndefined()
    expect(imageUrl({_type: 'image'}, 400)).toBeUndefined()
    expect(imageUrl({_type: 'image', asset: undefined}, 400)).toBeUndefined()
  })

  it('sirve los SVG tal cual, sin parámetros de transformación', () => {
    const url = imageUrl(svg, 400)!
    expect(url).toMatch(/abc123-120x120\.svg$/)
    expect(url).not.toContain('?')
  })

  it('aplica el ancho pedido y auto=format a los raster', () => {
    const url = imageUrl(raster, 400)!
    expect(url).toContain('w=400')
    expect(url).toContain('auto=format')
    expect(url).toContain('/t0yrmwzx/production/')
  })
})

describe('imageAlt', () => {
  it('cae al fallback cuando alt está vacío', () => {
    expect(imageAlt({_type: 'image', alt: ''}, 'Foto')).toBe('Foto')
    expect(imageAlt({_type: 'image', alt: '   '}, 'Foto')).toBe('Foto')
    expect(imageAlt({_type: 'image'}, 'Foto')).toBe('Foto')
    expect(imageAlt(null, 'Foto')).toBe('Foto')
    expect(imageAlt({_type: 'image', alt: 'Retrato'}, 'Foto')).toBe('Retrato')
  })
})
