/**
 * The Vietnamese headline holds its compounds together (vi.md §6.5), the place's own class noun too: at 390 px it broke
 * as "…đã quan sát Thành / phố Hồ Chí Minh." (native review, 2026-11-22).
 */
import { expect, it } from 'vitest'
import results from './results'

it('keeps a place’s class noun with it in the headline, and the rest of the name free to wrap', () => {
  const text = (rich: unknown) => JSON.stringify(rich)
  expect(text(results.headline.watched(3, 'Thành phố Hồ Chí Minh', { lastDays: 7 }))).toContain('Thành\u00a0phố Hồ Chí Minh')
  expect(text(results.headline.none('Quần đảo Hoàng Sa', false))).toContain('Quần\u00a0đảo Hoàng Sa')
  expect(text(results.headline.watched(3, 'Hà Nội', { lastDays: 7 }))).toContain('"Hà Nội"')
})
