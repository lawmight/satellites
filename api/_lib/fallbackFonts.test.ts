/**
 * The Noto fallback for scripts the card fonts lack: what it asks Google Fonts for, and that a failure costs the
 * card a few glyphs, never the card.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CACHE_SIZE, loadFallbackAsset } from './fallbackFonts.js'
import type { SatoriFont } from './fonts.js'

afterEach(() => vi.unstubAllGlobals())

const TTF = new Uint8Array([0, 1, 0, 0, 9, 9]).buffer

describe('fallback fonts', () => {
  it('asks for a TrueType Noto subset of exactly the missing characters, tagged with its script', async () => {
    const seen: { url: string; ua: string | null }[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        seen.push({ url, ua: new Headers(init?.headers).get('user-agent') })
        return url.startsWith('https://fonts.googleapis.com/')
          ? new Response("@font-face { src: url(https://fonts.gstatic.com/s/notosansjp/x.ttf) format('truetype'); }")
          : new Response(TTF)
      }),
    )
    const fonts = await loadFallbackAsset('ja-JP', '東京')
    expect(fonts).toEqual([{ name: expect.stringMatching(/^Noto Sans JP \(fallback \d+\)$/), data: TTF, weight: 400, style: 'normal', lang: 'ja-JP' }])
    expect(seen[0].url).toBe(`https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600&text=${encodeURIComponent('東京')}`)
    expect(seen[0].ua).toMatch(/Safari\/533/) // an old browser gets TTF, which satori reads (not WOFF2)
    expect(seen[1].url).toBe('https://fonts.gstatic.com/s/notosansjp/x.ttf')
  })

  it('takes the subset at 400 and 600, under one name, for a headline set at 600', async () => {
    const sheet =
      "@font-face { font-family: 'Noto Sans KR'; font-weight: 400; src: url(https://f/400.ttf) format('truetype'); }\n" +
      "@font-face { font-family: 'Noto Sans KR'; font-weight: 600; src: url(https://f/600.ttf) format('truetype'); }"
    const W600 = new Uint8Array([6]).buffer
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => (url.startsWith('https://fonts.googleapis.com/') ? new Response(sheet) : new Response(url.endsWith('600.ttf') ? W600 : TTF))),
    )
    const fonts = (await loadFallbackAsset('ko-KR', '서울')) as SatoriFont[]
    expect(fonts.map((f) => [f.weight, f.data])).toEqual([
      [400, TTF],
      [600, W600],
    ])
    expect(fonts[0].name).toBe(fonts[1].name)
  })

  it('asks a family Google serves at one weight for that weight only', async () => {
    const fetch = vi.fn(async (url: string) =>
      url.startsWith('https://fonts.googleapis.com/') ? new Response("src: url(https://f/x.ttf) format('truetype')") : new Response(TTF),
    )
    vi.stubGlobal('fetch', fetch)
    await loadFallbackAsset('math', '∮')
    expect(String(fetch.mock.calls[0][0])).toBe(`https://fonts.googleapis.com/css2?family=Noto+Sans+Math&text=${encodeURIComponent('∮')}`)
  })

  it('leaves the script untagged for characters satori cannot place', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.startsWith('https://fonts.googleapis.com/') ? new Response("src: url(https://f/x.ttf) format('truetype')") : new Response(TTF),
      ),
    )
    expect(await loadFallbackAsset('unknown', 'ŉ')).toEqual([{ name: expect.stringMatching(/^Noto Sans \(fallback \d+\)$/), data: TTF, weight: 400, style: 'normal' }])
  })

  it('gives every subset a name of its own, so a later card’s characters are not drawn as boxes', async () => {
    // satori keeps every font it was handed for the instance and asks only the first one under a name.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.startsWith('https://fonts.googleapis.com/') ? new Response("src: url(https://f/x.ttf) format('truetype')") : new Response(TTF),
      ),
    )
    const first = (await loadFallbackAsset('ja-JP|zh-CN|zh-TW|zh-HK', '大阪')) as SatoriFont[]
    const second = (await loadFallbackAsset('ja-JP|zh-CN|zh-TW|zh-HK', '京都')) as SatoriFont[]
    expect(first.map((f) => f.lang)).toEqual(['ja-JP', 'zh-CN', 'zh-TW', 'zh-HK'])
    const names = [...first, ...second].map((f) => f.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('keeps the answers asked for last, a bounded number of them', async () => {
    const fetch = vi.fn(async (url: string) =>
      url.startsWith('https://fonts.googleapis.com/') ? new Response("src: url(https://f/x.ttf) format('truetype')") : new Response(TTF),
    )
    vi.stubGlobal('fetch', fetch)
    const ask = (i: number) => loadFallbackAsset('th-TH', `ก${i}`)
    for (let i = 0; i <= CACHE_SIZE; i++) await ask(i) // one more than it keeps: the first is let go
    const fetched = fetch.mock.calls.length
    await ask(CACHE_SIZE)
    expect(fetch.mock.calls.length).toBe(fetched) // kept
    await ask(0)
    expect(fetch.mock.calls.length).toBe(fetched + 2) // asked again: its style sheet, then its font
  })

  it('draws an emoji from Twemoji', async () => {
    const fetch = vi.fn(async (_url: string) => new Response('<svg/>'))
    vi.stubGlobal('fetch', fetch)
    expect(await loadFallbackAsset('emoji', '🛰️')).toBe(`data:image/svg+xml;base64,${btoa('<svg/>')}`)
    expect(String(fetch.mock.calls[0][0])).toMatch(/\/1f6f0\.svg$/)
  })

  it('gives up quietly when Google Fonts is down, and asks again next time', async () => {
    const fetch = vi.fn(async () => Promise.reject(new TypeError('offline')))
    vi.stubGlobal('fetch', fetch)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await loadFallbackAsset('ar-AR', 'القاهرة')).toEqual([])
    expect(await loadFallbackAsset('ar-AR', 'القاهرة')).toEqual([])
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
