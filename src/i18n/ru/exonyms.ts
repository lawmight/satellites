/**
 * Russian place names (Москва, Киев, Харьков, Днепр) for display and for search: the table scripts/build-exonyms.ts
 * generates from GeoNames (./exonyms.gen.ts, never edited: a wrong name is fixed in scripts/exonyms.ts, then generated
 * again; the rules for Russian are docs/i18n/ru.md's). Countries take the browser's names (`countries`); `home` is the
 * language's own countries.
 *
 * Why a chunk of its own: the table writes every name in Cyrillic, ~15 kB compressed, more than the first screen should
 * carry, so neither the Russian chunk nor the first paint holds it. `load` fetches it, once, and fills `names` in;
 * src/imagery/exonyms.ts calls it at idle once the landing is up and awaits it before anything shows a place name (a
 * search, a pin, a report, a switch to Russian), so a name is never shown first in English and then changed.
 * A failed download never reloads the page (../optionalChunks.ts tableChunk): the names show as they came.
 */
import type en from '../en/exonyms'
import { tableChunk } from '../optionalChunks'

const exonyms: typeof en = {
  names: '',
  countries: true,
  ownScript: true,
  home: ['RU', 'BY', 'KZ', 'KG'],
  // The names Russian speakers usually type for countries the browser names otherwise (search only; shown as CLDR
  // names them, ru.md §8).
  countryAliases: {
    KR: ['Южная Корея'],
    KP: ['Северная Корея', 'КНДР'],
    BY: ['Белоруссия'],
    MD: ['Молдавия'],
    NL: ['Голландия'],
    TM: ['Туркмения'],
    SC: ['Сейшелы'],
  },
}
export default tableChunk(exonyms, () => import('./exonyms.gen'))
