import {defineField, defineType} from 'sanity'

export const interfaceText = defineType({
  name: 'interfaceText',
  title: 'Textos de interfaz',
  type: 'document',
  fields: [
    defineField({
      name: 'levelBasic',
      title: 'Nivel "Básico"',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'levelIntermediate',
      title: 'Nivel "Intermedio"',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'levelAdvanced',
      title: 'Nivel "Avanzado"',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'languageToggleLabel',
      title: 'Descripción del botón de idioma',
      description:
        'No se ve en pantalla: la lee el lector de pantalla al llegar al botón que cambia el idioma.',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'viewPlanLabel',
      title: 'Descripción del botón de ver plano',
      description:
        'No se ve en pantalla: la lee el lector de pantalla en el botón del ojo de cada proyecto.',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'footerText',
      title: 'Texto del pie de página',
      description: 'Opcional. Si lo dejas vacío, el pie de página no muestra texto.',
      type: 'localeString',
    }),
  ],
  preview: {prepare: () => ({title: 'Textos de interfaz'})},
})
