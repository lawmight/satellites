/**
 * Persian copy for the share sheet, the post it prefills and the PNG's file name (see docs/i18n/fa.md §3.5).
 *
 * Why it is shaped this way:
 *  - The post is plain text (X, a share sheet, the clipboard): no bidi controls, and every paragraph starts with a
 *    Persian word, so every renderer lays it out right to left. The satellite follows its head noun («ماهوارهٔ X»; a
 *    crewed station «ایستگاه فضایی ISS», recognised by name), and the moment stands between its name and the place,
 *    which comes before the altitude («… به وقت محلی، Waterloo را از ارتفاع 795 کیلومتری رصد کرد»), so two Latin names
 *    never run together and «795 کیلومتری Waterloo» (which would be "795 km from Waterloo") never forms.
 *  - The moment is «روز یکشنبه 1 نوامبر ساعت 11:21 به وقت محلی»: «روز» before a date and «ساعت» before a clock are how
 *    Persian says "on" and "at"; the day is Intl's, Gregorian (fa.md §6.4).
 *  - The verbs are the verdicts' (fa.md §3.6): «رصد کرد», «پوشش داد», «در دیدرس … گذشت», «از فراز … گذشت».
 *  - The credit is «از طریق @handle», the Persian "via", the two tied by a no-break space so the credit never breaks
 *    (X's mention parser accepts one before «@»). The sheet's preview isolates the handle (isolateHandles), so its «@»
 *    stays with the name, as the Arabic credit relies on too.
 *  - Buttons are nouns (mono, about 12 characters on a phone): «کپی پیوند», «ذخیرهٔ PNG», «ارسال در X».
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('fa')
const nb = '\u00a0'

/** Display names of the crewed stations (src/engine/profiles.ts: ISS, Tiangong): no message carries a crewed flag */
const CREWED = /^(ISS|Tiangong)\b/
const theSat = (sat: string) => (CREWED.test(sat) ? `ایستگاه فضایی${nb}${sat}` : `ماهوارهٔ${nb}${sat}`)
/** «795 کیلومتری»: the altitude, adjectival */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}${nb}کیلومتری`
/** «10 متر», «2 کیلومتر»: a pixel in whole metres, or whole km from 1000 m */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)}${nb}کیلومتر` : `${f.int(m)}${nb}متر`)
/** «روز یکشنبه 1 نوامبر ساعت 11:21 به وقت محلی» */
const when = (w: PostWhen) =>
  `روز ${formatDate('fa', w.ms, w.timeZone, { calendar: 'gregory', weekday: 'long', day: 'numeric', month: 'long' })} ساعت ${w.clock} به وقت محلی`

const share: typeof en = {
  // ── The sheet ──
  titlePass: 'اشتراک‌گذاری این گذر',
  titleImage: 'اشتراک‌گذاری این تصویر',
  titleWeek: 'اشتراک‌گذاری خلاصهٔ این هفته',
  close: 'بستن',
  closeTitle: 'بستن (Esc)',

  // ── Buttons ──
  shareImage: 'اشتراک‌گذاری تصویر',
  preparingImage: 'آماده‌سازی تصویر…',
  share: 'اشتراک‌گذاری',
  copyLink: 'کپی پیوند',
  copyLinkDesktop: 'کپی پیوند',
  copied: 'کپی شد',
  postToX: 'ارسال در X',
  copyImage: 'کپی تصویر',
  savePng: 'ذخیرهٔ PNG',
  tryAgain: 'تلاش دوباره',

  // ── The link and the post preview ──
  linkLabel: 'پیوند',
  directLink: 'پیوند مستقیم: فعلاً ساختن پیوند کوتاه ممکن نیست',
  creatingLink: 'ساختن پیوند…',
  linkLater: 'هنگام اشتراک‌گذاری ساخته می‌شود',
  postLabel: 'متن',
  renderFailed: 'کارت در این مرورگر ساخته نشد؛ پیوند همچنان کار می‌کند.',

  // ── The post ──
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${theSat(sat)} ${when(w)}، ${place} را از ارتفاع ${km(altitudeKm)} رصد کرد. ${
        pixelM !== undefined ? `${pixel(pixelM)} در هر پیکسل؛ این همان تصویر واقعی است.` : 'این همان تصویر واقعی است.'
      }`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${theSat(sat)} ${when(w)}، ${place} را از ارتفاع ${km(altitudeKm)} رصد کرد. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${theSat(sat)} ${when(w)}، ${place} را از ارتفاع ${km(altitudeKm)} پوشش داد. نوار تصویربرداری دوربینش آن نقطه را در بر می‌گرفت.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${theSat(sat)} ${when(w)} در دیدرس ${place} گذشت. می‌توانست به این‌جا نگاه کند. اپراتورش نمی‌گوید که نگاه کرد یا نه.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${theSat(sat)} ${when(w)}، در ارتفاع ${km(altitudeKm)} از فراز ${place} گذشت.`,
  },
  hookWatched: 'چیزی این هفته شما را هم رصد کرد.',
  hookPassed: 'این هفته چه چیزی از بالای سر شما گذشت؟',
  credit: (handle: string) => `از طریق${nb}${handle}`,

  // ── File names (ASCII words: they travel through every app and file system) ──
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-week-${day}.png`,
}
export default share
