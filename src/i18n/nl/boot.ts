/**
 * The three Dutch strings the loading screen shows before the app's script runs (see src/i18n/bootText.ts,
 * docs/i18n/nl.md §3.1 and §3.7 "App, boot, system").
 *
 * Why these words: the accessible name says what is happening to the brand, `Watched wordt geladen` (the brand is a
 * name, never translated, inflected or given an article). The slow line is one short centred mono line under the
 * wordmark, a plain statement with no softener (`Even geduld` is Netherlands-only and a filler, §8): `Trage
 * verbinding, nog bezig met laden`. The tab title is the hero sentence, the same everywhere it appears (`Iets keek deze
 * week naar jou`), after the brand and a middle dot, with no full stop, exactly as app.documentTitle sets it once the
 * app runs, so the tab never changes its words when the page takes over.
 */
import type { BootText } from '../bootText.ts'

const boot: BootText = {
  loading: 'Watched wordt geladen',
  slow: 'Trage verbinding, nog bezig met laden',
  title: 'Watched · Iets keek deze week naar jou',
}

export default boot
