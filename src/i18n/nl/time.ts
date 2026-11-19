/**
 * Dutch date and time words (see docs/i18n/nl.md §5 "Dates and times inside sentences", §6), shared by every screen
 * that says when something happened.
 *
 * Why it is built this way: the words (weekdays `ma di wo do vr za zo`, months `jan feb mrt … okt nov dec`, and the
 * full forms `vrijdag`, `november`) come from CLDR `nl` through dates.ts, never from a hand-made table. The VALUES come
 * from `p`, the instant's local fields that time.ts computed (the timeline builds them at a fixed offset for speed, so
 * asking Intl for the instant at the zone could name another day near a DST change): each word is read off the civil
 * date in `p`, at noon UTC. Mono readouts take Intl's short forms with no full stop (`zo 1 nov`, `29 okt`); a trailing
 * full stop is stripped in case a browser's CLDR still prints one. Screen readers hear the full form in lowercase with
 * no comma (`vrijdag 6 november`). The compact timeline day is `zo 1`. Ranges are built by hand with the house arrow and
 * the month written once (`1 → 8 nov`, `29 okt → 5 nov`): Intl's formatRange prints a spaced en dash.
 *
 * Relative times: the compact form is built by hand from relativeParts, `zojuist`, `12 min geleden`, `41 uur geleden`
 * (hours up to 48, as an instrument says it), `3 dagen geleden`, `over 3 uur`, because Intl's short and narrow forms
 * print `12 min. geleden` and `3 dgn geleden`. The spoken form is Intl's long one as it is (`12 minuten geleden`,
 * `1 minuut geleden`, `over 3 uur`). `uur` never changes after a number and is never written `u` (the formal pronoun)
 * or `h`: durations read `1 uur 02 min`. A number never parts from its unit, nor a clock from its zone (U+00A0).
 * Clocks, zones and the T− countdown stay international and are never touched.
 */
import type en from '../en/time'
import { formatDate, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import { fmt } from '../../../api/_lib/i18n/format'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('nl')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** The civil date in `p`, as an instant Intl can name in UTC whatever zone it was read at. */
const civil = (p: DateFields) => Date.UTC(p.year, p.month - 1, p.day, 12)

/** One Intl word for the civil date in `p`, without a trailing full stop ("zo", "nov"). */
const word = (p: DateFields, opts: Intl.DateTimeFormatOptions) => formatDate('nl', civil(p), 'UTC', opts).replace(/\.$/, '')

const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const MONTH: Intl.DateTimeFormatOptions = { month: 'short' }
const SPOKEN: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** "zo" */
const weekdayNl = (p: DateFields) => word(p, WEEKDAY)
/** "29 okt" */
const dayMonthNl = (p: DateFields) => `${p.day} ${word(p, MONTH)}`
/** "zo 1 nov": the product's one human date */
const dayNl = (p: DateFields) => `${weekdayNl(p)} ${dayMonthNl(p)}`

/** A number never parts from its unit: Intl's ordinary space after a digit becomes a no-break space. */
const tie = (s: string) => s.replace(/(\d) /g, '$1 ')

/** "12 min", "41 uur", "1 dag", "3 dagen" (compact: the house rule's unit, never Intl's abbreviations). */
function compactNl(unit: 'minute' | 'hour' | 'day', n: number): string {
  const v = f.int(n)
  if (unit === 'minute') return `${v} min`
  if (unit === 'hour') return `${v} uur`
  return f.plural(n, { one: `${v} dag`, other: `${v} dagen` })
}

/** Compact (meta lines, mono) or spoken (aria): see the module comment. */
function relativeNl(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'zojuist'
  if (spoken) return tie(relativeFormat('nl', 'long').format(r.value, r.unit))
  const out = compactNl(r.unit, Math.abs(r.value))
  return r.value < 0 ? `${out} geleden` : `over ${out}`
}

const time: typeof en = {
  /** "zo" */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => weekdayNl(p),
  /** "zo 1", "ma 30": at most 5 characters */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${weekdayNl(p)} ${p.day}`,
  /** "zo 1 nov" */
  day: (_ms: number, _timeZone: string, p: DateFields) => dayNl(p),
  /** "29 okt" */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => dayMonthNl(p),
  /** "1 → 8 nov", "29 okt → 5 nov", "29 dec → 5 jan": the month written once when both ends share it */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${a.year === b.year && a.month === b.month ? a.day : dayMonthNl(a)} → ${dayMonthNl(b)}`,
  /** "vrijdag 6 november" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => formatDate('nl', civil(p), 'UTC', SPOKEN),
  /** "zo 1 nov · 11:21 EST": the time and its zone never part */
  stamp: (_ms: number, _timeZone: string, p: DateFields, clock: string, zone: string) => `${dayNl(p)} · ${clock} ${zone}`,
  relative: (ms: number, now: number) => relativeNl(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relativeNl(ms, now, true),
  /** "38 s" */
  durationSeconds: (s: number) => `${s} s`,
  /** "4 min 12 s" */
  durationMinutes: (min: number, s: number) => `${min} min ${pad2(s)} s`,
  /** "1 uur 02 min" (never "1 u": it reads as the formal pronoun) */
  durationHours: (h: number, min: number) => `${f.int(h)} uur ${pad2(min)} min`,
  /** "UTC−9 · op zee" */
  atSea: (zone: string) => `${zone} · op zee`,
}
export default time
