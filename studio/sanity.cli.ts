import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 't0yrmwzx',
    dataset: 'production',
  },
  // Subdominio del Studio desplegado: portafolio-efren.sanity.studio
  // Es la URL que Efren va a guardar, así que vive aquí y no en un flag suelto.
  studioHost: 'portafolio-efren',
  // Fijado tras el primer despliegue (2026-11-17) para que los siguientes no
  // pregunten por la aplicación. Sin esto, un `sanity deploy` desatendido falla.
  deployment: {
    appId: 'm5p6dz3c8y7bcs8oxk7lsibr',
  },
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../web/src/sanity.types.ts',
    overloadClientMethods: true,
  },
})
