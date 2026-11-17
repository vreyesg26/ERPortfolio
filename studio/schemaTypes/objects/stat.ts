import {defineField, defineType} from 'sanity'

export const stat = defineType({
  name: 'stat',
  title: 'Dato del perfil',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Valor',
      description: 'Se escribe tal cual se muestra, con el signo "+" si lo lleva (por ejemplo "+4").',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Leyenda',
      description: 'Admite salto de línea (Enter) en medio de la leyenda.',
      type: 'localeText',
      validation: (rule) => rule.required(),
    }),
  ],
})
