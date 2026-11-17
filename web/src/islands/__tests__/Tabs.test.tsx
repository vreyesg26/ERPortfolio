import {act, fireEvent, render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import Tabs from '../Tabs'

const tabs = [
  {key: 'about', label: 'Sobre mí'},
  {key: 'projects', label: 'Proyectos'},
  {key: 'skills', label: 'Aptitudes'},
]

// Los paneles los renderiza Astro fuera de la isla; aquí se simulan en el documento.
const mountPanels = () => {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="about" data-content class="filters__active"></div>
     <div id="projects" data-content></div>
     <div id="skills" data-content></div>`,
  )
}
const panel = (key: string) => document.getElementById(key)!

describe('Tabs', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mountPanels()
    render(<Tabs tabs={tabs} defaultKey="about" />)
  })
  afterEach(() => {
    vi.useRealTimers()
    document.querySelectorAll('[data-content]').forEach((el) => el.remove())
  })

  it('marca la pestaña por defecto como activa', () => {
    expect(screen.getByText('Sobre mí')).toHaveClass('filter-tab-active')
    expect(screen.getByText('Proyectos')).not.toHaveClass('filter-tab-active')
  })

  it('la pastilla activa se mueve en el clic, antes del fundido', () => {
    fireEvent.click(screen.getByText('Proyectos'))
    expect(screen.getByText('Proyectos')).toHaveClass('filter-tab-active')
    expect(screen.getByText('Sobre mí')).not.toHaveClass('filter-tab-active')
    // el intercambio aún no ocurrió
    expect(panel('about')).toHaveClass('filters__active')
    expect(panel('projects')).not.toHaveClass('filters__active')
  })

  it('el panel que sale recibe filters__fade y el intercambio ocurre 200 ms después', () => {
    fireEvent.click(screen.getByText('Proyectos'))
    expect(panel('about')).toHaveClass('filters__fade')

    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(panel('about')).toHaveClass('filters__active')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(panel('about')).not.toHaveClass('filters__active')
    expect(panel('about')).not.toHaveClass('filters__fade')
    expect(panel('projects')).toHaveClass('filters__active')
    expect(panel('projects')).not.toHaveClass('filters__fade')
  })

  it('clics rápidos no encolan intercambios', () => {
    fireEvent.click(screen.getByText('Proyectos'))
    act(() => {
      vi.advanceTimersByTime(100)
    })
    fireEvent.click(screen.getByText('Aptitudes'))
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(panel('skills')).toHaveClass('filters__active')
    expect(panel('projects')).not.toHaveClass('filters__active')
    expect(panel('about')).not.toHaveClass('filters__active')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('ignora el clic en la pestaña que ya está activa', () => {
    fireEvent.click(screen.getByText('Sobre mí'))
    expect(panel('about')).not.toHaveClass('filters__fade')
    expect(vi.getTimerCount()).toBe(0)
  })
})
