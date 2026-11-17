// Proteccion de seed.ts: detecta documentos que la carga escribiria y que ya
// existen, publicados o solo como borrador (las ediciones del Studio viven en
// borradores hasta que se publican).
export type QueryFn = (groq: string, params: Record<string, unknown>) => Promise<{_id: string}[]>

export type Existing = {published: string[]; drafts: string[]}

export const findExisting = async (ids: string[], run: QueryFn): Promise<Existing> => {
  const all = ids.flatMap((id) => [id, `drafts.${id}`])
  const found = (await run('*[_id in $ids]{_id}', {ids: all})).map((d) => d._id).sort()
  return {
    published: found.filter((id) => !id.startsWith('drafts.')),
    drafts: found.filter((id) => id.startsWith('drafts.')),
  }
}

const list = (ids: string[]) => ids.map((id) => `  - ${id}`).join('\n')

// Mensaje cuando la guarda rechaza la carga (sin --force).
export const refusalMessage = ({published, drafts}: Existing): string =>
  `El dataset ya contiene ${published.length + drafts.length} de los documentos que esta carga escribiria:\n` +
  list([...published, ...drafts]) +
  '\n\nNo se escribio nada. Si alguien ya edito en el Studio, volver a sembrar borraria esos cambios.\n' +
  'Para sobrescribir de todos modos, pasa --force (OJO: --force sobrescribe las ediciones hechas en el Studio).'

// Aviso con --force: createOrReplace pisa lo publicado pero no toca los borradores.
export const draftWarning = ({drafts}: Existing): string =>
  `AVISO: hay ${drafts.length} borrador(es) que --force NO borra:\n` +
  list(drafts) +
  '\nSeguiran apareciendo en el Studio por encima del contenido recien sembrado hasta que se publiquen o se descarten a mano.'
