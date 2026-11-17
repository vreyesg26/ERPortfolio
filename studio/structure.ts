import type {StructureResolver} from 'sanity/structure'

export const SINGLETONS = ['profile', 'about', 'interfaceText', 'seo'] as const

// Las tres pestañas existen siempre: se crean una vez y no se borran.
export const PROTECTED_TYPES = [...SINGLETONS, 'tab'] as const

const TITLES: Record<string, string> = {
  profile: 'Perfil',
  about: 'Sobre mí',
  seo: 'SEO y redes sociales',
  interfaceText: 'Textos de interfaz',
  tab: 'Pestañas',
  project: 'Proyectos',
  skillCategory: 'Categorías de aptitudes',
  skill: 'Aptitudes',
}

const COLLECTIONS = ['tab', 'project', 'skillCategory', 'skill'] as const

// Orden en que aparecen los documentos únicos, según la estructura del spec.
const SINGLETON_MENU = ['profile', 'about', 'seo', 'interfaceText'] as const

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      ...SINGLETON_MENU.map((type) =>
        S.listItem()
          .title(TITLES[type])
          .id(type)
          .child(S.document().schemaType(type).documentId(type).title(TITLES[type])),
      ),
      S.divider(),
      ...COLLECTIONS.map((type) =>
        S.documentTypeListItem(type)
          .title(TITLES[type])
          .child(
            S.documentTypeList(type)
              .title(TITLES[type])
              .defaultOrdering([{field: 'order', direction: 'asc'}]),
          ),
      ),
    ])
