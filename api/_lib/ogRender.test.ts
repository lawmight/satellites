/**
 * How a card with characters its own fonts lack is drawn: from a font list of its own, its fonts plus the Noto subsets
 * fetched for it, so nothing stays behind in the list every card shares (satori keeps that list's loader for the life
 * of the instance). Google Fonts is stubbed with one of the card's own Cyrillic files, a real TTF.
 */
import { readFile } from 'node:fs/promises'
import satori from 'satori/standalone'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FAMILY, loadFonts } from './fonts.js'
import { h } from './h.js'
import { cardSvg } from './ogRender.js'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const line = (text: string) => h('div', { style: { display: 'flex', fontSize: 48, fontFamily: FAMILY.sans } }, text)
const SIZE = { width: 800, height: 120 }

/** Every "Noto subset" Google Fonts serves here is the sans Cyrillic cut; Twemoji serves a circle. */
async function stubFetch(): Promise<ArrayBuffer> {
  const file = await readFile(new URL('../_fonts/sans-cyrillic.ttf', import.meta.url))
  const data = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.startsWith('https://fonts.googleapis.com/')) return new Response("src: url(https://fonts.gstatic.com/s/x.ttf) format('truetype')")
      if (url.includes('twemoji')) return new Response(EMOJI)
      return new Response(data.slice(0))
    }),
  )
  return data
}
const EMOJI = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18"/></svg>'

describe('a card with characters its fonts lack', () => {
  it('is drawn with the subsets fetched for it, as if they were among its fonts', async () => {
    const data = await stubFetch()
    const latin = await loadFonts()
    const drawn = await cardSvg(line('Київ'), { ...SIZE, fonts: latin })
    expect(drawn).toBe(await satori(line('Київ'), { ...SIZE, fonts: [...latin, { name: 'Subset', data, weight: 400, style: 'normal' }] }))
  })

  it('leaves nothing in the font list every card shares', async () => {
    await stubFetch()
    const latin = await loadFonts()
    await cardSvg(line('Львів'), { ...SIZE, fonts: latin })
    // With the shared list alone, satori still lacks those letters: the subset went with the card.
    const asked: string[] = []
    await satori(line('Львів'), {
      ...SIZE,
      fonts: latin,
      loadAdditionalAsset: async (_code, text) => {
        asked.push(text)
        return []
      },
    })
    expect(asked.join('')).toContain('Л')
  })

  it('draws an emoji as Twemoji’s picture', async () => {
    await stubFetch()
    expect(await cardSvg(line('Up 🛰️'), { ...SIZE, fonts: await loadFonts() })).toContain(`data:image/svg+xml;base64,${btoa(EMOJI)}`)
  })

  it('is drawn once, as it was, when nothing it lacks can be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const latin = await loadFonts()
    expect(await cardSvg(line('Одеса'), { ...SIZE, fonts: latin })).toBe(await satori(line('Одеса'), { ...SIZE, fonts: latin }))
  })
})
