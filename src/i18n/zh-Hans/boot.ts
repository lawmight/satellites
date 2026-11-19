/**
 * The three Simplified Chinese strings the loading screen shows before the app's script runs (see
 * docs/i18n/zh-Hans.md §3.1, §1.1, Appendix A; src/i18n/bootText.ts): its accessible name, the slow-connection line
 * and the tab title.
 *
 * Why they read this way: they are on screen before any message bundle has loaded, so they must match what the app
 * says once it runs. The title is `app.documentTitle` exactly, the brand untranslated, then the hero's plain-text
 * sentence without its 。 (这一周，有东西注视过你), so the tab never changes its words when the app takes over. The
 * slow line is one short centred mono line under the wordmark: a plain statement, no 请, no apology, no ellipsis,
 * 网络较慢，仍在加载. The loading screen's name puts the verb first, as every progress line does (正在加载).
 */
import type { BootText } from '../bootText.ts'

const loading = '正在加载 Watched'
const slow = '网络较慢，仍在加载'
const title = 'Watched · 这一周，有东西注视过你'

export default { loading, slow, title } satisfies BootText
