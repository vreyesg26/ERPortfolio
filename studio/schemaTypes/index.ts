import type {SchemaTypeDefinition} from 'sanity'
import {localeString} from './objects/locale-string'
import {localeText} from './objects/locale-text'
import {socialLink} from './objects/social-link'
import {stat} from './objects/stat'

export const schemaTypes: SchemaTypeDefinition[] = [localeString, localeText, socialLink, stat]
