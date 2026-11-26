/**
 * The three Hindi strings the loading screen shows before the app runs (src/i18n/bootText.ts; docs/i18n/hi.md §3.1,
 * §7). They are read before any bundle loads, so they live apart from it.
 *
 * Why these words: the loading screen's name is a status about the brand, so the brand comes first, untranslated, and
 * the verb is the default masculine «लोड हो रहा है», as Hindi interfaces say it of an app. The slow line states the
 * fact and that the work goes on, with no apology and no «कृपया»: «धीमा कनेक्शन, अब भी लोड हो रहा है» is one centred
 * line at 320 px. The tab title is app.documentTitle word for word (the hero in one line, no danda), so the title does
 * not change when the app takes over.
 */
import type { BootText } from '../bootText.ts'

export default {
  loading: 'Watched लोड हो रहा है',
  slow: 'धीमा कनेक्शन, अब भी लोड हो रहा है',
  title: 'Watched · किसी चीज़ ने इस हफ़्ते आपको देखा',
} satisfies BootText
