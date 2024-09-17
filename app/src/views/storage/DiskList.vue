<template>
  <YAlert
    v-if="!hasDisks"
    alert
    icon="exclamation-triangle"
    variant="warning"
  >
    {{ $t("items_verbose_count", { items: $t('items.inserted_disk', 0) }, 0) }}
  </YAlert>
  <BRow v-else>
    <YListItem
      v-for="disk in disks"
      :key="disk.serial"
      :to="{ name: 'app-info', params: { id: disk.serial } }"
      :label="disk.name"
      :sublabel="disk.size"
      :description="disk.model"
    />
  </BRow>
</template>

<script setup lang="ts">
import { humanSize } from '@/helpers/commons'
import { ref, type Ref, computed } from 'vue'
import api from '@/api'
import type { APIDiskResult, Disk } from '@/types/core/api.ts'
import YListItem from '@/components/globals/YListItem.vue'

const disks: Ref<Disk[]> = ref([])
const hasDisks = computed(() => disks.value.length > 0)

api.fetch<{ disks: APIDiskResult[] }>({ uri: 'storage/disk/list' }).then((result) => {
  disks.value = result.disks.map((disk) => {
    return {
      ...disk,
      size: humanSize(disk.size),
    }
  })
})
</script>
