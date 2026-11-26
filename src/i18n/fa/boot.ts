/**
 * The three Persian strings the loading screen shows before the app runs (src/i18n/bootText.ts; docs/i18n/fa.md §3.1,
 * §3.7). They are read before any bundle loads, so they live apart from it.
 *
 * Why these words: the screen's name is a status, «در حال بارگیری» before the untranslated brand, the way every busy
 * label in the product is worded. The slow line states two facts flatly, joined by «؛», with no apology and no
 * «لطفاً»: one short centred line under the wordmark. The tab title is the brand first (tabs cut after 25–30
 * characters), then the hero's sentence without its full stop, word for word as app.documentTitle writes it, so the
 * title does not change when the app takes over. Plain text: no bidi control characters (fa.md §6.2.5).
 */
import type { BootText } from '../bootText.ts'

export default {
  loading: 'در حال بارگیری Watched',
  slow: 'اتصال کند است؛ بارگیری ادامه دارد',
  title: 'Watched · چیزی این هفته شما را رصد کرد',
} satisfies BootText
