/**
 * Dutch copy for places (src/imagery/geocode.ts; see docs/i18n/nl.md §5, §8): how a place's "where" line is put
 * together on screen.
 *
 * Why it is only a comma: `rest` is the geocoder's own text (usually English: "Ontario", "Bus stop, Ushuaia") and is
 * data, kept whole and never re-punctuated, inflected or given an article (§5); `country` already comes in Dutch from
 * the browser (Intl.DisplayNames, used as it comes, §8). Dutch lists the most specific part first, with commas, as
 * English does, so the line reads `Ontario, Canada`, `Paris, Île-de-France, Frankrijk`.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
