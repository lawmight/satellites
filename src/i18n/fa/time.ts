/**
 * Persian date and time words (see docs/i18n/fa.md §5.6, §6.4), shared by every screen that says when something
 * happened: the HUD's scene clock, the pass list, the timeline, the photos, the share sheet.
 *
 * Why it is built this way:
 *  - Every day comes from Intl in CLDR `fa`, always with `calendar: 'gregory'`: Intl's `fa` defaults to the Solar Hijri
 *    calendar, and Watched's years are Gregorian everywhere they cannot be converted (the time-lapse's big year, the
 *    licence lines), so a Jalali day would contradict the year beside it (fa.md §6.4). Months and weekdays are the
 *    Iranian CLDR names as Intl writes them («یکشنبه 1 نوامبر»); Persian has no abbreviated forms, so short and long
 *    are one word, and the compact timeline label is the day's number alone.
 *  - A clock and its zone are one left-to-right island (LRI…PDI) in the stamp: after Persian words the digits would
 *    turn into Arabic numbers for the bidi algorithm and the zone would jump in front («EST 11:21»).
 *  - Relative times are built by hand: Persian has no unit abbreviations, so the compact and spoken forms are the same
 *    words («12 دقیقه پیش», «30 ساعت پیش», «3 روز پیش»), the future is «… دیگر» (Intl's «3 ساعت بعد» reads "3 hours
 *    after"), and under a minute is «همین حالا». A noun after a number stays singular, so no plural table is needed.
 *  - A day's number is glued to its month by a no-break space, so a wrapping headline never strands «2» at a line's
 *    end and «نوامبر» at the next one's start.
 *  - Durations join their parts with «و», unpadded, as Persian says them («4 دقیقه و 12 ثانیه»).
 */
import type en from '../en/time'
import { formatDate, dateFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import { fmt } from '../../../api/_lib/i18n/format'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('fa')
const nb = '\u00a0'

const G = { calendar: 'gregory' } as const
const WEEKDAY: Intl.DateTimeFormatOptions = { ...G, weekday: 'long' }
const DAY: Intl.DateTimeFormatOptions = { ...G, weekday: 'long', day: 'numeric', month: 'long' }
const DAY_MONTH: Intl.DateTimeFormatOptions = { ...G, day: 'numeric', month: 'long' }
const DAY_NUMBER: Intl.DateTimeFormatOptions = { ...G, day: 'numeric' }

const UNIT = { minute: 'دقیقه', hour: 'ساعت', day: 'روز' } as const

/** A day's number never leaves its month at a line break («2 نوامبر» stays whole when a headline wraps) */
const glue = (d: string) => d.replace(/(\d) (?=\D)/g, `$1${nb}`)
/** An Intl date at a zone, its numbers glued to the words after them */
const date = (ms: number, timeZone: string, opts: Intl.DateTimeFormatOptions) => glue(formatDate('fa', ms, timeZone, opts))

/** «12 دقیقه پیش» · «30 ساعت پیش» · «3 روز پیش» · «3 ساعت دیگر» · «همین حالا» */
function relative(ms: number, now: number): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'همین حالا'
  const amount = `${f.int(Math.abs(r.value))}${nb}${UNIT[r.unit]}`
  return r.value < 0 ? `${amount} پیش` : `${amount} دیگر`
}

const time: typeof en = {
  weekdayShort: (ms: number, timeZone: string) => formatDate('fa', ms, timeZone, WEEKDAY),
  dayCompact: (ms: number, timeZone: string) => formatDate('fa', ms, timeZone, DAY_NUMBER),
  day: (ms: number, timeZone: string) => date(ms, timeZone, DAY),
  dayMonth: (ms: number, timeZone: string) => date(ms, timeZone, DAY_MONTH),
  // «1 تا 8 نوامبر», «29 اکتبر تا 5 نوامبر»: the month once when both ends share it. Intl does that only with a year
  // (the landing's «1 تا 8 نوامبر 2026»): CLDR fa has no day–month interval, so formatRange repeats the month
  // («1 نوامبر تا 8 نوامبر»), and the results header and the landing would write the same week two ways.
  dayRange: (startMs: number, endMs: number, timeZone: string, a: DateFields, b: DateFields) =>
    a.year === b.year && a.month === b.month
      ? glue(`${formatDate('fa', startMs, timeZone, DAY_NUMBER)} تا ${formatDate('fa', endMs, timeZone, DAY_MONTH)}`)
      : glue(dateFormat('fa', timeZone, DAY_MONTH).formatRange(startMs, endMs)),
  daySpoken: (ms: number, timeZone: string) => formatDate('fa', ms, timeZone, DAY),
  stamp: (ms: number, timeZone: string, _p: DateFields, clock: string, zone: string) =>
    `${date(ms, timeZone, DAY)} · \u2066${clock}${nb}${zone}\u2069`,
  relative: (ms: number, now: number) => relative(ms, now),
  relativeSpoken: (ms: number, now: number) => relative(ms, now),
  durationSeconds: (s: number) => `${s}${nb}ثانیه`,
  durationMinutes: (min: number, s: number) => (s ? `${min}${nb}دقیقه و ${s}${nb}ثانیه` : `${min}${nb}دقیقه`),
  durationHours: (h: number, min: number) => (min ? `${h}${nb}ساعت و ${min}${nb}دقیقه` : `${h}${nb}ساعت`),
  atSea: (zone: string) => `${zone} · در دریا`,
}
export default time
