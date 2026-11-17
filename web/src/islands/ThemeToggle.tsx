import {useEffect, useState} from 'react'

const DARK_THEME = 'dark-theme'
const SUN_ICON = 'ri-sun-line'

// Mismas claves de localStorage que assets/js/main.js: a quien ya visito no se le resetea.
// El tema lo aplica antes del primer pintado el script inline del layout y el icono, otro
// script inline de Profile.astro junto al boton. El efecto de abajo es un respaldo
// inofensivo: deja el estado de React acorde con lo que esos scripts ya pusieron en el DOM.
// El valor guardado en selected-icon es el del sitio actual: 'ri-moon-line' significa que
// la clase ri-sun-line esta puesta.
export default function ThemeToggle() {
  const [sun, setSun] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('selected-icon') === 'ri-moon-line') setSun(true)
    } catch {
      // sin localStorage el icono se queda en el valor por defecto
    }
  }, [])

  const toggle = () => {
    document.body.classList.toggle(DARK_THEME)
    const nextSun = !sun
    setSun(nextSun)
    try {
      localStorage.setItem(
        'selected-theme',
        document.body.classList.contains(DARK_THEME) ? 'dark' : 'light',
      )
      localStorage.setItem('selected-icon', nextSun ? 'ri-moon-line' : 'ri-sun-line')
    } catch {
      // sin localStorage el cambio vale solo para esta visita
    }
  }

  return (
    <i
      className={`ri-moon-line change-theme${sun ? ` ${SUN_ICON}` : ''}`}
      id="theme-button"
      onClick={toggle}
    />
  )
}
