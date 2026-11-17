import {readFileSync} from 'node:fs'
import {basename, resolve} from 'node:path'
import {assetPaths, documents, type Doc} from './lib/content'
import {config, mutate, REPO_ROOT, sanityFetch} from './lib/sanity-api'

const DRY_RUN = process.argv.includes('--dry-run')

const MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
}

// Sube los 14 archivos y devuelve ruta -> _id del asset. Sanity deduplica por
// contenido, asi que repetir la subida devuelve el mismo asset.
export const seedAssets = async (): Promise<Map<string, string>> => {
  const out = new Map<string, string>()
  for (const path of assetPaths) {
    if (DRY_RUN) {
      console.log(`[dry-run] subiria ${path}`)
      out.set(path, `dry-run:${path}`)
      continue
    }
    const kind = path.endsWith('.pdf') ? 'files' : 'images'
    const ext = path.slice(path.lastIndexOf('.'))
    const {dataset} = config()
    const res = await sanityFetch(
      `/assets/${kind}/${dataset}?filename=${encodeURIComponent(basename(path))}`,
      {
        method: 'POST',
        headers: {'Content-Type': MIME[ext]},
        body: readFileSync(resolve(REPO_ROOT, path)),
      },
    )
    out.set(path, res.document._id)
    console.log(`subido ${path} -> ${res.document._id}`)
  }
  return out
}

// Sustituye cada marcador `__file` por la referencia al asset subido.
const resolveFiles = (v: any, assets: Map<string, string>): any => {
  if (Array.isArray(v)) return v.map((x) => resolveFiles(x, assets))
  if (v && typeof v === 'object') {
    if (typeof v.__file === 'string') {
      const id = assets.get(v.__file)
      if (!id) throw new Error(`Asset sin subir: ${v.__file}`)
      return {_type: v._type, asset: {_type: 'reference', _ref: id}}
    }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolveFiles(x, assets)]))
  }
  return v
}

export const seedDocuments = async (assets: Map<string, string>): Promise<void> => {
  const docs = documents.map((d: Doc) => resolveFiles(d, assets))
  if (DRY_RUN) {
    for (const d of docs) console.log(`[dry-run] createOrReplace ${d._type} ${d._id}`)
    return
  }
  // Una sola transaccion: o entran los 29 o ninguno.
  const res = await mutate(docs.map((d) => ({createOrReplace: d})))
  console.log(`transaccion ${res.transactionId}: ${res.results.length} documentos escritos`)
}

const main = async () => {
  const assets = await seedAssets()
  await seedDocuments(assets)
  console.log(`\n${DRY_RUN ? '[dry-run] ' : ''}${assets.size} assets, ${documents.length} documentos`)
  if (DRY_RUN) console.log('[dry-run] no se escribio nada')
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
