import type { Obj, StateVariant, Translation } from '@/types/commons'
import type { AppPermInfos } from '@/types/core/data'
import type { AnyOption } from '@/types/core/options'

// APPS

export type AppLevel = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type AppState = 'working' | 'inprogress' | 'thirdparty'
export type AppUpstream = {
  license?: string | null
  website?: string | null
  demo?: string | null
  admindoc?: string | null
  userdoc?: string | null
  code?: string | null
  cpe?: string | null
}
export type AppMinManifest = {
  packaging_format: 1 | 2
  id: string
  name: string
  description: Translation
  version: string
  maintainers: string[]
  integration: {
    architectures: string | string[]
    ldap: 'not_relevant' | boolean
    sso: 'not_relevant' | boolean
    multi_instance: boolean
    disk: string
    ram: { build: string; runtime: string }
    yunohost: string
  }
  antifeatures?: Obj<Translation>
  upstream: AppUpstream
}

export type AppManifest = AppMinManifest & {
  upstream: AppUpstream
  install: AnyOption[]
  doc: {
    DESCRIPTION?: Translation
    ADMIN?: Translation
  } & Obj<Translation>
  notifications: {
    PRE_INSTALL: Obj<Translation> | null
    POST_INSTALL: Obj<Translation> | null
    PRE_UPGRADE: Obj<Translation> | null
    POST_UPGRADE: Obj<Translation> | null
  }
  requirements: Record<
    'required_yunohost_version' | 'arch' | 'install' | 'disk' | 'ram',
    {
      pass: boolean
      values: { current: string; required: string }
    }
  >
  resources: Obj
  remote: { type: string; url: string; branch: string; revision: string }
  lastUpdate: number
  quality: { level: AppLevel; state: AppState }
  antifeatures: string[]
  potential_alternative_to: string[]
  screenshot: string | null
}

type CatalogApp = {
  added_in_catalog: number
  antifeatures: string[]
  category: string
  featured: boolean
  git: {
    branch: string
    revision: string
    url: string | null
  } | null
  high_quality: boolean
  id: string
  lastUpdate: number
  level: AppLevel
  logo_hash: string | null
  maintained: boolean
  manifest: AppMinManifest
  potential_alternative_to: string[]
  state: AppState
  subtags: string[]
  repository: string
  installed: boolean
}

export type Catalog = {
  apps: Obj<CatalogApp>
  categories: {
    description: string
    icon: string
    id: string
    subtags: { id: string; title: string }[]
    title: string
  }[]
  antifeatures: {
    description: string
    icon: string
    id: string
    title: string
  }[]
}

export type AppInfo = {
  id: string
  description: string
  label: string
  name: string
  version: string
  domain_path: string
  logo: string | null
  screenshot?: string
  upgradable: string
  settings: { domain?: string; path?: string } & Obj
  setting_path: string
  permissions: Obj<AppPermInfos & { sublabel: string }>
  manifest: AppMinManifest & {
    install: Obj<AnyOption>
    upstream: {
      license: string | null
      website: string | null
      demo: string | null
      admindoc: string | null
      userdoc: string | null
      code: string | null
    }
    resources: Obj
    doc: {
      DESCRIPTION?: Translation
      ADMIN?: Translation
    } & Obj<Translation>
    notifications: {
      PRE_INSTALL: Obj<Translation> | null
      POST_INSTALL: Obj<Translation> | null
      PRE_UPGRADE: Obj<Translation> | null
      POST_UPGRADE: Obj<Translation> | null
    }
  }
  from_catalog: CatalogApp
  is_webapp: boolean
  is_default: boolean
  supports_change_url: boolean
  supports_backup_restore: boolean
  supports_multi_instance: boolean
  supports_config_panel: boolean
  supports_purge: boolean
}

export type AppList = { apps: AppInfo[] }

// BACKUP

export type BackupHookDataKeys =
  | 'data_xmpp'
  | 'data_multimedia'
  | 'data_mail'
  | 'data_home'
export type BackupHookKeys =
  | BackupHookDataKeys
  | 'conf_ynh_settings'
  | 'conf_ldap'
  | 'conf_manually_modified_files'
  | 'conf_ynh_certs'

export type BackupHooksList = {
  hooks: BackupHookKeys[]
}

export type BackupAppList = {
  apps: Pick<
    AppInfo,
    'description' | 'name' | 'version' | 'domain_path' | 'id'
  >[]
}

export type BackupInfo = {
  path: string
  created_at: string
  description: string
  size: number
  // TODO as array like everywhere else?
  apps: Obj<
    Pick<AppInfo, 'description' | 'name' | 'version'> & { size: number }
  >
  system: Record<BackupHookKeys, { paths: string[]; size: number }>
  from_yunohost_version: string
}

export type BackupList = {
  archives: Obj<{
    path: string
    created_at: string
    description: string
    size: number
  }>
}

// SERVICES

export type ServiceInfo = {
  status: 'running' | 'stopped' | 'failed' | 'unknown'
  start_on_boot: 'enabled' | 'disabled' | 'unknown'
  last_state_change: string | 'unknown'
  description: string
  configuration: 'valid' | 'broken' | 'unknown'
}
export type ServiceLogs = Obj<string[]>
export type ServiceList = Obj<ServiceInfo>

// DIAGNOSIS

export type Diagnosis = {
  reports: {
    id: string
    cached_for: number
    items: {
      meta: Obj
      status: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
      data: Obj
      summary: string
      details?: string[]
      ignored: boolean
    }[]
    timestamp: number
    description: string
  }[]
}

// FIREWALL

type PortInfo = { open: boolean; upnp: boolean; comment: string }
export type Firewall = {
  router_forwarding_upnp: boolean
  tcp: Record<number, PortInfo>
  udp: Record<number, PortInfo>
}

// LOGS

export type LogList = {
  operation: {
    name: string
    path: string
    description: string
    started_at: string
    success: boolean | '?'
    parent: string | null
  }[]
}

export type LogInfo = {
  description: string
  name: string
  metadata_path: string
  metadata: {
    ended_at: string | null
    env: Obj
    error: string | null
    interface: 'cli' | 'api'
    operation: string
    parent: string | null
    related_to: string[][]
    started_at: string
    success: boolean | '?'
    yunohost_version: string
    suboperations: {
      name: string
      description: string
      success: boolean | '?'
    }[]
  }
  log_path: string
  logs: string[]
}

// MIGRATIONS

type MigrationInfo = {
  id: string
  number: number
  name: string
  mode: 'auto' | 'manual'
  state: 'pending' | 'done' | 'skipped'
  description: string
  disclaimer: string | null
}

export type MigrationList = {
  migrations: MigrationInfo[]
}

export type SystemUpdate = {
  system: {
    name: string
    new_version: string
    current_version: string
  }[]
  apps: {
    name: string
    id: string
    new_version: string
    current_version: string
    notifications: {
      PRE_UPGRADE: Obj<string> | null
      POST_UPGRADE: Obj<string> | null
    }
  }[]
  important_yunohost_upgrade: boolean
  pending_migrations: MigrationInfo[]
}

// DOMAINS

export type DNSRecord = {
  type: string
  name: string
  ttl: number
  content: string
  old_content?: string
  id?: number
  managed_by_yunohost?: boolean
  spaces: string // Added when formating
}
export type DNSCategories = Record<
  'create' | 'update' | 'delete' | 'unchanged',
  DNSRecord[]
>

export type Certificate = {
  subject: string
  CA_name: string
  CA_type: 'selfsigned' | 'letsencrypt' | 'other'
  validity: number
  style: Exclude<StateVariant, 'info'>
  summary: string // enum
  ACME_eligible: boolean
  has_wildcards: boolean
}
