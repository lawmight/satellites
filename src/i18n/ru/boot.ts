/**
 * The three Russian strings the loading screen shows before the app runs (src/i18n/bootText.ts; docs/i18n/ru.md
 * §1.3, §3.1, §7, Appendix A). They are read before any bundle loads, so they live apart from it.
 *
 * Why these words: the loading screen's name is a status, so it is a verbal noun with the brand untranslated after it
 * («Загрузка Watched»), the way every mono status label is worded. The slow line narrates the product's own work, so
 * it is the мы-present, with no apology and no «пожалуйста»: «Медленное соединение, ещё загружаем» is 35 characters,
 * one centred line at 320 px. The tab title is the brand, then the hero's sentence in its plain form without the full
 * stop (a tab title takes none), word for word as app.documentTitle writes it, so the title does not change when the
 * app takes over; «тебя» stays last, where Russian puts the emphasis.
 */
import type { BootText } from '../bootText.ts'

export default {
  loading: 'Загрузка Watched',
  slow: 'Медленное соединение, ещё загружаем',
  title: 'Watched · На этой неделе что-то смотрело на тебя',
} satisfies BootText
