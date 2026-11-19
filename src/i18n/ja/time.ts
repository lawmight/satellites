/**
 * Japanese date and time words (see docs/i18n/ja.md §5.5, §6.3), shared by every screen that says when something
 * happened: the HUD's replay clock, the results (pass list, timeline, photos, headers), the share sheet.
 *
 * Why these forms: on screen a date is a mono readout, and Japanese readouts write it numerically with the weekday in
 * half-width parentheses, 11/1(日): exactly what Intl gives for `{ month: 'numeric', day: 'numeric', weekday: 'short' }`.
 * It is built here from the local fields `p` instead, which costs nothing and agrees with them to the letter on the
 * timeline's fixed-offset path, where `p` comes from an offset rather than from the zone. Days and months are never
 * padded; clocks and durations are (4分05秒). The weekday alone is 日曜, because 日 alone reads as "day". Ranges are written
 * by hand with →, never formatRange (it emits ～). Relative times follow dates.ts `relativeParts` (hours up to 48,
 * never 昨日) in Intl's narrow style with `numeric: 'always'` (12分前, no space; 'short' and 'long' print 12 分前, and
 * 'auto' turns one day into 昨日); under 45 s is たった今. Clocks, zones and the T− countdown are never touched.
 */
import type en from '../en/time'
import { fmt } from '../../../api/_lib/i18n/format'
import { relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('ja')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** 0 = Sunday */
const WEEKDAY = '日月火水木金土'
const wd = (p: DateFields) => WEEKDAY[p.dow]

/** "11/1": month and day, unpadded. */
const md = (p: DateFields) => `${p.month}/${p.day}`
/** "11/1(日)": the one human date (rows, captions, the HUD's replay clock). */
const dayJa = (p: DateFields) => `${md(p)}(${wd(p)})`

/** "たった今", "12分前", "41時間前", "2日前", "3時間後"; spoken in the long style (for a screen reader the space is moot). */
function relative(ms: number, now: number, spoken: boolean): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return 'たった今'
  return relativeFormat('ja', spoken ? 'long' : 'narrow', 'always').format(r.value, r.unit)
}

const time: typeof en = {
  /** "日曜" */
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => `${wd(p)}曜`,
  /** "1(日)": the timeline's mid-width label (48–92 px). */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${p.day}(${wd(p)})`,
  day: (_ms: number, _timeZone: string, p: DateFields) => dayJa(p),
  /** "10/29" */
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => md(p),
  /** "10/29 → 11/5", and "11/1 → 11/8" in one month: a bare "→ 8" would read as a number, not a day. */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) => `${md(a)} → ${md(b)}`,
  /** "11月6日金曜日" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => `${p.month}月${p.day}日${wd(p)}曜日`,
  /** "11/1(日) · 11:21 EST" */
  stamp: (_ms: number, _timeZone: string, p: DateFields, time: string, zone: string) => `${dayJa(p)} · ${time} ${zone}`,
  relative: (ms: number, now: number) => relative(ms, now, false),
  relativeSpoken: (ms: number, now: number) => relative(ms, now, true),
  /** "38秒" */
  durationSeconds: (s: number) => `${f.int(s)}秒`,
  /** "4分05秒" (seconds zero-padded, as in English) */
  durationMinutes: (min: number, s: number) => `${f.int(min)}分${pad2(s)}秒`,
  /** "1時間02分" */
  durationHours: (h: number, min: number) => `${f.int(h)}時間${pad2(min)}分`,
  /** "UTC−9 · 洋上" */
  atSea: (zone: string) => `${zone} · 洋上`,
}
export default time
