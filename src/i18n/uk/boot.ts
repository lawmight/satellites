/**
 * The three Ukrainian strings the loading screen shows before the app runs (src/i18n/bootText.ts; docs/i18n/uk.md
 * §1.3, §3.1, §7, Appendix A). They are read before any bundle loads, so they live apart from it.
 *
 * Why these words: the loading screen's name is a status, so it is a verbal noun with the brand untranslated after it
 * («Завантаження Watched»), the way every mono status label is worded. The slow line narrates the product's own work,
 * so it is the ми-present, with no apology and no «будь ласка»: «Повільне з’єднання, ще завантажуємо» is 35
 * characters, one centred line at 320 px. The tab title is the brand, then the hero's sentence in its plain form
 * without the full stop (a tab title takes none), word for word as app.documentTitle writes it, so the title does not
 * change when the app takes over; «тебе» stays last, where Ukrainian puts the emphasis. ’ is U+02BC.
 */
import type { BootText } from '../bootText.ts'

export default {
  loading: 'Завантаження Watched',
  slow: 'Повільне з’єднання, ще завантажуємо',
  title: 'Watched · Цього тижня щось дивилося на тебе',
} satisfies BootText
