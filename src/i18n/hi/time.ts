/**
 * Hindi date and time words (see docs/i18n/hi.md §5.5, §6.5, §6.6), shared by every screen that says when something
 * happened.
 *
 * Why Intl for every word: weekdays and months come from CLDR through api/_lib/i18n/dates.ts («रवि, 1 नवंबर»,
 * «रविवार, 1 नवंबर»), never from a hand-made table. Months are always the full name: Hindi months are short words, and
 * CLDR's abbreviations with the sign ॰ («नव॰») are not how Hindi copy writes a date. Relative times are numeric and in
 * Intl's long style («12 मिनट पहले», «30 घंटे पहले», «3 घंटे में»): the short style's «मि॰», «घं॰» are abbreviations
 * a reader decodes. Durations spell their units too. Ranges keep the arrow the landing's kicker uses. Clocks, zones and
 * the T− countdown stay international and are never touched.
 */
import type en from '../en/time'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat, formatDate, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('hi')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** Hindi counts zero with the plural; Intl files 0 under `one` (docs/i18n/hi.md §5.3) */
const pl = <T,>(n: number, one: T, other: T): T => (n === 0 ? other : f.plural(n, { one, other }))

const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const DAY: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long' }
const DAY_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
const SPOKEN: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** A number never parts from its unit: Intl's ordinary space after a digit becomes a no-break space. */
const tie = (s: string) => s.replace(/(\d) /g, '$1\u00a0')

/** «अभी-अभी», «12 मिनट पहले», «30 घंटे पहले», «3 दिन पहले», «3 घंटे में» (the same words spoken) */
function relative(ms: number, now: number): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'अभी-अभी'
  return tie(relativeFormat('hi', 'long').format(r.value, r.unit))
}

const time: typeof en = {
  weekdayShort: (ms: number, timeZone: string) => formatDate('hi', ms, timeZone, WEEKDAY),
  dayCompact: (ms: number, timeZone: string, p: DateFields) => `${formatDate('hi', ms, timeZone, WEEKDAY)} ${p.day}`,
  day: (ms: number, timeZone: string) => tie(formatDate('hi', ms, timeZone, DAY)),
  dayMonth: (ms: number, timeZone: string) => tie(formatDate('hi', ms, timeZone, DAY_MONTH)),
  dayRange: (startMs: number, endMs: number, timeZone: string, a: DateFields, b: DateFields) => {
    const fm = dateFormat('hi', timeZone, DAY_MONTH)
    const start = a.year === b.year && a.month === b.month ? String(a.day) : tie(fm.format(startMs))
    return `${start} → ${tie(fm.format(endMs))}`
  },
  daySpoken: (ms: number, timeZone: string) => formatDate('hi', ms, timeZone, SPOKEN),
  stamp: (ms: number, timeZone: string, _p: DateFields, clock: string, zone: string) =>
    `${tie(formatDate('hi', ms, timeZone, DAY))} · ${clock}\u00a0${zone}`,
  relative: (ms: number, now: number) => relative(ms, now),
  relativeSpoken: (ms: number, now: number) => relative(ms, now),
  durationSeconds: (s: number) => `${s}\u00a0सेकंड`,
  durationMinutes: (min: number, s: number) => `${min}\u00a0मिनट ${pad2(s)}\u00a0सेकंड`,
  durationHours: (h: number, min: number) => `${h}\u00a0${pl(h, 'घंटा', 'घंटे')} ${pad2(min)}\u00a0मिनट`,
  atSea: (zone: string) => `${zone} · समुद्र में`,
}
export default time
