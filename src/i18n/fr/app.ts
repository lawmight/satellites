/**
 * French copy for the app's own words (src/app; see docs/i18n/fr.md §1.1, §3.1, §6.8 item 6): the fault notice, the
 * controller's progress lines and the browser tab's title.
 *
 * Why these forms: a real failure is stated impersonally («Impossible de charger…», «Le calcul … a échoué»), then the
 * one recovery step in the vous-imperative; *Impossible de* is kept for failures only, as the guide asks. The buttons
 * are infinitives or plain nouns, short enough for half a phone card. The label is the glossary's «Anomalie», an
 * instrument's word, never «Erreur !». The tab title is the hero sentence (§3.1) without its full stop. The usage stats
 * never read this file: they log the English sentence of the same ref, so a fault is one row whatever the language.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · Quelque chose vous observait cette semaine',

  notice: {
    label: 'Anomalie',
    fallback: 'Une erreur s’est produite.',
    tryAgain: 'Réessayer',
    trying: 'Nouvel essai…',
    back: 'Retour',
  },

  faults: {
    catalog: 'Impossible de charger le catalogue d’orbites. Vérifiez votre connexion et réessayez.',
    compute: 'Le calcul des passages au-dessus de ce lieu a échoué. Réessayez dans un instant.',
  },

  progress: {
    catalog: 'Chargement des éléments orbitaux',
    done: 'Rapport prêt',
  },
}
export default app
