/**
 * EUMETSAT's Meteosat frames around a place, for the geostationary watchers NASA GIBS has no layer for (Europe,
 * Africa, the Middle East, India). The pictures are EUMETSAT's, from its public map service (EUMETView, a GeoServer
 * WMS); most of them reach the app through the site's own cache of that service.
 *
 * Why it works the way it does:
 *  - Until 2026-11-17 every visitor's browser asked EUMETView directly: a frame list per layer, then a 176 px
 *    picture of the place per satellite. At the peak of 2026-11-15 that was about 1,000 pictures a minute, each one
 *    drawn for one visitor (a picture is cut around the searched place, so no two visitors share one). EUMETSAT's User
 *    Service Helpdesk wrote that this was far beyond fair use of a shared service (about one request a minute per
 *    layer), asked for a cache on our side, and said it would otherwise throttle or block the app.
 *  - So the site now fetches each frame ONCE, whole, on a timer (api/_lib/geoFill.ts, in the Cloudflare Worker), and
 *    the app reads two things from the site instead: the frames there are (`/api/geo-frames`, one small answer for
 *    all layers) and a place's small picture cut from a stored frame (`/api/geo`, up to 176 px: the watcher list's
 *    frame and the list thumbnails). The load on EUMETSAT no longer depends on the app's traffic at all.
 *  - A picture larger than that (the 1024 px card of an opened frame, the globe's decal) is still asked of EUMETView
 *    by the visitor who opens one: the cache's grid is the 176 px picture's own scale, too coarse for it, and these
 *    are few (about 4,000 on that peak day). They go to /geoserver/wms, the endpoint EUMETSAT asks clients to use.
 *  - NEVER fall back to asking EUMETView directly when the site's cache does not answer: that is the day everyone
 *    would. No list, or no picture, means no frame is shown for that satellite ("No image just now").
 *  - Only listed instants are ever asked for: a TIME between two frames is answered by EUMETView with the NEAREST
 *    frame (`nearestValue="1"`), so the age on screen is the frame's own. The cache lists a frame two minutes after
 *    it has stored it, about 25–30 minutes after it was taken (EUMETView itself publishes one 22–27 minutes old).
 *  - Off the disc, and where a daylight product is masked at night, a picture is BLACK, from EUMETView (asked with
 *    BGCOLOR) and from the cache alike. Black is NASA GIBS's "no data" too, so the one emptiness check serves all
 *    three (image.ts).
 *  - Meteosat-9's natural-colour product is masked wherever the sun stands under about 3°. An 800 km square is whole
 *    once the sun is 6° up at its centre (`minSunDeg`).
 *  - A picture's URL names its frame, place and size, and its answer is kept by the browser for a week.
 *
 * The pictures are EUMETSAT "Advanced Image Products", which its Data Policy (25 November 2025) lists as Core data:
 * free and unrestricted, with the attribution of article 6.3 (About page, THIRD_PARTY_NOTICES.md).
 */
import { CACHE_LAYERS, CUT_HALF_KM, CUT_MAX_PX } from '../../api/_lib/geoGrid'
import { bboxAround, sunElevationDeg } from '@/lib/geo'
import type { LatLon } from '@/types'
import { EUMETSAT_WMS, GEO_CUT, GEO_FRAMES_LIST, sanitizeCrop, type CropOpts } from './endpoints'
import { isoSeconds } from './gibs'
import { EmptyImageError, preloadImage } from './image'
import { isAbortError, raceAbort, throwIfAborted, withRetry } from './net'

/** A EUMETView layer as the frame search needs it. */
export interface EumetsatFrameLayer {
  /** "workspace:name", e.g. "mtg_fd:rgb_geocolour" */
  layer: string
  /** Minutes between frames */
  stepMin: number
  /** A daylight product: frames with the sun lower than this at the place are masked, so they are skipped */
  minSunDeg?: number
}

/** True for a picture the site's cache cuts: the app's 800 km square of a cached layer, at up to 176 px. */
const isCut = (layer: string, halfSizeKm: number, px: number) => layer in CACHE_LAYERS && halfSizeKm === CUT_HALF_KM && px <= CUT_MAX_PX

/**
 * The picture of a square in km around the place at one listed frame time: one URL per frame, place and size.
 * A small one is cut from the site's cache of the frame (`/api/geo`); a larger one is EUMETView's own render (WMS
 * 1.3.0 GetMap in EPSG:4326, where BBOX is minLat,minLon,maxLat,maxLon, as for GIBS). No data is black in both.
 */
export function eumetsatCropUrl(layer: string, ms: number, place: LatLon, opts: CropOpts): string {
  const { halfSizeKm, px } = sanitizeCrop(opts)
  const lat = (v: number) => Math.max(-90, Math.min(90, v)).toFixed(5)
  const lon = (v: number) => v.toFixed(5)
  const time = encodeURIComponent(isoSeconds(ms))
  // The place to 0.01° (about 1 km, a quarter of one pixel of a cut): pins in one neighbourhood share a picture, so
  // the site cuts it once, and the site's host learns no more of the place than the picture needs.
  if (isCut(layer, halfSizeKm, px)) return `${GEO_CUT}?layer=${encodeURIComponent(layer)}&time=${time}&lat=${place.lat.toFixed(2)}&lon=${place.lon.toFixed(2)}&px=${px}`
  const [w, s, e, n] = bboxAround(place.lat, place.lon, halfSizeKm)
  return (
    `${EUMETSAT_WMS}?service=WMS&version=1.3.0&request=GetMap&layers=${encodeURIComponent(layer)}&styles=` +
    `&format=${encodeURIComponent('image/jpeg')}&crs=EPSG:4326&bbox=${lat(s)},${lon(w)},${lat(n)},${lon(e)}` +
    `&width=${px}&height=${px}&bgcolor=0x000000&time=${time}`
  )
}

/** How long the frame list is trusted (the site keeps its answer for a minute itself). */
const LIST_TTL_MS = 5 * 60_000

/** `/api/geo-frames` as it answers: per layer, frame instants newest first. Anything else reads as no frames. */
export function parseFrameLists(json: unknown): Record<string, number[]> {
  const layers = (json as { layers?: unknown } | null)?.layers
  const out: Record<string, number[]> = {}
  if (!layers || typeof layers !== 'object') return out
  for (const [layer, list] of Object.entries(layers)) {
    if (Array.isArray(list)) out[layer] = list.filter((t): t is number => typeof t === 'number' && Number.isFinite(t)).sort((a, b) => b - a)
  }
  return out
}

let lists: { at: number; all: Promise<Record<string, number[]>> } | undefined

/**
 * The frames the site's cache holds for a layer, newest first: one small request for every layer, shared by
 * concurrent callers and kept for 5 minutes. Rejects when the list cannot be read or names no frame for the layer,
 * and on abort; a failed read is asked again next time.
 */
export function eumetsatFrames(info: Pick<EumetsatFrameLayer, 'layer'>, { signal, now = Date.now() }: { signal?: AbortSignal; now?: number } = {}): Promise<number[]> {
  let entry = lists
  if (!entry || Math.abs(now - entry.at) >= LIST_TTL_MS) {
    const all = withRetry(
      async (s) => {
        const res = await fetch(GEO_FRAMES_LIST, { signal: s })
        if (!res.ok) throw new Error(`The frame list answered ${res.status}`)
        return parseFrameLists(await res.json())
      },
      { timeoutMs: 6_000, retries: 1, label: GEO_FRAMES_LIST },
    )
    const mine = (entry = lists = { at: now, all })
    all.catch(() => {
      if (lists === mine) lists = undefined
    })
  }
  const frames = entry.all.then((all) => {
    const found = all[info.layer] ?? []
    if (!found.length) throw new Error(`No frames are listed for ${info.layer}`)
    return found
  })
  // A shared load: stop waiting on abort without cancelling it for other callers.
  return raceAbort(frames, signal)
}

/** Which listed frames are worth trying, newest first: the newest `maxSteps`, less those a daylight product masks. */
export function eumetsatFrameCandidates(info: EumetsatFrameLayer, place: LatLon, listed: readonly number[], maxSteps = 4): number[] {
  const window = listed.slice(0, maxSteps)
  const min = info.minSunDeg
  return min === undefined ? window : window.filter((t) => sunElevationDeg(place.lat, place.lon, t) >= min)
}

/** The newest frame is never older than this (measured: 22–37 minutes). */
const NEWEST_FRAME_MAX_AGE_MS = 60 * 60_000

/**
 * True if a daylight product could have a frame for the place among the `maxSteps` newest: the sun stood high enough
 * at some point they can cover. No request is made otherwise.
 */
function sunWasUp(info: EumetsatFrameLayer, place: LatLon, now: number, maxSteps: number): boolean {
  const min = info.minSunDeg
  if (min === undefined) return true
  const oldest = now - NEWEST_FRAME_MAX_AGE_MS - maxSteps * info.stepMin * 60_000
  for (let t = now; t >= oldest; t -= 5 * 60_000) if (sunElevationDeg(place.lat, place.lon, t) >= min) return true
  return false
}

/**
 * The newest frame there is for the place on this layer, as a URL at `opts` size: the first of the newest few
 * listed frames that loads with pixels (`preloadImage` rejects an all-black answer, and the verified image stays
 * loaded, so showing the URL costs nothing more). An empty frame gives way to the one before it; a frame that fails
 * to load ends the search. Resolves null when nothing qualifies: a daylight product at night (no request at all
 * then), a place off the disc, the service down or busy. Rejects only on abort. Browser only.
 */
export async function latestEumetsatFrame(
  info: EumetsatFrameLayer,
  place: LatLon,
  opts: CropOpts,
  { signal, now = Date.now(), maxSteps = 4 }: { signal?: AbortSignal; now?: number; maxSteps?: number } = {},
): Promise<{ url: string; time: number } | null> {
  if (!sunWasUp(info, place, now, maxSteps)) return null
  let listed: number[]
  try {
    listed = await eumetsatFrames(info, { signal, now })
  } catch (err) {
    if (isAbortError(err) || signal?.aborted) throw err
    return null // no list, no frame: a guessed TIME is one the cache does not hold, and EUMETView would answer its nearest
  }
  for (const t of eumetsatFrameCandidates(info, place, listed, maxSteps)) {
    throwIfAborted(signal)
    const url = eumetsatCropUrl(info.layer, t, place, opts)
    try {
      await preloadImage(url, { signal })
      return { url, time: t }
    } catch (err) {
      throwIfAborted(signal)
      // Only an empty frame (masked, or not yet whole) sends the search one frame back. A failed or slow answer means
      // the service is busy: asking it for three more frames then would add to that, for a picture nobody waits for.
      if (!(err instanceof EmptyImageError)) return null
    }
  }
  return null
}
