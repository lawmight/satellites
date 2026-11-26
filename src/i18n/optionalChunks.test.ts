/**
 * A place-name table that fails to download never reloads the page, in Safari either (whose error names no module),
 * whoever asked for it: a search or a report (imagery ensureExonyms), or a switch to the language (its `ready`).
 */
import { describe, expect, it } from 'vitest'
import { isQuietFailure } from '@/lib/staleBuild'
import { quietImport, SEARCH_CHUNK, TABLE_CHUNK, tableChunk } from './optionalChunks'

const SAFARI = new TypeError('Importing a module script failed.')
const quiet = () => (globalThis as { [k: symbol]: Set<string> | undefined })[Symbol.for('watched.quietChunks')]

/** Every language's chunk (the real ones, tables included). */
const LOCALES = import.meta.glob<{ ready?: () => Promise<void> }>(['./*/index.ts', '!./en/**'], { eager: true })

describe('optional chunks', () => {
  it('keeps a chunk quiet while any download of it runs', async () => {
    let first: (() => void) | undefined
    let second: ((err: Error) => void) | undefined
    const a = quietImport(SEARCH_CHUNK, () => new Promise<void>((done) => (first = done)))
    const b = quietImport(SEARCH_CHUNK, () => new Promise<void>((_, no) => (second = no)))
    first?.()
    await a
    expect(quiet()?.has(SEARCH_CHUNK)).toBe(true) // the other one still runs
    expect(isQuietFailure(SAFARI, quiet())).toBe(true)
    second?.(SAFARI)
    await b.catch(() => undefined)
    expect(quiet()?.has(SEARCH_CHUNK)).toBe(false)
  })

  it('loads a table once, quietly, and asks again after a failure', async () => {
    let attempts = 0
    const ns = tableChunk({ names: '' }, async () => {
      if (++attempts === 1) throw SAFARI
      return { default: 'RU:Moscow=Москва' }
    })
    await expect(ns.load()).rejects.toBe(SAFARI)
    await ns.load()
    await ns.load()
    expect([attempts, ns.names]).toEqual([2, 'RU:Moscow=Москва'])
  })

  it('makes every language’s switch (`ready`) a quiet download of its table', async () => {
    const readies = Object.entries(LOCALES).filter(([, m]) => m.ready)
    const locales = readies.map(([path]) => /\.\/(.+)\/index\.ts$/.exec(path)![1]).sort()
    expect(locales).toEqual(['de', 'fa', 'hi', 'it', 'ru', 'uk', 'vi'])
    for (const [path, m] of readies) {
      const switching = m.ready!()
      expect([path, isQuietFailure(SAFARI, quiet()), quiet()?.has(TABLE_CHUNK)]).toEqual([path, true, true])
      await switching
      expect([path, quiet()?.has(TABLE_CHUNK)]).toEqual([path, false])
    }
  })
})
