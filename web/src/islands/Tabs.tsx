import {useEffect, useRef, useState} from 'react'

export interface TabItem {
  key: string
  label: string
}

interface Props {
  tabs: TabItem[]
  defaultKey: string | undefined
}

const FADE_MS = 200

// Puerto de las lineas 1-37 de assets/js/main.js. Los paneles los renderiza Astro
// (HTML del build); la isla solo gobierna la pastilla activa y las clases de los paneles.
export default function Tabs({tabs, defaultKey}: Props) {
  const [activeKey, setActiveKey] = useState(defaultKey)
  const fade = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(fade.current), [])

  const select = (key: string) => {
    // La pastilla se mueve ya, para que el clic se sienta inmediato.
    setActiveKey(key)

    const target = document.getElementById(key)
    if (!target) return
    const current = document.querySelector('.filters__active[data-content]')

    if (target === current) {
      // Volver a la pestaña activa cancela un intercambio pendiente, si no la
      // pastilla y el panel acabarian en pestañas distintas.
      clearTimeout(fade.current)
      target.classList.remove('filters__fade')
      return
    }

    // Fundido de salida, intercambio mientras es invisible y fundido de entrada.
    // clearTimeout evita que los clics rapidos encolen intercambios.
    clearTimeout(fade.current)
    current?.classList.add('filters__fade')

    fade.current = setTimeout(() => {
      document.querySelectorAll('[data-content]').forEach((panel) => {
        panel.classList.remove('filters__active', 'filters__fade')
      })
      target.classList.add('filters__fade', 'filters__active')
      void target.offsetHeight // reflujo forzado: da al fundido un valor inicial
      target.classList.remove('filters__fade')
    }, FADE_MS)
  }

  return (
    <ul className="filters__content">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`filters__button${tab.key === activeKey ? ' filter-tab-active' : ''}`}
          data-target={`#${tab.key}`}
          onClick={() => select(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </ul>
  )
}
