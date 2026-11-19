/**
 * Arabic date and time words (see docs/i18n/ar.md §3.7 "`time`", §5.4, §5.6, §6.4), shared by every screen that says
 * when something happened.
 *
 * Why it is built this way:
 *  - Weekdays and months come from CLDR through api/_lib/i18n/dates.ts («الأحد، 1 نوفمبر», Gregorian months, Western
 *    digits from the app's `ar-u-nu-latn` tag), never from a hand-made table. Arabic has no short weekday or month, so
 *    every label takes the full word; the timeline's compact label is the day number alone (the narrow letters
 *    «ح ن ث» would clash with «ث» seconds and «س» hours).
 *  - Ranges use «←», the arrow every Arabic range uses, with the month written once when both ends share it.
 *  - Relative times follow dates.ts `relativeParts` (an instrument says «قبل 30 س», not "yesterday evening"). Intl's
 *    short and narrow styles equal its long one in Arabic, so the compact form is built by hand from the unit symbols,
 *    and days take their counted forms. Intl writes the future with «خلال» ("within"), so the future is built with
 *    «بعد» ("in") by hand; the spoken past is Intl's long style as it comes.
 *  - Units follow their number after a no-break space. Clocks, zones and the T− countdown stay international.
 */
import type en from '../en/time'
import { formatDate, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import { fmt } from '../../../api/_lib/i18n/format'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('ar')
const pad2 = (n: number) => String(n).padStart(2, '0')

const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'long' }
const DAY: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }
const DAY_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
const DAY_NUMBER: Intl.DateTimeFormatOptions = { day: 'numeric' }

type Unit = 'minute' | 'hour' | 'day'

/** Counted forms after «قبل» / «بعد» (genitive: the dual ends in ـين), per ar.md §5.4. */
/** `few` is the plural (3–10), `many` the accusative singular (11–99), `other` the genitive singular (100, 200, 0). */
const FORMS: Record<Unit, { one: string; two: string; few: string; many: string; other: string }> = {
  minute: { one: 'دقيقة واحدة', two: 'دقيقتين', few: 'دقائق', many: 'دقيقة', other: 'دقيقة' },
  hour: { one: 'ساعة واحدة', two: 'ساعتين', few: 'ساعات', many: 'ساعة', other: 'ساعة' },
  day: { one: 'يوم واحد', two: 'يومين', few: 'أيام', many: 'يومًا', other: 'يوم' },
}

/** «دقيقتين», «3 ساعات», «11 يومًا», «100 يوم»: a spelled-out amount after a preposition. */
function amount(unit: Unit, n: number): string {
  const w = FORMS[unit]
  const num = f.int(n)
  return f.plural(n, {
    zero: `${num}\u00a0${w.other}`,
    one: w.one,
    two: w.two,
    few: `${num}\u00a0${w.few}`,
    many: `${num}\u00a0${w.many}`,
    other: `${num}\u00a0${w.other}`,
  })
}

/** «قبل 12 د», «قبل 30 س», «قبل يومين», «بعد 3 س»: minutes and hours as symbols, days counted. */
function compact(unit: Unit, n: number): string {
  if (unit === 'minute') return `${f.int(n)}\u00a0د`
  if (unit === 'hour') return `${f.int(n)}\u00a0س`
  return amount('day', n)
}

function relative(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return spoken ? 'قبل لحظات' : 'للتو'
  const n = Math.abs(r.value)
  if (!spoken) return `${r.value < 0 ? 'قبل' : 'بعد'} ${compact(r.unit, n)}`
  if (r.value < 0) return relativeFormat('ar', 'long').format(r.value, r.unit)
  return `بعد ${amount(r.unit, n)}`
}

const time: typeof en = {
  weekdayShort: (ms: number, timeZone: string) => formatDate('ar', ms, timeZone, WEEKDAY),
  dayCompact: (ms: number, timeZone: string) => formatDate('ar', ms, timeZone, DAY_NUMBER),
  day: (ms: number, timeZone: string) => formatDate('ar', ms, timeZone, DAY),
  dayMonth: (ms: number, timeZone: string) => formatDate('ar', ms, timeZone, DAY_MONTH),
  dayRange: (startMs: number, endMs: number, timeZone: string, a: DateFields, b: DateFields) => {
    const sameMonth = a.year === b.year && a.month === b.month
    const start = formatDate('ar', startMs, timeZone, sameMonth ? DAY_NUMBER : DAY_MONTH)
    return `${start} ← ${formatDate('ar', endMs, timeZone, DAY_MONTH)}`
  },
  daySpoken: (ms: number, timeZone: string) => formatDate('ar', ms, timeZone, DAY),
  stamp: (ms: number, timeZone: string, _p: DateFields, clock: string, zone: string) =>
    // The clock and its zone are one left-to-right island (LRI…PDI): after Arabic words «11:21 EST» read «EST 11:21».
    `${formatDate('ar', ms, timeZone, DAY)} · \u2066${clock}\u00a0${zone}\u2069`,
  relative: (ms: number, now: number) => relative(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relative(ms, now, true),
  durationSeconds: (s: number) => `${s}\u00a0ث`,
  durationMinutes: (min: number, s: number) => `${min}\u00a0د ${pad2(s)}\u00a0ث`,
  durationHours: (h: number, min: number) => `${h}\u00a0س ${pad2(min)}\u00a0د`,
  atSea: (zone: string) => `${zone} · في البحر`,
}
export default time
