import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {PROTECTED_TYPES, structure} from './structure'

const protectedTypes = new Set<string>(PROTECTED_TYPES)

export default defineConfig({
  name: 'default',
  title: 'Portafolio Efren',
  projectId: 't0yrmwzx',
  dataset: 'production',
  plugins: [structureTool({structure}), visionTool()],
  schema: {
    types: schemaTypes,
    // Los documentos únicos y las pestañas no se crean desde "Nuevo documento":
    // las tres pestañas ya existen y una cuarta no podría guardarse.
    templates: (templates) => templates.filter(({schemaType}) => !protectedTypes.has(schemaType)),
  },
  document: {
    // Los documentos únicos y las pestañas no se duplican, borran ni despublican.
    actions: (input, {schemaType}) =>
      protectedTypes.has(schemaType)
        ? input.filter(({action}) => action && !['delete', 'duplicate', 'unpublish'].includes(action))
        : input,
  },
})
