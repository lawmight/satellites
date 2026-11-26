/**
 * Arabic copy for the share sheet, the post it prefills and the PNG's file name (see src/i18n/en/share.ts for where
 * each message shows; docs/i18n/ar.md §3.5 "Post" and §3.7 "share" are the authority on every line here).
 *
 * Why it reads this way:
 *  - Buttons are masdars («مشاركة»، «نسخ الرابط»، «حفظ PNG»، «إعادة المحاولة»): an imperative to the reader would be
 *    gendered (ar.md §1.2). «تم النسخ» is the accepted UI exception to the reflex «تمّ» passive (§2.3).
 *  - The post is plain text, so it must start with an Arabic letter (a Latin first letter turns the whole paragraph left
 *    to right on X and in share sheets, ar.md §6.2.2), and two Latin names never touch. The imaged and likely frames are
 *    nominal («القمر الصناعي Sentinel-2C رصد Waterloo»); with a preposition between the names the verb comes first
 *    («مرّ القمر الصناعي … على مرأى من Waterloo»). The satellite's frame is masculine throughout («كاميرته»،
 *    «مشغّله»). These messages get no crewed flag, so a crewed station is recognised by its display name (ISS,
 *    Tiangong), as the pass view and the card recognise it: the overhead post, the only one a station can get, says
 *    «مرّت المحطة الفضائية ISS» (f), never «القمر الصناعي ISS» (ar.md §5.2, §9.1).
 *  - The day is the Intl long day at the place («يوم الأحد، 1 نوفمبر»), then the clock as it comes and
 *    «بالتوقيت المحلي»: never a bare «م» after a clock (it reads «مساءً», §5.7).
 *  - The pixel arrives as metres, so prose spells them with agreement («10 أمتار»، «30 مترًا»), and from 1000 m in km.
 *    Numbers come from fmt('ar'); a no-break space ties a number to its unit and the head noun to the satellite.
 *  - No bidi control characters anywhere here: X counts each as two and a font may draw it as a box (§6.2.7).
 *  - File names stay lowercase ASCII, as English.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('ar')
const nb = '\u00a0'

/** «القمر الصناعي Sentinel-2C»: the head noun carries the gender, a no-break space keeps it with the name */
const theSat = (sat: string) => `القمر الصناعي${nb}${sat}`
/** Display names of the crewed stations (src/engine/profiles.ts: ISS, Tiangong): the messages carry no crewed flag */
const CREWED = /^(ISS|Tiangong)\b/
/** "[SAT] passed": «مرّ القمر الصناعي X» (m), or «مرّت المحطة الفضائية ISS» (f) */
const passed = (sat: string) => (CREWED.test(sat) ? `مرّت المحطة الفضائية${nb}${sat}` : `مرّ ${theSat(sat)}`)
/** «795 كم»: the satellite's altitude (whole km) */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}${nb}كم`
/** The pixel as the predicate of «الدقة» (nominative): «متر واحد» · «متران» · «10 أمتار» · «30 مترًا» · «2 كم» */
const pixel = (m: number) => {
  if (m >= 1000) return `${f.int(m / 1000)}${nb}كم`
  const n = Math.round(m)
  // Below half a metre a whole number would print «0»: keep two decimals (a decimal takes the `other` form).
  if (n < 1) return `${f.dec(m, 2)}${nb}متر`
  return f.plural(n, {
    zero: `${f.int(n)}${nb}متر`,
    one: 'متر واحد',
    two: 'متران',
    few: `${f.int(n)}${nb}أمتار`,
    many: `${f.int(n)}${nb}مترًا`,
    other: `${f.int(n)}${nb}متر`,
  })
}
/** «يوم الأحد، 1 نوفمبر، عند 11:21 بالتوقيت المحلي» */
const when = (w: PostWhen) =>
  `يوم ${formatDate('ar', w.ms, w.timeZone, { weekday: 'long', day: 'numeric', month: 'long' })}، عند ${w.clock} بالتوقيت المحلي`

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'مشاركة هذا المرور',
  titleImage: 'مشاركة هذه الصورة',
  titleWeek: 'مشاركة هذا الأسبوع',
  close: 'إغلاق',
  closeTitle: 'إغلاق (Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'مشاركة الصورة',
  preparingImage: 'جارٍ تجهيز الصورة…',
  share: 'مشاركة',
  copyLink: 'نسخ الرابط',
  copyLinkDesktop: 'نسخ الرابط',
  copied: 'تم النسخ',
  postToX: 'النشر على X',
  copyImage: 'نسخ الصورة',
  savePng: 'حفظ PNG',
  tryAgain: 'إعادة المحاولة',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'الرابط',
  directLink: 'رابط مباشر: تعذّر إنشاء الرابط المختصر الآن',
  creatingLink: 'جارٍ إنشاء الرابط…',
  // An impersonal passive: "when you share" would need a gendered verb.
  linkLater: 'يُنشأ عند المشاركة',
  postLabel: 'النص',
  renderFailed: 'تعذّر رسم البطاقة هنا؛ لكن الرابط يعمل.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${theSat(sat)} رصد ${place} من ارتفاع ${km(altitudeKm)} ${when(w)}. ${
        pixelM !== undefined ? `الدقة ${pixel(pixelM)} لكل بكسل، وهذه هي الصورة الحقيقية.` : 'هذه هي الصورة الحقيقية.'
      }`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${theSat(sat)} رصد ${place} من ارتفاع ${km(altitudeKm)} ${when(w)}. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${theSat(sat)} غطّى ${place} من ارتفاع ${km(altitudeKm)} ${when(w)}. شمل نطاق مسح كاميرته البقعة.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `مرّ ${theSat(sat)} على مرأى من ${place} ${when(w)}. كان بإمكانه توجيه كاميرته إلى هنا. لا يقول مشغّله إن كان قد فعل.`,
    // The one post a crewed station can get: «مرّت المحطة الفضائية ISS» (f), as the pass view and the card say it.
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${passed(sat)} على ارتفاع ${km(altitudeKm)} فوق ${place} ${when(w)}.`,
  },
  // «أيضًا» echoes the hero, «ثمّة شيء رصدك أنت»; the second hook is a question, never an imperative.
  hookWatched: 'ثمّة شيء رصدك أنت أيضًا هذا الأسبوع.',
  hookPassed: 'ما الذي مرّ فوقك هذا الأسبوع؟',
  credit: (handle: string) => `عبر ${handle}`,

  // ── File names (lowercase ASCII words and hyphens) ────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-week-${day}.png`,
}

export default share
