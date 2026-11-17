// Solo el id del proyecto y el dataset, sin cliente: lo importan sanity.ts y
// image.ts. Mantenerlo así garantiza por construcción que importar imageUrl
// (por ejemplo desde una isla client:load) nunca arrastra createClient al bundle.
//
// Variables sin prefijo PUBLIC_: el contenido se lee solo en el build. Astro las
// expone en import.meta.env del lado del servidor; process.env cubre a Vitest y
// a los scripts de Node (typeof evita un ReferenceError en el navegador).
const env = (name: string): string | undefined =>
  (import.meta.env?.[name] as string | undefined) ||
  (typeof process !== 'undefined' ? process.env[name] : undefined) ||
  undefined

const projectId = env('SANITY_PROJECT_ID')
const dataset = env('SANITY_DATASET')

if (!projectId || !dataset) {
  console.error('Falta SANITY_PROJECT_ID / SANITY_DATASET: ver web/.env.example')
}

// Valores centinela: un módulo que lanza al importarse deja el build sin mensaje útil.
export const SANITY_PROJECT_ID = projectId || 'missing-project-id'
export const SANITY_DATASET = dataset || 'missing-dataset'
