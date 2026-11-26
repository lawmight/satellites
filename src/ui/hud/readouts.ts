/**
 * Pure formatters for the corner readouts. Fixed-width where a value ticks, so right-aligned
 * readouts don't jitter: latitudes are zero-padded to 2 integer digits, longitudes to 3.
 *
 * Coordinates, clocks and stamps are international notation (the same in every language); the words around them
 * ("SUN", "OBJECTS", the age units) come from the 'hud' namespace, read at call time.
 */
import { hemisphere, LOCALE_INFO } from '../../../api/_lib/i18n/locales'
import enHud from '@/i18n/en/hud'
import { currentLocale, msgs } from '@/i18n/runtime'
import { gmst, RAD } from '@/lib/geo'

const pad = (n: number, w: number) => String(Math.trunc(n)).padStart(w, '0')

/** "06.2°S" — latitude with a fixed 2-digit integer part. */
export function fmtLatFixed(lat: number, digits = 1): string {
  const a = Math.abs(lat)
  const [i, f] = a.toFixed(digits).split('.')
  return `${i.padStart(2, '0')}${f ? '.' + f : ''}°${hemisphere(currentLocale(), 'lat', lat)}`
}

/** "118.2°E" / "008.0°W" — longitude normalised to ±180 with a fixed 3-digit integer part. */
export function fmtLonFixed(lon: number, digits = 1): string {
  let l = ((((lon + 180) % 360) + 360) % 360) - 180
  // toFixed can round 179.96 up to "180.0"; keep the hemisphere consistent with the printed value.
  if (Number(Math.abs(l).toFixed(digits)) >= 180) l = 180
  const [i, f] = Math.abs(l).toFixed(digits).split('.')
  const hemi = hemisphere(currentLocale(), 'lon', l === -180 ? 180 : l)
  return `${i.padStart(3, '0')}${f ? '.' + f : ''}°${hemi}`
}

/** "SUN 06.2°S 118.2°E" */
export function fmtSun(p: { lat: number; lon: number }, digits = 1): string {
  return msgs(enHud).sun(fmtLatFixed(p.lat, digits), fmtLonFixed(p.lon, digits))
}

/** Greenwich mean sidereal time as "HH:MM:SS" (sidereal hours). */
export function fmtGmst(ms: number): string {
  const hours = ((gmst(ms) * RAD) / 15 + 24) % 24
  const total = Math.floor(hours * 3600)
  return `${pad(total / 3600, 2)}:${pad((total % 3600) / 60, 2)}:${pad(total % 60, 2)}`
}

/** "2026-11-08 03:34Z" from an ISO string; "—" if unparseable. */
export function fmtStampZ(iso: string): string {
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return '—'
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1, 2)}-${pad(d.getUTCDate(), 2)} ${pad(d.getUTCHours(), 2)}:${pad(d.getUTCMinutes(), 2)}Z`
}

/** The unit of a catalog age: under a minute, minutes (1–89), hours (2–47), days (2 or more). */
export type AgeUnit = 'underMinute' | 'minute' | 'hour' | 'day'

/**
 * How old something is, as a unit and a count: under a minute, minutes up to 90, hours up to 48, then days. Never
 * negative. Raw values, so each language words them its own way (the 'hud' namespace's `catalogAge`).
 */
export function ageOf(fromMs: number, nowMs: number): { unit: AgeUnit; n: number } {
  const s = Math.max(0, (nowMs - fromMs) / 1000)
  if (s < 60) return { unit: 'underMinute', n: 0 }
  if (s < 90) return { unit: 'minute', n: 1 }
  const m = Math.round(s / 60)
  if (m < 90) return { unit: 'minute', n: m }
  const h = Math.round(m / 60)
  if (h < 48) return { unit: 'hour', n: h }
  return { unit: 'day', n: Math.round(h / 24) }
}

/** The catalog's age after "Fetched …": "<1 MIN ago", "42 MIN ago", "5 H ago", "Stale, 3 D ago". */
export function fmtCatalogAge(fromMs: number, nowMs: number, stale: boolean): string {
  const a = ageOf(fromMs, nowMs)
  return msgs(enHud).catalogAge(a.unit, a.n, stale)
}

/** Element sets older than this are flagged (--warn): pass times drift by seconds per day. */
export const STALE_AFTER_MS = 48 * 3_600_000

export function isStale(fetchedAtIso: string, nowMs: number): boolean {
  const t = Date.parse(fetchedAtIso)
  return Number.isFinite(t) && nowMs - t > STALE_AFTER_MS
}

/** "16,893 OBJECTS" */
export const fmtObjects = (n: number) => msgs(enHud).objects(n)

/** Catalog source label, e.g. "CelesTrak GP" → "CELESTRAK GP"; trims parentheticals for the corner. */
export function fmtSource(source: string): string {
  return source.replace(/\s*\(.*\)\s*$/, '').trim().toLocaleUpperCase(LOCALE_INFO[currentLocale()].intl) || msgs(enHud).catalog
}
