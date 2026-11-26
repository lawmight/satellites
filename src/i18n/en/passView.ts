/**
 * English copy for the passes: the list of every pass grouped by verdict (src/ui/results/PassList.tsx) and the view of
 * one pass (PassDetail.tsx): its readout strip, the notes under its picture or plan view, its links and the 01 /
 * GEOMETRY readouts.
 *
 * The verdict vocabulary (group titles, verbs) is not here: it has one table, the 'verdicts' namespace (./verdicts.ts,
 * DESIGN §7), and arrives in these messages as a slot. A count of passes is different: its unit must agree with the
 * number in each language's own plural forms, so those messages take the raw count and the verdict, and English writes
 * its unit with the English verdict table's plural (enVerdicts[verdict].unit, never the active language's). Days and
 * times at the place arrive as slots too, written by the app's time formatter ("Sun 1 Nov", "Friday 6 November",
 * "16:14"), and so do how long ago ("41 hours ago"), compass points ("SSW", from the 'pass' namespace) and durations
 * ("4 min 12 s"). Satellite and operator names, NORAD ids, pass ids, coordinates, UTC stamps and zone abbreviations are
 * international and never translated.
 *
 * Readout labels and units are mono caps (uppercased by CSS) in narrow cells: the strip's four cells share a phone's
 * width, the geometry grid is two columns. Keep them short. A unit symbol ("km", "m", "km/s") keeps its case in the
 * capitals; a word in the unit slot ("day", "scene") does not.
 */
import { ns } from '../ns'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'
import type { Verdict } from '@/ui/results/lib/meta'
import enVerdicts from './verdicts'

const en = fmt('en')

export default ns('passView', {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  /** The list when no satellite passed at all (a rare footnote) */
  empty: 'No satellite we track crossed this place in the window. That is rare; the notes above say if a data source was down.',
  /** After the "Watched" group's title, when it lists photographs (mono caps): their order */
  imagedOrder: 'closest look, then newest',
  /**
   * A group header's pass count with its unit ("1 pass", "31 passes"; mono caps). `verdict` is the group ('imaged',
   * 'likely', 'could', 'overhead'); every verdict counts passes today (DESIGN §7), so a translation may ignore it and
   * choose the unit's form for `n` with its own plural rules.
   */
  count: (n: number, verdict: Verdict) => `${en.int(n)} ${enVerdicts[verdict].unit(n)}`,
  /**
   * The same count at a satellite row's right edge, stacked: the number (`n`, mono, 15 px) over its unit (`u`, mono
   * caps, 9.5 px, in the form the number takes). Give both.
   */
  countStack: (n: number, verdict: Verdict): NumPart => num(en.int(n), enVerdicts[verdict].unit(n)),
  /** After a group's pass count: how many satellites (mono caps; "sat" is short for satellite) */
  sats: (n: number) => `${en.int(n)} ${en.plural(n, { one: 'sat', other: 'sats' })}`,
  /** Expand a long group whose rows are all satellites */
  showAllSats: (n: number) => `Show all ${en.int(n)} ${en.plural(n, { one: 'satellite', other: 'satellites' })}`,
  /** Expand a long group whose rows mix photographs and satellites */
  showAllRows: (n: number) => `Show all ${en.int(n)} ${en.plural(n, { one: 'row', other: 'rows' })}`,
  /** Show the next page of a long group (`n` more rows) */
  showMore: (n: number) => `Show ${en.int(n)} more`,
  /** After "Show 40 more" (dimmer): how many rows are still hidden */
  left: (n: number) => `${en.int(n)} left`,
  /** Collapse the group again */
  showFewer: 'Show fewer',
  /** The honest exceptions tagged on a photographed row (mono caps chip; "spot" is the searched place) */
  tag: {
    mosaic: 'Mosaic',
    radar: 'Radar',
    cloudedPct: (pct: number) => `Clouded · ${en.int(pct)}%`,
    cloudedAtSpot: 'Clouded · at spot',
  },
  /**
   * A pass row's accessible name, its facts in order: the satellite, the verdict's verb ("watched", "swept over"), the
   * day ("Friday 6 November"), time and zone at the place, how long ago ("41 hours ago"), the scene's cloud cover when
   * known, and "clouded over" when the picture is.
   */
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [o.sat, o.verb, `${o.day} ${o.time} ${o.zone}`, o.ago, o.cloudPct !== undefined ? `cloud ${en.int(o.cloudPct)} percent` : undefined, o.clouded ? 'clouded over' : undefined]
      .filter(Boolean)
      .join(', '),
  /**
   * How far off straight down the camera looked, in degrees (mono caps, a row's second line). English keeps toFixed's
   * rounding, as it always has; a translation writes `fmt(locale).dec(deg, 1)`.
   */
  offNadir: (deg: number) => `${deg.toFixed(1)}° off-nadir`,
  /** The same angle alone, in a satellite's list of passes (after its time): "8.9°" */
  offNadirShort: (deg: number) => `${deg.toFixed(1)}°`,
  /** Ground distance from the place (mono, after a ·) */
  distanceKm: (km: number) => `${en.int(km)} km`,
  /** The scene's cloud cover (mono caps, dimmer, after a ·) */
  cloudPct: (pct: number) => `cloud ${en.int(pct)}%`,
  /** A row thumbnail's accessible name: it opens the photo large (`day` in words: "Sunday 1 November") */
  expandLabel: (sat: string, day: string, time: string) => `Expand the photo: ${sat}, ${day} ${time}`,
  /** Its tooltip */
  expandTitle: 'Expand the photo',
  /**
   * A satellite row's accessible name: the satellite, its operator (when known), how many passes it made in its group
   * (`passes`, counted like `count`, with the group's `verdict`), and the latest one's day ("Friday 6 November") and
   * time.
   */
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${en.int(o.passes)} ${enVerdicts[o.verdict].unit(o.passes)}, latest ${o.day} ${o.time}`,
  /**
   * Before a satellite row's latest pass day and time; dropped on narrow lists, so the line must read without it (mono
   * caps; keep the trailing space, or none in a language written without spaces)
   */
  latest: 'Latest ',
  /** Before the closest pass's off-nadir angle and distance, dropped the same way */
  closest: 'Closest ',
  /** On a clouded photograph's thumbnail (mono caps in a 56 px square, 48 px on small phones: one short word) */
  cloudChip: 'Cloud',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  /** Section names (screen readers only) */
  photosSection: 'Photos',
  planSection: 'Plan view',
  /** The numbered section rules "01 / Geometry", "02 / Replay" (mono caps; also their sections' accessible names) */
  geometry: 'Geometry',
  replay: 'Replay',
  /**
   * Under a geostationary image: what a full-disc image is. `pixel` its ground pixel here ("2 km"); `cadenceMin` how
   * often the satellite takes one, when known.
   */
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `A full-disc image: one picture of everything the satellite can see, at ${pixel} a pixel here. Coarse, but real, and the newest one published; it has taken one like it ${
      cadenceMin ? en.plural(cadenceMin, { one: 'every minute', other: `every ${en.int(cadenceMin)} minutes` }) : 'every few minutes'
    } all week.`,
  /** Under a daily weather mosaic: `gsdM` its pixel, in metres */
  mosaicNote: (gsdM: number) =>
    `A daily mosaic: NASA stitches each day’s swaths into one picture at ${en.int(gsdM)} m per pixel. Coarse, but real, and from this pass’s day.`,
  /** Under a radar image */
  radarNote:
    'A radar image, not a photograph: Sentinel-1 sends out microwaves and records their echo, so cloud and darkness don’t stop it. Brightness is how strongly the ground sends them back: buildings and rough ground are bright, calm water is dark.',
  /** Why a pass shows its plan view instead of a picture (a footnote under it; the plan view is the drawing above) */
  noImage: {
    /** A camera with an open archive that has no image of the place from this pass */
    openArchive: (sat: string) => `No ${sat} image of this spot from this pass. Plan view of the pass.`,
    radarPrivate: 'No public image: this radar operator’s archive is private. Plan view of the pass.',
    commercialPrivate: 'No public image: commercial archives are private. Plan view of the pass.',
    /** A camera whose pictures are not published by place */
    noneToShow: 'No image to show for this pass. Plan view of the pass.',
    archiveDown: 'The archive could not be searched just now. Plan view of the pass.',
    /** Two days on, the archive has no scene for the pass */
    noScene: 'No scene exists for this pass. Plan view of the pass.',
    /** A recent pass: the scene may not be published yet */
    notYet: 'No published scene matches this pass yet. Sentinel-2 and Landsat scenes usually appear within a day.',
    /** A crewed station (the ISS) */
    crewed: 'Crewed stations carry cameras, but their photos are not published by place and time.',
    unavailable: 'The image for this pass is not available.',
  },
  /** The links under a pass's picture */
  links: {
    /** When the file could not be fetched: the picture opens in a tab, to save from there */
    openToSave: 'Open image to save it',
    downloading: 'Downloading…',
    download: 'Download image',
    /** `archive`: the archive's name ("Planetary Computer", "NASA Worldview") */
    viewSource: (archive: string) => `View source · ${archive}`,
  },
  /** What the place's own pixel shows (a line under the sentence; read aloud as it changes; "your spot" is the place) */
  spot: {
    checking: 'Reading the pixel at your spot…',
    clear: 'Clear over your spot.',
    cirrus: 'Thin cirrus flagged over your spot; it may soften the picture.',
    cloud: 'Cloud over your spot.',
    shadow: 'Your spot was in cloud shadow.',
  },

  // ── the readout strip (four cells across: label over a 21 px value and its unit) ────────
  strip: {
    altitude: 'Altitude',
    /** How high a geostationary satellite stands in your sky */
    elevation: 'Elevation',
    offNadir: 'Off-nadir',
    pixel: 'Pixel',
    /** A geostationary image's band */
    band: 'Band',
    sun: 'Sun',
    cloud: 'Cloud',
    /** The cloud read at the place itself */
    cloudAtSpot: 'Cloud at spot',
  },
  /** A geostationary image's band, as a value (one word, 21 px: keep ≤ ~9 characters) */
  band: { infrared: 'Infrared', visible: 'Visible', colour: 'Colour' },
  /** The place's own pixel, as a value (one word, 21 px: keep ≤ ~7 characters) */
  spotValue: { clear: 'Clear', cirrus: 'Cirrus', cloud: 'Cloud', shadow: 'Shadow' },
  /** Units after a value (mono caps, smaller); `sun` after the sun's elevation */
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    /** degrees above your horizon */
    up: 'up',
    /** a daily mosaic has no scene cloud cover */
    mosaic: 'mosaic',
    /** the whole scene's cloud cover (not the place's) */
    scene: 'scene',
    sun: { day: 'day', twilight: 'twilight', night: 'night' },
  },

  // ── 01 / Geometry (two columns of readouts: label, value, unit) ─────────────────────────
  geo: {
    closestUtc: 'Closest · UTC',
    closestLocal: 'Closest · local',
    groundDistance: 'Ground distance',
    elevationFromYou: 'Elevation from you',
    groundSpeed: 'Ground speed',
    heading: 'Heading',
    sunElevation: 'Sun elevation',
    /** How far a steerable camera can look off its track */
    fieldOfRegard: 'Field of regard',
    swath: 'Swath',
    /** The pass's time window: the place inside the camera's swath, within view, or the replay's window */
    inSwath: 'In swath',
    inView: 'In view',
    window: 'Window',
    noradPass: 'NORAD · pass',
    /** A geostationary scan (the line its mirror sweeps across the Earth) */
    scanUtc: 'Scan line here · UTC',
    scanLocal: 'Scan line here · local',
    aboveEquator: 'Above the equator at',
    inYourSky: 'In your sky',
    scanDirection: 'Scan direction',
    lineSpeed: 'Line speed here',
    coverage: 'Coverage',
    thisScan: 'This scan',
    noradScan: 'NORAD · scan',
  },
  /** The scan line's direction, as a value (21 px; the arrow reads in your direction of writing) */
  northToSouth: 'North → south',
  southToNorth: 'South → north',
  /**
   * A span of time as a value: two 24 h UTC clocks ("16:14:21", "16:18"), from and to (the In swath / In view / Window
   * readouts and This scan). Keep both clocks as they come, digits left to right; the arrow means "until": a
   * right-to-left language may write ← and put the clocks in its reading order.
   */
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  /** The sun at the place, as a unit after its elevation */
  sunPhase: { day: 'Day', twilight: 'Twilight', night: 'Night' },
  /** A geostationary image covers the whole disc it sees, as a value */
  fullDisc: 'Full disc',
  /** How often it takes one, as a unit ("min": minutes) */
  everyMin: (n: number) => `every ${en.int(n)} min`,
  /** Unit after the elevation in your sky: degrees up, and the compass point it stands at ("SSW") */
  upCompass: (compass: string) => `up · ${compass}`,
  /** Unit after the heading: its compass point ("SSW") and whether the orbit is ascending (northbound) or descending */
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'Asc' : 'Desc'}`,
})
