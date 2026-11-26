/**
 * Formatting helpers — mono readouts. Keep output stable-width where possible.
 *
 * Two kinds, on purpose. International notation reads the same in every language and stays hand-made here: UTC clocks
 * and ISO dates ("2026-11-08 03:31:07"), coordinates ("43.4723°N 80.5449°W"), NORAD ids. Counts and decimals follow the
 * visitor's language (`fmt(currentLocale())`: "1,715" / "1.715" / "1 715"), read at call time, so a component that shows
 * them re-renders with the language (useMsgs / useLocale). English prints exactly the en-US forms it always has.
 */
import { fmt } from '../../../api/_lib/i18n/format'
import { hemisphere, LOCALE_INFO } from '../../../api/_lib/i18n/locales'
import { currentLocale } from '@/i18n/runtime'

const pad = (n: number, w = 2) => String(Math.trunc(n)).padStart(w, '0')

/** "2026-11-08 03:31:07" (UTC). The two halves on their own: fmtUtcDate, fmtUtcTime (never split this string). */
export function fmtUtc(ms: number, withSeconds = true): string {
  return `${fmtUtcDate(ms)} ${fmtUtcTime(ms, withSeconds)}`
}
/** "2026-11-08" (UTC) */
export function fmtUtcDate(ms: number): string {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}
/** "03:31:07", or "03:31" without seconds (UTC) */
export function fmtUtcTime(ms: number, withSeconds = true): string {
  const d = new Date(ms)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}${withSeconds ? ':' + pad(d.getUTCSeconds()) : ''}`
}
/** Local time at a longitude-ish place: we use the browser's Intl with an explicit tz if provided (a 24 h clock: the same in every language) */
export function fmtLocal(ms: number, timeZone?: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
    ...opts,
  }).format(ms)
}
/** "Sun, Nov 1" in the visitor's language (sandboxes; the product's own dates are src/ui/results/lib/time.ts) */
export function fmtDay(ms: number, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE_INFO[currentLocale()].intl, { weekday: 'short', month: 'short', day: 'numeric', timeZone }).format(ms)
}
/** "43.4723°N": international notation, with the language's hemisphere letters where N S E W would mislead (vi) */
export function fmtLat(lat: number, digits = 4): string {
  return `${Math.abs(lat).toFixed(digits)}°${hemisphere(currentLocale(), 'lat', lat)}`
}
export function fmtLon(lon: number, digits = 4): string {
  const l = ((((lon + 180) % 360) + 360) % 360) - 180
  return `${Math.abs(l).toFixed(digits)}°${hemisphere(currentLocale(), 'lon', l)}`
}
/** A whole number, grouped in the visitor's language: "16,893" */
export function fmtInt(n: number): string {
  return fmt(currentLocale()).int(n)
}
/** Fixed decimals in the visitor's language: "7.46" */
export function fmtNum(n: number, digits = 1): string {
  return fmt(currentLocale()).dec(n, digits)
}
export function fmtNorad(n: number): string {
  return String(n).padStart(5, '0')
}
/** "3 min ago", "2 h ago", "4 days ago". Dev sandboxes only (English on purpose): the product says fmtRelative (results/lib/time.ts). */
export function fmtAgo(ms: number, now = Date.now()): string {
  const s = Math.round((now - ms) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 48) return `${h} h ago`
  return `${Math.round(h / 24)} days ago`
}
