/**
 * Traditional Chinese date and time words (see docs/i18n/zh-Hant.md §5.5, §6.2, §6.4, §6.5), shared by every screen
 * that says when something happened.
 *
 * Why dates are built from the fields `p` and not by Intl: with `month: 'numeric'` Taiwan prints `11/1（週日）` and Hong
 * Kong `1/11（週日）`, the same string for two different days, and `formatRange` falls back to numeric patterns for
 * every option set. So every date here is a Han token built from the numbers (`11月1日 週日`), never zero-padded and
 * never spaced inside; weekdays are 週X, and 星期X only when spoken. Relative times follow the house rule in dates.ts
 * `relativeParts` (hours up to 48, never 昨天 / 前天) and take their words from Intl with `numeric: 'always'`
 * (`12 分鐘前`, `3 小時後`), which also gives Hong Kong `2 日前` once its Intl tag is passed (Appendix B.1); 剛剛 comes
 * from here. Durations are mono readouts, so they keep the English zero padding (`4 分 12 秒`, `1 小時 02 分`). Clocks,
 * zones and the T− countdown stay international and never pass through here.
 */
import type en from '../en/time'
import { fmt } from '../../../api/_lib/i18n/format'
import { relativeFormat, relativeParts } from '../../../api/_lib/i18n/dates'
import type { DateFields } from '@/ui/results/lib/time'

const f = fmt('zh-Hant')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** 0 = Sunday: 日, 一 … 六 */
const WEEKDAY = '日一二三四五六'
const wd = (p: DateFields) => WEEKDAY[p.dow]

/** "11月1日 週日": the one human date (rows, captions, the HUD's scene clock). */
const dayZh = (p: DateFields) => `${p.month}月${p.day}日 週${wd(p)}`

/** "剛剛", "12 分鐘前", "41 小時前", "2 天前", "3 小時後": one wording for the screen and for screen readers. */
function relative(ms: number, now: number): string {
  const r = relativeParts(ms, now)
  return r.unit === 'second' ? '剛剛' : relativeFormat('zh-Hant', 'short', 'always').format(r.value, r.unit)
}

const time: typeof en = {
  weekdayShort: (_ms: number, _timeZone: string, p: DateFields) => `週${wd(p)}`,
  /** "1日": the timeline's mid-width label (48–92 px). */
  dayCompact: (_ms: number, _timeZone: string, p: DateFields) => `${p.day}日`,
  day: (_ms: number, _timeZone: string, p: DateFields) => dayZh(p),
  dayMonth: (_ms: number, _timeZone: string, p: DateFields) => `${p.month}月${p.day}日`,
  /** "11月1日 → 8日" in one month, "10月29日 → 11月5日" across two, "2026年12月29日 → 2027年1月5日" across a new year. */
  dayRange: (_startMs: number, _endMs: number, _timeZone: string, a: DateFields, b: DateFields) =>
    a.year !== b.year
      ? `${a.year}年${a.month}月${a.day}日 → ${b.year}年${b.month}月${b.day}日`
      : a.month !== b.month
        ? `${a.month}月${a.day}日 → ${b.month}月${b.day}日`
        : `${a.month}月${a.day}日 → ${b.day}日`,
  /** "11月6日星期五" */
  daySpoken: (_ms: number, _timeZone: string, p: DateFields) => `${p.month}月${p.day}日星期${wd(p)}`,
  /** "11月1日 週日 · 11:21 EST" */
  stamp: (_ms: number, _timeZone: string, p: DateFields, time: string, zone: string) => `${dayZh(p)} · ${time} ${zone}`,
  relative: (ms: number, now: number) => relative(ms, now),
  relativeSpoken: (ms: number, now: number) => relative(ms, now),
  /** "38 秒" */
  durationSeconds: (s: number) => `${f.int(s)} 秒`,
  /** "4 分 12 秒" (seconds zero-padded, as in English) */
  durationMinutes: (min: number, s: number) => `${f.int(min)} 分 ${pad2(s)} 秒`,
  /** "1 小時 02 分" (minutes zero-padded) */
  durationHours: (h: number, min: number) => `${f.int(h)} 小時 ${pad2(min)} 分`,
  /** "UTC−9 · 海上" */
  atSea: (zone: string) => `${zone} · 海上`,
}
export default time
