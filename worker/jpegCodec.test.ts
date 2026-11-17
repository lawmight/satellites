/**
 * The frame cache's codec under Node, on the WebAssembly the Worker bundles: a picture survives the round trip, and
 * a cut is encoded as the settings promise.
 */
import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { jpegCodec } from './jpegCodec.ts'

const wasm = async (path: string) => WebAssembly.compile(await readFile(new URL(`../node_modules/@jsquash/jpeg/codec/${path}`, import.meta.url)))

describe('the frame cache codec (MozJPEG, WebAssembly)', () => {
  it('encodes a cut and decodes it back to the same picture', async () => {
    const codec = jpegCodec(await wasm('dec/mozjpeg_dec.wasm'), await wasm('enc/mozjpeg_enc.wasm'))
    const px = 176
    const rgba = new Uint8ClampedArray(px * px * 4)
    // Cloud-like: smooth gradients with a bright square in the middle.
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const o = (y * px + x) * 4
        const bright = x > 60 && x < 110 && y > 60 && y < 110
        rgba[o] = bright ? 235 : 40 + (x >> 1)
        rgba[o + 1] = bright ? 235 : 60 + (y >> 1)
        rgba[o + 2] = bright ? 240 : 120
        rgba[o + 3] = 255
      }
    }
    const jpeg = await codec.encode(rgba, px, px)
    const bytes = new Uint8Array(jpeg)
    expect([bytes[0], bytes[1]]).toEqual([0xff, 0xd8])
    // Baseline (SOF0), not progressive (SOF2): the cheap mode to make.
    const marker = (m: number) => bytes.some((b, i) => b === 0xff && bytes[i + 1] === m)
    expect(marker(0xc0)).toBe(true)
    expect(marker(0xc2)).toBe(false)
    const back = await codec.decode(jpeg)
    expect([back.width, back.height, back.data.length]).toEqual([px, px, px * px * 4])
    let worst = 0
    let sum = 0
    for (let i = 0; i < rgba.length; i++) {
      const d = Math.abs(rgba[i] - back.data[i])
      worst = Math.max(worst, d)
      sum += d
    }
    expect(sum / rgba.length).toBeLessThan(1.5)
    expect(worst).toBeLessThan(40) // the square's hard edge rings a little; nothing else moves
  })
})
