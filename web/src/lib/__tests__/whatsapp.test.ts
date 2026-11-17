import {describe, expect, it} from 'vitest'
import {whatsappUrl} from '../whatsapp'

describe('whatsappUrl', () => {
  it('construye el enlace con el teléfono sin "+" y el mensaje codificado', () => {
    expect(whatsappUrl('50495025008', 'Hola Efren, me gustaría conversar contigo')).toBe(
      'https://api.whatsapp.com/send?phone=50495025008&text=Hola%20Efren%2C%20me%20gustar%C3%ADa%20conversar%20contigo',
    )
  })
  it('no añade un "+" al teléfono', () => {
    expect(whatsappUrl('50495025008', 'x')).not.toContain('phone=+')
    expect(whatsappUrl('50495025008', 'x')).toContain('phone=50495025008&')
  })
  it('codifica los caracteres que romperían la consulta', () => {
    expect(whatsappUrl('1', 'a&b=c')).toBe('https://api.whatsapp.com/send?phone=1&text=a%26b%3Dc')
  })
})
