/**
 * French copy for the passes: the list grouped by verdict and the view of one pass (see src/i18n/en/passView.ts for
 * where each message shows; docs/i18n/fr.md is the authority on every word here).
 *
 * Why it reads this way:
 *  - Every verdict counts passes, so the verdict a count arrives with does not change the unit: *passage* /
 *    *passages* / *de passages* by fmt('fr').plural, and 0 is singular (*0 passage*, fr.md §3.3, §5.3).
 *  - No word agrees with a satellite or the place: the notes say *son capteur*, *ce passage*, *l’endroit même*, and a
 *    satellite's name follows *par*, never *de* (*Aucune image prise par Sentinel-2C…*, §5.2). Failures say
 *    *Impossible de…*; what we cannot know is stated calmly (§1.1).
 *  - Readout labels are the glossary's nouns, sized for the strip's four cells and the two-column grid (§4.1, §7):
 *    *Dépointage*, *Hauteur du soleil*, *Distance au sol*, *Cap*. Units are lowercase and the cells uppercase them.
 *    Compass points, days, clocks and durations arrive written; heading letters arrive in French (*SSO*).
 *  - Numbers come from fmt('fr') (decimal comma, U+202F thousands); a no-break space joins a number to its unit.
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'

const f = fmt('fr')
/** The unit of every verdict's count, in the form the number takes (*1 passage*, *31 passages*, *1 000 000 de passages*) */
const passes = (n: number) => f.plural(n, { one: 'passage', many: 'de passages', other: 'passages' })
/** "31 passages": the count and its unit, joined by a no-break space */
const passCount = (n: number) => `${f.int(n)}\u00a0${passes(n)}`

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty:
    'Aucun satellite que nous suivons n’a survolé ce lieu sur cette période. C’est rare\u202f; les notes ci-dessus indiquent si une source de données était indisponible.',
  // 23 characters at most, or the group's count drops to a second line (*puis les plus récentes* did).
  imagedOrder: 'vue rapprochée en tête',
  count: (n: number, _verdict: Verdict) => passCount(n),
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), passes(n)),
  // *sat.* is invariable (fr.md §4.1).
  sats: (n: number) => `${f.int(n)}\u00a0sat.`,
  // Shown only for a long group; one satellite or row still reads (*Voir 1 satellite*).
  showAllSats: (n: number) =>
    f.plural(n, {
      one: `Voir ${f.int(n)}\u00a0satellite`,
      many: `Voir les ${f.int(n)}\u00a0de satellites`,
      other: `Voir les ${f.int(n)}\u00a0satellites`,
    }),
  showAllRows: (n: number) =>
    f.plural(n, {
      one: `Voir ${f.int(n)}\u00a0ligne`,
      many: `Voir les ${f.int(n)}\u00a0de lignes`,
      other: `Voir les ${f.int(n)}\u00a0lignes`,
    }),
  showMore: (n: number) => `Voir ${f.int(n)} de plus`,
  // Agrees with the hidden *lignes* (f pl), never with a satellite.
  left: (n: number) => f.plural(n, { one: `${f.int(n)}\u00a0restante`, many: `${f.int(n)}\u00a0restantes`, other: `${f.int(n)}\u00a0restantes` }),
  showFewer: 'Voir moins',
  tag: {
    mosaic: 'Mosaïque',
    radar: 'Radar',
    cloudedPct: (pct: number) => `Nuages · ${f.int(pct)}\u00a0%`,
    cloudedAtSpot: 'Nuages · ici',
  },
  // "WorldView Legion 4, pouvait viser, dimanche 1er novembre 10:52 EST, il y a 41 heures, …" (fr.md §3.6)
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day} ${o.time}\u00a0${o.zone}`,
      o.ago,
      o.cloudPct !== undefined ? `couverture nuageuse de ${f.int(o.cloudPct)}\u00a0pour cent` : undefined,
      o.clouded ? 'ciel couvert' : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  // *du nadir*, not *de dépointage*: the rows' two mono lines hold about 36 characters (fr.md §3.9).
  offNadir: (deg: number) => `${f.dec(deg, 1)}° du nadir`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)}\u00a0km`,
  cloudPct: (pct: number) => `nuages ${f.int(pct)}\u00a0%`,
  // *image*, not *photo*: every row with a thumbnail has one, Sentinel-1's radar rows too (fr.md §9.2, item 14).
  expandLabel: (sat: string, day: string, time: string) => `Agrandir l’image\u00a0: ${sat}, ${day} ${time}`,
  expandTitle: 'Agrandir l’image',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${passCount(o.passes)}, dernier passage le ${o.day} à ${o.time}`,
  // Nothing: *Dernier lun. 2 nov.* reads «lundi dernier» and ran the row past its box; the row is the latest pass.
  latest: '',
  closest: 'Au plus près ',
  // One short word on a 48 px thumbnail (small phones): *Nuage*, 5 characters like *Cloud*; *Nuages* is clipped there.
  cloudChip: 'Nuage',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'Images',
  planSection: 'Vue en plan',
  geometry: 'Géométrie',
  // A noun, like its neighbour; *Lecture* is the play button's name (fr.md §3.9).
  replay: 'Reconstitution',
  fullDiscNote: (pixel: string, cadenceMin?: number) => {
    const c = cadenceMin ? Math.round(cadenceMin) : 0
    const every = c ? f.plural(c, { one: 'toutes les minutes', many: `toutes les ${f.int(c)}\u00a0de minutes`, other: `toutes les ${f.int(c)}\u00a0minutes` }) : 'à quelques minutes d’intervalle'
    return `Une image du disque complet\u00a0: une seule image de tout ce que voit le satellite, à ${pixel} par pixel ici. Peu détaillée, mais réelle, et la plus récente publiée. Le satellite en prend une semblable ${every}, toute la semaine.`
  },
  mosaicNote: (gsdM: number) =>
    `Une mosaïque quotidienne\u00a0: la NASA assemble les fauchées de chaque jour en une image à ${f.int(gsdM)}\u00a0m par pixel. Peu détaillée, mais réelle, et du jour de ce passage.`,
  // One colon per sentence (fr.md §2.2): English's first colon becomes a full stop.
  radarNote:
    'Une image radar, pas une photo. Sentinel-1 émet des micro-ondes et enregistre leur écho\u00a0: ni les nuages ni la nuit ne l’arrêtent. Plus le sol renvoie fortement ces ondes, plus l’image est claire\u00a0: les bâtiments et les sols rugueux sont lumineux, l’eau calme est sombre.',
  noImage: {
    openArchive: (sat: string) => `Aucune image prise par ${sat} à cet endroit lors de ce passage. Vue en plan du passage.`,
    radarPrivate: 'Aucune image publique\u00a0: les archives de cet opérateur radar sont privées. Vue en plan du passage.',
    commercialPrivate: 'Aucune image publique\u00a0: les archives commerciales sont privées. Vue en plan du passage.',
    noneToShow: 'Aucune image à montrer pour ce passage. Vue en plan du passage.',
    archiveDown: 'Impossible d’interroger les archives pour l’instant. Vue en plan du passage.',
    noScene: 'Aucune scène n’existe pour ce passage. Vue en plan du passage.',
    notYet: 'Aucune scène publiée ne correspond encore à ce passage. Les scènes Sentinel-2 et Landsat sont en général publiées en moins d’une journée.',
    crewed: 'Les stations habitées emportent des caméras, mais leurs photos ne sont pas publiées par lieu et par heure.',
    unavailable: 'L’image de ce passage n’est pas disponible.',
  },
  links: {
    openToSave: 'Ouvrir l’image pour l’enregistrer',
    downloading: 'Téléchargement…',
    download: 'Télécharger l’image',
    viewSource: (archive: string) => `Voir la source · ${archive}`,
  },
  spot: {
    checking: 'Lecture du pixel à l’endroit même…',
    clear: 'Ciel dégagé à l’endroit même.',
    cirrus: 'Cirrus fins signalés à l’endroit même\u202f; ils peuvent adoucir l’image.',
    cloud: 'Nuages à l’endroit même.',
    shadow: 'L’endroit même était à l’ombre d’un nuage.',
  },

  // ── the readout strip ────────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'Altitude',
    elevation: 'Élévation',
    offNadir: 'Dépointage',
    pixel: 'Pixel',
    band: 'Bande',
    sun: 'Soleil',
    cloud: 'Nuages',
    cloudAtSpot: 'Nuages ici',
  },
  // *Infrarouge* is 10 characters in a ~9-character cell: fr.md §4.1 keeps it (fallback *IR*).
  band: { infrared: 'Infrarouge', visible: 'Visible', colour: 'Couleur' },
  spotValue: { clear: 'Dégagé', cirrus: 'Cirrus', cloud: 'Nuages', shadow: 'Ombre' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    // Left empty: *Élévation* already is the angle above your horizon, and no short French word says "up" (a phrase
    // such as *sur l’horizon* would push the value out of its quarter-width cell).
    up: '',
    mosaic: 'mosaïque',
    scene: 'scène',
    sun: { day: 'jour', twilight: 'demi-jour', night: 'nuit' },
  },

  // ── 01 / Géométrie ───────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'Au plus près · UTC',
    closestLocal: 'Au plus près · local',
    groundDistance: 'Distance au sol',
    elevationFromYou: 'Élévation vue d’ici',
    groundSpeed: 'Vitesse au sol',
    heading: 'Cap',
    sunElevation: 'Hauteur du soleil',
    fieldOfRegard: 'Dépointage max.',
    swath: 'Fauchée',
    inSwath: 'Dans la fauchée',
    inView: 'À portée',
    window: 'Fenêtre',
    noradPass: 'NORAD · passage',
    scanUtc: 'Balayage ici · UTC',
    scanLocal: 'Balayage ici · local',
    aboveEquator: 'Au-dessus de l’équateur',
    inYourSky: 'Dans votre ciel',
    scanDirection: 'Sens du balayage',
    // The cells around it already place the scan here (*Balayage ici · UTC*); English + 4 characters (fr.md §7).
    lineSpeed: 'Vitesse du balayage',
    coverage: 'Couverture',
    thisScan: 'Ce balayage',
    noradScan: 'NORAD · balayage',
  },
  northToSouth: 'Nord → sud',
  southToNorth: 'Sud → nord',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'Jour', twilight: 'Demi-jour', night: 'Nuit' },
  fullDisc: 'Disque complet',
  everyMin: (n: number) => {
    const c = Math.round(n)
    return f.plural(c, { one: 'toutes les minutes', many: `toutes les ${f.int(c)}\u00a0min`, other: `toutes les ${f.int(c)}\u00a0min` })
  },
  upCompass: (compass: string) => `d’élévation · ${compass}`,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'Asc.' : 'Desc.'}`,
}

export default passView
