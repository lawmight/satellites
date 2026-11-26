/**
 * Hindi copy for the share sheet, the post text it prefills and the words in the PNG's file name (see docs/i18n/hi.md
 * §3.6, §7). The card itself and the share page speak from the 'card' namespace (api/_lib/i18n/card/hi.ts).
 *
 * Why it is written this way:
 *  - Buttons are the polite imperative with their object («लिंक कॉपी करें», «X पर पोस्ट करें»), the form Hindi
 *    interfaces use, which has no gender; states are short clauses agreeing with our own nouns («लिंक बन रहा है…»,
 *    «तस्वीर बन रही है…»).
 *  - The post is prose a Hindi reader would post: the day takes «को», the time is «स्थानीय समयानुसार 11:21 पर» (the
 *    news idiom), «मीटर» is spelled and «किमी» kept as the papers print it. "Watched" is «ने … को देखा», so neither
 *    the satellite nor the place is ever agreed with; the place is always followed by a postposition («Waterloo के 795
 *    किमी ऊपर से», one phrase, not three postpositions in a row). The swath is «यह जगह उसके कैमरे की पट्टी के भीतर
 *    थी» (our noun as the subject), and "within view" says the place was in its reach, the could verdict's word. It is
 *    the camera that could have turned («उसका कैमरा इधर मुड़ सकता था»): «वह मुड़ सकता था» reads as the satellite
 *    changing course, and a second «वह» after «संचालक» as the operator.
 *  - The hooks echo the hero («किसी चीज़ ने इस हफ़्ते आपको भी देखा।») and ask with «क्या». The credit keeps X's "via".
 *  - File names stay English ASCII words: they travel through every app and file system.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('hi')

/** «795 किमी»: the satellite's altitude in the post (whole km) */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}\u00a0किमी`
/** «10 मीटर», «2 किमी»: a pixel's size, in whole metres or whole km */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)}\u00a0किमी` : `${f.int(m)}\u00a0मीटर`)
/** «रविवार, 1 नवंबर को स्थानीय समयानुसार 11:21 पर» */
const when = (w: PostWhen) =>
  `${formatDate('hi', w.ms, w.timeZone, { weekday: 'long', day: 'numeric', month: 'long' }).replace(/(\d) /, '$1\u00a0')} को स्थानीय समयानुसार ${w.clock} पर`

const share: typeof en = {
  // ── The sheet ──
  titlePass: 'यह उड़ान शेयर करें',
  titleImage: 'यह तस्वीर शेयर करें',
  titleWeek: 'यह हफ़्ता शेयर करें',
  close: 'बंद करें',
  closeTitle: 'बंद करें (Esc)',

  // ── Buttons ──
  shareImage: 'तस्वीर शेयर करें',
  preparingImage: 'तस्वीर बन रही है…',
  share: 'शेयर करें',
  copyLink: 'लिंक कॉपी करें',
  copyLinkDesktop: 'लिंक कॉपी करें',
  copied: 'कॉपी हो गया',
  postToX: 'X पर पोस्ट करें',
  copyImage: 'तस्वीर कॉपी करें',
  savePng: 'PNG सेव करें',
  tryAgain: 'फिर कोशिश करें',

  // ── The link and the post preview ──
  linkLabel: 'लिंक',
  directLink: 'सीधा लिंक: छोटा लिंक अभी नहीं बन सका',
  creatingLink: 'लिंक बन रहा है…',
  linkLater: 'शेयर करने पर बनेगा',
  postLabel: 'पोस्ट',
  renderFailed: 'इस ब्राउज़र में कार्ड नहीं बन सका, पर लिंक अब भी काम करता है।',

  // ── The post ──
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${sat} ने ${when(w)} ${km(altitudeKm)} की ऊँचाई से ${place} को देखा। ${pixelM !== undefined ? `एक पिक्सेल ${pixel(pixelM)} का है, और यह असली तस्वीर है।` : 'यह असली तस्वीर है।'}`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${sat} ने ${when(w)} ${km(altitudeKm)} की ऊँचाई से ${place} को देखा। ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} ${when(w)} ${place} के ${km(altitudeKm)} ऊपर से गुज़रा। यह जगह उसके कैमरे की पट्टी के भीतर थी।`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${sat} ${when(w)} ${place} के पास से गुज़रा। यह जगह उसकी पहुँच में थी। उसका कैमरा इधर मुड़ सकता था। उसका संचालक नहीं बताता कि कैमरा मुड़ा या नहीं।`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} ${when(w)} ${place} के ${km(altitudeKm)} ऊपर से गुज़रा।`,
  },
  hookWatched: 'किसी चीज़ ने इस हफ़्ते आपको भी देखा।',
  hookPassed: 'इस हफ़्ते आपके ऊपर से क्या गुज़रा?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names ──
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-week-${day}.png`,
}
export default share
