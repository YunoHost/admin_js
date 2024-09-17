import i18n from '@/i18n'
import type { Obj } from '@/types/commons'

/**
 * Allow to set a timeout on a `Promise` expected response.
 * The returned Promise will be rejected if the original Promise is not resolved or
 * rejected before the delay.
 *
 * @param promise - A promise (like a fetch call).
 * @param delay - delay after which the promise is rejected
 */
export function timeout<T>(promise: Promise<T>, delay: number): Promise<T> {
  return new Promise((resolve, reject) => {
    // FIXME reject(new Error('api_not_responding')) for post-install
    setTimeout(() => reject, delay)
    promise.then(resolve, reject)
  })
}

/**
 * Check if passed value is an object literal.
 *
 * @param value - Anything.
 */
export function isObjectLiteral(value: any): value is Obj {
  return (
    value !== null &&
    value !== undefined &&
    Object.is(value.constructor, Object)
  )
}

export function objectGet<
  T extends Obj,
  K extends keyof T | string,
  F = undefined,
>(obj: T, key: K, fallback?: F) {
  return (key in obj ? obj[key] : fallback) as K extends keyof T ? T[K] : F
}

/**
 * Check if value is "empty" (`null`, `undefined`, `''`, `[]`, '{}').
 * Note: `0` is not considered "empty" in that helper.
 *
 * @param value - Anything.
 */
export function isEmptyValue(
  value: any
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
): value is null | undefined | '' | [] | {} {
  if (typeof value === 'number' || typeof value === 'boolean') return false
  return (
    !value ||
    (Array.isArray(value) && value.length === 0) ||
    Object.keys(value).length === 0
  )
}

/**
 * Returns an new Object filtered with passed filter function.
 * Each entry `[key, value]` will be forwarded to the `filter` function.
 *
 * @param obj - object to filter.
 * @param filter - the filter function to call for each entry.
 */
export function filterObject<T extends Obj>(
  obj: T,
  filter: (
    entries: [string, any],
    index: number,
    array: [string, any][]
  ) => boolean
) {
  return Object.fromEntries(
    Object.entries(obj).filter((...args) => filter(...args))
  )
}

/**
 * Returns an new array containing items that are in first array but not in the other.
 */
export function arrayDiff<T extends string>(
  arr1: T[] = [],
  arr2: T[] = []
): T[] {
  return arr1.filter((item) => !arr2.includes(item))
}

export function joinOrNull(
  value: any[] | string | null | undefined
): string | null {
  if (Array.isArray(value) && value.length) {
    return value.join(i18n.global.t('words.separator'))
  }
  return typeof value === 'string' ? value : null
}

/**
 * Returns a new string with escaped HTML (`&<>"'` replaced by entities).
 *
 * @param unsafe - string to escape
 */
export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Returns a random integer between `min` and `max`.
 *
 * @param min - min possible value
 * @param max - max possible value
 */
export function randint(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Returns a File content.
 *
 * @param file -
 * @param base64 - returns a base64 representation of the file.
 */
export function getFileContent(
  file: File,
  { base64 = false } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => resolve(reader.result as string)

    if (base64) {
      reader.readAsDataURL(file)
    } else {
      reader.readAsText(file)
    }
  })
}

export function getKeys<T extends Obj, K extends (keyof T)[]>(obj: T): K {
  return Object.keys(obj) as K
}

export function toEntries<T extends Record<PropertyKey, unknown>>(
  obj: T
): { [K in keyof T]: [K, T[K]] }[keyof T][] {
  return Object.entries(obj) as { [K in keyof T]: [K, T[K]] }[keyof T][]
}

export function fromEntries<
  const T extends ReadonlyArray<readonly [PropertyKey, unknown]>,
>(entries: T): { [K in T[number] as K[0]]: K[1] } {
  return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] }
}

export function pick<T extends Obj, K extends (keyof T)[]>(
  obj: T,
  keys: K
): Pick<T, K[number]> {
  return Object.fromEntries(keys.map((key) => [key, obj[key]])) as Pick<
    T,
    K[number]
  >
}

export function omit<T extends Obj, K extends (keyof T)[]>(
  obj: T,
  keys: K
): Omit<T, K[number]> {
  return Object.fromEntries(
    Object.keys(obj)
      .filter((key) => !keys.includes(key))
      .map((key) => [key, obj[key]])
  ) as Omit<T, K[number]>
}

const humanSizeUnits = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

export function humanSize(size: number) {
  function format(num: number|bigint, unit:string): string {
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit}B`
  }

  if (size < 1024) {
    return format(size, "")
  }

  const bigSize = BigInt(size)


  let lowerBound = 0n

  for (let i = 0; i < humanSizeUnits.length; i++) {
    lowerBound = 1n << (BigInt(i) + 1n) * 10n
    const upperBound = 1n << (BigInt(i + 1) + 1n) * 10n

    if(bigSize < upperBound) {
      return format(bigSize / lowerBound, humanSizeUnits[i])
    }
  }

  return format(bigSize / lowerBound, humanSizeUnits[humanSizeUnits.length - 1])
}
