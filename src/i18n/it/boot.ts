/**
 * The three Italian strings the loading screen shows before the app's script runs (see src/i18n/bootText.ts,
 * docs/i18n/it.md §3.1 and §3.7 "App and boot").
 *
 * Why these words: the accessible name is a status noun, `Caricamento di Watched`, never a first-person verb (the
 * product is *noi*, never *io*) and never an article before the brand. The slow line is one short centred mono line
 * under the wordmark, a plain statement with no `in corso` padding: `Rete lenta, ancora in caricamento`. The tab title
 * is the running form of the hero with the clitic *ti*, so the verb lands inside the ~30 characters a tab keeps
 * (`Qualcosa ti ha osservato questa settimana`), after the untranslated brand and a middle dot, with no full stop,
 * exactly as app.documentTitle sets it once the app runs, so the tab never changes its words when the page takes over.
 *
 * vite.config.ts loads this file through bootText.ts, so the import names its extension, as Vite's native config
 * loader needs.
 */
import type { BootText } from '../bootText.ts'

const boot: BootText = {
  loading: 'Caricamento di Watched',
  slow: 'Rete lenta, ancora in caricamento',
  title: 'Watched · Qualcosa ti ha osservato questa settimana',
}

export default boot
