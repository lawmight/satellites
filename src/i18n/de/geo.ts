/**
 * German copy for places (src/imagery/geocode.ts; see docs/i18n/de.md §5.1, §6.7): how a place's "where" line is put
 * together on screen.
 *
 * Why it is the English join: German writes a region before its country with a comma, exactly as English does
 * (`Ontario, Kanada`, `Bavaria, Deutschland`). `rest` is the geocoder's data (usually English, §5.1) and is kept whole,
 * never inflected or re-punctuated; `country` arrives in German from Intl.DisplayNames (`USA`, `Vereinigtes
 * Königreich`, §6.7). A line that is the country alone is just the country.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
