<script setup lang="ts">
import api from '@/api'
import { useUsersAndGroups } from '@/composables/data'
import { useInfos } from '@/composables/useInfos'
import { useSearch } from '@/composables/useSearch'

await api.get({
  uri: 'users?fields=username&fields=fullname&fields=mail&fields=mailbox-quota&fields=groups',
  cachePath: 'users',
})

const { users } = useUsersAndGroups()
const [search, filteredUsers] = useSearch(
  users,
  (s, user) =>
    user.username.toLowerCase().includes(s) || user.groups.includes(s),
)

function downloadExport() {
  const { host } = useInfos()
  window.open(`https://${host.value}/yunohost/api/users/export`, '_blank')
}
</script>

<template>
  <ViewSearch v-model="search" :items="filteredUsers" items-name="users">
    <template #top-bar-buttons>
      <BDropdown
        :split-to="{ name: 'user-create' }"
        split
        variant="outline-success"
        right
        split-variant="success"
      >
        <template #button-content>
          <YIcon iname="plus" /> {{ $t('users_add') }}
        </template>
        <BDropdownItem :to="{ name: 'user-import' }">
          <YIcon iname="plus" /> {{ $t('users_import') }}
        </BDropdownItem>
        <BDropdownItem @click="downloadExport">
          <YIcon iname="download" /> {{ $t('users_export') }}
        </BDropdownItem>
      </BDropdown>
    </template>

    <BListGroup>
      <YListItem
        v-for="user in filteredUsers"
        :key="user.username"
        :to="{ name: 'user-info', params: { name: user.username } }"
        :label="user.username"
        :sublabel="user.fullname"
        :description="user.mail"
      />
    </BListGroup>
  </ViewSearch>
</template>
