/**
 * French date and time words (see docs/i18n/fr.md §5.5, §6.3), shared by every screen that says when something
 * happened.
 *
 * Why it is built this way: the words (weekdays, months and their abbreviations with the period, *dim.*, *nov.*,
 * *janv.*) come from CLDR `fr` through dates.ts, never from a hand-made table. The VALUES come from `p`, the instant's
 * local fields that time.ts computed (the timeline builds them at a fixed offset for speed, so asking Intl for the
 * instant at the zone could name another day near a DST change): each word is read off the civil date in `p`, at noon
 * UTC. Readouts keep CLDR's forms as they are (*dim. 1 nov.*); the spoken day writes day 1 as *1er*, which Intl does not
 * (§5.5). The compact timeline day takes the first two letters of CLDR's weekday (*di 1*, *lu 2*), never Intl's narrow
 * letter, where *M* is both Tuesday and Wednesday. Ranges are built by hand with the product's arrow and the month
 * written once (Intl's formatRange would put U+2009 around an en dash). Relative times are numeric, as an instrument
 * says them: *à l’instant*, then CLDR's short style (*il y a 12 min*, *il y a 41 h*, *il y a 3 j*, *dans 3 h*): the
 * compact form only ever stands in a mono meta line, never in a sentence, and the long *il y a 6 jours* ran the pass
 * rows past their box. Screen readers get the long style throughout. A number and
 * its unit never part (U+00A0), and a time never parts from its zone. Clocks, zones and the T− countdown stay
 * international and are never touched.
 */
import type en from '../en/time'
import { dateFormat, formatDate, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import { fmt } from '../../../api/_lib/i18n/format'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('fr')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** The civil date in `p`, as an instant Intl can name in UTC whatever zone it was read at. */
const civil = (p: DateFields) => Date.UTC(p.year, p.month - 1, p.day, 12)

const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const DAY: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
const DAY_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
const SPOKEN: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** "dim." */
const weekdayFr = (p: DateFields) => formatDate('fr', civil(p), 'UTC', WEEKDAY)
/** "dim. 1 nov.": the product's one human date, CLDR's readout form as it is */
const dayFr = (p: DateFields) => formatDate('fr', civil(p), 'UTC', DAY)
/** "29 oct." */
const dayMonthFr = (p: DateFields) => formatDate('fr', civil(p), 'UTC', DAY_MONTH)

/** A number never parts from its unit: Intl's ordinary space after a digit becomes a no-break space. */
const tie = (s: string) => s.replace(/(\d) /g, '$1\u00a0')

/** Compact (meta lines, mono) or spoken (aria): see the module comment. */
function relativeFr(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'à l’instant'
  return tie(relativeFormat('fr', spoken ? 'long' : 'short').format(r.value, r.unit))
}

const time: typeof en = {
  /** "dim." */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => weekdayFr(p),
  /** "di 1", "lu 2" (§6.3): about 5 characters */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${weekdayFr(p).slice(0, 2)} ${p.day}`,
  /** "dim. 1 nov." */
  day: (_ms: number, _timeZone: string, p: DateFields) => dayFr(p),
  /** "29 oct." */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => dayMonthFr(p),
  /** "1 → 8 nov.", "29 oct. → 5 nov.": the month written once when both ends share it */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${a.year === b.year && a.month === b.month ? a.day : dayMonthFr(a)} → ${dayMonthFr(b)}`,
  /** "vendredi 6 novembre", "dimanche 1er novembre" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) =>
    dateFormat('fr', 'UTC', SPOKEN)
      .formatToParts(civil(p))
      .map((part) => (part.type === 'day' && part.value === '1' ? '1er' : part.value))
      .join(''),
  /** "dim. 1 nov. · 11:21 EST": the time and its zone never part */
  stamp: (_ms: number, _timeZone: string, p: DateFields, clock: string, zone: string) => `${dayFr(p)} · ${clock}\u00a0${zone}`,
  relative: (ms: number, now: number) => relativeFr(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relativeFr(ms, now, true),
  /** "38 s" */
  durationSeconds: (s: number) => `${s}\u00a0s`,
  /** "4 min 12 s" */
  durationMinutes: (min: number, s: number) => `${min}\u00a0min ${pad2(s)}\u00a0s`,
  /** "1 h 02 min" */
  durationHours: (h: number, min: number) => `${f.int(h)}\u00a0h ${pad2(min)}\u00a0min`,
  /** "UTC−9 · en mer" */
  atSea: (zone: string) => `${zone} · en mer`,
}
export default time
