<script setup lang="ts">
import api from '@/api'
import { useSearch } from '@/composables/useSearch'
import type { AppList } from '@/types/core/api'

const apps = await api
  .get<AppList>({ uri: 'apps?full', initial: true })
  .then(({ apps }) => {
    return apps
      .map(({ id, name, description, manifest, logo }) => {
        const logoUrl = logo
          ? `https://10.118.36.150/yunohost/admin/applogos/${logo}.png`
          : undefined
        return { id, name: manifest.name, label: name, description, logoUrl }
      })
      .sort((prev, app) => {
        return prev.label > app.label ? 1 : -1
      })
  })

const [search, filteredApps] = useSearch(apps, (s, app) =>
  Object.values(app).some((value) => value && value.toLowerCase().includes(s)),
)
</script>

<template>
  <ViewSearch
    v-model="search"
    items-name="installed_apps"
    :items="filteredApps"
  >
    <template #top-bar-buttons>
      <BButton variant="success" :to="{ name: 'app-catalog' }">
        <YIcon iname="plus" />
        {{ $t('install_app') }}
      </BButton>
    </template>

    <BListGroup>
      <YListItem
        v-for="{ id, description, label, logoUrl } in filteredApps"
        :key="id"
        :to="{ name: 'app-info', params: { id, coreTabId: '_core' } }"
        :label="label"
        :sublabel="id"
        :description="description"
        :image-src="logoUrl"
      />
    </BListGroup>
  </ViewSearch>
</template>
