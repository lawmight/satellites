/**
 * The three Japanese strings the loading screen shows before the app runs (src/i18n/bootText.ts; docs/i18n/ja.md §3.1,
 * §3.7 "app, system, switcher, geo, boot"). They are read before any bundle loads, so they live apart from it.
 *
 * Why these words: the brand stays "Watched" and takes its particle directly (Watchedを読み込み中), a status line
 * being a noun with 中 and no conjugation. The slow line is one short centred mono line, so it is two noun phrases
 * set apart by the design's middle dot, the way a mono readout separates fields, rather than a sentence: 回線が遅い ·
 * まだ読み込み中 (まだ for "still"). The tab title is the hero's sentence in its plain copy, word for word, without its
 * 。 (a tab title takes no full stop), and identical to app.documentTitle, which takes over once the app runs.
 */
import type { BootText } from '../bootText.ts'

export default {
  loading: 'Watchedを読み込み中',
  slow: '回線が遅い · まだ読み込み中',
  title: 'Watched · 今週、何かがあなたを見ていた',
} satisfies BootText
