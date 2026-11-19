/**
 * The three Brazilian Portuguese strings on screen before the app's script runs (src/i18n/bootText.ts inlines them
 * next to the loading screen; see docs/i18n/pt-BR.md §3.1 and §3.7, and the decisions log, item M3).
 *
 * Why these forms: the loading screen's name is the status-line gerund with the brand as its object, and the brand
 * takes the article it has in every pt-BR sentence (*Carregando o Watched*, guide §4.1); it is never translated. The
 * slow line is one short centred mono line under the wordmark, so it is two plain clauses with a comma and no verb in
 * the first (*Conexão lenta, ainda carregando*: *conexão*, not Portugal's *ligação*, guide §1.4), uppercased by CSS
 * with its accents kept. The tab title is the hero in plain text, exactly as the app's own `app.documentTitle` sets it
 * once it runs, so the tab never changes words: the brand first, a middle dot, then *Algo observou você esta semana*
 * (the product verb *observar*, the reader as *você*, never the clitic *te*), without a full stop.
 *
 * vite.config.ts loads this file through bootText.ts, so the import names its extension, as Vite's native config
 * loader needs.
 */
import type { BootText } from '../bootText.ts'

const loading = 'Carregando o Watched'
const slow = 'Conexão lenta, ainda carregando'
const title = 'Watched · Algo observou você esta semana'

export default { loading, slow, title } satisfies BootText
