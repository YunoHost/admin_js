<template>
  <div class="home">
    <BListGroup class="menu-list">
      <BListGroupItem
        v-for="item in menu"
        :key="item.routeName"
        :to="{ name: item.routeName }"
      >
        <YIcon :iname="item.icon" class="lg ml-1" />
        <h4>{{ $t(item.translation) }}</h4>
        <YIcon iname="chevron-right" class="lg fs-sm ml-auto" />
      </BListGroupItem>
    </BListGroup>
  </div>
</template>

<script>
export default {
  name: 'HomeView',

  data() {
    return {
      menu: [
        { routeName: 'user-list', icon: 'users', translation: 'users' },
        { routeName: 'domain-list', icon: 'globe', translation: 'domains' },
        { routeName: 'app-list', icon: 'cubes', translation: 'applications' },
        { routeName: 'storage', icon: 'hdd-o', translation: 'storage' },
        { routeName: 'update', icon: 'refresh', translation: 'system_update' },
        { routeName: 'tool-list', icon: 'wrench', translation: 'tools' },
        {
          routeName: 'diagnosis',
          icon: 'stethoscope',
          translation: 'diagnosis',
        },
        { routeName: 'backup', icon: 'archive', translation: 'backup' },
      ],
    }
  },
}
</script>

<style lang="scss" scoped>
.home {
  margin-top: 2rem;
}
</style>
