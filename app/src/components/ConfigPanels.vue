<script
  setup
  lang="ts"
  generic="NestedMV extends Obj, MV extends Obj<NestedMV>"
>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import type { FormValidation } from '@/composables/form'
import type { KeyOfStr, Obj } from '@/types/commons'
import type { ConfigPanel, ConfigPanels } from '@/types/configPanels'

defineOptions({
  inheritAttrs: false,
})

const currentRoute = useRoute()
const _props = defineProps<{
  panel: ConfigPanel<NestedMV, MV>
  routes: ConfigPanels<NestedMV, MV>['routes']
  validations: FormValidation<NestedMV>
}>()

const emit = defineEmits<{
  apply: [action?: KeyOfStr<typeof _props.panel.fields>]
}>()

const slots = defineSlots<{
  'tab-top'?: any
  'tab-before'?: any
  default?: any
  'tab-after'?: any
}>()

const modelValue = defineModel<NestedMV>({ required: true })

const cardProps = computed(() => {
  const { text, icon } = _props.routes[0]
  return _props.routes.length === 1 ? { title: text, icon } : {}
})
</script>

<template>
  <CardForm
    v-bind="cardProps"
    :key="panel.id"
    :id="`panel-${panel.id}`"
    v-model="modelValue"
    :fields="panel.fields"
    :no-footer="!panel.hasApplyButton"
    :sections="panel.sections"
    :validations="validations"
    @submit="emit('apply')"
    @action="emit('apply', $event)"
    class="config-panel"
  >
    <template v-if="routes.length > 1" #header>
      <BCardHeader tag="nav">
        <BNav card-header fill pills>
          <BNavItem
            v-for="route in routes"
            :key="route.text"
            :to="route.to"
            :active="currentRoute.params.tabId === route.to.params?.tabId"
          >
            <!-- FIXME added :active="" because `exact-active-class` not working https://github.com/bootstrap-vue-next/bootstrap-vue-next/issues/1754 -->
            <!-- exact-active-class="active" -->
            <YIcon v-if="route.icon" :iname="route.icon" />
            {{ route.text }}
          </BNavItem>
        </BNav>
      </BCardHeader>
    </template>

    <template #top>
      <slot name="tab-top" />
    </template>
    <template v-if="panel.help" #disclaimer>
      <div class="alert alert-info" v-html="panel.help" />
    </template>
    <template #before-form>
      <slot name="tab-before" />
    </template>
    <template v-if="slots.default" #default>
      <slot name="default" />
    </template>
    <template #after-form>
      <slot name="tab-after" />
    </template>
  </CardForm>
</template>
