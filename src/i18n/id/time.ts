/**
 * Indonesian date and time words (see docs/i18n/id.md §5.5, §6).
 *
 * The words (weekdays, months) come from CLDR `id` through dates.ts, never a hand-made table: *Min Sen Sel Rab Kam Jum
 * Sab*, *Jan … Agu … Des*. The day, month and weekday VALUES come from `p`, the instant's local fields that time.ts
 * computed: the timeline builds them at a fixed offset for speed, so asking Intl for the instant at the zone could name
 * a different day near a DST change. Each name is therefore read off the civil date in `p` (noon UTC on that day).
 *
 * The order and punctuation are built here rather than taken from Intl's pattern, because the guide fixes them: the
 * short day keeps its comma (*Min, 1 Nov*: without it an all-caps `MIN 1 NOV` reads "minus 1"), the spoken day is
 * *Jumat, 6 November*, ranges use the product's arrow (*1 → 8 Nov*), never Intl's en dash.
 *
 * Relative times are written from relativeParts, never with Intl's short style, which prints "3 h lalu" for days (*h*
 * reads as *hari*) and "dlm" for "in": compact *12 mnt lalu*, *5 jam lalu*, *3 hari lalu*, *dalam 3 jam*; spoken
 * *12 menit yang lalu*, *dalam 3 jam*; under 45 s *baru saja* (never CLDR's *sekarang*). Durations use the mono
 * abbreviations *dtk*, *mnt*, *jam*.
 */
import type en from '../en/time'
import { formatDate, relativeParts } from '../../../api/_lib/i18n/dates'
import { fmt } from '../../../api/_lib/i18n/format'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('id')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** A CLDR `id` word for the civil date in `p` (its weekday or month), whatever zone the instant was read at. */
const word = (opts: Intl.DateTimeFormatOptions) => (p: DateFields) =>
  formatDate('id', Date.UTC(p.year, p.month - 1, p.day, 12), 'UTC', opts)
const weekday = word({ weekday: 'short' })
const weekdayLong = word({ weekday: 'long' })
const month = word({ month: 'short' })
const monthLong = word({ month: 'long' })

/** "29 Okt" */
const dayMonthId = (p: DateFields) => `${p.day} ${month(p)}`
/** "Min, 1 Nov": the product's one human date, with the comma that marks the weekday */
const dayId = (p: DateFields) => `${weekday(p)}, ${dayMonthId(p)}`

/** Compact (meta lines, mono) or spoken (aria): see the module comment. */
function relativeId(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'baru saja'
  const unit = r.unit === 'minute' ? (spoken ? 'menit' : 'mnt') : r.unit === 'hour' ? 'jam' : 'hari'
  const amount = `${f.int(Math.abs(r.value))} ${unit}`
  if (r.value > 0) return `dalam ${amount}`
  return spoken ? `${amount} yang lalu` : `${amount} lalu`
}

const time: typeof en = {
  /** "Min" */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => weekday(p),
  /** "Min 1": in a run of weekdays the comma is not needed (§5.5) */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${weekday(p)} ${p.day}`,
  /** "Min, 1 Nov" */
  day: (_ms: number, _timeZone: string, p: DateFields) => dayId(p),
  /** "29 Okt" */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => dayMonthId(p),
  /** "1 → 8 Nov", "29 Okt → 5 Nov": the month written once when both ends share it */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${a.month === b.month && a.year === b.year ? a.day : dayMonthId(a)} → ${dayMonthId(b)}`,
  /** "Jumat, 6 November" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => `${weekdayLong(p)}, ${p.day} ${monthLong(p)}`,
  /** "Min, 1 Nov · 11:21 WIB" */
  stamp: (_ms: number, _timeZone: string, p: DateFields, clock: string, zone: string) => `${dayId(p)} · ${clock} ${zone}`,
  relative: (ms: number, now: number) => relativeId(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relativeId(ms, now, true),
  /** "38 dtk" */
  durationSeconds: (s: number) => `${s} dtk`,
  /** "4 mnt 12 dtk" */
  durationMinutes: (min: number, s: number) => `${min} mnt ${pad2(s)} dtk`,
  /** "1 jam 02 mnt" */
  durationHours: (h: number, min: number) => `${f.int(h)} jam ${pad2(min)} mnt`,
  /** "UTC−9 · di laut" */
  atSea: (zone: string) => `${zone} · di laut`,
}
export default time
