/**
 * The three French strings the loading screen shows before the app's script runs (src/i18n/bootText.ts inlines them
 * next to the loading screen; docs/i18n/fr.md §3.1, §3.9 "Boot and switcher", decisions log M2).
 *
 * Why these words: the accessible name is a status noun, *Chargement de Watched*, as the app's other status lines are
 * (*Chargement du catalogue*, fr.md §1.1); never a first-person verb, and the brand stays untranslated, bare, with no
 * article. The slow line is the guide's *Connexion lente, chargement en cours*: one short centred mono line under the
 * wordmark, two nouns and no verb, so nothing agrees with the reader, uppercased by CSS with its accents kept. The tab
 * title is the hero sentence in plain text (§3.1), *Quelque chose vous observait cette semaine*, after the brand and a
 * middle dot and without the full stop (a tab title takes none), exactly as app.documentTitle sets it once the app
 * runs, so the tab never changes its words when the page takes over. The imparfait keeps *vous* free of agreement.
 *
 * vite.config.ts loads boot files through bootText.ts, so the import names its extension, as Vite's native config
 * loader needs.
 */
import type { BootText } from '../bootText.ts'

const loading = 'Chargement de Watched'
const slow = 'Connexion lente, chargement en cours'
const title = 'Watched · Quelque chose vous observait cette semaine'

export default { loading, slow, title } satisfies BootText
