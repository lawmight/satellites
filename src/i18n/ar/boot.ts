/**
 * The three Arabic strings the loading screen shows before the app runs (src/i18n/bootText.ts; docs/i18n/ar.md §3.1,
 * §3.7 "`app` and `bootText`", decision M3). They are read before any bundle loads, so they live apart from it.
 *
 * Why these words: the loading screen's name is a status, so it is «جارٍ» + masdar with the brand untranslated after
 * it («جارٍ تحميل Watched»), the way every busy label in the product is worded; a masdar addresses no one, where an
 * imperative or a second-person verb would pick the reader's gender (ar.md §1.2). The slow line states two facts
 * flatly, with no apology and no «يُرجى»: «الاتصال بطيء، والتحميل مستمر», one short centred line under the wordmark.
 * The tab title is the brand first (tabs cut after 25–30 characters), then the hero's sentence without its full stop,
 * word for word as app.documentTitle writes it, so the title does not change when the app takes over. The Arabic is
 * one unbroken run after the brand, so it reads correctly though the title's base direction is left to right. No
 * bidi control characters: a tab title is plain text (ar.md §6.2.7).
 */
import type { BootText } from '../bootText.ts'

export default {
  loading: 'جارٍ تحميل Watched',
  slow: 'الاتصال بطيء، والتحميل مستمر',
  title: 'Watched · ثمّة شيء رصدك أنت هذا الأسبوع',
} satisfies BootText
