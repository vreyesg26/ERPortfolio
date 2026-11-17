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
          .valid(KEYS.map((k) => k.value))
          .custom(async (value, context) => {
            if (!value) return true
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
      description: 'Solo una pestaña puede estar marcada.',
      type: 'boolean',
      initialValue: false,
      validation: (rule) =>
        rule.custom(async (value, context) => {
          const others = await othersCount(context, 'isDefault == true', {})
          const total = others + (value ? 1 : 0)
          if (total === 1) return true
          return total === 0
            ? 'Marca una pestaña para que se abra al entrar.'
            : 'Ya hay otra pestaña marcada para abrirse al entrar. Solo puede haber una.'
        }),
    }),
  ],
  orderings: [{title: 'Orden', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'label.es', subtitle: 'key'}},
})
