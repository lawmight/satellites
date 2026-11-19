/**
 * Korean date and time words (see docs/i18n/ko.md §5.6, §6.3), shared by every screen that says when something
 * happened: the HUD's scene clock, the results (pass list, timeline, photos, headers), the share sheet.
 *
 * Why these forms: the `day` slot is read aloud in aria labels too, and Korean speech engines read a bare "11.1" as a
 * decimal, so the product's one human date is written in words with the weekday in attached parentheses, 11월 1일(일).
 * Intl's ko output is not that ("11월 1일 (일)" with a space, "2026. 11. 1." for numbers, formatRange with ~), so the
 * forms are built from the local fields `p`, which costs nothing and agrees to the letter with the timeline's
 * fixed-offset path. Months and days are numbers in Korean, so no month table exists; the weekday is its one syllable
 * (일 … 토), and standing alone it is the full 일요일, because a lone 일 reads as "day". Ranges use → (the product's
 * mono spans), the month written once when both ends share it. Relative times follow dates.ts `relativeParts` (hours up
 * to 48, never 어제) through Intl with `numeric: 'always'` (12분 전, 41시간 전, 3시간 후; 'auto' would say 그저께);
 * under 45 s is 방금. Durations are words with no zero padding (4분 5초). Clocks, zones and the T− countdown stay
 * international and are never touched.
 */
import type en from '../en/time'
import { fmt } from '../../../api/_lib/i18n/format'
import { relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('ko')

/** 0 = Sunday */
const WEEKDAY = '일월화수목금토'
const wd = (p: DateFields) => WEEKDAY[p.dow]

/** "11월 1일": month and day, unpadded. */
const md = (p: DateFields) => `${p.month}월 ${p.day}일`
/** "11월 1일(일)": the one human date (rows, captions, the HUD's scene clock). */
const dayKo = (p: DateFields) => `${md(p)}(${wd(p)})`

/** "방금", "12분 전", "41시간 전", "2일 전", "3시간 후"; ko's long style reads the same, so the spoken form is too. */
function relative(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return '방금'
  return relativeFormat('ko', spoken ? 'long' : 'short', 'always').format(r.value, r.unit)
}

const time: typeof en = {
  /** "일요일" */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => `${wd(p)}요일`,
  /** "1(일)": the timeline's mid-width label (48–92 px). */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${p.day}(${wd(p)})`,
  day: (_ms: number, _timeZone: string, p: DateFields) => dayKo(p),
  /** "10월 29일" */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => md(p),
  /** "11월 1일 → 8일", "10월 29일 → 11월 5일" */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${md(a)} → ${a.month === b.month && a.year === b.year ? `${b.day}일` : md(b)}`,
  /** "11월 6일 금요일" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => `${md(p)} ${wd(p)}요일`,
  /** "11월 1일(일) · 11:21 EST" */
  stamp: (_ms: number, _timeZone: string, p: DateFields, time: string, zone: string) => `${dayKo(p)} · ${time} ${zone}`,
  relative: (ms: number, now: number) => relative(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relative(ms, now, true),
  /** "38초" */
  durationSeconds: (s: number) => `${f.int(s)}초`,
  /** "4분 12초", "4분 5초" (no zero padding in words) */
  durationMinutes: (min: number, s: number) => `${f.int(min)}분 ${f.int(s)}초`,
  /** "1시간 2분" */
  durationHours: (h: number, min: number) => `${f.int(h)}시간 ${f.int(min)}분`,
  /** "UTC−9 · 해상" */
  atSea: (zone: string) => `${zone} · 해상`,
}
export default time
