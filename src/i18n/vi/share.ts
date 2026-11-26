/**
 * Vietnamese copy for the share sheet and the post it prefills (see src/i18n/en/share.ts; docs/i18n/vi.md §3.6).
 *
 * Why it reads this way: buttons are bare verbs (*Chia sẻ*, *Sao chép liên kết*, *Lưu PNG*), which the sheet fits in
 * one or two rows in any language. "Share this week" is *Chia sẻ tóm tắt tuần này* ("share this week's summary"):
 * *Chia sẻ tuần này* reads "share, this week". The post says a moment the Vietnamese way, the clock first and then
 * the day (*lúc 11:21 giờ địa phương, Chủ Nhật 1/11*), the date in digits, day before month. A satellite *quan sát*,
 * *quét qua* or *bay qua* a place, the verdicts' own verbs (§3.7); "could have pointed here" starts with the place,
 * which Vietnamese allows, because "passed within view of" has no natural verb. A post has no spot on screen, so it
 * refers back to the place with *đó* (*điểm đó*), never *điểm này*. The hooks echo the hero (*cũng có*, "too"; *thứ gì*,
 * "what thing"). File names stay ASCII: *tuan* for *tuần*.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { localParts } from '@/ui/results/lib/time'

const f = fmt('vi')

const WEEKDAY_LONG = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

/** "795 km": whole km, no grouping (an altitude) */
const km = (altitudeKm: number) => `${Math.round(altitudeKm)} km`
/** "10 m", "2 km": a pixel in whole metres or whole km */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)} km` : `${f.int(m)} m`)
/** "lúc 11:21 giờ địa phương, Chủ Nhật 1/11" */
const when = (w: PostWhen) => {
  const p = localParts(w.ms, w.timeZone)
  return `lúc ${w.clock} giờ địa phương, ${WEEKDAY_LONG[p.dow]} ${p.day}/${p.month}`
}

const share: typeof en = {
  // ── The sheet ──
  titlePass: 'Chia sẻ lượt bay này',
  titleImage: 'Chia sẻ ảnh này',
  titleWeek: 'Chia sẻ tóm tắt tuần này',
  close: 'Đóng',
  closeTitle: 'Đóng (Esc)',

  // ── Buttons ──
  shareImage: 'Chia sẻ ảnh',
  preparingImage: 'Đang tạo ảnh…',
  share: 'Chia sẻ',
  copyLink: 'Sao chép liên kết',
  copyLinkDesktop: 'Sao chép liên kết',
  copied: 'Đã sao chép',
  postToX: 'Đăng lên X',
  copyImage: 'Sao chép ảnh',
  savePng: 'Lưu PNG',
  tryAgain: 'Thử lại',

  // ── The link and the post preview ──
  linkLabel: 'Liên kết',
  directLink: 'Liên kết trực tiếp: hiện chưa tạo được liên kết rút gọn',
  creatingLink: 'Đang tạo liên kết…',
  linkLater: 'Tạo khi bạn chia sẻ',
  postLabel: 'Bài đăng',
  /** "here" is this browser (the English comment): say it, since *ở đây* could be the sheet or the screen */
  renderFailed: 'Trình duyệt này không vẽ được thẻ chia sẻ; liên kết vẫn dùng được.',

  // ── The post ──
  post: {
    /** The pixel is a clause of its own (*Mỗi điểm ảnh rộng 10 m*), never the English fragment "10 m per pixel;" */
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${sat} đã quan sát ${place} từ độ cao ${km(altitudeKm)} ${when(w)}. ${
        pixelM !== undefined ? `Mỗi điểm ảnh rộng ${pixel(pixelM)}; đây` : 'Đây'
      } là ảnh thật.`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${sat} đã quan sát ${place} từ độ cao ${km(altitudeKm)} ${when(w)}. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} đã quét qua ${place} từ độ cao ${km(altitudeKm)} ${when(w)}. Dải quét của camera đã phủ điểm đó.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${place} đã nằm trong tầm nhìn của ${sat} ${when(w)}. Vệ tinh này có thể đã hướng về đây. Nhà vận hành không cho biết điều đó có xảy ra hay không.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) => `${sat} đã bay qua ${place} ở độ cao ${km(altitudeKm)} ${when(w)}.`,
  },
  /** *cũng có*: "too" on the event (you as well as the place), never on "something" */
  hookWatched: 'Tuần này, cũng có thứ gì đó quan sát bạn.',
  hookPassed: 'Tuần này, thứ gì đã bay qua trên đầu bạn?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names (lowercase ASCII words and hyphens) ──
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-tuan-${day}.png`,
}

export default share
