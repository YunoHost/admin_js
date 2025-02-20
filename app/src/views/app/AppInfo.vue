<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api, { objectToParams } from '@/api'
import { type APIError } from '@/api/errors'
import ConfigPanelsComponent from '@/components/ConfigPanels.vue'
import { formatConfigPanels, useConfigPanels } from '@/composables/configPanels'
import { useAutoModal } from '@/composables/useAutoModal'
import { isEmptyValue, joinOrNull, pick, toEntries } from '@/helpers/commons'
import { humanPermissionName } from '@/helpers/filters/human'
import { formatI18nField } from '@/helpers/yunohostArguments'
import type { Obj } from '@/types/commons'
import type { AppInfo } from '@/types/core/api'
import type { Permission } from '@/types/core/data'
import type { CoreConfigPanels } from '@/types/core/options'
import AppIntegrationAndLinks from './_AppIntegrationAndLinks.vue'
import {
  formatAppIntegration,
  formatAppLinks,
  formatAppNotifs,
} from './appData'

const props = defineProps<{
  id: string
  coreTabId?: string
  tabId?: string
}>()

const { t } = useI18n()
const router = useRouter()
const modalConfirm = useAutoModal()

const [app, form, coreConfigData, appConfigData, configPanelErr] = await api
  .fetchAll<[AppInfo, CoreConfigPanels, Obj<Permission>]>([
    { uri: `apps/${props.id}?full` },
    { uri: `apps/${props.id}/config?full&core` },
    // FIXME permissions needed?
    { uri: 'users/permissions?full', cachePath: 'permissions' },
    { uri: 'domains', cachePath: 'domains' },
  ])
  .then(async ([app_, coreConfigData]) => {
    // Query config panels if app supports it
    let appConfigData: CoreConfigPanels | undefined
    let appConfigPanelErr: string | undefined
    if (app_.supports_config_panel) {
      await api
        .get<CoreConfigPanels>(`apps/${props.id}/config?full`)
        .then((data) => (appConfigData = data))
        .catch((err: APIError) => (appConfigPanelErr = err.message))
    }

    const { domain, path } = app_.settings
    const form = ref({
      labels: [] as { label: string; show_tile: boolean }[],
      url: domain && path ? { domain, path: path.slice(1) } : undefined,
    })
    const permissions = []
    for (const [name, perm] of toEntries(app_.permissions)) {
      const isMain = name.endsWith('.main')
      const permission = {
        ...perm,
        name,
        label: isMain ? perm.label : perm.sublabel,
        title: isMain ? t('permission_main') : humanPermissionName(name),
        tileAvailable: !!perm.url && !perm.url.startsWith('re:'),
      }
      permissions.push(permission)
      form.value.labels.push(pick(permission, ['label', 'show_tile']))
    }

    const { DESCRIPTION, ADMIN, ...doc } = app_.manifest.doc
    const notifs = app_.manifest.notifications
    // App may not have 'main' permission
    const { label, allowed } = app_.permissions[props.id + '.main'] || {
      label: app_.label || app_.id,
      allowed: [],
    }
    const app = {
      id: props.id,
      version: app_.version,
      label,
      domain,
      logo: app_.logo,
      url: domain && path ? `https://${domain}${path}` : null,
      alternativeTo: joinOrNull(app_.from_catalog.potential_alternative_to),
      description: formatI18nField(DESCRIPTION) || app_.description,
      integration: formatAppIntegration(
        app_.manifest.integration,
        app_.manifest.packaging_format,
      ),
      // TODO: could return `remote` key of manifest to pass only manifest and id?
      links: formatAppLinks({
        ...app_.manifest,
        // @ts-expect-error meh
        remote: app_.from_catalog.git ?? { url: null },
      }),
      doc: {
        notifications: {
          postInstall: notifs.POST_INSTALL?.main
            ? [['main', formatI18nField(notifs.POST_INSTALL.main)]]
            : [],
          postUpgrade: notifs.POST_UPGRADE
            ? Object.entries(notifs.POST_UPGRADE).map(([key, content]) => {
                return [key, formatI18nField(content)]
              })
            : [],
        },
        admin: [
          ['admin', formatI18nField(ADMIN)],
          ...Object.keys(doc)
            .sort()
            .map((key) => [
              key.charAt(0) + key.slice(1).toLowerCase(),
              formatI18nField(doc[key]),
            ]),
        ].filter((doc) => doc[1]),
      },
      supportsPurge: app_.supports_purge,
      preUpgradeMessage: formatAppNotifs(
        app_.manifest.notifications.PRE_UPGRADE,
      ),
    }

    return [
      app,
      form,
      coreConfigData,
      appConfigData,
      appConfigPanelErr,
    ] as const
  })

const coreConfig = useConfigPanels(
  formatConfigPanels(coreConfigData),
  () => props.coreTabId,
  async ({ panelId, data, action }, onError) => {
    let confirmed: boolean | null | undefined = true
    if (action?.includes('uninstall')) {
      // FIXME check if at some point bootstrap-vue allows to await for a defined modal to resolve
      showModalUninstall.value = true
      return
    } else if (action?.includes('force_upgrade')) {
      confirmed = await modalConfirm(t('confirm_app_force_upgrade'))
      if (!confirmed) return

      if (app.preUpgradeMessage) {
        const message =
          t('app.upgrade.notifs.pre.alert') + '\n\n' + app.preUpgradeMessage
        confirmed = await modalConfirm(
          message,
          {
            title: t('app.upgrade.notifs.pre.title', {
              name: app.label,
            }),
            okTitle: t('ok'),
          },
          { markdown: true },
        )
      }
    } else if (action?.includes('change_url')) {
      confirmed = await modalConfirm(t('confirm_app_change_url'))
    }
    if (!confirmed) return
    api
      .put({
        uri: action
          ? `apps/${props.id}/actions/${action}?core`
          : `apps/${props.id}/config/${panelId}?core`,
        data: isEmptyValue(data) ? {} : { args: objectToParams(data) },
      })
      .then(() => api.refetch())
      .catch(onError)
  },
  'coreTabId',
)

const appConfig = appConfigData
  ? useConfigPanels(
      formatConfigPanels(appConfigData),
      () => props.tabId,
      ({ panelId, data, action }, onError) => {
        api
          .put({
            uri: action
              ? `apps/${props.id}/actions/${action}`
              : `apps/${props.id}/config/${panelId}`,
            data: isEmptyValue(data) ? {} : { args: objectToParams(data) },
          })
          .then(() => api.refetch())
          .catch(onError)
      },
    )
  : undefined

const showModalUninstall = ref(false)
const purge = ref(false)

async function dismissNotification(name: string) {
  api
    .put({ uri: `apps/${props.id}/dismiss_notification/${name}` })
    // FIXME no need to refetch i guess, filter the reactive notifs?
    .then(() => api.refetch())
}

async function uninstall() {
  const data = purge.value === true ? { purge: 1 } : {}
  api
    .put({ uri: `apps/${props.id}/actions/_core.operations.uninstall`, data })
    .then(() => router.push({ name: 'app-list' }))
}
</script>

<template>
  <div>
    <YAlert
      v-if="app.doc.notifications.postInstall.length"
      variant="info"
      class="my-4"
    >
      <div class="d-md-flex align-items-center mb-3">
        <h2 v-t="'app.doc.notifications.post_install'" class="md-m-0" />
        <BButton
          variant="primary"
          size="sm"
          class="ms-auto me-2"
          @click="dismissNotification('post_install')"
        >
          <YIcon iname="check" />
          {{ $t('app.doc.notifications.understood') }}
        </BButton>
      </div>

      <VueShowdown
        v-for="[name, notif] in app.doc.notifications.postInstall"
        :key="name"
        :markdown="notif"
        :options="{ headerLevelStart: 4 }"
      />
    </YAlert>

    <YAlert
      v-if="app.doc.notifications.postUpgrade.length"
      variant="info"
      class="my-4"
    >
      <div class="d-md-flex align-items-center mb-3">
        <h2 v-t="'app.doc.notifications.post_upgrade'" class="md-m-0" />
        <BButton
          variant="primary"
          size="sm"
          class="ms-auto me-2"
          @click="dismissNotification('post_upgrade')"
        >
          <YIcon iname="check" />
          {{ $t('app.doc.notifications.understood') }}
        </BButton>
      </div>

      <VueShowdown
        v-for="[name, notif] in app.doc.notifications.postUpgrade"
        :key="name"
        :markdown="notif"
        :options="{ headerLevelStart: 4 }"
      />
    </YAlert>

    <section class="border rounded p-3 mb-4">
      <div class="d-md-flex align-items-center mb-4">
        <h1 class="mb-3 mb-md-0">
          <template v-if="app.logo">
            <img
              :src="`https://10.118.36.150/yunohost/admin/applogos/${app.logo}.png`"
            />
          </template>
          <template v-else>
            <YIcon iname="cube" />
          </template>
          {{ app.label }}

          <span class="text-secondary tiny">
            {{ app.id }}
          </span>
        </h1>

        <BButton
          v-if="app.url"
          :href="app.url"
          target="_blank"
          variant="success"
          class="ms-auto me-2"
        >
          <YIcon iname="external-link" />
          {{ $t('app.open_this_app') }}
        </BButton>
      </div>

      <p class="text-secondary">
        <strong v-t="'app.installed_version'" /> {{ app.version }}<br />

        <template v-if="app.alternativeTo">
          <strong v-t="'app.potential_alternative_to'" />
          {{ app.alternativeTo }}
        </template>
      </p>

      <p>
        <YIcon iname="comments" /> {{ $t('app.info.problem') }}
        <a :href="`https://forum.yunohost.org/tag/${id}`" target="_blank">
          {{ $t('app.info.forum') }}
        </a>
      </p>

      <VueShowdown :markdown="app.description" />
    </section>

    <YAlert v-if="configPanelErr" class="mb-4" variant="danger" icon="bug">
      <p>{{ $t('app.info.config_panel_error') }}</p>
      <p>{{ configPanelErr }}</p>
      <p>{{ $t('app.info.config_panel_error_please_report') }}</p>
    </YAlert>

    <ConfigPanelsComponent
      v-model="coreConfig.form.value"
      :panel="coreConfig.panel.value"
      :validations="coreConfig.v.value"
      :routes="coreConfig.routes"
      @apply="coreConfig.onPanelApply"
    />

    <!-- BASIC INFOS -->
    <ConfigPanelsComponent
      v-if="appConfig"
      v-model="appConfig.form.value"
      :panel="appConfig.panel.value"
      :validations="appConfig.v.value"
      :routes="appConfig.routes"
      @apply="appConfig.onPanelApply"
    />

    <BCard v-if="app.doc.admin.length" no-body>
      <BTabs card fill pills>
        <BTab v-for="[name, content] in app.doc.admin" :key="name">
          <template #title>
            <YIcon iname="book" class="me-2" />
            {{ name === 'admin' ? $t('app.doc.admin.title') : name }}
          </template>
          <VueShowdown :markdown="content" />
        </BTab>
      </BTabs>
    </BCard>

    <AppIntegrationAndLinks :integration="app.integration" :links="app.links" />

    <BModal
      id="uninstall-modal"
      v-model="showModalUninstall"
      centered
      :title="$t('confirm_uninstall', { name: id })"
      header-variant="warning"
      :body-class="{ 'd-none': !app.supportsPurge }"
      @ok="uninstall"
    >
      <BFormGroup v-if="app.supportsPurge">
        <BFormCheckbox v-model="purge">
          {{ $t('app.uninstall.purge_desc', { name: id }) }}
        </BFormCheckbox>
      </BFormGroup>
    </BModal>
  </div>
</template>

<style lang="scss" scoped>
h1 img {
  width: 2.5rem;
}

select {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group input {
  min-width: 5rem;
}

.tiny {
  font-size: 50%;
  font-weight: normal;
}

.yuno-alert div div:not(:last-child) {
  margin-bottom: 1rem;
}

// FIXME bootstrap-vue-next bug
:deep(.card-header-tabs) {
  margin-bottom: unset;
}
</style>
