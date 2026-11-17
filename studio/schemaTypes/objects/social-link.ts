import {defineField, defineType} from 'sanity'

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Red social',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      description: 'Nombre de la red, por ejemplo "Instagram". Lo leen los lectores de pantalla.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icono',
      description: 'Clase de Remixicon, por ejemplo "ri-instagram-line".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Enlace',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
})
