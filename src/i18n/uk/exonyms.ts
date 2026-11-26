/**
 * Ukrainian place names (Київ, Харків, Львів, Москва) for display and for search: the table scripts/build-exonyms.ts
 * generates from GeoNames (./exonyms.gen.ts, never edited: a wrong name is fixed in scripts/exonyms.ts, then generated
 * again; the rules for Ukrainian are docs/i18n/uk.md §4.3's). Countries take the browser's names (`countries`); `home`
 * is the language's own country.
 *
 * Why a chunk of its own: the table writes every name in Cyrillic, ~16 kB compressed, more than the first screen should
 * carry, so neither the Ukrainian chunk nor the first paint holds it. `load` fetches it, once, and fills `names` in;
 * src/imagery/exonyms.ts calls it at idle once the landing is up and awaits it before anything shows a place name (a
 * search, a pin, a report, a switch to Ukrainian), so a name is never shown first in English and then changed.
 * A failed download never reloads the page (../optionalChunks.ts tableChunk): the names show as they came.
 */
import type en from '../en/exonyms'
import { tableChunk } from '../optionalChunks'

const exonyms: typeof en = {
  names: '',
  countries: true,
  ownScript: true,
  home: ['UA'],
}
export default tableChunk(exonyms, () => import('./exonyms.gen'))
