<script setup lang="ts">
const menu = [
  { routeName: 'user-list', icon: 'users', translation: 'users' },
  {
    routeName: 'group-list',
    icon: 'key-modern',
    translation: 'groups_and_permissions',
  },
  { routeName: 'domain-list', icon: 'globe', translation: 'domains' },
  { routeName: 'app-list', icon: 'cubes', translation: 'applications' },
  { routeName: 'update', icon: 'refresh', translation: 'system_update' },
  { routeName: 'tool-list', icon: 'wrench', translation: 'tools' },
  {
    routeName: 'diagnosis',
    icon: 'stethoscope',
    translation: 'diagnosis',
  },
  { routeName: 'backup', icon: 'archive', translation: 'backup' },
]
</script>

<template>
  <div class="home">
    <BListGroup class="menu-list">
      <BListGroupItem
        v-for="item in menu"
        :key="item.routeName"
        :to="{ name: item.routeName }"
      >
        <YIcon :iname="item.icon" class="lg ms-1" />
        <h4>{{ $t(item.translation) }}</h4>
        <YIcon iname="chevron-right" class="lg fs-sm ms-auto" />
      </BListGroupItem>
    </BListGroup>
  </div>
</template>
