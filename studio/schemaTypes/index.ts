import type {SchemaTypeDefinition} from 'sanity'
import {localeString} from './objects/locale-string'
import {localeText} from './objects/locale-text'
import {socialLink} from './objects/social-link'
import {stat} from './objects/stat'
import {profile} from './documents/profile'
import {about} from './documents/about'
import {interfaceText} from './documents/interface-text'
import {seo} from './documents/seo'
import {tab} from './documents/tab'
import {project} from './documents/project'
import {skillCategory} from './documents/skill-category'
import {skill} from './documents/skill'

export const schemaTypes: SchemaTypeDefinition[] = [
  localeString,
  localeText,
  socialLink,
  stat,
  profile,
  about,
  interfaceText,
  seo,
  tab,
  project,
  skillCategory,
  skill,
]
