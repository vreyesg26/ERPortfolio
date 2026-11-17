import type {SEO_QUERY_RESULT} from '../sanity.types'

// typegen no resuelve coalesce(campo[$lang], ...) con un parametro y tipa esos campos
// como el array {es, en}; en tiempo de ejecucion la query ya devuelve el string del
// idioma. Se deriva el tipo de SEO_QUERY_RESULT y solo se corrige ese eje.
type Localized = 'title' | 'description' | 'keywords' | 'siteName'

export type SeoData = Omit<NonNullable<SEO_QUERY_RESULT>, Localized> & Record<Localized, string>
