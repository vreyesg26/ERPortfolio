# Migración a Astro + Sanity — Portafolio Efren — Plan de implementación

> **Para trabajadores agénticos:** SUB-SKILL REQUERIDA: usar
> superpowers:subagent-driven-development (recomendado) o
> superpowers:executing-plans para implementar este plan tarea por tarea.
> Los pasos usan sintaxis de casilla (`- [ ]`) para seguimiento.

**Goal:** Convertir el portafolio estático de Efren Reyes en un sitio Astro generado
estáticamente cuyo contenido completo —en español e inglés— se administra desde un Sanity
Studio, sin cambiar nada de lo que el visitante ve.

**Architecture:** Monorepo pnpm en el repo actual, con `studio/` (Sanity) y `web/` (Astro).
Astro pide el contenido a Sanity **en el build** y escribe dos documentos HTML, `/` en
español y `/en/` en inglés, cada uno con sus propias meta tags. Solo las pestañas, el
interruptor de tema y las animaciones llegan como JavaScript al navegador.

**Tech Stack:** Astro 7.4.x · @astrojs/react 7.1.x · React 19 · @sanity/astro 4.0.0 ·
@sanity/client 8.16.0 · @sanity/image-url 2.1.x · sanity 6.23.0 · Sass · Remixicon 4.9.1 ·
ScrollReveal 4.0.9 · Vitest · TypeScript ~5.9.3 · pnpm

**Spec:** `docs/superpowers/specs/2026-11-17-astro-sanity-migration-design.md`
(aprobado por Victor el 2026-11-17). El plan argumenta desde el spec: quien ejecute lee
los dos.

## Global Constraints

Aplican a todas las tareas.

- **Versiones exactas.** `remixicon` se fija en **`4.9.1` sin `^`** (la v3 renombró glifos
  de marcas; los 12 que usa el sitio están verificados en 4.9.1). `typescript` en `~5.9.3`
  en los dos paquetes, para que el `sanity.types.ts` generado compile igual en ambos.
- **Nombres.** Tipos y campos en **inglés camelCase** (son código). Los `title` y
  `description` que Efren ve en el Studio, **en español**.
- **`order` es obligatorio** en las cuatro colecciones. GROQ no define dónde caen los nulos
  al ordenar.
- **Los textos no se procesan.** Los saltos de línea se pintan con `white-space: pre-line`.
  Nunca HTML dentro de un campo de Sanity.
- **Las imágenes se proyectan completas** (el objeto `image` entero), no
  `asset->{_id, url}`: si no, el hotspot y el recorte no llegan a la URL generada.
- **Cada query se declara con `defineQuery()`** y un nombre **único en todo el proyecto**:
  typegen sobrescribe los duplicados en silencio.
- **ScrollReveal base:** `origin: 'top'`, `distance: '60px'`, `duration: 2500`,
  `delay: 400`. Los ocho objetivos y sus retrasos están en el spec, sección "Animaciones".
- **i18n de Astro:** `defaultLocale: 'es'`, `locales: ['es', 'en']`,
  `prefixDefaultLocale: false`. Español en `/`, inglés en `/en/`.
- **Variables de entorno sin prefijo `PUBLIC_`.** El contenido se pide solo en el build.
- **`output: 'static'`, sin `@astrojs/netlify`.**
- **No se reescribe el CSS.** Los parciales SCSS se conservan y se importan como un SCSS
  global, no con alcance por componente.
- **Saltos de línea.** `index.html`, `assets/js/main.js` y los parciales `assets/scss/**`
  están en CRLF. No reescribir ninguno de esos archivos completo: editar en sitio o no
  tocarlos. `.gitattributes` se agrega **después** de borrarlos (tarea 13).
- **El sitio en producción no puede caerse** hasta la tarea 12. Netlify sigue sirviendo el
  build actual mientras no exista `netlify.toml` en `main`.

## Review Focus

Clases de entrada que el spec implica y que ninguna tarea ejercitaría por sí sola. Cada
línea tiene su test asignado a la tarea que posee el código.

1. **Falta una traducción.** El esquema exige los dos idiomas, pero un documento sembrado
   por API o un borrador puede no tenerlos. La página debe caer al español, nunca imprimir
   `undefined` ni dejar un hueco. → test en tarea 6.
2. **El asset de una imagen fue borrado pero el documento no.** `imageUrl()` debe devolver
   `undefined` para que el atributo `src` se **omita**. Un `<img src="">` hace que el
   navegador vuelva a descargar la página. → test en tarea 6.
3. **Dos documentos con el mismo `order`.** GROQ no define el desempate, así que la grilla
   podría reordenarse entre builds. El orden debe ser determinista. → test en tarea 6.
4. **Ninguna pestaña o más de una con `isDefault`.** La validación del esquema lo impide en
   el Studio, pero no en un dataset sembrado por API. Siempre debe abrir exactamente una.
   → test en tarea 6.
5. **Una aptitud cuya referencia de categoría no resuelve, o una categoría sin aptitudes.**
   No debe pintar una columna vacía ni descuadrar la partición en trozos de 3.
   → test en tarea 6.

---

## Task 1: Líneas base visuales y reconciliación del SCSS

Las capturas tienen que tomarse **antes** de tocar los estilos y mucho antes de borrar
`assets/` (tarea 13): después ya no hay con qué comparar.

**Files:**
- Modify: `assets/scss/components/_profile.scss`, `assets/scss/components/_filters.scss`
- Create: `docs/superpowers/notes/baseline/` (capturas)

**Interfaces:**
- Produces: un `assets/scss/` que compila a algo equivalente a `assets/css/styles.css`, y un
  juego de capturas de referencia en `docs/superpowers/notes/baseline/`.

- [ ] **Step 1: Capturar las líneas base de producción**

Contra `https://ingefrenreyes.netlify.app/`, **sin** haber tocado nada. Anchos: **320, 576,
776, 968, 992** y 1280. Cada ancho en tema claro, pestaña Projects. Más: las tres pestañas
y los dos temas en 320 y en 1280. Guardar como
`docs/superpowers/notes/baseline/<ancho>-<tema>-<pestaña>-<idioma>.png`.

- [ ] **Step 2: Comprobar que el SCSS actual NO reproduce el CSS**

**Sin instalar nada en el repo:** el workspace de pnpm lo crea la tarea 2, y esta tarea
corre antes a propósito. Usar `npx`.

Run: `npx sass@1 assets/scss/styles.scss /tmp/baseline.css --no-source-map && diff <(npx prettier@3 --parser css /tmp/baseline.css) <(npx prettier@3 --parser css assets/css/styles.css)`
Expected: diferencias en las reglas de la tabla "La deriva del CSS" del spec (son siete,
y la tabla es la autoridad — la prosa del spec decía "cinco" por error hasta el 2026-11-17).

- [ ] **Step 3: Reconciliar las siete reglas**

Editando **en sitio** (los parciales están en CRLF). El CSS en producción es la fuente de
verdad: `.profile__perfil` a 120×120 con la img a 90 px y `object-fit: cover` y **sin**
`align-items: flex-end`; `.profile__border` a 135×135; `.projects__card` gana
`max-height: 225px` y `cursor: pointer`; `.projects__button` pasa de `.5rem` a `.4rem`.

- [ ] **Step 4: Verificar que ahora sí reproduce el CSS**

Run: el mismo `diff` del paso 2.
Expected: sin diferencias de declaración. Las diferencias de formato o de orden de reglas
son aceptables; cualquier diferencia de **valor** es un fallo.

- [ ] **Step 5: Commit**

```bash
git add assets/scss docs/superpowers/notes/baseline
git commit -m "fix: reconciliar el SCSS con el CSS editado a mano"
```

---

## Task 2: Andamiaje del monorepo

El paso 1 lo ejecuta el controlador, no quien implemente: crea recursos externos en la
cuenta de Victor, no produce diff revisable y necesita el contexto de autorización que él
dio.

**Files:**
- Create: `pnpm-workspace.yaml`, `studio/package.json`, `studio/sanity.config.ts`,
  `studio/sanity.cli.ts`, `studio/tsconfig.json`, `studio/schemaTypes/index.ts`,
  `web/package.json`, `web/astro.config.mjs`, `web/tsconfig.json`, `web/vitest.config.ts`,
  `web/.env.example`
- Modify: `.gitignore` (agregar `.env.local`, `.env*.local`, `node_modules`, `dist`,
  `.astro`, `.sanity`) **antes** de que exista cualquier secreto

**Interfaces:**
- Produces: `projectId` de Sanity y dataset `production`, consumidos por todas las tareas
  siguientes vía `studio/sanity.config.ts` y `web/.env.local`.

- [ ] **Step 1: [Controlador] Crear el proyecto de Sanity**

Nombre "Portafolio Efren", organización `oHNPn8dSJ`, dataset `production` público.
Registrar `http://localhost:3333` y `http://localhost:4321` como orígenes CORS **con
credenciales** (sin el primero, `sanity dev` no puede autenticar a Efren). Anotar el
`projectId` en este plan antes de seguir.

- [ ] **Step 2: Agregar las reglas al `.gitignore` y commitear, antes de escribir secretos**

- [ ] **Step 3: Crear el workspace y los dos paquetes**

`pnpm-workspace.yaml` con `packages: [studio, web]`. Las dependencias de producción están en
"Dependencias" del spec. `web/astro.config.mjs` con `output: 'static'`, el bloque `i18n` de
las Global Constraints, `@astrojs/react` y Sass.

**El spec no lista las dependencias de desarrollo que este plan necesita.** Se agregan aquí:

- `studio/`: `vitest` (tareas 3, 4 y 5) y `tsx` (para correr `seed.ts` y `verify.ts`).
- `web/`: `vitest`, `jsdom`, `@testing-library/react` y `@testing-library/jest-dom`
  (el test de `Tabs` en la tarea 10), `sass`, y **`groq-js`** (evalúa GROQ localmente contra
  documentos en memoria: es lo que hace viables los fixtures de la tarea 6).

- [ ] **Step 4: Crear `web/.env.example` y `web/.env.local`**

Las dos con `SANITY_PROJECT_ID` y `SANITY_DATASET`. `.env.example` se commitea con valores
de ejemplo; `.env.local` lleva los reales y queda fuera de git por la regla del paso 2. Sin
él, el `pnpm --filter web build` de la tarea 7 no puede pedir el contenido.

- [ ] **Step 5: Verificar que las dos cadenas de build arrancan**

Run: `pnpm install && pnpm --filter web astro --version && pnpm --filter studio sanity --version`
Expected: las dos imprimen su versión sin error.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: andamiaje del monorepo pnpm con studio y web"
```

---

## Task 3: Objetos del esquema con los dos idiomas

Son la base del modelo de localización: los ocho documentos de la tarea 4 los usan, así que
el patrón tiene que estar bien antes.

**Files:**
- Create: `studio/schemaTypes/objects/locale-string.ts`, `locale-text.ts`,
  `social-link.ts`, `stat.ts`
- Modify: `studio/schemaTypes/index.ts`
- Test: `studio/schemaTypes/__tests__/objects.test.ts`

**Interfaces:**
- Produces: `localeString`, `localeText`, `socialLink`, `stat` como
  `SchemaTypeDefinition`, exportados por nombre y registrados en `schemaTypes`.

- [ ] **Step 1: Escribir el test que falla**

```ts
describe('localeString / localeText', () => {
  it('tienen exactamente los campos es y en, los dos obligatorios', () => { /* ... */ })
  it('localeText usa text y localeString usa string', () => { /* ... */ })
})
describe('stat', () => {
  it('value es string, no number', () => { /* el "+" de "+1" es parte del dato */ })
  it('label es localeText, no localeString', () => { /* las leyendas llevan salto de línea */ })
})
describe('socialLink', () => {
  it('exige name, icon y url', () => { /* name alimenta el aria-label */ })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm --filter studio vitest run schemaTypes/__tests__/objects.test.ts`
Expected: FAIL, los módulos no existen.

- [ ] **Step 3: Implementar los cuatro objetos**

Con `defineType`/`defineField`. Los campos de `localeString` y `localeText` se titulan
"Español" e "Inglés" y los dos son `required()`. `stat.label` es `localeText` **a
propósito**: un `string` del Studio es de una sola línea y Efren no podría teclear el salto.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: el mismo comando. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add studio/schemaTypes && git commit -m "feat: objetos de esquema con localización es/en"
```

---

## Task 4: Los ocho documentos, la estructura del Studio y typegen

**Files:**
- Create: `studio/schemaTypes/documents/{profile,about,interface-text,seo,tab,project,skill-category,skill}.ts`,
  `studio/structure.ts`
- Modify: `studio/schemaTypes/index.ts`, `studio/sanity.config.ts`, `studio/package.json`
  (script `typegen`)
- Test: `studio/schemaTypes/__tests__/documents.test.ts`

**Interfaces:**
- Consumes: los cuatro objetos de la tarea 3.
- Produces: los ocho tipos de documento; `SINGLETONS = ['profile', 'about',
  'interfaceText', 'seo']` y `structure` exportados desde `studio/structure.ts`; y
  `web/src/sanity.types.ts` generado.

- [ ] **Step 1: Escribir el test que falla**

Los campos exactos de cada tipo están en "Modelo de contenido" del spec. El test fija:

```ts
it('los 4 singletons y las 4 colecciones existen con sus campos', () => { /* tabla del spec */ })
it('las 4 colecciones tienen order obligatorio', () => { /* project, tab, skill, skillCategory */ })
it('skill.name es string plano, no localeString', () => { /* Autocad es Autocad */ })
it('seo.siteName es localeString', () => { /* su valor actual está en español */ })
it('project.alt es opcional y title obligatorio', () => { /* alt cae al title en la query */ })
it('profile.stats se valida a exactamente 3 elementos', () => { /* la grilla es de 3 columnas */ })
it('tab.key es una lista cerrada de about|projects|skills y es único', () => { /* ... */ })
it('skill.category referencia skillCategory', () => { /* ... */ })
it('SINGLETONS contiene los 4 tipos de documento único', () => { /* ... */ })
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm --filter studio vitest run schemaTypes/__tests__/documents.test.ts`

- [ ] **Step 3: Implementar los ocho documentos**

Siguiendo las tablas del spec campo por campo. `tab.key` con `options.list` cerrada y
`validation` de unicidad.

- [ ] **Step 4: Implementar `structure.ts` y conectar los singletons en `sanity.config.ts`**

Calcar `Portfolio Admin`: los singletons se listan primero con `documentId` igual a su
tipo, un `S.divider()`, y luego las colecciones con
`defaultOrdering: [{field: 'order', direction: 'asc'}]`. En `sanity.config.ts`, filtrar las
plantillas de "New document" y quitar las acciones `delete`/`duplicate`/`unpublish` para los
singletons **y para `tab`** (las tres pestañas no se borran: un `about` borrado quitaría una
sección en silencio).

- [ ] **Step 5: Correr el test y verificar que pasa**

- [ ] **Step 6: Desplegar el esquema y generar los tipos**

Run: `pnpm --filter studio typegen`
Expected: `web/src/sanity.types.ts` existe y `pnpm --filter web tsc --noEmit` pasa.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: los 8 tipos de documento y la estructura del Studio"
```

---

## Task 5: Carga inicial del contenido

El contenido actual vive en `index.html` y en el objeto `translations` de
`assets/js/main.js`, que se borran en la tarea 13. Esta tarea lo mueve a Sanity **y
comprueba que no se perdió nada en la transcripción**, antes de hacer una sola llamada de
red.

**Files:**
- Create: `studio/scripts/lib/content.ts`, `studio/scripts/seed.ts`,
  `studio/scripts/verify.ts`
- Test: `studio/scripts/lib/__tests__/content.test.ts`

**Interfaces:**
- Consumes: los ocho tipos de la tarea 4.
- Produces: 29 documentos y 14 assets en el dataset `production`.

- [ ] **Step 1: Escribir el test de fidelidad que falla**

Este es el test que importa. Lee `assets/js/main.js` y `index.html` como texto y comprueba
que **todo string de `content.ts` aparece literalmente en el original**:

```ts
it('cada texto es/en de content.ts aparece literal en translations de main.js', () => { /* ... */ })
it('las 11 driveUrl aparecen literales en index.html', () => { /* ... */ })
it('los recuentos son 11 proyectos, 9 aptitudes, 2 categorías, 3 pestañas, 3 stats, 4 párrafos', () => { /* ... */ })
it('el copy de SEO en inglés es el aprobado en el spec', () => { /* la tabla "El copy de SEO en inglés" */ })
```

La única excepción permitida son `seo.description` y `seo.keywords` en inglés, que no
existen en el original: sus valores exactos están en el spec y el test los fija ahí.

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm --filter studio vitest run scripts/lib/__tests__/content.test.ts`

- [ ] **Step 3: Escribir `content.ts` transcribiendo el contenido actual**

Un módulo de datos, sin lógica. Las `_id` son deterministas (`project-1`…`project-11`,
`skill-autocad`, `tab-about`, …) para que sembrar dos veces no duplique nada.

- [ ] **Step 4: Correr el test y verificar que pasa**

Si falla, **el error está en la transcripción, no en el test**.

- [ ] **Step 5: Implementar `seed.ts`**

`seedAssets(): Promise<Map<string, string>>` sube los 14 archivos desde `assets/` y devuelve
las rutas mapeadas a `_id` de asset; `seedDocuments(assets): Promise<void>` hace
`createOrReplace` de los 29 documentos. Idempotente. El token de escritura sale de
`studio/.env.local`, en modo 600 y fuera de git.

- [ ] **Step 6: Ensayo en seco y luego la corrida real**

Run: `pnpm --filter studio tsx scripts/seed.ts --dry-run` y después sin la bandera.
Expected: el ensayo imprime 14 assets y 29 documentos sin escribir nada.

- [ ] **Step 7: Implementar y correr `verify.ts`**

Consulta el dataset y comprueba: los recuentos del spec; que ningún `localeString` o
`localeText` tenga un idioma vacío; que las 12 referencias de imagen y los 2 PDF resuelvan;
que las 9 aptitudes apunten a una categoría existente; que exactamente una pestaña tenga
`isDefault`; y que los `order` de cada colección **no tengan repetidos**.

**Además valida los 29 documentos contra el esquema desplegado**, con
`pnpm --filter studio sanity documents validate --dataset production`. Sanity no rechaza
campos desconocidos al crear, así que un nombre de campo mal escrito en `content.ts`
guardaría un campo que el frontend nunca lee y dejaría el obligatorio ausente, en silencio.
Los recuentos solos no lo cazan.

Expected: sale con código 0, sin incidencias y sin errores de validación.

- [ ] **Step 8: Commit**

```bash
git add studio/scripts && git commit -m "feat: carga inicial del contenido con verificación de fidelidad"
```

---

## Task 6: Capa de datos del frontend

Aquí viven las cinco pruebas de Review Focus: es el único lugar donde la lógica es pura y
se puede probar sin navegador.

**Files:**
- Create: `web/src/lib/sanity.ts`, `queries.ts`, `image.ts`, `i18n.ts`, `content.ts`
- Test: `web/src/lib/__tests__/{image,i18n,content,queries}.test.ts`,
  `queries.live.test.ts`, `queries.fixtures.test.ts`

**Interfaces:**
- Consumes: `web/src/sanity.types.ts` de la tarea 4; el dataset sembrado en la tarea 5.
- Produces:
  - `client` (`@sanity/client`, `useCdn: false`, `perspective: 'published'`)
  - `imageUrl(image: SanityImageField, width?: number): string | undefined`
  - `imageAlt(image: SanityImageField, fallback: string): string`
  - `type Lang = 'es' | 'en'`; `otherLang(lang: Lang): Lang`;
    `pathFor(lang: Lang): string`; `ogLocale(lang: Lang): string`
  - `chunk<T>(items: T[], size: number): T[][]`
  - `resolveDefaultTab<T extends {isDefault?: boolean | null; order: number}>(tabs: T[]): T | undefined`
  - Las queries: `PROFILE_QUERY`, `ABOUT_QUERY`, `INTERFACE_TEXT_QUERY`, `SEO_QUERY`,
    `TABS_QUERY`, `PROJECTS_QUERY`, `SKILLS_QUERY`

- [ ] **Step 1: Escribir los tests que fallan**

```ts
// image.test.ts  — Review Focus 2
it('devuelve undefined cuando el asset es null, para que el src se omita', () => { /* nunca "" */ })
it('sirve los SVG tal cual, sin parámetros de transformación', () => { /* ... */ })
it('aplica el ancho pedido y auto=format a los raster', () => { /* ... */ })
it('imageAlt cae al fallback cuando alt está vacío', () => { /* ... */ })

// queries.live.test.ts — CONTRA EL DATASET REAL que sembró la tarea 5.
// No son aserciones de subcadena sobre el texto de la query: eso dejaría pasar un _type
// mal escrito, un [0] perdido o un references() invertido, que es la debilidad que la
// migración anterior documentó. Estos ejecutan y asertan sobre los datos devueltos.
it('las 7 queries devuelven datos, no null ni []', () => { /* caza _type y campos inexistentes */ })
it('PROJECTS_QUERY con $lang "es" y "en" devuelve 11 proyectos con títulos distintos', () => { /* ... */ })
it('SKILLS_QUERY devuelve 2 categorías con 5 y 4 aptitudes', () => { /* la referencia resuelve */ })
it('las imágenes vuelven como objeto completo, no como asset->{_id,url}', () => { /* hotspot */ })

// queries.fixtures.test.ts — con groq-js, para los casos que el dataset real NO contiene
it('cae a español cuando falta la traducción en inglés', () => { /* Review Focus 1 */ })
it('project.alt cae a alt[$lang], luego title[$lang], luego title.es', () => { /* ... */ })
it('el orden es determinista con dos documentos de igual order', () => { /* Review Focus 3 */ })
it('SKILLS_QUERY descarta la aptitud cuya referencia de categoría no resuelve', () => { /* Review Focus 5 */ })

// queries.test.ts
it('cada defineQuery tiene un nombre único en todo el proyecto', () => { /* typegen */ })

// content.test.ts  — Review Focus 4 y 5
it('chunk(items, 3) da 3+2 con 5 aptitudes y 3+1 con 4', () => { /* paridad con el HTML */ })
it('chunk no emite un trozo vacío con una lista vacía', () => { /* categoría sin aptitudes */ })
it('resolveDefaultTab devuelve la marcada isDefault', () => { /* ... */ })
it('resolveDefaultTab cae a la de menor order si ninguna o varias están marcadas', () => { /* ... */ })

// i18n.test.ts
it('pathFor("es") es "/" y pathFor("en") es "/en/"', () => { /* prefixDefaultLocale false */ })
it('ogLocale devuelve es_ES y en_US', () => { /* ... */ })
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `pnpm --filter web vitest run src/lib`

- [ ] **Step 3: Implementar los cinco módulos**

`sanity.ts` **no** debe lanzar al importarse si faltan las variables de entorno: con
`createClient` validando en el constructor, un import que lanza deja el build sin mensaje
útil. Usar valores centinela y un `console.error`, como en `Portfolio Admin`.

`imageUrl` siempre recibe un ancho explícito desde los componentes: omitirlo sirve cada
imagen a tamaño original, el hueco que quedó pendiente en la migración anterior.

- [ ] **Step 4: Correr los tests y verificar que pasan**

- [ ] **Step 5: Commit**

```bash
git add web/src/lib && git commit -m "feat: capa de datos del frontend con queries por idioma"
```

---

## Task 7: Layout, SEO y las dos rutas de idioma

Primer entregable que se puede abrir en un navegador.

**Files:**
- Create: `web/src/layouts/BaseLayout.astro`, `web/src/components/Seo.astro`,
  `web/src/pages/index.astro`, `web/src/pages/en/index.astro`,
  `web/src/styles/` (los parciales SCSS migrados), `web/public/` (favicons)

**Interfaces:**
- Consumes: todo lo que produce la tarea 6.
- Produces: `BaseLayout` con props `{lang: Lang}`; `Seo` con props
  `{lang: Lang, seo: SeoData}`, donde `SeoData` es el tipo de retorno de `SEO_QUERY` que
  genera typegen en `web/src/sanity.types.ts` — no se escribe a mano.

- [ ] **Step 1: Migrar los estilos**

Copiar `assets/scss/**` a `web/src/styles/` conservando la estructura de parciales
(`config/`, `base/`, `theme/`, `layout/`, `components/`) y el `styles.scss` que los importa.
`@import` de Sass está deprecado: pasar a `@use`/`@forward`. Importar el SCSS **una vez** en
`BaseLayout.astro`, global.

Los archivos de `web/src/styles/` son **nuevos**, así que van en LF. No reescribir los
originales de `assets/scss/`, que están en CRLF y se borran en la tarea 13.

- [ ] **Step 2: Mover los favicons a `web/public/`**

`assets/img/favicon.ico` y los seis archivos de `assets/img/favicon_io/`
(`favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`,
`android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`).
`BaseLayout.astro` los referencia desde la raíz del sitio, con las mismas etiquetas `<link>`
que tiene `index.html` hoy. Los originales se borran en la tarea 13.

- [ ] **Step 3: Implementar `Seo.astro`**

Emite `<title>`, `description`, `keywords`, `author`, `theme-color`, los siete `og:*` y los
cinco `twitter:*` del inventario del spec, más el `canonical` y los tres
`<link rel="alternate" hreflang="es|en|x-default">`. `og:locale` sale de `ogLocale(lang)`,
no de un campo.

- [ ] **Step 4: Implementar `BaseLayout.astro` con el script de tema inline**

Un `<script is:inline>` en `<head>` que lea `localStorage` y aplique `dark-theme` al `body`
**antes del primer pintado**: eso elimina el parpadeo de tema claro que el sitio tiene hoy
al recargar en oscuro.

- [ ] **Step 5: Implementar las dos páginas**

Cada una pide sus datos con `$lang` y pasa `lang` al layout. `web/src/pages/index.astro` es
español; `web/src/pages/en/index.astro`, inglés. De momento solo renderizan el `<head>` y
un `<body>` vacío.

- [ ] **Step 6: Verificar que las dos rutas construyen con el contenido real**

Run: `pnpm --filter web build && grep -c 'hreflang' dist/index.html dist/en/index.html`
Expected: el build pasa y las dos páginas tienen 3 `hreflang` cada una. Comprobar a mano
que el `<title>` de `dist/index.html` está en español y el de `dist/en/index.html` en
inglés.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: layout, SEO por idioma y las rutas / y /en"
```

---

## Task 8: Componentes del perfil

**Por qué esta tarea y la 9 no empiezan por un test que falla:** los componentes `.astro`
no son probables en unidad sin la API experimental de contenedores de Astro, y lo que hay
que verificar de ellos es que se vean idénticos, que es justo lo que un test unitario no
mide. La lógica que consumen (`imageUrl`, `chunk`, `resolveDefaultTab`) **sí** está cubierta
por los tests de la tarea 6; aquí la compuerta es la comparación contra las capturas de
línea base. No es una excepción al TDD por conveniencia: es dónde vive la verificación.

**Files:**
- Create: `web/src/components/{Profile,SocialLinks,Stats,ProfileButtons}.astro`
- Modify: `web/src/pages/index.astro`, `web/src/pages/en/index.astro`

**Interfaces:**
- Consumes: `PROFILE_QUERY` y `INTERFACE_TEXT_QUERY` de la tarea 6.
- Produces: `Profile` con props `{lang, profile, interfaceText}`.

- [ ] **Step 1: Implementar los cuatro componentes**

Reproduciendo exactamente el marcado de `index.html` y sus clases. Cuatro detalles que no
son transcripción:

- `SocialLinks` agrega el `aria-label` que hoy no existe, desde `socialLink.name`.
- `Stats` pinta `stat.label` con `white-space: pre-line` para conservar el renglón doble.
- `ProfileButtons` elige el PDF por idioma (`cvEs` / `cvEn`) y construye el enlace de
  WhatsApp como `https://api.whatsapp.com/send?phone=<phone>&text=<encodeURIComponent(message)>`.
- La foto pasa por `imageUrl(photo, 240)`: el doble de los 120 px del CSS, para pantallas
  retina.

- [ ] **Step 2: Verificar contra la línea base**

Run: `pnpm --filter web build && pnpm --filter web preview`
Expected: la cabecera coincide con `docs/superpowers/notes/baseline/` en 320 y 1280 px,
en los dos temas. Sin ScrollReveal todavía: los elementos se ven estáticos, y eso está bien.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: componentes del perfil"
```

---

## Task 9: Componentes de las tres pestañas

**Files:**
- Create: `web/src/components/{About,ProjectGrid,ProjectCard,SkillCategory,SkillItem,Footer}.astro`
- Modify: las dos páginas

**Interfaces:**
- Consumes: `ABOUT_QUERY`, `PROJECTS_QUERY`, `SKILLS_QUERY`, `TABS_QUERY`; `chunk` y
  `resolveDefaultTab` de la tarea 6.
- Produces: `ProjectGrid` con props `{projects, viewPlanLabel}`; `SkillCategory` con props
  `{category, skills, levels}`.

- [ ] **Step 1: Implementar los seis componentes**

Marcado idéntico al actual. Lo que no es transcripción:

- `SkillCategory` parte sus aptitudes con `chunk(skills, 3)` en varios `skills__group`: eso
  da el 3+2 de Design y el 3+1 de Microsoft de hoy. Con la lista vacía no pinta ningún
  grupo.
- `SkillItem` traduce el nivel con `interfaceText.levelBasic`,
  `interfaceText.levelIntermediate` e `interfaceText.levelAdvanced`, según el enum
  `skill.level`.
- `ProjectCard` agrega el `aria-label` del botón del ojo desde `interfaceText.viewPlanLabel`,
  que hoy no tiene nombre accesible. La imagen pasa por `imageUrl(image, 600)`.
- `Footer` no renderiza el `<span>` si `footerText` está vacío, que es el estado actual.
- Las tres pestañas se renderizan las tres en el HTML; cuál está visible lo decide la clase
  `filters__active` que pone `resolveDefaultTab`.

- [ ] **Step 2: Verificar contra la línea base**

Expected: las tres pestañas coinciden con sus capturas. Comprobar que la grilla de proyectos
respeta el `max-height: 225px` que se recuperó en la tarea 1.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: componentes de About, Projects y Skills"
```

---

## Task 10: Islas interactivas y animaciones

La paridad de las animaciones es el objetivo 1 y dos de los anti objetivos del spec.

**Files:**
- Create: `web/src/islands/Tabs.tsx`, `web/src/islands/ThemeToggle.tsx`,
  `web/src/components/LanguageToggle.astro`, `web/src/lib/scrollReveal.ts`
- Modify: `web/src/layouts/BaseLayout.astro`, las dos páginas
- Test: `web/src/islands/__tests__/Tabs.test.tsx`

**Interfaces:**
- Consumes: `resolveDefaultTab`; `otherLang` y `pathFor` de la tarea 6.
- Produces: `Tabs` con props `{tabs, defaultKey}`; `ThemeToggle` sin props.

- [ ] **Step 1: Escribir el test que falla**

```tsx
it('la pastilla activa se mueve en el clic, antes del fundido', () => { /* el clic se siente inmediato */ })
it('el panel que sale recibe filters__fade y el intercambio ocurre 200 ms después', () => { /* ... */ })
it('clics rápidos no encolan intercambios', () => { /* el clearTimeout del main.js actual */ })
it('ignora el clic en la pestaña que ya está activa', () => { /* ... */ })
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm --filter web vitest run src/islands`

- [ ] **Step 3: Implementar `Tabs.tsx`**

Puerto directo de las líneas 1-37 de `assets/js/main.js`, con estado de React en vez de
clases en el DOM. Conservar los 200 ms, el `clearTimeout` y el reflujo forzado que da al
fundido un valor inicial.

- [ ] **Step 4: Correr el test y verificar que pasa**

- [ ] **Step 5: Implementar `ThemeToggle.tsx` y `LanguageToggle.astro`**

El toggle de tema conserva las dos claves de `localStorage` que el sitio ya usa
(`selected-theme`, `selected-icon`), para que a quien ya visitó no se le resetee el tema.
`LanguageToggle` es un `<a>` a `pathFor(otherLang(lang))` con el `aria-label` de
`interfaceText.languageToggleLabel` — ya no hay swap en sitio.

- [ ] **Step 6: Implementar ScrollReveal y las view transitions**

`scrollReveal.ts` exporta la instancia con la configuración base y la lista de los ocho
objetivos con sus retrasos. Se invoca desde un `<script>` del layout, **no** desde una isla:
el HTML llega renderizado del build, así que estamos en el caso del sitio original y no hace
falta el indicador `ready` ni el escalonado manual que `Portfolio Admin` necesitó.
Agregar `<ClientRouter />` al layout.

- [ ] **Step 7: Verificar las animaciones a ojo, una por una**

Contra la tabla "Cómo se migra cada animación" del spec: la aparición escalonada al cargar,
el fundido al cambiar de pestaña, el cambio de idioma, la transición de tema sin parpadeo al
recargar, y el hover de las tarjetas.

**Riesgo conocido del spec:** ScrollReveal y las view transitions pueden pelearse y volver a
ocultar elementos ya revelados al navegar entre `/` y `/en`. Si pasa: excluir el perfil del
reveal al navegar, o quitar `<ClientRouter />` y aceptar una navegación normal. Anotar la
decisión en las notas.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: pestañas, tema, idioma y animaciones"
```

---

## Task 11: Verificación de paridad visual

La compuerta del objetivo 1. No produce código.

- [ ] **Step 1: Comparar el build completo contra las líneas base**

Los mismos seis anchos, dos temas, tres pestañas y dos idiomas de la tarea 1. Reportar cada
diferencia encontrada, con la captura de antes y la de después.

- [ ] **Step 2: Correr la suite completa y el typecheck**

Run: `pnpm --filter studio vitest run && pnpm --filter web vitest run && pnpm --filter web tsc --noEmit && pnpm --filter web build`
Expected: todo verde.

- [ ] **Step 3: Pedir a Victor que apruebe el deploy preview**

**Esta es la última salida antes de un cambio irreversible.** El siguiente paso publica.

---

## Task 12: Cutover a producción

**Files:**
- Create: `netlify.toml`

**Advertencia:** `netlify.toml` en el repo tiene prioridad sobre los ajustes de la UI de
Netlify, así que **fundir la rama ES el cutover**. Es deliberado (el preview prueba la misma
configuración que producción), pero no hay paso intermedio de seguridad.

- [ ] **Step 1: Crear `netlify.toml`**

Build command `pnpm install && pnpm --filter web build`, publish `web/dist`.

- [ ] **Step 2: [Controlador] Fijar las variables de entorno en Netlify**

`SANITY_PROJECT_ID` y `SANITY_DATASET`, sin prefijo `PUBLIC_`.

- [ ] **Step 3: Verificar el deploy preview de la rama**

Expected: las dos URLs sirven el contenido de Sanity, con las meta tags de su idioma.

- [ ] **Step 4: Fundir la rama**

El auto-deploy publica. *Aquí ocurre el cutover.*

- [ ] **Step 5: Verificar producción**

Run: `curl -s https://ingefrenreyes.netlify.app/ | grep -c 'og:locale.*es_ES'` y lo
equivalente en `/en/`.
Expected: las dos responden 200 con su idioma; los `hreflang` apuntan bien. Comprobar las
tarjetas de OG en el depurador de enlaces de Facebook y de LinkedIn — el `og:image` ahora se
sirve desde el CDN de Sanity y es la primera vez que se prueba de verdad.

**Vuelta atrás si algo sale mal:** rollback al deploy anterior desde Netlify. Sigue
disponible porque `index.html` existe en el repo hasta la tarea 13.

- [ ] **Step 6: [Controlador] Build hook, webhook y Studio**

Crear el build hook en Netlify; crear el webhook en Sanity filtrado a los ocho tipos de
documento; desplegar el Studio en `portafolio-efren.sanity.studio` (si está tomado,
`efren-reyes-portafolio`); invitar a Efren como editor. **Probar el webhook a mano**:
publicar un cambio en el Studio y comprobar que dispara un build.

---

## Task 13: Limpieza y respaldo

Solo después de que la tarea 12 confirmara que producción vive sin los archivos viejos.

- [ ] **Step 1: Respaldar el dataset**

Run: `pnpm --filter studio sanity dataset export production ~/Backups/portafolio-efren-<fecha>.tar.gz`

El dataset es ahora la única copia del contenido. Esta es la recomendación que quedó sin
aplicar en la migración anterior.

- [ ] **Step 2: Borrar los archivos del sitio viejo**

`index.html` y **todo** `assets/`: `js/`, `css/`, `scss/`, `img/plans/`,
`img/profile.webp`, `pdf/`, **`img/favicon.ico` e `img/favicon_io/`**. Los favicons ya se
copiaron a `web/public/` en el paso 2 de la tarea 7; si no se borran aquí, sobreviven
huérfanos y nada los sirve.

- [ ] **Step 3: Agregar `.gitattributes`**

`* text=auto eol=lf`. **En este orden:** agregarlo antes renormalizaría los archivos CRLF
que acaban de borrarse y produciría un diff enorme que taparía el cambio real.

- [ ] **Step 4: Verificar que producción sigue en pie y el repo está limpio**

Run: `curl -sI https://ingefrenreyes.netlify.app/ | head -1 && git status --short`

- [ ] **Step 5: Escribir las notas de la migración**

`docs/superpowers/notes/2026-11-17-migracion-decisiones.md`, con el mismo formato que las de
la migración anterior: los *por qué*, los rulings tomados en nombre de Victor y el trabajo
pendiente que se difirió a propósito.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: eliminar el sitio estático y normalizar saltos de línea"
```
