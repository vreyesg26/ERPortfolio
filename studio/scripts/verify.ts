import {spawnSync} from 'node:child_process'
import {resolve} from 'node:path'
import {config, query} from './lib/sanity-api'

// Consulta el dataset y comprueba la carga inicial. Sale con codigo 0 solo si
// todo pasa, incluida la validacion contra el esquema desplegado.
const problems: string[] = []
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? 'OK  ' : 'FALLA'} ${label}${!ok && detail ? ` -> ${detail}` : ''}`)
  if (!ok) problems.push(label)
}

const EXPECTED: Record<string, number> = {
  profile: 1,
  about: 1,
  interfaceText: 1,
  seo: 1,
  tab: 3,
  project: 11,
  skillCategory: 2,
  skill: 9,
}

const main = async () => {
  const docs: any[] = await query('*[!(_type match "system.*") && !(_type match "sanity.*")]')

  // 1. Recuentos del spec: 29 documentos.
  for (const [type, n] of Object.entries(EXPECTED)) {
    const got = docs.filter((d) => d._type === type).length
    check(got === n, `${type}: ${n} documento(s)`, `hay ${got}`)
  }
  check(docs.length === 29, 'total: 29 documentos', `hay ${docs.length}`)
  check(
    docs.every((d) => !d._id.startsWith('drafts.')),
    'ningun borrador, todo publicado',
  )
  for (const t of ['profile', 'about', 'interfaceText', 'seo']) {
    check(docs.some((d) => d._id === t && d._type === t), `singleton ${t} con _id "${t}"`)
  }

  // 2. Ningun localeString/localeText con un idioma vacio.
  const empties: string[] = []
  const walk = (v: unknown, path: string) => {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`))
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>
      if ('es' in o || 'en' in o) {
        for (const l of ['es', 'en']) {
          if (typeof o[l] !== 'string' || !(o[l] as string).trim()) empties.push(`${path}.${l}`)
        }
      }
      for (const [k, x] of Object.entries(o)) walk(x, `${path}.${k}`)
    }
  }
  docs.forEach((d) => walk(d, d._id))
  check(empties.length === 0, 'ningun idioma vacio en los campos es/en', empties.join(', '))

  // 3. Referencias de imagen (12) y PDF (2) que resuelven a un asset existente.
  const assets: any[] = await query('*[_type in ["sanity.imageAsset","sanity.fileAsset"]]{_id,_type,url}')
  const assetIds = new Set(assets.map((a) => a._id))
  const images: string[] = []
  const files: string[] = []
  const collect = (v: unknown) => {
    if (Array.isArray(v)) return v.forEach(collect)
    if (v && typeof v === 'object') {
      const o = v as Record<string, any>
      if (o._type === 'image' && o.asset?._ref) images.push(o.asset._ref)
      if (o._type === 'file' && o.asset?._ref) files.push(o.asset._ref)
      Object.values(o).forEach(collect)
    }
  }
  docs.forEach(collect)
  // 12 (foto + 11 planos) + ogImage, que reusa el asset de la foto: 13 referencias, 12 assets de imagen.
  check(images.length === 13, '13 referencias de imagen (foto, 11 planos, ogImage)', `hay ${images.length}`)
  check(new Set(images).size === 12, '12 assets de imagen distintos (ogImage reusa la foto)', `hay ${new Set(images).size}`)
  const profile = docs.find((d) => d._id === 'profile')
  const seo = docs.find((d) => d._id === 'seo')
  check(
    !!seo?.ogImage?.asset?._ref && seo.ogImage.asset._ref === profile?.photo?.asset?._ref,
    'seo.ogImage apunta al mismo asset que profile.photo',
  )
  check(!!profile?.photo?.alt?.trim(), 'profile.photo.alt no esta vacio')
  check(files.length === 2, '2 referencias de PDF', `hay ${files.length}`)
  const dangling = [...images, ...files].filter((id) => !assetIds.has(id))
  check(dangling.length === 0, 'todas las referencias de archivo resuelven', dangling.join(', '))
  check(assets.length === 14, '14 assets en el dataset', `hay ${assets.length}`)
  check(assets.every((a) => typeof a.url === 'string' && a.url.startsWith('https://')), 'cada asset tiene url')

  // 4. Las 9 aptitudes apuntan a una categoria existente.
  const catIds = new Set(docs.filter((d) => d._type === 'skillCategory').map((d) => d._id))
  const skills = docs.filter((d) => d._type === 'skill')
  const bad = skills.filter((s) => !s.category?._ref || !catIds.has(s.category._ref))
  check(skills.length === 9 && bad.length === 0, '9 aptitudes con categoria existente', bad.map((s) => s._id).join(', '))

  // 5. Como mucho una pestana con isDefault (se siembra exactamente una: projects).
  const defaults = docs.filter((d) => d._type === 'tab' && d.isDefault === true)
  check(defaults.length <= 1, 'como mucho una pestana con isDefault', `hay ${defaults.length}`)
  check(defaults.length === 1 && defaults[0].key === 'projects', 'la pestana inicial sembrada es projects')

  // 6. Sin valores de order repetidos en cada coleccion.
  for (const type of ['tab', 'project', 'skillCategory', 'skill']) {
    const orders = docs.filter((d) => d._type === type).map((d) => d.order)
    const dup = orders.filter((o, i) => orders.indexOf(o) !== i)
    check(
      orders.every((o) => typeof o === 'number') && dup.length === 0,
      `${type}: order sin repetidos`,
      `repetidos: ${dup.join(', ')}`,
    )
  }

  // 7. Validacion contra el esquema desplegado. Sanity no rechaza campos
  // desconocidos al crear; esto es lo que caza un nombre de campo mal escrito.
  console.log('\n> sanity documents validate --dataset production')
  const {token, dataset} = config()
  const res = spawnSync(
    'pnpm',
    ['--filter', 'studio', 'exec', 'sanity', 'documents', 'validate', '--dataset', dataset, '--yes'],
    {
      cwd: resolve(import.meta.dirname, '../..'),
      env: {...process.env, SANITY_AUTH_TOKEN: token},
      encoding: 'utf8',
    },
  )
  const out = `${res.stdout ?? ''}${res.stderr ?? ''}`.split(token).join('[token]')
  console.log(out.trim())
  check(res.status === 0, 'sanity documents validate sin errores de validacion', `codigo ${res.status}`)

  console.log(problems.length ? `\n${problems.length} problema(s)` : '\nTodo en orden')
  process.exit(problems.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
