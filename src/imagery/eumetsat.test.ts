import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./image', async (orig) => ({ ...(await orig<typeof import('./image')>()), preloadImage: vi.fn() }))

import { EmptyImageError, preloadImage } from './image'
import { eumetsatCropUrl, eumetsatFrameCandidates, eumetsatFrames, latestEumetsatFrame, parseFrameLists } from './eumetsat'

const PARIS = { lat: 48.8566, lon: 2.3522 }
const DELHI = { lat: 28.6139, lon: 77.209 }
const T = (iso: string) => Date.parse(iso)
const hm = (ts: number[]) => ts.map((t) => new Date(t).toISOString().slice(11, 16))
const FCI = 'mtg_fd:rgb_geocolour'

/** `/api/geo-frames` as the site answers it. */
const LISTS = {
  v: 1,
  layers: {
    [FCI]: ['05:10', '05:00', '04:50', '04:40'].map((t) => T(`2026-11-11T${t}:00Z`)),
    'msg_iodc:rgb_naturalenhncd': [],
    'msg_iodc:ir108': ['05:00', '04:45'].map((t) => T(`2026-11-11T${t}:00Z`)),
  },
}
const listing = (body: unknown = LISTS, status = 200) => vi.fn(async (_url: string) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }))

describe('Meteosat picture URLs', () => {
  it("cuts the small pictures from the site's own cache of the frame: nothing is asked of EUMETSAT", () => {
    const u = new URL(eumetsatCropUrl(FCI, T('2026-11-11T05:10:00Z'), PARIS, { halfSizeKm: 400, px: 176 }), 'https://www.watched.earth')
    expect(u.origin + u.pathname).toBe('https://www.watched.earth/api/geo')
    expect(Object.fromEntries(u.searchParams)).toEqual({ layer: FCI, time: '2026-11-11T05:10:00Z', lat: '48.86', lon: '2.35', px: '176' })
    // The list thumbnail too (112 px), for every Meteosat layer.
    expect(eumetsatCropUrl('msg_iodc:ir108', T('2026-11-11T05:15:00Z'), DELHI, { halfSizeKm: 400, px: 112 })).toBe('/api/geo?layer=msg_iodc%3Air108&time=2026-11-11T05%3A15%3A00Z&lat=28.61&lon=77.21&px=112')
    // Two pins a few hundred metres apart are the same picture: cut once, kept once.
    expect(eumetsatCropUrl(FCI, T('2026-11-11T05:10:00Z'), { lat: 48.8584, lon: 2.3541 }, { halfSizeKm: 400, px: 176 })).toBe(eumetsatCropUrl(FCI, T('2026-11-11T05:10:00Z'), PARIS, { halfSizeKm: 400, px: 176 }))
  })

  it("asks EUMETView for a larger picture: a square around the place at one frame, lat first, with black for no data", () => {
    const u = new URL(eumetsatCropUrl(FCI, T('2026-11-11T05:10:00Z'), PARIS, { halfSizeKm: 400, px: 1024 }))
    expect(u.origin + u.pathname).toBe('https://view.eumetsat.int/geoserver/wms')
    const q = u.searchParams
    expect(q.get('layers')).toBe(FCI)
    expect(q.get('time')).toBe('2026-11-11T05:10:00Z')
    expect(q.get('crs')).toBe('EPSG:4326')
    expect(q.get('format')).toBe('image/jpeg')
    expect(q.get('bgcolor')).toBe('0x000000')
    expect(q.get('width')).toBe('1024')
    expect(q.get('height')).toBe('1024')
    const [s, w, n, e] = q.get('bbox')!.split(',').map(Number)
    expect(s).toBeLessThan(PARIS.lat)
    expect(n).toBeGreaterThan(PARIS.lat)
    expect(w).toBeLessThan(PARIS.lon)
    expect(e).toBeGreaterThan(PARIS.lon)
    expect((n - s) * 111.2).toBeCloseTo(800, -1) // 800 km tall
    expect(e - w).toBeGreaterThan(n - s) // and as wide on the ground: more degrees of longitude at 49°N
    // The cache holds the app's 800 km square of the layers it lists, nothing else.
    expect(eumetsatCropUrl(FCI, T('2026-11-11T05:10:00Z'), PARIS, { halfSizeKm: 200, px: 176 })).toContain('https://view.eumetsat.int/geoserver/wms?')
    expect(eumetsatCropUrl('msg_fes:rgb_dust', T('2026-11-11T05:10:00Z'), PARIS, { halfSizeKm: 400, px: 176 })).toContain('https://view.eumetsat.int/geoserver/wms?')
  })

  it('is one URL per frame, place and size (the browser keeps it for a week)', () => {
    for (const px of [176, 1024]) {
      const a = eumetsatCropUrl('msg_iodc:ir108', T('2026-11-11T05:15:00Z'), DELHI, { halfSizeKm: 400, px })
      expect(eumetsatCropUrl('msg_iodc:ir108', T('2026-11-11T05:15:00.900Z'), DELHI, { halfSizeKm: 400, px })).toBe(a)
      expect(eumetsatCropUrl('msg_iodc:ir108', T('2026-11-11T05:30:00Z'), DELHI, { halfSizeKm: 400, px })).not.toBe(a)
    }
  })
})

describe('Meteosat frame lists', () => {
  afterEach(() => vi.unstubAllGlobals())

  it("reads the site's list as frames per layer, newest first, whatever else it is sent", () => {
    expect(hm(parseFrameLists(LISTS)[FCI])).toEqual(['05:10', '05:00', '04:50', '04:40'])
    expect(hm(parseFrameLists({ layers: { x: [T('2026-11-11T04:40:00Z'), 'soon', T('2026-11-11T05:10:00Z'), NaN] } }).x)).toEqual(['05:10', '04:40'])
    expect(parseFrameLists('<!doctype html>')).toEqual({}) // a dev server answering with the app's page
    expect(parseFrameLists(null)).toEqual({})
  })

  it('asks the site once for every layer, and shares the answer', async () => {
    const now = T('2026-11-11T05:37:00Z')
    const f = listing()
    vi.stubGlobal('fetch', f)
    const [a, b, ir] = await Promise.all([eumetsatFrames({ layer: FCI }, { now }), eumetsatFrames({ layer: FCI }, { now: now + 60_000 }), eumetsatFrames({ layer: 'msg_iodc:ir108' }, { now })])
    expect(hm(a.slice(0, 2))).toEqual(['05:10', '05:00'])
    expect(b).toEqual(a)
    expect(hm(ir)).toEqual(['05:00', '04:45'])
    expect(f.mock.calls.map((c) => c[0])).toEqual(['/api/geo-frames'])
    // … and again once the list is five minutes old.
    await eumetsatFrames({ layer: FCI }, { now: now + 5 * 60_000 })
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('rejects for a layer with no frame listed, without asking anyone else', async () => {
    const f = listing()
    vi.stubGlobal('fetch', f)
    await expect(eumetsatFrames({ layer: 'msg_iodc:rgb_naturalenhncd' }, { now: T('2026-11-11T06:37:00Z') })).rejects.toThrow('No frames are listed')
    expect(f.mock.calls.every((c) => c[0] === '/api/geo-frames')).toBe(true)
  })

  it('rejects when the list cannot be read, and asks again next time', async () => {
    const f = listing({}, 503)
    vi.stubGlobal('fetch', f)
    const now = T('2026-11-11T07:37:00Z')
    await expect(eumetsatFrames({ layer: FCI }, { now })).rejects.toThrow()
    const calls = f.mock.calls.length
    await expect(eumetsatFrames({ layer: FCI }, { now })).rejects.toThrow()
    expect(f.mock.calls.length).toBeGreaterThan(calls)
  })
})

describe('EUMETView frame candidates', () => {
  afterEach(() => vi.unstubAllGlobals())
  const listed = ['12:00', '11:45', '11:30', '11:15', '11:00', '10:45'].map((t) => T(`2026-11-10T${t}:00Z`))

  it('takes the newest few frames', () => {
    expect(hm(eumetsatFrameCandidates({ layer: 'msg_iodc:ir108', stepMin: 15 }, DELHI, listed))).toEqual(['12:00', '11:45', '11:30', '11:15'])
    expect(hm(eumetsatFrameCandidates({ layer: 'msg_iodc:ir108', stepMin: 15 }, DELHI, listed, 2))).toEqual(['12:00', '11:45'])
  })

  it('skips the frames a daylight product masks: sunset over Delhi, 2026-11-10 (measured: whole at 11:30Z, 16 % masked at 11:45Z)', () => {
    expect(hm(eumetsatFrameCandidates({ layer: 'msg_iodc:rgb_naturalenhncd', stepMin: 15, minSunDeg: 6 }, DELHI, listed))).toEqual(['11:15'])
  })

  it('makes no request for a daylight product in the middle of the night', async () => {
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    const midnight = T('2026-11-10T19:00:00Z') // 00:30 in Delhi
    await expect(latestEumetsatFrame({ layer: 'msg_iodc:rgb_naturalenhncd', stepMin: 15, minSunDeg: 6 }, DELHI, { halfSizeKm: 400, px: 176 }, { now: midnight })).resolves.toBeNull()
    expect(f).not.toHaveBeenCalled()
  })

  it("shows nothing when the site's list cannot be read, and never turns to EUMETView instead", async () => {
    const f = vi.fn(async (_url: string) => new Response('', { status: 503 }))
    vi.stubGlobal('fetch', f)
    await expect(latestEumetsatFrame({ layer: FCI, stepMin: 10 }, PARIS, { halfSizeKm: 400, px: 176 }, { now: T('2026-11-11T08:37:00Z') })).resolves.toBeNull()
    expect(f.mock.calls.length).toBeGreaterThan(0)
    expect(f.mock.calls.every((c) => c[0] === '/api/geo-frames')).toBe(true)
    expect(vi.mocked(preloadImage)).not.toHaveBeenCalled()
  })

  describe('which frames are asked for', () => {
    const load = vi.mocked(preloadImage)
    const now = T('2026-11-11T09:37:00Z')
    const layer = { layer: FCI, stepMin: 10 }
    const asked = () => load.mock.calls.map((c) => new URL(c[0], 'https://www.watched.earth').searchParams.get('time')!.slice(11, 16))
    afterEach(() => load.mockReset())

    it('goes one frame back from an empty frame', async () => {
      vi.stubGlobal('fetch', listing())
      load.mockRejectedValueOnce(new EmptyImageError('u')).mockResolvedValueOnce({} as HTMLImageElement)
      const found = await latestEumetsatFrame(layer, PARIS, { halfSizeKm: 400, px: 176 }, { now })
      expect(asked()).toEqual(['05:10', '05:00'])
      expect(found?.time).toBe(T('2026-11-11T05:00:00Z'))
    })

    it('stops at a frame that fails to load: a busy service is not asked for three more', async () => {
      vi.stubGlobal('fetch', listing())
      load.mockRejectedValue(new Error('Image failed to load'))
      await expect(latestEumetsatFrame(layer, PARIS, { halfSizeKm: 400, px: 1024 }, { now: now + 1 })).resolves.toBeNull()
      expect(asked()).toEqual(['05:10'])
    })
  })
})
