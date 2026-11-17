# Líneas base visuales de producción

Capturas de `https://ingefrenreyes.netlify.app/` tomadas **antes** de reconciliar el SCSS
(2026-11-17), para que la tarea 11 compare el sitio Astro contra ellas.

Nombre: `<ancho>-<tema>-<pestaña>-<idioma>.png`. Página completa, viewport de alto 900,
`deviceScaleFactor: 1`, `reducedMotion: 'reduce'`, Chromium headless (Playwright).

## Matriz (22 capturas)

- Anchos 320, 576, 776, 968, 992 y 1280: tema claro, pestaña `projects`, idioma `es`.
- 320 y 1280: temas `light` y `dark` x pestañas `about`, `projects`, `skills`, idioma `es`.
- 320 y 1280: tema `light` x las tres pestañas, idioma `en`.

## Cómo se regenera

El script vive en `.superpowers/sdd/2026-11-17-astro-sanity-migration/capture.mjs` (scratch,
fuera de git). Necesita Playwright instalado fuera del repo:

```bash
mkdir /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install chromium
PLAYWRIGHT_DIR=/tmp/pw node .superpowers/sdd/2026-11-17-astro-sanity-migration/capture.mjs <urlBase> <dirSalida>
```

El script fija `locale` en el contexto y siembra `localStorage` (`selected-theme`,
`selected-icon`, `selected-language`) antes de cargar, recarga, hace clic en la pestaña
(`.filters__button[data-target="#<pestaña>"]`) y espera 3,5 s a que termine ScrollReveal.
