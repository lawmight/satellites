/**
 * Polish copy for a place's "where" line (src/imagery/geocode.ts; see docs/i18n/pl.md §5.1). `rest` is the geocoder's
 * own text and `country` comes from Intl.DisplayNames('pl') («Kanada», «Niemcy», «Stany Zjednoczone»): both are
 * nominative labels, so they are only ever joined by a comma, never put after a preposition that would need a case
 * the code cannot give.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
