/**
 * Polish copy for the passes: the list grouped by verdict and the view of one pass (see docs/i18n/pl.md §3.4, §3.7,
 * §4.1, §5.3, §6.6, §7).
 *
 * Why it is built this way:
 *  - Every verdict counts passes, so the unit is «przelot» in pl's four plural forms (1 przelot · 3 przeloty · 31
 *    przelotów · 1,5 przelotu) whatever the group; satellites are counted in full words («12 satelitów»): Polish has no
 *    abbreviation for them.
 *  - A quantifier never agrees with a number: «Pokaż wszystkie satelity (31)», «Pokaż jeszcze 40» (§5.3). What is left
 *    agrees in the verb instead: «został 1 · zostały 3 · zostało 120».
 *  - Labels are nouns in the nominative, in sentence case (CSS uppercases them). Readouts keep the international forms
 *    they arrive in (compass points «SSW», UTC clocks, NORAD ids); the only abbreviations are the guide's («na płn.»,
 *    «na płd.», «wzgl.», «min»). Off-nadir is «od pionu» everywhere, elevation «elewacja» in the strip and «nad twoim
 *    horyzontem» in the geometry, so the strip's degrees need no "up" after them.
 *  - The place is never named in a sentence («tego punktu», «tego przelotu»): the panel's header names it (§5.1). The
 *    satellite follows its classifier («Ten przelot satelity Sentinel-2C»), so no name is ever declined (§5.2).
 */
import type en from '../en/passView'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'
import type { Verdict } from '@/ui/results/lib/meta'

const f = fmt('pl')

/** A whole count, or a fraction kept (its plural form is `other`) */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** «przelot · przeloty · przelotów · przelotu»: the form a number takes (every verdict counts passes, DESIGN §7) */
const passes = (n: number) => f.plural(n, { one: 'przelot', few: 'przeloty', many: 'przelotów', other: 'przelotu' })
/** «1 przelot», «3 przeloty», «31 przelotów» */
const passCount = (n: number) => `${count(n)}\u00a0${passes(n)}`
/** «Sentinel-2C, niedz., 1 lis 16:14»: the day holds its own comma, the clock follows it */
const who = (sat: string, day: string, time: string) => `${sat}, ${day} ${time}`
/** «co minutę», «co 2 minuty», «co 10 minut», «co kilka minut» (co + accusative) */
const cadence = (min?: number) =>
  !min
    ? 'co kilka minut'
    : min === 1
      ? 'co minutę'
      : `co ${count(min)}\u00a0${f.plural(min, { one: 'minutę', few: 'minuty', many: 'minut', other: 'minuty' })}`

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty:
    'Żaden znany nam satelita nie przeleciał tu w\u00a0tym okresie. To się rzadko zdarza. Uwagi powyżej podają, czy któreś źródło danych nie działało.',
  // The lead chip's «z najbliższa» (never «najbliższe», which reads "upcoming", §9), near the English's length (25):
  // «od ujęcia z najbliższa, potem najnowsze» (39) ran past the panel's edge beside «Pod okiem» at 1280.
  imagedOrder: 'z\u00a0najbliższa, potem najnowsze',
  count: (n: number, _verdict: Verdict) => passCount(n),
  countStack: (n: number, _verdict: Verdict): NumPart => num(count(n), passes(n)),
  sats: (n: number) => `${count(n)}\u00a0${f.plural(n, { one: 'satelita', few: 'satelity', many: 'satelitów', other: 'satelity' })}`,
  showAllSats: (n: number) => `Pokaż wszystkie satelity (${f.int(n)})`,
  showAllRows: (n: number) => `Pokaż wszystkie wiersze (${f.int(n)})`,
  showMore: (n: number) => `Pokaż jeszcze ${f.int(n)}`,
  // The verb agrees with the count: «został 1», «zostały 3», «zostało 120» (many: neuter singular).
  left: (n: number) =>
    f.plural(n, { one: `został ${count(n)}`, few: `zostały ${count(n)}`, many: `zostało ${count(n)}`, other: `zostało ${count(n)}` }),
  showFewer: 'Pokaż mniej',
  tag: {
    mosaic: 'Mozaika',
    radar: 'Radar',
    cloudedPct: (pct: number) => `Pochmurne · ${f.int(pct)}%`,
    cloudedAtSpot: 'Chmury nad punktem',
  },
  // «Sentinel-2C, pod okiem, piątek, 6 listopada 16:14 EST, 41 godzin temu, zachmurzenie 25 procent». «procent» does
  // not decline after a numeral (§5.3); a screen reader would read «%» without a case.
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day} ${o.time} ${o.zone}`,
      o.ago,
      o.cloudPct !== undefined ? `zachmurzenie ${f.int(o.cloudPct)} procent` : undefined,
      o.clouded ? 'zachmurzone' : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  offNadir: (deg: number) => `${f.dec(deg, 1)}° od pionu`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)}\u00a0km`,
  cloudPct: (pct: number) => `chmury ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `Powiększ zdjęcie: ${who(sat, day, time)}`,
  expandTitle: 'Powiększ zdjęcie',
  // «ostatni» agrees with the «przelot» it stands for.
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${passCount(o.passes)}, ostatni: ${o.day} ${o.time}`,
  // Adverbs, which agree with nothing: Intl's short day follows («Ostatnio niedz., 1 lis»), and «Ostatni niedz.» would
  // read as a gender error («ostatnia niedziela»). «Najbliżej», never «Najbliższy», which reads "the next one".
  latest: 'Ostatnio ',
  closest: 'Najbliżej ',
  cloudChip: 'Chmury',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'Zdjęcia',
  planSection: 'Widok z\u00a0góry',
  geometry: 'Geometria',
  // «Powtórka», never «Scena», which would collide with the archive's «scena» (§3.7).
  replay: 'Powtórka',
  // Only weather satellites (geostationary watchers) take this note, so the masculine «Satelita rejestrował» is right.
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `Obraz pełnej tarczy: jedno zdjęcie wszystkiego, co widzi satelita, tutaj ${pixel} na piksel. Mało szczegółowe, ale prawdziwe i\u00a0najnowsze z\u00a0opublikowanych. Satelita rejestrował takie obrazy ${cadence(cadenceMin)} przez cały tydzień.`,
  // «NASA łączy»: the present tense, so NASA (feminine) agrees with nothing.
  mosaicNote: (gsdM: number) =>
    `Dzienna mozaika: NASA co dzień łączy pasy obrazowania w\u00a0jedno zdjęcie, ${f.int(gsdM)}\u00a0m na piksel. Mało szczegółowa, ale prawdziwa, z\u00a0dnia tego przelotu.`,
  radarNote:
    'Obraz radarowy, nie zdjęcie: Sentinel-1 wysyła mikrofale i\u00a0rejestruje ich echo, więc chmury i\u00a0ciemność mu nie przeszkadzają. Jasność to siła odbicia: budynki i\u00a0nierówny teren są jasne, spokojna woda ciemna.',
  // The notes above and these footnotes alike: a one-letter word stays with the next one (§6.3).
  noImage: {
    openArchive: (sat: string) => `Ten przelot satelity ${sat} nie dał obrazu tego punktu. Widok przelotu z\u00a0góry.`,
    // Public against «prywatny» (the glossary's "private"), as the English contrasts them.
    radarPrivate: 'Brak publicznego obrazu: operator tego satelity radarowego ma prywatne archiwum. Widok przelotu z\u00a0góry.',
    commercialPrivate: 'Brak publicznego obrazu: archiwa komercyjne są prywatne. Widok przelotu z\u00a0góry.',
    noneToShow: 'Z\u00a0tego przelotu nie ma obrazu do pokazania. Widok przelotu z\u00a0góry.',
    archiveDown: 'Nie udało się teraz przeszukać archiwum. Widok przelotu z\u00a0góry.',
    noScene: 'Z\u00a0tego przelotu nie ma żadnej sceny. Widok przelotu z\u00a0góry.',
    notYet:
      'Nie opublikowano jeszcze żadnej sceny z\u00a0tego przelotu. Sceny z\u00a0satelitów Sentinel-2 i\u00a0Landsat pojawiają się zwykle w\u00a0ciągu doby.',
    crewed: 'Stacje załogowe mają kamery, ale ich zdjęć nie publikuje się według miejsca i\u00a0czasu.',
    unavailable: 'Obraz z\u00a0tego przelotu jest niedostępny.',
  },
  links: {
    openToSave: 'Otwórz obraz, by go zapisać',
    downloading: 'Pobieranie…',
    download: 'Pobierz obraz',
    viewSource: (archive: string) => `Źródło · ${archive}`,
  },
  spot: {
    checking: 'Odczyt piksela w\u00a0twoim punkcie…',
    clear: 'Czysto nad twoim punktem.',
    cirrus: 'Nad twoim punktem cienkie cirrusy; mogą zmiękczyć obraz.',
    cloud: 'Chmury nad twoim punktem.',
    shadow: 'Twój punkt był w\u00a0cieniu chmury.',
  },

  // ── the readout strip ───────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'Wysokość',
    elevation: 'Elewacja',
    offNadir: 'Od pionu',
    pixel: 'Piksel',
    band: 'Kanał',
    sun: 'Słońce',
    cloud: 'Chmury',
    // «Nad punktem» (88 px) fits the ~80 px cell where «Chmury w punkcie» (128 px) does not (§3.7).
    cloudAtSpot: 'Nad punktem',
  },
  // The adjectives agree with «kanał» (m.); «Kolor» is the noun.
  band: { infrared: 'Podczerwień', visible: 'Widzialny', colour: 'Kolor' },
  // At 21 px in the strip's last cell, no longer than the English «Cirrus»: «Cirrusy» ran past the panel's edge at 1280.
  // «Cirrus» is the genus' own name in Polish (chmury cirrus).
  spotValue: { clear: 'Czysto', cirrus: 'Cirrus', cloud: 'Chmury', shadow: 'Cień' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    // «Elewacja» already says "up": nothing follows the degrees.
    up: '',
    mosaic: 'mozaika',
    // «25% SCENY»: the whole scene's share, in the genitive
    scene: 'sceny',
    sun: { day: 'dzień', twilight: 'półmrok', night: 'noc' },
  },

  // ── 01 / Geometry ───────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'Najbliżej · UTC',
    closestLocal: 'Najbliżej · lokalnie',
    groundDistance: 'Odległość po ziemi',
    elevationFromYou: 'Nad twoim horyzontem',
    groundSpeed: 'Prędkość wzgl. ziemi',
    heading: 'Kurs',
    sunElevation: 'Wysokość Słońca',
    fieldOfRegard: 'Zasięg wychylenia',
    swath: 'Pas obrazowania',
    inSwath: 'W\u00a0kadrze',
    inView: 'W\u00a0zasięgu',
    window: 'Okno',
    noradPass: 'NORAD · przelot',
    scanUtc: 'Linia skanu tutaj · UTC',
    scanLocal: 'Linia skanu tutaj · lokalnie',
    aboveEquator: 'Nad równikiem na',
    inYourSky: 'Na twoim niebie',
    scanDirection: 'Kierunek skanu',
    lineSpeed: 'Prędkość linii tutaj',
    // «Obszar», never «Zasięg»: that is the could lane (§4.1).
    coverage: 'Obszar',
    thisScan: 'Ten skan',
    noradScan: 'NORAD · skan',
  },
  northToSouth: 'Północ → południe',
  southToNorth: 'Południe → północ',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'Dzień', twilight: 'Półmrok', night: 'Noc' },
  fullDisc: 'Pełna tarcza',
  everyMin: (n: number) => (n === 1 ? 'co minutę' : `co ${count(n)}\u00a0min`),
  // The label «Na twoim niebie» already says "up": the compass point alone (§3.7).
  upCompass: (compass: string) => compass,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'na płn.' : 'na płd.'}`,
}
export default passView
