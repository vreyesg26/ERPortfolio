// scrollreveal 4.0.9 no trae tipos; solo se declara lo que usa scrollReveal.ts.
declare module 'scrollreveal' {
  interface RevealOptions {
    origin?: 'top' | 'bottom' | 'left' | 'right'
    distance?: string
    duration?: number
    delay?: number
    interval?: number
  }
  interface ScrollRevealInstance {
    reveal(target: string, options?: RevealOptions): void
  }
  export default function ScrollReveal(options?: RevealOptions): ScrollRevealInstance
}
