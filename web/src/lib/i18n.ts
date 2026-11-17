export type Lang = 'es' | 'en'

export const otherLang = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es')

// prefixDefaultLocale: false, el español vive en la raíz.
export const pathFor = (lang: Lang): string => (lang === 'es' ? '/' : '/en/')

export const ogLocale = (lang: Lang): string => (lang === 'es' ? 'es_ES' : 'en_US')
