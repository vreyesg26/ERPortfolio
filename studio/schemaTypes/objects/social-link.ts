import {defineField, defineType} from 'sanity'

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Red social',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      description: 'Nombre de la red, por ejemplo "Instagram". Sirve para que las personas con lector de pantalla sepan a qué red lleva el enlace.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icono',
      description: 'Nombre del icono. Búscalo en remixicon.com, haz clic en el icono que quieras y copia su nombre tal cual, por ejemplo "ri-instagram-line".',
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
