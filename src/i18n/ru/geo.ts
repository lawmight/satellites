/**
 * Russian copy for a place's "where" line (see docs/i18n/ru.md §5.1, §8). The geocoder's part is data, kept whole as
 * it came; only the country is in Russian (the browser's own CLDR names, «Украина», «Канада»), joined after a comma as
 * Russian addresses are written («Онтарио, Канада»). No preposition is added: none could agree with an arbitrary name,
 * and «в / на» before a country is exactly the choice §8 keeps out of the copy.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
