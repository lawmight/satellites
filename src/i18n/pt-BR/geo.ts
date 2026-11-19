/**
 * Brazilian Portuguese copy for a place's "where" line (see docs/i18n/pt-BR.md §5, §8). The geocoder's part is data,
 * kept whole as it came; only the country is in Portuguese (the browser's own CLDR names: *Canadá*, *Territórios
 * palestinos*, never overridden), joined after a comma as Portuguese addresses are written (*Ontario, Canadá*). No
 * article or preposition is added: none could agree with an arbitrary name, and *de / em* would have to contract with
 * one.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
