/**
 * The Korean names of four places Korean readers know by their own name (owner, 2026-11-19; docs/i18n/ko.md §8):
 * 동해, 독도, 백두산 and 황해, shown where the place data (the offline list, and the geocoders asked in English) says Sea
 * of Japan, Liancourt Rocks, Paektu-san or Yellow Sea, in the spellings the data uses. Display only, the name and
 * nothing else: the where line stays the data's, and the usage stats, record_lookup, links and shares keep the English
 * label (src/imagery/exonyms.ts).
 *
 * Why by country: a name applies in the country the data puts the place in (Paektu-san: China in GeoNames, North Korea
 * in OpenStreetMap), and a sea has no country, so the seas are countryless names. A restaurant called "Sea of Japan"
 * in Tokyo or a bar called "Yellow Sea" in Greece has a country, and keeps its name. Every name is also countryless,
 * for a place opened from a link, which carries no country. Takeshima is also the name of other islands in Japan, so
 * it is renamed only where the data puts it in Korea.
 */
import type en from '../en/exonyms'

const NAMES: [shown: string, english: readonly string[], countries: readonly string[]][] = [
  ['동해', ['Sea of Japan', 'Japan Sea', 'East Sea'], []],
  ['독도', ['Liancourt Rocks', 'Dokdo', 'Tokdo'], ['KR', 'JP']],
  ['독도', ['Takeshima'], ['KR']],
  ['백두산', ['Paektu-san', 'Paektusan', 'Paektu Mountain', 'Mount Paektu', 'Baekdusan', 'Baekdu Mountain', 'Mount Baekdu', 'Changbai Mountain', 'Changbai Shan', 'Changbaishan'], ['CN', 'KP', 'KR']],
  ['황해', ['Yellow Sea'], []],
]

const exonyms: typeof en = {
  names: ['', 'KR', 'JP', 'CN', 'KP']
    .map((cc) => {
      const here = NAMES.filter(([, , countries]) => !cc || countries.includes(cc))
      return `${cc}:${here.flatMap(([shown, english]) => english.map((e) => `${e}=${shown}`)).join(';')}`
    })
    .join('|'),
}
export default exonyms
