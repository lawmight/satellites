/**
 * Dates and relative times in the visitor's language, always at a given time zone (a place's, or UTC): cached Intl
 * formatters, so a timeline that labels hundreds of rows never builds one twice. Pure (Intl only), shared by the app
 * and the server like the rest of api/_lib/i18n.
 *
 * English does not come through here: its hand-made forms ("Sun 1 Nov", "12 min ago") are the house style and stay
 * byte-identical (src/ui/results/lib/time.ts). Other languages take their CLDR forms from Intl, which already knows
 * "So., 1. Nov.", "11月1日(日)", "il y a 12 min", and each translation picks the options that read best on its screens.
 */
import { LOCALE_INFO, type Locale } from './locales.js'

const dtfs = new Map<string, Intl.DateTimeFormat>()

/** A cached Intl.DateTimeFormat for a locale, a zone and options (unknown zones fall back to UTC rather than throw). */
export function dateFormat(locale: Locale, timeZone: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${timeZone}|${JSON.stringify(opts)}`
  let f = dtfs.get(key)
  if (!f) {
    const tag = LOCALE_INFO[locale].intl
    try {
      f = new Intl.DateTimeFormat(tag, { ...opts, timeZone })
    } catch {
      f = new Intl.DateTimeFormat(tag, { ...opts, timeZone: 'UTC' })
    }
    dtfs.set(key, f)
  }
  return f
}

/** Format an instant at a zone in a locale: formatDate('de', ms, 'Europe/Berlin', { weekday: 'short', day: 'numeric', month: 'short' }). */
export function formatDate(locale: Locale, ms: number, timeZone: string, opts: Intl.DateTimeFormatOptions): string {
  return dateFormat(locale, timeZone, opts).format(ms)
}

const rtfs = new Map<string, Intl.RelativeTimeFormat>()

/** "vor 12 Min.", "12 分前", "قبل 12 دقيقة": Intl's relative time, cached per locale and style. */
export function relativeFormat(locale: Locale, style: Intl.RelativeTimeFormatStyle = 'short', numeric: 'always' | 'auto' = 'always'): Intl.RelativeTimeFormat {
  const key = `${locale}|${style}|${numeric}`
  let f = rtfs.get(key)
  if (!f) rtfs.set(key, (f = new Intl.RelativeTimeFormat(LOCALE_INFO[locale].intl, { style, numeric })))
  return f
}

/**
 * The house rule for "how long ago" (an instrument says "30 h ago", not "yesterday evening"): under 45 s is "now",
 * minutes under an hour, hours up to 48, then days. Returns the unit and the signed count for Intl.RelativeTimeFormat.
 */
export function relativeParts(ms: number, now: number): { unit: 'second' | 'minute' | 'hour' | 'day'; value: number } {
  const diff = ms - now
  const s = Math.abs(diff) / 1000
  const sign = diff < 0 ? -1 : 1
  if (s < 45) return { unit: 'second', value: 0 }
  if (s < 3600) return { unit: 'minute', value: sign * Math.max(1, Math.round(s / 60)) }
  if (s < 48 * 3600) return { unit: 'hour', value: sign * Math.round(s / 3600) }
  return { unit: 'day', value: sign * Math.round(s / 86_400) }
}
