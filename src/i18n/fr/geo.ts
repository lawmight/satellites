/**
 * French copy for places (src/imagery/geocode.ts; see docs/i18n/fr.md §5.1, §8): how a place's "where" line is put
 * together on screen.
 *
 * Why it is only a comma: `rest` is the geocoder's own text (usually English: "Ontario", "Bus stop, Ushuaia") and is
 * data, kept whole and never re-punctuated, inflected or given an article; `country` already comes in French from the
 * browser (Intl.DisplayNames). French joins the two the way English does, so the line reads «Ontario, Canada»,
 * «Paris, Île-de-France, France».
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
