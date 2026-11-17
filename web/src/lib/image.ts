import {createImageUrlBuilder} from '@sanity/image-url'
import type {Project} from '../sanity.types'
import {SANITY_DATASET, SANITY_PROJECT_ID} from './sanity-env'

// El tipo del campo viene de sanity.types.ts; alt solo existe en la foto de perfil.
export type SanityImageField =
  | (Pick<Project['image'], '_type' | 'asset' | 'hotspot' | 'crop'> & {alt?: string | null})
  | null
  | undefined

const builder = createImageUrlBuilder({projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET})

// undefined (nunca "") cuando no hay asset: Astro y React omiten un atributo
// undefined, mientras que <img src=""> hace que el navegador pida la página.
// El ancho es obligatorio: omitirlo sirve cada raster a tamaño original (el defecto de la migración anterior). En SVG se ignora.
export function imageUrl(image: SanityImageField, width: number): string | undefined {
  const ref = image?.asset?._ref
  if (!image || !ref) return undefined
  const source = builder.image(image)
  // La canalización de imágenes de Sanity no transforma SVG: se sirven tal cual.
  if (ref.endsWith('-svg')) return source.url()
  // fit('max'): el ancho es un tope. Sin esto Sanity amplia imagenes menores (500px -> 600px).
  const sized = source.width(width).fit('max')
  return sized.auto('format').url()
}

export function imageAlt(image: SanityImageField, fallback: string): string {
  const alt = image?.alt?.trim()
  return alt ? alt : fallback
}
