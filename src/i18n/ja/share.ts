/**
 * Japanese copy for the share sheet, the post it prefills and the PNG's file name (see docs/i18n/ja.md §3.6). The card
 * and the share page speak from api/_lib/i18n/card/ja.ts.
 *
 * Why the post reads this way: the satellite is the paragraph's topic (は), and the moment follows it straight away,
 * large to small: "Sentinel-2Cは11月1日（日）現地時間11:21、" (the English says "local" with no zone, which is exactly
 * 現地時間). The day is hand-built at the place's zone with full-width parentheses (jaDayProse, the card catalog's).
 * Particles attach straight to any name, so no frame needs a space or an inflection. X counts a Japanese character
 * twice (links.ts xLength): each first paragraph is 29–63 glyphs besides the names, inside the guide's budget of 90,
 * and the code drops the hook first when a place name is very long. Buttons are nouns or dictionary forms of at most
 * eight glyphs (three share a 360 px phone); the two field labels fit their 48 px column in three. File names stay
 * lowercase ASCII, as in English.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { jaDayProse } from '../../../api/_lib/i18n/card/ja'

const f = fmt('ja')

/** "795 km": the satellite's altitude, in whole km (a no-break space: the post never breaks a number from its unit) */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}\u00a0km`
/** "10 m", "2 km": a pixel's size, in whole metres or whole km from 1,000 m */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)}\u00a0km` : `${f.int(m)}\u00a0m`)
/** "1ピクセル10 m。", or nothing when the pixel size is unknown */
const perPixel = (m?: number) => (m !== undefined ? `1ピクセル${pixel(m)}。` : '')
/** "11月1日（日）現地時間11:21": the moment, right after the topic */
const when = (w: PostWhen) => `${jaDayProse(w.ms, w.timeZone)}現地時間${w.clock}`

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'この通過を共有',
  titleImage: 'この画像を共有',
  titleWeek: 'この1週間を共有',
  close: '閉じる',
  closeTitle: '閉じる(Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: '画像を共有',
  preparingImage: '画像を準備中…',
  share: '共有',
  copyLink: 'リンクをコピー',
  copyLinkDesktop: 'リンクをコピー',
  copied: 'コピー済み',
  postToX: 'Xに投稿',
  copyImage: '画像をコピー',
  savePng: 'PNGを保存',
  tryAgain: '再試行',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'リンク',
  directLink: '直接リンク：短縮リンクをいま作れなかった',
  creatingLink: 'リンクを作成中…',
  linkLater: '共有時に作成',
  postLabel: '投稿文',
  renderFailed: 'このブラウザではカードを描画できなかった。リンクは使える。',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${sat}は${when(w)}、高度${km(altitudeKm)}から${place}を見ていた。${perPixel(pixelM)}これが実際の画像。`,
    /** `cloud` is the card's own sentence (雲しか見えなかった。 and the like) */
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${sat}は${when(w)}、高度${km(altitudeKm)}から${place}を見ていた。${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat}は${when(w)}、高度${km(altitudeKm)}で${place}の上空を通った。カメラの観測幅がこの地点を覆った。`,
    /** Three sentences, as the English: the window, the possibility, what the operator does not say */
    could: (sat: string, place: string, w: PostWhen) =>
      `${sat}は${when(w)}、${place}が見える範囲を通った。ここにカメラを向けることもできた。向けたかどうか、運用者は明かしていない。`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat}は${when(w)}、高度${km(altitudeKm)}で${place}の上空を通った。`,
  },
  /** The hero's words and order, with も for "too", so the post echoes the landing */
  hookWatched: '今週、何かがあなたも見ていた。',
  /** 頭上 is the idiom for "over you" (あなたの上 would step over the reader) */
  hookPassed: '今週、あなたの頭上を通ったのは？',
  credit: (handle: string) => `via ${handle}`,

  // ── File names (lowercase ASCII, as English) ──────────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-week-${day}.png`,
}

export default share
