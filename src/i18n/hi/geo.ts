/**
 * Hindi copy for a place's "where" line (see docs/i18n/hi.md §5.1, §8). The geocoder's part is data, kept whole as it
 * came; only the country is in Hindi (the browser's own CLDR names, «कनाडा», «भारत»), joined after a comma as Hindi
 * addresses are written («Ontario, कनाडा»). No postposition is added: the line is a label, not a sentence.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
