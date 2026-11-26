/**
 * Vietnamese place names (Hà Nội, Thành phố Hồ Chí Minh, Luân Đôn, Biển Đông) for display and for search: the table
 * scripts/build-exonyms.ts generates from GeoNames (./exonyms.gen.ts, never edited: a wrong name is fixed in
 * scripts/exonyms.ts, then generated again; the rules for Vietnamese are docs/i18n/vi.md §8's). Countries take the
 * browser's names (`countries`); `home` is the language's own country.
 *
 * Why a chunk of its own: the table writes its differing names, ~5.5 kB compressed, more than the first screen should
 * carry, so neither the Vietnamese chunk nor the first paint holds it. `load` fetches it, once, and fills `names` in;
 * src/imagery/exonyms.ts calls it at idle once the landing is up and awaits it before anything shows a place name (a
 * search, a pin, a report, a switch to Vietnamese), so a name is never shown first in English and then changed.
 * A failed download never reloads the page (../optionalChunks.ts tableChunk): the names show as they came.
 */
import type en from '../en/exonyms'
import { tableChunk } from '../optionalChunks'

const exonyms: typeof en = {
  names: '',
  countries: true,
  home: ['VN'],
  // The Paracels (Hoàng Sa) and the Spratlys (Trường Sa): east of 116° only north of 8.5° (Half Moon Shoal, Investigator
  // Northeast Shoal), clear of Sabah's islands (Balambangan, Banggi) and Palawan's (Balabac and its strait).
  contested: [
    [15.5, 110.8, 17.3, 113.0],
    [7.0, 111.0, 12.0, 116.0],
    [8.5, 116.0, 12.0, 117.0],
  ],
}
export default tableChunk(exonyms, () => import('./exonyms.gen'))
