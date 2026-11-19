/**
 * Ukrainian date and time words (see docs/i18n/uk.md §5.5, §6.5, §6.6), shared by every screen that says when
 * something happened.
 *
 * Why Intl for every word: months and weekdays come from CLDR through api/_lib/i18n/dates.ts («нд, 1 лист.»,
 * «п’ятниця, 6 листопада», genitive months, ’ U+02BC), never from a hand-made table. Relative times are numeric (an
 * instrument says «30 год тому», not «учора»): short style for minutes and hours, long for days («2 дні тому», since
 * the short «2 дн. тому» is not how a sentence says it), long throughout for screen readers. Ranges keep the arrow the
 * landing's kicker uses. Clocks, zones and the T− countdown stay international and are never touched.
 */
import type en from '../en/time'
import { dateFormat, formatDate, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import type { DateFields } from '@/ui/results/lib/time'

const pad2 = (n: number) => String(n).padStart(2, '0')

const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const DAY: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
const DAY_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
const SPOKEN: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** A number never parts from its unit: Intl's ordinary space after a digit becomes a no-break space. */
const tie = (s: string) => s.replace(/(\d) /g, '$1\u00a0')

/** «щойно», «12 хв тому», «30 год тому», «3 дні тому», «через 3 год»; spoken: «12 хвилин тому», «41 годину тому». */
function relative(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'щойно'
  return tie(relativeFormat('uk', spoken || r.unit === 'day' ? 'long' : 'short').format(r.value, r.unit))
}

const time: typeof en = {
  weekdayShort: (ms: number, timeZone: string) => formatDate('uk', ms, timeZone, WEEKDAY),
  dayCompact: (ms: number, timeZone: string, p: DateFields) => `${formatDate('uk', ms, timeZone, WEEKDAY)} ${p.day}`,
  day: (ms: number, timeZone: string) => formatDate('uk', ms, timeZone, DAY),
  dayMonth: (ms: number, timeZone: string) => formatDate('uk', ms, timeZone, DAY_MONTH),
  dayRange: (startMs: number, endMs: number, timeZone: string, a: DateFields, b: DateFields) => {
    const f = dateFormat('uk', timeZone, DAY_MONTH)
    const start = a.year === b.year && a.month === b.month ? String(a.day) : f.format(startMs)
    return `${start} → ${f.format(endMs)}`
  },
  daySpoken: (ms: number, timeZone: string) => formatDate('uk', ms, timeZone, SPOKEN),
  stamp: (ms: number, timeZone: string, _p: DateFields, clock: string, zone: string) =>
    `${formatDate('uk', ms, timeZone, DAY)} · ${clock}\u00a0${zone}`,
  relative: (ms: number, now: number) => relative(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relative(ms, now, true),
  durationSeconds: (s: number) => `${s}\u00a0с`,
  durationMinutes: (min: number, s: number) => `${min}\u00a0хв ${pad2(s)}\u00a0с`,
  durationHours: (h: number, min: number) => `${h}\u00a0год ${pad2(min)}\u00a0хв`,
  atSea: (zone: string) => `${zone} · у морі`,
}
export default time
