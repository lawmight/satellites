/**
 * Cutting a place's small picture out of a stored Meteosat frame (geoGrid.ts): the pixels of api/geo.ts.
 *
 * One filter does every case: a triangle (bilinear) kernel, widened by the scale when the picture has fewer pixels
 * than the grid under it, so shrinking averages instead of skipping pixels. At a scale of exactly one the square is
 * first moved onto the grid (at most half a pixel), and the kernel then gives each grid pixel to one output pixel
 * whole: a copy, not a second resampling. That is the north–south case of the app's 176 px frame everywhere, and its
 * east–west case at the equator; elsewhere east–west is an average of more pixels than are shown.
 *
 * Tiles a frame does not have (off the disc, a daylight product in the dark) are black, as EUMETSAT draws them.
 */
import { MOSAIC_PX, TILE_PX, TILES, type GridWindow } from './geoGrid.js'

interface Taps {
  /** First grid pixel each output pixel reads */
  start: Int32Array
  /** Its weights, `width` per output pixel, summing to one */
  weight: Float32Array
  width: number
  /** Grid pixels read in all: [lo, hi) */
  lo: number
  hi: number
}

/** The grid pixels each of `px` output pixels over [from, to) is made of, and how much of each. */
export function taps(from: number, to: number, px: number): Taps {
  const scale = (to - from) / px
  // The same size as the grid: land on it, so each output pixel IS a grid pixel.
  const origin = Math.abs(scale - 1) < 1e-6 ? Math.round(from) : from
  const support = Math.max(1, scale)
  const width = Math.ceil(2 * support) + 1
  const start = new Int32Array(px)
  const weight = new Float32Array(px * width)
  let lo = Infinity
  let hi = -Infinity
  for (let k = 0; k < px; k++) {
    const centre = origin + (k + 0.5) * scale
    const first = Math.floor(centre - support)
    start[k] = first
    let sum = 0
    for (let j = 0; j < width; j++) {
      const w = Math.max(0, 1 - Math.abs((first + j + 0.5 - centre) / support))
      weight[k * width + j] = w
      sum += w
    }
    for (let j = 0; j < width; j++) weight[k * width + j] /= sum
    lo = Math.min(lo, first)
    hi = Math.max(hi, first + width)
  }
  return { start, weight, width, lo, hi }
}

/** The tiles a window's picture reads, by [row, col], inside the frame. */
export function tilesOf(win: GridWindow, px: number): [number, number][] {
  const x = taps(win.x0, win.x1, px)
  const y = taps(win.y0, win.y1, px)
  const out: [number, number][] = []
  const clamp = (v: number) => Math.max(0, Math.min(TILES - 1, v))
  if (x.hi <= 0 || y.hi <= 0 || x.lo >= MOSAIC_PX || y.lo >= MOSAIC_PX) return out
  for (let r = clamp(Math.floor(y.lo / TILE_PX)); r <= clamp(Math.floor((y.hi - 1) / TILE_PX)); r++) {
    for (let c = clamp(Math.floor(x.lo / TILE_PX)); c <= clamp(Math.floor((x.hi - 1) / TILE_PX)); c++) out.push([r, c])
  }
  return out
}

/**
 * The picture of a window, `px` square, as RGBA (row 0 north). `tile` hands over a stored tile's raw RGB
 * (TILE_PX × TILE_PX × 3), or null for one the frame does not have.
 */
export function cutSquare(tile: (row: number, col: number) => Uint8Array | null, win: GridWindow, px: number): Uint8ClampedArray {
  const x = taps(win.x0, win.x1, px)
  const y = taps(win.y0, win.y1, px)
  const out = new Uint8ClampedArray(px * px * 4)
  for (let i = 3; i < out.length; i += 4) out[i] = 255
  // The grid pixels read, as one block (black where the frame has nothing).
  const w = x.hi - x.lo
  const h = y.hi - y.lo
  if (w <= 0 || h <= 0 || w > MOSAIC_PX || h > MOSAIC_PX) return out
  const block = new Uint8Array(w * h * 3)
  for (const [r, c] of tilesOf(win, px)) {
    const data = tile(r, c)
    if (!data) continue
    const gx0 = Math.max(x.lo, c * TILE_PX)
    const gx1 = Math.min(x.hi, (c + 1) * TILE_PX)
    for (let gy = Math.max(y.lo, r * TILE_PX); gy < Math.min(y.hi, (r + 1) * TILE_PX); gy++) {
      const from = ((gy - r * TILE_PX) * TILE_PX + (gx0 - c * TILE_PX)) * 3
      block.set(data.subarray(from, from + (gx1 - gx0) * 3), ((gy - y.lo) * w + (gx0 - x.lo)) * 3)
    }
  }
  // Across, then down.
  const rows = new Float32Array(px * h * 3)
  for (let gy = 0; gy < h; gy++) {
    for (let k = 0; k < px; k++) {
      let r = 0
      let g = 0
      let b = 0
      const at = (gy * w + (x.start[k] - x.lo)) * 3
      for (let j = 0; j < x.width; j++) {
        const wt = x.weight[k * x.width + j]
        if (wt === 0) continue
        r += wt * block[at + j * 3]
        g += wt * block[at + j * 3 + 1]
        b += wt * block[at + j * 3 + 2]
      }
      const o = (gy * px + k) * 3
      rows[o] = r
      rows[o + 1] = g
      rows[o + 2] = b
    }
  }
  for (let k = 0; k < px; k++) {
    const first = y.start[k] - y.lo
    for (let i = 0; i < px; i++) {
      let r = 0
      let g = 0
      let b = 0
      for (let j = 0; j < y.width; j++) {
        const wt = y.weight[k * y.width + j]
        if (wt === 0) continue
        const at = ((first + j) * px + i) * 3
        r += wt * rows[at]
        g += wt * rows[at + 1]
        b += wt * rows[at + 2]
      }
      const o = (k * px + i) * 4
      out[o] = Math.round(r)
      out[o + 1] = Math.round(g)
      out[o + 2] = Math.round(b)
    }
  }
  return out
}
