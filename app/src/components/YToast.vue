<script setup lang="ts">
import type { BToastProps } from 'bootstrap-vue-next'
import { computed } from 'vue'

const props = defineProps<BToastProps>()

const cancelable = computed(() => {
  return ['warning', 'danger'].some((variant) => variant === props.variant)
})
</script>

<template>
  <BToast v-bind="props" :model-value="cancelable ? 30000 : 5000" show-on-pause>
    <template #default="{ hide }">
      <div class="d-flex">
        <div v-html="body" />
        <BCloseButton class="ms-auto" @click="hide()" />
      </div>
    </template>
  </BToast>
</template>

<style lang="scss" scoped>
.btn-close {
  filter: unset !important;
  width: 1rem;
}
</style>
