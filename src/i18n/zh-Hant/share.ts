/**
 * Traditional Chinese copy for the share sheet, the post it prefills and the PNG's file name (see docs/i18n/zh-Hant.md
 * §3.5, Appendix A). The card and the share page speak from api/_lib/i18n/card/zh-Hant.ts.
 *
 * Why the post reads this way: Chinese puts when and where before what, so each first paragraph is "[SAT] 於當地時間
 * [DAY][CLOCK] 從 … 高空注視了 [PLACE]。": the English clock has no zone ("at 11:21 local"), which is the one place
 * 當地時間 is right. 注視了 (not 注視過) because the moment is named: the only place the product says it. The day is
 * hand-built at the place's zone (zhDayProse, the card catalog's), and names are placed through cjkGap, so
 * "Sentinel-2C 於…注視了 Waterloo。" and "…注視了九龍。" are both spaced as Chinese writes them; names keep plain
 * spaces here (post text travels). X counts a Han character twice (links.ts xLength): besides the names, each first
 * paragraph is about 25 to 45 Han, so the hook and the credit fit unless the place name is very long (then the code
 * drops the hook first). Images are 圖片 here only where they mean the card's PNG. File names stay lowercase ASCII.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { withName, zhDayProse } from '../../../api/_lib/i18n/card/zh-Hant'

const f = fmt('zh-Hant')

/** "786 km": the satellite's altitude (whole km) */
const km = (altitudeKm: number) => `${f.int(Math.round(altitudeKm))} km`
/** "10 m", "2 km": a pixel's size, in whole metres or whole km from 1,000 m */
const pixel = (m: number) => (m >= 1000 ? `${f.int(Math.round(m / 1000))} km` : `${f.int(Math.round(m))} m`)
/** "於當地時間 11月1日（週日）11:21": the moment, before the verb */
const when = (w: PostWhen) => `於當地時間 ${zhDayProse(w.ms, w.timeZone)}${w.clock}`
/** The satellite, then the rest of the clause it leads, spaced through cjkGap */
const lead = (sat: string, rest: string) => withName('', sat, rest)

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: '分享這次過境',
  titleImage: '分享這張影像',
  titleWeek: '分享這星期的結果',
  close: '關閉',
  closeTitle: '關閉（Esc）',

  // ── Buttons (the card's PNG is a 圖片, a graphic file) ─────────────────────────────────────────────────────────────
  shareImage: '分享圖片',
  preparingImage: '正在準備圖片…',
  share: '分享',
  copyLink: '複製連結',
  copyLinkDesktop: '複製連結',
  copied: '已複製',
  postToX: '發佈到 X',
  copyImage: '複製圖片',
  savePng: '儲存 PNG',
  tryAgain: '再試一次',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: '連結',
  directLink: '直接連結：暫時無法建立短連結',
  creatingLink: '正在建立連結…',
  linkLater: '分享時才會建立',
  postLabel: '貼文',
  renderFailed: '這裡無法產生卡片，但連結仍然有效。',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${withName(lead(sat, `${when(w)} 從 ${km(altitudeKm)} 高空注視了`), place, '。')}${pixelM !== undefined ? `每像素 ${pixel(pixelM)}，` : ''}這是真實的影像。`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${withName(lead(sat, `${when(w)} 從 ${km(altitudeKm)} 高空注視了`), place, '。')}${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${withName(lead(sat, `${when(w)} 從 ${km(altitudeKm)} 高空掃過`), place, '，這個地點在它的掃描帶內。')}`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${withName(lead(sat, `${when(w)} 經過，`), place, '在它的可視範圍內。')}它可能對準過這裡，但營運商不會透露。`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${withName(lead(sat, `${when(w)} 從`), place, `上空 ${km(altitudeKm)} 處經過。`)}`,
  },
  hookWatched: '這星期，也有東西注視過你。',
  hookPassed: '這星期，有什麼從你頭上飛過？',
  /** "via" reads on X in both regions; the handle is never translated */
  credit: (handle: string) => `via ${handle}`,

  // ── File names (lowercase ASCII, as English) ─────────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-week-${day}.png`,
}

export default share
