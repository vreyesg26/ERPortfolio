import {defineQuery} from 'groq'

// Todas reciben $lang ('es' | 'en') y proyectan plano: los componentes nunca ven {es, en}.
// coalesce cae al español si falta una traducción: preferible a un hueco en el sitio.
// Todo order(...) añade _id como desempate: order es obligatorio pero no único, y GROQ
// no define el orden entre iguales, así que sin desempate el resultado podría variar
// entre builds.

export const PROFILE_QUERY = defineQuery(`*[_type == "profile"][0]{
  name,
  "profession": select($lang == "en" => coalesce(profession.en, profession.es), profession.es),
  photo,
  socialLinks[]{_key, name, icon, url},
  stats[]{_key, value, "label": select($lang == "en" => coalesce(label.en, label.es), label.es)},
  "cvLabel": select($lang == "en" => coalesce(cvLabel.en, cvLabel.es), cvLabel.es),
  "cvUrl": select($lang == "en" => cvEn.asset->url, cvEs.asset->url),
  whatsappPhone,
  "whatsappMessage": select($lang == "en" => coalesce(whatsappMessage.en, whatsappMessage.es), whatsappMessage.es),
  messengerUrl
}`)

export const ABOUT_QUERY = defineQuery(`*[_type == "about"][0]{
  paragraphs[]{_key, "text": select($lang == "en" => coalesce(en, es), es)}
}`)

export const INTERFACE_TEXT_QUERY = defineQuery(`*[_type == "interfaceText"][0]{
  "levelBasic": select($lang == "en" => coalesce(levelBasic.en, levelBasic.es), levelBasic.es),
  "levelIntermediate": select($lang == "en" => coalesce(levelIntermediate.en, levelIntermediate.es), levelIntermediate.es),
  "levelAdvanced": select($lang == "en" => coalesce(levelAdvanced.en, levelAdvanced.es), levelAdvanced.es),
  "languageToggleLabel": select($lang == "en" => coalesce(languageToggleLabel.en, languageToggleLabel.es), languageToggleLabel.es),
  "viewPlanLabel": select($lang == "en" => coalesce(viewPlanLabel.en, viewPlanLabel.es), viewPlanLabel.es),
  "footerText": select($lang == "en" => coalesce(footerText.en, footerText.es), footerText.es)
}`)

export const SEO_QUERY = defineQuery(`*[_type == "seo"][0]{
  "title": select($lang == "en" => coalesce(title.en, title.es), title.es),
  "description": select($lang == "en" => coalesce(description.en, description.es), description.es),
  "keywords": select($lang == "en" => coalesce(keywords.en, keywords.es), keywords.es),
  author,
  "siteName": select($lang == "en" => coalesce(siteName.en, siteName.es), siteName.es),
  siteUrl,
  ogImage,
  themeColor
}`)

export const TABS_QUERY = defineQuery(`*[_type == "tab"] | order(order asc, _id asc){
  _id,
  key,
  "label": select($lang == "en" => coalesce(label.en, label.es), label.es),
  order,
  isDefault
}`)

export const PROJECTS_QUERY = defineQuery(`*[_type == "project"] | order(order asc, _id asc){
  _id,
  "title": select($lang == "en" => coalesce(title.en, title.es), title.es),
  "alt": select($lang == "en" => coalesce(alt.en, title.en, title.es), coalesce(alt.es, title.es)),
  driveUrl,
  image
}`)

// Las aptitudes se alcanzan por su categoría: una aptitud cuya referencia no
// resuelve no aparece en ninguna.
export const SKILLS_QUERY = defineQuery(`*[_type == "skillCategory"] | order(order asc, _id asc){
  _id,
  "title": select($lang == "en" => coalesce(title.en, title.es), title.es),
  "skills": *[_type == "skill" && references(^._id)] | order(order asc, _id asc){
    _id,
    name,
    level
  }
}`)
