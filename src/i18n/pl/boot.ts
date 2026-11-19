/**
 * The three Polish strings the loading screen shows before the app runs (src/i18n/bootText.ts; docs/i18n/pl.md §3.1).
 * They are read before any bundle loads, so they live apart from it.
 *
 * Why these words: the loading screen's name is a status, so it is the imperfective verbal noun with the brand behind
 * its classifier («Wczytywanie aplikacji Watched»: a foreign name is never declined, §4.2). The slow line shows before
 * any web font is certain, so it uses latin letters only: a latin-ext letter (Ł, Ą, Ę) would come from a fallback face
 * in the middle of a mono line, which rules out «połączenie». «Powolne wczytywanie» names the state, with no apology
 * and no «proszę czekać». The tab title is the brand, then the hero's sentence in its plain form without the full stop
 * (a tab title takes none), word for word as app.documentTitle writes it, so the title does not change when the app
 * takes over.
 */
import type { BootText } from '../bootText.ts'

export default {
  loading: 'Wczytywanie aplikacji Watched',
  slow: 'Powolne wczytywanie',
  title: 'Watched · Coś cię obserwowało w tym tygodniu',
} satisfies BootText
