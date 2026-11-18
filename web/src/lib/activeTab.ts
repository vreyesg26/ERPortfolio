// La pestaña abierta no vive en ninguna variable: vive en la clase filters__active del
// panel. HomePage.astro la escribe en el HTML durante el build, así que las dos
// direcciones (/ y /en/) se publican con la pestaña por defecto marcada.

const ACTIVE_PANEL = '.filters__active[data-content]'

// Qué pestaña está abierta en un documento. Devuelve el id del panel (el mismo valor que
// tab.key en Sanity: about, projects o skills).
export const activeTabKey = (doc: Document): string | undefined =>
  doc.querySelector(ACTIVE_PANEL)?.id || undefined

// Copia la pestaña abierta de un documento a otro. No toca el que sale.
export function applyActiveTab(from: Document, to: Document): void {
  const key = activeTabKey(from)
  if (!key) return

  const panel = to.getElementById(key)
  // Si el documento que entra no publica ese panel, se queda con el suyo: quitarle el
  // activo sin poder poner otro dejaría la página sin nada visible.
  if (!panel) return

  to.querySelectorAll('[data-content]').forEach((el) => {
    el.classList.remove('filters__active', 'filters__fade')
  })
  panel.classList.add('filters__active')

  // La pastilla la pinta la isla de React, que al montarse lee el panel activo. Dejar el
  // HTML entrante ya de acuerdo con el panel evita que se hidrate en desacuerdo con él.
  to.querySelectorAll('.filters__button').forEach((button) => {
    button.classList.toggle('filter-tab-active', button.getAttribute('data-target') === `#${key}`)
  })
}

// Cambiar de idioma es navegar a otra dirección. El ClientRouter sustituye el documento
// por el HTML ya construido del otro idioma, que trae marcada la pestaña por defecto, y
// la isla se monta de cero sobre él: por eso se perdía la pestaña abierta. Esto la copia
// al documento que entra ANTES de que se pinte, así que no hay parpadeo.
//
// A propósito no guarda nada: al recargar o al entrar de nuevo manda la pestaña que Efren
// haya marcado en Sanity como "la que se abre al entrar".
export function keepActiveTabAcrossNavigation(): void {
  document.addEventListener('astro:before-swap', (event) => {
    applyActiveTab(document, event.newDocument)
  })
}
