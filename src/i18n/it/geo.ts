/**
 * Italian copy for a place's "where" line (see docs/i18n/it.md §5.1, §8). The geocoder's part is data, kept whole as it
 * came; only the country is in Italian (the browser's own CLDR names: *Canada*, *Territori Palestinesi*, accepted as
 * Intl writes them), joined after a comma as Italian addresses are written (*Ontario, Canada*). No article or
 * preposition is added: Italian would need the place's gender and kind (*il Texas*, *in Francia*), which the code
 * cannot know.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
