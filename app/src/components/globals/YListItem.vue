<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    sublabel?: string
    description?: string
    imageSrc?: string
  }>(),
  {
    sublabel: undefined,
    description: undefined,
    imageSrc: undefined,
  },
)

const slots = defineSlots<{
  default?: any
}>()
</script>

<template>
  <BListGroupItem
    class="d-flex justify-content-between align-items-center pe-0"
  >
    <div class="d-flex">
      <div v-if="imageSrc" class="me-3">
        <img :src="imageSrc" />
      </div>
      <div>
        <h5>
          <strong class="fw-bold">{{ label }}</strong>
          <small v-if="sublabel" class="ms-1 text-secondary">
            {{ sublabel }}
          </small>
        </h5>
        <p v-if="description || slots.default" class="m-0">
          <slot name="default">
            {{ description }}
          </slot>
        </p>
      </div>
    </div>

    <YIcon iname="chevron-right" class="lg fs-sm ms-auto" />
  </BListGroupItem>
</template>

<style lang="scss" scoped>
img {
  width: 2.5rem;
  height: 100%;
  object-fit: contain;
}
</style>
