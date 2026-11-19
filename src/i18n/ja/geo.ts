/**
 * Japanese copy for a place's "where" line (see docs/i18n/ja.md §3.7, §3.8, §8).
 *
 * Why the country stays last: the curated sublabels read small → large joined with 、 (グルーム・レイク、ネバダ州、
 * アメリカ), and the geocoder's lines beside them must read the same way. `rest` is the geocoder's data, often in
 * English order with its own ASCII commas ("Paris, Île-de-France"): it is kept whole, and only the join before the
 * browser's country name (Intl long style with the code's overrides) is Japanese: `Ontario、カナダ`.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}、${country}`),
}
export default geo
