/**
 * The engine's words as messages (src/i18n/en/engine.ts) and how a MessageRef is rendered (src/i18n/messageRef.ts).
 * The English baseline is what report.ts and stac.ts wrote before they emitted refs: the old formulas are kept here,
 * so every count gives exactly the old text.
 */
import { afterEach, describe, expect, it } from 'vitest'
import enEngine from '@/i18n/en/engine'
import { refMaker, refText, renderRef } from '@/i18n/messageRef'
import { setBundleForTests } from '@/i18n/runtime'
import type { MessageRef } from '@/types'

const ref = refMaker<typeof enEngine>('engine')
const text = (r: MessageRef) => refText(r, { engine: enEngine })

// The engine's English before it emitted refs (report.ts).
const nf = new Intl.NumberFormat('en-US')
const oldPlural = (n: number, one: string, many = `${one}S`) => `${nf.format(n)} ${n === 1 ? one : many}`
const COUNTS = [0, 1, 2, 3, 17, 999, 1000, 2031, 16_912, 123_456]

describe('engine progress lines', () => {
  it('read exactly as before, for every count', () => {
    expect(text(ref('progress.loadingCatalog'))).toBe('LOADING ORBITAL CATALOG')
    expect(text(ref('progress.searchingArchives'))).toBe('SEARCHING SENTINEL-2 + LANDSAT ARCHIVES')
    expect(text(ref('progress.verifyingWeatherStart'))).toBe('VERIFYING NASA WEATHER MOSAICS')
    for (const n of COUNTS) {
      const m = COUNTS[(COUNTS.indexOf(n) + 3) % COUNTS.length]
      expect(text(ref('progress.catalog', { objects: n }))).toBe(`CATALOG · ${oldPlural(n, 'OBJECT')}`)
      expect(text(ref('progress.propagateStart', { orbits: n, days: 7 }))).toBe(`PROPAGATING ${oldPlural(n, 'ORBIT')} · 7 DAYS`)
      expect(text(ref('progress.propagating', { done: n, total: m }))).toBe(`PROPAGATING ORBITS · ${nf.format(n)} / ${nf.format(m)}`)
      expect(text(ref('progress.matching', { scenes: n, passes: m }))).toBe(`MATCHING ${oldPlural(n, 'SCENE')} TO ${oldPlural(m, 'PASS', 'PASSES')}`)
      expect(text(ref('progress.verifyingWeather', { settled: n, total: m }))).toBe(`VERIFYING NASA WEATHER MOSAICS · ${nf.format(n)} / ${nf.format(m)}`)
      expect(text(ref('progress.done', { passes: m, images: n }))).toBe(`${oldPlural(m, 'PASS', 'PASSES')} · ${oldPlural(n, 'IMAGE')}`)
    }
  })

  it('count a single day as one (the app always asks for 7)', () => {
    expect(text(ref('progress.propagateStart', { orbits: 1, days: 1 }))).toBe('PROPAGATING 1 ORBIT · 1 DAY')
  })
})

describe('engine notes', () => {
  it('read exactly as before', () => {
    expect(text(ref('note.archiveSlow'))).toBe('The Sentinel-2 and Landsat archives were too slow to answer; passes are shown from orbital geometry only.')
    expect(text(ref('note.archiveDown'))).toBe('The Sentinel-2 and Landsat archives could not be reached; passes are shown from orbital geometry only.')
    expect(text(ref('note.openOcean'))).toBe("This spot is outside Sentinel-2's acquisition plan (open ocean).")
    expect(text(ref('note.elementsNewer'))).toBe('These passes are reconstructed from newer orbital elements, so their times may be off by a few minutes.')
    expect(text(ref('note.sentinel2Thumbnails'))).toBe('Sentinel-2 listed via Earth Search; some scenes show a full-scene thumbnail, not a crop.')
    expect(text(ref('note.sentinel2EarthSearch'))).toBe('Sentinel-2 listed via Earth Search (Planetary Computer search unavailable).')
    expect(text(ref('note.sentinel2Down'))).toBe('Sentinel-2 archive unreachable; Sentinel-2 images may be missing.')
    expect(text(ref('note.landsatDown'))).toBe('Landsat archive unreachable; Landsat images may be missing.')
    expect(text(ref('note.gibsSlowAll'))).toBe('NASA GIBS did not answer in time, so weather-satellite images are not shown.')
    expect(text(ref('note.gibsDownAll'))).toBe('NASA GIBS could not be reached, so weather-satellite images are not shown.')
    for (const days of [3, 4, 12, 45]) expect(text(ref('note.elementsOld', { days }))).toBe(`Orbital elements are ${days} days old, so pass times may be off by a few minutes.`)
    for (const n of COUNTS.filter(Boolean)) {
      const total = n + 34
      expect(text(ref('note.gibsUnconfirmed', { n }))).toBe(
        `NASA GIBS was slow to confirm ${n === 1 ? 'one VIIRS image' : `${nf.format(n)} VIIRS images`}; VIIRS images the whole globe every day, so ${n === 1 ? 'that pass counts' : 'those passes count'} as watched.`,
      )
      expect(text(ref('note.gibsSlowSome', { missing: n, total }))).toBe(`NASA GIBS did not return ${nf.format(n)} of ${nf.format(total)} weather-satellite images in time; those passes are shown as likely.`)
      expect(text(ref('note.gibsDownSome', { missing: n, total }))).toBe(`NASA GIBS failed to return ${nf.format(n)} of ${nf.format(total)} weather-satellite images; those passes are shown as likely.`)
    }
  })
})

describe('MessageRefs', () => {
  afterEach(() => setBundleForTests('en', null))

  it('are ids into a namespace, with raw params', () => {
    expect(ref('note.archiveSlow')).toEqual({ id: 'engine.note.archiveSlow' })
    expect(ref('note.gibsSlowSome', { missing: 2, total: 35 })).toEqual({ id: 'engine.note.gibsSlowSome', params: { missing: 2, total: 35 } })
    // Checked at compile time (tsc): an id the namespace lacks, missing or extra params.
    // @ts-expect-error no such message
    ref('note.noSuchNote')
    // @ts-expect-error its slots need params
    ref('note.gibsSlowSome')
    // @ts-expect-error fixed text takes none
    ref('note.archiveSlow', { n: 1 })
  })

  it('render a plain string (an older report) as it is, and nothing for an id they do not know', () => {
    const ns = { engine: enEngine }
    expect(renderRef('Some old English note.', ns)).toBe('Some old English note.')
    expect(renderRef(undefined, ns)).toBeUndefined()
    expect(renderRef({ id: 'app.faults.catalog' }, ns)).toBeUndefined()
    expect(renderRef({ id: 'engine.note.noSuchNote' }, ns)).toBeUndefined()
    expect(renderRef({ id: 'engine.note' }, ns)).toBeUndefined()
    expect(renderRef({ id: 'engine.constructor' }, ns)).toBeUndefined()
    expect(renderRef({ id: 'engine.note.toString' }, ns)).toBeUndefined()
    expect(renderRef({ id: 'engine' }, ns)).toBeUndefined()
  })

  it('render in the language on screen, English for the stats, English where a translation lacks the message', () => {
    const note = ref('note.gibsSlowSome', { missing: 2, total: 35 })
    setBundleForTests('de', {
      engine: { ...enEngine, note: { ...enEngine.note, gibsSlowSome: ({ missing, total }: { missing: number; total: number }) => `${missing} von ${total}` } },
    })
    expect(text(note)).toBe('2 von 35')
    expect(refText(note, { engine: enEngine }, { english: true })).toBe('NASA GIBS did not return 2 of 35 weather-satellite images in time; those passes are shown as likely.')
    setBundleForTests('de', { engine: { progress: {}, note: {} } })
    expect(text(ref('note.archiveDown'))).toBe(enEngine.note.archiveDown)
  })
})
