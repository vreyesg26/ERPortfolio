import {defineArrayMember, defineField, defineType} from 'sanity'

export const about = defineType({
  name: 'about',
  title: 'Sobre mí',
  type: 'document',
  fields: [
    defineField({
      name: 'paragraphs',
      title: 'Párrafos',
      description: 'Cada párrafo en español e inglés. Arrastra para cambiar el orden o agrega uno nuevo.',
      type: 'array',
      of: [defineArrayMember({type: 'localeText', validation: (rule) => rule.required()})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {prepare: () => ({title: 'Sobre mí'})},
})
