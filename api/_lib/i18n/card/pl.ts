/**
 * Polish copy for the share card and the share page (see docs/i18n/pl.md §3.1, §3.3, §3.5, §5, §6, §7): every word the
 * card prints and every word the server writes around it. Pure TypeScript, no DOM, Node or src/ imports: the server
 * reads it through cardMessages('pl'), and the app's pl bundle lists this very module.
 *
 * Why it is built this way:
 *  - Polish cannot inflect an inserted name, so the place stands only where the nominative is grammatical: first, as
 *    the subject of a verbless frame (the accent block «*Waterloo*», then «pod okiem 31 satelitów.»), or before a colon
 *    («Waterloo: przelot satelity…», «Waterloo: co obserwowało to miejsce…»). Sentences after it say «to miejsce» /
 *    «tu». The headline's order is the place first, the lead after it, as its own condensed block.
 *  - "Watched" with a place is «pod okiem» ("under the eye of"), which echoes the hero's «obserwowało» and takes the
 *    genitive: «pod okiem 1 satelity», «pod okiem 3 / 256 satelitów». Zero is its own frame: «poza zasięgiem znanych nam
 *    satelitów». The verdict frames mirror the lanes: «pod okiem» · «w kadrze» · «w zasięgu» · «przelot».
 *  - The satellite always follows its classifier «satelita» (m.), so its past tense is always «przeleciał», whatever the
 *    name; in a nominal frame it is the genitive «satelity [SAT]». A nameless one is «satelita» alone, or «nieznanego
 *    satelity» after «z». These frames get no satellite category, so a crewed station is «satelita» too (true: a
 *    station is an artificial satellite).
 *  - Height is always «na wysokości 795 km»: «przeleciał 795 km» would read as a distance flown (§3.4).
 *  - Dates come from Intl at the place's zone: «niedz., 1 lis 2026» in the stamp (CLDR's own abbreviations), the
 *    genitive month in prose («1 listopada 2026», no «r.»), never a weekday after a preposition («7 dni do 1 lis 2026»).
 *  - Prose compass words are Polish, «na» + accusative («lecąc na południowy zachód»).
 *  - Card text keeps one-letter words with the next word, numbers with their noun or unit, and the last short token of
 *    a satellite name with the one before it («Landsat 9», «Legion 4», as no-break spaces). A whole multi-word name is
 *    not tied: a long one would become one unbreakable word wider than the 466 px column.
 */
import { fmt } from '../format.js'
import { formatDate } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('pl')

// ── Days at the place, from Intl ────────────────────────────────────────────────────────────────────────────────────

/** «niedz., 1 lis 2026»: the card is the one place a short date carries the year */
const dayYear = (ms: number, timeZone: string) =>
  formatDate('pl', ms, timeZone, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
/** «1 lis 2026» (after a preposition: no weekday) */
const dateYear = (ms: number, timeZone: string) => formatDate('pl', ms, timeZone, { day: 'numeric', month: 'short', year: 'numeric' })
/** «3 lis» */
const dayMonth = (ms: number, timeZone: string) => formatDate('pl', ms, timeZone, { day: 'numeric', month: 'short' })
/** «1 listopada 2026» (prose: the genitive month, correct after a number) */
const dateProse = (ms: number, timeZone: string) => formatDate('pl', ms, timeZone, { day: 'numeric', month: 'long', year: 'numeric' })

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** A whole count, or a fraction kept (its plural form is `other`) */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** Genitive after «pod okiem»: «1 satelity», «3 / 256 satelitów», «1,5 satelity» */
const satGen = (n: number) => f.plural(n, { one: 'satelity', few: 'satelitów', many: 'satelitów', other: 'satelity' })
/** «pod okiem 31 satelitów»; zero: «poza zasięgiem znanych nam satelitów» */
const watched = (n: number) => (n > 0 ? `pod okiem ${count(n)}\u00a0${satGen(n)}` : 'poza zasięgiem znanych nam satelitów')
/** «obraz · obrazy · obrazów · obrazu» */
const images = (n: number) => f.plural(n, { one: 'obraz', few: 'obrazy', many: 'obrazów', other: 'obrazu' })

/** A satellite's name in display text: its last short token kept with the one before it («Landsat 9», «NORAD 60989») */
const tie = (sat: string) => sat.replace(/ (?=\S{1,5}$)/u, '\u00a0')
/**
 * Display names of the crewed stations (src/engine/profiles.ts: ISS, Tiangong). No message carries a crewed flag, so
 * the overhead frames recognise them by name, as the Arabic card does: «przelot stacji ISS», «stacja ISS przeleciała».
 */
const CREWED = /^(ISS|Tiangong)\b/
const isStation = (s: SatName) => s !== undefined && CREWED.test(s)
/** «satelity Sentinel-2C» / «satelity» (genitive, in a headline's nominal frame) */
const ofSat = (s: SatName) => (s !== undefined ? `satelity ${tie(s)}` : 'satelity')
/** «satelita Sentinel-2C» / «satelita» (the subject of a sentence after the place's colon) */
const satSubj = (s: SatName) => (s !== undefined ? `satelita ${s}` : 'satelita')
/** «z satelity Sentinel-2C» / «z nieznanego satelity» */
const fromSat = (s: SatName) => (s !== undefined ? `z satelity ${s}` : 'z nieznanego satelity')
/** The headline's serif block: the place alone (Polish keeps the full stop at the end of the lead, §3.3) */
const head = (place: string) => accent(place)

/** Moving or offset: «na» + accusative, 0 north … 7 northwest */
const MOTION = [
  'na północ',
  'na północny wschód',
  'na wschód',
  'na południowy wschód',
  'na południe',
  'na południowy zachód',
  'na zachód',
  'na północny zachód',
]
/** « 1 listopada 2026 o 11:21 EST» */
const at = (w?: CardWhen) => (w ? ` ${dateProse(w.ms, w.timeZone)} o ${w.clock} ${w.zone}` : '')
/** «, lecąc na południe» (an adverbial participle: its subject is the sentence's satellite, and it has no gender) */
const moving = (heading?: number) => (heading !== undefined && MOTION[heading] ? `, lecąc ${MOTION[heading]}` : '')

const pl: CardMessages = {
  // ── The headline: the place first, in the serif; the verbless lead after it ────────────────────────────────────────

  // `cut` needs nothing: the full stop ends the lead, not the place (§3.3).
  headline: (satellites: number, place: string, _cut: boolean): Rich => [head(place), `${watched(satellites)}.`],
  headlineBy: {
    imaged: (s: SatName, place: string, _cut: boolean): Rich => [head(place), `pod okiem ${ofSat(s)}.`],
    likely: (s: SatName, place: string, _cut: boolean): Rich => [head(place), `w\u00a0kadrze ${ofSat(s)}.`],
    could: (s: SatName, place: string, _cut: boolean): Rich => [head(place), `w\u00a0zasięgu ${ofSat(s)}.`],
    // The colon closes the place's serif block, as its own part (punctuation alone is not counted toward its lines).
    overhead: (s: SatName, place: string, _cut: boolean): Rich => [
      accent(place, ':'),
      `przelot ${s !== undefined && isStation(s) ? `stacji ${tie(s)}` : ofSat(s)}.`,
    ],
  },
  headlineWeek: (satellites: number, place: string, _cut: boolean): Rich => [head(place), `${watched(satellites)} w\u00a0tym tygodniu.`],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  // «Opublikowano» agrees with nothing, so only the noun changes; removing «co najmniej» changes no other word.
  photos: (n: number, atLeast: boolean) =>
    n <= 0 ? 'Nie opublikowano żadnych obrazów.' : `Opublikowano ${atLeast ? 'co\u00a0najmniej ' : ''}${count(n)}\u00a0${images(n)}.`,
  archiveDown: 'Archiwa nie odpowiedziały, więc na razie nie możemy policzyć publicznych obrazów.',
  archiveDownShort: 'Archiwa obrazów nie odpowiedziały.',
  cloud: {
    only: {
      sub: (_pct: number) => 'Zachmurzone. Widać tylko chmury.',
      chip: (pct: number) => `Zachmurzone · ${f.int(pct)}%`,
      post: (_pct: number) => 'Widać tylko chmury.',
      desc: (pct: number) => `Widać tylko chmury (${f.int(pct)}%).`,
    },
    mostly: {
      sub: (pct: number) => `Głównie chmury: ${f.int(pct)}% sceny.`,
      chip: (pct: number) => `Głównie chmury · ${f.int(pct)}%`,
      post: (pct: number) => `Widać głównie chmury (${f.int(pct)}%).`,
      desc: (pct: number) => `Widać głównie chmury (${f.int(pct)}%).`,
    },
    // «Chmury», plural, in all four, as the glossary's chip word and the app's own chip for the same state
    // (passView.tag.cloudedAtSpot «Chmury nad punktem»): the post and the description already said «Chmury zakryły».
    spot: { sub: 'Chmury nad samym punktem.', chip: 'Chmury nad punktem', post: 'Chmury zakryły ten punkt.', desc: 'Chmury zakryły ten punkt.' },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock} ${zone}`,
  weekTo: (ms: number, timeZone: string) => `7\u00a0dni do ${dateYear(ms, timeZone)}`,
  lastWeek: 'Ostatnie 7\u00a0dni',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: 'Wysokość',
    elevation: 'Elewacja',
    speed: 'Prędkość',
    offNadir: 'Od pionu',
    pixel: 'Piksel',
    mosaicPixel: 'Piksel mozaiki',
    closest: 'Najbliżej',
  },
  // The results' lanes (§3.6): the longest, «W zasięgu» / «Nad głową», is 9 characters in the 116 px column.
  lane: { imaged: 'Obraz', likely: 'W\u00a0kadrze', could: 'W\u00a0zasięgu', overhead: 'Nad głową' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) =>
    metres >= 1000 ? `${f.int(metres / 1000)}\u00a0km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)}\u00a0m`,
  distance: (km: number) => `${f.int(km)}\u00a0km`,
  // A round length (1, 2 or 5 × 10ⁿ, or half of one: 2.5 must not round to 3)
  scale: (km: number) => (km >= 1 ? `${count(km)}\u00a0km` : `${f.int(km * 1000)}\u00a0m`),
  // As long as the English (24): the chip shares the drawing's top edge with the scale bar, and «Geometria przelotu ·
  // północ u góry» (34) ran into it on the share sheet's preview.
  geometry: 'Geometria · północ u\u00a0góry',
  note: {
    imageInApp: 'Obraz zobaczysz w\u00a0aplikacji',
    imageUnavailable: 'Obraz chwilowo niedostępny',
    commercial: 'Archiwum komercyjne, niepubliczne',
    inSwath: 'W\u00a0kadrze, jeszcze bez publicznego obrazu',
    groundTrack: 'Ślad orbity przy największym zbliżeniu',
  },
  acquiring: 'Pobieranie…',
  // «zdjęcia» mirrors the English "photo" key by key (§0); the count line beside it says «obrazów».
  noPublicPhoto: 'Brak publicznego zdjęcia w\u00a0tym tygodniu',
  noPhoto: 'Brak zdjęcia do pokazania',
  look: {
    // The gallery's chip words (gallery.lead): «Ujęcie z najbliższa», never «najbliższe ujęcie» ("the next shot").
    closest: 'Ujęcie z\u00a0najbliższa',
    // «Ostatnie bezchmurne ujęcie» would leave ~2 px on the 582 px chip with a day, a name and a pixel (§3.5).
    lastClear: 'Ostatnie bez chmur',
    clouded: 'Zachmurzone',
    radar: 'Radar',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  // A lone label (chips, the plan plate's callout); sentences say «satelita» / «nieznanego satelity» themselves.
  aSatellite: 'Satelita',
  // 247 px beside the 152 px host, in the 466 px row (§3.1).
  invite: 'Zobacz, co cię obserwowało',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────

  // Four lines: «w tym tygodniu.» measures 477–490 px against the 466 px column; the widest line here, «obserwowało»,
  // is 402 px. «w tym» is one part, so it stays on one line (§3.1).
  hero: [['Coś ', accent('cię')], ['obserwowało'], ['w tym'], ['tygodniu.']] as Rich[],
  // The full «…na Ziemi» (329 px) overflows the footer row beside the host (§3.1).
  enterAnyPlace: 'Wpisz dowolne miejsce',
  defaultPlace: 'Palm Jumeirah',
  // «wyspy» carries the case, so the curated name stays as it is; the alt quotes the card's shortened footer exactly.
  defaultAlt:
    'Prawdziwe zdjęcie wyspy Palm Jumeirah w Dubaju z satelity Sentinel-2, obok napis: Coś cię obserwowało w tym tygodniu. Wpisz dowolne miejsce.',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: 'Coś cię obserwowało w\u00a0tym tygodniu.',
    // The landing's sub line with 7 days; «nad nim» is «miejsce» (n.), never a place's name.
    description:
      'Wpisz dowolne miejsce na Ziemi. Zobacz wszystkie satelity, które przeleciały nad nim w\u00a0ostatnich 7\u00a0dniach, i\u00a0ich prawdziwe zdjęcia.',
    // A heading: no full stop.
    placeTitle: (place: string) => `${place}: co obserwowało to miejsce w\u00a0tym tygodniu`,
    placeDescription: (place: string) =>
      `${place}: wszystkie satelity, które przeleciały tu w\u00a0ostatnich 7\u00a0dniach, i\u00a0ich prawdziwe zdjęcia. Co cię obserwowało w\u00a0tym tygodniu?`,
    // «aplikacji» carries the case, so the brand stays as it is.
    opening: ['Otwieranie aplikacji ', accent('Watched')] as Rich,
  },
  // «[PLACE]: satelita [SAT] przeleciał tu 1 listopada 2026 o 11:21 EST na wysokości 795 km, lecąc na południe.»
  // The time comes before the height, as in the pass sentence (§3.4): «795 km 1 listopada» would run two numbers
  // together (§5.3). Lowercase after the colon (§6.7). Without an altitude the place is said in full: «przeleciał nad
  // tym miejscem».
  // An overhead pass of a crewed station: «stacja ISS przeleciała» (f.).
  crossed: (p: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) => {
    const station = p.verdict === 'overhead' && isStation(p.sat)
    const flew = station ? `stacja ${p.sat} przeleciała` : `${satSubj(p.sat)} przeleciał`
    const where =
      p.altitudeKm !== undefined ? ` tu${at(p.when)} na wysokości ${f.int(p.altitudeKm)}\u00a0km` : ` nad tym miejscem${at(p.when)}`
    return `${p.place}: ${flew}${where}${moving(p.heading)}.`
  },
  withinView: (p: PassFacts) => `${p.place}: ${satSubj(p.sat)} był w zasięgu${at(p.when)}${moving(p.heading)}.`,
  // Follows `withinView`, whose subject is «satelita» (m.): «Mógł».
  couldHave: 'Mógł tu spojrzeć. Operator nie podaje, czy tak było.',
  // These follow `crossed` on an 'imaged' share, whose subject is «satelita» (m.), so the masculine past is right: an
  // 'imaged' pass is never a crewed station. They name no camera, because the sensor may be Sentinel-1's radar (§0).
  straightDown: 'Patrzył prosto w dół.',
  offNadir: (deg: number) => `Patrzył pod kątem ${f.dec(deg, 1)}° od pionu.`,
  cloudCover: (pct: number) => `Zachmurzenie: ${f.int(pct)}%.`,
  // The place cannot be the subject of a past tense («Katowice było» ✗); the first sentence has already named it.
  inSwath: (_place: string) => 'To miejsce było w kadrze jego kamery.',
  bestFrom: {
    closest: (s: SatName) => `Ujęcie z najbliższa pochodzi ${fromSat(s)}.`,
    lastClear: (s: SatName) => `Ostatnie bezchmurne ujęcie pochodzi ${fromSat(s)}.`,
    first: (s: SatName) => `Pierwszy obraz pochodzi ${fromSat(s)}.`,
  },
  question: 'Co cię obserwowało w\u00a0tym tygodniu?',
  cardAlt: {
    withPhoto: (s: SatName) => `Karta do udostępnienia: ujęcie tygodnia z najbliższa, ${fromSat(s)}.`,
    plain: 'Karta do udostępnienia.',
  },
}

export default pl
