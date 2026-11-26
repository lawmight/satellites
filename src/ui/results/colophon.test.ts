/**
 * When the results' thanks bar shows (Colophon.tsx decideBar): from a browser's third result on, never beside the
 * invite, never again once closed, and the same answer every time a place remounts. The test runner has no
 * localStorage, so this is the tab-memory path, which follows the same rules.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { resetAskForTests } from '@/lib/maker'
import { decideBar, finishBar, pressedSupport, resetBarForTests } from './Colophon'

describe('decideBar', () => {
  beforeEach(() => {
    resetBarForTests()
    resetAskForTests()
  })

  it('waits for the third result, then shows on every one until closed', () => {
    expect(decideBar('a', false)).toBe(false)
    expect(decideBar('b', false)).toBe(false)
    expect(decideBar('c', false)).toBe(true)
    expect(decideBar('d', false)).toBe(true)
    expect(decideBar('e', false)).toBe(true)
  })

  it('answers the same for a place it has decided (a remount, a report turning final)', () => {
    decideBar('a', false)
    decideBar('b', false)
    expect(decideBar('c', false)).toBe(true)
    expect(decideBar('c', false)).toBe(true)
    expect(decideBar('a', false)).toBe(false)
  })

  it('never shows again once closed, on a place already decided or a new one', () => {
    decideBar('a', false)
    decideBar('b', false)
    expect(decideBar('c', false)).toBe(true)
    finishBar()
    expect(decideBar('c', false)).toBe(false)
    expect(decideBar('d', false)).toBe(false)
  })

  it('never shows beside the invite, which still counts as a result', () => {
    expect(decideBar('a', true)).toBe(false)
    expect(decideBar('b', true)).toBe(false)
    expect(decideBar('c', true)).toBe(false)
    expect(decideBar('d', false)).toBe(true)
  })

  it('keeps coming after a press of the link elsewhere, and ends with a press of its own', () => {
    decideBar('a', false)
    pressedSupport('results') // the closing row, on the first result
    pressedSupport('share')
    decideBar('b', false)
    expect(decideBar('c', false)).toBe(true)
    pressedSupport('bar')
    expect(decideBar('c', false)).toBe(false)
    expect(decideBar('d', false)).toBe(false)
  })
})
