/**
 * Polish copy for one pass's paragraph (see docs/i18n/pl.md §3.4, §5.1, §5.2, §6.6): the sentences under a pass's
 * picture or plan view, in the English order of facts (what crossed, when, where, how it moved → what that means for
 * the picture → what we can't know).
 *
 * Why it is built this way:
 *  - The past tense shows gender, and code doesn't know a satellite's: the name always follows the classifier
 *    «satelita» (m.), so «Satelita Sentinel-2C przeleciał…» is right for any name, and the name is never declined.
 *    These messages get no satellite category, so a crewed station is recognised by the display name the catalog
 *    gives it (/^(ISS|Tiangong)\b/, src/engine/profiles.ts), as the Arabic file does: the overhead sentence then says
 *    «Stacja ISS przeleciała…» (f.), and «darkStation», which English words for the station, says «stacja» too.
 *    Follow-up sentences that run for one non-crewed category only (the mosaic, the weather night, Sentinel-2 /
 *    Landsat, commercial and radar) may use the masculine without the classifier («zarejestrował», «mógł», «jego»).
 *  - The place is never named: Polish would need a case for it. Sentences say «to miejsce», «tu», «stąd»; the panel's
 *    header shows the name.
 *  - Height is always «na wysokości 786 km»: «przeleciał 786 km» would read as a distance flown.
 *  - Directions have two tables: motion and offset take «na» + accusative («lecąc na południe», «61 km na zachód
 *    stąd»), a point in your sky «na» + locative («na północnym zachodzie»). Readouts keep the international letters.
 *  - Adverbial participles («lecąc», «patrząc», «obejmując», «przesuwając się») belong to the sentence's subject, so
 *    an angle about the camera is «Z kamerą odchyloną…», never a participle.
 *  - "We can't know whether it did" is always «Nie da się sprawdzić, czy tak było.»
 *  - A one-letter word is tied to the next by a no-break space (§6.3); a number keeps its unit inside its num() part.
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('pl')

/** Where something moves, or where it lies from the place: «na» + accusative */
const MOTION: Record<Compass8, string> = {
  n: 'na północ',
  ne: 'na północny wschód',
  e: 'na wschód',
  se: 'na południowy wschód',
  s: 'na południe',
  sw: 'na południowy zachód',
  w: 'na zachód',
  nw: 'na północny zachód',
}
/** Where a point stands in your sky: «na» + locative */
const SKY: Record<Compass8, string> = {
  n: 'na północy',
  ne: 'na północnym wschodzie',
  e: 'na wschodzie',
  se: 'na południowym wschodzie',
  s: 'na południu',
  sw: 'na południowym zachodzie',
  w: 'na zachodzie',
  nw: 'na północnym zachodzie',
}

const km = (n: number) => num(f.int(n), 'km')
const deg1 = (n: number) => num(f.dec(n, 1), '°')
const clock = (time: string, zone: string) => num(time, zone)
/** Display names of the crewed stations (src/engine/profiles.ts: ISS, Tiangong): the messages carry no crewed flag */
const CREWED = /^(ISS|Tiangong)\b/
/** «na wysokości 786 km» / «na wysokości 786 km, 61 km na zachód stąd» (the offset after the height, never glued to it) */
const height = (altKm: number, offset?: Offset): Part[] =>
  offset ? [' na wysokości ', km(altKm), ', ', km(offset.km), ` ${MOTION[offset.dir]} stąd`] : [' na wysokości ', km(altKm)]
/** The subject and its verb: «nad tym miejscem» only when the satellite passed straight over (no offset) */
const crossedHead = (sat: string, offset?: Offset) =>
  offset ? `Satelita ${sat} przeleciał o\u00a0` : `Satelita ${sat} przeleciał nad tym miejscem o\u00a0`
/** «co minutę», «co 2 minuty», «co 10 minut» (co + accusative); the count in a num() part */
const MINUTES = { one: 'minutę', few: 'minuty', many: 'minut', other: 'minuty' }

const pass: typeof en = {
  // Polish cartography writes the international letters; a Polish «W» would read «wschód» (east), the opposite.
  compass16: {
    n: 'N',
    nne: 'NNE',
    ne: 'NE',
    ene: 'ENE',
    e: 'E',
    ese: 'ESE',
    se: 'SE',
    sse: 'SSE',
    s: 'S',
    ssw: 'SSW',
    sw: 'SW',
    wsw: 'WSW',
    w: 'W',
    wnw: 'WNW',
    nw: 'NW',
    nnw: 'NNW',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    // The present tense («nie przelatuje», «Wisi», «skanuje») shows no gender. The seat stays as it arrives, in
    // parentheses («(0.2°W)»): a comma decimal or a Polish «W» would misread it.
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `Satelita ${o.sat} nie przelatuje. Wisi `,
      km(o.altKm),
      o.seat !== undefined ? ` nad równikiem (${o.seat})` : ' nad równikiem',
      ...(o.cadenceMin === 1
        ? [' i\u00a0co minutę skanuje całą tarczę Ziemi pod sobą.']
        : o.cadenceMin
          ? [' i\u00a0co ', num(f.int(o.cadenceMin), f.plural(o.cadenceMin, MINUTES)), ' skanuje całą tarczę Ziemi pod sobą.']
          : [' i\u00a0skanuje całą tarczę Ziemi pod sobą.']),
    ],
    // The line is the subject («Linia… dotarła», f.), so the participle is the line's; the place is «tu».
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      'Linia tego skanu dotarła tu około ',
      clock(o.time, o.zone),
      `, przesuwając się ${MOTION[o.heading]}.`,
    ],
    infrared: 'Było tu ciemno, więc to obraz w\u00a0podczerwieni: wierzchołki chmur według temperatury, im zimniej, tym jaśniej.',
  },

  // ── a pass with a picture («Pod okiem») ──────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    crossedHead(o.sat, o.offset),
    clock(o.time, o.zone),
    ...height(o.altKm, o.offset),
    `, lecąc ${MOTION[o.heading]} z\u00a0prędkością `,
    num(f.dec(o.speedKmS, 2), 'km/s'),
    '.',
  ],
  // «Obraz» is the subject, so nothing agrees with the sensor; «jego» is the weather satellite (masculine).
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `Obraz z\u00a0jego instrumentu ${o.sensor} trafił do dziennej mozaiki NASA w\u00a0barwach naturalnych, `,
    num(f.int(o.gsdM), 'm'),
    ' na piksel.',
  ],
  // «zarejestrował», never «zobrazował» (to a lay reader: "illustrated"). Radar only: Sentinel-1.
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'Jego radar, patrząc ',
    deg1(o.deg),
    ' w\u00a0bok, zarejestrował to miejsce w\u00a0rozdzielczości ',
    num(f.int(o.gsdM), 'm'),
    o.dark ? ' na piksel, w\u00a0ciemności.' : ' na piksel.',
  ],
  // «Kamera» (f.) is the sentence's own subject.
  lookingDown: 'Kamera patrzyła prosto w\u00a0dół.',
  lookingOff: (deg: number): Rich => ['Kamera była odchylona od pionu o\u00a0', deg1(deg), '.'],
  // «całej» says it is the archive's whole scene, not the spot.
  cloudCover: (pct: number): Rich => ['Zachmurzenie całej sceny: ', num(f.int(pct), '%'), '.'],

  // ── «Zapewne pod okiem» ──────────────────────────────────────────────────────────────────
  likely: {
    // «obejmując je» picks up «nad tym miejscem» in the same sentence; with an offset the place is named again.
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      crossedHead(o.sat, o.offset),
      clock(o.time, o.zone),
      ...height(o.altKm, o.offset),
      ...(o.swathKm
        ? [o.offset ? ', obejmując to miejsce pasem obrazowania o\u00a0szerokości ' : ', obejmując je pasem obrazowania o\u00a0szerokości ', km(o.swathKm), '.']
        : ['.']),
    ],
    archiveFailed: 'Było jasno, więc to miejsce musiało trafić do kadru. Nie udało się teraz przeszukać archiwum.',
    // The bare name is a present-tense subject («Sentinel-2 rejestruje»: no gender); the past is the place's.
    noScene:
      'Z\u00a0tego przelotu nie ma żadnej sceny. Sentinel-2 rejestruje tylko ląd i\u00a0wody przybrzeżne, a\u00a0tego miejsca mogło nie być w\u00a0planie obrazowania.',
    notYet:
      'Było jasno, więc niemal na pewno zarejestrował to miejsce. ' +
      'Nie opublikowano jeszcze żadnej sceny z\u00a0tego przelotu; archiwa spóźniają się czasem o\u00a0dzień lub dłużej.',
    // «ten satelita» gives «widział» its antecedent: the nearest subject is the plural «Satelity pogodowe».
    dark: 'Było tu ciemno. Satelity pogodowe skanują też nocą, w\u00a0podczerwieni, więc ten satelita widział twoje chmury, a\u00a0nie ulice.',
    mosaicUnconfirmed: 'Nie udało się potwierdzić dziennej mozaiki NASA z\u00a0tego przelotu w\u00a0twoim punkcie.',
    notPublished: 'Jego obrazy zasilają prognozy pogody; nie są publikowane jako zdjęcia, które możemy pokazać.',
  },

  // ── «Satelita mógł spojrzeć» ─────────────────────────────────────────────────────────────
  could: {
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `Satelita ${o.sat} był w\u00a0zasięgu o\u00a0`,
      clock(o.time, o.zone),
      ...(o.offset ? [', ', km(o.offset.km), ` ${MOTION[o.offset.dir]} stąd.`] : [', dokładnie nad tym miejscem.']),
    ],
    // «rejestrował obrazy», never «robił zdjęcia»: the owner's rule against "photographed".
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      'To miejsce było w\u00a0jego pasie obrazowania o\u00a0szerokości ',
      km(o.swathKm),
      '. Operator nie publikuje, gdzie ten satelita rejestrował obrazy, więc nie da się sprawdzić, czy zarejestrował to miejsce.',
    ],
    // «zmapować» for "mapped"; «Patrząc» is the satellite's, the subject of «mógł».
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'Radar widzi przez chmury i\u00a0w\u00a0ciemności. ',
      ...(o.deg === undefined ? ['Mógł zmapować to miejsce.'] : ['Patrząc ', deg1(o.deg), ' w\u00a0bok, mógł zmapować to miejsce.']),
      o.openArchive ? ' Z\u00a0tego przelotu nie ma opublikowanego obrazu tego miejsca.' : ' Nie da się sprawdzić, czy tak było.',
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined
        ? ['Patrząc prosto w\u00a0dół, mógł obserwować to miejsce.']
        : ['Z\u00a0kamerą odchyloną od pionu o\u00a0', deg1(o.deg), ' mógł obserwować to miejsce.']),
      ' Nie da się sprawdzić, czy tak było.',
    ],
  },

  // ── «Nad głową» ──────────────────────────────────────────────────────────────────────────
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    CREWED.test(o.sat) ? `Stacja ${o.sat} przeleciała o\u00a0` : `Satelita ${o.sat} przeleciał o\u00a0`,
    clock(o.time, o.zone),
    ' na wysokości ',
    km(o.altKm),
    ', ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' nad twoim horyzontem, niemal w\u00a0zenicie.' : ` nad twoim horyzontem, ${SKY[o.toward]}.`,
  ],
  // Runs only after an overhead pass, which the engine gives to crewed stations: «stacja», as the English says. The
  // planes it may be taken for blink, so «punkt, który nie mruga» is the exact sense of "steady".
  darkStation: 'U\u00a0ciebie było ciemno. Jeśli stacja była jeszcze w\u00a0słońcu, przecięła twoje niebo jako jasny punkt, który nie mruga.',
}
export default pass
