import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO y redes sociales',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título de la página',
      description: 'Es el que aparece en la pestaña del navegador, en Google y al compartir el enlace.',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      description: 'La frase que aparece debajo del título en Google y al compartir el enlace.',
      type: 'localeText',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'keywords',
      title: 'Palabras clave',
      description: 'Separadas por coma.',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'author', title: 'Autor', type: 'string'}),
    defineField({
      name: 'siteName',
      title: 'Nombre del sitio',
      description: 'Se muestra al compartir el enlace en redes sociales.',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'siteUrl',
      title: 'Dirección del sitio',
      description: 'La dirección principal de la página, por ejemplo "https://ejemplo.com".',
      type: 'url',
    }),
    defineField({
      name: 'ogImage',
      title: 'Imagen al compartir',
      description: 'La imagen que aparece cuando alguien comparte el enlace en redes sociales.',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'themeColor',
      title: 'Color del navegador',
      description: 'El color de la barra del navegador en el celular, por ejemplo "#000000".',
      type: 'string',
    }),
  ],
  preview: {prepare: () => ({title: 'SEO y redes sociales'})},
})
