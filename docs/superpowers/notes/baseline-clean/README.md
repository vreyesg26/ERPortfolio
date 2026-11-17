# Líneas base LIMPIAS de producción

**Esta es la referencia buena.** Capturas de `https://ingefrenreyes.netlify.app/` tomadas el
2026-11-17, cuando ese dominio todavía servía el sitio estático original, con el
`capture.mjs` **ya corregido**.

Se tomaron en ese momento porque era la última oportunidad: tras el cutover el sitio viejo
deja de existir y no hay dónde volver a fotografiarlo.

## Por qué existen dos juegos

`../baseline/` se capturó el mismo día pero con una versión del script que tenía un defecto:
hacía clic en la pestaña mientras `.filters` seguía desplazado -60 px por ScrollReveal, así
que a anchos de 576-1280 el ratón acababa sobre el botón "Descargar CV" y lo fotografiaba a
mitad de su transición de `:hover` (`.button` lleva `transition: .3s` y
`box-shadow: 0 8px 24px`).

El resultado es que **aquellas capturas traen un halo horneado alrededor del botón de CV**.
Comparar contra ellas produce una diferencia constante de ~10-11k px que es error del
instrumento, no del sitio.

`../baseline/` se conserva intacto como registro histórico de lo que se capturó antes de
tocar nada, defecto incluido, porque las imágenes de diff del reporte de la tarea 11 se
refieren a él. **Para comparar, usa este directorio.**

## Versiones exactas

Playwright **1.65.1**, Chromium headless shell **159.0.8154.6**. Otra versión del renderizador
cambia la rasterización de fuentes y mete ruido en todas las imágenes. Dos capturas
consecutivas de producción con este script salieron **byte a byte idénticas en las 22**, así
que el instrumento es determinista.

## Matriz y cómo se regenera

La matriz es la misma que documenta `../baseline/README.md` (22 capturas: anchos 320, 576,
776, 968, 992 y 1280; los dos temas; las tres pestañas; los dos idiomas).

El script es `../baseline/capture.mjs`. Ojo con el tercer argumento: para el sitio Astro las
capturas `-en` se toman contra `/en/`, porque el idioma pasó a ser la URL y ya no se siembra
`localStorage`. Contra el sitio viejo no hace falta.

## Resultado de la comparación (producción limpia vs sitio nuevo)

- **Dimensiones idénticas en las 22.** Sin desplazamiento de maquetación.
- **Región de botones: 0 píxeles de diferencia.**
- Foto de perfil: ~6,8k px por captura, delta máximo 41.
- Imágenes de las tarjetas, solo en las capturas de Projects: 343k-437k px, delta máximo 35-60.
- **Nada más difiere.**

Las dos diferencias restantes son el mismo hecho: Sanity reencoda las imágenes en vez de
servir los `.webp` originales. Los tamaños naturales y renderizados coinciden con producción.
