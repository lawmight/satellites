/**
 * German place names (München, Köln, Mailand, Moskau) for display and for search: the table scripts/build-exonyms.ts
 * generates from GeoNames (./exonyms.gen.ts, never edited: a wrong name is fixed in scripts/exonyms.ts, then generated
 * again; the rules for German are docs/i18n/de.md's). Countries take the browser's names (`countries`); `home` is the
 * language's own countries.
 *
 * Why a chunk of its own: the table writes its differing names, ~8 kB compressed, more than the first screen should
 * carry, so neither the German chunk nor the first paint holds it. `load` fetches it, once, and fills `names` in;
 * src/imagery/exonyms.ts calls it at idle once the landing is up and awaits it before anything shows a place name (a
 * search, a pin, a report, a switch to German), so a name is never shown first in English and then changed.
 * A failed download never reloads the page (../optionalChunks.ts tableChunk): the names show as they came.
 */
import type en from '../en/exonyms'
import { tableChunk } from '../optionalChunks'

const exonyms: typeof en = {
  names: '',
  countries: true,
  home: ['DE', 'AT', 'CH', 'LI'],
  umlauts: true,
}
export default tableChunk(exonyms, () => import('./exonyms.gen'))
