/**
 * Turkish copy for places (src/imagery/geocode.ts; see docs/i18n/tr.md §5.1, §8.4, §8.5): how a place's "where" line
 * is put together on screen.
 *
 * Why it is the English join: Turkish writes a region before its country with a comma, as English does (`Ontario,
 * Kanada`, `Bavaria, Almanya`), and a comma is the one join that puts no suffix on either side (§5.1). `rest` is the
 * geocoder's data and is kept whole, never inflected, re-cased or re-punctuated (§8.5); `country` arrives in Turkish
 * from Intl.DisplayNames (`Amerika Birleşik Devletleri`, `Kıbrıs`, §8.4). A line that is the country alone is just the
 * country.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
