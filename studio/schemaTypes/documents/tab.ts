import {defineField, defineType} from 'sanity'
import type {ValidationContext} from 'sanity'

const KEYS = [
  {title: 'Sobre mí', value: 'about'},
  {title: 'Proyectos', value: 'projects'},
  {title: 'Aptitudes', value: 'skills'},
]

// Cuenta las otras pestañas guardadas (se excluye a sí misma, borrador y publicada).
const othersCount = (context: ValidationContext, filter: string, params: object) => {
  const id = (context.document?._id ?? '').replace(/^drafts\./, '')
  return context
    .getClient({apiVersion: '2025-01-01'})
    .fetch<number>(`count(*[_type == "tab" && ${filter} && !(_id in [$id, $draft])])`, {
      ...params,
      id,
      draft: `drafts.${id}`,
    })
}

export const tab = defineType({
  name: 'tab',
  title: 'Pestañas',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Sección',
      description:
        'Qué sección de la página abre esta pestaña. Cada sección solo puede tener una pestaña.',
      type: 'string',
      options: {list: KEYS, layout: 'radio'},
      validation: (rule) =>
        rule
          .required()
          .custom(async (value, context) => {
            if (!value) return true
            // options.list solo es la interfaz; la pertenencia se exige aquí.
            if (!KEYS.some((k) => k.value === value)) {
              return 'Elige una de las tres secciones: Sobre mí, Proyectos o Aptitudes.'
            }
            const n = await othersCount(context, 'key == $key', {key: value})
            return n === 0 ? true : 'Ya existe otra pestaña para esta sección.'
          }),
    }),
    defineField({
      name: 'label',
      title: 'Texto de la pestaña',
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
    defineField({
      name: 'isDefault',
      title: 'Pestaña que se abre al entrar',
      description:
        'Marca la pestaña que se abre primero al entrar a la página. Solo puede haber una marcada. Si no marcas ninguna, se abre la primera.',
      type: 'boolean',
      initialValue: false,
      validation: (rule) =>
        rule.custom(async (value, context) => {
          if (!value) return true
          const others = await othersCount(context, 'isDefault == true', {})
          return others === 0
            ? true
            : 'Ya hay otra pestaña marcada para abrirse al entrar. Desmárcala primero.'
        }),
    }),
  ],
  orderings: [{title: 'Orden', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'label.es', subtitle: 'key'}},
})
