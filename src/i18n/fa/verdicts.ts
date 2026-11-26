/**
 * The Persian verdict vocabulary (see docs/i18n/fa.md §3.6, the authority on every word here): the one set of words
 * the product uses for a pass's verdict, wherever it is said.
 *
 * Why these words:
 *  - Titles are past-tense verb phrases whose subject is the satellite, as the English ones are: «رصد کرد», «احتمالاً
 *    رصد کرد», «می‌توانست به این‌جا نگاه کند», «از بالای سر گذشت». «رصد» is the product's verb (Earth observation's
 *    and astronomy's word); «دید» was rejected because alone it is also the noun "sight".
 *  - «می‌توانست به این‌جا نگاه کند» ("it could have looked here") is honest for "could have pointed here": the
 *    definition is about looking, and «نشانه گرفتن» / «هدف گرفتن» (aim, target) are weapons' words.
 *  - The lane words are one noun each, about 8 characters: «تصویر» (image, never «عکس»: radar images and mosaics share
 *    the lane), «محتمل», «ممکن», «بالای سر». «احتمالاً» and «ممکن» keep the gradient between likely and possible.
 *  - Every verdict counts passes, and a Persian noun after a number is singular: the unit is «گذر» for every count.
 *  - The spoken verbs stand alone after a satellite's name in a comma list: «رصد کرد», «پوشش داد» (covered: the likely
 *    verb), «در دیدرس گذشت» ("passed within view": «در دیدرس» is the set phrase; «از دیدرس» pulls towards «از دیدرس
 *    خارج شد», "went out of sight"), «از بالای سر گذشت».
 *  - A sensor's coverage is «پوشش دادن»; «پوشاندن» is to cover over or hide, as cloud does. A camera that can be
 *    pointed is «قابل‌چرخش»: «چرخان» also means "spinning", and in Iran it names the CCTV camera.
 *  - The range is the camera's, so the place is the subject: «این‌جا در بُرد یک دوربین … بود».
 */
import type en from '../en/verdicts'

const pass = () => 'گذر'

const verdicts: typeof en = {
  imaged: {
    title: 'رصد کرد',
    short: 'تصویر',
    unit: pass,
    definition: 'تصویری واقعی از این مکان در یک آرشیو عمومی وجود دارد.',
    verb: 'رصد کرد',
  },
  likely: {
    title: 'احتمالاً رصد کرد',
    short: 'محتمل',
    unit: pass,
    definition: 'نوار تصویربرداری یک دوربین ثابت این مکان را پوشش داد. هیچ تصویری از این‌جا منتشر نشده است.',
    verb: 'پوشش داد',
  },
  could: {
    title: 'می‌توانست به این‌جا نگاه کند',
    short: 'ممکن',
    unit: pass,
    definition: 'این‌جا در بُرد یک دوربین قابل‌چرخش یا خصوصی بود. اپراتورش نمی‌گوید که نگاه کرد یا نه.',
    verb: 'در دیدرس گذشت',
  },
  overhead: {
    title: 'از بالای سر گذشت',
    short: 'بالای سر',
    unit: pass,
    definition: 'از آسمان شما گذشت. ایستگاه‌های فضایی و هر چیز دیگر.',
    verb: 'از بالای سر گذشت',
  },
}

export default verdicts
