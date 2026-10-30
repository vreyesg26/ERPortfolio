/*=============== FILTERS TABS ===============*/
const tabs = document.querySelectorAll('[data-target]'),
      tabContents = document.querySelectorAll('[data-content]')

let tabFade

tabs.forEach(tab =>{
    tab.addEventListener('click', () =>{
        const target = document.querySelector(tab.dataset.target)

        // The pill moves straight away, so the click still feels immediate
        tabs.forEach(t =>{
            t.classList.remove('filter-tab-active')
        })
        tab.classList.add('filter-tab-active')

        if (target.classList.contains('filters__active')) return

        const current = document.querySelector('.filters__active[data-content]')

        // Fade the panel out, swap it while it is invisible, then fade it in.
        // Clearing the timeout keeps rapid clicks from queueing up swaps.
        clearTimeout(tabFade)
        if (current) current.classList.add('filters__fade')

        tabFade = setTimeout(() =>{
            tabContents.forEach(tc =>{
                tc.classList.remove('filters__active', 'filters__fade')
            })
            target.classList.add('filters__fade', 'filters__active')
            void target.offsetHeight // Force a reflow so the fade has a start value
            target.classList.remove('filters__fade')
        }, 200)
    })
})

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'ri-sun-line'

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line'

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*=============== LANGUAGE ===============*/
const languageButton = document.getElementById('language-button'),
      languageCode = document.getElementById('language-code'),
      cvButton = document.getElementById('cv-button'),
      whatsappButton = document.getElementById('whatsapp-button')

const whatsappNumber = '+50495025008'

const cvFiles = {
    en: 'assets/pdf/CV_Efren_Reyes_2026_EN.pdf',
    es: 'assets/pdf/CV - Efren Reyes (2026).pdf'
}

const translations = {
    en: {
        'page.title': 'Civil Engineer - Efren Reyes | Portfolio',
        'language.label': 'Language: English. Click to switch to Spanish',

        /* Profile */
        'profession': 'Civil Engineer',
        'info.years': 'Years of <br> work',
        'info.projects': 'Completed <br> projects',
        'info.customers': 'Satisfied <br> customers',
        'cv': 'Download CV',
        'whatsapp': "Hi Efren, I'd like to talk with you",

        /* Tabs */
        'tab.about': 'About',
        'tab.projects': 'Projects',
        'tab.skills': 'Skills',

        /* About */
        'about.p1': 'I am a Civil Engineer from Honduras with practical experience in construction supervision, quality control, and technical documentation. I am currently expanding my expertise in civil engineering design, with a particular interest in road design, earthwork calculations, and infrastructure projects.',
        'about.p2': 'I aim to help clients with accurate technical drawings, terrain modeling, quantity takeoffs, and civil engineering drafting tasks. I value precision, clear communication, and delivering organized work according to project requirements.',
        'about.p3': 'My goal is to build long-term professional relationships by providing reliable support to engineering firms, contractors, and individual clients.',
        'about.p4': 'I am committed to continuous learning and to developing practical, efficient solutions for every project.',

        /* Projects */
        'plan1.title': 'Perimeter plan',
        'plan1.alt': 'Perimeter plan',
        'plan2.title': 'Contour lines',
        'plan2.alt': 'Contour line drawing',
        'plan3.title': 'Perimeter wall details',
        'plan3.alt': 'Perimeter wall detail drawings',
        'plan4.title': 'Plan and profile, Street 1',
        'plan4.alt': 'Plan and profile drawing, Street 1',
        'plan5.title': 'Cross sections, Street 3',
        'plan5.alt': 'Plan and profile drawing, Street 3',
        'plan6.title': 'Irrigation Shed | Pilot Project',
        'plan6.alt': 'Irrigation Shed | Pilot Project',
        'plan7.title': 'Restrooms 1',
        'plan7.alt': 'Restrooms 1',
        'plan8.title': 'Restrooms 2',
        'plan8.alt': 'Restrooms 2',
        'plan9.title': 'Block layout analysis',
        'plan9.alt': 'Block layout analysis',
        'plan10.title': 'Sanitary Sewer, Stormwater and Potable Water',
        'plan10.alt': 'Sanitary Sewer, Stormwater and Potable Water',
        'plan11.title': 'Perimeter Plan, Blanca Argeñal',
        'plan11.alt': 'Perimeter Plan, Blanca Argeñal',

        /* Skills */
        'skills.design': 'Design',
        'level.intermediate': 'Intermediate',
        'level.advanced': 'Advanced'
    },

    es: {
        'page.title': 'Ingeniero Civil - Efren Reyes | Portafolio',
        'language.label': 'Idioma: Español. Pulsa para cambiar a inglés',

        /* Profile */
        'profession': 'Ingeniero Civil',
        'info.years': 'Años de <br> trabajo',
        'info.projects': 'Proyectos <br> completados',
        'info.customers': 'Clientes <br> satisfechos',
        'cv': 'Descargar CV',
        'whatsapp': 'Hola Efren, me gustaría conversar contigo',

        /* Tabs */
        'tab.about': 'Sobre mí',
        'tab.projects': 'Proyectos',
        'tab.skills': 'Aptitudes',

        /* About */
        'about.p1': 'Soy un Ingeniero Civil hondureño con experiencia práctica en supervisión de obra, control de calidad y documentación técnica. Actualmente estoy ampliando mis conocimientos en diseño de ingeniería civil, con especial interés en el diseño de carreteras, el cálculo de movimiento de tierras y los proyectos de infraestructura.',
        'about.p2': 'Mi objetivo es ayudar a mis clientes con planos técnicos precisos, modelado de terreno, cuantificación de volúmenes y tareas de dibujo de ingeniería civil. Valoro la precisión, la comunicación clara y la entrega de un trabajo ordenado conforme a los requisitos de cada proyecto.',
        'about.p3': 'Busco construir relaciones profesionales a largo plazo brindando un apoyo confiable a firmas de ingeniería, contratistas y clientes particulares.',
        'about.p4': 'Me comprometo con el aprendizaje continuo y con el desarrollo de soluciones prácticas y eficientes para cada proyecto.',

        /* Projects */
        'plan1.title': 'Plano perimetral',
        'plan1.alt': 'Plano perimetral',
        'plan2.title': 'Curvas de nivel',
        'plan2.alt': 'Plano de curvas de nivel',
        'plan3.title': 'Detalles muro perimetral',
        'plan3.alt': 'Planos de detalles muro perimetral',
        'plan4.title': 'Planta perfil calle 1',
        'plan4.alt': 'Plano de planta perfil calle 1',
        'plan5.title': 'Secciones Transversales Calle 3',
        'plan5.alt': 'Plano de planta perfil calle 3',
        'plan6.title': 'Caseta de Riego | Proyecto Piloto',
        'plan6.alt': 'Caseta de Riego | Proyecto Piloto',
        'plan7.title': 'Servicios Sanitarios 1',
        'plan7.alt': 'Servicios Sanitarios 1',
        'plan8.title': 'Servicios Sanitarios 2',
        'plan8.alt': 'Servicios Sanitarios 2',
        'plan9.title': 'Análisis de distribución por bloques',
        'plan9.alt': 'Análisis de distribución por bloques',
        'plan10.title': 'Alcantarillado Sanitario, Aguas lluvias y Agua potable',
        'plan10.alt': 'Alcantarillado Sanitario, Aguas lluvias y Agua potable',
        'plan11.title': 'Plano Perimetral Blanca Argeñal',
        'plan11.alt': 'Plano Perimetral Blanca Argeñal',

        /* Skills */
        'skills.design': 'Diseño',
        'level.intermediate': 'Intermedio',
        'level.advanced': 'Avanzado'
    }
}

// Swap every tagged text, the page title and the language dependent links
const applyLanguage = (language) => {
    const text = translations[language]

    document.documentElement.lang = language
    document.title = text['page.title']

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const value = text[element.dataset.i18n]
        if (value !== undefined) element.innerHTML = value
    })
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const value = text[element.dataset.i18nAlt]
        if (value !== undefined) element.alt = value
    })

    cvButton.href = cvFiles[language]
    whatsappButton.href = `https://api.whatsapp.com/send?phone=${whatsappNumber}` +
                          `&text=${encodeURIComponent(text['whatsapp'])}`

    languageCode.textContent = language.toUpperCase()
    languageButton.setAttribute('aria-label', text['language.label'])
    languageButton.title = text['language.label']
}

// Previously selected language (if user selected), otherwise the browser's
const selectedLanguage = localStorage.getItem('selected-language')
const browserLanguage = (navigator.language || 'en').startsWith('es') ? 'es' : 'en'

applyLanguage(translations[selectedLanguage] ? selectedLanguage : browserLanguage)

// Activate / deactivate the language manually with the button
let languageFade

languageButton.addEventListener('click', () => {
    const language = document.documentElement.lang === 'en' ? 'es' : 'en'

    // Fade the translated text out, swap it, then let it fade back in.
    // Clearing the timeout keeps rapid clicks from queueing up swaps.
    clearTimeout(languageFade)
    document.body.classList.add('language-switching')
    languageFade = setTimeout(() => {
        applyLanguage(language)
        document.body.classList.remove('language-switching')
    }, 200)

    // We save the language that the user chose
    localStorage.setItem('selected-language', language)
})

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 400,
})

sr.reveal(`.profile__border`)
sr.reveal(`.profile__name`, {delay: 500})
sr.reveal(`.profile__profession`, {delay: 600})
sr.reveal(`.profile__social`, {delay: 700})
sr.reveal(`.profile__info-group`, {interval: 100, delay: 700})
sr.reveal(`.profile__buttons`, {delay: 800})
sr.reveal(`.filters__content`, {delay: 900})
sr.reveal(`.filters`, {delay: 1000})