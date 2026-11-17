import {createClient} from '@sanity/client'
import {SANITY_DATASET, SANITY_PROJECT_ID} from './sanity-env'

// Solo para el build (frontmatter de Astro): no importar desde una isla de cliente.
// El dataset es público, así que no hace falta token. No añadir ninguno.
// createClient valida al construirse: por eso sanity-env.ts entrega centinelas
// en vez de undefined y el módulo no lanza al importarse.
export const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2025-01-01',
  // El build corre una vez: la CDN solo añadiría contenido desactualizado.
  useCdn: false,
  perspective: 'published',
})
