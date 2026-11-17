/**
 * Reading the Meteosat frame cache for a visitor: what api/geo.ts and api/geo-frames.ts share.
 *
 * The store is Workers KV, where every read is counted. Two free layers stand in front of it, so a busy hour costs
 * little more than a quiet one:
 *  - the list of stored frames is kept for 10 seconds by the running Worker and for a minute in Cloudflare's cache
 *    (per data centre); it is read afresh, at most every 10 seconds, only when someone asks for a frame it does not
 *    name (a frame is listed two minutes after it is stored, so that is rare: geoFill.ts);
 *  - a tile never changes, so it is kept in Cloudflare's cache for an hour after its first read there.
 * Neither cache is needed for a right answer: without them (tests, a cache that fails) the store is read each time.
 */
import { FRAMES_KEY, parseFrames, type FramesDoc, type GeoStore } from './geoFill.js'

/** The parts of Cloudflare's Cache API used here (worker/router.ts EdgeCache). */
export interface ServeCache {
  match(key: Request): Promise<Response | undefined>
  put(key: Request, response: Response): Promise<void>
}

export interface GeoServe {
  store: GeoStore
  cache?: ServeCache
  /** The Worker's `ctx.waitUntil`: stores into the cache after answering */
  waitUntil?: (work: Promise<unknown>) => void
  /** RGBA to a JPEG */
  encode: (rgba: Uint8ClampedArray, width: number, height: number) => Promise<ArrayBuffer>
  now?: () => number
}

const MEMO_MS = 10_000
const memo = new WeakMap<GeoStore, { at: number; freshAt: number; doc: FramesDoc }>()

/** A cache key nobody can ask for from outside: the cache is only ever read by name, here. */
const cacheKey = (origin: string, name: string) => new Request(`${origin}/api/geo/kept/${encodeURIComponent(name)}`)

function later(deps: GeoServe, work: Promise<unknown>): void {
  const quiet = work.catch((err: unknown) => console.error('[geo] cache put failed', err))
  deps.waitUntil?.(quiet)
}

/**
 * The stored frames. `fresh` reads past the caches (asked for when a frame is not in the list held), but the store
 * itself at most every 10 seconds. Rejects when the store cannot be read.
 */
export async function loadFrames(deps: GeoServe, origin: string, fresh = false): Promise<FramesDoc> {
  const now = (deps.now ?? Date.now)()
  const held = memo.get(deps.store)
  if (held && now - (fresh ? held.freshAt : held.at) < MEMO_MS) return held.doc
  const key = cacheKey(origin, FRAMES_KEY)
  let text: string | null | undefined
  if (!fresh && deps.cache) text = await deps.cache.match(key).then((r) => r?.text(), () => undefined)
  const fromStore = text === undefined
  if (text === undefined) {
    text = await deps.store.getText(FRAMES_KEY)
    if (text !== null && deps.cache) later(deps, deps.cache.put(key, new Response(text, { headers: { 'cache-control': 'public, max-age=60' } })))
  }
  const doc = parseFrames(text ?? null)
  memo.set(deps.store, { at: now, freshAt: fromStore ? now : (held?.freshAt ?? -Infinity), doc })
  return doc
}

/** One stored tile's raw RGB, or null when the store does not have it. */
export async function loadTile(deps: GeoServe, origin: string, name: string): Promise<Uint8Array | null> {
  const key = cacheKey(origin, name)
  if (deps.cache) {
    const hit = await deps.cache.match(key).catch(() => undefined)
    if (hit) return new Uint8Array(await hit.arrayBuffer())
  }
  const bytes = await deps.store.getBytes(name)
  if (!bytes) return null
  if (deps.cache) later(deps, deps.cache.put(key, new Response(bytes.slice(0), { headers: { 'cache-control': 'public, max-age=3600', 'content-type': 'application/octet-stream' } })))
  return new Uint8Array(bytes)
}

export const plain = (status: number, cache: string) => new Response(null, { status, headers: { 'cache-control': cache } })
