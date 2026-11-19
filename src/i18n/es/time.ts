/**
 * Spanish date and time words (see docs/i18n/es.md §5, §6), shared by every screen that says when something happened.
 *
 * Why Intl parts for every word: weekdays and months come from CLDR through api/_lib/i18n/dates.ts, never from a
 * hand-made table, so the timeline, the rows, the card and the post agree (*sept* for September is Intl's, and kept).
 * Intl's own short and long forms put a comma after the weekday (*dom, 1 nov*, *viernes, 6 de noviembre*); the guide's
 * forms have none, so the parts are joined by spaces: mono *dom 1 nov*, spoken *viernes 6 de noviembre* (Intl's own
 * *de* kept). Ranges keep the arrow every language's kicker uses (*29 oct → 5 nov*, *1 → 8 nov*). Relative times are
 * numeric, as an instrument says them: short for minutes and hours (*hace 12 min*, *dentro de 3 h*), long for days
 * (*hace 2 días*: the short *hace 2 d* is not how a sentence says it), long throughout for screen readers, *ahora mismo*
 * under 45 s. Clocks, zones and the T− countdown stay international and are never touched.
 */
import type en from '../en/time'
import { dateFormat, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import type { DateFields } from '@/ui/results/lib/time'

const pad2 = (n: number) => String(n).padStart(2, '0')

const SHORT: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
const LONG: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** A number never parts from its unit: Intl's ordinary space after a digit becomes a no-break space. */
const tie = (s: string) => s.replace(/(\d) /g, '$1\u00a0')

/** An instant's short weekday, day and short month at a zone, from Intl's parts ({ weekday: 'dom', day: '1', month: 'nov' }). */
function shortParts(ms: number, timeZone: string) {
  const parts = dateFormat('es', timeZone, SHORT).formatToParts(ms)
  // Older ICU data still ends some abbreviations with a full stop ("nov."); the guide's abbreviations have none.
  const get = (t: Intl.DateTimeFormatPartTypes) => (parts.find((p) => p.type === t)?.value ?? '').replace(/\.$/, '')
  return { weekday: get('weekday'), day: get('day'), month: get('month') }
}

/** "dom 1 nov": the product's one human date, in mono rows and captions. */
function day(ms: number, timeZone: string): string {
  const d = shortParts(ms, timeZone)
  return `${d.weekday} ${d.day} ${d.month}`
}

/** "ahora mismo", "hace 12 min", "hace 30 h", "hace 3 días", "dentro de 3 h"; spoken: "hace 12 minutos", "hace 41 horas". */
function relative(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'ahora mismo'
  return tie(relativeFormat('es', spoken || r.unit === 'day' ? 'long' : 'short').format(r.value, r.unit))
}

const time: typeof en = {
  weekdayShort: (ms: number, timeZone: string) => shortParts(ms, timeZone).weekday,
  dayCompact: (ms: number, timeZone: string) => {
    const d = shortParts(ms, timeZone)
    return `${d.weekday} ${d.day}`
  },
  day: (ms: number, timeZone: string) => day(ms, timeZone),
  dayMonth: (ms: number, timeZone: string) => {
    const d = shortParts(ms, timeZone)
    return `${d.day} ${d.month}`
  },
  dayRange: (startMs: number, endMs: number, timeZone: string, a: DateFields, b: DateFields) => {
    const s = shortParts(startMs, timeZone)
    const e = shortParts(endMs, timeZone)
    const start = a.year === b.year && a.month === b.month ? s.day : `${s.day} ${s.month}`
    return `${start} → ${e.day} ${e.month}`
  },
  daySpoken: (ms: number, timeZone: string) => {
    const parts = dateFormat('es', timeZone, LONG).formatToParts(ms)
    // "viernes, 6 de noviembre" → "viernes 6 de noviembre": only the literal right after the weekday changes.
    return parts.map((p, i) => (p.type === 'literal' && parts[i - 1]?.type === 'weekday' ? ' ' : p.value)).join('')
  },
  stamp: (ms: number, timeZone: string, _p: DateFields, clock: string, zone: string) => `${day(ms, timeZone)} · ${clock}\u00a0${zone}`,
  relative: (ms: number, now: number) => relative(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relative(ms, now, true),
  durationSeconds: (s: number) => `${s}\u00a0s`,
  durationMinutes: (min: number, s: number) => `${min}\u00a0min ${pad2(s)}\u00a0s`,
  durationHours: (h: number, min: number) => `${h}\u00a0h ${pad2(min)}\u00a0min`,
  atSea: (zone: string) => `${zone} · en el mar`,
}
export default time
