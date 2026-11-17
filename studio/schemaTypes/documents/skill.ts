import {defineField, defineType} from 'sanity'

export const skill = defineType({
  name: 'skill',
  title: 'Aptitudes',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      description: 'Es el mismo en los dos idiomas, por ejemplo "Autocad".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'level',
      title: 'Nivel',
      type: 'string',
      options: {
        list: [
          {title: 'Básico', value: 'basic'},
          {title: 'Intermedio', value: 'intermediate'},
          {title: 'Avanzado', value: 'advanced'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'reference',
      to: [{type: 'skillCategory'}],
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
  preview: {select: {title: 'name', subtitle: 'level'}},
})
