/**
 * Russian date and time words (see docs/i18n/ru.md §5.5, §6.5, §6.6), shared by every screen that says when something
 * happened.
 *
 * Why it is built this way: months and weekdays come from CLDR through api/_lib/i18n/dates.ts («вс, 1 нояб.»,
 * «пятница, 6 ноября», genitive months), never from a hand-made table. Relative times are numeric (an instrument says
 * «30 ч назад», not «вчера»). Minutes and hours are written here with the GOST unit symbols («12 мин назад», «30 ч
 * назад», «через 3 ч»), because Intl's short style prints «мин.» with a period and «ч» without one in the same list;
 * days and every spoken form are Intl's long style («3 дня назад», «41 час назад»), which declines the noun. Ranges keep
 * the arrow the landing's kicker uses. Clocks, zones and the T− countdown stay international and are never touched.
 */
import type en from '../en/time'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat, formatDate, relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('ru')
const pad2 = (n: number) => String(n).padStart(2, '0')

const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const DAY: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
const DAY_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
const SPOKEN: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** A number never parts from its unit: Intl's ordinary space after a digit becomes a no-break space. */
const tie = (s: string) => s.replace(/(\d) /g, '$1\u00a0')

/** «только что», «12 мин назад», «30 ч назад», «3 дня назад», «через 3 ч»; spoken: «12 минут назад», «41 час назад». */
function relative(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'только что'
  if (spoken || r.unit === 'day') return tie(relativeFormat('ru', 'long').format(r.value, r.unit))
  const n = `${f.int(Math.abs(r.value))}\u00a0${r.unit === 'minute' ? 'мин' : 'ч'}`
  return r.value < 0 ? `${n} назад` : `через ${n}`
}

const time: typeof en = {
  weekdayShort: (ms: number, timeZone: string) => formatDate('ru', ms, timeZone, WEEKDAY),
  dayCompact: (ms: number, timeZone: string, p: DateFields) => `${formatDate('ru', ms, timeZone, WEEKDAY)} ${p.day}`,
  day: (ms: number, timeZone: string) => tie(formatDate('ru', ms, timeZone, DAY)),
  dayMonth: (ms: number, timeZone: string) => tie(formatDate('ru', ms, timeZone, DAY_MONTH)),
  dayRange: (startMs: number, endMs: number, timeZone: string, a: DateFields, b: DateFields) => {
    const d = dateFormat('ru', timeZone, DAY_MONTH)
    const start = a.year === b.year && a.month === b.month ? String(a.day) : tie(d.format(startMs))
    return `${start} → ${tie(d.format(endMs))}`
  },
  daySpoken: (ms: number, timeZone: string) => formatDate('ru', ms, timeZone, SPOKEN),
  stamp: (ms: number, timeZone: string, _p: DateFields, clock: string, zone: string) =>
    `${tie(formatDate('ru', ms, timeZone, DAY))} · ${clock}\u00a0${zone}`,
  relative: (ms: number, now: number) => relative(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relative(ms, now, true),
  durationSeconds: (s: number) => `${s}\u00a0с`,
  durationMinutes: (min: number, s: number) => `${min}\u00a0мин ${pad2(s)}\u00a0с`,
  durationHours: (h: number, min: number) => `${h}\u00a0ч ${pad2(min)}\u00a0мин`,
  atSea: (zone: string) => `${zone} · в море`,
}
export default time
