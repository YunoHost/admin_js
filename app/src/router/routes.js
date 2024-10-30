/**
 * routes module.
 * @module router/routes
 */

// Simple views are normally imported and will be included into the main webpack entry.
// Others will be chunked by webpack so they can be lazy loaded.
// Webpack chunk syntax is:
// `() => import('@/views/:ViewComponent.vue')`

import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ToolList from '@/views/tool/ToolList.vue'

const routes = [
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
    },
  },
  {
    name: 'user-create',
    path: '/users/create',
    component: () => import('@/views/user/UserCreate.vue'),
    meta: {
      args: { trad: 'users_new' },
      breadcrumb: ['user-list', 'user-create'],
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
    },
  },
  {
    name: 'group-create',
    path: '/groups/create',
    component: () => import('@/views/group/GroupCreate.vue'),
    meta: {
      args: { trad: 'group_new' },
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
    },
  },
  {
    name: 'domain-add',
    path: '/domains/add',
    component: () => import('@/views/domain/DomainAdd.vue'),
    meta: {
      args: { trad: 'domain_add' },
      breadcrumb: ['domain-list', 'domain-add'],
    },
  },
  {
    path: '/domains/:name',
    component: () => import('@/views/domain/DomainInfo.vue'),
    props: true,
    children: [
      {
        name: 'domain-info',
        path: ':tabId?',
        component: () => import('@/components/ConfigPanel.vue'),
        props: true,
        meta: {
          routerParams: ['name'], // Override router key params to avoid view recreation at tab change.
          args: { param: 'name' },
          breadcrumb: ['domain-list', 'domain-info'],
        },
      },
    ],
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
    },
  },
  {
    path: '/apps/:id',
    component: () => import('@/views/app/AppInfo.vue'),
    props: true,
    children: [
      {
        name: 'app-info',
        path: ':tabId?',
        component: () => import('@/components/ConfigPanel.vue'),
        props: true,
        meta: {
          routerParams: ['id'], // Override router key params to avoid view recreation at tab change.
          args: { param: 'id' },
          breadcrumb: ['app-list', 'app-info'],
        },
      },
    ],
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
    },
  },
  {
    name: 'tool-log',
    path: '/tools/logs/:name',
    component: () => import('@/views/tool/ToolLog.vue'),
    props: true,
    meta: {
      args: { param: 'name' },
      breadcrumb: ['tool-list', 'tool-logs', 'tool-log'],
    },
  },
  {
    name: 'tool-migrations',
    path: '/tools/migrations',
    component: () => import('@/views/tool/ToolMigrations.vue'),
    meta: {
      args: { trad: 'migrations' },
      breadcrumb: ['tool-list', 'tool-migrations'],
    },
  },
  {
    name: 'tool-firewall',
    path: '/tools/firewall',
    component: () => import('@/views/tool/ToolFirewall.vue'),
    meta: {
      args: { trad: 'firewall' },
      breadcrumb: ['tool-list', 'tool-firewall'],
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
    path: '/tools/settings',
    component: () => import('@/views/tool/ToolSettings.vue'),
    children: [
      {
        name: 'tool-settings',
        path: ':tabId?',
        component: () => import('@/components/ConfigPanel.vue'),
        props: true,
        meta: {
          routerParams: [],
          args: { trad: 'tools_yunohost_settings' },
          breadcrumb: ['tool-list', 'tool-settings'],
        },
      },
    ],
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
   │   STORAGE   │
   ╰──────────── */
  {
    name: 'storage',
    path: '/storage',
    component: () => import('@/views/storage/StorageList.vue'),
    meta: {
      args: { trad: 'storage' },
      breadcrumb: ['storage'],
    },
  },
  {
    name: 'storage-disks',
    path: '/storage/disks',
    component: () => import('@/views/storage/Disks.vue'),
    meta: {
      args: { trad: 'storage_disks.category_name' },
      breadcrumb: ['storage', 'storage-disks'],
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
    },
  },
]

export default routes
