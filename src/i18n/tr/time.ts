/**
 * Turkish date and time words (see docs/i18n/tr.md §5.5, §6.4, §6.8), shared by every screen that says when something
 * happened: the HUD's replay clock, the pass list, timeline, photos and headers, the share sheet.
 *
 * Why it is built this way: Turkish dates run day, month, weekday (`1 Kas Paz`, `6 Kasım Cuma`), and every word comes
 * from CLDR `tr` through dates.ts, never a hand-made table (*Oca Şub … Ara*, *Pzt Sal … Paz*; the month and weekday
 * keep their capital inside a date, TDK). The parts are read one by one and joined with spaces, so a browser whose
 * CLDR puts a comma between them still prints the guide's forms. The VALUES come from `p`, the instant's local fields
 * that time.ts computed (the timeline builds them at a fixed offset for speed, so asking Intl for the instant at the
 * zone could name another day near a DST change): each word is read off the civil date in `p`, at noon UTC. A span
 * writes the shared month once and joins its ends with the house arrow (`1 → 8 Kas`, `29 Eki → 5 Kas`, `29 Ara → 5
 * Oca`); it is built from the parts rather than Intl's formatRange, which prints an en dash and adds both years to a
 * span across New Year, where this namespace never shows a year.
 *
 * Relative times: the compact form is built by hand from relativeParts with the unit symbols *dk, sa* and the word
 * *gün*, then the separate words *önce* / *sonra*, which never harmonise with the number (`az önce`, `12 dk önce`,
 * `30 sa önce`, hours up to 48 as an instrument says it, `3 gün önce`, `3 sa sonra`); Intl's short forms are dotted
 * (*41 sa. önce*), which the guide rejects (§6.4). Under 45 s is `az önce`, never *şimdi*. The spoken form is Intl's
 * long one (`12 dakika önce`, `41 saat önce`, `3 saat sonra`). Durations use the same symbols (`38 sn`, `4 dk 12 sn`,
 * `1 sa 02 dk`). A number never parts from its unit, nor a clock from its zone (U+00A0, §6.7). Clocks, zone
 * abbreviations (*TSİ* is rejected: zones stay as code writes them) and the T− countdown are never touched.
 */
import type en from '../en/time'
import { dateFormat, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import { fmt } from '../../../api/_lib/i18n/format'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('tr')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** The civil date in `p`, as an instant Intl can name in UTC whatever zone it was read at. */
const civil = (p: DateFields) => Date.UTC(p.year, p.month - 1, p.day, 12)

const SHORT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
const LONG: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** One civil date's words from Intl's (cached) parts: { weekday: 'Paz', day: '1', month: 'Kas' }, or the long forms. */
function words(p: DateFields, opts: Intl.DateTimeFormatOptions) {
  const parts = dateFormat('tr', 'UTC', opts).formatToParts(civil(p))
  // A trailing full stop on an abbreviation (older ICU data) is not the guide's form.
  const get = (t: Intl.DateTimeFormatPartTypes) => (parts.find((x) => x.type === t)?.value ?? '').replace(/\.$/, '')
  return { weekday: get('weekday'), day: get('day') || String(p.day), month: get('month') }
}

/** "1 Kas Paz": the product's one human date. */
function day(p: DateFields): string {
  const d = words(p, SHORT)
  return `${d.day} ${d.month} ${d.weekday}`
}

/** "29 Eki" */
function dayMonth(p: DateFields): string {
  const d = words(p, SHORT)
  return `${d.day} ${d.month}`
}

/** "12 dk", "30 sa", "3 gün": the compact amount before *önce* or *sonra*. */
function compactTr(unit: 'minute' | 'hour' | 'day', n: number): string {
  const v = f.int(n)
  if (unit === 'minute') return `${v} dk`
  if (unit === 'hour') return `${v} sa`
  return `${v} gün`
}

/** Compact (meta lines, mono) or spoken (aria): see the module comment. */
function relativeTr(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'az önce'
  if (spoken) return relativeFormat('tr', 'long').format(r.value, r.unit)
  const out = compactTr(r.unit, Math.abs(r.value))
  return r.value < 0 ? `${out} önce` : `${out} sonra`
}

const time: typeof en = {
  /** "Paz" */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => words(p, SHORT).weekday,
  /** "Paz 1", "Cmt 30" */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${words(p, SHORT).weekday} ${p.day}`,
  /** "1 Kas Paz" */
  day: (_ms: number, _timeZone: string, p: DateFields) => day(p),
  /** "29 Eki" */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => dayMonth(p),
  /** "1 → 8 Kas", "29 Eki → 5 Kas", "29 Ara → 5 Oca": the shared month written once, no year */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${a.year === b.year && a.month === b.month ? a.day : dayMonth(a)} → ${dayMonth(b)}`,
  /** "6 Kasım Cuma" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => {
    const d = words(p, LONG)
    return `${d.day} ${d.month} ${d.weekday}`
  },
  /** "1 Kas Paz · 11:21 EST": the clock and its zone never part */
  stamp: (_ms: number, _timeZone: string, p: DateFields, time: string, zone: string) => `${day(p)} · ${time} ${zone}`,
  /** "az önce", "12 dk önce", "30 sa önce", "3 gün önce", "3 sa sonra" */
  relative: (ms: number, now: number) => relativeTr(ms, now, false),
  /** "az önce", "12 dakika önce", "41 saat önce", "3 saat sonra" */
  relativeSpoken: (ms: number, now: number) => relativeTr(ms, now, true),
  /** "38 sn" */
  durationSeconds: (s: number) => `${s} sn`,
  /** "4 dk 12 sn" */
  durationMinutes: (min: number, s: number) => `${min} dk ${pad2(s)} sn`,
  /** "1 sa 02 dk" */
  durationHours: (h: number, min: number) => `${f.int(h)} sa ${pad2(min)} dk`,
  /** "UTC−9 · denizde" */
  atSea: (zone: string) => `${zone} · denizde`,
}
export default time
