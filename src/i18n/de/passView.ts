/**
 * German copy for the passes: the list grouped by verdict and the view of one pass (see src/i18n/en/passView.ts for
 * where each message shows; docs/i18n/de.md §3.9 and §4.1 are the authority on every word here).
 *
 * Why it reads this way:
 *  - Every verdict counts *Überflüge* (de.md §3.6), so the count's unit is German's own plural for the number, whatever
 *    the group: *1 Überflug*, *31 Überflüge*. Satellites are *Satelliten*, never *Sat*.
 *  - Readout labels are nouns without articles, in sentence case, uppercased by CSS (`HÖHE`, `KURS`, `TEMPO ÜBER
 *    GRUND`). "Closest" is *Am nächsten* (a superlative that never reads "next"), the swath *Streifen*, the elevation in
 *    your sky *Höhenwinkel* (never *Höhe*, the altitude; *Elevation* in the strip's narrow cell), the heading *Kurs*,
 *    off-nadir *Off-Nadir*. Long compounds in the two-column grid split into words to fit the English's width (§7).
 *  - Body prose never repeats the place's name: it says *den Ort*, *deinen Ort*, our own noun, whose case we set
 *    (§5.1). The one sentence that starts on a satellite's name uses a colon frame (*Sentinel-2C: kein Bild …*), so no
 *    case or pronoun points back to it (§5.2).
 *  - Numbers come from fmt('de'): decimal comma (*5,4°*), a dot from four digits, a no-break space before units and %.
 *    Days, times, durations, compass points (*SSW*, the 'pass' namespace's German letters) and how long ago arrive
 *    written; a `zone` goes through zoneDe (CET → MEZ, §6.3).
 */
import type en from '../en/passView'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'
import { zoneDe } from '../../../api/_lib/i18n/card/deZone'
import type { Verdict } from '@/ui/results/lib/meta'

const f = fmt('de')

/** "Überflug" / "Überflüge": the unit of every verdict's count, in the form the number takes */
const unit = (n: number) => f.plural(n, { one: 'Überflug', other: 'Überflüge' })
/** "1 Überflug", "31 Überflüge" */
const passes = (n: number) => `${f.int(n)} ${unit(n)}`

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty: 'Kein uns bekannter Satellit überflog diesen Ort im Zeitfenster. Das ist selten; die Hinweise oben sagen, ob eine Datenquelle ausgefallen war.',
  // The group's head is one `nowrap` line: *Beobachtet · nach Nähe, dann neueste* is 275 px at 10.5 px and 288 at
  // 11 px (English 267 / 280), where *erst aus nächster Nähe, dann die neuesten* (413 / 433) overran every panel.
  imagedOrder: 'nach Nähe, dann neueste',
  // Every verdict counts passes (de.md §3.6), so the verdict does not change the word.
  count: (n: number, _verdict: Verdict) => passes(n),
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), unit(n)),
  sats: (n: number) => f.plural(n, { one: `${f.int(n)} Satellit`, other: `${f.int(n)} Satelliten` }),
  // Accusative after *zeigen*: *1 Satelliten*, *1 Zeile* (the singular never takes *alle*).
  showAllSats: (n: number) => f.plural(n, { one: `${f.int(n)} Satelliten zeigen`, other: `Alle ${f.int(n)} Satelliten zeigen` }),
  showAllRows: (n: number) => f.plural(n, { one: `${f.int(n)} Zeile zeigen`, other: `Alle ${f.int(n)} Zeilen zeigen` }),
  // Rows are *Zeilen* (feminine), so *weitere* is right for one and many alike.
  showMore: (n: number) => `${f.int(n)} weitere zeigen`,
  left: (n: number) => `noch ${f.int(n)}`,
  showFewer: 'Weniger zeigen',
  tag: {
    mosaic: 'Mosaik',
    radar: 'Radar',
    cloudedPct: (pct: number) => `Bewölkt · ${f.int(pct)}\u00a0%`,
    cloudedAtSpot: 'Bewölkt · am Ort',
  },
  // `day` arrives as "Freitag, 6. November", so the clock follows after a comma.
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day}, ${o.time} ${zoneDe(o.zone)}`,
      o.ago,
      o.cloudPct !== undefined ? `Wolken ${f.int(o.cloudPct)} Prozent` : undefined,
      // The row's tag says *Bewölkt* (from 70 % or cloud at the place), so the spoken word is the same.
      o.clouded ? 'bewölkt' : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  offNadir: (deg: number) => `${f.dec(deg, 1)}° Off-Nadir`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)}\u00a0km`,
  cloudPct: (pct: number) => `Wolken ${f.int(pct)}\u00a0%`,
  expandLabel: (sat: string, day: string, time: string) => `Bild vergrößern: ${sat}, ${day} ${time}`,
  expandTitle: 'Bild vergrößern',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${passes(o.passes)}, zuletzt ${o.day}, ${o.time}`,
  // Dropped on narrow lists, so the line reads without them.
  latest: 'Zuletzt ',
  closest: 'Am nächsten ',
  // *Wolke*: the English width in the 56 px square (de.md §7).
  cloudChip: 'Wolke',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'Bilder',
  planSection: 'Draufsicht',
  geometry: 'Geometrie',
  replay: 'Wiedergabe',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `Ein Vollscheibenbild: alles, was der Satellit von der Erde sieht, in einem Bild, hier mit ${pixel} pro Pixel. Grob, aber echt, und das neueste veröffentlichte; ein solches Bild entsteht die ganze Woche über ${
      cadenceMin ? f.plural(cadenceMin, { one: 'jede Minute', other: `alle ${f.int(cadenceMin)}\u00a0Minuten` }) : 'alle paar Minuten'
    }.`,
  mosaicNote: (gsdM: number) =>
    `Ein Tagesmosaik: Die NASA setzt die Streifen jedes Tages zu einem Bild mit ${f.int(gsdM)}\u00a0m pro Pixel zusammen. Grob, aber echt, und vom Tag dieses Überflugs.`,
  radarNote:
    'Ein Radarbild, kein Foto: Sentinel-1 sendet Mikrowellen aus und zeichnet ihr Echo auf, darum stören Wolken und Dunkelheit das Radar nicht. Die Helligkeit zeigt, wie stark der Boden sie zurückwirft: Gebäude und rauer Boden sind hell, ruhiges Wasser ist dunkel.',
  noImage: {
    // A colon frame: no case and no pronoun for the satellite's name (de.md §5.2).
    openArchive: (sat: string) => `${sat}: kein Bild dieses Ortes von diesem Überflug. Draufsicht des Überflugs.`,
    radarPrivate: 'Kein öffentliches Bild: Das Archiv dieses Radarbetreibers ist privat. Draufsicht des Überflugs.',
    commercialPrivate: 'Kein öffentliches Bild: Kommerzielle Archive sind privat. Draufsicht des Überflugs.',
    noneToShow: 'Für diesen Überflug gibt es kein Bild zu zeigen. Draufsicht des Überflugs.',
    archiveDown: 'Das Archiv ließ sich gerade nicht durchsuchen. Draufsicht des Überflugs.',
    noScene: 'Zu diesem Überflug gibt es keine Szene. Draufsicht des Überflugs.',
    notYet: 'Noch keine veröffentlichte Szene passt zu diesem Überflug. Szenen von Sentinel-2 und Landsat erscheinen meist innerhalb eines Tages.',
    // *Raumstationen*, never *Besatzung*, which is also a military occupation (de.md §8).
    crewed: 'Raumstationen haben Kameras an Bord, aber ihre Fotos werden nicht nach Ort und Zeit veröffentlicht.',
    unavailable: 'Das Bild zu diesem Überflug ist nicht verfügbar.',
  },
  links: {
    openToSave: 'Bild öffnen, um es zu speichern',
    downloading: 'Wird heruntergeladen\u00a0…',
    download: 'Bild herunterladen',
    viewSource: (archive: string) => `Quelle ansehen · ${archive}`,
  },
  spot: {
    checking: 'Pixel an deinem Ort wird gelesen\u00a0…',
    clear: 'Klare Sicht auf deinen Ort.',
    cirrus: 'Dünne Zirren über deinem Ort; sie können das Bild weicher machen.',
    cloud: 'Wolken über deinem Ort.',
    shadow: 'Dein Ort lag im Wolkenschatten.',
  },

  // ── the readout strip ────────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'Höhe',
    // A geostationary image's second cell (about 67 px on a 375 px phone): *Höhenwinkel* is 87.5 px at 11 px and one
    // word cannot wrap, so the strip takes *Elevation* (Duden; 71.4 px, the English width and *Off-Nadir*'s), read
    // with its unit *hoch*. The roomier grid and the card keep *Höhenwinkel*.
    elevation: 'Elevation',
    offNadir: 'Off-Nadir',
    pixel: 'Pixel',
    band: 'Kanal',
    sun: 'Sonne',
    cloud: 'Wolken',
    cloudAtSpot: 'Wolken am Ort',
  },
  // 21 px values: *Infrarot*, *Sichtbar* and *Schatten* are each the English *Infrared*'s width (de.md §7).
  band: { infrared: 'Infrarot', visible: 'Sichtbar', colour: 'Farbe' },
  spotValue: { clear: 'Klar', cirrus: 'Zirren', cloud: 'Wolken', shadow: 'Schatten' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    up: 'hoch',
    mosaic: 'Mosaik',
    scene: 'Szene',
    sun: { day: 'Tag', twilight: 'Dämmerung', night: 'Nacht' },
  },

  // ── 01 / Geometry ────────────────────────────────────────────────────────────────────────
  // No label longer than the English's longest, 168 px at 10.5 px (de.md §7); on a 390 px phone a cell's label has
  // about 164 px at 11 px (19 characters). The local-time cell sits right of its UTC twin, so *Ortszeit* alone says it:
  // *Am nächsten · Ortszeit* (177 px) ran past the panel's edge on phones.
  geo: {
    closestUtc: 'Am nächsten · UTC',
    closestLocal: 'Ortszeit',
    groundDistance: 'Bodenabstand',
    elevationFromYou: 'Höhenwinkel bei dir',
    groundSpeed: 'Tempo über Grund',
    heading: 'Kurs',
    sunElevation: 'Sonnenhöhe',
    fieldOfRegard: 'Schwenkbereich',
    swath: 'Streifenbreite',
    inSwath: 'Im Streifen',
    inView: 'In Sicht',
    window: 'Zeitfenster',
    noradPass: 'NORAD · Überflug',
    scanUtc: 'Scan hier · UTC',
    scanLocal: 'Ortszeit',
    aboveEquator: 'Über dem Äquator bei',
    inYourSky: 'An deinem Himmel',
    scanDirection: 'Scanrichtung',
    lineSpeed: 'Linientempo hier',
    coverage: 'Abdeckung',
    thisScan: 'Dieser Scan',
    noradScan: 'NORAD · Scan',
  },
  northToSouth: 'Nord → Süd',
  southToNorth: 'Süd → Nord',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'Tag', twilight: 'Dämmerung', night: 'Nacht' },
  fullDisc: 'Vollscheibe',
  everyMin: (n: number) => `alle ${f.int(n)}\u00a0min`,
  upCompass: (compass: string) => `hoch · ${compass}`,
  // Spelled out, never *Auf.* / *Ab.* (de.md §4.1: `SSW · ABSTEIGEND`).
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'aufsteigend' : 'absteigend'}`,
}

export default passView
