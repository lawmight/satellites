/**
 * The three Traditional Chinese strings the loading screen shows before the app runs (see docs/i18n/zh-Hant.md §3.1,
 * Appendix A; src/i18n/bootText.ts).
 *
 * Why they read this way: the brand stays Watched, untranslated and unquoted. The tab title is the brand, then the
 * hero's plain-text sentence without its 。, exactly as app.documentTitle writes it (這星期，有東西注視過你), so the
 * title does not change when the app takes over. The slow line is one short centred mono line under the wordmark: a
 * plain fact with no 請 and no apology, and 網速 rather than 網路 / 網絡, which split Taiwan and Hong Kong (§1.4).
 */
import type { BootText } from '../bootText.ts'

export default {
  loading: '正在載入 Watched',
  slow: '網速較慢，仍在載入',
  title: 'Watched · 這星期，有東西注視過你',
} satisfies BootText
