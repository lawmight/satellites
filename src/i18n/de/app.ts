/**
 * German copy for the app's own words (src/app; see docs/i18n/de.md §2.5, §3.1, §3.9): the fault notice, the progress
 * lines the controller writes, and the browser tab's title.
 *
 * Why these forms: the tab title is the brand, a middle dot, then the hero sentence without its full stop (§3.1); tabs
 * cut it after about 25–30 characters, which loses the verb, accepted because the brand comes first. The notice's label
 * is `Störung`, the technical word for a fault, never *Fehler!* (§3.9). Its messages state what failed, impersonally,
 * and address the reader only for what they must do, with the full imperative (*Prüfe*, *Versuche*, §1.1, §1.2). The
 * buttons are infinitives (`Erneut versuchen`, `Zurück`); the busy one is a noun phrase before a no-break space and
 * an ellipsis (`Neuer Versuch …`, §6.1). The progress line is the readout's log style, a noun and a passive
 * (`Bahnelemente werden geladen`, §2.5). The usage stats keep logging the ENGLISH sentence of each fault (§6.7),
 * read from the English namespace, so nothing here changes what they record.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · Etwas hat dich diese Woche beobachtet',

  notice: {
    label: 'Störung',
    fallback: 'Etwas ist schiefgelaufen.',
    tryAgain: 'Erneut versuchen',
    trying: 'Neuer Versuch …',
    back: 'Zurück',
  },

  faults: {
    catalog: 'Der Bahnkatalog konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.',
    compute: 'Beim Berechnen der Überflüge für diesen Ort ist etwas schiefgelaufen. Versuche es gleich noch einmal.',
  },

  progress: {
    catalog: 'Bahnelemente werden geladen',
    done: 'Bericht fertig',
  },
}
export default app
