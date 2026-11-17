import {describe, expect, it} from 'vitest'
import {chunk, resolveDefaultTab} from '../content'

describe('chunk', () => {
  it('chunk(items, 3) da 3+2 con 5 aptitudes y 3+1 con 4', () => {
    expect(chunk([1, 2, 3, 4, 5], 3).map((c) => c.length)).toEqual([3, 2])
    expect(chunk([1, 2, 3, 4], 3).map((c) => c.length)).toEqual([3, 1])
  })
  it('chunk no emite un trozo vacío con una lista vacía', () => {
    expect(chunk([], 3)).toEqual([])
  })
  it('conserva el orden', () => {
    expect(chunk(['a', 'b', 'c', 'd'], 3)).toEqual([['a', 'b', 'c'], ['d']])
  })
})

describe('resolveDefaultTab', () => {
  const t = (order: number, isDefault?: boolean | null) => ({order, isDefault})
  it('devuelve la marcada isDefault', () => {
    const marked = t(2, true)
    expect(resolveDefaultTab([t(1), marked, t(3)])).toBe(marked)
  })
  it('cae a la de menor order si ninguna o varias están marcadas', () => {
    const first = t(1, false)
    expect(resolveDefaultTab([t(3), first, t(2, null)])).toBe(first)
    // Varias marcadas: manda el menor order de todas, no el de las marcadas.
    const lowest = t(1, false)
    expect(resolveDefaultTab([t(3, true), lowest, t(2, true)])).toBe(lowest)
  })
  it('devuelve undefined sin pestañas', () => {
    expect(resolveDefaultTab([])).toBeUndefined()
  })
})
