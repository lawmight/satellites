/**
 * The three Indonesian strings on screen before the app's script runs (src/i18n/bootText.ts inlines them next to the
 * loading screen; see docs/i18n/id.md §3.1 and §3.8, and the decisions log, item 39).
 *
 * Why these forms: the loading screen's name is a live state with the brand as its object (*Memuat Watched*; the brand
 * is never translated and takes nothing attached). The slow line is one short centred mono line under the wordmark, so
 * it is two plain clauses joined by a comma, with no particle and no apology (*Koneksi lambat, masih memuat*), and CSS
 * uppercases it. The tab title is the hero as one sentence, exactly as the app's own `app.documentTitle` sets it once it
 * runs, so the tab never changes words: the brand first, a middle dot, then *Sesuatu mengawasi kamu minggu ini* with
 * the free pronoun *kamu* (§1.2 rule 4), lowercase *minggu* (week, not Sunday) and no full stop.
 *
 * vite.config.ts loads this file through bootText.ts, so the import names its extension, as Vite's native config
 * loader needs.
 */
import type { BootText } from '../bootText.ts'

const loading = 'Memuat Watched'
const slow = 'Koneksi lambat, masih memuat'
const title = 'Watched · Sesuatu mengawasi kamu minggu ini'

export default { loading, slow, title } satisfies BootText
