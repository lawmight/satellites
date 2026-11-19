/**
 * Korean copy for places (see docs/i18n/ko.md §3.7 geo, §5.2, §8): how a place's "where" line is put together.
 *
 * Why it reads this way: `rest` is English data written specific-first ("Ontario", "Paris, Île-de-France"), and the
 * country (from Intl.DisplayNames) closes it, so the line keeps that order (Ontario, 캐나다) rather than the Korean
 * address order, which would put the country first and split a datum the code must keep whole. The comma is the one
 * join that needs no particle after either part.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
}
export default geo
