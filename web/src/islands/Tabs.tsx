import {useEffect, useRef, useState} from 'react'
import {activeTabKey} from '../lib/activeTab'

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
  // La pestaña inicial se lee del DOM, no de defaultKey. Al cambiar de idioma el
  // documento que entra ya trae marcada la pestaña que estaba abierta (lo hace
  // applyActiveTab antes de pintar) y la isla se monta de cero sobre él: confiar en
  // defaultKey, que es el valor del build, pondría la pastilla en otra pestaña que el
  // panel visible. En la carga inicial el panel activo ES el de defaultKey, así que no
  // cambia nada. El guardia cubre el renderizado en el servidor, donde no hay document.
  const [activeKey, setActiveKey] = useState(() =>
    typeof document === 'undefined' ? defaultKey : (activeTabKey(document) ?? defaultKey),
  )
  const fade = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(fade.current), [])

  const select = (key: string) => {
    // La pastilla se mueve ya, para que el clic se sienta inmediato.
    setActiveKey(key)

    const target = document.getElementById(key)
    if (!target) return
    const current = document.querySelector('.filters__active[data-content]')

    if (target === current) {
      // DIFIERE DE assets/js/main.js a proposito. Alli el return anticipado ocurre antes
      // de clearTimeout: clic en B y rapido en A deja la pastilla en A mientras el
      // intercambio pendiente a B sigue disparando (pastilla y panel en desacuerdo). Aqui
      // se cancela. Hay una prueba que lo fija; no "restaurar la paridad" quitandolo.
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
