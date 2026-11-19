/**
 * Dutch copy for the passes: the list grouped by verdict and the view of one pass (see docs/i18n/nl.md §3.4, §3.5,
 * §3.7 "Results, pass list and pass view", §4.1, §5, §6).
 *
 * Why it is built this way:
 *  - Every verdict counts passes (DESIGN §7), so the unit is `overvlucht` / `overvluchten` in nl's two plural forms
 *    whatever the group; satellites are counted in full words (`12 satellieten`), never `sat` or `sats` (§6: no
 *    abbreviations). A count never parts from its noun, nor a number from its unit (U+00A0), as in 'results'.
 *  - Readout labels are nouns in sentence case, uppercased by CSS (`Nadirhoek`, `Strookbreedte`, `Elevatie hier`);
 *    readouts keep the international forms they arrive in (compass points as the 'pass' namespace writes them, UTC
 *    clocks, NORAD ids). The only shortened word is the unit `min`, a unit symbol, not an abbreviation.
 *  - The footnotes under a picture or plan view say `beeld` for anything that can be radar or a mosaic and `opname`
 *    for an archive's scene (§4.2); only the crewed-station note says `foto’s`, because a station's pictures are photos.
 *  - The satellite is never referred to by a pronoun (§5): `de satelliet` is repeated, the camera or the radar is the
 *    subject, and a satellite name is never compounded (`Geen beeld van Sentinel-2C`).
 *  - The place is `je plek` or `de plek`, never `locatie` (§4.1); `zien` appears only where the English says see.
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'

const f = fmt('nl')

/** The unit of every verdict's count, in the form the number takes: `1 overvlucht`, `0 overvluchten`, `31 overvluchten` */
const passes = (n: number) => f.plural(n, { one: 'overvlucht', other: 'overvluchten' })
const passCount = (n: number) => `${f.int(n)} ${passes(n)}`
/** "Sentinel-2C, zo 1 nov 16:14" */
const who = (sat: string, day: string, time: string) => `${sat}, ${day} ${time}`
/** How often a geostationary satellite takes a full-disc image: `elke minuut`, `elke 10 minuten`, `om de paar minuten` */
const cadence = (min?: number) =>
  min ? f.plural(min, { one: 'elke minuut', other: `elke ${f.int(min)} minuten` }) : 'om de paar minuten'

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty:
    'Geen satelliet die we volgen, vloog in deze periode over deze plek. Dat is zeldzaam; de voetnoten hierboven melden of een gegevensbron uitviel.',
  // 19 characters at most, or the group's count drops to a second line (`scherpste, dan nieuwste` did).
  imagedOrder: 'scherpste eerst',
  count: (n: number, _verdict: Verdict) => passCount(n),
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), passes(n)),
  sats: (n: number) => `${f.int(n)} ${f.plural(n, { one: 'satelliet', other: 'satellieten' })}`,
  showAllSats: (n: number) => f.plural(n, { one: `${f.int(n)} satelliet tonen`, other: `Alle ${f.int(n)} satellieten tonen` }),
  showAllRows: (n: number) => f.plural(n, { one: `${f.int(n)} rij tonen`, other: `Alle ${f.int(n)} rijen tonen` }),
  showMore: (n: number) => `Nog ${f.int(n)} tonen`,
  left: (n: number) => `nog ${f.int(n)}`,
  showFewer: 'Minder tonen',
  tag: {
    mosaic: 'Mozaïek',
    radar: 'Radar',
    cloudedPct: (pct: number) => `Bewolkt · ${f.int(pct)}%`,
    cloudedAtSpot: 'Bewolkt · op de plek',
  },
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day} ${o.time} ${o.zone}`,
      o.ago,
      o.cloudPct !== undefined ? `bewolking ${f.int(o.cloudPct)} procent` : undefined,
      o.clouded ? 'dichtbewolkt' : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  offNadir: (deg: number) => `${f.dec(deg, 1)}° nadirhoek`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)} km`,
  cloudPct: (pct: number) => `bewolking ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `Beeld vergroten: ${who(sat, day, time)}`,
  expandTitle: 'Beeld vergroten',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${passCount(o.passes)}, laatste ${o.day} ${o.time}`,
  // Nothing: the row is the latest pass, and `Laatste ` ran it past its box beside the 12-letter `overvluchten`.
  latest: '',
  closest: 'Dichtstbij ',
  cloudChip: 'Wolk',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'Beelden',
  planSection: 'Bovenaanzicht',
  geometry: 'Geometrie',
  replay: 'Herhaling',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `Een beeld van de hele schijf: één opname van alles wat de satelliet kan zien, hier met ${pixel} per pixel. Grof, maar echt, en het nieuwste dat gepubliceerd is; de satelliet maakte de hele week ${cadence(cadenceMin)} zo’n beeld.`,
  mosaicNote: (gsdM: number) =>
    `Een dagmozaïek: NASA voegt de stroken van elke dag samen tot één beeld met ${f.int(gsdM)} m per pixel. Grof, maar echt, en van de dag van deze overvlucht.`,
  radarNote:
    'Een radarbeeld, geen foto: Sentinel-1 zendt microgolven uit en registreert hun echo, dus wolken en duisternis houden de radar niet tegen. De helderheid is hoe sterk de grond ze terugkaatst: gebouwen en ruwe grond zijn licht, kalm water is donker.',
  noImage: {
    openArchive: (sat: string) => `Geen beeld van ${sat} van deze plek bij deze overvlucht. Bovenaanzicht van de overvlucht.`,
    radarPrivate: 'Geen openbaar beeld: het archief van deze radarexploitant is privé. Bovenaanzicht van de overvlucht.',
    commercialPrivate: 'Geen openbaar beeld: commerciële archieven zijn privé. Bovenaanzicht van de overvlucht.',
    noneToShow: 'Geen beeld te tonen voor deze overvlucht. Bovenaanzicht van de overvlucht.',
    archiveDown: 'Het archief kon nu niet worden doorzocht. Bovenaanzicht van de overvlucht.',
    noScene: 'Er bestaat geen opname van deze overvlucht. Bovenaanzicht van de overvlucht.',
    notYet: 'Nog geen gepubliceerde opname bij deze overvlucht. Opnamen van Sentinel-2 en Landsat verschijnen meestal binnen een dag.',
    crewed: 'Ruimtestations hebben camera’s aan boord, maar hun foto’s worden niet per plek en tijd gepubliceerd.',
    unavailable: 'Het beeld van deze overvlucht is niet beschikbaar.',
  },
  links: {
    openToSave: 'Beeld openen om op te slaan',
    downloading: 'Downloaden…',
    download: 'Beeld downloaden',
    viewSource: (archive: string) => `Bron bekijken · ${archive}`,
  },
  spot: {
    checking: 'Pixel op je plek lezen…',
    clear: 'Helder boven je plek.',
    cirrus: 'Dunne cirrus gemeld boven je plek; die kan het beeld wat zachter maken.',
    cloud: 'Bewolking boven je plek.',
    shadow: 'Je plek lag in de schaduw van een wolk.',
  },

  // ── the readout strip ───────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'Hoogte',
    elevation: 'Elevatie',
    offNadir: 'Nadirhoek',
    pixel: 'Pixel',
    // The word KNMI uses for a satellite's channel.
    band: 'Kanaal',
    sun: 'Zon',
    cloud: 'Bewolking',
    cloudAtSpot: 'Op je plek',
  },
  band: { infrared: 'Infrarood', visible: 'Zichtbaar', colour: 'Kleur' },
  spotValue: { clear: 'Helder', cirrus: 'Cirrus', cloud: 'Bewolkt', shadow: 'Schaduw' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    // `38° hoog`
    up: 'hoog',
    mosaic: 'mozaïek',
    scene: 'opname',
    // `schemering` is too long for a unit
    sun: { day: 'dag', twilight: 'schemer', night: 'nacht' },
  },

  // ── 01 / Geometry ───────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'Dichtstbij · UTC',
    closestLocal: 'Dichtstbij · lokaal',
    groundDistance: 'Grondafstand',
    elevationFromYou: 'Elevatie hier',
    groundSpeed: 'Grondsnelheid',
    heading: 'Koers',
    sunElevation: 'Zonnehoogte',
    fieldOfRegard: 'Richtbereik',
    swath: 'Strookbreedte',
    inSwath: 'In strook',
    inView: 'In zicht',
    window: 'Venster',
    noradPass: 'NORAD · overvlucht',
    scanUtc: 'Scanlijn hier · UTC',
    scanLocal: 'Scanlijn hier · lokaal',
    aboveEquator: 'Boven de evenaar op',
    inYourSky: 'Aan je hemel',
    scanDirection: 'Scanrichting',
    lineSpeed: 'Lijnsnelheid hier',
    coverage: 'Dekking',
    thisScan: 'Deze scan',
    noradScan: 'NORAD · scan',
  },
  northToSouth: 'Noord → zuid',
  southToNorth: 'Zuid → noord',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'Dag', twilight: 'Schemer', night: 'Nacht' },
  fullDisc: 'Hele schijf',
  // `elke minuut` for one: `elke 1 min` is not Dutch.
  everyMin: (n: number) => f.plural(n, { one: 'elke minuut', other: `elke ${f.int(n)} min` }),
  upCompass: (compass: string) => `hoog · ${compass}`,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'stijgend' : 'dalend'}`,
}
export default passView
