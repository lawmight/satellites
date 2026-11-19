import { describe, expect, it } from 'vitest'
import { planVideo, videoFileName, VIDEO_FPS } from './video'

describe('the video’s plan', () => {
  it('rests on every picture and dissolves the next in over it, once through', () => {
    const { steps } = planVideo(3)
    // first rest 36, then (12 dissolving + 27 resting), then (12 dissolving + 60 resting)
    expect(steps).toHaveLength(36 + 12 + 27 + 12 + 60)
    expect(steps[0]).toEqual({ base: 0, alpha: 0 })
    expect(steps[36]).toMatchObject({ base: 0, over: 1 })
    expect(steps[36 + 12]).toEqual({ base: 1, alpha: 0 })
    expect(steps.at(-1)).toEqual({ base: 2, alpha: 0 })
  })

  it('never shows a picture at nothing or at everything while it dissolves, and only ever grows', () => {
    const fade = planVideo(2).steps.filter((s) => s.over !== undefined)
    expect(fade).toHaveLength(12)
    expect(fade[0].alpha).toBeGreaterThan(0)
    expect(fade.at(-1)!.alpha).toBeLessThan(1)
    for (let i = 1; i < fade.length; i++) expect(fade[i].alpha).toBeGreaterThan(fade[i - 1].alpha)
  })

  it('makes eleven years about sixteen seconds', () => {
    const seconds = planVideo(11).steps.length / VIDEO_FPS
    expect(seconds).toBeGreaterThan(14)
    expect(seconds).toBeLessThan(18)
  })

  it('is one resting picture for a single frame', () => {
    expect(planVideo(1).steps.every((s) => s.base === 0 && s.over === undefined)).toBe(true)
  })
})

describe('the file’s name', () => {
  const frames = [{ date: '2015-10-22' }, { date: '2021-12-01' }, { date: '2026-09-04' }]
  it('names the place and the years it spans', () => {
    expect(videoFileName('Groom Lake, Nevada', frames, 'place')).toBe('watched-groom-lake-nevada-2015-2026.mp4')
    expect(videoFileName('São Paulo', frames.slice(0, 1), 'place')).toBe('watched-sao-paulo-2015.mp4')
  })
  it('spells letters that have no decomposition as the place search does, never as a hyphen', () => {
    expect(videoFileName('Łódź', frames, 'place')).toBe('watched-lodz-2015-2026.mp4')
    expect(videoFileName('Kırıkkale', frames, 'place')).toBe('watched-kirikkale-2015-2026.mp4')
    expect(videoFileName('Ørsted', frames, 'place')).toBe('watched-orsted-2015-2026.mp4')
    expect(videoFileName('Þingvellir, Ísland', frames, 'place')).toBe('watched-thingvellir-island-2015-2026.mp4')
    expect(videoFileName('Straße des 17. Juni', frames, 'place')).toBe('watched-strasse-des-17-juni-2015-2026.mp4')
    expect(videoFileName('İstanbul', frames, 'place')).toBe('watched-istanbul-2015-2026.mp4')
    // English names, as before.
    expect(videoFileName('St. John’s, Newfoundland', frames, 'place')).toBe('watched-st-john-s-newfoundland-2015-2026.mp4')
  })
  it('cuts a long name at 40 characters, never leaving a hyphen at the cut', () => {
    const welsh = 'Llanfairpwllgwyngyllgogerychwyrndrobwll Llantysiliogogogoch' // 39 letters, then the space
    expect(videoFileName(welsh, frames, 'place')).toBe('watched-llanfairpwllgwyngyllgogerychwyrndrobwll-2015-2026.mp4')
    expect(videoFileName('Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu', frames, 'place')).toBe(
      'watched-taumatawhakatangihangakoauauotamateaturi-2015-2026.mp4',
    )
  })
  it('still has a name for a place written in another script, or with no frames', () => {
    expect(videoFileName('東京', frames, 'place')).toBe('watched-place-2015-2026.mp4')
    expect(videoFileName('Oslo', [], 'place')).toBe('watched-oslo.mp4')
  })
})
