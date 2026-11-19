/**
 * Pass detail.
 *
 *   PhotoPassView  a pass with a photo (owner B): the gallery (the same carousel as the summary hero, at the
 *                  column's width) stays mounted while you swipe; under it the pass's readouts, sentence,
 *                  01 / GEOMETRY and 02 / REPLAY change in place (a 160 ms fade) as the selection follows.
 *   PassDetail     a pass with no photo: the plan view, the same readouts and sections.
 *
 * Copy always uses Pass.tClosest, never Capture.datetime (Sentinel-2 archive times are the datatake start,
 * minutes before the satellite was over the place).
 *
 * Honest about cloud (decision #2): a mostly-cloud scene says so in its caption and its spot line, and a
 * near-total one is dimmed so it is never the brightest thing on screen.
 */
import { startTransition, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { isRadarUrl, isTonedUrl, spotCloud, tonedImageBlob } from '@/imagery'
import type { Capture, Pass, SpotCloud } from '@/types'
import { Glyph, Readout, Rule, ScrambleOnce, cx, fmtLon, fmtNorad, fmtUtcDate, fmtUtcTime } from '@/ui/system'
import { profileBlurb } from '@/engine'
import { msgs, useLocale, useMsgs } from '@/i18n/runtime'
import enPassView from '@/i18n/en/passView'
import enSats from '@/i18n/en/sats'
import { fmt } from '../../../api/_lib/i18n/format'
import { isUnitSymbol } from '../../../api/_lib/i18n/units'
import { reportNow } from './Ago'
import { decodedPhoto } from './images'
import { cardUrl } from './lib/photos'
import { Gallery } from './Gallery'
import { PassPlan } from './PassPlan'
import { ReplayControls } from './ReplayControls'
import { Paragraph } from './Text'
import { archiveName, cropSpec, downloadUrl, isDailyMosaic, isGeoFrame, isRadar, pixelLabel, slug, captureFor } from './lib/captures'
import { compassAbbr, passSentences } from './lib/copy'
import type { SatMeta } from './lib/meta'
import { replayWindow } from './lib/replay'
import { fmtDuration } from './lib/time'
import type { ResultsModel } from './model'
import { placeName } from './placeName'
import r from './results.module.css'
import s from './PassDetail.module.css'

/** Stagger slot for the detail entrance (R14): ms delay as a CSS variable. */
const st = (ms: number) => ({ '--st': `${ms}ms` }) as CSSProperties

/** A pass older than this with no scene has no scene (not "archive lag"). */
const SCENE_LAG_MS = 48 * 3_600_000

/** The UTC clock to the minute, "16:14" (international notation in every language). */
const utcHm = (ms: number) => fmtUtcTime(ms, false)

/**
 * A pass with a photo. The gallery persists across quiet selections (swipes); the body below is keyed by the
 * pass and fades in place when the selection moves (the first one enters with the panel's own swap).
 */
export function PhotoPassView({ model, pass, mobile, onReplay }: { model: ResultsModel; pass: Pass; mobile: boolean; onReplay?: (p: Pass) => void }) {
  const first = useRef(pass.id)
  // The body follows the selection in a transition (interruptible, off the swipe's critical path, A3): a quiet
  // selection's synchronous work is the header, the footer and the gallery, never the whole body.
  const [bodyPass, setBodyPass] = useState(pass)
  useEffect(() => {
    if (pass.id !== bodyPass.id) startTransition(() => setBodyPass(pass))
  }, [pass, bodyPass.id])
  const shown = model.passById.get(bodyPass.id) ?? pass
  const m = useMsgs(enPassView)
  return (
    <div className={s.detail}>
      <section className={cx(r.section, s.st)} style={st(0)} aria-label={m.photosSection}>
        <Gallery model={model} context="detail" mobile={mobile} selectedId={pass.id} onReplay={onReplay} />
      </section>
      <PassBody key={shown.id} model={model} pass={shown} entering={first.current === shown.id} />
    </div>
  )
}

/** A pass with no photo: its plan view, then the same body. */
export function PassDetail({ model, pass }: { model: ResultsModel; pass: Pass }) {
  const meta = model.meta(pass.norad)
  const place = model.report.place
  const now = reportNow(model.clock)
  const m = useMsgs(enPassView)
  return (
    <div className={s.detail}>
      <section className={cx(r.section, s.st)} style={st(0)} aria-label={m.planSection}>
        <div data-image-end>
          <PassPlan pass={pass} meta={meta} lat={place.lat} lon={place.lon} className={s.plan} />
        </div>
        <p className={r.footnote}>{noImageNote(pass, meta, model.archiveFailed, now)}</p>
      </section>
      <PassBody model={model} pass={pass} entering />
    </div>
  )
}

/**
 * The pass's words and numbers: the readout strip, the sentence (+ the spot line, the blurb, the links),
 * 01 / GEOMETRY and 02 / REPLAY. `entering`: the staggered entrance of a freshly opened pass; otherwise (a
 * quiet selection from the gallery) one 160 ms fade of the block.
 */
function PassBody({ model, pass, entering }: { model: ResultsModel; pass: Pass; entering: boolean }) {
  const { report, tz } = model
  const meta = model.meta(pass.norad)
  const capture = captureFor(report, pass)
  const place = report.place
  const cloud = useSpotCloud(capture, place)
  const now = reportNow(model.clock)
  const sentences = passSentences({ pass, meta, capture, timeZone: tz, placeLabel: placeName(place), archiveFailed: model.archiveFailed, now })
  // PERF-04: the words commit first; geometry and replay a frame later, interruptibly.
  const [rest, setRest] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => startTransition(() => setRest(true)))
    return () => cancelAnimationFrame(id)
  }, [])
  const stc = entering ? s.st : undefined
  const m = useMsgs(enPassView)
  // The satellite's one-sentence blurb, in the visitor's language (the profile names it by key: src/i18n/en/sats.ts).
  const blurb = profileBlurb(meta.profile, useMsgs(enSats))
  return (
    <div className={cx(s.body, !entering && s.quietIn)}>
      <section className={cx(r.section, stc)} style={st(0)}>
        <ReadoutStrip pass={pass} meta={meta} capture={capture} cloud={cloud} />
      </section>

      <section className={cx(r.section, stc, s.prose)} style={st(60)}>
        <Paragraph sentences={sentences} />
        {capture && !isDailyMosaic(capture) && !isRadar(capture) && !isGeoFrame(capture) ? <SpotLine state={cloud} /> : null}
        {capture && isGeoFrame(capture) ? <p className={r.footnote}>{m.fullDiscNote(pixelLabel(capture), meta.profile?.cadenceMin)}</p> : null}
        {capture && isDailyMosaic(capture) ? <p className={r.footnote}>{m.mosaicNote(capture.gsdM)}</p> : null}
        {capture && isRadar(capture) ? <p className={r.footnote}>{m.radarNote}</p> : null}
        {blurb ? <p className={r.blurb}>{blurb}</p> : null}
        {capture ? <Links capture={capture} pass={pass} meta={meta} placeLabel={place.canonicalLabel ?? place.label} /> : null}
      </section>

      {rest ? (
        <>
          <section className={r.section} aria-label={m.geometry}>
            <div className={stc} style={st(120)}>
              <Rule index="01" className={r.rule}>
                {m.geometry}
              </Rule>
            </div>
            <Geometry pass={pass} meta={meta} tz={tz} model={model} entering={entering} />
          </section>

          <section className={cx(r.section, stc)} style={st(300)} aria-label={m.replay}>
            <Rule index="02" className={r.rule}>
              {m.replay}
            </Rule>
            <ReplayControls pass={pass} />
          </section>
        </>
      ) : null}
    </div>
  )
}

/** Why a pass shows its plan view, not a picture (read at render time, in the active language). */
function noImageNote(p: Pass, meta: SatMeta, archiveFailed: boolean, now: number): string {
  const m = msgs(enPassView).noImage
  switch (p.verdict) {
    case 'could':
      // The sentence below says what we can't know; this only says why there is no picture.
      if (meta.profile?.openArchive) return m.openArchive(meta.name)
      return meta.category === 'radar' ? m.radarPrivate : m.commercialPrivate
    case 'likely':
      if (meta.category !== 'open-optical') return m.noneToShow
      if (archiveFailed) return m.archiveDown
      if (now - p.tClosest > SCENE_LAG_MS) return m.noScene
      return m.notYet
    case 'overhead':
      return m.crewed
    default:
      return m.unavailable
  }
}

function Links({ capture, pass, meta, placeLabel }: { capture: Capture; pass: Pass; meta: SatMeta; placeLabel: string }) {
  const m = useMsgs(enPassView).links
  const spec = cropSpec(capture.collection)
  const [dl, setDl] = useState<'idle' | 'busy' | 'err'>('idle')
  const download = async () => {
    if (dl === 'busy') return
    setDl('busy')
    const url = downloadUrl(capture, spec)
    try {
      // Sentinel-2 / Landsat: the lossless render, toned exactly like the photo on screen (same curve, PNG); a radar
      // image toned as on screen too.
      let blob: Blob
      if (isTonedUrl(url) || isRadarUrl(url)) blob = await tonedImageBlob(url, { fmt: 'png' })
      else {
        const res = await fetch(url)
        if (!res.ok) throw new Error(String(res.status))
        blob = await res.blob()
      }
      const ext = blob.type.includes('png') ? 'png' : 'jpg'
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      // The place's English name when it has one (as links and shares are named); a name only in another script, whose
      // slug is empty, drops out rather than leave "--".
      a.download = `${['watched', slug(meta.name), slug(placeLabel), new Date(pass.tClosest).toISOString().slice(0, 10)].filter(Boolean).join('-')}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(a.href), 4000)
      setDl('idle')
    } catch {
      // The render could not be fetched as a file: offer it as a plain link instead (a window.open
      // here, after an await, would be popup-blocked).
      setDl('err')
    }
  }
  return (
    <div className={s.links}>
      {dl === 'err' ? (
        // The picture on screen (its toned bytes, a blob: URL) when the lossless render could not be fetched.
        <a className={s.link} href={decodedPhoto(cardUrl(capture))?.src ?? downloadUrl(capture, spec)} target="_blank" rel="noopener noreferrer">
          <Glyph name="arrow-up-right" size={12} />
          {m.openToSave}
        </a>
      ) : (
        <button type="button" className={s.link} onClick={download} disabled={dl === 'busy'}>
          <Glyph name="download" size={12} />
          {dl === 'busy' ? m.downloading : m.download}
        </button>
      )}
      {capture.sourceUrl ? (
        <a className={s.link} href={capture.sourceUrl} target="_blank" rel="noopener noreferrer">
          <Glyph name="arrow-up-right" size={12} />
          {m.viewSource(archiveName(capture))}
        </a>
      ) : null}
    </div>
  )
}

// ── readout strip (R23) ──────────────────────────────────────────────────────────────────

function ReadoutStrip({ pass: p, meta, capture, cloud }: { pass: Pass; meta: SatMeta; capture?: Capture; cloud: CloudState }) {
  const m = useMsgs(enPassView)
  const f = fmt(useLocale())
  const L = m.strip
  const U = m.unit
  const res = capture?.gsdM ?? meta.profile?.resolutionM
  const spot: SpotCloud | undefined = cloud === 'checking' || cloud === 'none' ? capture?.spot : cloud
  // `id` keys the cell (never its words: two labels may read alike in a language).
  let last: { id: string; label: string; value: string; unit?: string }
  // A radar image needs no light: the sun is the fact worth showing (it may well have been night).
  if (capture && isGeoFrame(capture)) last = { id: 'band', label: L.band, value: capture.band === 'infrared' ? m.band.infrared : capture.band === 'visible' ? m.band.visible : m.band.colour }
  else if (!capture || isRadar(capture))
    last = { id: 'sun', label: L.sun, value: `${f.dec(p.sunElevationDeg, 1)}°`, unit: p.sunElevationDeg >= 0 ? U.sun.day : p.sunElevationDeg >= -6 ? U.sun.twilight : U.sun.night }
  else if (isDailyMosaic(capture)) last = { id: 'cloud', label: L.cloud, value: '—', unit: U.mosaic }
  else if (cloud === 'checking' && !capture.spot) last = { id: 'spot', label: L.cloudAtSpot, value: '…' }
  else if (spot && spot !== 'unknown') last = { id: 'spot', label: L.cloudAtSpot, value: m.spotValue[spot] }
  else
    last = {
      id: 'cloud',
      label: L.cloud,
      value: capture.cloudCoverPct !== undefined ? f.pct(capture.cloudCoverPct) : '—',
      unit: capture.cloudCoverPct !== undefined ? U.scene : undefined,
    }
  const cells = [
    { id: 'altitude', label: L.altitude, value: f.int(p.altitudeKm), unit: U.km },
    // A geostationary imager is never overhead: how high it stands in your sky says more than its mirror's angle.
    p.geostationary ? { id: 'elevation', label: L.elevation, value: `${f.dec(p.elevationDeg, 1)}°`, unit: U.up } : { id: 'offNadir', label: L.offNadir, value: `${f.dec(p.offNadirDeg, 1)}°` },
    res !== undefined && res >= 1000
      ? { id: 'pixel', label: L.pixel, value: f.int(res / 1000), unit: U.km }
      : { id: 'pixel', label: L.pixel, value: res !== undefined ? (res < 1 ? f.dec(res, 2) : f.int(res)) : '—', unit: res !== undefined ? U.m : undefined },
    last,
  ]
  const ref = useTightLabels(cells.map((c) => c.label).join('\n'))
  return (
    <div className={s.strip} ref={ref}>
      {cells.map((c) => (
        <div key={c.id} className={s.stripCell}>
          <span className={s.stripLabel}>{c.label}</span>
          <span className={s.stripValue}>
            {c.value}
            {/* A word in the unit slot ("day", "scene") is in caps with its label; a unit symbol ("km") never is. */}
            {c.unit ? (
              <span className={s.stripUnit} data-unit={isUnitSymbol(c.unit) ? '' : undefined}>
                {c.unit}
              </span>
            ) : null}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * A label that is one word wider than its cell ("Dépointage", "Nubosidad" on a phone) cannot wrap: it drops its
 * tracking (`data-tight="1"`), and on the narrowest phones takes the micro size too ("2"), rather than run over the
 * divider or the strip's edge. Measured, so a label that fits is left as it is; again when the strip's width or a
 * font changes.
 */
function useTightLabels(words: string) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const strip = ref.current
    if (!strip) return
    const fit = () => {
      for (const label of strip.querySelectorAll<HTMLElement>(`.${s.stripLabel}`)) {
        delete label.dataset.tight
        for (let level = 1; level <= 2 && label.scrollWidth > label.clientWidth; level++) label.dataset.tight = String(level)
      }
    }
    fit()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(fit)
    ro.observe(strip)
    document.fonts?.addEventListener('loadingdone', fit)
    return () => {
      ro.disconnect()
      document.fonts?.removeEventListener('loadingdone', fit)
    }
  }, [words])
  return ref
}

// ── spot cloud ────────────────────────────────────────────────────────────────────────────

type CloudState = 'checking' | SpotCloud | 'none'

/** The classification at the place: the engine's (capture.spot) when it has one, else read it now. */
function useSpotCloud(capture: Capture | undefined, place: { lat: number; lon: number }): CloudState {
  const known = capture?.spot
  const [state, setState] = useState<CloudState>(() => known ?? 'none')
  useEffect(() => {
    if (!capture || isDailyMosaic(capture) || isRadar(capture) || isGeoFrame(capture)) return setState('none')
    if (capture.spot) return setState(capture.spot)
    const ctl = new AbortController()
    setState('checking')
    spotCloud(capture, place, ctl.signal)
      .then((v) => !ctl.signal.aborted && setState(v))
      .catch(() => !ctl.signal.aborted && setState('unknown'))
    return () => ctl.abort()
  }, [capture, place])
  return state
}

function SpotLine({ state }: { state: CloudState }) {
  const m = useMsgs(enPassView)
  if (state === 'none' || state === 'unknown') return null
  return (
    <p className={cx(s.spot, state === 'checking' && s.spotChecking)} aria-live="polite">
      <span className={cx(s.spotMark, state === 'clear' && s.spotClear, state === 'cirrus' && s.spotCirrus)} aria-hidden />
      {m.spot[state]}
    </p>
  )
}

// ── geometry ──────────────────────────────────────────────────────────────────────────────

function Geometry({ pass: p, meta, tz, model, entering }: { pass: Pass; meta: SatMeta; tz: string; model: ResultsModel; entering: boolean }) {
  const m = useMsgs(enPassView)
  const f = fmt(useLocale())
  const G = m.geo
  // UTC stamps are international notation: built from the instant, never split back out of formatted text.
  const utcDate = fmtUtcDate(p.tClosest)
  const prof = meta.profile
  const w = replayWindow(p)
  const t = model.times(p)
  void tz
  const sun = p.sunElevationDeg >= 0 ? m.sunPhase.day : p.sunElevationDeg >= -6 ? m.sunPhase.twilight : m.sunPhase.night
  // Cells are keyed by `id`, never by their words (two labels may read alike in a language).
  if (p.geostationary) {
    // A scan, not an overflight: where the satellite sits, and how its line crossed the place (to about a minute).
    const geoCells: { id: string; label: string; value: ReactNode; unit?: string; wide?: boolean }[] = [
      { id: 'scanUtc', label: G.scanUtc, value: `≈ ${utcHm(p.tClosest)}`, unit: utcDate },
      { id: 'scanLocal', label: G.scanLocal, value: `≈ ${t.time}`, unit: `${t.day} ${t.zone}` },
      { id: 'aboveEquator', label: G.aboveEquator, value: fmtLon(p.track[0]?.lon ?? 0, 1) },
      { id: 'inYourSky', label: G.inYourSky, value: `${f.dec(p.elevationDeg, 1)}°`, unit: m.upCompass(compassAbbr(p.azimuthDeg)) },
      { id: 'scanDirection', label: G.scanDirection, value: p.node === 'descending' ? m.northToSouth : m.southToNorth },
      { id: 'lineSpeed', label: G.lineSpeed, value: f.dec(p.groundSpeedKmS, 1), unit: m.unit.kmS },
      { id: 'sunElevation', label: G.sunElevation, value: `${f.dec(p.sunElevationDeg, 1)}°`, unit: sun },
      { id: 'coverage', label: G.coverage, value: m.fullDisc, unit: prof?.cadenceMin ? m.everyMin(prof.cadenceMin) : undefined },
      { id: 'thisScan', label: G.thisScan, value: m.timeRange(utcHm(p.tStart), utcHm(p.tEnd)), unit: `UTC · ${fmtDuration(p.tEnd - p.tStart)}`, wide: true },
      { id: 'noradScan', label: G.noradScan, value: <ScrambleOnce text={fmtNorad(p.norad)} />, unit: p.id, wide: true },
    ]
    return (
      <div className={r.grid}>
        {geoCells.map((c, i) => (
          <div key={c.id} className={cx(r.cell, c.wide && r.cellWide, entering && s.st)} style={st(Math.min(300, 120 + i * 20))}>
            <Readout label={c.label} value={c.value} unit={c.unit} />
          </div>
        ))}
      </div>
    )
  }
  const span = p.tEnd > p.tStart
  const cells: { id: string; label: string; value: ReactNode; unit?: string; wide?: boolean }[] = [
    { id: 'closestUtc', label: G.closestUtc, value: fmtUtcTime(p.tClosest), unit: utcDate },
    { id: 'closestLocal', label: G.closestLocal, value: t.timeS, unit: `${t.day} ${t.zone}` },
    { id: 'groundDistance', label: G.groundDistance, value: f.dec(p.groundDistanceKm, 1), unit: m.unit.km },
    { id: 'elevationFromYou', label: G.elevationFromYou, value: `${f.dec(p.elevationDeg, 1)}°`, unit: compassAbbr(p.azimuthDeg) },
    { id: 'groundSpeed', label: G.groundSpeed, value: f.dec(p.groundSpeedKmS, 2), unit: m.unit.kmS },
    { id: 'heading', label: G.heading, value: `${f.dec(p.headingDeg, 1)}°`, unit: m.heading(compassAbbr(p.headingDeg), p.node === 'ascending') },
    { id: 'sunElevation', label: G.sunElevation, value: `${f.dec(p.sunElevationDeg, 1)}°`, unit: sun },
    prof?.maxOffNadirDeg
      ? { id: 'fieldOfRegard', label: G.fieldOfRegard, value: `±${f.int(prof.maxOffNadirDeg)}°` }
      : { id: 'swath', label: G.swath, value: prof?.swathKm ? f.int(prof.swathKm) : '—', unit: prof?.swathKm ? m.unit.km : undefined },
    {
      id: span ? (p.inSwath ? 'inSwath' : 'inView') : 'window',
      label: span ? (p.inSwath ? G.inSwath : G.inView) : G.window,
      value: span ? m.timeRange(fmtUtcTime(p.tStart), fmtUtcTime(p.tEnd)) : m.timeRange(fmtUtcTime(w[0]), fmtUtcTime(w[1])),
      unit: span ? fmtDuration(p.tEnd - p.tStart) : 'UTC',
      wide: true,
    },
    // The pass ID lives here, with the satellite's catalog number (not in the header: V05).
    { id: 'noradPass', label: G.noradPass, value: <ScrambleOnce text={fmtNorad(p.norad)} />, unit: p.id, wide: true },
  ]
  return (
    <div className={r.grid}>
      {cells.map((c, i) => (
        <div key={c.id} className={cx(r.cell, c.wide && r.cellWide, entering && s.st)} style={st(Math.min(300, 120 + i * 20))}>
          <Readout label={c.label} value={c.value} unit={c.unit} />
        </div>
      ))}
    </div>
  )
}
