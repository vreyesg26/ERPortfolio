import {defineQuery} from 'groq'

// Todas reciben $lang ('es' | 'en') y proyectan plano: los componentes nunca ven {es, en}.
// coalesce cae al español si falta una traducción: preferible a un hueco en el sitio.
// Todo order(...) añade _id como desempate: order es obligatorio pero no único, y GROQ
// no define el orden entre iguales, así que sin desempate el resultado podría variar
// entre builds.

export const PROFILE_QUERY = defineQuery(`*[_type == "profile"][0]{
  name,
  "profession": coalesce(profession[$lang], profession.es),
  photo,
  socialLinks[]{_key, name, icon, url},
  stats[]{_key, value, "label": coalesce(label[$lang], label.es)},
  "cvLabel": coalesce(cvLabel[$lang], cvLabel.es),
  "cvUrl": select($lang == "en" => cvEn.asset->url, cvEs.asset->url),
  whatsappPhone,
  "whatsappMessage": coalesce(whatsappMessage[$lang], whatsappMessage.es),
  messengerUrl
}`)

export const ABOUT_QUERY = defineQuery(`*[_type == "about"][0]{
  paragraphs[]{_key, "text": coalesce(@[$lang], es)}
}`)

export const INTERFACE_TEXT_QUERY = defineQuery(`*[_type == "interfaceText"][0]{
  "levelBasic": coalesce(levelBasic[$lang], levelBasic.es),
  "levelIntermediate": coalesce(levelIntermediate[$lang], levelIntermediate.es),
  "levelAdvanced": coalesce(levelAdvanced[$lang], levelAdvanced.es),
  "languageToggleLabel": coalesce(languageToggleLabel[$lang], languageToggleLabel.es),
  "viewPlanLabel": coalesce(viewPlanLabel[$lang], viewPlanLabel.es),
  "footerText": coalesce(footerText[$lang], footerText.es)
}`)

export const SEO_QUERY = defineQuery(`*[_type == "seo"][0]{
  "title": coalesce(title[$lang], title.es),
  "description": coalesce(description[$lang], description.es),
  "keywords": coalesce(keywords[$lang], keywords.es),
  author,
  "siteName": coalesce(siteName[$lang], siteName.es),
  siteUrl,
  ogImage,
  themeColor
}`)

export const TABS_QUERY = defineQuery(`*[_type == "tab"] | order(order asc, _id asc){
  _id,
  key,
  "label": coalesce(label[$lang], label.es),
  order,
  isDefault
}`)

export const PROJECTS_QUERY = defineQuery(`*[_type == "project"] | order(order asc, _id asc){
  _id,
  "title": coalesce(title[$lang], title.es),
  "alt": coalesce(alt[$lang], title[$lang], title.es),
  driveUrl,
  image
}`)

// Las aptitudes se alcanzan por su categoría: una aptitud cuya referencia no
// resuelve no aparece en ninguna.
export const SKILLS_QUERY = defineQuery(`*[_type == "skillCategory"] | order(order asc, _id asc){
  _id,
  "title": coalesce(title[$lang], title.es),
  "skills": *[_type == "skill" && references(^._id)] | order(order asc, _id asc){
    _id,
    name,
    level
  }
}`)
