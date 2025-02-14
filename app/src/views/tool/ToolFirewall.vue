<script setup lang="ts">
import type { TableField } from 'bootstrap-vue-next'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { APIBadRequestError, type APIError } from '@/api/errors'
import { useForm } from '@/composables/form'
import { useAutoModal } from '@/composables/useAutoModal'
import { between, integer, required } from '@/helpers/validators'
import type { Firewall } from '@/types/core/api'
import type { FieldProps, FormFieldDict } from '@/types/form'

const { t } = useI18n()
const modalConfirm = useAutoModal()
const { protocols, upnpEnabled } = await api
  .fetch<Firewall>({ uri: 'firewall?raw' })
  .then((firewall) => {
    return {
      protocols: reactive({
        // This is because BTable expects a list
        tcp: Object.entries(firewall['tcp']).map(([k, v]) => ({
          port: parseInt(k),
          ...v,
        })),
        udp: Object.entries(firewall['udp']).map(([k, v]) => ({
          port: parseInt(k),
          ...v,
        })),
      }),
      upnpEnabled: ref(firewall.router_forwarding_upnp),
    }
  })

const upnpError = ref('')
const tableFields = [
  { key: 'port', label: t('port'), thClass: 'col-2' },
  { key: 'open', label: t('open'), thClass: 'col-2' },
  { key: 'upnp', label: t('upnp'), thClass: 'col-2' },
  { key: 'comment', label: t('words.comment'), thClass: 'col-6' },
]

type Form = {
  action: 'open' | 'close'
  port: number
  protocol: 'tcp' | 'udp'
  upnp: boolean
  comment: string
}

const form = ref<Form>({
  action: 'open',
  port: 0,
  protocol: 'tcp',
  upnp: false,
  comment: '',
})

const fields = {
  action: {
    component: 'SelectItem',
    label: t('action'),
    rules: { required },
    cProps: {
      id: 'input-action',
      choices: [
        { value: 'open', text: t('open') },
        { value: 'close', text: t('close') },
      ],
    },
  } satisfies FieldProps<'SelectItem', Form['port']>,

  port: {
    component: 'InputItem',
    label: t('port'),
    rules: { number: required, integer, between: between(0, 65535) },
    cProps: { id: 'input-port', placeholder: '0', type: 'number' },
  } satisfies FieldProps<'InputItem', Form['action']>,

  protocol: {
    component: 'SelectItem',
    label: t('protocol'),
    rules: { required },
    cProps: {
      id: 'input-protocol',
      choices: [
        { value: 'tcp', text: t('tcp') },
        { value: 'udp', text: t('udp') },
      ],
    },
  } satisfies FieldProps<'SelectItem', Form['protocol']>,

  upnp: {
    component: 'CheckboxItem',
    label: t('upnp'),
    rules: { required },
    cProps: { id: 'upnp', labels: { true: 'enabled', false: 'disabled' } },
  } satisfies FieldProps<'CheckboxItem', Form['upnp']>,

  comment: {
    component: 'InputItem',
    label: t('words.comment'),
    rules: { string: required },
    cProps: { id: 'comment', placeholder: '', type: 'text' },
  } satisfies FieldProps<'InputItem', Form['upnp']>,
} satisfies FormFieldDict<Form>

const { v } = useForm(form, fields)

async function togglePort({
  action,
  port,
  protocol,
  upnp,
  comment,
}: Form): Promise<boolean> {
  const confirmed = await modalConfirm(
    t('confirm_firewall_' + action, {
      port,
      protocol,
    }),
  )
  if (!confirmed) return false

  const argupnp = upnp ? '&upnp' : ''
  return api
    .put({
      uri: `firewall/${protocol}/${action}/${port}?comment=${comment}${argupnp}`,
      showModal: false,
    })
    .then(() => true)
}

async function toggleUpnp() {
  const action = upnpEnabled.value ? 'disable' : 'enable'
  const confirmed = await modalConfirm(t('confirm_upnp_' + action))
  if (!confirmed) return

  api
    .put({ uri: 'firewall/upnp/' + action })
    .then(() => {
      // FIXME Couldn't test when it works.
      api.refetch()
    })
    .catch((err: APIError) => {
      if (!(err instanceof APIBadRequestError)) throw err
      upnpError.value = err.message
    })
}

function onTablePortToggling(
  protocol: Form['protocol'],
  index: number,
  key: 'open' | 'upnp',
  value: boolean,
) {
  // To reset state if canceled
  const { open, upnp } = protocols[protocol][index]

  if (key === 'open' || value) {
    protocols[protocol][index]['open'] = value
  }
  if (key === 'upnp' || !value) {
    protocols[protocol][index]['upnp'] = value
  }
  // FIXME: maybe someday handle comment edition?

  const action = key === 'upnp' || value ? 'open' : 'close'
  togglePort({ action, protocol, ...protocols[protocol][index] }).then(
    (confirmed) => {
      // Revert change on cancel
      if (!confirmed) {
        protocols[protocol][index]['open'] = open
        protocols[protocol][index]['upnp'] = upnp
      }
    },
  )
}

function onFormPortToggling() {
  togglePort(form.value).then((confirmed) => {
    // TODO: update data instead of refetch?
    if (confirmed) api.refetch()
  })
}

function onCommentEdit(protocol: Form['protocol'], index: number) {
  const { open, upnp, port, comment } = protocols[protocol][index]
  form.value = {
    action: open ? 'open' : 'close',
    port,
    protocol,
    upnp,
    comment,
  }
  ;(document.querySelector('#comment') as HTMLInputElement).focus()
}

function getFieldClass(field: TableField) {
  const classes = {
    port: 'col-2 pe-2',
    open: 'col-2',
    upnp: 'col-2',
    comment: 'col-6',
  } as Record<typeof field.key, string>
  field.class = classes[field.key]
}
</script>

<template>
  <div>
    <!-- PORTS -->
    <YCard :title="$t('ports')" icon="shield">
      <div v-for="(items, protocol) in protocols" :key="protocol">
        <h5>{{ $t(protocol) }}</h5>

        <BTableLite
          :fields="tableFields"
          :items="items"
          small
          striped
          responsive
          table-class="table-fixed"
          :field-column-class="getFieldClass"
        >
          <!-- PORT CELL -->
          <template #cell(port)="data">
            {{ data.value }}
          </template>

          <!-- CONNECTIONS CELL -->
          <template #cell()="data">
            <BFormCheckbox
              :model-value="data.value as boolean"
              switch
              @update:model-value="
                onTablePortToggling(
                  protocol,
                  data.index,
                  data.field.key as 'open' | 'upnp',
                  $event as boolean,
                )
              "
            >
              <span
                :class="'btn btn-xs btn-' + (data.value ? 'danger' : 'success')"
              >
                {{ $t(data.value ? 'close' : 'open') }}
              </span>
            </BFormCheckbox>
          </template>

          <template #cell(comment)="data">
            <div 
              class="d-flex w-100"
            >
              {{ data.value }}
              <BButton
                size="xs"
                class="ms-auto me-md-2"
                @click="onCommentEdit(protocol, data.index)"
              >
                {{ $t('words.edit') }}
              </BButton>
            </div>
          </template>
        </BTableLite>
      </div>
    </YCard>

    <!-- OPERATIONS -->
    <CardForm
      v-model="form"
      :fields="fields"
      icon="cogs"
      :title="$t('operations')"
      :validations="v"
      @submit.prevent="onFormPortToggling"
    />

    <!-- UPnP -->
    <YCard
      :title="$t('upnp')"
      icon="exchange"
      :body-text-variant="upnpEnabled ? 'success' : 'danger'"
    >
      {{ $t(upnpEnabled ? 'upnp_enabled' : 'upnp_disabled') }}

      <BFormInvalidFeedback :state="upnpError !== '' ? false : null">
        {{ upnpError }}
      </BFormInvalidFeedback>

      <template #buttons>
        <BButton
          :variant="!upnpEnabled ? 'success' : 'danger'"
          @click="toggleUpnp"
        >
          {{ $t(!upnpEnabled ? 'enable' : 'disable') }}
        </BButton>
      </template>
    </YCard>
  </div>
</template>

<style lang="scss" scoped>
:deep() {
  .table-fixed {
    table-layout: fixed;
  }

  .table .form-switch {
    .form-check-input {
      &:checked {
        border-color: $success;
        background-color: $success;
      }
      &:not(:checked) {
        --bs-form-switch-bg: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'><circle r='3' fill='%23222222)'/></svg>") !important;
        border-color: $danger;
        background-color: $danger;
      }
    }

    input:focus ~ .custom-control-label,
    &:hover {
      span {
        visibility: visible;
      }
    }
    span {
      visibility: hidden;
      @include media-breakpoint-down(sm) {
        display: none;
      }
    }
  }
}
</style>
