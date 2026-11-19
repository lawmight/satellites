/**
 * loadCatalog's retries. Each test imports a fresh copy of the module (its download is a page-wide singleton),
 * and runs without workers, so the file is parsed on the main thread as in a browser that refuses them.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { catalogFile } from './testing'

const file = () => {
  const rows = catalogFile().rows.slice(0, 5)
  return JSON.stringify({ fetchedAt: '2026-11-18T00:00:00Z', source: 'test', count: rows.length, rows })
}
const ok = () => new Response(file(), { headers: { 'content-type': 'application/json' } })
const fresh = () => import('./catalog')

describe('loadCatalog retries', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('asks again after a failed request, past the cache, and every caller gets that catalog', async () => {
    const { loadCatalog, currentCatalog, CATALOG_RETRY_WAITS_MS } = await fresh()
    const fetch = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(ok())
    vi.stubGlobal('fetch', fetch)
    const a = loadCatalog()
    const b = loadCatalog()
    await vi.advanceTimersByTimeAsync(CATALOG_RETRY_WAITS_MS[0] - 1)
    expect(fetch).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    const cat = await a
    expect(cat.count).toBe(5)
    expect(await b).toBe(cat)
    expect(currentCatalog()).toBe(cat)
    expect(fetch.mock.calls).toEqual([['/data/catalog.json'], ['/data/catalog.json', { cache: 'reload' }]])
  })

  it('gets past a server error and a page that is not the catalog', async () => {
    const { loadCatalog } = await fresh()
    const fetch = vi.fn<() => Promise<Response>>()
    fetch
      .mockResolvedValueOnce(new Response('busy', { status: 503 }))
      .mockResolvedValueOnce(new Response('<html>Sign in to this network</html>'))
      .mockResolvedValueOnce(ok())
    vi.stubGlobal('fetch', fetch)
    const p = loadCatalog()
    await vi.runAllTimersAsync()
    expect((await p).count).toBe(5)
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('gives up after the third failure with the last cause, and the next call starts over', async () => {
    const { loadCatalog, isCatalogLoadError, currentCatalog } = await fresh()
    const fetch = vi.fn<() => Promise<Response>>()
    fetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response('busy', { status: 503 }))
      .mockResolvedValueOnce(ok())
    vi.stubGlobal('fetch', fetch)
    const failed = loadCatalog().catch((e: unknown) => e)
    await vi.runAllTimersAsync()
    const err = await failed
    expect(isCatalogLoadError(err)).toBe(true)
    expect((err as Error).message).toBe('Catalog request failed: HTTP 503')
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(currentCatalog()).toBeUndefined()

    expect((await loadCatalog()).count).toBe(5)
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('names what the browser threw', async () => {
    const { loadCatalog } = await fresh()
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))))
    const failed = loadCatalog().catch((e: unknown) => e)
    await vi.runAllTimersAsync()
    expect(((await failed) as Error).message).toBe('TypeError: Failed to fetch')
  })
})
