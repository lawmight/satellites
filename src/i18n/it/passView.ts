/**
 * Italian copy for the passes: the list grouped by verdict and the view of one pass (see src/i18n/en/passView.ts;
 * docs/i18n/it.md §3.4, §3.7 "Pass list and pass view", §4, §5, §7).
 *
 * Why it reads this way:
 *  - Every verdict counts passes, so the unit is *passaggio* in Italian's three plural forms (*1 passaggio*, *31
 *    passaggi*, *1.000.000 di passaggi*) whatever the group. The list's satellite count is *sat*, an invariable short
 *    form (*31 sat*); everywhere else satellites are written out.
 *  - "Show all 12 satellites" needs an article before the number, and Italian reads it: *gli 8*, *gli 11*, *gli 80*,
 *    *i 12*, *i 1715* (`theN` below). Rows are *righe* (f.), whose *le* never changes.
 *  - Readout labels are nouns in sentence case (CSS uppercases them), short Italian words from the glossary (*Quota*,
 *    *Rotta*, *Fascia*); readouts keep the international forms they arrive in (compass letters «SSW», UTC clocks,
 *    NORAD ids). The geostationary "In your sky" is *Dal tuo punto*, never *Nel tuo cielo*, a verdict's words (§3.6).
 *  - Footnotes resume the place as *questo punto* / *questo luogo*, and the satellite follows a simple preposition
 *    (*di Sentinel-2C*): nothing agrees with a name (§5.1, §5.2). They end on *Vista dall’alto del passaggio.*
 *  - Units are tied to their numbers with a no-break space in sentences (*375 m per pixel*, §6).
 */
import type en from '../en/passView'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'
import type { Verdict } from '@/ui/results/lib/meta'

const f = fmt('it')

/** A whole count, or a fraction kept (its plural form is `other`) */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** *passaggio · passaggi · di passaggi*: the form a count of passes takes (every verdict counts passes, DESIGN §7) */
const passes = (n: number) => f.plural(n, { one: 'passaggio', many: 'di passaggi', other: 'passaggi' })
/** *1 passaggio*, *31 passaggi*, *1.000.000 di passaggi* */
const passCount = (n: number) => `${count(n)} ${passes(n)}`
/**
 * The masculine plural article before a written number, as it is read: *gli* before a vowel (*gli 8* «otto», *gli 11*
 * «undici», *gli 80*, *gli 800*, *gli 8000*, *gli 11.000*), *i* otherwise (*i 12*, *i 18*, *i 1715* «mille…»).
 */
const theN = (n: number) => {
  const digits = String(Math.round(Math.abs(n)))
  const lead = Number(digits.slice(0, digits.length % 3 || 3))
  return lead === 8 || lead === 11 || (lead >= 80 && lead <= 89) || (lead >= 800 && lead <= 899) ? 'gli' : 'i'
}
/** *ogni minuto*, *ogni 10 minuti*, *ogni pochi minuti* (cadence unknown) */
const cadence = (min?: number) =>
  min
    ? f.plural(min, { one: 'ogni minuto', many: `ogni ${count(min)} di minuti`, other: `ogni ${count(min)} minuti` })
    : 'ogni pochi minuti'
/** *Vista dall’alto del passaggio.*: the plan view, named after every footnote that explains it */
const PLAN = 'Vista dall’alto del passaggio.'

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty:
    'Nessun satellite che seguiamo ha attraversato questo luogo in questa finestra temporale. Succede di rado: se una fonte di dati non funzionava, lo dicono le note qui sopra.',
  imagedOrder: 'la più vicina, poi le recenti',
  count: (n: number, _verdict: Verdict) => passCount(n),
  countStack: (n: number, _verdict: Verdict): NumPart => num(count(n), passes(n)),
  // *sat* is invariable (§3.7); *di* before it only for exact millions, like every count.
  sats: (n: number) => `${count(n)} ${f.plural(n, { one: 'sat', many: 'di sat', other: 'sat' })}`,
  showAllSats: (n: number) =>
    f.plural(n, {
      one: `Mostra ${f.int(n)} satellite`,
      many: `Mostra tutti ${theN(n)} ${f.int(n)} di satelliti`,
      other: `Mostra tutti ${theN(n)} ${f.int(n)} satelliti`,
    }),
  showAllRows: (n: number) =>
    f.plural(n, {
      one: `Mostra ${f.int(n)} riga`,
      many: `Mostra tutte le ${f.int(n)} di righe`,
      other: `Mostra tutte le ${f.int(n)} righe`,
    }),
  // *un’altra riga* for one: *1 altra* is not Italian (§5.4).
  showMore: (n: number) =>
    f.plural(n, { one: 'Mostra un’altra riga', many: `Mostra altre ${f.int(n)} di righe`, other: `Mostra altre ${f.int(n)} righe` }),
  left: (n: number) => f.plural(n, { one: `ne resta ${f.int(n)}`, many: `ne restano ${f.int(n)}`, other: `ne restano ${f.int(n)}` }),
  showFewer: 'Mostra meno',
  tag: {
    mosaic: 'Mosaico',
    radar: 'Radar',
    cloudedPct: (pct: number) => `Nuvoloso · ${f.int(pct)}%`,
    cloudedAtSpot: 'Nuvoloso · sul punto',
  },
  // Spoken: *per cento* in words (a screen reader would read «%» bare), and *coperto* for "clouded over".
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day} ${o.time} ${o.zone}`,
      o.ago,
      o.cloudPct !== undefined ? `copertura nuvolosa ${f.int(o.cloudPct)} per cento` : undefined,
      o.clouded ? 'coperto' : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  offNadir: (deg: number) => `${f.dec(deg, 1)}° off-nadir`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)} km`,
  cloudPct: (pct: number) => `nuvole ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `Ingrandisci la foto: ${sat}, ${day} ${time}`,
  expandTitle: 'Ingrandisci la foto',
  // *ultimo* agrees with the *passaggio* it stands for.
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${passCount(o.passes)}, ultimo ${o.day} ${o.time}`,
  latest: 'Ultimo ',
  closest: 'Più vicino ',
  cloudChip: 'Nuvole',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'Foto',
  planSection: 'Vista dall’alto',
  geometry: 'Geometria',
  replay: 'Rivedi',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `Un’immagine a disco intero: tutto ciò che il satellite vede, in una sola immagine, qui a ${pixel} per pixel. Poco dettagliata, ma vera, e la più recente pubblicata. Per tutta la settimana il satellite ha ripreso un’immagine come questa ${cadence(cadenceMin)}.`,
  mosaicNote: (gsdM: number) =>
    `Un mosaico giornaliero: ogni giorno la NASA unisce le fasce di ripresa in un’unica immagine a ${f.int(gsdM)} m per pixel. Poco dettagliato, ma vero, e del giorno di questo passaggio.`,
  radarNote:
    'Un’immagine radar, non una foto: Sentinel-1 emette microonde e ne registra l’eco, così nuvole e buio non sono un ostacolo. La luminosità dice con quanta forza il suolo le rimanda indietro: edifici e terreno irregolare sono chiari, l’acqua calma è scura.',
  noImage: {
    // The pass first, as in *noScene*: no *immagine di X di questo passaggio* chain (§2).
    openArchive: (sat: string) => `Per questo passaggio, nessuna immagine di ${sat} mostra questo punto. ${PLAN}`,
    radarPrivate: `Nessuna immagine pubblica: l’archivio di questo operatore radar è privato. ${PLAN}`,
    commercialPrivate: `Nessuna immagine pubblica: gli archivi commerciali sono privati. ${PLAN}`,
    noneToShow: `Nessuna immagine da mostrare per questo passaggio. ${PLAN}`,
    archiveDown: `Per ora non siamo riusciti a consultare l’archivio. ${PLAN}`,
    noScene: `Per questo passaggio non esiste una scena. ${PLAN}`,
    notYet: 'Non è ancora stata pubblicata nessuna scena di questo passaggio. Le scene di Sentinel-2 e Landsat di solito compaiono entro un giorno.',
    crewed: 'Le stazioni con equipaggio hanno fotocamere, ma le loro foto non sono pubblicate per luogo e ora.',
    unavailable: 'L’immagine di questo passaggio non è disponibile.',
  },
  links: {
    openToSave: 'Apri l’immagine per salvarla',
    downloading: 'Scaricamento…',
    download: 'Scarica immagine',
    viewSource: (archive: string) => `Vedi la fonte · ${archive}`,
  },
  spot: {
    checking: 'Lettura del pixel sul tuo punto…',
    clear: 'Cielo sereno sul tuo punto.',
    cirrus: 'Cirri sottili sul tuo punto: possono ammorbidire l’immagine.',
    cloud: 'Nuvole sul tuo punto.',
    shadow: 'Il tuo punto era all’ombra di una nuvola.',
  },

  // ── the readout strip ───────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'Quota',
    elevation: 'Elevazione',
    offNadir: 'Off-nadir',
    pixel: 'Pixel',
    band: 'Banda',
    sun: 'Sole',
    cloud: 'Nuvole',
    cloudAtSpot: 'Nuvole qui',
  },
  // *Infrarosso* is 10 characters against the ~9 the cell holds (§7: check the strip cell).
  band: { infrared: 'Infrarosso', visible: 'Visibile', colour: 'Colore' },
  spotValue: { clear: 'Sereno', cirrus: 'Cirri', cloud: 'Nuvole', shadow: 'Ombra' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    up: 'in alto',
    mosaic: 'mosaico',
    scene: 'scena',
    sun: { day: 'giorno', twilight: 'crepuscolo', night: 'notte' },
  },

  // ── 01 / Geometry ───────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'Più vicino · UTC',
    closestLocal: 'Più vicino · locale',
    groundDistance: 'Distanza al suolo',
    elevationFromYou: 'Elevazione da te',
    groundSpeed: 'Velocità al suolo',
    heading: 'Rotta',
    sunElevation: 'Elevazione del sole',
    fieldOfRegard: 'Campo di puntamento',
    swath: 'Fascia',
    inSwath: 'Nella fascia',
    inView: 'A portata',
    window: 'Finestra',
    noradPass: 'NORAD · passaggio',
    scanUtc: 'Scansione qui · UTC',
    scanLocal: 'Scansione qui · locale',
    aboveEquator: 'Sopra l’equatore a',
    inYourSky: 'Dal tuo punto',
    scanDirection: 'Direzione scansione',
    lineSpeed: 'Velocità linea qui',
    coverage: 'Copertura',
    thisScan: 'Questa scansione',
    noradScan: 'NORAD · scansione',
  },
  northToSouth: 'Nord → sud',
  southToNorth: 'Sud → nord',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'Giorno', twilight: 'Crepuscolo', night: 'Notte' },
  fullDisc: 'Disco intero',
  // *ogni minuto* for one: *ogni 1 min* is not Italian.
  everyMin: (n: number) => f.plural(n, { one: 'ogni minuto', many: `ogni ${count(n)} min`, other: `ogni ${count(n)} min` }),
  upCompass: (compass: string) => `in alto · ${compass}`,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'Asc' : 'Disc'}`,
}

export default passView
