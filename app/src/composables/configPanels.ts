import evaluate from 'simple-evaluate'
import type {
  ComputedRef,
  MaybeRefOrGetter,
  Ref,
  WritableComputedRef,
} from 'vue'
import { computed, ref, toValue, watch } from 'vue'
import { useRouter } from 'vue-router'

import { APIBadRequestError, APIError } from '@/api/errors'
import { deepSetErrors, useForm, type FormValidation } from '@/composables/form'
import { isObjectLiteral } from '@/helpers/commons'
import * as validators from '@/helpers/validators'
import { formatForm, formatI18nField } from '@/helpers/yunohostArguments'
import i18n from '@/i18n'
import type { CustomRoute, KeyOfStr, MergeUnion, Obj } from '@/types/commons'
import type {
  AnyFormField,
  ConfigPanel,
  ConfigPanels,
} from '@/types/configPanels'
import { OPTION_COMPONENT_RESOLVER, isIn } from '@/types/configPanels'
import type {
  AnyOption,
  AnyWritableOption,
  CoreConfigPanel,
  CoreConfigPanels,
  JSExpression,
} from '@/types/core/options'
import {
  ANY_DISPLAY_OPTION_TYPE,
  ANY_INPUT_OPTION_TYPE,
  ANY_WRITABLE_OPTION_TYPE,
} from '@/types/core/options'
import type {
  AnyDisplayItemProps,
  AnyWritableItemProps,
  FormField,
  FormFieldDict,
  FormFieldDisplay,
  FormFieldReadonly,
} from '@/types/form'
import {
  isAdressModelValue,
  isFileModelValue,
  isNonWritableComponent,
} from '@/types/form'

function formatOptionValue(option: AnyWritableOption) {
  let value = option.value ?? null

  if ('tags' === option.type) {
    // FIXME format in core?
    if (typeof value === 'string') {
      value = value.split(',')
    } else if (!value) {
      value = []
    }
  } else if ('boolean' === option.type) {
    // FIXME format in core?
    if (value !== null) {
      value = ['1', 'yes', 'y', 'true'].includes(String(value).toLowerCase())
    } else if (option.default !== null && option.default !== undefined) {
      value = ['1', 'yes', 'y', 'true'].includes(
        String(option.default).toLowerCase(),
      )
    }
  } else if ('file' === option.type) {
    value = {
      // in case of already defined file, we receive only the file path (not the actual file)
      file: value ? new File([''], value) : null,
      content: '',
      current: !!value,
      removed: false,
    }
  }

  if (value === null && option.default !== undefined) {
    value = option.default
  }

  return value
}

/**
 * Format app install and config panel Option into a Field that can be consumed
 * by form field components.
 *
 * @param option - a core Option written by a packager
 * @param form - a ref containing all related form values for expressions's evaluations
 * @return Formated `FormField | FormFieldReadonly | FormFieldDisplay` props with form items props.
 */
function formatOption(option: AnyOption, form: Ref<Obj>): AnyFormField {
  const visible = useExpression(option.visible, form)

  if (isIn(ANY_DISPLAY_OPTION_TYPE, option)) {
    const component = OPTION_COMPONENT_RESOLVER[option.type]
    // TODO: could be improved, for simplicity cProps can be be any display item props
    // but this is not type safe.
    const cProps = {
      label: formatI18nField(option.ask),
      id: option.id,
    } as MergeUnion<AnyDisplayItemProps>
    const field: FormFieldDisplay<typeof component> = {
      component,
      visible,
      cProps,
      rules: undefined,
    }

    if (isIn(['button', 'alert'], option)) {
      cProps.type = option.style
      cProps.icon = option.icon
      if (option.type === 'button') {
        cProps.enabled = useExpression(option.enabled, form)
      }
    }

    return field
  } else if (isIn(ANY_WRITABLE_OPTION_TYPE, option)) {
    if ('tags' === option.type && option.choices) {
      // TODO: update in core directly?
      option.type = 'tags-select'
    }

    const component = OPTION_COMPONENT_RESOLVER[option.type]
    // TODO: could be improved, for simplicity cProps can be be any writable item props
    // but this is not type safe.
    const cProps = {
      id: option.id,
      placeholder: option.example,
    } as MergeUnion<AnyWritableItemProps>
    const rules: FormField['rules'] = {}
    const field: FormField<typeof component> = {
      component,
      label: formatI18nField(option.ask),
      rules: option.readonly ? undefined : rules,
      visible,
      description: formatI18nField(option.help),
    }

    // We don't care about component props in case of readonly
    if (option.readonly) {
      return { ...field, readonly: true } as FormFieldReadonly<typeof component>
    } else {
      field.cProps = cProps
    }

    const t = i18n.global.t

    if (isIn(ANY_INPUT_OPTION_TYPE, option)) {
      cProps.type = isIn(['string', 'path'], option) ? 'text' : option.type
      // trim
      // autocomplete

      if (option.type === 'password') {
        field.description ??= t('good_practices_about_admin_password')
        rules.passwordLenght = validators.minLength(8)
        cProps.placeholder = '••••••••••••'
      } else if (isIn(['number', 'range'], option)) {
        rules.numValue = validators.integer
        cProps.step = option.step

        if (option.min !== undefined) {
          rules.minValue = validators.minValue(option.min)
        }
        if (option.max !== undefined) {
          rules.maxValue = validators.maxValue(option.max)
        }
      }
    } else if (isIn(['select', 'user', 'domain', 'app', 'group'], option)) {
      cProps.choices = isObjectLiteral(option.choices)
        ? Object.entries(option.choices).map(([k, v]) => ({
            text: v,
            value: k,
          }))
        : option.choices // FIXME rename choices to options?
      if (option.type !== 'select') {
        field.link = {
          name: option.type + '-list',
          text: t(`manage_${option.type}s`),
        }
      }
    } else if (isIn(['tags', 'tags-select'], option)) {
      // cProps.limit = option.limit  // FIXME limit is not defined in core?
      cProps.placeholder = option.placeholder
      cProps.tagIcon = option.icon

      if ('tags-select' === option.type) {
        cProps.options = option.choices
        cProps.auto = true
        cProps.label = option.placeholder
      }
    } else if ('boolean' === option.type) {
      // FIXME
      // cProps.choices = option.choices
    }

    if ('file' === option.type) {
      cProps.accept = option.accept
    }

    if ('boolean' !== option.type && option.optional === false) {
      rules.required = validators.required
    }

    if (isIn(['string', 'text', 'path', 'url'], option) && option.pattern) {
      rules.pattern = validators.helpers.withMessage(
        formatI18nField(option.pattern.error),
        validators.helpers.regex(new RegExp(option.pattern.regexp)),
      )
    }

    return field
  } else {
    throw new TypeError(
      'Unknown Option type: ' + (option as { type: unknown }).type,
    )
  }
}

/**
 * Format app install and config panel's options into a form and fields that
 * can be used to populate `useForm` composable and CardForm component.
 *
 * @param options - a core Option array written by a packager
 * @return An object with form and fields
 */
export function formatOptions<MV extends Obj>(
  options: AnyOption[],
): {
  fields: FormFieldDict<MV>
  form: Ref<MV>
} {
  const form = ref(
    Object.fromEntries(
      options
        .filter((option) => isIn(ANY_WRITABLE_OPTION_TYPE, option))
        .map((option) => {
          return [option.id, formatOptionValue(option as AnyWritableOption)]
        }),
    ),
  ) as Ref<MV>

  return {
    form,
    fields: Object.fromEntries(
      options.map((option) => [option.id, formatOption(option, form)]),
    ) as FormFieldDict<MV>,
  }
}

function formatConfigPanel<NestedMV extends Obj, MV extends Obj<NestedMV>>(
  panel: CoreConfigPanel<MV>,
): {
  form: Ref<NestedMV>
  panel: ConfigPanel<NestedMV, MV>
} {
  const options = panel.sections?.flatMap((section) => section.options)
  const { form, fields } = options
    ? formatOptions<NestedMV>(options)
    : { form: ref({}) as Ref<NestedMV>, fields: {} as FormFieldDict<NestedMV> }
  let hasApplyButton = false

  const sections = panel.sections?.map((section) => {
    const sectionFieldsIds = section.options.map<
      KeyOfStr<FormFieldDict<NestedMV>>
    >((option) => option.id)

    if (
      !section.is_action_section &&
      sectionFieldsIds.some((id) => !isNonWritableComponent(fields[id]))
    ) {
      hasApplyButton = true
    }

    return {
      help: formatI18nField(section.help),
      fields: sectionFieldsIds,
      id: section.id,
      isActionSection: section.is_action_section,
      name: formatI18nField(section.name),
      visible: useExpression(section.visible, form),
      collapsed: section.collapsed ?? false
    }
  })

  return {
    form,
    panel: {
      fields,
      help: formatI18nField(panel.help),
      hasApplyButton,
      id: panel.id,
      name: formatI18nField(panel.name),
      sections,
    },
  }
}

export function formatConfigPanels<
  NestedMV extends Obj,
  MV extends Obj<NestedMV>,
>(config: CoreConfigPanels<MV>): ConfigPanels<NestedMV, MV> {
  return config.panels.reduce(
    (cps, panel_) => {
      const { form, panel } = formatConfigPanel<NestedMV, MV>(panel_)
      cps.forms[panel.id] = form
      cps.panels.push(panel)
      return cps
    },
    {
      forms: {} as Record<keyof MV, Ref<NestedMV>>,
      panels: [],
      routes: config.panels.map((panel) => ({
        to: { params: { tabId: panel.id } },
        text: formatI18nField(panel.name),
        icon: panel.icon || 'wrench',
      })),
    } as ConfigPanels<NestedMV, MV>,
  )
}

function useExpression(
  expression: JSExpression | undefined,
  form: Ref<Obj>,
): boolean | ComputedRef<boolean> {
  if (typeof expression === 'boolean') return expression
  if (typeof expression === 'string') {
    // FIXME normalize expression in core? ('', 'false', 'true') and rm next 2 lines
    if (!expression || expression === 'true') return true
    if (expression === 'false') return false
    return useEvaluation(expression, form)
  }
  return true
}

/**
 * Evaluate config panel string expression that can contain regular expressions.
 * Expressions are evaluated with the config panel's form as context.
 *
 * @param expression - A string expression to evaluate as a boolean
 * @param form - An object to serve as evaluation context
 * @return A computed boolean
 */
function useEvaluation(expression: string, form: MaybeRefOrGetter<Obj>) {
  function buildContext(f: Obj) {
    // FIXME deepClone?
    const ctx: Obj = { ...f }
    let exp = expression

    for (const key in ctx) {
      if (isFileModelValue(ctx[key])) {
        ctx[key] = ctx[key].content
      }
      if (isAdressModelValue(ctx[key])) {
        ctx[key] = Object.values(ctx[key]).join('')
      }
    }

    // Allow to use match(var,regexp) function
    const matchRe = /match(\s*(\w+)\s*,\s*"([^"]+)"\s*)/g
    for (const matched of expression.matchAll(matchRe)) {
      const [fullMatch, varMatch, regExpMatch] = matched
      const varName = varMatch + '__re' + matched.index
      ctx[varName] = new RegExp(regExpMatch, 'm').test(ctx[varMatch])
      exp = expression.replace(fullMatch, varName)
    }

    return { exp, ctx }
  }

  return computed(() => {
    const { exp, ctx } = buildContext(toValue(form))
    try {
      return !!evaluate(ctx, exp)
    } catch {
      return false
    }
  })
}

export type OnPanelApply<MV extends Obj = Obj> = (
  data: { panelId: keyof MV; data: Obj; action?: string },
  onError: (err: APIError, errorMessage?: string) => void,
) => void

export type ConfigPanelsProps<
  NestedMV extends Obj = Obj,
  MV extends Obj<NestedMV> = Obj<NestedMV>,
> = {
  form: WritableComputedRef<NestedMV>
  panel: ComputedRef<ConfigPanel<NestedMV, MV, FormFieldDict<NestedMV>>>
  routes: CustomRoute[]
  v: Ref<FormValidation<NestedMV>>
  onPanelApply: (actionId?: KeyOfStr<FormFieldDict<NestedMV>>) => void
}

export function useConfigPanels<NestedMV extends Obj, MV extends Obj<NestedMV>>(
  config: ConfigPanels<NestedMV, MV>,
  tabId: MaybeRefOrGetter<keyof MV | undefined>,
  onPanelApply: OnPanelApply<MV>,
  tabIdKey: string = 'tabId',
): ConfigPanelsProps<NestedMV, MV> {
  const router = useRouter()
  watch(
    () => toValue(tabId),
    (id) => {
      if (!id) {
        router.replace({
          params: {
            ...router.currentRoute.value.params,
            [tabIdKey]: config.panels[0].id,
          },
        })
      }
    },
    { immediate: true },
  )

  const panelId = computed(() => toValue(tabId) || config.panels[0].id)
  const panel = computed(() => {
    return config.panels.find((panel) => panel.id === panelId.value)!
  })

  const form = computed({
    get: () => config.forms[panelId.value].value,
    set: (form) => (config.forms[panelId.value].value = form),
  })

  const { v, serverErrors } = useForm<NestedMV>(form, () => panel.value.fields)

  function onErrorFn(err: APIError) {
    if (!(err instanceof APIBadRequestError)) throw err
    if (err.data.name) {
      deepSetErrors(
        serverErrors,
        [err.message],
        'form',
        // FIXME probably need to remove panel + section id
        ...err.data.name.split('.'),
      )
    } else {
      serverErrors.global = [err.message]
    }
  }

  const onBeforePanelApply = async (
    actionId?: KeyOfStr<FormFieldDict<NestedMV>>,
  ) => {
    const panelId = panel.value.id
    let form: NestedMV | Partial<NestedMV> = config.forms[panelId].value
    let action: undefined | string = undefined

    if (actionId) {
      const section = panel.value.sections!.find((section) =>
        section.fields.includes(actionId),
      )!
      action = `${panelId}.${section.id}.${actionId}`
      const actionForm: Partial<NestedMV> = {}
      for (const id of section.fields) {
        if (id in form) {
          // FIXME check visible? skip validate and value if not visible?
          if (!(await v.value.form[id].$validate())) return
          actionForm[id] = form[id]
        }
      }
      form = actionForm
    } else {
      if (!(await v.value.form.$validate())) return
    }
    const data = await formatForm(form, { removeNullish: true })

    onPanelApply({ panelId, data, action }, onErrorFn)
  }

  return {
    form,
    panel,
    routes: config.routes,
    v,
    onPanelApply: onBeforePanelApply,
  }
}
