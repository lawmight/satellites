/**
 * Arabic verdict vocabulary (see docs/i18n/ar.md §3.6, the authority on every word here; DESIGN §7): the one set of
 * words for a pass's verdict, wherever the product says it.
 *
 * Why these words:
 *  - The product verb is «رصد» (neutral, scientific: «مرصد» is an observatory), never «صوّر» (the owner's rule), «راقب»
 *    (surveillance) or «ترصّد» (to stalk). The titles stay unvocalised: «رصد» reads as "was watched" or as the noun
 *    "observation", and both are true.
 *  - «على الأرجح» / «مرجّح» is "more likely than not", never «محتمل», which leans toward "possible" and would blur into
 *    «ممكن». The could title «كان بإمكانه النظر إلى هنا» keeps the satellite as its implicit subject, as «مرّ فوقك»
 *    does, so as a group title it reads "each could have looked here".
 *  - A camera that always records is «غير قابلة للتوجيه», the counterpart of «قابلة للتوجيه»: «ثابت» is kept for
 *    geostationary satellites only. "Swept over" is «غطّى» (remote sensing's «تغطية»), never «مسح» or «اجتاح».
 *  - The lane word «صورة» means image and photo alike, so it is honest for radar images and weather mosaics too.
 *  - Every verdict counts passes with «مرة». The unit sits beside its own figure (the summary readouts), so the digit
 *    stays and the noun agrees with it (ar.md §5.4): «0 مرة»، «1 مرة»، «2 مرتان»، «3 مرات»، «31 مرة»، «100 مرة».
 *  - The definitions name a camera («كاميرا», f) or the place («هذا المكان», m), never the reader; the overhead verdict
 *    keeps «فوقك» and «سمائك», the documented exception (§2.1).
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('ar')

/** The unit beside a count of passes, agreeing with the digit before it (a fraction is `other`) */
const passes = (n: number) => f.plural(n, { zero: 'مرة', one: 'مرة', two: 'مرتان', few: 'مرات', many: 'مرة', other: 'مرة' })

const verdicts: typeof en = {
  imaged: {
    title: 'رصد',
    short: 'صورة',
    unit: passes,
    definition: 'توجد صورة حقيقية لهذا المكان في أرشيف متاح للعموم.',
    verb: 'رصد',
  },
  likely: {
    title: 'رصد على الأرجح',
    short: 'مرجّح',
    unit: passes,
    definition: 'غطّى نطاق مسح كاميرا غير قابلة للتوجيه هذا المكان. لم تُنشر له أي صورة.',
    verb: 'غطّى المكان',
  },
  could: {
    title: 'كان بإمكانه النظر إلى هنا',
    short: 'ممكن',
    unit: passes,
    definition: 'كانت ضمن المدى كاميرا قابلة للتوجيه أو تابعة لجهة خاصة. لا يقول مشغّلها إن كانت قد نظرت.',
    verb: 'مرّ ضمن المدى',
  },
  overhead: {
    title: 'مرّ فوقك',
    short: 'فوقك',
    unit: passes,
    definition: 'مرّ في سمائك. المحطات الفضائية وكل ما سواها.',
    verb: 'مرّ فوقك',
  },
}
export default verdicts
