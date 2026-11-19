/**
 * Italian date and time words (see docs/i18n/it.md §5.5, §6), shared by every screen that says when something
 * happened.
 *
 * Why it is built this way: the words (weekdays and months, *dom*, *nov*, *domenica*, *novembre*) come from CLDR `it`
 * through dates.ts, never from a hand-made table. The VALUES come from `p`, the instant's local fields that time.ts
 * computed (the timeline builds them at a fixed offset for speed, so asking Intl for the instant at the zone could name
 * another day near a DST change): each word is read off the civil date in `p`, at noon UTC. The parts are joined with
 * spaces, so the readouts are *dom 1 nov* and the spoken day *venerdì 6 novembre*, lowercase, no comma and no full
 * stop whatever the ICU version. The first of the month is *1*, as Intl writes it (never *1º*, which looks like *1°*).
 * The compact timeline day is Intl's short weekday and the day (*dom 1*), never the narrow letter, where *M* is both
 * *martedì* and *mercoledì*. Ranges are built by hand with the product's arrow and the month written once (*1 → 8 nov*,
 * *29 ott → 5 nov*): Italian formatRange zero-pads the days and drops the arrow. Relative times are numeric, as an
 * instrument says them: *poco fa* under 45 s (never *adesso*, which is still happening), short style for minutes and
 * hours (*12 min fa*, *41 h fa*, *tra 3 h*), long for days (*2 giorni fa*: Intl's short days are *2 gg fa*), long
 * throughout for screen readers (*12 minuti fa*, *tra 3 ore*). A number never parts from its unit, nor a time from its
 * zone (U+00A0). Clocks, zones and the T− countdown stay international and are never touched.
 */
import type en from '../en/time'
import { dateFormat, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import type { DateFields } from '@/ui/results/lib/time'

const pad2 = (n: number) => String(n).padStart(2, '0')

/** The civil date in `p`, as an instant Intl can name in UTC whatever zone it was read at. */
const civil = (p: DateFields) => Date.UTC(p.year, p.month - 1, p.day, 12)

const SHORT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
const LONG: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** The weekday, day and month of `p`'s civil date, from Intl's parts ({ weekday: 'dom', day: '1', month: 'nov' }). */
function partsOf(p: DateFields, opts: Intl.DateTimeFormatOptions) {
  const parts = dateFormat('it', 'UTC', opts).formatToParts(civil(p))
  // Some ICU data ends an abbreviation with a full stop; the guide's readouts have none (§6).
  const get = (t: Intl.DateTimeFormatPartTypes) => (parts.find((x) => x.type === t)?.value ?? '').replace(/\.$/, '')
  return { weekday: get('weekday'), day: get('day'), month: get('month') }
}

/** "dom 1 nov": the product's one human date, in mono rows and captions */
function day(p: DateFields): string {
  const d = partsOf(p, SHORT)
  return `${d.weekday} ${d.day} ${d.month}`
}

/** "29 ott" */
function dayMonth(p: DateFields): string {
  const d = partsOf(p, SHORT)
  return `${d.day} ${d.month}`
}

/** A number never parts from its unit: Intl's ordinary space after a digit becomes a no-break space. */
const tie = (s: string) => s.replace(/(\d) /g, '$1 ')

/** "poco fa", "12 min fa", "41 h fa", "3 giorni fa", "tra 3 h"; spoken: "12 minuti fa", "41 ore fa", "tra 3 ore". */
function relative(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'poco fa'
  return tie(relativeFormat('it', spoken || r.unit === 'day' ? 'long' : 'short').format(r.value, r.unit))
}

const time: typeof en = {
  /** "dom" */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => partsOf(p, SHORT).weekday,
  /** "dom 1": about 5 characters */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => {
    const d = partsOf(p, SHORT)
    return `${d.weekday} ${d.day}`
  },
  /** "dom 1 nov" */
  day: (_ms: number, _timeZone: string, p: DateFields) => day(p),
  /** "29 ott" */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => dayMonth(p),
  /** "1 → 8 nov", "29 ott → 5 nov": the month written once when both ends share it */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${a.year === b.year && a.month === b.month ? partsOf(a, SHORT).day : dayMonth(a)} → ${dayMonth(b)}`,
  /** "venerdì 6 novembre" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => {
    const d = partsOf(p, LONG)
    return `${d.weekday} ${d.day} ${d.month}`
  },
  /** "dom 1 nov · 11:21 EST": the time and its zone never part */
  stamp: (_ms: number, _timeZone: string, p: DateFields, clock: string, zone: string) => `${day(p)} · ${clock} ${zone}`,
  relative: (ms: number, now: number) => relative(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relative(ms, now, true),
  /** "38 s" */
  durationSeconds: (s: number) => `${s} s`,
  /** "4 min 12 s" */
  durationMinutes: (min: number, s: number) => `${min} min ${pad2(s)} s`,
  /** "1 h 02 min" */
  durationHours: (h: number, min: number) => `${h} h ${pad2(min)} min`,
  /** "UTC−9 · in mare" */
  atSea: (zone: string) => `${zone} · in mare`,
}
export default time
