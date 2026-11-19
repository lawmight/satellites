/**
 * Brazilian Portuguese date and time words (see docs/i18n/pt-BR.md §4.3, §5, §6), shared by every screen that says
 * when something happened.
 *
 * Why it is built this way: the words (weekdays and months, *dom*, *nov*, *sexta-feira*, *novembro*) come from CLDR
 * `pt-BR` through dates.ts, never from a hand-made table. The VALUES come from `p`, the instant's local fields that
 * time.ts computed (the timeline builds them at a fixed offset for speed, so asking Intl for the instant at the zone
 * could name another day near a DST change): each word is read off the civil date in `p`, at noon UTC.
 *
 * Mono forms (rows, captions, the HUD, the timeline) are Intl's short parts joined by spaces, lowercase, with the
 * abbreviation's period stripped and no *de*: *dom 1 nov*, *29 out*. Weekdays are always three letters (*dom 1*, *sáb 7*),
 * never Intl's narrow letter or two letters (*se* is both *segunda* and *sexta*). Ranges are built by hand with the
 * product's arrow and the month written once (*1 → 8 nov*, *29 out → 5 nov*). The spoken day is Intl's long form with
 * its comma and *de* (*sexta-feira, 6 de novembro*), and the first of the month written *1º* (*domingo, 1º de
 * novembro*), the Brazilian norm Intl does not apply.
 *
 * Relative times use pt-BR's own templates, not Intl's (which prints *há 12 min.* with a period and *em 3 h* for the
 * future): *agora* under 45 s, *há* for the past (never *atrás*), *daqui a* for the future; compact SI symbols for
 * minutes and hours (*há 12 min*, *há 41 h*), days always spelled (*há 3 dias*), everything spelled for screen readers
 * (*há 12 minutos*, *daqui a 3 horas*). A number never parts from its unit (U+00A0), nor a clock from its zone. Clocks,
 * zones and the T− countdown stay international and are never touched.
 */
import type en from '../en/time'
import { dateFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import { fmt } from '../../../api/_lib/i18n/format'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('pt-BR')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** The civil date in `p`, as an instant Intl can name in UTC whatever zone it was read at. */
const civil = (p: DateFields) => Date.UTC(p.year, p.month - 1, p.day, 12)

const SHORT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
const LONG: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** The weekday, day and month of `p`'s civil date, from Intl's short parts, periods stripped ({ weekday: 'dom', day: '1', month: 'nov' }). */
function shortParts(p: DateFields) {
  const parts = dateFormat('pt-BR', 'UTC', SHORT).formatToParts(civil(p))
  const get = (t: Intl.DateTimeFormatPartTypes) => (parts.find((x) => x.type === t)?.value ?? '').replace(/\.$/, '')
  return { weekday: get('weekday'), day: get('day'), month: get('month') }
}

/** "dom 1 nov": the product's one human date, in mono rows and captions */
function day(p: DateFields): string {
  const d = shortParts(p)
  return `${d.weekday} ${d.day} ${d.month}`
}

/** "29 out" */
function dayMonth(p: DateFields): string {
  const d = shortParts(p)
  return `${d.day} ${d.month}`
}

/** A count of a unit, spelled: "1 minuto", "12 minutos", "1 hora", "41 horas", "3 dias" (0 takes the plural) */
function spelled(n: number, one: string, many: string): string {
  return `${f.int(n)} ${n === 0 ? many : f.plural(n, { one, many, other: many })}`
}

/** "agora", "há 12 min", "há 41 h", "há 3 dias", "daqui a 3 h"; spoken: "há 12 minutos", "há 41 horas", "daqui a 3 horas" */
function relative(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'agora'
  const n = Math.abs(r.value)
  let out: string
  if (r.unit === 'minute') out = spoken ? spelled(n, 'minuto', 'minutos') : `${f.int(n)} min`
  else if (r.unit === 'hour') out = spoken ? spelled(n, 'hora', 'horas') : `${f.int(n)} h`
  else out = spelled(n, 'dia', 'dias')
  return r.value > 0 ? `daqui a ${out}` : `há ${out}`
}

const time: typeof en = {
  /** "dom" */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => shortParts(p).weekday,
  /** "dom 1", "sáb 7": about 5 characters */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => {
    const d = shortParts(p)
    return `${d.weekday} ${d.day}`
  },
  /** "dom 1 nov" */
  day: (_ms: number, _timeZone: string, p: DateFields) => day(p),
  /** "29 out" */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => dayMonth(p),
  /** "1 → 8 nov", "29 out → 5 nov": the month written once when both ends share it */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${a.year === b.year && a.month === b.month ? shortParts(a).day : dayMonth(a)} → ${dayMonth(b)}`,
  /** "sexta-feira, 6 de novembro", "domingo, 1º de novembro" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) =>
    dateFormat('pt-BR', 'UTC', LONG)
      .formatToParts(civil(p))
      .map((part) => (part.type === 'day' && part.value === '1' ? '1º' : part.value))
      .join(''),
  /** "dom 1 nov · 11:21 EST": the clock and its zone never part */
  stamp: (_ms: number, _timeZone: string, p: DateFields, clock: string, zone: string) => `${day(p)} · ${clock} ${zone}`,
  relative: (ms: number, now: number) => relative(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relative(ms, now, true),
  /** "38 s" */
  durationSeconds: (s: number) => `${s} s`,
  /** "4 min 12 s" */
  durationMinutes: (min: number, s: number) => `${min} min ${pad2(s)} s`,
  /** "1 h 02 min" */
  durationHours: (h: number, min: number) => `${f.int(h)} h ${pad2(min)} min`,
  /** "UTC−9 · no mar" */
  atSea: (zone: string) => `${zone} · no mar`,
}
export default time
