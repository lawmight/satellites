/**
 * Keeping the Meteosat frame cache full: the one place the site asks EUMETSAT's map service for small pictures.
 *
 * `runFill` runs once a minute (the Worker's cron, worker/index.ts). For each layer it reads the layer's small
 * capabilities document to learn of a new frame, fetches that frame as four pieces (geoGrid.ts), cuts each into raw
 * tiles and stores them. Everything a visitor then sees comes from the store (api/geo.ts, api/geo-frames.ts).
 *
 * Why it works the way it does:
 *  - The load on EUMETSAT is fixed, whatever the site's traffic: per layer, four pictures a frame and a few looks at
 *    the list. EUMETView publishes a frame 21 to 29 minutes after it is taken (measured 2026-11-17), so the list is
 *    read from 20 minutes after the next frame's own time, once a minute, then every two minutes if it is late. About
 *    one request a minute per layer or less, which is what its User Service Helpdesk asked for on 2026-11-17 after
 *    the app's visitors had each asked it directly (about 1,000 pictures a minute at the peak of 2026-11-15).
 *  - The list is the layer's capabilities document, which EUMETView's own cache hands out (cheap for it) but which
 *    can be minutes stale (ages of 121–177 s were seen against its stated 120; a cached error was once held for
 *    minutes: 2026-11-11). So every second read asks the tile service's DescribeDomains instead: 250 bytes, never
 *    cached, the same newest frame. In production it named a new frame of two layers while the document still named
 *    the one before (2026-11-17 18:23Z), and the frame could be fetched at once.
 *  - The last runs that did anything are kept in the stored state (`log`): the one record of what a list read saw,
 *    since the Worker stores no logs. On the first evening a frame of each satellite was skipped and nothing could
 *    say whether EUMETView had listed it late or a read had failed.
 *  - A piece that fails is asked for again a minute later, six times at most; then the frame is given up and the
 *    next one awaited. Never a tight loop.
 *  - A daylight product is black where the sun is down. A piece wholly in the dark is not fetched, and a tile with
 *    nothing in it is not stored: fewer requests there, fewer writes here.
 *  - A frame is listed only two minutes after its last tile is stored: the store (Workers KV) takes up to a minute to
 *    show a new value everywhere, and a frame is never listed before it can be cut anywhere.
 *  - Runs must not overlap (a slow download can outlast the minute): a run that has pieces to fetch says so in the
 *    stored state first, and a run that finds that note leaves at once.
 *  - Tiles expire by themselves (the store's own time to live): a frame is kept while it can still be among the
 *    newest four its layer lists, and the state forgets it a little before the tiles go.
 *
 * Costs on Cloudflare, by design: a piece is decoded once (WebAssembly, ~80 ms) instead of per visitor; about 50
 * tile writes a frame and two or three state writes; nothing is read or written in a minute with nothing due.
 */
import { CACHE_LAYERS, NO_TILES, PIECE_COUNT, PIECE_PX, TILE_BYTES, TILE_PX, pieceRect, pieceUrl, sunElevation, tileKey, withTile, type CacheLayer } from './geoGrid.js'

/** The store the cache lives in: Workers KV on Cloudflare (worker/index.ts), a Map in tests. */
export interface GeoStore {
  getText(key: string): Promise<string | null>
  getBytes(key: string): Promise<ArrayBuffer | null>
  put(key: string, value: string | Uint8Array, ttlSeconds?: number): Promise<void>
}

export const GEOSERVER = 'https://view.eumetsat.int/geoserver'
/** Says who is asking, so EUMETSAT can tell this cache from a visitor and reach its owner (the About page). */
export const USER_AGENT = 'watched.earth frame cache (+https://www.watched.earth)'

/** What the fill keeps for itself between runs. */
const FILL_KEY = 'fill'
/** What the endpoints read: the frames that can be cut. */
export const FRAMES_KEY = 'frames'

/** A stored frame: its time, which tiles it has, when its last tile was stored and when it stops being served. */
export interface StoredFrame {
  t: number
  tiles: string
  readyAt: number
  exp: number
}
export interface FramesDoc {
  v: 1
  layers: Record<string, StoredFrame[]>
}

interface PendingFrame {
  t: number
  /** Pieces done, one bit each */
  got: number
  tiles: string
  tries: number
  exp: number
}
interface FillLayer {
  /** When the list is next read */
  pollAt: number
  /** The newest frame ever seen listed */
  newest: number
  /** List reads in a row that showed nothing newer */
  misses?: number
  pending?: PendingFrame
  /** Newest first */
  ready: StoredFrame[]
}
interface FillState {
  v: 1
  /** A run is fetching pieces until then */
  lease: number
  layers: Record<string, FillLayer>
  /** The frames document as last written */
  pub: string
  /** What the last runs that did anything saw, oldest first */
  log?: RunNote[]
}

/** One run, for whoever reads the state later: when, which lists it read and what each named, and how it went. */
interface RunNote {
  at: string
  /** "<layer>=<newest frame it named, HH:MM>" or "<layer>!<why it could not be read>"; "~" marks the tile service */
  lists: string[]
  fetched: number
  ready: string[]
  failed: string[]
}
const LOG_KEPT = 40

/** A layer lists its newest four frames (the app looks no further back: eumetsat.ts maxSteps). */
export const LISTED_FRAMES = 4
/** A frame is kept while it can be listed, plus the time a list stays in a browser. */
const frameTtlMs = (l: CacheLayer) => (LISTED_FRAMES * l.stepMin + 25) * 60_000
const EXP_MARGIN_MS = 2 * 60_000
/** A frame is listed this long after it is whole (see the header). */
export const LIST_DELAY_MS = 120_000
/** A listed frame can still be cut for at least this long: longer than a browser keeps a list. */
const LIST_MIN_LEFT_MS = 10 * 60_000
/** EUMETView publishes a frame at least this long after its time (21–29 minutes measured): no list read before. */
const PUBLISH_LAG_MS = 20 * 60_000
/** Then a read a minute (55 s: the next run must find it due), and one every two minutes once it is this late. */
const POLL_AGAIN_MS = 55_000
const POLL_PATIENT_AFTER = 6
const POLL_PATIENT_MS = 115_000
/** After a read with nothing new, every second read asks the tile service (see the header). */
const SECOND_OPINION_AFTER = 1
const LEASE_MS = 150_000
/** No new piece is started this long into a run. */
const BUDGET_MS = 100_000
const LIST_TIMEOUT_MS = 10_000
/** EUMETView sends a 1 MB piece at 50–165 kB/s (measured 2026-11-17). */
const PIECE_TIMEOUT_MS = 45_000
const MAX_TRIES = 6
/** A daylight product is masked under about 3° of sun (eumetsat.ts); a piece with less than this everywhere is skipped. */
const DARK_BELOW_DEG = 1
/** A tile no brighter than this anywhere is "no data" with JPEG noise on it. */
const BLACK_MAX = 12
const ALL_PIECES = (1 << PIECE_COUNT) - 1
const RAD = Math.PI / 180
/** Cosine of the angle from the point under the satellite within which a place has it 5° up: what the app lists. */
const ON_DISC_COS = Math.cos(80 * RAD)

export interface FillDeps {
  store: GeoStore
  fetch: (url: string, init: { headers: Record<string, string>; signal?: AbortSignal }) => Promise<Response>
  /** A JPEG to its pixels: RGB or RGBA, row 0 first */
  decode: (jpeg: ArrayBuffer) => Promise<{ data: Uint8Array | Uint8ClampedArray; width: number; height: number }>
  now?: () => number
  sleep?: (ms: number) => Promise<void>
  /** EUMETView's GeoServer; another address only in local runs (wrangler dev, with the pieces served from disk) */
  geoserver?: string
}

export interface FillReport {
  /** Why nothing was done: another run is at work, or nothing is due */
  skipped?: 'lease' | 'idle'
  polled: string[]
  /** Pieces fetched from EUMETSAT */
  fetched: number
  /** Frames made whole by this run: "<layer>@<time>" */
  ready: string[]
  failed: string[]
}

function parseState(text: string | null): FillState {
  try {
    const s = JSON.parse(text ?? '') as FillState
    if (s && s.v === 1 && s.layers && typeof s.layers === 'object') return s
  } catch {
    /* a fresh store, or a state from another version: start over */
  }
  return { v: 1, lease: 0, layers: {}, pub: '' }
}

export function parseFrames(text: string | null): FramesDoc {
  try {
    const d = JSON.parse(text ?? '') as FramesDoc
    if (d && d.v === 1 && d.layers && typeof d.layers === 'object') return d
  } catch {
    /* nothing stored yet */
  }
  return { v: 1, layers: {} }
}

/** The newest instant a layer's capabilities document lists ("start/end/PT10M", or instants and intervals by commas). */
export function newestListed(xml: string): number {
  const domain = /<Dimension\b[^>]*\bname="time"[^>]*>([^<]+)<\/Dimension>/.exec(xml)?.[1]
  let newest = NaN
  for (const part of (domain ?? '').split(',')) {
    const bits = part.trim().split('/')
    const t = Date.parse(bits.length >= 2 ? bits[1] : bits[0])
    if (Number.isFinite(t) && !(t <= newest)) newest = t
  }
  return newest
}

/** The newest instant the tile service's DescribeDomains names ("<Domain>start--end</Domain>"). */
export function newestInDomain(xml: string): number {
  return Date.parse(/<Domain>[^<]*--([^<]+)<\/Domain>/.exec(xml)?.[1] ?? '')
}

/** The tile service's time domain for a layer: the list's second opinion (see the header). */
export function domainUrl(geoserver: string, layer: string): string {
  return `${geoserver}/gwc/service/wmts?service=WMTS&version=1.0.0&request=DescribeDomains&layer=${encodeURIComponent(layer)}&tileMatrixSet=${encodeURIComponent('EPSG:4326')}&domains=time`
}

/** One layer's own capabilities document (GeoServer's per-layer virtual service): 1.6 kB gzipped, kept 2 minutes there. */
export function capabilitiesUrl(geoserver: string, layer: string): string {
  const [workspace, name] = layer.split(':')
  return `${geoserver}/${encodeURIComponent(workspace)}/${encodeURIComponent(name ?? '')}/ows?service=WMS&version=1.3.0&request=GetCapabilities`
}

/**
 * True for a piece of a daylight product with the sun down, at the frame's time, everywhere on it the satellite
 * sees. The corners of a piece are off the disc (and at the top and bottom of the grid the sun never sets in
 * summer), so only points on the disc count. Near the poles in summer a piece is therefore never dark: it is fetched.
 */
export function pieceIsDark(l: CacheLayer, piece: number, t: number): boolean {
  const r = pieceRect(l, piece)
  const N = 8
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const lat = r.south + ((r.north - r.south) * i) / N
      const lon = r.west + ((r.east - r.west) * j) / N
      if (Math.cos(lat * RAD) * Math.cos((lon - l.subLon) * RAD) < ON_DISC_COS) continue
      if (sunElevation(lat, lon, t) >= DARK_BELOW_DEG) return false
    }
  }
  return true
}

/** The frames a layer lists to the app, newest first: whole for two minutes, and with time left. */
export function listedFrames(doc: FramesDoc, layer: string, now: number): number[] {
  return (doc.layers[layer] ?? [])
    .filter((f) => f.readyAt + LIST_DELAY_MS <= now && f.exp - now >= LIST_MIN_LEFT_MS)
    .slice(0, LISTED_FRAMES)
    .map((f) => f.t)
}

/** A stored frame that can still be cut, or undefined. */
export function findFrame(doc: FramesDoc, layer: string, t: number, now: number): StoredFrame | undefined {
  return (doc.layers[layer] ?? []).find((f) => f.t === t && f.exp > now)
}

async function fetchPiece(deps: FillDeps, l: CacheLayer, piece: number, t: number): Promise<ArrayBuffer> {
  const res = await deps.fetch(pieceUrl(deps.geoserver ?? GEOSERVER, l, piece, t), { headers: { 'user-agent': USER_AGENT, accept: 'image/jpeg' }, signal: AbortSignal.timeout(PIECE_TIMEOUT_MS) })
  // WMS can say an error with a 200 and XML; /wms answers a time it does not have with a 502.
  if (!res.ok || !(res.headers.get('content-type') ?? '').startsWith('image/jpeg')) throw new Error(`piece ${piece}: ${res.status} ${res.headers.get('content-type') ?? ''}`)
  return res.arrayBuffer()
}

/** One decoded piece into the store, as the tiles that hold anything. */
async function storePiece(deps: FillDeps, l: CacheLayer, f: PendingFrame, piece: number, img: { data: Uint8Array | Uint8ClampedArray; width: number; height: number }): Promise<void> {
  if (img.width !== PIECE_PX || img.height !== PIECE_PX) throw new Error(`piece ${piece}: ${img.width}×${img.height}`)
  const ch = img.data.length / (PIECE_PX * PIECE_PX)
  if (ch !== 3 && ch !== 4) throw new Error(`piece ${piece}: ${ch} channels`)
  const r = pieceRect(l, piece)
  const ttl = Math.ceil(frameTtlMs(l) / 1000)
  const puts: Promise<void>[] = []
  const kept: [number, number][] = []
  for (let ty = 0; ty < PIECE_PX / TILE_PX; ty++) {
    for (let tx = 0; tx < PIECE_PX / TILE_PX; tx++) {
      const tile = new Uint8Array(TILE_BYTES)
      let max = 0
      for (let y = 0; y < TILE_PX; y++) {
        let s = ((ty * TILE_PX + y) * PIECE_PX + tx * TILE_PX) * ch
        let d = y * TILE_PX * 3
        for (let x = 0; x < TILE_PX; x++, s += ch, d += 3) {
          const a = (tile[d] = img.data[s])
          const b = (tile[d + 1] = img.data[s + 1])
          const c = (tile[d + 2] = img.data[s + 2])
          if (a > max) max = a
          if (b > max) max = b
          if (c > max) max = c
        }
      }
      if (max <= BLACK_MAX) continue
      const row = r.row / TILE_PX + ty
      const col = r.col / TILE_PX + tx
      kept.push([row, col])
      puts.push(deps.store.put(tileKey(l.layer, f.t, row, col), tile, ttl))
    }
  }
  await Promise.all(puts)
  for (const [row, col] of kept) f.tiles = withTile(f.tiles, row, col)
}

/** The pieces a pending frame still lacks, two downloads at a time, until one fails or the run's time is up. */
async function fillFrame(deps: FillDeps, l: CacheLayer, f: PendingFrame, report: FillReport, deadline: number, now: () => number): Promise<void> {
  const todo = Array.from({ length: PIECE_COUNT }, (_, p) => p).filter((p) => !(f.got & (1 << p)))
  for (let i = 0; i < todo.length; i += 2) {
    if (now() > deadline) return
    const batch = todo.slice(i, i + 2)
    const got = await Promise.all(
      batch.map((p) => (l.daylight && pieceIsDark(l, p, f.t) ? Promise.resolve('dark' as const) : fetchPiece(deps, l, p, f.t).catch((err: unknown) => (err instanceof Error ? err : new Error(String(err)))))),
    )
    let failed = false
    for (const [k, p] of batch.entries()) {
      const body = got[k]
      try {
        if (body instanceof Error) throw body
        if (body !== 'dark') {
          report.fetched++
          // One at a time: a decoded piece is 17 MB.
          await storePiece(deps, l, f, p, await deps.decode(body))
        }
        f.got |= 1 << p
      } catch (err) {
        failed = true
        report.failed.push(`${l.layer} ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    if (failed) {
      f.tries++
      return
    }
  }
}

/** One run of the fill. Never throws for what EUMETSAT does; a store that fails ends the run (the next one retries). */
export async function runFill(deps: FillDeps): Promise<FillReport> {
  const now = deps.now ?? Date.now
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const t0 = now()
  const report: FillReport = { polled: [], fetched: 0, ready: [], failed: [] }
  const state = parseState(await deps.store.getText(FILL_KEY))
  if (state.lease > t0) return { ...report, skipped: 'lease' }
  const layers = Object.values(CACHE_LAYERS)
  for (const l of layers) state.layers[l.layer] ??= { pollAt: 0, newest: 0, ready: [] }
  const of = (l: CacheLayer) => state.layers[l.layer]
  if (!layers.some((l) => of(l).pollAt <= t0 || of(l).pending)) return { ...report, skipped: 'idle' }

  // ── is there a new frame? ──
  const lists: string[] = []
  const hm = (t: number) => new Date(t).toISOString().slice(11, 16)
  await Promise.all(
    layers.map(async (l) => {
      const st = of(l)
      if (st.pollAt > t0) return
      report.polled.push(l.layer)
      const misses = st.misses ?? 0
      st.misses = misses + 1
      st.pollAt = t0 + (misses + 1 >= POLL_PATIENT_AFTER ? POLL_PATIENT_MS : POLL_AGAIN_MS)
      const second = misses >= SECOND_OPINION_AFTER && (misses - SECOND_OPINION_AFTER) % 2 === 0
      const base = deps.geoserver ?? GEOSERVER
      try {
        const res = await deps.fetch(second ? domainUrl(base, l.layer) : capabilitiesUrl(base, l.layer), { headers: { 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(LIST_TIMEOUT_MS) })
        const xml = res.ok ? await res.text() : ''
        const newest = second ? newestInDomain(xml) : newestListed(xml)
        if (!Number.isFinite(newest)) throw new Error(`list ${res.status}`)
        lists.push(`${l.layer}${second ? '~' : '='}${hm(newest)}`)
        if (newest > st.newest && newest <= t0 + 60_000) {
          st.newest = newest
          st.misses = 0
          // An unfinished older frame gives way: the newest is the one people are shown.
          st.pending = { t: newest, got: 0, tiles: NO_TILES, tries: 0, exp: t0 + frameTtlMs(l) - EXP_MARGIN_MS }
          // The next frame is a step later and is published no sooner than the lag after that.
          st.pollAt = Math.max(t0 + POLL_AGAIN_MS, newest + l.stepMin * 60_000 + PUBLISH_LAG_MS)
        }
      } catch (err) {
        const why = err instanceof Error ? err.message : String(err)
        lists.push(`${l.layer}!${why}`)
        report.failed.push(`${l.layer} ${why}`)
      }
    }),
  )

  // ── fetch what is missing of it ──
  let leasedAt = 0
  const work = layers.filter((l) => of(l).pending)
  if (work.length) {
    state.lease = t0 + LEASE_MS
    await deps.store.put(FILL_KEY, JSON.stringify(state))
    leasedAt = now()
    for (const l of work) {
      const st = of(l)
      const f = st.pending!
      await fillFrame(deps, l, f, report, t0 + BUDGET_MS, now)
      if (f.got === ALL_PIECES) {
        st.ready.unshift({ t: f.t, tiles: f.tiles, readyAt: now(), exp: f.exp })
        st.pending = undefined
        report.ready.push(`${l.layer}@${new Date(f.t).toISOString()}`)
      } else if (f.tries >= MAX_TRIES) {
        st.pending = undefined
        report.failed.push(`${l.layer} gave up on ${new Date(f.t).toISOString()}`)
      }
    }
  }

  // ── forget what has expired, and say what there is ──
  const end = now()
  for (const l of layers) of(l).ready = of(l).ready.filter((f) => f.exp > end).slice(0, 2 * LISTED_FRAMES)
  state.lease = 0
  state.log = [...(state.log ?? []), { at: new Date(t0).toISOString(), lists: lists.sort(), fetched: report.fetched, ready: report.ready, failed: report.failed.map((f) => f.slice(0, 120)) }].slice(-LOG_KEPT)
  const doc: FramesDoc = { v: 1, layers: Object.fromEntries(layers.map((l) => [l.layer, of(l).ready])) }
  const pub = JSON.stringify(doc)
  if (pub !== state.pub) {
    await deps.store.put(FRAMES_KEY, pub)
    state.pub = pub
  }
  // The store takes one write a second to a key: the note above was the first.
  if (leasedAt && now() - leasedAt < 1100) await sleep(1100 - (now() - leasedAt))
  await deps.store.put(FILL_KEY, JSON.stringify(state))
  return report
}
