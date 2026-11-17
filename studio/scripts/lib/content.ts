// Contenido inicial del sitio, transcrito de index.html y de translations en
// assets/js/main.js. Solo datos: sin logica. El test de fidelidad
// (__tests__/content.test.ts) compara cada string contra el original.
//
// Los archivos (imagenes y PDF) se marcan con `__file`: seed.ts los sube y
// sustituye el marcador por la referencia al asset.

export type Doc = Record<string, any>

const img = (__file: string) => ({_type: 'image', __file})
const pdf = (__file: string) => ({_type: 'file', __file})
const ref = (_ref: string) => ({_type: 'reference', _ref})

const PLANS = 'assets/img/plans'

const project = (
  n: number,
  title: {es: string; en: string},
  alt: {es: string; en: string},
  driveUrl: string,
): Doc => ({
  _id: `project-${n}`,
  _type: 'project',
  title,
  image: img(`${PLANS}/project${n}.webp`),
  alt,
  driveUrl,
  order: n,
})

const skill = (
  slug: string,
  name: string,
  level: 'basic' | 'intermediate' | 'advanced',
  category: string,
  order: number,
): Doc => ({
  _id: `skill-${slug}`,
  _type: 'skill',
  name,
  level,
  category: ref(category),
  order,
})

export const documents: Doc[] = [
  // --- Documentos unicos (el _id es el nombre del tipo) ---
  {
    _id: 'profile',
    _type: 'profile',
    photo: img('assets/img/profile.webp'),
    name: 'Efren Eduardo Reyes Gudiel',
    profession: {es: 'Ingeniero Civil', en: 'Civil Engineer'},
    socialLinks: [
      {
        _key: 'instagram',
        _type: 'socialLink',
        name: 'Instagram',
        icon: 'ri-instagram-line',
        url: 'https://www.instagram.com/_efren.reyes_/',
      },
      {
        _key: 'linkedin',
        _type: 'socialLink',
        name: 'LinkedIn',
        icon: 'ri-linkedin-box-line',
        url: 'https://www.linkedin.com/in/efren-reyes-276b74210/',
      },
      {
        _key: 'facebook',
        _type: 'socialLink',
        name: 'Facebook',
        icon: 'ri-facebook-box-line',
        url: 'https://www.facebook.com/efren.reyes24',
      },
    ],
    stats: [
      {
        _key: 'years',
        _type: 'stat',
        value: '+1',
        label: {es: 'Años de\ntrabajo', en: 'Years of\nwork'},
      },
      {
        _key: 'projects',
        _type: 'stat',
        value: '+4',
        label: {es: 'Proyectos\ncompletados', en: 'Completed\nprojects'},
      },
      {
        _key: 'customers',
        _type: 'stat',
        value: '3',
        label: {es: 'Clientes\nsatisfechos', en: 'Satisfied\ncustomers'},
      },
    ],
    cvLabel: {es: 'Descargar CV', en: 'Download CV'},
    cvEs: pdf('assets/pdf/CV - Efren Reyes (2026).pdf'),
    cvEn: pdf('assets/pdf/CV_Efren_Reyes_2026_EN.pdf'),
    whatsappPhone: '50495025008',
    whatsappMessage: {
      es: 'Hola Efren, me gustaría conversar contigo',
      en: "Hi Efren, I'd like to talk with you",
    },
    messengerUrl: 'https://m.me/efren.reyes24',
  },
  {
    _id: 'about',
    _type: 'about',
    paragraphs: [
      {
        _key: 'p1',
        _type: 'localeText',
        es: 'Soy un Ingeniero Civil hondureño con experiencia práctica en supervisión de obra, control de calidad y documentación técnica. Actualmente estoy ampliando mis conocimientos en diseño de ingeniería civil, con especial interés en el diseño de carreteras, el cálculo de movimiento de tierras y los proyectos de infraestructura.',
        en: 'I am a Civil Engineer from Honduras with practical experience in construction supervision, quality control, and technical documentation. I am currently expanding my expertise in civil engineering design, with a particular interest in road design, earthwork calculations, and infrastructure projects.',
      },
      {
        _key: 'p2',
        _type: 'localeText',
        es: 'Mi objetivo es ayudar a mis clientes con planos técnicos precisos, modelado de terreno, cuantificación de volúmenes y tareas de dibujo de ingeniería civil. Valoro la precisión, la comunicación clara y la entrega de un trabajo ordenado conforme a los requisitos de cada proyecto.',
        en: 'I aim to help clients with accurate technical drawings, terrain modeling, quantity takeoffs, and civil engineering drafting tasks. I value precision, clear communication, and delivering organized work according to project requirements.',
      },
      {
        _key: 'p3',
        _type: 'localeText',
        es: 'Busco construir relaciones profesionales a largo plazo brindando un apoyo confiable a firmas de ingeniería, contratistas y clientes particulares.',
        en: 'My goal is to build long-term professional relationships by providing reliable support to engineering firms, contractors, and individual clients.',
      },
      {
        _key: 'p4',
        _type: 'localeText',
        es: 'Me comprometo con el aprendizaje continuo y con el desarrollo de soluciones prácticas y eficientes para cada proyecto.',
        en: 'I am committed to continuous learning and to developing practical, efficient solutions for every project.',
      },
    ],
  },
  {
    _id: 'interfaceText',
    _type: 'interfaceText',
    // "Básico" no existe en el original (ninguna aptitud lo usa); viewPlanLabel
    // es un arreglo de accesibilidad nuevo. footerText queda vacio, como el pie.
    levelBasic: {es: 'Básico', en: 'Basic'},
    levelIntermediate: {es: 'Intermedio', en: 'Intermediate'},
    levelAdvanced: {es: 'Avanzado', en: 'Advanced'},
    languageToggleLabel: {
      es: 'Idioma: Español. Pulsa para cambiar a inglés',
      en: 'Language: English. Click to switch to Spanish',
    },
    viewPlanLabel: {es: 'Ver plano', en: 'View drawing'},
  },
  {
    _id: 'seo',
    _type: 'seo',
    title: {
      es: 'Ingeniero Civil - Efren Reyes | Portafolio',
      en: 'Civil Engineer - Efren Reyes | Portfolio',
    },
    description: {
      es: 'Soy un Ingeniero Civil con +1 año de experiencia. Diseño y gestiono proyectos de infraestructura con soluciones innovadoras. ¡Conoce mis proyectos!',
      en: 'Civil Engineer from Honduras. Drafting, terrain modeling and quantity takeoffs in AutoCAD and Civil 3D for engineering firms and contractors.',
    },
    keywords: {
      es: 'Ingeniero Civil, Civil Engineer, Diseño, Infraestructura, Proyectos, Efren Reyes',
      en: 'Civil Engineer, Civil Engineering Drafting, AutoCAD, Civil 3D, Road Design, Earthwork, Quantity Takeoff, Infrastructure, Honduras, Efren Reyes',
    },
    author: 'Efren Eduardo Reyes Gudiel',
    siteName: {
      es: 'Efren Reyes - Ingeniero Civil',
      en: 'Efren Reyes - Civil Engineer',
    },
    siteUrl: 'https://ingefrenreyes.netlify.app',
    themeColor: '#000000',
  },

  // --- Pestanas ---
  {
    _id: 'tab-about',
    _type: 'tab',
    key: 'about',
    label: {es: 'Sobre mí', en: 'About'},
    order: 1,
    isDefault: false,
  },
  {
    _id: 'tab-projects',
    _type: 'tab',
    key: 'projects',
    label: {es: 'Proyectos', en: 'Projects'},
    order: 2,
    isDefault: true,
  },
  {
    _id: 'tab-skills',
    _type: 'tab',
    key: 'skills',
    label: {es: 'Aptitudes', en: 'Skills'},
    order: 3,
    isDefault: false,
  },

  // --- Proyectos ---
  project(
    1,
    {es: 'Plano perimetral', en: 'Perimeter plan'},
    {es: 'Plano perimetral', en: 'Perimeter plan'},
    'https://drive.google.com/file/d/1TqGCBHruYpFfvUMJeccsdSi_k1Y52OYh/view?usp=drive_link',
  ),
  project(
    2,
    {es: 'Curvas de nivel', en: 'Contour lines'},
    {es: 'Plano de curvas de nivel', en: 'Contour line drawing'},
    'https://drive.google.com/file/d/1PvOF9Kvrbgb3IzXfWpBI32uiS13tNajZ/view?usp=drive_link',
  ),
  project(
    3,
    {es: 'Detalles muro perimetral', en: 'Perimeter wall details'},
    {es: 'Planos de detalles muro perimetral', en: 'Perimeter wall detail drawings'},
    'https://drive.google.com/file/d/1B7zCWk7-CYqAmOvYGdvHTQgthWk9qcGA/view?usp=drive_link',
  ),
  project(
    4,
    {es: 'Planta perfil calle 1', en: 'Plan and profile, Street 1'},
    {es: 'Plano de planta perfil calle 1', en: 'Plan and profile drawing, Street 1'},
    'https://drive.google.com/file/d/1j4EPqHBNJQFOMN1mqHxqj4WihHPOHUfm/view?usp=drive_link',
  ),
  project(
    5,
    {es: 'Secciones Transversales Calle 3', en: 'Cross sections, Street 3'},
    {es: 'Plano de planta perfil calle 3', en: 'Plan and profile drawing, Street 3'},
    'https://drive.google.com/file/d/1RQatkiWtbnTSoXYVu8zv1cvUrRrJ-C6c/view?usp=drive_link',
  ),
  project(
    6,
    {es: 'Caseta de Riego | Proyecto Piloto', en: 'Irrigation Shed | Pilot Project'},
    {es: 'Caseta de Riego | Proyecto Piloto', en: 'Irrigation Shed | Pilot Project'},
    'https://drive.google.com/file/d/1XPxkswwub2e36ZnoFf318Lfsu2o02clj/view?usp=drive_link',
  ),
  project(
    7,
    {es: 'Servicios Sanitarios 1', en: 'Restrooms 1'},
    {es: 'Servicios Sanitarios 1', en: 'Restrooms 1'},
    'https://drive.google.com/file/d/1mGUy0K-wd0vKlwYm3v97Ci0E7Dijgv1k/view?usp=drive_link',
  ),
  project(
    8,
    {es: 'Servicios Sanitarios 2', en: 'Restrooms 2'},
    {es: 'Servicios Sanitarios 2', en: 'Restrooms 2'},
    'https://drive.google.com/file/d/13HxOIc83RXxlvcAYMK2iE9Ul6G7WZLvY/view?usp=drive_link',
  ),
  project(
    9,
    {es: 'Análisis de distribución por bloques', en: 'Block layout analysis'},
    {es: 'Análisis de distribución por bloques', en: 'Block layout analysis'},
    'https://drive.google.com/file/d/1SKmpgN3g7sOi6bo3BddH0UzeokvDbAAm/view?usp=drive_link',
  ),
  project(
    10,
    {
      es: 'Alcantarillado Sanitario, Aguas lluvias y Agua potable',
      en: 'Sanitary Sewer, Stormwater and Potable Water',
    },
    {
      es: 'Alcantarillado Sanitario, Aguas lluvias y Agua potable',
      en: 'Sanitary Sewer, Stormwater and Potable Water',
    },
    'https://drive.google.com/file/d/1Y5r7U_2WM93dxAq9LRqISsmdMf1wkWE3/view?usp=drive_link',
  ),
  project(
    11,
    {es: 'Plano Perimetral Blanca Argeñal', en: 'Perimeter Plan, Blanca Argeñal'},
    {es: 'Plano Perimetral Blanca Argeñal', en: 'Perimeter Plan, Blanca Argeñal'},
    'https://drive.google.com/file/d/1XrQJLOWGCiGFGHfRW9djeYEXg6oGzNKN/view?usp=drive_link',
  ),

  // --- Categorias y aptitudes ---
  {
    _id: 'skill-category-design',
    _type: 'skillCategory',
    title: {es: 'Diseño', en: 'Design'},
    order: 1,
  },
  {
    _id: 'skill-category-microsoft',
    _type: 'skillCategory',
    title: {es: 'Microsoft', en: 'Microsoft'},
    order: 2,
  },
  skill('autocad', 'Autocad', 'intermediate', 'skill-category-design', 1),
  skill('civil-3d', 'Civil 3D', 'intermediate', 'skill-category-design', 2),
  skill('revit', 'Revit', 'intermediate', 'skill-category-design', 3),
  skill('etabs', 'Etabs', 'intermediate', 'skill-category-design', 4),
  skill('sap-2000', 'Sap 2000', 'intermediate', 'skill-category-design', 5),
  skill('word', 'Word', 'intermediate', 'skill-category-microsoft', 6),
  skill('excel', 'Excel', 'advanced', 'skill-category-microsoft', 7),
  skill('project', 'Project', 'intermediate', 'skill-category-microsoft', 8),
  skill('power-point', 'Power Point', 'intermediate', 'skill-category-microsoft', 9),
]

// Los 14 archivos a subir: foto, 11 planos y 2 PDF.
export const assetPaths: string[] = [
  'assets/img/profile.webp',
  ...Array.from({length: 11}, (_, i) => `${PLANS}/project${i + 1}.webp`),
  'assets/pdf/CV - Efren Reyes (2026).pdf',
  'assets/pdf/CV_Efren_Reyes_2026_EN.pdf',
]
