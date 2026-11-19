/**
 * Polish copy for the app's own words (src/app; see docs/i18n/pl.md §1.2, §3.1, §3.7): the fault notice, the
 * controller's progress lines and the browser tab's title.
 *
 * Why it reads this way: a fault is stated impersonally and calmly («Nie udało się…», «Coś poszło nie tak»), with no
 * apology and no blame, so nothing agrees with the reader's gender. A state in progress is the imperfective verbal
 * noun («Ponawianie…», «Wczytywanie…»). The retry button is «Ponów», the short form the guide keeps for tight mono
 * rows: on phones each button is half the card, and «Spróbuj ponownie» is wider than that half. The readout's first
 * row says «elementów orbit», as «katalog orbit» does, so it fits a phone's row whole. A one-letter word is tied to the
 * next by a no-break space (§6.3). The stats keep logging the ENGLISH sentence of each ref (en/app.ts), so these
 * words can change without splitting the admin page's counts.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · Coś cię obserwowało w tym tygodniu',

  notice: {
    label: 'Usterka',
    fallback: 'Coś poszło nie tak.',
    tryAgain: 'Ponów',
    trying: 'Ponawianie…',
    back: 'Wróć',
  },

  faults: {
    catalog: 'Nie udało się wczytać katalogu orbit. Sprawdź połączenie i\u00a0spróbuj ponownie.',
    compute: 'Coś poszło nie tak przy liczeniu przelotów dla tego miejsca. Spróbuj ponownie za chwilę.',
  },

  progress: {
    catalog: 'Wczytywanie elementów orbit',
    done: 'Raport gotowy',
  },
}
export default app
