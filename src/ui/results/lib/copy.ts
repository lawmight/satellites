/**
 * Copy: every sentence the results UI says, built from real numbers (DESIGN §7: declarative,
 * specific, quietly uncanny, second person). Sentences are rich parts (api/_lib/i18n/parts.ts) so the
 * renderer can set numbers in mono (DESIGN §3: "Numbers are always mono"); `plain()` flattens them for
 * share text, aria labels and tests.
 *
 * The words come from the 'pass' and 'results' namespaces (src/i18n/en/pass.ts, results.ts), read at call time
 * (msgs()), so a caller that renders them must subscribe to the language (any useMsgs) and must not cache them across
 * a switch. This module only decides WHICH sentence a pass gets (its shape: overhead or off to one side, straight down
 * or pointing away, the honest reason there is no picture) and hands the message raw values: numbers, the bare place
 * label, compass ids, clocks. Grammar (articles, plurals, lists, word order) lives in each language's messages.
 *
 * The headline's numbers (`headline()`) are language-free facts, cached with the results model; the sentences about
 * them are made when they are shown.
 */
import enPass from '@/i18n/en/pass'
import enResults, { watchedPhraseEn } from '@/i18n/en/results'
import enVerdicts from '@/i18n/en/verdicts'
import { msgs } from '@/i18n/runtime'
import type { Capture, GeoWatcher, MessageRef, Pass, Report } from '@/types'
import { isStrong, plain, type Part, type Rich } from '../../../../api/_lib/i18n/parts'
import { isDailyMosaic, isRadar, sensorName } from './captures'
import type { MetaFn, SatMeta } from './meta'
import { fmtLocalTime, zoneAbbr } from './time'

export { plain, type Part }
export type Sentence = Rich

// ── compass ───────────────────────────────────────────────────────────────────────────────

/** An 8-point direction, as an id (the 'pass' messages word it: "moving south", "61 km to the west"). */
export type Compass8 = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
/** A 16-point direction, as an id (the 'pass' namespace's compass16 abbreviates it: "SSW"). */
export type Compass16 = 'n' | 'nne' | 'ne' | 'ene' | 'e' | 'ese' | 'se' | 'sse' | 's' | 'ssw' | 'sw' | 'wsw' | 'w' | 'wnw' | 'nw' | 'nnw'

const DIR8: readonly Compass8[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
const DIR16: readonly Compass16[] = ['n', 'nne', 'ne', 'ene', 'e', 'ese', 'se', 'sse', 's', 'ssw', 'sw', 'wsw', 'w', 'wnw', 'nw', 'nnw']
const norm = (deg: number) => ((deg % 360) + 360) % 360

/** 8-point direction for prose: 194° → 's'. */
export function compass8(deg: number): Compass8 {
  return DIR8[Math.round(norm(deg) / 45) % 8]
}
/** 16-point abbreviation for readouts, in the active language: 194.6° → "SSW". */
export function compassAbbr(deg: number): string {
  return msgs(enPass).compass16[DIR16[Math.round(norm(deg) / 22.5) % 16]]
}

// ── headline ──────────────────────────────────────────────────────────────────────────────

/** Why nothing photographed the place, as a kind (the Summary picks words and layout from it). */
export type ZeroKind = 'archive' | 'dark' | 'unpublished' | 'none'

export interface Headline {
  /**
   * Distinct satellites that flew over the place in the window: any pass (imaged, likely, could, overhead).
   * Geostationary watchers don't fly over, so they are not counted. Final as soon as the passes exist.
   */
  flewOver: number
  /** Distinct satellites with at least one real image */
  photographed: number
  /** Distinct satellites with a detailed image (Sentinel-2 / Landsat) */
  detailedSats: number
  /** Distinct satellites with only a daily weather mosaic */
  mosaicSats: number
  /** Weather satellites that swept the place without a published picture (they image in infrared at night) */
  infraredSweeps: number
  /** Distinct other satellites that passed within view (likely / could / overhead) */
  more: number
  /**
   * Total real images made public (what "K images were made public" counts): photos, mosaics and radar images, and
   * every full-disc image the geostationary watchers with a public service took in the window (owner)
   */
  images: number
  /**
   * Of which geostationary: each watcher's frames over the window, by its cadence (GOES, Himawari and the Meteosats
   * with the place well inside their disc). Known as soon as the watchers are: only the newest of each is shown.
   */
  geoImages: number
  /** Of which per-scene detailed images (Sentinel-2, Landsat) */
  detailed: number
  /** Of which coarse daily weather mosaics */
  mosaics: number
  /** Of which Sentinel-1 radar images */
  radarImages: number
  /** Why nothing photographed the place (absent when something did); `zeroSentence` words it */
  zeroKind?: ZeroKind
  /** 'unpublished': how many daylight Sentinel-2 / Landsat passes crossed it with no scene published yet */
  unpublishedPasses?: number
  /** The sun never rose (polar night): a darkness headline, not a "no image" one */
  sunNeverRose?: boolean
  /** Radar satellites that could have mapped the place (they need no light) */
  radar?: { names: string[]; sats: number; passes: number }
}

/**
 * Which geostationary watchers have public images of the place: a public service carries them, and the place is
 * well inside their disc. The ones whose newest frame the gallery shows and whose week of frames is counted.
 */
export const hasPublicImages = (g: Pick<GeoWatcher, 'frames' | 'rim'>) => !!g.frames && !g.rim

/** Every full-disc image those watchers took in the window, by their cadence. */
export function geoImageCount(geo: readonly Pick<GeoWatcher, 'frames' | 'rim' | 'imagesInWindow'>[] | undefined): number {
  let n = 0
  for (const g of geo ?? []) if (hasPublicImages(g)) n += g.imagesInWindow
  return n
}

/** The engine's outage notes, by id (src/i18n/en/engine.ts note.archiveSlow / note.archiveDown). */
const OUTAGE_IDS = new Set(['engine.note.archiveSlow', 'engine.note.archiveDown'])
/** The same notes as English text, in reports cached before notes were messages. */
const OUTAGE_TEXT = /archives? (could not be reached|were too slow)/i

/**
 * The archives failed: the engine's flag first (it always sets it), else its outage note (a ref, by id), else the
 * English note of a report made before notes were refs.
 */
export function archiveDown(report: Pick<Report, 'notes' | 'archiveFailed'>): boolean {
  if (report.archiveFailed !== undefined) return report.archiveFailed
  return (report.notes ?? []).some((n: string | MessageRef) => (typeof n === 'string' ? OUTAGE_TEXT.test(n) : OUTAGE_IDS.has(n.id)))
}

/**
 * @param sunMaxDeg  highest sun elevation at the place over the window (from the timeline's sun
 *                   samples), so polar night is told by the sun, not inferred from pass times.
 */
export function headline(
  report: Pick<Report, 'passes' | 'captures' | 'notes' | 'archiveFailed'> & Partial<Pick<Report, 'geo'>>,
  meta: MetaFn,
  sunMaxDeg?: number,
): Headline {
  const geoImages = geoImageCount(report.geo)
  const imagedSats = new Set<number>()
  const detailedSats = new Set<number>()
  const mosaicSats = new Set<number>()
  const viewSats = new Set<number>()
  const flew = new Set<number>()
  const radarSats = new Map<number, number>()
  let detailed = 0
  let mosaics = 0
  let radarImages = 0
  let infraredSweeps = 0
  const byId = new Map(report.captures.map((c) => [c.id, c]))
  for (const p of report.passes) {
    // A geostationary scan is not an overflight: its images are counted from the watchers (geoImages).
    if (p.geostationary) continue
    const cat = meta(p.norad).category
    if (cat !== 'weather-geo') flew.add(p.norad)
    if (p.verdict === 'imaged') {
      imagedSats.add(p.norad)
      const c = p.captureId ? byId.get(p.captureId) : undefined
      if (c && isDailyMosaic(c)) {
        mosaics++
        mosaicSats.add(p.norad)
      } else if (c && isRadar(c)) radarImages++
      else {
        detailed++
        detailedSats.add(p.norad)
      }
    } else viewSats.add(p.norad)
    if (p.verdict === 'likely' && cat === 'weather-leo') infraredSweeps++
    if (p.verdict === 'could' && cat === 'radar') radarSats.set(p.norad, (radarSats.get(p.norad) ?? 0) + 1)
  }
  for (const n of imagedSats) viewSats.delete(n)
  for (const n of detailedSats) mosaicSats.delete(n)
  const h: Headline = {
    flewOver: flew.size,
    photographed: imagedSats.size,
    detailedSats: detailedSats.size,
    mosaicSats: mosaicSats.size,
    infraredSweeps,
    more: viewSats.size,
    images: detailed + mosaics + radarImages + geoImages,
    geoImages,
    detailed,
    mosaics,
    radarImages,
  }
  if (radarSats.size) {
    const ranked = [...radarSats.entries()].sort((a, b) => b[1] - a[1])
    h.radar = {
      names: ranked.slice(0, 2).map(([n]) => meta(n).name),
      sats: radarSats.size,
      passes: ranked.reduce((a, [, c]) => a + c, 0),
    }
  }
  if (!h.photographed) Object.assign(h, zeroReason(report, meta, sunMaxDeg))
  return h
}

function zeroReason(
  report: Pick<Report, 'passes' | 'notes' | 'archiveFailed'>,
  meta: MetaFn,
  sunMaxDeg?: number,
): Pick<Headline, 'zeroKind' | 'unpublishedPasses' | 'sunNeverRose'> {
  if (archiveDown(report)) return { zeroKind: 'archive' }
  if (sunMaxDeg !== undefined && sunMaxDeg < 0) return { zeroKind: 'dark', sunNeverRose: true }
  const open = report.passes.filter((p) => p.verdict === 'likely' && meta(p.norad).category === 'open-optical')
  if (open.length) return { zeroKind: 'unpublished', unpublishedPasses: open.length }
  const lowSun = (sunMaxDeg !== undefined && sunMaxDeg < 5) || (report.passes.length && report.passes.every((p) => p.sunElevationDeg < 5))
  if (lowSun) return { zeroKind: 'dark' }
  return { zeroKind: 'none' }
}

/**
 * The plain reason under the second line when no image was made public and the cause is the archives' lag or no
 * imager at all ("Sentinel-2 or Landsat crossed it 2 times in daylight, but no scene has been published yet."). The
 * other kinds have their own lines: 'dark' darkSentences, 'archive' the outage line. Read at call time.
 */
export function zeroSentence(h: Pick<Headline, 'zeroKind' | 'unpublishedPasses'>): Sentence | undefined {
  const m = msgs(enResults).why
  if (h.zeroKind === 'unpublished') return [m.unpublished(h.unpublishedPasses ?? 0)]
  if (h.zeroKind === 'none') return [m.none]
  return undefined
}

/** "The sun never rose, so no daylight camera could see it." + "Weather satellites still swept it in infrared, 42 times." */
export function darkSentences(h: Pick<Headline, 'sunNeverRose' | 'infraredSweeps'>): Sentence[] {
  const m = msgs(enResults).why
  const out: Sentence[] = [[h.sunNeverRose ? m.sunNeverRose : m.sunBarelyRose]]
  if (h.infraredSweeps > 0) out.push(m.infrared(h.infraredSweeps))
  return out
}

/** "Radar doesn’t need light. Umbra, Capella and 7 other radar satellites passed within range 1,204 times." */
export function radarSentence(r: NonNullable<Headline['radar']>): Sentence {
  return msgs(enResults).why.radar(r.names, Math.max(0, r.sats - r.names.length), r.passes)
}

/**
 * The images-made-public line as plain text: "31 images were made public." / "At least 4 images…" / "1 image was
 * made public." / "No images were made public this week." One count (owner): photos, weather mosaics, Sentinel-1's
 * radar images and the geostationary frames alike; the footnote breaks it down. `past`: an older week ("that week").
 */
export function photosLine(k: number, opts: { partial?: boolean; past?: boolean } = {}): string {
  const m = msgs(enResults)
  if (k <= 0) return opts.past ? m.noImages.thatWeek : m.noImages.thisWeek
  return imagesPublicText(m.imagesPublic(k), !!opts.partial)
}

/** The imagesPublic message as text: its strong part (the "at least" words) only while the count can still grow. */
export function imagesPublicText(parts: Rich, partial: boolean): string {
  return plain(partial ? parts : parts.filter((p) => !isStrong(p)))
}

/**
 * "256 satellites watched" / "1 satellite watched", in English: the headline's count phrase, which the share card's
 * tests hold the card's own copy to. The headline itself is the 'results' headline.watched message.
 */
export const watchedPhrase = watchedPhraseEn

/** The archive outage as the second line says it, in English (the share copy's tests compare with it). */
export const ARCHIVE_DOWN_LINE = enResults.archiveDown

// ── pass detail ───────────────────────────────────────────────────────────────────────────

export interface PassCopyCtx {
  pass: Pass
  meta: SatMeta
  capture?: Capture
  timeZone: string
  /** The place's label as shown (bare: each language writes its own article, if any) */
  placeLabel: string
  /** The Sentinel-2 / Landsat search failed: say so instead of "archives can lag" */
  archiveFailed?: boolean
  /** "Now" for the age of the pass (report-relative); defaults to Date.now() */
  now?: number
}

/** "0.2°W" / "140.8°E": a geostationary seat (international notation in every language). */
const fmtLonShort = (lon: number) => `${Math.abs(lon).toFixed(1)}°${lon < 0 ? 'W' : 'E'}`

/** After this long, a missing scene is not "lag": it doesn't exist. */
const SCENE_LAG_MS = 48 * 3_600_000

/** Below this ground distance the sub-satellite point is "overhead": a bearing would be noise. */
const OVERHEAD_KM = 15
/** Below this off-nadir angle the instrument was "looking straight down". */
const NADIR_DEG = 1.5
/** From this elevation up, a station is "almost straight up": the bearing flips around near the zenith and means nothing. */
const ZENITH_DEG = 80

/**
 * One precise paragraph about a pass, as sentences, in the active language. The order is always: what crossed,
 * when, where, how it moved → what that means for the image → what we can't know.
 */
export function passSentences({ pass: p, meta, capture, timeZone: tz, placeLabel: place, archiveFailed, now = Date.now() }: PassCopyCtx): Sentence[] {
  const m = msgs(enPass)
  const sat = meta.name
  /** The closest moment at the place: the clock (with seconds, or to the minute) and the zone's abbreviation */
  const at = (seconds = true) => ({ time: fmtLocalTime(p.tClosest, tz, seconds), zone: zoneAbbr(p.tClosest, tz) })
  const offset = p.groundDistanceKm < OVERHEAD_KM ? undefined : { km: p.groundDistanceKm, dir: compass8(p.azimuthDeg) }
  const deg = p.offNadirDeg < NADIR_DEG ? undefined : p.offNadirDeg
  const out: Sentence[] = []
  switch (p.verdict) {
    case 'imaged': {
      if (p.geostationary) {
        // It never crosses: it sits, and scans. The line's crossing is good to about a minute (geostationary.ts).
        const lon = p.track[0]?.lon
        out.push(m.geo.sits({ sat, altKm: p.altitudeKm, seat: lon !== undefined ? fmtLonShort(lon) : undefined, cadenceMin: meta.profile?.cadenceMin }))
        out.push(m.geo.reached({ place, ...at(false), heading: compass8(p.headingDeg) }))
        if (capture?.band === 'infrared') out.push([m.geo.infrared])
        break
      }
      out.push(m.crossed({ sat, altKm: p.altitudeKm, offset, ...at(), heading: compass8(p.headingDeg), speedKmS: p.groundSpeedKmS }))
      if (capture && isDailyMosaic(capture)) out.push(m.mosaic({ sensor: sensorName(capture), place, gsdM: capture.gsdM }))
      else if (capture && isRadar(capture)) out.push(m.radarImaged({ deg: p.offNadirDeg, place, gsdM: capture.gsdM, dark: p.sunElevationDeg < -6 }))
      else {
        out.push(deg === undefined ? [m.lookingDown] : m.lookingOff(deg))
        if (capture?.cloudCoverPct !== undefined) out.push(m.cloudCover(capture.cloudCoverPct))
      }
      break
    }
    case 'likely': {
      out.push(m.likely.crossed({ sat, altKm: p.altitudeKm, offset, ...at(), swathKm: meta.profile?.swathKm }))
      if (meta.category === 'open-optical') {
        if (archiveFailed) out.push([m.likely.archiveFailed])
        else if (now - p.tClosest > SCENE_LAG_MS) out.push([m.likely.noScene])
        else out.push([m.likely.notYet])
      } else if (p.sunElevationDeg < 0) {
        out.push([m.likely.dark])
      } else if (meta.profile?.gibs) {
        out.push([m.likely.mosaicUnconfirmed])
      } else {
        out.push([m.likely.notPublished])
      }
      break
    }
    case 'could': {
      out.push(m.could.withinView({ sat, ...at(false), offset }))
      const swath = meta.profile?.swathKm
      if (p.inSwath && swath && !meta.profile?.maxOffNadirDeg) {
        // Fixed-swath commercial imagers (e.g. Planet's Doves) record continuously, but privately.
        out.push(m.could.insideSwath({ place, swathKm: swath }))
      } else if (meta.category === 'radar') {
        // Sentinel-1 publishes every image it takes; a private operator does not say.
        out.push(m.could.radar({ place, deg, openArchive: !!meta.profile?.openArchive }))
      } else {
        out.push(m.could.camera({ place, deg }))
      }
      break
    }
    case 'overhead': {
      // Near the zenith the bearing flips around and means nothing.
      const toward = p.elevationDeg >= ZENITH_DEG ? undefined : compass8(p.azimuthDeg)
      out.push(m.overhead({ sat, altKm: p.altitudeKm, ...at(false), elevationDeg: p.elevationDeg, toward }))
      if (p.sunElevationDeg < -6) out.push([m.darkStation])
      break
    }
  }
  return out
}

// ── share ─────────────────────────────────────────────────────────────────────────────────

/**
 * Card / post headline in English: "Sentinel-2C watched Waterloo." The share card and post have their own copy in
 * every language (api/_lib/i18n/card); this English form is kept so the tests can hold the card's English to the
 * results' verdict verbs (one vocabulary). Never shown: English on purpose.
 */
export function shareHeadline(verdict: Pass['verdict'], name: string, place: string): { lead: string; place: string } {
  switch (verdict) {
    case 'imaged':
      return { lead: `${name} ${enVerdicts.imaged.verb}`, place }
    case 'likely':
      return { lead: `${name} ${enVerdicts.likely.verb}`, place }
    case 'could':
      return { lead: `${name} ${enVerdicts.could.verb} of`, place }
    case 'overhead':
      return { lead: `${name} passed over`, place }
  }
}
