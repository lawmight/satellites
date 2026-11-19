import { describe, expect, it } from 'vitest'
import { isolateIslands, isolateSpec, outsideIsolates } from './bidi'

const I = (s: string) => `⁦${s}⁩`

describe('the card’s Arabic islands', () => {
  it('isolates clocks with their zone, percentages and Latin names', () => {
    expect(isolateIslands('الأحد، 1 نوفمبر 2026 · 11:21 EST')).toBe(`الأحد، 1 نوفمبر 2026 · ${I('11:21 EST')}`)
    expect(isolateIslands('الخميس · 01:20:09 UTC−5')).toBe(`الخميس · ${I('01:20:09 UTC−5')}`)
    expect(isolateIslands('معظم المشهد سحب · 81%')).toBe(`معظم المشهد سحب · ${I('81%')}`)
    expect(isolateIslands('أقرب نظرة · SENTINEL-2C · 10 م')).toBe(`أقرب نظرة · ${I('SENTINEL-2C')} · 10 م`)
    expect(isolateIslands('القمر الصناعي Sentinel-2 L2A رصد')).toBe(`القمر الصناعي ${I('Sentinel-2 L2A')} رصد`)
  })

  it('leaves numbers with Arabic units and every text without Arabic alone', () => {
    expect(isolateIslands('رصد 7 أقمار صناعية')).toBe('رصد 7 أقمار صناعية')
    expect(isolateIslands('500 م')).toBe('500 م')
    for (const s of ['SENTINEL-2C · SUN 1 NOV · 11:21 EST', 'CLOUD 25%', 'Waterloo', 'www.watched.earth', 'https://x/y.png?a=1']) expect(isolateIslands(s)).toBe(s)
  })

  it('reads a paragraph’s direction from outside its isolates', () => {
    expect(outsideIsolates(isolateIslands('SENTINEL-2C · 10 م'))).toBe(' · 10 م')
  })

  it('maps a whole spec, keeping its shape', () => {
    const spec = { locale: 'ar', head: ['رصد', { accent: ['Waterloo'] }], chips: [{ segs: [{ text: 'السحب · 81%', tone: 'warn' }] }], n: 3, url: 'https://x/a.png' }
    expect(isolateSpec(spec)).toEqual({ ...spec, chips: [{ segs: [{ text: `السحب · ${I('81%')}`, tone: 'warn' }] }] })
  })
})
