/**
 * Traditional Chinese copy for a place's "where" line (see docs/i18n/zh-Hant.md §5.1, §8).
 *
 * Why the country comes last: `rest` is one opaque piece of geocoder data written small to big ("Ontario", "Paris,
 * Île-de-France"), and the guide keeps that order rather than reorder data it cannot split, so the country (the
 * browser's own zh-Hant name: 加拿大, 香港) follows it after a full-width comma: `Ontario，加拿大`. When the browser has
 * no Chinese name for the country, the code keeps the English one ("Canada"); with no Han on either side the two
 * pieces take the English comma, so the line never reads `Ontario，Canada`.
 */
import type en from '../en/geo'

const HAN = /\p{Script=Han}/u

const geo: typeof en = {
  where: (rest: string | undefined, country: string) =>
    rest === undefined ? country : `${rest}${HAN.test(rest + country) ? '，' : ', '}${country}`,
}
export default geo
