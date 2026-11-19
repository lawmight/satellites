/**
 * Arabic copy for a place's "where" line (see docs/i18n/ar.md §3.7 "Small namespaces", §5.1, §5.5). The geocoder's
 * part is data, kept whole and exactly as it came (often Latin, with its own commas); only the country is Arabic (the
 * browser's CLDR name, «كندا», «الإمارات العربية المتحدة»).
 *
 * Why only an Arabic comma: joins inside messages use «، » (ar.md §5.5), and no preposition or article is added,
 * since none could attach to an arbitrary name (§5.1).
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}، ${country}`),
}
export default geo
