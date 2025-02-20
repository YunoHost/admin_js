import type { Obj, KeyOfStr, Translation, StateVariant } from '@/types/commons'

export type JSExpression = string | boolean
type Pattern = {
  regexp: string
  error: Translation
}

// CONFIG PANELS

export type CoreConfigPanels<MV extends Obj<Obj> = Obj<Obj>> = {
  panels: CoreConfigPanel<MV>[]
}

export type CoreConfigPanel<MV extends Obj> = {
  help?: Translation
  icon?: string
  id: KeyOfStr<MV>
  name?: Translation
  sections?: CoreConfigSection[]
}

export type CoreConfigSection = {
  help?: Translation
  id: string
  is_action_section: boolean
  name?: Translation
  options: AnyOption[]
  visible?: JSExpression
  collapsed?: boolean
}

// OPTIONS

type BaseOption = {
  type: AnyOptionType
  ask: Translation
  id: string
  name?: string
  readonly?: boolean
  visible?: JSExpression
}

// DISPLAY OPTIONS

type DisplayTextOption = BaseOption & {
  type: 'display_text'
  readonly: true
}

type MarkdownOption = BaseOption & {
  type: 'markdown'
  readonly: true
}

type AlertOption = BaseOption & {
  type: 'alert'
  readonly: true
  icon?: string
  style: StateVariant
}

type ButtonOption = BaseOption & {
  type: 'button'
  readonly: true
  enabled: JSExpression
  help?: Translation
  icon?: string
  style: StateVariant
}

// WRITABLE OPTION

type BaseInputOption = BaseOption & {
  readonly?: boolean
  default?: any
  example?: string
  help?: Translation
  optional: boolean
  placeholder?: string
  // redact: boolean
  value?: any
}

type BaseStringOption = BaseInputOption & {
  default?: string
  pattern?: Pattern | null
}

type BaseNumberOption = BaseInputOption & {
  type: 'number' | 'range'
  default?: number
  min?: number
  max?: number
  step?: number
}

type BaseChoicesOption = BaseInputOption & {
  filter?: JSExpression
}

type StringOption = BaseStringOption & {
  type: 'string'
}

type TextOption = BaseStringOption & {
  type: 'text'
}

type PasswordOption = BaseInputOption & {
  type: 'password'
  default: undefined
  example: '••••••••••••'
  // redact: true
}

type ColorOption = BaseInputOption & {
  type: 'color'
  default?: string
}

type NumberOption = BaseNumberOption & {
  type: 'number'
}

type RangeOption = BaseNumberOption & {
  type: 'range'
}

type BooleanOption = BaseInputOption & {
  type: 'boolean'
  default?: boolean | 1 | 0
}

type DateOption = BaseInputOption & {
  type: 'date'
  default?: string
}

type TimeOption = BaseInputOption & {
  type: 'time'
  default?: string | number
}

type EmailOption = BaseInputOption & {
  type: 'email'
  default?: string
}

type WebPathOption = BaseStringOption & {
  type: 'path'
}

type URLOption = BaseStringOption & {
  type: 'url'
}

type FileOption = BaseInputOption & {
  type: 'file'
  accept?: string[]
  default?: string
}

type SelectOption = BaseChoicesOption & {
  type: 'select'
  choices: any[] | Obj<any>
  default?: string
  filter?: undefined
}

type TagsOption = BaseChoicesOption & {
  type: 'tags' | 'tags-select'
  choices: string[]
  default?: string | string[]
  filter?: undefined
  icon?: string
  pattern?: Pattern
}

type DomainOption = BaseChoicesOption & {
  type: 'domain'
  choices: Obj<string>
  filter?: undefined
}

type AppOption = BaseChoicesOption & {
  type: 'app'
  choices: Obj<string>
}

type UserOption = BaseChoicesOption & {
  type: 'user'
  choices: Obj<string>
  filter?: undefined
}

type GroupOption = BaseChoicesOption & {
  type: 'group'
  choices: Obj<string>
  default: 'visitors' | 'all_users' | 'admins'
  filter?: undefined
}

type AnyDisplayOption =
  | DisplayTextOption
  | MarkdownOption
  | AlertOption
  | ButtonOption
export type AnyWritableOption =
  | StringOption
  | TextOption
  | PasswordOption
  | ColorOption
  | NumberOption
  | RangeOption
  | BooleanOption
  | DateOption
  | TimeOption
  | EmailOption
  | WebPathOption
  | URLOption
  | FileOption
  | SelectOption
  | TagsOption
  | DomainOption
  | AppOption
  | UserOption
  | GroupOption
export type AnyOption = AnyDisplayOption | AnyWritableOption

export const ANY_DISPLAY_OPTION_TYPE = [
  'display_text',
  'markdown',
  'alert',
  'button',
] as const
export const ANY_INPUT_OPTION_TYPE = [
  'string',
  'path',
  'email',
  'url',
  'date',
  'time',
  'color',
  'password',
  'number',
  'range',
] as const
export const ANY_WRITABLE_OPTION_TYPE = [
  ...ANY_INPUT_OPTION_TYPE,
  'text',
  'boolean',
  'file',
  'select',
  'tags',
  'tags-select',
  'domain',
  'app',
  'user',
  'group',
] as const
const _ANY_OPTION_TYPE = [
  ...ANY_DISPLAY_OPTION_TYPE,
  ...ANY_WRITABLE_OPTION_TYPE,
] as const
export type AnyOptionType = (typeof _ANY_OPTION_TYPE)[number]

export type OptionTypeToOptionResolver = {
  display_text: DisplayTextOption
  markdown: MarkdownOption
  alert: AlertOption
  button: ButtonOption
  string: StringOption
  text: TextOption
  password: PasswordOption
  color: ColorOption
  number: NumberOption
  range: RangeOption
  boolean: BooleanOption
  date: DateOption
  time: TimeOption
  email: EmailOption
  path: WebPathOption
  url: URLOption
  file: FileOption
  select: SelectOption
  tags: TagsOption
  'tags-select': TagsOption
  domain: DomainOption
  app: AppOption
  user: UserOption
  group: GroupOption
}
