import {existsSync, readFileSync} from 'node:fs'
import {resolve} from 'node:path'

// Cliente minimo sobre la API HTTP de Sanity (fetch nativo), sin dependencias.
// El token sale de studio/.env.local (fuera de git) o del entorno. Nunca se imprime.
const API_VERSION = 'v2025-01-01'
const HERE = import.meta.dirname
export const REPO_ROOT = resolve(HERE, '../../..')

const loadEnvFile = () => {
  const file = resolve(HERE, '../../.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
}

export const config = () => {
  loadEnvFile()
  const {SANITY_AUTH_TOKEN: token, SANITY_PROJECT_ID: projectId, SANITY_DATASET: dataset} =
    process.env
  if (!token || !projectId || !dataset) {
    throw new Error('Faltan SANITY_AUTH_TOKEN, SANITY_PROJECT_ID o SANITY_DATASET (studio/.env.local)')
  }
  return {token, projectId, dataset}
}

export const sanityFetch = async (path: string, init: RequestInit = {}) => {
  const {token, projectId} = config()
  const res = await fetch(`https://${projectId}.api.sanity.io/${API_VERSION}${path}`, {
    ...init,
    headers: {Authorization: `Bearer ${token}`, ...(init.headers ?? {})},
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Sanity ${res.status} en ${path.split('?')[0]}: ${text.slice(0, 300)}`)
  return JSON.parse(text)
}

export const mutate = (mutations: unknown[]) => {
  const {dataset} = config()
  return sanityFetch(`/data/mutate/${dataset}?returnIds=true`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({mutations}),
  })
}

export const query = async <T = any>(
  groq: string,
  params: Record<string, unknown> = {},
): Promise<T> => {
  const {dataset} = config()
  const p = Object.entries(params)
    .map(([k, v]) => `&$${k}=${encodeURIComponent(JSON.stringify(v))}`)
    .join('')
  const out = await sanityFetch(`/data/query/${dataset}?query=${encodeURIComponent(groq)}${p}`)
  return out.result as T
}
