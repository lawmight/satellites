/**
 * Spanish copy for a place's "where" line (see docs/i18n/es.md §5, §8). The geocoder's part is data, kept whole as it
 * came; only the country is in Spanish (the browser's own CLDR names: *Canadá*, *Territorios Palestinos*), joined after
 * a comma as Spanish addresses are written (*Ontario, Canadá*). No article or preposition is added: none could agree
 * with an arbitrary name.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
