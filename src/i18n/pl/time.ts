/**
 * Polish date and time words (see docs/i18n/pl.md §5.5, §6.5), shared by every screen that says when something
 * happened.
 *
 * Why Intl for every word, read from the local fields: months and weekdays come from CLDR through
 * api/_lib/i18n/dates.ts («niedz., 1 lis», «piątek, 6 listopada», the genitive month after a number), never from a
 * hand-made table. They are formatted from `p`, the day the code already computed at the place, set at noon UTC: so a
 * label always names the same day as the row's own fields, whatever zone or fixed offset produced them. The one
 * exception is `dayCompact`, which has room for about 5 characters: there the Polish calendar's two-letter weekdays
 * («nd, pn, wt, śr, cz, pt, sb»), because Intl's narrow form is ambiguous (P/P, S/Ś). Relative times are numeric (an
 * instrument says «30 godz. temu», not «wczoraj»): Intl's short style on screen, its long style for screen readers,
 * and «przed chwilą» under 45 s. A number never parts from its unit (a no-break space). Spans keep the house arrow,
 * never Intl's formatRange. Clocks, zones and the T− countdown stay international.
 */
import type en from '../en/time'
import { formatDate, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import type { DateFields } from '@/ui/results/lib/time'

const pad2 = (n: number) => String(n).padStart(2, '0')

const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const DAY: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
const DAY_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
const SPOKEN: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** The Polish calendar's two-letter weekdays, 0 = Sunday. */
const DOW = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb']

/** A local date (the place's own fields) as Intl words: formatted at noon UTC on that calendar day. */
const words = (p: DateFields, opts: Intl.DateTimeFormatOptions) =>
  formatDate('pl', Date.UTC(p.year, p.month - 1, p.day, 12), 'UTC', opts)

/** A number never parts from its unit: Intl's ordinary space after a digit becomes a no-break space. */
const tie = (s: string) => s.replace(/(\d) /g, '$1\u00a0')

/** «przed chwilą», «12 min temu», «30 godz. temu», «3 dni temu», «za 3 godz.»; spoken: «12 minut temu», «1 godzinę temu». */
function relative(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'przed chwilą'
  return tie(relativeFormat('pl', spoken ? 'long' : 'short').format(r.value, r.unit))
}

const time: typeof en = {
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => words(p, WEEKDAY),
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${DOW[p.dow]}\u00a0${p.day}`,
  day: (_ms: number, _timeZone: string, p: DateFields) => words(p, DAY),
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => words(p, DAY_MONTH),
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) => {
    const start = a.year === b.year && a.month === b.month ? String(a.day) : words(a, DAY_MONTH)
    return `${start} → ${words(b, DAY_MONTH)}`
  },
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => words(p, SPOKEN),
  stamp: (_ms: number, _timeZone: string, p: DateFields, clock: string, zone: string) => `${words(p, DAY)} · ${clock}\u00a0${zone}`,
  relative: (ms: number, now: number) => relative(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relative(ms, now, true),
  durationSeconds: (s: number) => `${s}\u00a0s`,
  durationMinutes: (min: number, s: number) => `${min}\u00a0min ${pad2(s)}\u00a0s`,
  durationHours: (h: number, min: number) => `${h}\u00a0godz. ${pad2(min)}\u00a0min`,
  atSea: (zone: string) => `${zone} · na morzu`,
}
export default time
