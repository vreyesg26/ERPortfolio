import {defineArrayMember, defineField, defineType} from 'sanity'

export const profile = defineType({
  name: 'profile',
  title: 'Perfil',
  type: 'document',
  fields: [
    defineField({
      name: 'photo',
      title: 'Foto de perfil',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Descripción de la foto',
          description: 'Describe la foto en pocas palabras, para personas que usan lector de pantalla.',
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'profession',
      title: 'Profesión',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Redes sociales',
      description: 'Los iconos que aparecen bajo el nombre. Arrastra para cambiar el orden.',
      type: 'array',
      of: [defineArrayMember({type: 'socialLink'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'stats',
      title: 'Datos destacados',
      description: 'Son exactamente tres. El diseño está hecho para tres columnas.',
      type: 'array',
      of: [defineArrayMember({type: 'stat'})],
      validation: (rule) => rule.required().length(3),
    }),
    defineField({
      name: 'cvLabel',
      title: 'Texto del botón del currículum',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cvEs',
      title: 'Currículum en español (PDF)',
      type: 'file',
      options: {accept: 'application/pdf'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cvEn',
      title: 'Currículum en inglés (PDF)',
      type: 'file',
      options: {accept: 'application/pdf'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'whatsappPhone',
      title: 'Teléfono de WhatsApp',
      description:
        'Con código de país y sin el signo "+", sin espacios ni guiones, por ejemplo "50499999999". Es el formato que pide WhatsApp para los enlaces de contacto.',
      type: 'string',
      // La descripción ya exigía solo dígitos; esto lo hace cumplir. Sin la regla, un
      // valor con "&" o "=" se colaba en la consulta del enlace de WhatsApp.
      validation: (rule) =>
        rule
          .required()
          .regex(/^\d{8,15}$/, {name: 'solo dígitos, entre 8 y 15'}),
    }),
    defineField({
      name: 'whatsappMessage',
      title: 'Mensaje inicial de WhatsApp',
      description: 'El texto que ya viene escrito cuando alguien te contacta por WhatsApp.',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'messengerUrl',
      title: 'Enlace de Messenger',
      description: 'Opcional.',
      type: 'url',
    }),
  ],
  preview: {select: {title: 'name', media: 'photo'}},
})
