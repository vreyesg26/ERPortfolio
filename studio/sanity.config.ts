import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {PROTECTED_TYPES, SINGLETONS, structure} from './structure'

const singletons = new Set<string>(SINGLETONS)
const protectedTypes = new Set<string>(PROTECTED_TYPES)

export default defineConfig({
  name: 'default',
  title: 'Portafolio Efren',
  projectId: 't0yrmwzx',
  dataset: 'production',
  plugins: [structureTool({structure}), visionTool()],
  schema: {
    types: schemaTypes,
    // Los documentos únicos no se crean desde "Nuevo documento".
    templates: (templates) => templates.filter(({schemaType}) => !singletons.has(schemaType)),
  },
  document: {
    // Los documentos únicos y las pestañas no se duplican, borran ni despublican.
    actions: (input, {schemaType}) =>
      protectedTypes.has(schemaType)
        ? input.filter(({action}) => action && !['delete', 'duplicate', 'unpublish'].includes(action))
        : input,
  },
})
