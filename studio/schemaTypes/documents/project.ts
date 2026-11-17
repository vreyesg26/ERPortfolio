import {defineField, defineType} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Proyectos',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Imagen del plano',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Descripción de la imagen',
      description:
        'Opcional. Para personas que usan lector de pantalla. Si la dejas vacía se usa el título.',
      type: 'localeString',
    }),
    defineField({
      name: 'driveUrl',
      title: 'Enlace al plano en Drive',
      type: 'url',
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
  preview: {select: {title: 'title.es', media: 'image'}},
})
