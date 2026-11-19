/**
 * Indonesian copy for places (see docs/i18n/id.md §5.1). A "where" line lists the most specific part first and the
 * country last, joined by a comma, as Indonesian addresses do: "Ontario, Kanada". The geocoder's part stays one opaque
 * piece, exactly as it came; only the country (from the browser's CLDR names) is in Indonesian.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
