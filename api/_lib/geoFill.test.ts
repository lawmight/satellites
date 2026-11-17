import { beforeEach, describe, expect, it } from 'vitest'
import { FRAMES_KEY, LIST_DELAY_MS, USER_AGENT, findFrame, listedFrames, newestInDomain, newestListed, parseFrames, pieceIsDark, runFill, type FillDeps, type GeoStore } from './geoFill.js'
import { CACHE_LAYERS, PIECE_PX, TILE_BYTES, hasTile } from './geoGrid.js'

const MIN = 60_000
const T = (iso: string) => Date.parse(iso)
const FCI = 'mtg_fd:rgb_geocolour'
const NAT = 'msg_iodc:rgb_naturalenhncd'
const IR = 'msg_iodc:ir108'

/** The store as a Map, counting what is written. */
function memoryStore() {
  const map = new Map<string, string | Uint8Array>()
  const puts: string[] = []
  const store: GeoStore = {
    getText: async (k) => (map.get(k) as string | undefined) ?? null,
    getBytes: async (k) => {
      const v = map.get(k)
      return v instanceof Uint8Array ? (v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength) as ArrayBuffer) : null
    },
    put: async (k, v) => {
      puts.push(k)
      map.set(k, v)
    },
  }
  return { store, map, puts }
}

const caps = (newest: string) => `<Layer><Dimension name="time" default="${newest}" units="ISO8601" nearestValue="1">2024-09-23T00:00:00.000Z/${newest.replace('Z', '.000Z')}/PT10M</Dimension></Layer>`

/** A piece's pixels, one grey level all over (kept per level: they are 12 MB each). */
const flat = new Map<number, Uint8Array>()
const pixels = (v: number) => flat.get(v) ?? (flat.set(v, new Uint8Array(PIECE_PX * PIECE_PX * 3).fill(v)), flat.get(v)!)

/** EUMETView as the fill sees it: each layer's newest frame, and pieces whose one byte says how bright they are. */
function world(newest: Record<string, string>, opts: { fail?: (url: URL) => boolean; level?: (url: URL) => number; staleList?: Record<string, string> } = {}) {
  const calls: URL[] = []
  let now = 0
  const s = memoryStore()
  const deps: FillDeps = {
    store: s.store,
    now: () => now,
    sleep: async (ms) => void (now += ms),
    fetch: async (url, init) => {
      const u = new URL(url)
      calls.push(u)
      expect(init.headers['user-agent']).toBe(USER_AGENT)
      now += 2000 // every answer takes two seconds
      if (opts.fail?.(u)) return new Response('busy', { status: 503 })
      if (u.searchParams.get('request') === 'GetCapabilities') {
        const layer = u.pathname.split('/').slice(2, 4).join(':')
        // The capabilities document comes from EUMETView's cache, which can lag behind (`staleList`).
        return new Response(caps(opts.staleList?.[layer] ?? newest[layer]), { status: 200, headers: { 'content-type': 'text/xml' } })
      }
      if (u.searchParams.get('request') === 'DescribeDomains') {
        return new Response(`<Domains><DimensionDomain><Domain>2024-09-23T00:00:00.000Z--${newest[u.searchParams.get('layer')!].replace('Z', '.000Z')}</Domain></DimensionDomain></Domains>`, { status: 200 })
      }
      return new Response(new Uint8Array([opts.level?.(u) ?? 120]), { status: 200, headers: { 'content-type': 'image/jpeg' } })
    },
    decode: async (jpeg) => ({ data: pixels(new Uint8Array(jpeg)[0]), width: PIECE_PX, height: PIECE_PX }),
  }
  const kind = (u: URL) =>
    u.searchParams.get('request') === 'GetCapabilities'
      ? `list ${u.pathname.split('/').slice(2, 4).join(':')}`
      : u.searchParams.get('request') === 'DescribeDomains'
        ? `tiles ${u.searchParams.get('layer')}`
        : `piece ${u.searchParams.get('layers')} ${u.searchParams.get('time')}`
  return { ...s, deps, calls, kinds: () => calls.map(kind), at: (t: number) => void (now = t), newest }
}

const NOON = T('2026-11-17T09:00:00Z') // day over the whole of Meteosat-9's disc but its far east
const frames = (w: ReturnType<typeof world>) => parseFrames(w.map.get(FRAMES_KEY) as string)

describe('the newest frame a layer lists', () => {
  it('is the end of its time dimension, however that is written', () => {
    expect(newestListed(caps('2026-11-17T15:40:00Z'))).toBe(T('2026-11-17T15:40:00Z'))
    expect(newestListed('<Dimension name="time" default="x">2026-11-17T15:15:00.000Z,2026-11-17T15:30:00.000Z,2026-11-17T15:45:00.000Z</Dimension>')).toBe(T('2026-11-17T15:45:00Z'))
    expect(newestListed('<Dimension name="time">2020-01-01T00:00:00Z/2026-11-16T00:00:00Z/PT15M,2026-11-17T00:00:00Z/2026-11-17T15:45:00Z/PT15M</Dimension>')).toBe(T('2026-11-17T15:45:00Z'))
    expect(newestListed('<ServiceExceptionReport/>')).toBeNaN()
  })

  it("is the end of the tile service's time domain, the list's second opinion", () => {
    // Verbatim from …/gwc/service/wmts?…request=DescribeDomains&layer=msg_iodc:ir108…, 2026-11-11 05:57Z (trimmed).
    const xml = '<Domains><DimensionDomain><ows:Identifier>time</ows:Identifier><Domain>2020-08-01T00:00:00.000Z--2026-11-11T05:30:00.000Z</Domain><Size>2</Size></DimensionDomain></Domains>'
    expect(newestInDomain(xml)).toBe(T('2026-11-11T05:30:00Z'))
    expect(newestInDomain('<ServiceExceptionReport/>')).toBeNaN()
  })
})

describe('filling the frame cache', () => {
  let w: ReturnType<typeof world>
  beforeEach(() => {
    w = world({ [FCI]: '2026-11-17T08:40:00Z', [NAT]: '2026-11-17T08:30:00Z', [IR]: '2026-11-17T08:30:00Z' })
    w.at(NOON)
  })

  it('fetches a new frame once, as four pieces a layer, and lists it two minutes after it is whole', async () => {
    const report = await runFill(w.deps)
    expect(report.polled.sort()).toEqual([IR, NAT, FCI].sort())
    expect(report.fetched).toBe(12)
    expect(report.failed).toEqual([])
    expect(report.ready.sort()).toEqual([`${FCI}@2026-11-17T08:40:00.000Z`, `${IR}@2026-11-17T08:30:00.000Z`, `${NAT}@2026-11-17T08:30:00.000Z`].sort())
    expect(w.kinds().filter((k) => k.startsWith('list')).length).toBe(3)
    expect(w.kinds().filter((k) => k === `piece ${FCI} 2026-11-17T08:40:00Z`).length).toBe(4)
    // Every piece is a different quarter.
    expect(new Set(w.calls.filter((u) => u.searchParams.get('layers') === FCI).map((u) => u.searchParams.get('bbox'))).size).toBe(4)

    const doc = frames(w)
    const f = doc.layers[FCI][0]
    expect(f.t).toBe(T('2026-11-17T08:40:00Z'))
    expect(f.tiles).toBe('ffffffffffffffff')
    expect(w.map.get(`t/${FCI}/2026-11-17T08:40:00Z/3_4`)).toHaveLength(TILE_BYTES)
    expect((w.map.get(`t/${FCI}/2026-11-17T08:40:00Z/3_4`) as Uint8Array)[1000]).toBe(120)
    expect(w.puts.filter((k) => k.startsWith(`t/${FCI}/`)).length).toBe(64)

    // It can be cut at once, wherever its tiles have arrived, but is listed only once they have arrived everywhere.
    expect(findFrame(doc, FCI, f.t, f.readyAt)).toBeDefined()
    expect(listedFrames(doc, FCI, f.readyAt + LIST_DELAY_MS - 1)).toEqual([])
    expect(listedFrames(doc, FCI, f.readyAt + LIST_DELAY_MS)).toEqual([f.t])
    // … and stops being listed while there is still time to cut it, then stops being cut.
    expect(listedFrames(doc, FCI, f.exp - 9 * MIN)).toEqual([])
    expect(findFrame(doc, FCI, f.t, f.exp - 9 * MIN)).toBeDefined()
    expect(findFrame(doc, FCI, f.t, f.exp)).toBeUndefined()
  })

  it('asks EUMETSAT nothing, and writes nothing, in a minute with nothing due', async () => {
    await runFill(w.deps)
    const calls = w.calls.length
    const puts = w.puts.length
    for (let m = 1; m <= 4; m++) {
      w.at(NOON + m * MIN + 30_000)
      expect((await runFill(w.deps)).skipped).toBe('idle')
    }
    expect(w.calls.length).toBe(calls)
    expect(w.puts.length).toBe(puts)
  })

  it("reads a list from 20 minutes after the next frame's own time, each minute, until the frame shows", async () => {
    await runFill(w.deps)
    w.calls.length = 0
    const polled = async (min: number) => (w.at(NOON + min * MIN), (await runFill(w.deps)).polled.filter((l) => l === FCI))
    // Meteosat-12's last frame was 08:40: the next is 08:50, published no sooner than 09:10.
    expect(await polled(9)).toEqual([])
    expect(await polled(10)).toEqual([FCI])
    expect(await polled(11)).toEqual([FCI])
    w.newest[FCI] = '2026-11-17T08:50:00Z'
    w.at(NOON + 12 * MIN)
    const report = await runFill(w.deps)
    expect(report.ready).toEqual([`${FCI}@2026-11-17T08:50:00.000Z`])
    expect(frames(w).layers[FCI].map((f) => f.t)).toEqual([T('2026-11-17T08:50:00Z'), T('2026-11-17T08:40:00Z')])
    // About one request a minute for the layer: 3 looks at the list and 4 pieces for a frame every 10 minutes.
    expect(w.calls.filter((u) => u.href.includes('mtg_fd')).length).toBe(7)
    // … and the frame after that is not looked for before 09:20, however late this one was found.
    expect(await polled(19)).toEqual([])
    expect(await polled(20)).toEqual([FCI])
  })

  it("asks the tile service when EUMETView's cached list stays the same, and finds the frame it was hiding", async () => {
    await runFill(w.deps)
    // The capabilities document is stuck on 08:40 (a stale cache); the frame of 08:50 is out.
    w = world({ ...w.newest, [FCI]: '2026-11-17T08:50:00Z' }, { staleList: { [FCI]: '2026-11-17T08:40:00Z' } })
    w.at(NOON)
    await runFill(w.deps) // a fresh store: finds 08:40 in the stale list, as before
    w.calls.length = 0
    const found: string[] = []
    for (let m = 10; m <= 13 && !found.length; m++) {
      w.at(NOON + m * MIN)
      found.push(...(await runFill(w.deps)).ready)
    }
    // One read of the list, then the tile service, which names 08:50.
    expect(w.kinds().filter((k) => k.includes(FCI) && !k.startsWith('piece'))).toEqual([`list ${FCI}`, `tiles ${FCI}`])
    expect(found).toEqual([`${FCI}@2026-11-17T08:50:00.000Z`])
  })

  it('slows to a read every two minutes when a frame is very late, and notes what every read saw', async () => {
    await runFill(w.deps)
    w.calls.length = 0
    for (let m = 10; m <= 24; m++) {
      w.at(NOON + m * MIN)
      await runFill(w.deps)
    }
    // 09:10 to 09:24 with no new frame: six reads a minute apart (09:10–09:15), then one every two minutes (09:17–09:23).
    expect(w.calls.filter((u) => u.href.includes('mtg_fd')).length).toBe(10)
    const log = (JSON.parse(w.map.get('fill') as string) as { log: { at: string; lists: string[] }[] }).log
    expect(log[0].lists).toEqual([`${IR}=08:30`, `${NAT}=08:30`, `${FCI}=08:40`])
    expect(log.find((n) => n.at === '2026-11-17T09:13:00.000Z')?.lists).toContain(`${FCI}~08:40`) // the tile service's answer
    expect(log.length).toBeLessThanOrEqual(40)
  })

  it('asks again a minute later for a piece that failed, and only for that piece', async () => {
    let busy = true
    w = world(w.newest, { fail: (u) => busy && u.searchParams.get('layers') === IR && u.searchParams.get('bbox')!.startsWith('0.000000,45.5') })
    w.at(NOON)
    const first = await runFill(w.deps)
    expect(first.failed.length).toBe(1)
    expect(first.ready).not.toContain(`${IR}@2026-11-17T08:30:00.000Z`)
    expect(frames(w).layers[IR]).toEqual([])
    const before = w.calls.length
    busy = false
    w.at(NOON + MIN)
    const second = await runFill(w.deps)
    expect(second.ready).toEqual([`${IR}@2026-11-17T08:30:00.000Z`])
    // The piece that failed and the two that were not started after it; never the one already stored.
    expect(w.calls.length - before).toBeLessThanOrEqual(3)
    expect(frames(w).layers[IR][0].tiles).toBe('ffffffffffffffff')
  })

  it('gives a frame up after six failed minutes and waits for the next one', async () => {
    w = world(w.newest, { fail: (u) => u.searchParams.get('layers') === FCI })
    for (let m = 0; m < 6; m++) {
      w.at(NOON + m * MIN)
      await runFill(w.deps)
    }
    const pieces = () => w.calls.filter((u) => u.searchParams.get('layers') === FCI).length
    expect(pieces()).toBe(12) // two a minute, six times
    w.at(NOON + 6 * MIN)
    await runFill(w.deps)
    expect(pieces()).toBe(12)
    expect(frames(w).layers[FCI]).toEqual([])
  })

  it('leaves at once while another run is still fetching', async () => {
    let inner: Awaited<ReturnType<typeof runFill>> | undefined
    const fetch = w.deps.fetch
    let nested = false
    w.deps.fetch = async (url, init) => {
      if (!nested && url.includes('GetMap')) {
        nested = true
        inner = await runFill(w.deps) // the next minute's run, started while this one downloads
      }
      return fetch(url, init)
    }
    const outer = await runFill(w.deps)
    expect(inner?.skipped).toBe('lease')
    expect(outer.fetched).toBe(12)
  })

  it('does not fetch a daylight product where it is night, or store a tile with nothing in it', async () => {
    // Midnight under Meteosat-9 at the March equinox: its whole disc is dark. In November the sun does not set on the
    // disc's southern edge (76°S), so the two southern pieces are still fetched there.
    const night = T('2026-03-20T21:00:00Z')
    expect([0, 1, 2, 3].map((p) => pieceIsDark(CACHE_LAYERS[NAT], p, night))).toEqual([true, true, true, true])
    expect([0, 1, 2, 3].map((p) => pieceIsDark(CACHE_LAYERS[NAT], p, T('2026-11-17T21:00:00Z')))).toEqual([true, true, false, false])
    expect([0, 1, 2, 3].some((p) => pieceIsDark(CACHE_LAYERS[NAT], p, NOON))).toBe(false)
    w = world({ [FCI]: '2026-03-20T20:40:00Z', [NAT]: '2026-03-20T20:30:00Z', [IR]: '2026-03-20T20:30:00Z' }, { level: (u) => (u.searchParams.get('layers') === IR ? 5 : 90) })
    w.at(night)
    const report = await runFill(w.deps)
    expect(report.fetched).toBe(8) // the natural-colour layer's four pieces are not asked for
    expect(w.kinds().some((k) => k.startsWith(`piece ${NAT}`))).toBe(false)
    const doc = frames(w)
    // Listed all the same (its time exists; the app skips it by the sun), with no tiles.
    expect(doc.layers[NAT][0].tiles).toBe('0000000000000000')
    // An infrared frame this dark all over is "no data": nothing stored for it.
    expect(doc.layers[IR][0].tiles).toBe('0000000000000000')
    expect(w.puts.some((k) => k.startsWith(`t/${IR}/`))).toBe(false)
    expect(hasTile(doc.layers[FCI][0].tiles, 0, 0)).toBe(true)
  })

  it('forgets a frame a little before its tiles expire', async () => {
    await runFill(w.deps)
    const f = frames(w).layers[FCI][0]
    // 4 frames of 10 minutes and 25 more, less the margin.
    expect(f.exp - NOON).toBe(63 * MIN)
    w.newest[FCI] = '2026-11-17T09:50:00Z'
    w.at(NOON + 70 * MIN)
    await runFill(w.deps)
    expect(frames(w).layers[FCI].map((x) => x.t)).toEqual([T('2026-11-17T09:50:00Z')])
  })
})
