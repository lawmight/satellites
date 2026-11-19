/**
 * Simplified Chinese copy for a place's "where" line (see docs/i18n/zh-Hans.md §4.3, §5.1, §8).
 *
 * Why the country comes first: Chinese writes a place from large to small (美国内华达州格鲁姆湖), so the one word in
 * Chinese, the country from the browser's own CLDR names (加拿大, 中国香港特别行政区), leads the line. The geocoder's
 * part is data in English order ("Paris, Île-de-France"), kept whole with its own commas; the house separator ` · `
 * (the usual Chinese location-tag form, 中国 · 北京) sits between the two, so the line reads the same whether the
 * rest is Latin or Han and never mixes a full-width comma into the geocoder's ASCII ones: `加拿大 · Ontario`.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${country} · ${rest}`),
}
export default geo
