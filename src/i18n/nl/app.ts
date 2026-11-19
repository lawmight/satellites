/**
 * Dutch copy for the app's own words (src/app; see docs/i18n/nl.md §1, §3.1, §3.7): the fault notice, the
 * controller's progress lines and the browser tab's title.
 *
 * Why these forms: a failure is said plainly, what happened first and then what to do in the je-imperative, with no
 * `Helaas` or `Oeps` (§1). The label is the glossary's `Storing`, an instrument's word, never `Fout!`. The retry is
 * the glossary's tight `Opnieuw` (§4.1, §7: one key, one context), not `Opnieuw proberen`: on phones each button is
 * half the card (143 px at 375), and the long form is 166 px in mono caps, so the halves came out unequal, the row
 * wrapped at 320 px, and both jumped back when the label turned into `Proberen…` (the running retry, which fits) and
 * the globe reframed. The tab title is the hero sentence (§3.1) without its full stop, brand first. The usage stats
 * never read this file: they log the English sentence of the same ref, so a fault is one row whatever the language.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · Iets keek deze week naar jou',

  notice: {
    label: 'Storing',
    fallback: 'Er ging iets mis.',
    tryAgain: 'Opnieuw',
    trying: 'Proberen…',
    back: 'Terug',
  },

  faults: {
    catalog: 'De baancatalogus kon niet worden geladen. Controleer je verbinding en probeer het opnieuw.',
    compute: 'Er ging iets mis bij het berekenen van de overvluchten voor deze plek. Probeer het zo opnieuw.',
  },

  progress: {
    catalog: 'Baanelementen laden',
    done: 'Rapport klaar',
  },
}
export default app
