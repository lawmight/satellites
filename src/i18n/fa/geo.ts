/**
 * Persian copy for a place's "where" line (see docs/i18n/fa.md §5.1, §5.5). The geocoder's part is data, kept whole
 * and exactly as it came (often Latin, with its own commas); only the country is Persian (the browser's CLDR name,
 * «کانادا», «امارات متحدهٔ عربی»).
 *
 * Why only a Persian comma: a where line is a list, most specific first, and Persian lists are joined with «، » (and
 * so are its parts, once the place-name table names them: `parts`).
 * Nothing attaches to the name, which Persian never needs to inflect.
 */
import type en from '../en/geo'

const geo: typeof en = {
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}، ${country}`),
  // Once the table names the parts too (تورنتو، انتاریو، کانادا), the whole line is one Persian list.
  parts: '، ',
}
export default geo
