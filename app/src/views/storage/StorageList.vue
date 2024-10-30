<!-- FIXME make a component shared with HomeView.vue ? -->
<template>
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
</template>

<script>
export default {
  name: 'StorageList',

  data() {
    return {
      menu: [
        {
          routeName: 'storage-disks',
          icon: 'hdd-o',
          translation: 'storage_disks.category_name',
        },
      ],
    }
  },
}
</script>
