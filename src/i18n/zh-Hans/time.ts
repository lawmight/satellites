/**
 * Simplified Chinese date and time words (see docs/i18n/zh-Hans.md §5.5, §6.2, §6.4, §6.5), shared by every screen
 * that says when something happened.
 *
 * Why by hand and not Intl: Intl's zh output is not the house style (`11/1周日`, `11/1 – 11/8`, `12分钟前` with no
 * space; verified against ICU 78 / CLDR 48), and building the forms from the date fields `p` costs nothing. A Han date
 * token (`11月1日`, `周日`) is never padded and never spaced inside; a count and its Han unit are tied with U+00A0
 * (`30 小时前`, `4 分 12 秒`). Weekdays are 周X in compact forms and 星期X only when spoken. Relative times follow the
 * house rule in dates.ts `relativeParts` (hours up to 48, never 昨天). Clocks, zones and the T− countdown stay
 * international and are never touched.
 */
import type en from '../en/time'
import { fmt } from '../../../api/_lib/i18n/format'
import { relativeParts } from '../../../api/_lib/i18n/dates'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('zh-Hans')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** 0 = Sunday: 日, 一 … 六 */
const WEEKDAY = '日一二三四五六'
const wd = (p: DateFields) => WEEKDAY[p.dow]

/** "11月1日 周日": the one human date (rows, captions, the HUD's scene clock). */
const dayZh = (p: DateFields) => `${p.month}月${p.day}日 周${wd(p)}`

/** "刚刚", "12 分钟前", "30 小时前", "3 天前", "3 小时后". Chinese has no shorter spoken form: one wording for both. */
function relative(ms: number, now: number): string {
  const r = relativeParts(ms, now)
  if (r.unit === 'second') return '刚刚'
  const unit = r.unit === 'minute' ? '分钟' : r.unit === 'hour' ? '小时' : '天'
  return `${f.int(Math.abs(r.value))}\u00a0${unit}${r.value < 0 ? '前' : '后'}`
}

const time: typeof en = {
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => `周${wd(p)}`,
  /** "1日": the timeline's mid-width label (48–92 px). */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${p.day}日`,
  day: (_ms: number, _timeZone: string, p: DateFields) => dayZh(p),
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => `${p.month}月${p.day}日`,
  /** "11月1日 → 8日" in one month, "10月29日 → 11月5日" across two. */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    `${a.month}月${a.day}日 → ${a.month === b.month && a.year === b.year ? '' : `${b.month}月`}${b.day}日`,
  /** "11月6日星期五" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => `${p.month}月${p.day}日星期${wd(p)}`,
  /** "11月1日 周日 · 11:21 EST" */
  stamp: (_ms: number, _timeZone: string, p: DateFields, time: string, zone: string) => `${dayZh(p)} · ${time} ${zone}`,
  relative: (ms: number, now: number) => relative(ms, now),
  relativeSpoken: (ms: number, now: number) => relative(ms, now),
  /** "38 秒" */
  durationSeconds: (s: number) => `${f.int(s)}\u00a0秒`,
  /** "4 分 12 秒" (seconds zero-padded, as in English) */
  durationMinutes: (min: number, s: number) => `${f.int(min)}\u00a0分 ${pad2(s)}\u00a0秒`,
  /** "1 小时 02 分" */
  durationHours: (h: number, min: number) => `${f.int(h)}\u00a0小时 ${pad2(min)}\u00a0分`,
  /** "UTC−9 · 海上" */
  atSea: (zone: string) => `${zone} · 海上`,
}
export default time
