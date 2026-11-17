import {createClient} from '@sanity/client'

// Variables sin prefijo PUBLIC_: el contenido se lee solo en el build y nunca
// debe llegar al bundle del navegador. Astro las expone en import.meta.env del
// lado del servidor; process.env cubre a Vitest y a los scripts de Node.
// El dataset es público, así que no hace falta token. No añadir ninguno.
//
// createClient valida al construirse y lanzaría al importar el módulo, lo que
// deja el build sin un mensaje útil. Con valores centinela el fallo ocurre en
// la primera petición, con el console.error de abajo como pista.
const env = (name: string): string | undefined =>
  (import.meta.env?.[name] as string | undefined) || process.env[name] || undefined

const projectId = env('SANITY_PROJECT_ID')
const dataset = env('SANITY_DATASET')

if (!projectId || !dataset) {
  console.error('Falta SANITY_PROJECT_ID / SANITY_DATASET: ver web/.env.example')
}

export const SANITY_PROJECT_ID = projectId || 'missing-project-id'
export const SANITY_DATASET = dataset || 'missing-dataset'

export const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2025-01-01',
  // El build corre una vez: la CDN solo añadiría contenido desactualizado.
  useCdn: false,
  perspective: 'published',
})
