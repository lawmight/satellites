/**
 * Italian place names (Monaco di Baviera, Londra, Mosca, Pechino) for display and for search: the table
 * scripts/build-exonyms.ts generates from GeoNames (./exonyms.gen.ts, never edited: a wrong name is fixed in
 * scripts/exonyms.ts, then generated again; the rules for Italian are docs/i18n/it.md's). Countries take the browser's
 * names (`countries`); `home` is the language's own countries.
 *
 * Why a chunk of its own: the table writes its differing names, ~7 kB compressed, more than the first screen should
 * carry, so neither the Italian chunk nor the first paint holds it. `load` fetches it, once, and fills `names` in;
 * src/imagery/exonyms.ts calls it at idle once the landing is up and awaits it before anything shows a place name (a
 * search, a pin, a report, a switch to Italian), so a name is never shown first in English and then changed.
 * A failed download never reloads the page (../optionalChunks.ts tableChunk): the names show as they came.
 */
import type en from '../en/exonyms'
import { tableChunk } from '../optionalChunks'

const exonyms: typeof en = {
  names: '',
  countries: true,
  home: ['IT', 'SM', 'VA'],
  apostrophes: true,
}
export default tableChunk(exonyms, () => import('./exonyms.gen'))
