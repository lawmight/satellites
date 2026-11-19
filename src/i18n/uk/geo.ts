/**
 * Ukrainian copy for a place's "where" line (see docs/i18n/uk.md §5.1, §8). The geocoder's part is data, kept whole
 * as it came; only the country is in Ukrainian (the browser's own CLDR names, «Україна», «Канада»), joined after a
 * comma as Ukrainian addresses are written («Онтаріо, Канада»). No preposition is added: none could agree with an
 * arbitrary name.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
