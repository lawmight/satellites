/**
 * The three Vietnamese strings on screen before the app's script runs (src/i18n/bootText.ts inlines them next to the
 * loading screen; see docs/i18n/vi.md §3.1 and §3.8).
 *
 * Why these forms: the loading screen's name is a live state, so it takes *đang* with the brand as its object (*Đang
 * tải Watched*; the brand is never translated). The slow line is one short centred mono line under the wordmark: two
 * plain clauses joined by a comma, no apology, no *vui lòng* (*Kết nối chậm, vẫn đang tải*, 26 characters), and CSS
 * uppercases it with every mark kept. The tab title is the hero as one sentence, exactly as the app's own
 * `app.documentTitle` sets it once it runs, so the tab never changes words: the brand first, a middle dot, then *Tuần
 * này, có thứ gì đó quan sát bạn* with the reader last and no full stop. Every string is NFC.
 *
 * vite.config.ts loads this file through bootText.ts, so the import names its extension, as Vite's native config
 * loader needs.
 */
import type { BootText } from '../bootText.ts'

const loading = 'Đang tải Watched'
const slow = 'Kết nối chậm, vẫn đang tải'
const title = 'Watched · Tuần này, có thứ gì đó quan sát bạn'

export default { loading, slow, title } satisfies BootText
