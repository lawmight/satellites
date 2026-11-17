import { afterEach, describe, expect, it, vi } from 'vitest'
import { EUMETSAT_WMS, gibsWmsUrl } from './endpoints'
import { ImageTimeoutError, preloadImage } from './image'

describe('loading a weather picture', () => {
  afterEach(() => vi.unstubAllGlobals())
  /** A service that never answers: the request ends only when it is aborted. */
  const hang = () => vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_, rej) => init?.signal?.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')))))
  const url = (day: string) => gibsWmsUrl('VIIRS_NOAA20_CorrectedReflectance_TrueColor', day, { lat: 36.46, lon: -120.09 }, { halfSizeKm: 600, px: 1024 })

  it('does not ask NASA GIBS again for a picture that timed out', async () => {
    const f = hang()
    vi.stubGlobal('fetch', f)
    const err: unknown = await preloadImage(url('2026-11-11'), { timeoutMs: 20 }).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ImageTimeoutError)
    expect((err as Error).message).toBe('Image timed out after 0 s')
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('still asks once more after a failure that is not a timeout', async () => {
    const f = vi.fn(async (_url: string) => new Response('busy', { status: 503 }))
    vi.stubGlobal('fetch', f)
    await expect(preloadImage(url('2026-11-10'), { timeoutMs: 5_000 })).rejects.toThrow('Image failed to load')
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('asks EUMETSAT for a picture once, whatever stops it', async () => {
    const f = vi.fn(async (_url: string) => new Response('busy', { status: 503 }))
    vi.stubGlobal('fetch', f)
    await expect(preloadImage(`${EUMETSAT_WMS}?service=WMS&request=GetMap&layers=mtg_fd%3Argb_geocolour&width=1024&time=x`, { timeoutMs: 5_000 })).rejects.toThrow('Image failed to load')
    expect(f).toHaveBeenCalledTimes(1)
  })

  it("asks the site's frame cache for a cut once too: what it cannot cut now it cannot cut a second later", async () => {
    const f = vi.fn(async (_url: string) => new Response(null, { status: 503 }))
    vi.stubGlobal('fetch', f)
    await expect(preloadImage('/api/geo?layer=mtg_fd%3Argb_geocolour&time=2026-11-17T15%3A40%3A00Z&lat=48.86&lon=2.35&px=176', { timeoutMs: 5_000 })).rejects.toThrow('Image failed to load')
    expect(f).toHaveBeenCalledTimes(1)
  })
})
