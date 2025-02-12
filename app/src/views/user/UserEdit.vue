<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import { useDomains, useUsersAndGroups } from '@/composables/data'
import { useArrayRule, useForm } from '@/composables/form'
import { arrayDiff, getKeys } from '@/helpers/commons'
import {
  emailForward,
  emailLocalPart,
  integer,
  minLength,
  minValue,
  name as nameValidator,
  required,
  sameAs,
} from '@/helpers/validators'
import { formatAdress, formatForm, sizeToM } from '@/helpers/yunohostArguments'
import type { UserDetails } from '@/types/core/data'
import type { FieldProps, FormFieldDict } from '@/types/form'

const props = defineProps<{
  name: string
}>()

const { t } = useI18n()
const router = useRouter()
await api.fetchAll([
  {
    uri: `users/${props.name}`,
    cachePath: `userDetails.${props.name}`,
  },
  { uri: 'domains', cachePath: 'domains' },
])

const { domainsAsChoices, mainDomain } = useDomains()
const { user } = useUsersAndGroups(() => props.name)
// mailbox-quota could be 'No quota' or 'Pas de quota'...
const mailboxQuota =
  parseInt(user.value['mailbox-quota'].limit) > 0
    ? (sizeToM(user.value['mailbox-quota'].limit) ?? 0)
    : 0

type Form = typeof form.value
const form = ref({
  username: props.name,
  fullname: user.value.fullname,
  mail: formatAdress(user.value.mail),
  mailbox_quota: mailboxQuota,
  mail_aliases: user.value['mail-aliases'].map((mail) => formatAdress(mail)),
  mail_forward: [...user.value['mail-forward']],
  change_password: '',
  confirmation: '',
})
const fields = reactive({
  username: {
    component: 'InputItem',
    label: t('user_username'),
    cProps: {
      id: 'username',
      disabled: true,
      autocapitalize: 'off',
      spellcheck: 'false',
    },
  } satisfies FieldProps<'InputItem', Form['username']>,

  fullname: {
    component: 'InputItem',
    label: t('user_fullname'),
    rules: { required, nameValidator },
    cProps: {
      id: 'fullname',
      placeholder: t('placeholder.fullname'),
      spellcheck: 'false',
    },
  } satisfies FieldProps<'InputItem', Form['fullname']>,

  mail: reactive({
    component: 'AdressItem',
    label: t('user_email'),
    rules: {
      localPart: { required, email: emailLocalPart },
      domain: { required },
    },
    cProps: { id: 'mail', choices: domainsAsChoices },
  }) satisfies FieldProps<'AdressItem', Form['mail']>,

  mailbox_quota: {
    append: 'M',
    component: 'InputItem',
    label: t('user_mailbox_quota'),
    description: t('mailbox_quota_description'),
    // example: t('mailbox_quota_example'),
    rules: { integer, minValue: minValue(0) },
    cProps: {
      id: 'mailbox-quota',
      placeholder: t('mailbox_quota_placeholder'),
      type: 'number',
    },
  } satisfies FieldProps<'InputItem', Form['mailbox_quota']>,

  mail_aliases: reactive({
    component: 'AdressItem',
    label: t('user_emailaliases'),
    id: 'mail_aliases',
    rules: useArrayRule(() => form.value.mail_aliases, {
      localPart: { required, email: emailLocalPart },
      domain: { required },
    }),
    cProps: {
      placeholder: t('placeholder.username'),
      choices: domainsAsChoices,
    },
  }) satisfies FieldProps<'AdressItem', Form['mail_aliases']>,

  mail_forward: reactive({
    component: 'InputItem',
    label: t('user_emailforward'),
    id: 'mail_forward',
    rules: useArrayRule(() => form.value.mail_forward, {
      required,
      emailForward,
    }),
    cProps: {
      placeholder: t('user_new_forward'),
      type: 'email',
    },
  }) satisfies FieldProps<'InputItem', Form['mail_forward']>,

  change_password: {
    component: 'InputItem',
    label: t('password'),
    description: t('good_practices_about_user_password'),
    descriptionVariant: 'warning',
    rules: { passwordLenght: minLength(8) },
    cProps: {
      id: 'change_password',
      type: 'password',
      placeholder: '••••••••',
      autocomplete: 'new-password',
    },
  } satisfies FieldProps<'InputItem', Form['change_password']>,

  confirmation: reactive({
    component: 'InputItem',
    label: t('password_confirmation'),
    rules: computed(() => ({
      passwordMatch: sameAs(form.value.change_password),
    })),
    cProps: {
      id: 'confirmation',
      type: 'password',
      placeholder: '••••••••',
      autocomplete: 'new-password',
    },
  }) satisfies FieldProps<'InputItem', Form['confirmation']>,
} satisfies FormFieldDict<Form>)

const { v, onSubmit } = useForm(form, fields)

const onUserEdit = onSubmit(async (onError, serverErrors) => {
  const {
    username: _,
    confirmation: __,
    ...formData
  } = await formatForm(form, {
    removeEmpty: true,
  })
  const data = {} as Partial<
    Omit<UserDetails, 'mail-aliases' | 'mail-forward' | 'mailbox-quota'> &
      Record<
        | 'add_mailalias'
        | 'remove_mailalias'
        | 'add_mailforward'
        | 'remove_mailforward',
        string[]
      > & { mailbox_quota: string; change_password: string }
  >
  if (!Object.prototype.hasOwnProperty.call(formData, 'mailbox_quota')) {
    formData.mailbox_quota = 0
  }

  for (const key of ['mail_aliases', 'mail_forward'] as const) {
    const dashedKey = key.replace('_', '-') as 'mail-aliases' | 'mail-forward'
    const newKey = key.replace('_', '').replace('es', '') as
      | 'mailalias'
      | 'mailforward'
    const addDiff = arrayDiff(formData[key], user.value[dashedKey])
    const rmDiff = arrayDiff(user.value[dashedKey], formData[key])
    if (addDiff.length) data[`add_${newKey}`] = addDiff
    if (rmDiff.length) data[`remove_${newKey}`] = rmDiff
  }

  getKeys(formData).forEach((key) => {
    if (key === 'mail_aliases' || key === 'mail_forward') return
    if (key === 'mailbox_quota') {
      if (formData[key] !== mailboxQuota) {
        data[key] = formData[key]! > 0 ? formData[key] + 'M' : '0'
      }
    } else if (key === 'change_password') {
      data.change_password = formData[key]
    } else if (formData[key] !== user.value[key]) {
      data[key] = formData[key]
    }
  })

  if (Object.keys(data).length === 0) {
    serverErrors.global = [t('error_modify_something')]
    return
  }

  api
    .put({
      uri: `users/${props.name}`,
      cachePath: `userDetails.${props.name}`,
      data,
    })
    .then(() => {
      router.push({ name: 'user-info', params: { name: props.name } })
    })
    .catch(onError)
})
</script>

<template>
  <div>
    <CardForm
      v-model="form"
      icon="user"
      :fields="fields"
      :title="$t('user_username_edit', { name })"
      :validations="v"
      @submit.prevent="onUserEdit"
    >
      <template #field:mail_aliases="fieldProps">
        <FormFieldMultiple
          v-bind="fieldProps"
          v-model="form.mail_aliases"
          :add-btn-text="t('user_emailaliases_add')"
          :default-value="
            () => ({
              localPart: '',
              separator: '@',
              domain: mainDomain,
            })
          "
          :validation="v.form.mail_aliases"
        />
      </template>

      <template #field:mail_forward="fieldProps">
        <FormFieldMultiple
          v-bind="fieldProps"
          v-model="form.mail_forward"
          :add-btn-text="t('user_emailforward_add')"
          :default-value="() => ''"
          :validation="v.form.mail_forward"
        />
      </template>
    </CardForm>
  </div>
</template>

<style lang="scss" scoped>
.mail-list {
  display: flex;
  justify-items: stretch;

  .btn-danger {
    align-self: flex-start;
    margin-left: 0.5rem;
  }
}
</style>
