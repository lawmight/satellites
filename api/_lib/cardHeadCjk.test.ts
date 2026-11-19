/**
 * A Chinese, Japanese or Korean card headline: each text part is one phrase on one line, the place takes at most two,
 * and the block fits its band (cardSpec.ts HEAD_CJK, headlineSizeCjk). At the Latin sizes a Japanese headline left
 * "が" alone on a line, broke "注视过" inside the word, and a long place ran into the readouts.
 */
import { describe, expect, it } from 'vitest'
import './i18n/card/server.js'
import { HEAD, PANEL, buildSummarySpec, cjkEm, headlineSizeCjk, type SummaryInput } from './cardSpec.js'
import { accent } from './i18n/parts.js'

const week = (placeLabel: string): SummaryInput => ({
  placeLabel,
  lat: 35.68,
  lon: 139.76,
  satellites: 256,
  counts: { imaged: 40, likely: 210, could: 1565, overhead: 68 },
  windowEnd: Date.UTC(2026, 10, 3, 4),
  timeZone: 'Asia/Tokyo',
  host: '',
})

describe('a CJK card headline', () => {
  it('fits every phrase on one line and the place on two at most', () => {
    const head = ['この1週間、', '256基の衛星が', '見ていた', accent('東京都千代田区丸の内', '。')]
    const S = headlineSizeCjk(head, '公開された画像は40枚。')
    for (const t of ['この1週間、', '256基の衛星が', '見ていた']) expect(cjkEm(t) * S).toBeLessThanOrEqual(PANEL.w)
    const perLine = Math.floor(PANEL.w / (S * HEAD.placeScale))
    expect(Math.ceil(cjkEm('東京都千代田区丸の内。') / perLine)).toBeLessThanOrEqual(2)
  })

  it('is as large as the Latin headline when everything is short, and smaller for a long place', () => {
    expect(headlineSizeCjk(['7基の衛星が', '見ていた', accent('北京', '。')])).toBe(84)
    expect(headlineSizeCjk(['7基の衛星が', '見ていた', accent('東京都千代田区丸の内', '。')])).toBeLessThan(84)
  })

  it('is flagged for the renderers in Chinese, Japanese and Korean only', () => {
    for (const l of ['ja', 'zh-Hans', 'zh-Hant', 'ko'] as const) expect(buildSummarySpec(week('北京'), l).cjk).toBe(true)
    for (const l of ['en', 'de', 'uk', 'ar'] as const) expect('cjk' in buildSummarySpec(week('Waterloo'), l)).toBe(false)
  })
})
