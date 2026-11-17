# Migración a Astro + Sanity — Portafolio Efren

**Fecha:** 2026-11-17
**Estado:** **aprobado por Victor** el 2026-11-17. Las dos preguntas abiertas del borrador
quedaron contestadas ese mismo día (ver "Decisiones de Victor").
**Revisión:** pasó por un revisor independiente el 2026-11-17. Sus hallazgos están
integrados; los cambios respecto al primer borrador se listan en "Correcciones tras la
revisión" al final.

## Decisiones de Victor

1. **El proyecto se crea en la cuenta de Victor** (`vicalregu@gmail.com`, organización
   `oHNPn8dSJ`), con el nombre "Portafolio Efren" y un dataset `production`.

   Consecuencia que queda registrada a propósito: **Efren entra como editor de contenido,
   no como dueño.** Puede crear, editar y publicar todo el contenido, que es el objetivo;
   pero invitar miembros, cambiar de plan, redesplegar el Studio o borrar el proyecto
   siguen siendo de Victor. El anti objetivo "que Efren necesite a Victor **para
   publicar**" se cumple; la administración de la cuenta no, y es una decisión consciente,
   no un olvido. Mover el proyecto a una cuenta de Efren más adelante es posible sin
   migrar contenido (Sanity permite transferir proyectos entre organizaciones), así que la
   decisión es reversible.

   Efren necesita un asiento. El plan gratuito admite 20, y este proyecto usará 2.

2. **El copy de SEO en inglés lo redacto yo**, para que Victor lo revise. Los valores
   concretos están en "El copy de SEO en inglés".

## Intención y por qué

El portafolio de Efren Reyes es hoy un `index.html` de 585 líneas servido como sitio
estático en Netlify (`ingefrenreyes.netlify.app`, repo `vreyesg26/ERPortfolio`). Todo el
contenido está escrito a mano en el HTML **y otra vez** en el objeto `translations` de
`assets/js/main.js`, con unas 45 claves por idioma.

Esa duplicación es el problema real. Agregar un proyecto nuevo hoy exige tres ediciones en
dos archivos (el `<article>` en el HTML, la clave `planN.title` en inglés y la clave en
español), más un commit y un push. Cambiar una palabra de la sección "Sobre mí" exige
editarla en cuatro lugares. Nadie que no sepa HTML puede tocar el sitio.

El objetivo es que **todo** el contenido viva en Sanity y Efren lo administre desde un
panel web, en los dos idiomas, sin tocar código ni pedírselo a Victor.

De paso se arregla una falla de SEO que el sitio tiene hoy y que no se puede arreglar sin
cambiar de arquitectura: ver "El problema de SEO que existe hoy".

## Objetivos

1. **Paridad visual exacta.** El sitio se ve y se comporta igual que hoy: mismo diseño,
   mismos colores, mismos tabs, mismo tema claro/oscuro, **mismas animaciones**. Un
   visitante no debería notar el cambio.
2. **Todo el contenido administrable desde Sanity**, en español e inglés: perfil, foto,
   profesión, redes, los tres números, los dos CV, los 11 proyectos, los 4 párrafos de
   "Sobre mí", las aptitudes con su nivel, los nombres de los tabs y las meta tags de SEO.
3. **Los dos idiomas se administran desde Sanity**, no desde un archivo de traducciones.
4. **El SEO mejora, no empeora.** Cada idioma pasa a tener su propia URL indexable con sus
   propias meta tags, y las tarjetas al compartir el link (WhatsApp, LinkedIn, Facebook)
   siguen funcionando.
5. **Componentizado.** Nada de un archivo monolítico: un componente por pieza visual.
6. Los tipos de TypeScript se **generan** desde el esquema y las queries con
   `sanity typegen`, no se escriben a mano.
7. Cero infraestructura de pago. Plan gratuito de Sanity, Studio desplegado gratis en
   `*.sanity.studio`, mismo sitio de Netlify.

## Estado actual — inventario completo del contenido

Verificado el 2026-11-17 leyendo `index.html`, `assets/js/main.js` y `assets/css/styles.css`.

### Perfil (cabecera)

| Pieza | Valor actual | ¿Traducible? |
|---|---|---|
| Foto | `assets/img/profile.webp` | no |
| Nombre | Efren Eduardo Reyes Gudiel | no |
| Profesión | Civil Engineer / Ingeniero Civil | **sí** |
| Redes | Instagram, LinkedIn, Facebook (3 enlaces con icono) | no |
| Números | +1, +4, 3 | no |
| Leyendas de los números | "Years of work", "Completed projects", "Satisfied customers" | **sí** |
| Botón CV | Etiqueta + **un PDF distinto por idioma** | **sí** |
| WhatsApp | número `+50495025008` + mensaje preescrito | mensaje **sí** |
| Messenger | `https://m.me/efren.reyes24` | no |

Las tres leyendas llevan un `<br>` en medio ("Years of `<br>` work").

### Tabs

Tres: About, Projects, Skills. Etiquetas traducibles. **El que abre por defecto es
Projects**, no el primero.

### Sobre mí

Cuatro párrafos, traducibles, sin formato enriquecido.

### Proyectos

Once tarjetas. Cada una: imagen `.webp`, texto `alt`, título y un enlace a Google Drive.
Título y `alt` son traducibles y **no siempre coinciden** (proyecto 2: título "Curvas de
nivel", alt "Plano de curvas de nivel").

### Aptitudes

Dos categorías con nueve aptitudes:

- **Design** (traducible → "Diseño"): Autocad, Civil 3D, Revit, Etabs, Sap 2000
- **Microsoft** (no se traduce, es nombre propio): Word, Excel, Project, Power Point

Los nombres de las herramientas no se traducen. El nivel sí: ocho están en
"Intermediate" y solo Excel en "Advanced".

El HTML parte cada categoría en dos `skills__group` (columnas). Eso es **presentación, no
contenido**: Design queda 3+2 y Microsoft 3+1, simplemente para llenar dos columnas. No se
modela en Sanity; el frontend parte la lista.

### Pie de página

`<span class="footer__copy">` está **vacío**. No hay nada que migrar. El esquema le deja un
campo opcional por si Efren quiere poner algo.

### Meta tags de SEO

`description`, `keywords`, `author`, `theme-color`, siete `og:*` y cinco `twitter:*`.

**Inconsistencia actual:** el HTML declara `lang="en"` y su contenido visible está en
inglés, pero **todas las meta tags están en español** y `og:locale` es `es_ES`. Google y
las tarjetas de redes ven español; el visitante ve inglés. La migración lo arregla.

### Animaciones (inventario para la paridad)

1. **ScrollReveal al cargar.** Base: `origin: top`, `distance: 60px`, `duration: 2500`,
   `delay: 400`. Ocho objetivos con retrasos escalonados: `.profile__border` (400),
   `.profile__name` (500), `.profile__profession` (600), `.profile__social` (700),
   `.profile__info-group` (700 con `interval: 100`), `.profile__buttons` (800),
   `.filters__content` (900), `.filters` (1000).
2. **Cambio de tab.** La pastilla activa se mueve de inmediato; el panel que sale baja a
   `opacity: 0` en 200 ms, se intercambia el contenido mientras es invisible (así el salto
   de altura no se ve) y el nuevo aparece. Un `clearTimeout` evita que los clics rápidos
   encolen intercambios.
3. **Cambio de idioma.** `body.language-switching` lleva todo `[data-i18n]` a `opacity: 0`
   en 200 ms, se reemplaza el texto y vuelve a aparecer.
4. **Tema claro/oscuro.** `body { transition: .3s }` para que los colores no salten.
5. **Hover de las tarjetas de proyecto.** `.projects__modal` sube de `bottom: -100%` a `0`
   en 300 ms con un degradado encima.
6. **Hover** de botones, enlaces sociales y tabs: 300 ms.

### El problema de SEO que existe hoy

**Los dos idiomas viven en la misma URL.** El cambio es JavaScript más `localStorage`, así
que el HTML que recibe Google solo contiene un idioma: el que esté escrito a mano en
`index.html` (inglés). La versión en español **no existe como documento indexable**, pese a
que todas las meta tags están en español.

Esto no se arregla con un SPA, con prerender ni con un script que inyecte meta tags: hace
falta que cada idioma sea su propia URL. Es la razón principal por la que este diseño usa
un generador de sitios estáticos y no React + Vite.

## No objetivos

- **Rediseñar.** No se toca el diseño visual. Si algo se ve distinto, es un error.
- **Un tercer idioma.** El modelo admite agregarlo, pero no se construye nada para eso.
- **Formulario de contacto.** Los canales siguen siendo WhatsApp y Messenger.
- **Blog o secciones nuevas.**
- **Preview en vivo del Studio** (Presentation / Visual Editing). Es un buen siguiente paso,
  no entra aquí.
- **Dominio propio.** Se queda en `ingefrenreyes.netlify.app`.
- **Reescribir el CSS** a CSS Modules, Tailwind o similar. El SCSS actual se conserva.

## Anti objetivos

Cosas que harían fracasar la migración aunque técnicamente funcione:

- **Que Efren necesite a Victor para publicar.** Si queda un solo dato que exija un commit,
  no se cumplió el objetivo.
- **Que las tarjetas al compartir el link se rompan.** Hoy funcionan. Si después de la
  migración WhatsApp o LinkedIn muestran un link pelado, es un retroceso visible.
- **Que las animaciones queden "parecidas".** La aparición escalonada del perfil es lo
  primero que se ve del sitio. Si los retrasos cambian, se nota.
- **Perder el contenido actual.** Los 11 proyectos, sus enlaces de Drive y los dos PDF son
  el activo real. El `index.html` actual es la única copia de los textos en ambos idiomas.
- **Un esquema que Efren no entienda.** Nombres de campo en inglés técnico o un cajón de
  sastre de 40 campos sueltos no sirve de nada aunque sea correcto.

## Restricciones

- **Netlify, mismo sitio.** `ingefrenreyes` (id `ad73e83f-4f35-494d-8ac3-fab9d8700239`,
  plan `nf_team_dev`), conectado a `vreyesg26/ERPortfolio`, rama `main`.
- **Proyecto de Sanity nuevo**, llamado "Portafolio Efren", separado del proyecto
  "Portfolio" (`qyhogq09`) que es el de Victor.
- **Plan gratuito de Sanity.** Este proyecto usará ~29 documentos y 14 assets; el límite
  libre es 10.000 documentos.
- **Convenciones del repo `Portfolio Admin` de Victor.** Monorepo pnpm con `studio/` y el
  frontend aparte, `defineField`/`defineType`, singletons vía `structure.ts`, campo `order`
  obligatorio, `defineQuery` + `sanity typegen`, Vitest. Se calcan.
- **El sitio actual no puede caerse.** Netlify sigue sirviendo el build actual hasta que se
  cambien los ajustes de build, que es el último paso.
- **Saltos de línea CRLF.** `index.html`, `main.js` y los parciales SCSS están en CRLF;
  `styles.css` en LF, y no hay `.gitattributes`. Reescribir un archivo completo con una
  herramienta que normalice saltos convierte un cambio de 40 líneas en un diff de 1000.
- **`styles.css` está editado a mano** y ya no corresponde al SCSS. Ver "La deriva del CSS".
- **El Studio lo va a usar Efren**, no un desarrollador: etiquetas y descripciones en
  español, validación estricta, sin campos ambiguos.

## Enfoques considerados

Dos ejes independientes. Victor eligió en la conversación del 2026-11-17.

### Eje 1 — Qué tecnología sirve las páginas

**A — React + Vite como SPA** (lo que Victor pidió al principio)

Paridad exacta con su `Portfolio Admin`: `@sanity/client` en el navegador, TanStack Query,
prefetch al arrancar. Efren publica y se ve al instante, sin rebuild.

Descartado: sirve un `index.html` vacío. WhatsApp, LinkedIn y Facebook no ejecutan
JavaScript, así que las meta tags no pueden venir de Sanity sin romper las tarjetas. Y no
resuelve el problema de fondo: los dos idiomas seguirían compartiendo una sola URL.

**B — React + Vite con un script que inyecte las meta tags en el build**

Igual que A, pero un script de Node escribe las meta tags en `dist/index.html` al construir.
Las tarjetas sobreviven y el SEO se administra.

Descartado: es un parche. Arregla las meta tags pero deja el problema de las URLs por
idioma intacto, y agrega código propio que hay que mantener.

**C — Astro con generación estática**  ← **elegido**

Astro está construido sobre Vite y corre componentes React con `@astrojs/react`, así que no
se abandona lo que Victor pidió: se le agrega HTML real. El contenido se pide a Sanity **en
el build** y se escribe en el HTML. El enrutado i18n es nativo: `/` en español y `/en` en
inglés, con `hreflang` y fallback. Cada idioma es su propio documento con sus propias meta
tags, sin inyectar nada.

Lo que cuesta: Efren publica y necesita un rebuild (~40 s) para verlo. Se resuelve con un
Build Hook de Netlify y un webhook en Sanity.

**D — Next.js**

Haría el trabajo. Descartado porque el valor de Next es renderizar en servidor datos
dinámicos, personalizados o que cambian seguido, más ISR; este sitio no tiene login, ni
formularios, ni escrituras, ni nada por usuario, y el contenido cambia unas pocas veces al
mes. Además el App Router quitó el i18n nativo (habría que armarlo con `[lang]` y
middleware) y en Netlify requiere `@netlify/plugin-nextjs` y funciones serverless, cuando
Astro produce un `dist/` de HTML plano: el mismo modelo de deploy que hoy.

### Eje 2 — Cómo se modelan los dos idiomas en Sanity

**A — Objetos `localeString` / `localeText` con los campos `es` y `en` dentro**  ← **elegido**

Un documento por entidad. Lo que no cambia entre idiomas (imagen, URL de Drive, orden) se
escribe una sola vez; lo traducible lleva los dos idiomas adentro. Las queries reciben
`$lang` y proyectan plano. Efren ve los dos campos lado a lado, así que no se le olvida
traducir, y la validación puede exigir ambos.

**B — Plugin oficial `internationalizedArray`**

Lo mismo, guardado como `[{_key: 'es', value}]`. Más estándar y escala a un tercer idioma
sin migrar los datos, a cambio de GROQ más incómodo (`title[_key == "es"][0].value`) y una
dependencia más.

Descartado: con dos idiomas fijos el beneficio no paga la incomodidad en cada query.

**C — Plugin `document-internationalization` (un documento por idioma)**

11 proyectos × 2 = 22 documentos, duplicando imagen, enlace de Drive y orden en los dos.
Descartado: trabajo manual de más para Efren y riesgo de que las dos versiones se
desincronicen.

## Arquitectura resultante

El repo actual se convierte en monorepo pnpm, **conservando el mismo repo de GitHub y el
mismo sitio de Netlify**:

```
mini-portfolio-website/            (repo vreyesg26/ERPortfolio)
├── pnpm-workspace.yaml
├── netlify.toml                   build command y publish dir
├── .gitattributes                 normaliza saltos de línea (se agrega al final)
├── docs/superpowers/              specs, plans, notes
├── studio/                        Sanity Studio
│   ├── sanity.config.ts
│   ├── sanity.cli.ts
│   ├── structure.ts               singletons + colecciones ordenadas
│   ├── schemaTypes/
│   │   ├── index.ts
│   │   ├── objects/               localeString, localeText, socialLink, stat
│   │   └── documents/             profile, about, interfaceText, seo,
│   │                              tab, project, skillCategory, skill
│   └── scripts/seed.ts            carga inicial del contenido actual
└── web/                           sitio Astro
    ├── astro.config.mjs           i18n: es por defecto, en con prefijo
    ├── src/
    │   ├── layouts/BaseLayout.astro
    │   ├── pages/index.astro      español  →  /
    │   ├── pages/en/index.astro   inglés   →  /en/
    │   ├── components/            un componente por pieza
    │   ├── islands/               Tabs.tsx, ThemeToggle.tsx (React)
    │   ├── lib/                   sanity.ts, queries.ts, image.ts
    │   ├── styles/                el SCSS migrado
    │   └── sanity.types.ts        generado por typegen
    └── public/                    favicons
```

El directorio se llama `web/` y no `frontend/` porque ya no es solo un frontend: es el que
genera el HTML.

### Qué se borra

`index.html`, `assets/js/main.js`, `assets/js/scrollreveal.min.js` y `assets/img/plans/`
desaparecen **al final**, una vez verificado que producción vive con el sitio nuevo. Mismo
orden que usó Victor en su migración anterior: revisar la rama, fundir, verificar
producción, y entonces borrar.

Los favicons de `assets/img/favicon_io/` se mueven a `web/public/`.

### Dependencias

`studio/`: `sanity` 6.23.0, `@sanity/vision` 6.x, `react` 19, `styled-components`
(lo pide Sanity), `typescript` ~5.9.3. Las mismas versiones que `Portfolio Admin`, para que
el `sanity.types.ts` generado compile igual en los dos proyectos.

`web/`: `astro` 7.4.x, `@astrojs/react` 7.1.x, `@sanity/astro` 4.0.0, `@sanity/client`
8.16.0, `@sanity/image-url` 2.1.x, `sass`, `remixicon` 4.9.1, `scrollreveal` 4.0.9,
`react` 19. Dev: `vitest`, `typescript`.

**Remixicon pasa a ser un paquete de npm**, no el `<link>` a jsdelivr que hay hoy: una
petición externa menos y los iconos dejan de depender de un CDN ajeno.

El sitio carga hoy la **2.5.0**, y Remixicon renombró glifos de marcas en la v3, así que
subir a 4.9.1 podía cambiar iconos en silencio. **Verificado el 2026-11-17 contra el CSS
publicado de 4.9.1:** los 12 glifos que usa el sitio existen todos
(`ri-instagram-line`, `ri-linkedin-box-line`, `ri-facebook-box-line`, `ri-whatsapp-line`,
`ri-messenger-line`, `ri-global-line`, `ri-moon-line`, `ri-sun-line`, `ri-eye-line`,
`ri-download-line`, `ri-checkbox-circle-line`, `ri-arrow-up-line`). La versión se fija
exacta, no con `^`, para que una actualización no vuelva a abrir el riesgo.

`socialLink.icon` se queda como string libre y no como lista cerrada: una clase mal
escrita deja un cuadro vacío que se ve de inmediato en el Studio, no una sección perdida
en silencio como sería el caso de `tab.key`.

**No se usa `@astrojs/netlify`.** Con `output: 'static'` Astro produce un `dist/` de
archivos planos y Netlify los sirve directo; el adaptador solo hace falta para SSR.

## Modelo de contenido

Convenciones, calcadas de `Portfolio Admin`:

- Nombres de tipo y de campo en **inglés camelCase** (son código). Los `title` y
  `description` que Efren ve en el Studio, **en español**.
- Las colecciones con orden curado llevan `order` (número) **obligatorio**, y
  `structure.ts` las lista por ese campo. GROQ no define dónde caen los nulos al ordenar,
  así que un `order` opcional es un orden impredecible.
- Los textos **no se procesan**: sus saltos de línea se pintan con `white-space: pre-line`.
  Así se resuelven los `<br>` de las leyendas de los números sin meter HTML en el CMS.
- Las imágenes se proyectan **completas** (no solo `asset->{_id, url}`) para que el hotspot
  y el recorte lleguen de verdad a la URL generada.

### Objetos reutilizables

**`localeString`** — texto corto traducible. Los dos idiomas obligatorios.

| Campo | Tipo | Studio |
|---|---|---|
| `es` | string | Español |
| `en` | string | Inglés |

**`localeText`** — igual, con `text` (multilínea) en vez de `string`.

**`socialLink`** — una red social.

| Campo | Tipo | Notas |
|---|---|---|
| `name` | string | Para el `aria-label`. Hoy los enlaces no tienen nombre accesible: es un error de accesibilidad que se arregla aquí. |
| `icon` | string | Clase de Remixicon, p. ej. `ri-instagram-line` |
| `url` | url | |

**`stat`** — uno de los tres números del perfil.

| Campo | Tipo | Notas |
|---|---|---|
| `value` | string | `+1`, `+4`, `3`. Es string, no número: el `+` es parte del dato. |
| `label` | **localeText** | Multilínea a propósito: las tres leyendas llevan un salto de línea en medio ("Years of / work") y un campo `string` del Studio es de una sola línea, así que Efren no podría teclearlo. Se pinta con `white-space: pre-line`. |

### Singletons (4)

Un solo documento cada uno, con `_id` fijo igual al nombre del tipo. No se pueden crear,
duplicar, borrar ni despublicar desde el Studio (igual que en `Portfolio Admin`).

**`profile`** — "Perfil"

| Campo | Tipo | Oblig. |
|---|---|---|
| `photo` | image (con `alt`) | sí |
| `name` | string | sí |
| `profession` | localeString | sí |
| `socialLinks` | array de `socialLink` | sí, mín. 1 |
| `stats` | array de `stat` | sí, exactamente 3 |
| `cvLabel` | localeString | sí |
| `cvEs` | file (PDF) | sí |
| `cvEn` | file (PDF) | sí |
| `whatsappPhone` | string | sí |
| `whatsappMessage` | localeString | sí |
| `messengerUrl` | url | no |

`stats` se valida con exactamente 3 elementos porque el CSS es una grilla de tres columnas;
un cuarto rompería el diseño en silencio.

**`about`** — "Sobre mí"

| Campo | Tipo | Oblig. |
|---|---|---|
| `paragraphs` | array de `localeText` | sí, mín. 1 |

Es un array y no cuatro documentos: se reordena arrastrando y se agrega un párrafo sin
tocar nada más.

**`interfaceText`** — "Textos de interfaz"

Las cadenas que no son contenido pero que igual hay que traducir.

| Campo | Tipo | Notas |
|---|---|---|
| `levelBasic` | localeString | "Básico" / "Basic" |
| `levelIntermediate` | localeString | "Intermedio" / "Intermediate" |
| `levelAdvanced` | localeString | "Avanzado" / "Advanced" |
| `languageToggleLabel` | localeString | El `aria-label` del botón de idioma |
| `viewPlanLabel` | localeString | `aria-label` del botón del ojo en cada proyecto. Hoy no existe: otro arreglo de accesibilidad. |
| `footerText` | localeString | Opcional. Hoy el pie está vacío. |

**`seo`** — "SEO y redes sociales"

| Campo | Tipo | Notas |
|---|---|---|
| `title` | localeString | El `<title>` y `og:title` |
| `description` | localeText | `description`, `og:description`, `twitter:description` |
| `keywords` | localeString | Separadas por coma |
| `author` | string | |
| `siteName` | localeString | `og:site_name`. Su valor actual, "Efren Reyes - Ingeniero Civil", está en español: la página en inglés necesita el suyo. |
| `siteUrl` | url | Base para `og:url` y los canónicos |
| `ogImage` | image | Hoy reusa la foto de perfil |
| `themeColor` | string | `#000000` hoy |

`og:locale` y `hreflang` **no son campos**: se derivan del idioma de la página.

### Colecciones (4)

**`tab`** — "Pestañas" (3 documentos)

| Campo | Tipo | Notas |
|---|---|---|
| `key` | string con lista fija `about` / `projects` / `skills` | **Obligatorio.** Es la clave con la que el frontend decide qué componente pintar. Lista fija, no slug libre: si Efren pudiera inventar una clave, la pestaña dejaría de renderizar en silencio. |
| `label` | localeString | sí |
| `order` | number | sí |
| `isDefault` | boolean | La que abre al cargar. Hoy es Projects, no la primera. |

`key` se valida **único** y los tres documentos se protegen contra borrado **y contra
creación**, como si fueran singletons. Sin eso, dos pestañas con `key: 'projects'` o un
`about` borrado quitarían una sección en silencio: el mismo fallo que la lista fija pretende
evitar. Y como `key` es una lista cerrada de tres valores que ya existen, una cuarta pestaña
sería inguardable: el botón de crear solo podría producir un borrador muerto.

Sobre `isDefault`, **refinamiento posterior a la aprobación** (2026-11-17, tras la revisión
de la tarea 4): el borrador decía "se valida que exactamente un `tab` tenga `isDefault`".
Se implementa como **"como mucho uno"**, no "exactamente uno". La intención del spec —que
siempre abra una pestaña y solo una— se conserva, porque quien la garantiza de verdad es el
frontend: `resolveDefaultTab` cae a la de menor `order` cuando hay cero o varias marcadas, y
eso está en el Review Focus del plan y lo cubre un test de la tarea 6.

Exigir exactamente uno desde el Studio obligaba a editar en dos pasos para mover el default
de una pestaña a otra (marcar la nueva da error mientras la vieja siga marcada; desmarcar la
vieja primero da error hasta guardar la nueva), y hacía que la cuenta dependiera de
borradores sin guardar: una pestaña publicada con `isDefault: true` y un borrador obsoleto
en `false` se contaba dos veces. "Como mucho uno" elimina las dos cosas sin perder la
garantía.

**`project`** — "Proyectos" (11 documentos)

| Campo | Tipo | Notas |
|---|---|---|
| `title` | localeString | sí |
| `image` | image (hotspot) | sí |
| `alt` | localeString | Opcional. Si está vacío, la query cae al `title`. |
| `driveUrl` | url | sí |
| `order` | number | sí |

`alt` es un campo aparte y no se deriva del título porque hoy difieren en varios proyectos.
Opcional con fallback para no obligar a Efren a escribir lo mismo dos veces cuando coinciden.

**`skillCategory`** — "Categorías de aptitudes" (2 documentos)

| Campo | Tipo | Notas |
|---|---|---|
| `title` | localeString | "Diseño"/"Design" y "Microsoft"/"Microsoft" |
| `order` | number | sí |

"Microsoft" es igual en los dos idiomas; se escribe dos veces. Es más simple que un
interruptor de "no traducir".

**`skill`** — "Aptitudes" (9 documentos)

| Campo | Tipo | Notas |
|---|---|---|
| `name` | **string**, no localeString | Autocad es Autocad en los dos idiomas |
| `level` | string con lista `basic` / `intermediate` / `advanced` | La etiqueta visible vive en `interfaceText` |
| `category` | reference → `skillCategory` | sí |
| `order` | number | sí |

Mismo patrón `technology` → `technologyCategory` de `Portfolio Admin`.

### Recuento esperado tras la carga inicial

| Tipo | Documentos |
|---|---|
| `profile`, `about`, `interfaceText`, `seo` | 4 |
| `tab` | 3 |
| `project` | 11 |
| `skillCategory` | 2 |
| `skill` | 9 |
| **Total** | **29** |

Assets: 1 foto de perfil + 11 planos + 2 PDF = **14**.

### Estructura del Studio

```
Contenido
├── Perfil
├── Sobre mí
├── SEO y redes sociales
├── Textos de interfaz
├── ────────────────
├── Pestañas              (ordenadas por `order`)
├── Proyectos             (ordenadas por `order`)
├── Categorías de aptitudes (ordenadas por `order`)
└── Aptitudes             (ordenadas por `order`)
```

## Las queries y el parámetro `$lang`

Cada query se declara con `defineQuery()` y un nombre único en todo el proyecto (typegen
sobrescribe los duplicados en silencio). Reciben `$lang` y proyectan plano, de modo que los
componentes nunca ven la forma `{es, en}`:

```groq
*[_type == "project"] | order(order asc){
  _id,
  "title": coalesce(title[$lang], title.es),
  "alt":   coalesce(alt[$lang], title[$lang], title.es),
  driveUrl,
  image
}
```

El `coalesce` cae al español si falta una traducción: preferible a que el sitio muestre un
hueco. La validación del esquema ya exige los dos idiomas, así que es un cinturón de
seguridad, no la regla.

La página en español llama con `$lang: 'es'` y la de inglés con `$lang: 'en'`. **Son las
mismas queries y los mismos documentos**; solo cambia el parámetro.

## Idiomas y rutas

Configuración de i18n de Astro: `defaultLocale: 'es'`, `locales: ['es', 'en']`,
`prefixDefaultLocale: false`.

| Idioma | URL |
|---|---|
| Español | `https://ingefrenreyes.netlify.app/` |
| Inglés | `https://ingefrenreyes.netlify.app/en/` |

El español se queda en la raíz porque es lo que las meta tags actuales ya declaran
(`og:locale: es_ES`, description en español) y es el público principal.

Cada página emite `<link rel="alternate" hreflang="es|en|x-default">` apuntando a la otra,
más su `canonical`.

**Cambio de comportamiento, deliberado:** el botón de idioma pasa de intercambiar texto en
el sitio a ser un enlace a la otra URL. Con `<ClientRouter />` (view transitions de Astro)
la transición se siente instantánea y conserva el fundido de 200 ms, pero la URL cambia —
que es justamente el punto. Se pierde la detección automática por idioma del navegador que
hay hoy: redirigir desde la raíz perjudicaría al canónico. `hreflang` cumple ese papel de
cara a los buscadores.

## La deriva del CSS

`assets/css/styles.css` (613 líneas, LF) está **editado a mano después de compilarse** y ya
no corresponde a `assets/scss/` (CRLF). Son **siete** reglas, verificadas una por una el
2026-11-17. Las seis primeras son valores que difieren; la séptima es una regla que el SCSS
tiene y el CSS no:

| Regla | En el CSS (producción) | En el SCSS | Efecto si no se reconcilia |
|---|---|---|---|
| `.profile__perfil` | 120×120 px, `object-fit: cover` en la img (90 px) | 100×100 px, img 75 px | La foto de perfil se encoge |
| `.profile__border` | 135×135 px | 115×115 px | El aro de la foto se encoge |
| `.profile__perfil` | (sin `align-items`) | `align-items: flex-end` | La foto se descuadra |
| `.projects__card` | `max-height: 225px` | **no existe** | **Las 11 tarjetas pierden su tope de alto, en la pestaña que abre por defecto** |
| `.projects__card` | `cursor: pointer` | **no existe** | El cursor deja de indicar que la tarjeta es interactiva |
| `.projects__button` | `padding: .4rem` | `padding: .5rem` | El botón del ojo queda un poco más grande |
| `.profile__perfil` dentro de `@media (min-width: 992px)` | **no existe** | 120×120 px, img 90 px | Regla muerta en el CSS compilado. Sus valores son idénticos a la regla base, así que no tiene efecto visual, pero re-declara lo mismo en un breakpoint y confunde a quien lo lea después. |

**El CSS es la fuente de verdad** — es lo que está en producción, así que **las siete se
reconcilian**: las seis primeras se incorporan al SCSS, incluida la de `.4rem` (parece un
ajuste fino y no un experimento olvidado), y la séptima se **borra** del SCSS. La primera compuerta del plan es compilar el SCSS y comprobar que
reproduce el CSS actual; reconciliar solo las dos primeras la haría fallar sin que se sepa
por qué, y seguir de largo recortaría las tarjetas de proyecto en silencio.

Astro trae soporte de Sass; los parciales se conservan tal cual (`config/`, `base/`,
`theme/`, `layout/`, `components/`) como **un SCSS global** importado en el layout. No se
pasa a estilos con alcance por componente: los nombres de clase son BEM y se comparten
entre piezas, y aislarlos sería reescribir el CSS, que es un no objetivo.

## Cómo se migra cada animación

| Animación | Cómo queda |
|---|---|
| ScrollReveal al cargar | Un `<script>` en el layout con la misma configuración base y los mismos ocho objetivos y retrasos. **Más simple que en `Portfolio Admin`**: aquí el HTML llega ya renderizado del build, así que estamos en el caso del sitio original (todo en el DOM al cargar). No hace falta el indicador `ready` ni el escalonado manual que Victor tuvo que escribir para esquivar el re-sync. |
| Cambio de tab | Isla de React `Tabs.tsx` con `client:load`. Misma lógica: la pastilla se mueve ya, el panel se desvanece 200 ms, se intercambia, vuelve. Se conserva el `clearTimeout` contra clics rápidos. |
| Cambio de idioma | Enlace a la otra URL + `<ClientRouter />`. El CSS del fundido (`transition: opacity .2s`) se conserva. |
| Tema claro/oscuro | Isla `ThemeToggle.tsx`, más un **script inline en `<head>`** que lee `localStorage` antes del primer pintado. De paso elimina el parpadeo de tema claro que hoy se ve al recargar en oscuro. |
| Hover de las tarjetas | Es CSS puro: se migra con el SCSS, sin cambios. |
| Hover de botones y enlaces | Igual, CSS puro. |

El único JavaScript que llega al navegador es `Tabs`, `ThemeToggle`, el script del tema, el
de ScrollReveal y el router de las view transitions. Todo lo demás es HTML estático.

## Componentes

Astro (sin JavaScript al cliente): `BaseLayout`, `Seo`, `Profile`, `SocialLinks`, `Stats`,
`ProfileButtons`, `About`, `ProjectCard`, `ProjectGrid`, `SkillCategory`, `SkillItem`,
`Footer`.

React como isla (con estado): `Tabs`, `ThemeToggle`.

`SkillCategory` es quien parte la lista de aptitudes en columnas, reproduciendo los
`skills__group` del HTML actual. La regla es **trozos de 3**, que da exactamente el 3+2 de
Design y el 3+1 de Microsoft que hay hoy; partir por mitades daría 2+2 en Microsoft y
rompería la paridad.

**No se pone un máximo de aptitudes por categoría.** `.skills__box` es un flex centrado, así
que una séptima aptitud generaría una tercera columna. Se acepta: poder agregar aptitudes es
justamente lo que se busca, y degrada de forma razonable. La paridad visual se juzga
**contra el contenido que hay hoy**, no contra contenido futuro — por eso `stats` sí lleva un
límite duro de 3 (la grilla de tres columnas es fija y un cuarto número rompería el diseño
de inmediato) y las aptitudes no.

## El copy de SEO en inglés

No existía en el sitio: `index.html` solo tiene las meta tags en español y `main.js` solo
trae el `page.title` traducido. Victor delegó la redacción. Estos son los valores exactos
que entran en el singleton `seo`, para que los revise y los corrija si no le cuadran:

| Campo | Español (el actual, no se toca) | Inglés (nuevo) |
|---|---|---|
| `title` | Ingeniero Civil - Efren Reyes \| Portafolio | Civil Engineer - Efren Reyes \| Portfolio |
| `siteName` | Efren Reyes - Ingeniero Civil | Efren Reyes - Civil Engineer |
| `description` | Soy un Ingeniero Civil con +1 año de experiencia. Diseño y gestiono proyectos de infraestructura con soluciones innovadoras. ¡Conoce mis proyectos! | Civil Engineer from Honduras. Drafting, terrain modeling and quantity takeoffs in AutoCAD and Civil 3D for engineering firms and contractors. |
| `keywords` | Ingeniero Civil, Civil Engineer, Diseño, Infraestructura, Proyectos, Efren Reyes | Civil Engineer, Civil Engineering Drafting, AutoCAD, Civil 3D, Road Design, Earthwork, Quantity Takeoff, Infrastructure, Honduras, Efren Reyes |

El `title` y el `siteName` son traducciones directas; el `title` en inglés ya existía en
`translations`.

La `description` en inglés **no es una traducción literal**, y es deliberado. La española
dice "soluciones innovadoras", que es relleno que nadie busca. La página en inglés existe
para que la encuentren firmas de ingeniería y contratistas que buscan apoyo en dibujo y
diseño, así que nombra el servicio y las herramientas: es lo que esa gente teclea. Son 141
caracteres, dentro de los ~155 que Google muestra sin cortar. Si Victor prefiere la
traducción fiel del español, se cambia en un campo del Studio sin tocar código.

Nota honesta sobre `keywords`: Google la ignora desde 2009. Se conserva por paridad con el
sitio actual y porque algún otro rastreador la lee, pero no esperar nada de ella.

## Carga inicial del contenido

Un script `studio/scripts/seed.ts` con `@sanity/client` que:

1. Sube los 14 assets (foto, 11 planos, 2 PDF) desde `assets/`.
2. Crea los 29 documentos con `_id` determinista (`project-1` … `project-11`, etc.), de modo
   que volver a correrlo sea idempotente y no duplique nada.
3. Toma los textos de los dos idiomas del objeto `translations` de `main.js` y los enlaces de
   Drive del `index.html`.
4. Toma el copy de SEO en inglés de la tabla de la sección anterior, que es el único
   contenido que no existe en el sitio actual.

Es un script y no una tanda de llamadas a mano porque es revisable, repetible y deja
constancia de de dónde salió cada dato.

Después corre un `verify.ts` que comprueba los recuentos esperados, que ningún
`localeString` tenga un idioma vacío, que las 11 referencias de imagen resuelvan y que las
9 aptitudes apunten a una categoría existente.

## Despliegue

**Netlify** (sitio `ingefrenreyes`, sin cambiar de sitio ni de URL):

- Build command: `pnpm install && pnpm --filter web build`
- Publish directory: `web/dist`
- Variables de entorno: `SANITY_PROJECT_ID`, `SANITY_DATASET`

Las variables **no llevan el prefijo `PUBLIC_`**: el contenido se pide solo en el build, así
que no tienen por qué llegar al navegador.

**Build Hook + webhook de Sanity:** se crea un build hook en Netlify y un webhook en Sanity
filtrado a los nueve tipos de documento. Efren publica → Netlify reconstruye → ~40 s después
está en vivo.

**Studio:** se despliega con `sanity deploy` en **`portafolio-efren.sanity.studio`**.
Los subdominios son únicos en todo `sanity.studio`, así que si estuviera tomado el
siguiente es `efren-reyes-portafolio`. Es una URL que Efren va a guardar para siempre: si
Victor prefiere otra, se decide antes del primer deploy y después no conviene cambiarla. Hay que registrar
`http://localhost:3333` como origen CORS **con credenciales** para que `sanity dev` pueda
autenticar. El sitio público no necesita CORS: no pide nada desde el navegador.

**`netlify.toml` vive en la rama de trabajo desde el principio, y eso significa que
fundir la rama ES el cutover.** Un `netlify.toml` en el repo tiene prioridad sobre los
ajustes de la UI de Netlify, así que en el momento en que `main` recibe el merge, el
auto-deploy ya construye `web/dist`. Es deliberado: así el deploy preview usa exactamente
la misma configuración de build que va a usar producción, y el preview prueba lo que de
verdad se publica. Pero mueve el punto irreversible al merge, no a un paso posterior.

Hoy **no hay `netlify.toml`**, así que lo único que mantiene el sitio vivo son los ajustes
de la UI. No se tocan: quedan como respaldo inerte.

**Orden de los últimos pasos**, para no dejar producción a medias:

1. Verificar el sitio nuevo en un deploy preview, con la compuerta de paridad visual.
2. Victor aprueba el preview. **Esta es la última salida.**
3. Fundir la rama → el auto-deploy publica el sitio nuevo. *Aquí ocurre el cutover.*
4. Verificar producción: las dos URLs, las meta tags de cada una, los `hreflang` y las
   tarjetas de OG en el depurador de Facebook y de LinkedIn.
5. **Entonces** borrar `index.html` y `assets/`.
6. **Después de borrarlos**, agregar `.gitattributes`. En ese orden: agregarlo antes
   renormalizaría los archivos CRLF que de todos modos se van a borrar, y produciría un diff
   enorme que taparía el cambio real.

Si el paso 4 sale mal, la vuelta atrás es un rollback al deploy anterior desde Netlify, que
sigue disponible porque `index.html` todavía existe en el repo hasta el paso 5.

## Cómo se verifica la paridad visual

Es el objetivo 1 y dos de los anti objetivos, así que necesita una compuerta y no buena
voluntad. Dos partes:

**1. Líneas base, antes de tocar nada.** Capturas del sitio **en producción**, tomadas
**antes** de reconciliar el SCSS y mucho antes de borrar `assets/`. Después del paso 5 ya no
hay con qué comparar. Las capturas cubren:

- Los anchos de los breakpoints reales del CSS: **320, 576, 776, 968 y 992 px**, más uno de
  escritorio holgado (1280).
- **Los dos temas**, claro y oscuro.
- **Las tres pestañas**, no solo la que abre por defecto.
- Los dos idiomas.

Son 4 ejes, así que no es una captura por combinación: el conjunto mínimo es cada ancho en
tema claro con la pestaña Projects, más una pasada de las tres pestañas y de los dos temas
en un ancho de móvil y uno de escritorio.

**2. Comparación y firma.** El implementador compara el deploy preview contra esas líneas
base y reporta las diferencias que encuentre. **Victor aprueba el preview antes del merge**
(paso 2 del cutover). Su disponibilidad es una dependencia bloqueante entre el final de la
implementación y el cutover, y está puesta a propósito: el merge es irreversible.

## Qué queda a criterio de quien lo implemente

- Cómo partir exactamente los parciales SCSS dentro de `web/src/styles/`.
- Los anchos concretos que se le pasan a `@sanity/image-url` por imagen (pero **hay que
  pasarlos**: omitirlos sirve cada imagen a tamaño original, un hueco que quedó pendiente en
  la migración anterior).
- La forma interna del script de carga inicial, siempre que sea idempotente.
- Qué tanto cubren los tests. Lo mínimo acordado: forma del esquema, que las queries
  proyecten los campos que los componentes consumen, y los recuentos del `verify.ts`.
- Si `Tabs` y `ThemeToggle` comparten un hook de `localStorage` o no.

## Riesgos conocidos

| Riesgo | Mitigación |
|---|---|
| Compilar el SCSS revierte los arreglos hechos a mano en el CSS | Reconciliar primero y comparar el CSS compilado contra el actual antes de seguir |
| Una reescritura completa de archivos CRLF genera un diff ilegible | Los archivos CRLF se borran, no se editan; `.gitattributes` va al final |
| ScrollReveal y las view transitions pueden pelearse: al navegar entre `/` y `/en` los elementos ya revelados podrían volver a ocultarse | Verificar a ojo el cambio de idioma; si molesta, excluir el perfil del reveal al navegar, o quitar `<ClientRouter />` y aceptar una navegación normal |
| Un `og:image` servido desde el CDN de Sanity podría no previsualizarse en algún cliente | Verificar con el depurador de enlaces de Facebook y LinkedIn tras el deploy |
| El sitio queda congelado hasta el rebuild si el webhook falla | El build hook se prueba a mano antes de cerrar; además el deploy manual siempre está disponible |
| El dataset de Sanity pasa a ser la única copia del contenido | `sanity dataset export` tras la carga inicial, guardado fuera del repo |

## Decisiones que tomé yo

Sin consultar a Victor, por ser reversibles o de proceso:

1. **Monorepo en el mismo repo de GitHub**, en vez de un repo nuevo. Conserva el historial y
   la conexión con Netlify.
2. **La carpeta se llama `web/`**, no `frontend/`, porque ahora genera el HTML.
3. **El español se queda en `/`** y el inglés en `/en/`. Hoy el render por defecto es inglés,
   pero todas las meta tags y el `og:locale` ya dicen español.
4. **El Studio en español**, asumiendo que Efren lo va a usar sin Victor.
5. **Remixicon como paquete de npm** en vez del `<link>` a jsdelivr.
6. **Sin `@astrojs/netlify`**: con salida estática no hace falta.
7. **`stats` validado a exactamente 3** elementos, por la grilla de tres columnas.
8. **`alt` opcional con fallback al título**, para no obligar a escribir lo mismo dos veces.
9. **`tab.key` con lista fija** en vez de slug libre, para que no se pueda romper una
   pestaña escribiendo mal una clave.
10. **Se agregan nombres accesibles** a los enlaces sociales y al botón del ojo de cada
    proyecto, que hoy no tienen ninguno. Es un arreglo, no un rediseño.
11. **El script inline del tema** en `<head>`, que elimina el parpadeo actual al recargar.

Y estas, tras la revisión del 2026-11-17:

12. **Las siete reglas de deriva se reconcilian**, incluida `padding: .4rem`, porque el
    principio ya estaba fijado: el CSS en producción es la fuente de verdad. Seis se
    incorporan al SCSS y la del breakpoint redundante se borra.
13. **`stat.label` pasa a `localeText`.** Era un error: un `string` del Studio es de una
    sola línea y las leyendas necesitan un salto. Esto agrega una declaración
    `white-space: pre-line` al SCSS, que roza el no objetivo de "no reescribir el CSS"; una
    declaración nueva no es una reescritura, y es la misma convención que Victor ya usa en
    `Portfolio Admin`.
14. **`seo.siteName` pasa a `localeString`**, porque su valor actual está en español.
15. **`tab.key` se valida único y los tres `tab` se protegen contra borrado.**
16. **La partición de aptitudes es en trozos de 3, sin máximo**, y la paridad se juzga
    contra el contenido de hoy.
17. **Remixicon se fija en 4.9.1 exacta**, con los 12 glifos verificados.
18. **`netlify.toml` va en la rama**, así que el merge es el cutover y la aprobación de
    Victor se mueve delante del merge.
19. **Las capturas de línea base se toman al principio del plan**, no al final.

## Correcciones tras la revisión

Un revisor independiente leyó el borrador el 2026-11-17 con el encargo de reportar solo lo
que tendría que adivinar. Levantó ocho puntos. Seis se resolvieron y están arriba
(decisiones 12 a 19); dos no los puede resolver nadie más que Victor y están en "Preguntas
abiertas".

Lo que el borrador tenía **mal**, no solo incompleto:

- **La deriva del CSS eran siete reglas, no dos.** El borrador afirmaba que estaba toda en
  `.profile__perfil` y `.profile__border`. Faltaban `max-height: 225px` y `cursor: pointer`
  en `.projects__card` (ninguna existe en el SCSS) y un `padding` de `.4rem` contra `.5rem`
  en `.projects__button`. El `max-height` es el grave: sin él las 11 tarjetas pierden su
  tope de alto justo en la pestaña que abre por defecto, que es exactamente la regresión
  silenciosa que esa sección existía para evitar.
- **`stat.label` no podía funcionar.** Estaba tipado `localeString` y a la vez se pedía que
  conservara el salto de línea de las leyendas. Un `string` no lo admite.
- **El cutover se contradecía.** La arquitectura ponía `netlify.toml` en el repo y el orden
  de pasos decía "fundir la rama" y *después* "cambiar los ajustes de build". Como el
  `netlify.toml` del repo manda sobre la UI, el cutover habría ocurrido en el merge, un paso
  que el borrador trataba como seguro.
