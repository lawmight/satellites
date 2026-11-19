/**
 * Simplified Chinese copy for the share sheet, the post it prefills and the PNG's file name (see docs/i18n/zh-Hans.md
 * §3.6). The card and the share page speak from api/_lib/i18n/card/zh-Hans.ts.
 *
 * Why the post reads this way: Chinese puts when before what, so each first paragraph opens on the moment
 * ("当地时间11月1日（周日）11:21，"): the English says "local" with no zone after the clock, which is the one place
 * 当地时间 is right. 注视了 (not 注视过) because the moment is named. The day is hand-built at the place's zone
 * (zhDayProse, the card catalog's), and names are placed through cjkGap, so "Sentinel-2C 从 786 km 高空注视了
 * Waterloo。" and "…注视了北京。" are both spaced as Chinese writes them. X counts a Han character twice (links.ts
 * xLength): besides the names, each first paragraph is 25–55 Han, so the hook and the credit fit unless the place name
 * is very long (then the code drops the hook first). File names stay lowercase ASCII, as in English.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { withName, zhDayProse } from '../../../api/_lib/i18n/card/zh-Hans'

/** "786 km": the satellite's altitude (whole km, no grouping, as English) */
const km = (altitudeKm: number) => `${Math.round(altitudeKm)} km`
/** "10 m", "2 km": a pixel's size, in whole metres or whole km from 1,000 m */
const pixel = (m: number) => (m >= 1000 ? `${Math.round(m / 1000)} km` : `${Math.round(m)} m`)
/** "当地时间11月1日（周日）11:21，": the moment that opens the post */
const when = (w: PostWhen) => `当地时间${zhDayProse(w.ms, w.timeZone)}${w.clock}，`

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: '分享这次过境',
  titleImage: '分享这张图像',
  titleWeek: '分享这一周',
  close: '关闭',
  closeTitle: '关闭（Esc）',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: '分享图像',
  preparingImage: '正在准备图像…',
  share: '分享',
  copyLink: '复制链接',
  copied: '已复制',
  postToX: '发布到 X',
  copyImage: '复制图像',
  savePng: '保存 PNG',
  tryAgain: '重试',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: '链接',
  directLink: '直接链接：暂时无法生成短链接',
  creatingLink: '正在生成链接…',
  linkLater: '分享时生成',
  postLabel: '配文',
  renderFailed: '这里无法生成卡片；链接仍然有效。',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${when(w)}${withName(withName('', sat, `从 ${km(altitudeKm)} 高空注视了`), place, '。')}${pixelM !== undefined ? `每像素 ${pixel(pixelM)}；` : ''}这是真实的图像。`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${when(w)}${withName(withName('', sat, `从 ${km(altitudeKm)} 高空注视了`), place, '。')}${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${when(w)}${withName(withName('', sat, `从 ${km(altitudeKm)} 高空扫过`), place, '。')}它的成像带覆盖了这里。`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${when(w)}${withName('', sat, '经过时，')}${withName('', place, '在它的可视范围内。')}它能对准这里。运营方不公开它是否真的对准过。`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${when(w)}${withName(withName('', sat, '从'), place, `上空 ${km(altitudeKm)} 处经过。`)}`,
  },
  hookWatched: '这一周，也有东西注视过你。',
  hookPassed: '这一周，有什么从你头顶经过？',
  /** The handle line is the same in every language */
  credit: (handle: string) => `via ${handle}`,

  // ── File names (lowercase ASCII, as English) ─────────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-week-${day}.png`,
}

export default share
