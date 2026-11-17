import {defineField, defineType} from 'sanity'

export const skillCategory = defineType({
  name: 'skillCategory',
  title: 'Categorías de aptitudes',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      description: 'Si es igual en los dos idiomas (por ejemplo "Microsoft"), escríbelo en ambos.',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      description: 'Número que fija la posición: 1 va primero, luego 2, y así.',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [{title: 'Orden', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title.es'}},
})
