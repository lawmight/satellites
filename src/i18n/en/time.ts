/**
 * Date and time words, shared by every screen that says when something happened: the HUD's scene clock, the results
 * (pass list, timeline, photos, headers), the share sheet. Code calls src/ui/results/lib/time.ts, which reads these at
 * call time, so a language switch changes every date on its next render.
 *
 * Why functions of raw instants: English keeps its hand-made house style byte for byte ("Sun 1 Nov", "12 min ago",
 * "4 min 12 s"), while another language takes its CLDR forms from Intl through api/_lib/i18n/dates.ts
 * (`formatDate(locale, ms, timeZone, opts)`, `relativeFormat`, `relativeParts`), which already knows "So., 1. Nov.",
 * "11月1日(日)" or "il y a 12 min". So every message gets the instant (epoch ms) and the IANA zone it is shown in, never
 * text to take apart. `p` is that instant's local fields at that zone (numbers only: year, month 1–12, day, dow with
 * 0 = Sunday, hour, minute, second; computed once by time.ts), for a language that builds its label by hand as English
 * does; an Intl-based translation can ignore it.
 *
 * Mixed case throughout: mono labels uppercase these with CSS. No year (share cards add it), the day never zero-padded.
 *
 * Not here, because they read the same in every language: 24 h clocks ("11:21:13"), zone abbreviations ("EST", "CET",
 * "UTC+9"), the replay countdown ("T−00:42"), ISO stamps ("2026-11-08 03:31:07").
 */
import { fmt } from '../../../api/_lib/i18n/format'
import { ns } from '../ns'
import type { DateFields } from '@/ui/results/lib/time'

const en = fmt('en')
const pad2 = (n: number) => String(n).padStart(2, '0')

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** "Sun 1 Nov": English's one human date (the `day` message, and the day in `stamp`). */
const dayEn = (p: DateFields) => `${WEEKDAYS[p.dow]} ${p.day} ${MONTHS[p.month - 1]}`

/** The house rule for "how long ago" (an instrument says "30 h ago", not "yesterday evening"); see dates.ts relativeParts. */
function relativeEn(ms: number, now: number, spoken: boolean): string {
  const diff = now - ms
  const s = Math.abs(diff) / 1000
  if (s < 45) return 'just now'
  let out: string
  if (s < 3600) {
    const n = Math.max(1, Math.round(s / 60))
    out = spoken ? `${n} ${en.plural(n, { one: 'minute', other: 'minutes' })}` : `${n} min`
  } else if (s < 48 * 3600) {
    const n = Math.round(s / 3600)
    out = spoken ? `${n} ${en.plural(n, { one: 'hour', other: 'hours' })}` : `${n} h`
  } else {
    const d = Math.round(s / 86_400)
    out = `${d} ${en.plural(d, { one: 'day', other: 'days' })}`
  }
  return diff < 0 ? `in ${out}` : `${out} ago`
}

export default ns('time', {
  /** Short weekday: "Sun" (the timeline's first-day label, the photo strip's placeholder tiles; mono caps by CSS) */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => WEEKDAYS[p.dow],
  /** The timeline's day label when a day is 48–92 px wide: "Su 1" (keep it about 5 characters) */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${WEEKDAYS[p.dow].slice(0, 2)} ${p.day}`,
  /** The product's one human date, at the place: "Sun 1 Nov" (pass rows, photo captions, the HUD's scene clock) */
  day: (_ms: number, _timeZone: string, p: DateFields) => dayEn(p),
  /** Day and month, no weekday: "29 Oct" */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => `${p.day} ${MONTHS[p.month - 1]}`,
  /**
   * A span of days at the place (the week a report covers): "1 → 8 Nov", "29 Oct → 5 Nov". The month is written once
   * when both ends share it. `a` and `b` are the two ends' local fields. Intl's formatRange does this for you
   * (dates.ts `dateFormat(locale, timeZone, { day: 'numeric', month: 'short' }).formatRange(startMs, endMs)`).
   */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${a.month === b.month ? a.day : `${a.day} ${MONTHS[a.month - 1]}`} → ${b.day} ${MONTHS[b.month - 1]}`,
  /** Screen readers only (spelled out): "Friday 6 November" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => `${WEEKDAYS_LONG[p.dow]} ${p.day} ${MONTHS_LONG[p.month - 1]}`,
  /**
   * A day and a time together: "Sun 1 Nov · 11:21 EST" (a pass's row in the pass list, mono). The day is the
   * instant's (`ms`, `timeZone`, `p` as for `day`): write it as your `day` does, or in the form your language uses
   * beside a time. `time` is the 24 h clock at the place ("11:21", or "11:21:13"), `zone` the zone's abbreviation
   * ("EST", "UTC+9"): international notation, already written; keep the two together, in that order.
   */
  stamp: (_ms: number, _timeZone: string, p: DateFields, time: string, zone: string) => `${dayEn(p)} · ${time} ${zone}`,
  /**
   * How long ago (or until) an instant, compact: "just now", "12 min ago", "30 h ago", "3 days ago", "in 3 h". Hours
   * up to 48 on purpose (an instrument says "30 h ago", not "yesterday evening"). A translation:
   * `const r = relativeParts(ms, now)`, then "just now" for unit 'second', else `relativeFormat(locale).format(r.value, r.unit)`.
   */
  relative: (ms: number, now: number) => relativeEn(ms, now, false),
  /** The same, spelled out for screen readers: "12 minutes ago", "41 hours ago", "in 3 hours" (relativeFormat 'long') */
  relativeSpoken: (ms: number, now: number) => relativeEn(ms, now, true),
  /** Durations (a pass in view, a replay): under a minute, "38 s" */
  durationSeconds: (s: number) => `${s} s`,
  /** Under an hour: "4 min 12 s" (seconds zero-padded) */
  durationMinutes: (min: number, s: number) => `${min} min ${pad2(s)} s`,
  /** An hour or more: "1 h 02 min" (minutes zero-padded) */
  durationHours: (h: number, min: number) => `${h} h ${pad2(min)} min`,
  /** The time zone of a place at sea (a nautical zone, no city to name): "UTC−9 · at sea"; `zone` is "UTC−9" */
  atSea: (zone: string) => `${zone} · at sea`,
})
