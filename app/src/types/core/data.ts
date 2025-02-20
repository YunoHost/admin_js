import type { Certificate } from '@/types/core/api'

export type UserItem = {
  username: string
  fullname: string
  mail: string
  'mailbox-quota': string
  groups: string[]
}
export type UserDetails = {
  username: string
  fullname: string
  mail: string
  'mail-aliases': string[]
  'mail-forward': string[]
  'mailbox-quota': { limit: string; use: string }
}
export type SystemPermInfos = {
  label: string
  allowed: string[]
  corresponding_users: string[]
  protected: boolean
}
export type AppPermInfos = SystemPermInfos & {
  url: string | null
  additional_urls: string[]
  auth_header: boolean
  show_tile: boolean
  hide_from_public?: boolean
  logo_hash?: string
  description?: string
  order?: number
}
export type Permission = SystemPermInfos | AppPermInfos
export type Group = {
  members: string[]
  permissions: string[]
}
export type DomainDetail = {
  certificate: Certificate
  registrar: string // or null ?
  apps: { name: string; id: string; path: string }[]
  main: boolean
  topest_parent: string | null
}
