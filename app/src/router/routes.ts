// Simple views are normally imported and will be included into the main webpack entry.
// Others will be chunked so they can be lazy loaded:
// `() => import('@/views/:ViewComponent.vue')`

import type { RouteRecordRaw } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ToolList from '@/views/tool/ToolList.vue'

const routes: RouteRecordRaw[] = [
  {
    name: 'home',
    path: '/',
    component: HomeView,
    meta: {
      args: { trad: 'home' },
    },
  },

  {
    name: 'login',
    path: '/login',
    component: LoginView,
    meta: {
      noAuth: true,
      args: { trad: 'login' },
    },
  },

  /* ───────────────╮
   │  POST INSTALL  │
   ╰─────────────── */
  {
    name: 'post-install',
    path: '/postinstall',
    component: () => import('@/views/PostInstall.vue'),
    meta: {
      noAuth: true,
      args: { trad: 'postinstall.title' },
    },
  },

  /* ───────╮
   │  USER  │
   ╰─────── */
  {
    name: 'user-list',
    path: '/users',
    component: () => import('@/views/user/UserList.vue'),
    meta: {
      args: { trad: 'users' },
      breadcrumb: ['user-list'],
      skeleton: 'ListGroupSkeleton',
    },
  },
  {
    name: 'user-create',
    path: '/users/create',
    component: () => import('@/views/user/UserCreate.vue'),
    meta: {
      args: { trad: 'users_add' },
      breadcrumb: ['user-list', 'user-create'],
      skeleton: 'CardFormSkeleton',
    },
  },
  {
    name: 'user-import',
    path: '/users/import',
    component: () => import('@/views/user/UserImport.vue'),
    props: true,
    meta: {
      args: { trad: 'users_import' },
      breadcrumb: ['user-list', 'user-import'],
    },
  },
  {
    name: 'user-info',
    path: '/users/:name',
    component: () => import('@/views/user/UserInfo.vue'),
    props: true,
    meta: {
      args: { param: 'name' },
      breadcrumb: ['user-list', 'user-info'],
      skeleton: 'CardInfoSkeleton',
    },
  },
  {
    name: 'user-edit',
    path: '/users/:name/edit',
    component: () => import('@/views/user/UserEdit.vue'),
    props: true,
    meta: {
      args: { param: 'name', trad: 'user_username_edit' },
      breadcrumb: ['user-list', 'user-info', 'user-edit'],
      skeleton: 'CardFormSkeleton',
    },
  },

  /* ────────╮
   │  GROUP  │
   ╰──────── */
  {
    name: 'group-list',
    path: '/groups',
    component: () => import('@/views/group/GroupList.vue'),
    meta: {
      args: { trad: 'groups_and_permissions' },
      breadcrumb: ['user-list', 'group-list'],
      skeleton: 'CardFormSkeleton',
    },
  },
  {
    name: 'group-create',
    path: '/groups/create',
    component: () => import('@/views/group/GroupCreate.vue'),
    meta: {
      args: { trad: 'group_add' },
      breadcrumb: ['user-list', 'group-list', 'group-create'],
    },
  },

  /* ─────────╮
   │  DOMAIN  │
   ╰───────── */
  {
    name: 'domain-list',
    path: '/domains',
    component: () => import('@/views/domain/DomainList.vue'),
    meta: {
      args: { trad: 'domains' },
      breadcrumb: ['domain-list'],
      skeleton: 'ListGroupSkeleton',
    },
  },
  {
    name: 'domain-add',
    path: '/domains/add',
    component: () => import('@/views/domain/DomainAdd.vue'),
    meta: {
      args: { trad: 'domain_add' },
      breadcrumb: ['domain-list', 'domain-add'],
      skeleton: 'CardFormSkeleton',
    },
  },
  {
    name: 'domain-info',
    path: '/domains/:name/:tabId?',
    component: () => import('@/views/domain/DomainInfo.vue'),
    props: true,
    meta: {
      routerParams: ['name'], // Override router key params to avoid view recreation at tab change.
      args: { param: 'name' },
      breadcrumb: ['domain-list', 'domain-info'],
      skeleton: 'CardListSkeleton',
    },
  },

  /* ───────╮
   │  APPS  │
   ╰─────── */
  {
    name: 'app-list',
    path: '/apps',
    component: () => import('@/views/app/AppList.vue'),
    meta: {
      args: { trad: 'applications' },
      breadcrumb: ['app-list'],
      skeleton: 'ListGroupSkeleton',
    },
  },
  {
    name: 'app-catalog',
    path: '/apps/catalog',
    component: () => import('@/views/app/AppCatalog.vue'),
    props: (route) => route.query,
    meta: {
      args: { trad: 'catalog' },
      breadcrumb: ['app-list', 'app-catalog'],
      skeleton: 'AppCatalogSkeleton',
    },
  },
  {
    name: 'app-install',
    path: '/apps/install/:id',
    component: () => import('@/views/app/AppInstall.vue'),
    props: true,
    meta: {
      args: { trad: 'install_name', param: 'id' },
      breadcrumb: ['app-list', 'app-catalog', 'app-install'],
      skeleton: ['CardInfoSkeleton', { is: 'CardFormSkeleton', cols: null }],
    },
  },
  {
    name: 'app-install-custom',
    path: '/apps/install-custom/:id',
    component: () => import('@/views/app/AppInstall.vue'),
    props: true,
    meta: {
      args: { trad: 'install_name', param: 'id' },
      breadcrumb: ['app-list', 'app-catalog', 'app-install-custom'],
      skeleton: ['CardInfoSkeleton', { is: 'CardFormSkeleton', cols: null }],
    },
  },
  {
    name: 'app-info',
    path: '/apps/:id/:coreTabId?/:tabId?',
    component: () => import('@/views/app/AppInfo.vue'),
    props: true,
    meta: {
      routerParams: ['id'], // Override router key params to avoid view recreation at tab change.
      args: { param: 'id' },
      breadcrumb: ['app-list', 'app-info'],
      skeleton: [{ is: 'CardInfoSkeleton', itemCount: 8 }, 'CardFormSkeleton'],
    },
  },

  /* ────────────────╮
   │  SYSTEM UPDATE  │
   ╰──────────────── */
  {
    name: 'update',
    path: '/update',
    component: () => import('@/views/update/SystemUpdate.vue'),
    meta: {
      args: { trad: 'system_update' },
      breadcrumb: ['update'],
      skeleton: 'CardListSkeleton',
    },
  },

  /* ──────────╮
   │  SERVICE  │
   ╰────────── */
  {
    name: 'service-list',
    path: '/services',
    component: () => import('@/views/service/ServiceList.vue'),
    meta: {
      args: { trad: 'services' },
      breadcrumb: ['tool-list', 'service-list'],
      skeleton: { is: 'ListGroupSkeleton', button: false },
    },
  },
  {
    name: 'service-info',
    path: '/services/:name',
    component: () => import('@/views/service/ServiceInfo.vue'),
    props: true,
    meta: {
      args: { param: 'name' },
      breadcrumb: ['tool-list', 'service-list', 'service-info'],
      skeleton: ['CardInfoSkeleton', 'CardInfoSkeleton'],
    },
  },

  /* ────────╮
   │  TOOLS  │
   ╰──────── */
  {
    name: 'tool-list',
    path: '/tools',
    component: ToolList,
    meta: {
      args: { trad: 'tools' },
      breadcrumb: ['tool-list'],
    },
  },
  {
    name: 'tool-logs',
    path: '/tools/logs',
    component: () => import('@/views/tool/ToolLogs.vue'),
    meta: {
      args: { trad: 'logs' },
      breadcrumb: ['tool-list', 'tool-logs'],
      skeleton: { is: 'CardListSkeleton', search: true },
    },
  },
  {
    name: 'tool-log',
    path: '/tools/logs/:name/:n?',
    component: () => import('@/views/tool/ToolLog.vue'),
    props: true,
    meta: {
      args: { param: 'name' },
      breadcrumb: ['tool-list', 'tool-logs', 'tool-log'],
      skeleton: ['CardInfoSkeleton', 'CardInfoSkeleton'],
    },
  },
  {
    name: 'tool-migrations',
    path: '/tools/migrations',
    component: () => import('@/views/tool/ToolMigrations.vue'),
    meta: {
      args: { trad: 'migrations' },
      breadcrumb: ['tool-list', 'tool-migrations'],
      skeleton: [
        { is: 'CardListSkeleton', itemCount: 3 },
        { is: 'CardListSkeleton', itemCount: 3 },
      ],
    },
  },
  {
    name: 'tool-firewall',
    path: '/tools/firewall',
    component: () => import('@/views/tool/ToolFirewall.vue'),
    meta: {
      args: { trad: 'firewall' },
      breadcrumb: ['tool-list', 'tool-firewall'],
      skeleton: 'CardFormSkeleton',
    },
  },
  {
    name: 'tool-webadmin',
    path: '/tools/webadmin',
    component: () => import('@/views/tool/ToolWebadmin.vue'),
    meta: {
      args: { trad: 'tools_webadmin_settings' },
      breadcrumb: ['tool-list', 'tool-webadmin'],
    },
  },
  {
    name: 'tool-settings',
    path: '/tools/settings/:tabId?',
    component: () => import('@/views/tool/ToolSettings.vue'),
    props: true,
    meta: {
      routerParams: [],
      args: { trad: 'tools_yunohost_settings' },
      breadcrumb: ['tool-list', 'tool-settings'],
      skeleton: 'CardFormSkeleton',
    },
  },
  {
    name: 'tool-power',
    path: '/tools/power',
    component: () => import('@/views/tool/ToolPower.vue'),
    meta: {
      args: { trad: 'tools_shutdown_reboot' },
      breadcrumb: ['tool-list', 'tool-power'],
    },
  },

  /* ────────────╮
   │  DIAGNOSIS  │
   ╰──────────── */
  {
    name: 'diagnosis',
    path: '/diagnosis',
    component: () => import('@/views/diagnosis/DiagnosisView.vue'),
    meta: {
      args: { trad: 'diagnosis' },
      breadcrumb: ['diagnosis'],
      skeleton: ['CardListSkeleton', 'CardListSkeleton', 'CardListSkeleton'],
    },
  },

  /* ─────────╮
   │  BACKUP  │
   ╰───────── */
  {
    name: 'backup',
    path: '/backup',
    component: () => import('@/views/backup/BackupView.vue'),
    meta: {
      args: { trad: 'backup' },
      breadcrumb: ['backup'],
    },
  },
  {
    name: 'backup-list',
    path: '/backup/:id',
    component: () => import('@/views/backup/BackupList.vue'),
    props: true,
    meta: {
      args: { param: 'id' },
      breadcrumb: ['backup', 'backup-list'],
      skeleton: 'ListGroupSkeleton',
    },
  },
  {
    name: 'backup-info',
    path: '/backup/:id/info/:name',
    component: () => import('@/views/backup/BackupInfo.vue'),
    props: true,
    meta: {
      args: { param: 'name' },
      breadcrumb: ['backup', 'backup-list', 'backup-info'],
      skeleton: [{ is: 'CardInfoSkeleton', itemCount: 4 }, 'CardListSkeleton'],
    },
  },
  {
    name: 'backup-create',
    path: '/backup/:id/create',
    component: () => import('@/views/backup/BackupCreate.vue'),
    props: true,
    meta: {
      args: { trad: 'backup_create' },
      breadcrumb: ['backup', 'backup-list', 'backup-create'],
      skeleton: 'CardListSkeleton',
    },
  },
]

export default routes
