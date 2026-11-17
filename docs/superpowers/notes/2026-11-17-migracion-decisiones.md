# Migración a Astro + Sanity — decisiones y trabajo pendiente

Registro de la ejecución del plan `2026-11-17-astro-sanity-migration.md` (el plan y el spec
están en `docs/superpowers/plans/` y `docs/superpowers/specs/`).
El historial de git tiene el *qué*; esto tiene el *por qué* y lo que quedó fuera.

## Qué es este proyecto, en cuatro líneas

Portafolio bilingüe (español/inglés) de Efren Reyes, ingeniero civil. Antes era un sitio
estático (`index.html`, SCSS, `main.js`). Ahora es un sitio **Astro** (`web/`) cuyo contenido
vive en **Sanity** y se edita desde un Studio (`studio/`). Se publica en Netlify en
`https://ingefrenreyes.netlify.app` (`/` en español, `/en/` en inglés). El sitio viejo se
eliminó por completo; git guarda su historia (último commit con él: `41a3222`).

## Lo que un mantenedor nuevo debe saber

Léelo antes de tocar nada.

### El contenido solo existe en Sanity

Desde el cutover (2026-11-17, PR #1) el contenido ya no está en el repositorio. Los textos,
las 11 fichas de proyecto, la foto, los planos y los dos CV en PDF viven en el dataset
`production` del proyecto Sanity `t0yrmwzx`.

- **La única copia fuera de Sanity** es `~/Backups/portafolio-efren-2026-11-17.tar.gz`
  (395 KB, 18 entradas: `data.ndjson`, `assets.json` y los 14 assets, PDF incluidos). Está en
  la máquina de Victor, no en el repo. Si se pierde y Sanity falla, no hay otra.
- **La vía de restauración es `sanity dataset import`** desde ese archivo. Restaura el estado
  real del dataset, no una foto de lo que decía el HTML un día.
- **El script de siembra se borró a propósito** (`studio/scripts/`: `seed.ts`, `content.ts`,
  `verify.ts`, `guard.ts`, `sanity-api.ts` y sus tests). No lo busques ni intentes
  reconstruirlo. Razones: (1) su único poder restante era sobrescribir todos los documentos con
  la transcripción del 17 de noviembre, destruyendo las ediciones de Efren; (2) leía
  `index.html` y `assets/` del repo, que ya no existen; (3) `verify.ts` afirmaba cifras de
  migración ("exactamente 11 proyectos") y fallaría ante contenido legítimo nuevo.
  La prueba de fidelidad que comparaba `content.ts` con el HTML original cumplió su función
  antes del borrado y ya no tiene contra qué comparar.
- Nadie respalda el dataset de forma periódica (ver "Brechas conocidas").

### Decisiones que parecen errores y no lo son

- **`remixicon` está fijado en `2.5.0` exacto** (`web/package.json`). La v4 tiene los mismos
  nombres de glifo pero otras métricas de fuente, y los iconos sociales se desplazan 3 px.
  Se descubrió comparando contra producción, no leyendo código: yo (el controlador) había
  comprobado que los 12 glifos *existían* en 4.9.1, no que *renderizaran* igual. 2.5.0 es la
  versión que servía producción. Subirla rompe la paridad visual. El lockfile también debe
  decir 2.5.0 (una vez quedó en 4.9.1 sin que `package.json` lo supiera; Netlify instala desde
  el lockfile).
- **`imageUrl` necesita `fit=max`** (`web/src/lib/image.ts`). Sin él, Sanity agranda
  en silencio la imagen hasta el ancho pedido: un plano de 165×255 se servía como 600×927,
  más pesado y borroso que en producción. Con `fit=max` el ancho es un techo, nunca entrega
  más que el original. Hay un test que fija esto; además `width` es obligatorio en la firma
  porque la convención "pasa siempre un ancho" ya había fallado una vez en otro proyecto.
- **`Tabs` difiere de `main.js` a propósito.** En el script original el retorno anticipado
  del tab ya activo ocurre antes del `clearTimeout`, de modo que hacer clic en B y luego
  rápido en A deja la pastilla en A mientras el cambio de panel a B sí se dispara: pastilla y
  panel en desacuerdo. `Tabs.tsx` cancela correctamente. Está comentado en el punto de la
  llamada y fijado por un test en `web/src/islands/__tests__/Tabs.test.tsx`. Si alguien
  "restaura la paridad" quitando la cancelación, ese test falla. No lo arregles de vuelta.
- **Desplegar el Studio exige una sesión de usuario**, no el token robot. El token que
  devolvió `create_project` lee y escribe contenido pero carece del permiso
  `sanity.project.deployStudio`. El Studio está en `portafolio-efren.sanity.studio`
  (appId fijado en `studio/sanity.cli.ts`). Hace falta `npx sanity login`.
- **Node.** Astro 7 exige Node >= 22.23.4 en tiempo de ejecución (con `engine-strict`
  apagado, pnpm solo avisa). Netlify usa Node 24 (`netlify.toml`).
- **`@sanity/astro` no se usa** aunque el spec lo listaba; se retiró por no aportar
  nada (YAGNI, con evidencia).
- **`site.webmanifest` conserva `name`/`short_name` vacíos**: es exactamente lo que hacía el
  original. Rellenarlos es una decisión de contenido, no de migración.
- **Esquema más estricto que Strapi**, a propósito: todos los `order` son obligatorios y
  `sectionTitle.key` también (sin ella la sección no renderiza en silencio). Un `required()`
  dentro de un objeto no se ejecuta si el objeto padre falta, por eso también se exige en el
  campo del documento.
- **Variables de entorno de Netlify:** `SANITY_PROJECT_ID`, `SANITY_DATASET`, `NODE_VERSION=24`,
  en todos los contextos. (Una llamada de la API a `manage-env-vars` con
  `newVarScopes: ["builds"]` dio 403; con los valores por defecto funciona.)
- **Visual:** la referencia del sitio original es `docs/superpowers/notes/baseline-clean/`.
  Es **irreemplazable**: el dominio ya no sirve el sitio viejo y no hay dónde volver a
  fotografiarlo. No la borres.

## Brechas conocidas

- **Sin CI.** Ninguna de las dos suites (`web` 38 tests, `studio` 45 tests) se ejecuta
  automáticamente. Netlify solo corre el build.
- **Las pruebas de queries en vivo necesitan red.** Los tests de `web` que ejecutan las
  queries GROQ contra el dataset real (timeout de 30 s) fallan sin conexión. Fue un
  compromiso consciente: son la única prueba de que una proyección está bien escrita, y sin
  CI no hay flakiness que duela.
- **`baseline/` trae un artefacto de hover.** Se capturó con una versión de `capture.mjs` que
  dejaba el ratón sobre el botón "Descargar CV" durante su transición `:hover`, horneando un
  halo en las capturas (~10-11k px de diferencia constante). Se conserva intacto solo como
  registro histórico; **para comparar usa `baseline-clean/`**, cuyo README lo explica y fija
  las versiones de Playwright (1.65.1) y Chromium (159.0.8154.6).
- **Sin respaldo periódico del dataset.** Un `sanity dataset export` programado a
  `~/Backups/` cerraría el hueco; hoy solo existe la copia del cutover.
- **Credenciales por revocar:** el `readToken` que devolvió `create_project` (no se
  persistió) y el token de escritura de `studio/.env.local`, que solo servía a la migración.
- **`og:image` se sirve a 512 px de ancho real** (el original de la foto). Un `<img>` puede
  pedir un ancho como tope, pero una `meta` anuncia un tamaño a un crawler: ahí no debe
  prometerse más de lo que se entrega.
- **`hotspot: true` es inerte** si las queries siguen proyectando solo
  `asset->{_id,url,mimeType}`: el recorte nunca llega a la URL.
- **`tsx`** se quitó de `studio/package.json` al borrar los scripts (quedó huérfano).

## Hallazgos menores diferidos

Triados y no corregidos de forma deliberada. Ninguno bloquea nada. Los de las tareas 5 y 6
se refieren a código que ya no existe (siembra) o a las queries de `web`.

### Tarea 5 (siembra, ya borrada)

- **T5** — los strings de SEO en español se comprobaban con `toContain`, no anclados a
  `name="description" content="…"`.
- **T5** — `content.ts` no era datos puros y `assetPaths` se mantenía a mano aparte de los
  marcadores `__file`.
- **T5** — `seed.ts` ejecutaba `main()` al importarse.
- **T5** — el 14 de `verify.ts` era un total y pasaría con 14 assets equivocados.

### Tarea 6 (queries)

- **T6** — `CV_QUERY` usa `select($lang=="en" => cvEn…, cvEs…)` sin fallback a español si
  faltara `cvEn` (hoy imposible: el esquema lo exige).
- **T6** — el test de traducción faltante solo cubre `title`; `ABOUT_QUERY`, `interfaceText` y
  `seo` no tienen test de fallback.
- **T6** — la rama SVG llama `source.url()` sobre un builder con la imagen entera, así que un
  hotspot o crop en un SVG añadiría `rect=`.
- **T6** — `expect(names.length).toBe(7)` se romperá cuando se añada una query; mejor `>= 7`
  o comparar contra la lista exportada.
- **T6** — `loadEnvFile('.env.local')` es relativo al cwd: correr vitest desde la raíz del
  repo lo salta en silencio.
- **T6** — `references(^._id)` casa cualquier referencia del skill, no solo `category`;
  `category._ref == ^._id` sería más estricto.

### Tarea 7 (andamiaje de `web/`)

- **T7** — `site.webmanifest` con `name`/`short_name` vacíos (ver arriba).

### Tarea 8 (layout)

- **T8** — `BaseLayout.astro` sigue emitiendo un comentario HTML (la nota del script de tema)
  en la salida de producción.

### Tarea 9 (imágenes y pestañas)

- **T9** — los botones de pestaña siguen el `order` de Sanity pero los paneles están en orden
  fijo en el DOM. Inofensivo: solo un panel se muestra a la vez. Hacerlos data-driven sería un
  registro clave→componente para una diferencia que nadie percibe.
- **T9** — las cifras de capturas y píxeles del reporte de la tarea no eran verificables desde
  el diff; la tarea 11 rehízo la comparación completa.

Los hallazgos menores del Studio (`studio/package.json`, tests de esquema y `structure.ts`)
de la migración anterior, que este proyecto heredó en forma, siguen en
`Portfolio Admin/docs/superpowers/notes/2026-11-16-migracion-decisiones.md`.

# Rulings tomados por el controlador

Decisiones que se tomaron en nombre de Victor durante la ejecución. El registro completo,
con costes, está en `.superpowers/sdd/2026-11-17-astro-sanity-migration/progress.md`.

1. **`remixicon` 2.5.0, no 4.9.1.** Pasar a npm era para quitar la dependencia de un CDN
   ajeno; subir de versión no aportaba nada y costaba la paridad (ver arriba).
2. **`fit=max` en `imageUrl`.** Es un cambio de petición de imagen, no de SCSS ni marcado, así
   que estaba en alcance. Corrige un ledger propio que afirmaba que pedir 600 no podía agrandar.
3. **La divergencia de `Tabs` se queda, con comentario y test.** Debe ser deliberada y no
   accidente; sin eso el siguiente que compare con el script viejo la leerá como error.
4. **`createOrReplace` sobre singletons exigía `--force`** en la siembra: tras la primera
   edición de Efren, una reejecución habría borrado su trabajo. (La siembra ya no existe.)
5. **Los borradores se avisan, no se borran,** al sembrar: son donde viven las ediciones de
   Efren antes de publicar.
6. **El token de escritura lo escribió el controlador** en `studio/.env.local` (modo 600),
   con las reglas de `.gitignore` commiteadas *antes*, para que el secreto nunca pasara por la
   transcripción de un subagente.
7. **Cutover con deploy preview primero,** lo que exigió empujar la rama al remoto; Victor
   revisó el preview y aprobó. Las líneas base limpias de producción se capturaron *antes* del
   cutover (`f42dab8`) porque después ya no habría sitio viejo que fotografiar.
8. **Borrado total del sitio estático** (`index.html`, `assets/`, `studio/scripts/`), pedido
   explícitamente por Victor: "que no quede rastro". Se hizo tras respaldar el dataset y con
   `.gitattributes` como commit **posterior y aparte**, para que la normalización de saltos de
   línea no enterrara el borrado en un diff de mil líneas sobre archivos CRLF a punto de
   desaparecer.
