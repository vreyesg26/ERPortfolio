import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 't0yrmwzx',
    dataset: 'production',
  },
  // Subdominio del Studio desplegado: portafolio-efren.sanity.studio
  // Es la URL que Efren va a guardar, así que vive aquí y no en un flag suelto.
  studioHost: 'portafolio-efren',
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../web/src/sanity.types.ts',
    overloadClientMethods: true,
  },
})
