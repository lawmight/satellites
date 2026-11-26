/**
 * Vietnamese date and time words (see docs/i18n/vi.md §5.5, §6.2).
 *
 * Why dates are digits built by hand: Vietnamese writes a date day before month in figures (*1/11*, *29/10/2026*), in
 * newspapers, forms and receipts alike, and CLDR's short month (*1 thg 11*) is an abbreviation no Vietnamese writer
 * uses outside a phone's calendar. So nothing here calls Intl for a month: the day and month VALUES come from `p`, the
 * instant's local fields that time.ts computed (the timeline builds them at a fixed offset for speed, so asking Intl
 * for the instant at the zone could name a different day near a DST change). Weekdays are the calendar's two-letter
 * forms (*T2 … T7*, *CN*), which every Vietnamese calendar prints, and CLDR's long names (*Thứ Hai … Chủ Nhật*) for
 * screen readers. A spoken date is spelled out (*ngày 6 tháng 11*): a screen reader reads *6/11* as a fraction.
 *
 * Relative times are written from relativeParts, never with Intl, which prints *sau 3 giờ nữa* ("after", twice):
 * *12 phút trước*, *5 giờ trước*, *3 ngày trước*, *3 giờ nữa*; under 45 s *vừa xong*. Vietnamese does not abbreviate
 * *phút*, *giờ*, *giây*: they are one short syllable each, so compact and spoken forms are the same words.
 */
import type en from '../en/time'
import { relativeParts } from '../../../api/_lib/i18n/dates'
import { fmt } from '../../../api/_lib/i18n/format'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('vi')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** Sunday first, as DateFields.dow counts */
const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const WEEKDAY_LONG = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

/** "29/10" */
const dayMonthVi = (p: DateFields) => `${p.day}/${p.month}`
/** "CN, 1/11": the product's one human date, with the comma Vietnamese puts after a weekday */
const dayVi = (p: DateFields) => `${WEEKDAY_SHORT[p.dow]}, ${dayMonthVi(p)}`

function relativeVi(ms: number, now: number): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'vừa xong'
  const unit = r.unit === 'minute' ? 'phút' : r.unit === 'hour' ? 'giờ' : 'ngày'
  const amount = `${f.int(Math.abs(r.value))} ${unit}`
  return r.value > 0 ? `${amount} nữa` : `${amount} trước`
}

const time: typeof en = {
  /** "CN" */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => WEEKDAY_SHORT[p.dow],
  /** "CN 1": in a run of weekdays the comma is not needed */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${WEEKDAY_SHORT[p.dow]} ${p.day}`,
  /** "CN, 1/11" */
  day: (_ms: number, _timeZone: string, p: DateFields) => dayVi(p),
  /** "29/10" */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => dayMonthVi(p),
  /** "1 → 8/11", "29/10 → 5/11": the month written once when both ends share it, as Vietnamese writes *1–8/11* */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${a.month === b.month && a.year === b.year ? a.day : dayMonthVi(a)} → ${dayMonthVi(b)}`,
  /** "Thứ Sáu, ngày 6 tháng 11": spelled out for screen readers */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => `${WEEKDAY_LONG[p.dow]}, ngày ${p.day} tháng ${p.month}`,
  /** "CN, 1/11 · 11:21 EST" */
  stamp: (_ms: number, _timeZone: string, p: DateFields, clock: string, zone: string) => `${dayVi(p)} · ${clock} ${zone}`,
  relative: (ms: number, now: number) => relativeVi(ms, now),
  relativeSpoken: (ms: number, now: number) => relativeVi(ms, now),
  /** "38 giây" */
  durationSeconds: (s: number) => `${s} giây`,
  /** "4 phút 12 giây" */
  durationMinutes: (min: number, s: number) => `${min} phút ${pad2(s)} giây`,
  /** "1 giờ 02 phút" */
  durationHours: (h: number, min: number) => `${f.int(h)} giờ ${pad2(min)} phút`,
  /** "UTC−9 · trên biển" */
  atSea: (zone: string) => `${zone} · trên biển`,
}
export default time
