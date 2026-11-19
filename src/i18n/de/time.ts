/**
 * German date and time words (see docs/i18n/de.md §5.5, §6.3), shared by every screen that says when something
 * happened: the HUD's scene clock, the pass list, timeline, photos and headers, the share sheet.
 *
 * Why it is built this way: mono readouts write dates numerically (`So 01.11.`, `01.11. → 08.11.`), because German's
 * month abbreviations are uneven (*März*, *Juni*, *Juli* have none, *Sept.* has five letters) and numbers line up in
 * tabular figures; the leading zeros follow DIN 5008. Every word and number comes from CLDR `de` through dates.ts,
 * never from a hand-made table: the weekday is Intl's standalone short form (`So`, no full stop), the day and month its
 * 2-digit parts (`01.11.`), and the product's one human date is Intl's `So., 01.11.` with the `.,` dropped. Screen
 * readers hear Intl's long form (`Sonntag, 1. November`). The VALUES come from `p`, the instant's local fields that
 * time.ts computed (the timeline builds them at a fixed offset for speed, so asking Intl for the instant at the zone
 * could name another day near a DST change): each word is read off the civil date in `p`, at noon UTC. Ranges are
 * built from parts with the house arrow, never formatRange, which prints thin spaces (U+2009, §6.7).
 *
 * Relative times: the compact form is built by hand from relativeParts (`gerade eben`, `vor 12 min`, `vor 5 h`, hours
 * up to 48 as an instrument says it, `vor 2 Tagen`, `in 3 h`), because Intl's short forms are dotted and not SI
 * (`vor 12 Min.`, `vor 5 Std.`). Days are always spelled out, dative after *vor* and *in*. The spoken form is Intl's
 * long one (`vor 12 Minuten`, `vor 41 Stunden`, `in 3 Stunden`). Durations stay SI (`4 min 12 s`, `1 h 02 min`). A
 * number never parts from its unit (U+00A0). Every `zone` slot goes through zoneDe, so CET reads MEZ and CEST MESZ
 * (§6.3); clocks and every other zone stay as they arrive.
 */
import type en from '../en/time'
import { formatDate, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import { fmt } from '../../../api/_lib/i18n/format'
import { zoneDe } from '../../../api/_lib/i18n/card/deZone'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('de')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** The civil date in `p`, as an instant Intl can name in UTC whatever zone it was read at. */
const civil = (p: DateFields) => Date.UTC(p.year, p.month - 1, p.day, 12)

const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const DAY_MONTH: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' }
const WEEKDAY_DAY_MONTH: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: '2-digit' }
const SPOKEN: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** "So" (Intl's standalone short weekday; a trailing full stop is stripped in case a browser's CLDR prints one). */
const weekdayDe = (p: DateFields) => formatDate('de', civil(p), 'UTC', WEEKDAY).replace(/\.$/, '')
/** "01.11." */
const dayMonthDe = (p: DateFields) => formatDate('de', civil(p), 'UTC', DAY_MONTH)
/** "So 01.11.": Intl's "So., 01.11." with the ".," dropped */
const dayDe = (p: DateFields) => formatDate('de', civil(p), 'UTC', WEEKDAY_DAY_MONTH).replace(/\.?,\s*/, ' ')

/** Intl's ordinary space after a digit becomes a no-break space: a number never parts from its unit. */
const tie = (s: string) => s.replace(/(\d) /g, '$1 ')

/** "12 min", "5 h", "1 Tag", "2 Tagen": the compact amount after *vor* or *in* (both take the dative). */
function compactDe(unit: 'minute' | 'hour' | 'day', n: number): string {
  const v = f.int(n)
  if (unit === 'minute') return `${v} min`
  if (unit === 'hour') return `${v} h`
  return f.plural(n, { one: `${v} Tag`, other: `${v} Tagen` })
}

/** Compact (meta lines, mono) or spoken (aria): see the module comment. */
function relativeDe(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'gerade eben'
  if (spoken) return tie(relativeFormat('de', 'long').format(r.value, r.unit))
  const out = compactDe(r.unit, Math.abs(r.value))
  return r.value < 0 ? `vor ${out}` : `in ${out}`
}

const time: typeof en = {
  /** "So" */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => weekdayDe(p),
  /** "So 1", "Mo 30": at most 5 characters */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${weekdayDe(p)} ${p.day}`,
  /** "So 01.11." */
  day: (_ms: number, _timeZone: string, p: DateFields) => dayDe(p),
  /** "29.10." */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => dayMonthDe(p),
  /** "01.11. → 08.11.", "29.10. → 05.11.", "29.12. → 05.01.": numeric, so both ends are written whole */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${dayMonthDe(a)} → ${dayMonthDe(b)}`,
  /** "Sonntag, 1. November" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => formatDate('de', civil(p), 'UTC', SPOKEN),
  /** "So 01.11. · 11:21 MEZ": the time and its zone never part */
  stamp: (_ms: number, _timeZone: string, p: DateFields, time: string, zone: string) =>
    `${dayDe(p)} · ${time} ${zoneDe(zone)}`,
  /** "gerade eben", "vor 12 min", "vor 30 h", "vor 3 Tagen", "in 3 h" */
  relative: (ms: number, now: number) => relativeDe(ms, now, false),
  /** "vor 12 Minuten", "vor 41 Stunden", "in 3 Stunden" */
  relativeSpoken: (ms: number, now: number) => relativeDe(ms, now, true),
  /** "38 s" */
  durationSeconds: (s: number) => `${s} s`,
  /** "4 min 12 s" */
  durationMinutes: (min: number, s: number) => `${min} min ${pad2(s)} s`,
  /** "1 h 02 min" */
  durationHours: (h: number, min: number) => `${f.int(h)} h ${pad2(min)} min`,
  /** "UTC−9 · auf See" */
  atSea: (zone: string) => `${zoneDe(zone)} · auf See`,
}
export default time
