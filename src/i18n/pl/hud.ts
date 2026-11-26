/**
 * Polish copy for the HUD, the instrument chrome in the four corners (see docs/i18n/pl.md §3.7, §5.5): the About
 * link, the replay clock's line, the orbit catalog's status and the sub-solar readout.
 *
 * Why these words: every corner line is a mono label (uppercased by CSS), so the words are nouns in the nominative,
 * kept about as short as the English (on a 375 px phone «Jak to działa» and the sun line nearly touch). The replay
 * clock is «Powtórka», never «Scena», which is the archive's whole tile elsewhere. Ages use the abbreviations Intl's
 * short style prints («min», «godz.», which never change with the number), and days, which do, take pl's plural
 * forms («1 dzień», «3 dni»); «Nieaktualny» agrees with «katalog». Coordinates, clocks, ISO stamps and "GMST" arrive
 * as they are, in international notation.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('pl')

/** A count as it is set: grouped from five digits («12 847»), a fraction kept (its plural form is `other`). */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))

/** The catalog's compact age: «<1 min», «42 min», «5 godz.», «1 dzień», «3 dni». */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1\u00a0min'
  if (unit === 'minute') return `${count(n)}\u00a0min`
  if (unit === 'hour') return `${count(n)}\u00a0godz.`
  return `${count(n)}\u00a0${f.plural(n, { one: 'dzień', few: 'dni', many: 'dni', other: 'dnia' })}`
}

const hud: typeof en = {
  about: 'Jak to działa',
  sourceLink: 'Kod źródłowy',
  sourceLinkLabel: 'Kod źródłowy w serwisie GitHub',
  home: 'Watched, strona główna',
  regionTime: 'Czas',
  regionCatalog: 'Katalog orbit',
  regionSun: 'Słońce',

  scene: 'Powtórka',
  sun: (lat: string, lon: string) => `Słońce ${lat} ${lon}`,
  subsolar: 'Punkt podsłoneczny',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) =>
    `${count(n)}\u00a0${f.plural(n, { one: 'obiekt', few: 'obiekty', many: 'obiektów', other: 'obiektu' })}`,
  objectsPending: (count: string): Rich => [num(count), '\u00a0Obiekty'],
  catalog: 'Katalog',
  fetched: (stamp: string) => `Pobrano ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Nieaktualny, ' : ''}${age(unit, n)} temu`,
  catalogUnavailable: 'Katalog niedostępny',
  catalogLoading: 'Wczytywanie katalogu',
}
export default hud
