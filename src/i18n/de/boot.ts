/**
 * The three German strings on screen before the app's script runs (src/i18n/bootText.ts inlines them next to the
 * loading screen; see docs/i18n/de.md §3.1 and §3.9).
 *
 * Why these forms: the loading screen's name is *Watched wird geladen …*, the plain German status words with the brand
 * as their subject (the wordmark is hidden from screen readers, so this name is the only place they hear it, as in
 * English's "Loading Watched" and card.page.opening's *Watched wird geöffnet …*), and a no-break space before the
 * ellipsis (§6.1). The slow line is one short centred mono line
 * under the wordmark, uppercased by CSS: a noun phrase, then the state with no subject, *Langsame Verbindung, lädt
 * noch*, no full stop, like the English. The tab title is the hero in plain text, exactly as the app's own
 * `app.documentTitle` sets it once it runs, so the tab never changes words: the brand first, untranslated, a middle
 * dot, then *Etwas hat dich diese Woche beobachtet* without its full stop (§3.1). Tabs cut it after about 25 to 30
 * characters, which loses the verb; that is accepted, because the brand comes first, as in English.
 *
 * vite.config.ts loads this file through bootText.ts, so the import names its extension, as Vite's native config
 * loader needs.
 */
import type { BootText } from '../bootText.ts'

const loading = 'Watched wird geladen\u00a0…'
const slow = 'Langsame Verbindung, lädt noch'
const title = 'Watched · Etwas hat dich diese Woche beobachtet'

export default { loading, slow, title } satisfies BootText
