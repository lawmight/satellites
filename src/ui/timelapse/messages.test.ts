/**
 * The time-lapse's English copy (src/i18n/en/timelapse.ts) against what the player and the video printed before it
 * moved to a catalog: the same words, the same dates, the same counts. Plus what is new with it: the note for a
 * single-season loop, the video's name read in the visitor's language, place names shortened by whole characters, and
 * the video's lines told which way they run and whether they may be tracked.
 */
import { afterEach, describe, expect, it } from 'vitest'
import en from '@/i18n/en/timelapse'
import enTime from '@/i18n/en/time'
import { msgs, setBundleForTests } from '@/i18n/runtime'
import { GLACIER_SEASONS, SEASON_REGIONS } from '@/imagery/seasonRegions'
import { fitText, joins, textDir, videoFileName } from './video'

// What the player and the video used before the catalog, kept here as the English baseline.
const OLD_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const oldDate = (date: string) => `${Number(date.slice(8, 10))} ${OLD_MONTHS[Number(date.slice(5, 7)) - 1]} ${date.slice(0, 4)}`
const oldFit = (s: string, fits: (s: string) => boolean) => {
  let out = s
  while (out.length > 3 && !fits(out)) out = `${out.slice(0, -2).trimEnd()}…`
  return out
}

describe('the time-lapse’s dates', () => {
  const days = Array.from({ length: 12 }, (_, k) => `20${15 + k}-${String(k + 1).padStart(2, '0')}-${String(1 + ((k * 3) % 28)).padStart(2, '0')}`)

  it('reads every month as before, at the frame’s own calendar day', () => {
    for (const d of days) {
      expect(en.date(Date.parse(d))).toBe(oldDate(d))
      expect(en.dayMonth(Date.parse(d))).toBe(oldDate(d).slice(0, -5))
    }
    expect(en.date(Date.parse('2015-10-22'))).toBe('22 Oct 2015')
    expect(en.date(Date.parse('2026-09-04'))).toBe('4 Sep 2026')
  })

  it('stays English whatever language the page shows (a bundle with dates but no time-lapse falls back whole)', () => {
    try {
      setBundleForTests('de', { time: { ...enTime, dayMonth: () => '22. Okt.' } })
      expect(en.date(Date.parse('2015-10-22'))).toBe('22 Oct 2015')
      expect(en.dayMonth(Date.parse('2015-10-22'))).toBe('22 Oct')
      expect(en.readout(Date.parse('2015-10-22'), 'Sentinel-2A')).toBe('22 Oct 2015 · Sentinel-2A')
      expect(en.frameSpoken(3, 11, Date.parse('2019-07-30'))).toBe('Frame 3 of 11: 30 Jul 2019')
    } finally {
      setBundleForTests('en', null)
    }
  })

  it('writes the readout, and the video’s capitals, as before', () => {
    expect(en.readout(Date.parse('2015-10-22'), 'Sentinel-2A')).toBe('22 Oct 2015 · Sentinel-2A')
    expect(en.readout(Date.parse('2015-10-22'), 'Sentinel-2A').toLocaleUpperCase('en')).toBe('22 OCT 2015 · SENTINEL-2A')
    expect(en.frameSpoken(3, 11, Date.parse('2019-07-30'))).toBe('Frame 3 of 11: 30 Jul 2019')
  })
})

describe('the time-lapse’s counts', () => {
  it('captions a ready loop', () => {
    expect(en.captionYearly(11)).toBe('11 clear looks · one a year')
    expect(en.captionSeason(9, 'autumn')).toBe('9 clear looks · one each autumn')
    expect(en.captionSeason(3, 'summer')).toBe('3 clear looks · one each summer')
    expect(en.captionGathering(2015)).toBe('One clear look a year · since 2015')
  })

  it('names every season a region keeps', () => {
    for (const r of [...SEASON_REGIONS, GLACIER_SEASONS.north, GLACIER_SEASONS.south]) expect(en.captionSeason(4, r.season)).toMatch(/^4 clear looks · one each [a-z]+$/)
  })

  it('says why there is no loop', () => {
    expect(en.tooFew(0, 2015, 3)).toBe('No clear look since 2015 · 3 needed')
    expect(en.tooFew(1, 2015, 3)).toBe('1 clear look since 2015 · 3 needed')
    expect(en.tooFew(2, 2015, 3)).toBe('2 clear looks since 2015 · 3 needed')
  })

  it('gives the waiting screen the name it had (the visible counter, with “of”)', () => {
    expect(en.choosingProgress(3, 12)).toBe('Choosing clear looks, 03 of 12')
    expect(en.developingProgress(11, 11)).toBe('Developing frames, 11 of 11')
    // The step's words in each sentence are the step's own label, as before.
    expect(en.choosingProgress(0, 4).startsWith(`${en.choosing}, `)).toBe(true)
    expect(en.developingProgress(0, 4).startsWith(`${en.developing}, `)).toBe(true)
    expect(en.rendering(5)).toBe('Rendering 05%')
    expect(en.rendering(99)).toBe('Rendering 99%')
  })
})

describe('the time-lapse’s note', () => {
  it('keeps its words where the years turn through the seasons', () => {
    expect(en.note(10)).toBe(
      'Each frame is the same 10 km square, taken by Sentinel-2 and toned like every photo here. Each year aims for a different season; a year with no clear look is left out.',
    )
  })

  it('never says the seasons turn where every year is the same one', () => {
    expect(en.noteOneSeason(10)).toMatch(/^Each frame is the same 10 km square/)
    expect(en.noteOneSeason(10)).not.toMatch(/different season/)
    expect(en.noteOneSeason(10)).toMatch(/same season/)
  })
})

describe('the video’s words', () => {
  afterEach(() => setBundleForTests('en', null))

  it('names a place in another script with the visitor’s own word, read when the file is named', () => {
    const frames = [{ date: '2015-10-22' }, { date: '2026-09-04' }]
    setBundleForTests('es', { timelapse: { ...en, fileNamePlace: 'lugar' } })
    expect(videoFileName('東京', frames, msgs(en).fileNamePlace)).toBe('watched-lugar-2015-2026.mp4')
    expect(videoFileName('São Paulo', frames, msgs(en).fileNamePlace)).toBe('watched-sao-paulo-2015-2026.mp4')
    setBundleForTests('ja', { timelapse: { ...en, fileNamePlace: '場所' } })
    expect(videoFileName('東京', frames, msgs(en).fileNamePlace)).toBe('watched-2015-2026.mp4')
    setBundleForTests('en', null)
    expect(videoFileName('東京', frames, msgs(en).fileNamePlace)).toBe('watched-place-2015-2026.mp4')
  })

  it('shortens a Latin place name exactly as before', () => {
    for (const name of ['GROOM LAKE, NEVADA', 'SÃO PAULO', 'LLANFAIRPWLLGWYNGYLL', 'A B C D E F G H', 'OSLO']) {
      for (const max of [3, 4, 6, 9, 12, 40]) {
        const fits = (s: string) => s.length <= max
        expect(fitText(name, fits)).toBe(oldFit(name, fits))
      }
    }
  })

  it('never splits a character that is more than one code unit', () => {
    const graphemes = (s: string) => Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s), (g) => g.segment)
    for (const name of ['ZÜRICH 🇨🇭🇨🇭🇨🇭🇨🇭', '𠮷野家𠮷野家𠮷野家', 'नमस्ते दुनिया नमस्ते', 'Café Café Café']) {
      const input = graphemes(name)
      for (let max = 3; max < input.length; max++) {
        const out = fitText(name, (s) => graphemes(s).length <= max)
        expect(out.endsWith('…')).toBe(true)
        const kept = graphemes(out.slice(0, -1))
        expect(kept).toEqual(input.slice(0, kept.length))
        expect(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(out)).toBe(false)
      }
    }
  })
})

describe('the video’s lines in any script', () => {
  it('runs a place the way its first letter does', () => {
    expect(textDir('GROOM LAKE, NEVADA')).toBe('ltr')
    expect(textDir('КИЇВ')).toBe('ltr')
    expect(textDir('東京')).toBe('ltr')
    expect(textDir('القاهرة')).toBe('rtl')
    expect(textDir('תל אביב')).toBe('rtl')
    expect(textDir('12 القاهرة')).toBe('rtl')
    expect(textDir('CAIRO القاهرة')).toBe('ltr')
  })

  it('tracks every line but those whose letters join', () => {
    for (const s of ['22 OCT 2015 · SENTINEL-2A', 'SÃO PAULO', 'KYİV', 'КИЇВ', '東京', 'नमस्ते']) expect(joins(s)).toBe(false)
    for (const s of ['القاهرة', '22 أكتوبر 2015 · SENTINEL-2A', 'CAIRO القاهرة']) expect(joins(s)).toBe(true)
  })
})
