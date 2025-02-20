import type { ComputedRef, Ref } from 'vue'

import type { Obj, KeyOfStr, CustomRoute } from '@/types/commons'
import type {
  FormField,
  FormFieldReadonly,
  FormFieldDisplay,
  FormFieldDict,
} from '@/types/form'
import type {
  AnyOptionType,
  AnyOption,
  OptionTypeToOptionResolver,
} from '@/types/core/options'

export const OPTION_COMPONENT_RESOLVER = {
  display_text: 'DisplayTextItem',
  markdown: 'MarkdownItem',
  alert: 'ReadOnlyAlertItem',
  button: 'ButtonItem',
  string: 'InputItem',
  text: 'TextAreaItem',
  password: 'InputItem',
  color: 'InputItem',
  number: 'InputItem',
  range: 'InputItem',
  boolean: 'CheckboxItem',
  date: 'InputItem',
  time: 'InputItem',
  email: 'InputItem',
  path: 'InputItem',
  url: 'InputItem',
  file: 'FileItem',
  select: 'SelectItem',
  tags: 'TagsItem',
  'tags-select': 'TagsSelectizeItem',
  domain: 'SelectItem',
  app: 'SelectItem',
  user: 'SelectItem',
  group: 'SelectItem',
} as const

export function isIn<T extends AnyOptionType, U extends AnyOption>(
  coll: ReadonlyArray<T>,
  el: U,
): el is U & OptionTypeToOptionResolver[T] {
  return coll.includes(el.type as T)
}

// FIXME move to types/form.ts?
export type AnyFormField = FormField | FormFieldReadonly | FormFieldDisplay

export type ConfigSection<MV extends Obj, FFD extends FormFieldDict<MV>> = {
  help: string
  fields: KeyOfStr<FFD>[]
  id: string
  isActionSection: boolean
  name?: string
  visible: boolean | ComputedRef<boolean>
  collapsed: boolean
}

export type ConfigPanel<
  NestedMV extends Obj,
  MV extends Obj<NestedMV>,
  FFD extends FormFieldDict<NestedMV> = FormFieldDict<NestedMV>,
> = {
  fields: FFD
  help: string
  hasApplyButton: boolean
  id: KeyOfStr<MV>
  icon?: string
  name: string
  sections?: ConfigSection<NestedMV, FFD>[]
}

export type ConfigPanels<NestedMV extends Obj, MV extends Obj<NestedMV>> = {
  forms: Record<keyof MV, Ref<NestedMV>>
  panels: ConfigPanel<NestedMV, MV>[]
  routes: CustomRoute[]
}
