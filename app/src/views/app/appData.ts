import { getKeys, joinOrNull } from '@/helpers/commons'
import { formatI18nField } from '@/helpers/yunohostArguments'
import type { Obj, Translation } from '@/types/commons'
import type { AppLevel, AppManifest, AppState } from '@/types/core/api'

export function formatAppNotifs(notifs: Obj<Translation> | null): string {
  if (!notifs) return ''
  return getKeys(notifs).reduce((acc, key) => {
    return acc + '\n\n' + formatI18nField(notifs[key])
  }, '')
}

export function formatAppQuality(app: { state: AppState; level: AppLevel }) {
  const variants = {
    working: 'success',
    lowquality: 'warning',
    inprogress: 'danger',
    broken: 'danger',
    thirdparty: 'danger',
  } as const
  const working = app.state === 'working'
  const state: keyof typeof variants =
    working && app.level <= 0
      ? 'broken'
      : working && app.level <= 4
        ? 'lowquality'
        : app.state
  return { state, variant: variants[state] }
}

export function formatAppIntegration(
  {
    architectures,
    ldap,
    sso,
    multi_instance,
    ram,
    disk,
  }: AppManifest['integration'],
  packagingFormat: number,
) {
  if (packagingFormat < 2) return undefined // LEGACY
  return {
    archs: joinOrNull(architectures),
    ldap: ldap === 'not_relevant' ? null : ldap,
    sso: sso === 'not_relevant' ? null : sso,
    multiInstance: multi_instance,
    resources: { ram: ram.runtime, disk },
  }
}

export function formatAppLinks({ upstream, id, remote }: AppManifest) {
  const url = remote.url
  return {
    license: ['institution', `https://spdx.org/licenses/${upstream.license}`],
    website: ['globe', upstream.website],
    admindoc: ['book', upstream.admindoc],
    userdoc: ['book', upstream.userdoc],
    code: ['code', upstream.code],
    package: ['code', url],
    package_license: ['institution', url ? `${url}/blob/master/LICENSE` : null],
    forum: ['comments', `https://forum.yunohost.org/tag/${id}`],
  } as const
}

export type AppIntegration = ReturnType<typeof formatAppIntegration>
export type AppLinks = ReturnType<typeof formatAppLinks>
