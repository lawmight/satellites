/**
 * 04 / WATCHED CONTINUOUSLY: geostationary imagers that see the place all the time. They never "pass",
 * so they are a band, not events (DESIGN §2). Where a public map service carries the satellite (GOES and
 * Himawari on NASA GIBS, the Meteosats on EUMETSAT), the row gets a small live frame: the newest one that
 * service actually has pixels for at the place (src/imagery/geoFrames.ts). A frame taken in infrared says so
 * on the picture, in ice (the night-capable hue, DESIGN §2): it is cloud tops, not the ground. A place at the
 * rim of a satellite's disc keeps its frame here while most of it is picture; once more than half is off the
 * disc the row says "Poor quality".
 *
 * The section is the list alone: no sentence singles out one of the watchers above it (owner).
 *
 * Words: the 'results' namespace (geo). A frame's state is kept as a reason id (cached for the session), worded when
 * it is shown. EUMETSAT's credit line stays in English in every language: its data policy words it.
 */
import { useEffect, useState } from 'react'
import enResults from '@/i18n/en/results'
import { useMsgs } from '@/i18n/runtime'
import { isEumetsatSource, latestGeoFrame, type GeoFrameBand } from '@/imagery'
import type { GeoWatcher, LatLon, Pass, Place } from '@/types'
import { Glyph, LiveDot, cx, fmtLon } from '@/ui/system'
import { Rich } from '@/i18n/Rich'
import { Img } from './Img'
import { fmtRelative } from './lib/time'
import s from './GeoWatchers.module.css'

const FRAME = { halfSizeKm: 400, px: 176 }
/** The row's count: its number in the count's mono face */
const COUNT = { num: s.countNum }
/** A frame from the rim of a disc is shown while at least half of it is picture. */
const RIM_MAX_EMPTY = 0.5

/** Why a row has no picture: 'noPublic' (no map service carries it), 'poorQuality' (the rim of its disc), 'noneNow', 'unavailable' */
export type GeoFrameReason = 'noPublic' | 'poorQuality' | 'noneNow' | 'unavailable'
export type GeoFrameState = { kind: 'loading' } | { kind: 'ok'; url: string; time: number; band: GeoFrameBand; gridKm: number } | { kind: 'none'; reason: GeoFrameReason }

/** Probe results this session, so a remount (back from a pass) shows the frame at once, never "Probing…" (A2). */
const probed = new Map<string, GeoFrameState>()
/** Frame URLs already shown: a remount draws them without the fade. */
export const shownGeoFrames = new Set<string>()

/**
 * The newest frame the watcher's service actually has pixels for at the place. Shared by the list's small frames
 * and the summary's geostationary best-look fallback.
 */
export function useGeoFrame(watcher: GeoWatcher, place: LatLon, spec: { halfSizeKm: number; px: number }): GeoFrameState {
  const source = watcher.frames
  const { halfSizeKm, px } = spec
  const key = `${source}|${place.lat},${place.lon}|${halfSizeKm}|${px}`
  const [state, setState] = useState<GeoFrameState>(() => probed.get(key) ?? (source ? { kind: 'loading' } : { kind: 'none', reason: 'noPublic' }))
  useEffect(() => {
    if (!source) return
    const hit = probed.get(key)
    if (hit) return setState(hit)
    const ctl = new AbortController()
    setState({ kind: 'loading' })
    latestGeoFrame(source, place, { halfSizeKm, px }, { signal: ctl.signal })
      .then((r) => {
        if (ctl.signal.aborted) return
        // At the rim of a disc, a frame that is mostly off it shows nothing of the place: no picture, and the row says
        // why. Elsewhere, nothing with pixels means the service is not answering.
        const offDisc = !!watcher.rim && (!r || r.empty > RIM_MAX_EMPTY)
        const v: GeoFrameState = r && !offDisc ? { kind: 'ok', url: r.url, time: r.time, band: r.band, gridKm: r.gridKm } : { kind: 'none', reason: offDisc ? 'poorQuality' : 'noneNow' }
        probed.set(key, v)
        setState(v)
      })
      .catch(() => undefined) // only an abort rejects: the next effect owns the state
    return () => ctl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state
}

/**
 * `scans`: the report's geostationary scan passes (the newest image of a watcher, as something that can be opened).
 * A row that has one is a button: it opens the scan like a pass (its replay, its image), as the pass list's rows do.
 */
export function GeoWatchers({ watchers, place, days, scans, selectedId, onSelect }: { watchers: GeoWatcher[]; place: Place; days: number; scans?: readonly Pass[]; selectedId?: string; onSelect?: (p: Pass) => void }) {
  const m = useMsgs(enResults).geo
  if (!watchers.length) return <p className={s.none}>{m.none}</p>
  return (
    <div className={s.root}>
      <ul className={s.list}>
        {watchers.map((g) => {
          const scan = onSelect ? scans?.find((p) => p.norad === g.norad) : undefined
          const body = (
            <>
              <Frame watcher={g} place={place} />
              <div className={s.info}>
                <div className={s.nameLine}>
                  <Glyph name="weather-geo" size={13} />
                  <span className={s.name}>{g.name}</span>
                  <span className={s.operator}>{g.operator}</span>
                </div>
                <div className={s.meta}>{m.facts(fmtLon(g.subLon, 1), g.elevationDeg, g.cadenceMin)}</div>
                <div className={s.count}>
                  <Rich parts={m.images(g.imagesInWindow, Math.round(days))} classes={COUNT} />
                </div>
              </div>
              {scan ? (
                <span className={s.open} aria-hidden>
                  <Glyph name="play" size={10} /> <span className={s.openText}>{m.replay}</span>
                </span>
              ) : null}
            </>
          )
          return (
            <li key={g.norad} className={s.item}>
              {scan ? (
                <button type="button" className={cx(s.row, s.rowBtn, selectedId === scan.id && s.selected)} onClick={() => onSelect?.(scan)} aria-label={m.replayLabel(g.name)}>
                  {body}
                </button>
              ) : (
                <div className={s.row}>{body}</div>
              )}
            </li>
          )
        })}
      </ul>
      {watchers.some((g) => g.frames && isEumetsatSource(g.frames)) ? (
        // The data policy's own words (EUMETSAT): English in every language, like the other licence credits.
        <p className={s.credit} lang="en">Contains modified EUMETSAT Meteosat data {new Date().getUTCFullYear()}</p>
      ) : null}
    </div>
  )
}

function Frame({ watcher, place }: { watcher: GeoWatcher; place: Place }) {
  const frame = useGeoFrame(watcher, place, FRAME)
  const [failed, setFailed] = useState(false)
  const m = useMsgs(enResults).geo
  const state: GeoFrameState = failed ? { kind: 'none', reason: 'unavailable' } : frame
  // The first showing this session fades in once; a remount re-attaches the same element at once (R3-1, A2).
  const [fade] = useState(() => !(state.kind === 'ok' && shownGeoFrames.has(state.url)))

  return (
    <div className={s.frameCol}>
      <div className={s.frame}>
        {state.kind === 'ok' ? (
          <Img
            view="geo"
            url={state.url}
            alt={m.frameAlt(watcher.name, state.band === 'infrared')}
            fadeClass={fade ? s.frameFade : undefined}
            onReady={() => shownGeoFrames.add(state.url)}
            onError={() => setFailed(true)}
          />
        ) : (
          <span className={s.frameNote}>{state.kind === 'loading' ? m.frame.probing : m.frame[state.reason]}</span>
        )}
        <span className={s.reticle} aria-hidden />
        {state.kind === 'ok' && state.band === 'infrared' ? (
          <span className={s.band} title={m.infraredTitle} aria-hidden>
            {m.infraredChip}
          </span>
        ) : null}
      </div>
      <div className={s.frameTime}>
        {state.kind === 'ok' ? (
          <>
            <LiveDot className={s.dot} /> {fmtRelative(state.time, Date.now())}
          </>
        ) : (
          '—'
        )}
      </div>
    </div>
  )
}
