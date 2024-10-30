<template>
  <ViewBase
      :queries="queries"
      @queries-response="onQueriesResponse"
  >
    <BTable v-if="disks" :fields="table_fields" :items="table_items">

    </BTable>
  </ViewBase>
</template>

<script>
import {filesize} from "filesize";

export default {
  name: 'Disks',
  data () {
    return {
      queries: [['GET', 'storage/disks/infos']],
      disks: undefined,
      table_fields: [
        {
          key: 'name',
          label: this.$t('storage_disks.table.disks_name'),
        },
        {
          key: 'serial',
          label: this.$t('storage_disks.table.disks_serial'),
        },
        {
          key: 'size',
          label: this.$t('storage_disks.table.disks_size'),
        },
      ]
    }
  },
  computed: {
    table_items () {
      if (this.disks === undefined) return []

      return Object.entries(this.disks).map(([name, infos]) => {
        return {
          name,
          serial: infos.serial,
          size: this.humanSize(infos.size),
        }
      })
    }
  },
  methods: {
    onQueriesResponse (disks) {
      this.disks = disks
    },
    humanSize (size) {
      if (typeof size !== 'number') return size
      return filesize(size);
    }
  }
}
</script>
