/**
 * Italian copy for the app's own words (see docs/i18n/it.md §1, §3.1, §3.7): the fault notice, the controller's
 * progress lines and the browser tab's title.
 *
 * Why these forms: a fault says what happened with *noi* as the subject, then what to do in the tu imperative (*Non
 * siamo riusciti a caricare… Controlla la connessione e riprova.*), never the bureaucratic *Si è verificato un errore*.
 * The label is *Anomalia*, an instrument panel's word. Status words are nouns (*Nuovo tentativo…*, *Caricamento degli
 * elementi orbitali*): the first-person *Riprovo…* would make the product an *io*. The tab title is the hero's running
 * form with the clitic *ti*, so the verb lands inside the ~30 characters a tab keeps. The usage stats never read this
 * file: they log the English sentence of the same ref.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · Qualcosa ti ha osservato questa settimana',

  notice: {
    label: 'Anomalia',
    fallback: 'Qualcosa non ha funzionato.',
    tryAgain: 'Riprova',
    trying: 'Nuovo tentativo…',
    back: 'Indietro',
  },

  faults: {
    catalog: 'Non siamo riusciti a caricare il catalogo delle orbite. Controlla la connessione e riprova.',
    compute: 'Qualcosa non ha funzionato nel calcolo dei passaggi per questo luogo. Riprova tra poco.',
  },

  progress: {
    catalog: 'Caricamento degli elementi orbitali',
    done: 'Risultati pronti',
  },
}
export default app
