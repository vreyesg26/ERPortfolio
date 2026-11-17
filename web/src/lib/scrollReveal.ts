import ScrollReveal from 'scrollreveal'

// Configuracion base y ocho objetivos de assets/js/main.js. Si cambia un retraso, la
// aparicion escalonada del perfil se nota: es parte de la paridad con el sitio actual.
export const baseConfig = {
  origin: 'top',
  distance: '60px',
  duration: 2500,
  delay: 400,
} as const

export const revealTargets = [
  {selector: '.profile__border'},
  {selector: '.profile__name', delay: 500},
  {selector: '.profile__profession', delay: 600},
  {selector: '.profile__social', delay: 700},
  {selector: '.profile__info-group', delay: 700, interval: 100},
  {selector: '.profile__buttons', delay: 800},
  {selector: '.filters__content', delay: 900},
  {selector: '.filters', delay: 1000},
] as const

export function initScrollReveal() {
  const sr = ScrollReveal(baseConfig)
  for (const {selector, ...options} of revealTargets) sr.reveal(selector, options)
}
