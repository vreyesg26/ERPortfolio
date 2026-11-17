import {describe, expect, it} from 'vitest'
import {applyActiveTab} from '../activeTab'

// Reproduce la estructura que publica HomePage.astro: los tres paneles con data-content
// y los tres botones de la isla con data-target. Por defecto va activa Proyectos, que es
// lo que traen las dos direcciones del sitio construido.
const page = (activeKey = 'projects') =>
  new DOMParser().parseFromString(
    `<!doctype html><html><body><section class="filters">
       <ul class="filters__content">
         <button class="filters__button${activeKey === 'about' ? ' filter-tab-active' : ''}" data-target="#about">Sobre mí</button>
         <button class="filters__button${activeKey === 'projects' ? ' filter-tab-active' : ''}" data-target="#projects">Proyectos</button>
         <button class="filters__button${activeKey === 'skills' ? ' filter-tab-active' : ''}" data-target="#skills">Aptitudes</button>
       </ul>
       <div class="filters__sections">
         <div class="about__content grid${activeKey === 'about' ? ' filters__active' : ''}" data-content id="about"></div>
         <div class="projects__content grid${activeKey === 'projects' ? ' filters__active' : ''}" data-content id="projects"></div>
         <div class="skills__content grid${activeKey === 'skills' ? ' filters__active' : ''}" data-content id="skills"></div>
       </div>
     </section></body></html>`,
    'text/html',
  )

// Los matchers de jest-dom rechazan elementos de un documento de DOMParser (su
// defaultView es null), así que aquí se comprueban ids y cuentas, no clases de elementos.
const activePanels = (doc: Document) =>
  [...doc.querySelectorAll('.filters__active[data-content]')].map((el) => el.id)
const activePanel = (doc: Document) => activePanels(doc)[0]
const activeButton = (doc: Document) =>
  doc.querySelector('.filters__button.filter-tab-active')?.getAttribute('data-target')

describe('applyActiveTab', () => {
  it('lleva la pestaña activa del documento que sale al que entra', () => {
    const from = page('skills')
    const to = page('projects')

    applyActiveTab(from, to)

    // Exactamente uno, y es el que estaba abierto: Proyectos deja de estarlo.
    expect(activePanels(to)).toEqual(['skills'])
  })

  it('mueve también la pastilla, para que la isla se hidrate de acuerdo con el panel', () => {
    const to = page('projects')

    applyActiveTab(page('about'), to)

    expect(activeButton(to)).toBe('#about')
    expect(to.querySelectorAll('.filter-tab-active')).toHaveLength(1)
  })

  it('no modifica el documento que sale', () => {
    const from = page('skills')

    applyActiveTab(from, page('projects'))

    expect(activePanel(from)).toBe('skills')
    expect(activeButton(from)).toBe('#skills')
  })

  it('limpia filters__fade del documento que entra', () => {
    const to = page('projects')
    to.getElementById('projects')!.classList.add('filters__fade')

    applyActiveTab(page('skills'), to)

    expect(to.querySelectorAll('.filters__fade')).toHaveLength(0)
  })

  it('deja el documento que entra intacto si el que sale no tiene panel activo', () => {
    const from = page('projects')
    from.getElementById('projects')!.classList.remove('filters__active')
    const to = page('projects')

    applyActiveTab(from, to)

    expect(activePanel(to)).toBe('projects')
    expect(activeButton(to)).toBe('#projects')
  })

  // Si algún día una dirección no publica las tres pestañas, vaciar el panel activo
  // dejaría la página sin nada visible. Mejor dejar la que traía el HTML entrante.
  it('deja el documento que entra intacto si no tiene ese panel', () => {
    const to = page('projects')
    to.getElementById('skills')!.remove()

    applyActiveTab(page('skills'), to)

    expect(activePanel(to)).toBe('projects')
    expect(activeButton(to)).toBe('#projects')
  })
})
