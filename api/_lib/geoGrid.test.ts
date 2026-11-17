import { describe, expect, it } from 'vitest'
import { cutSquare, taps, tilesOf } from './geoCut.js'
import {
  CACHE_LAYERS, CUT_MAX_PX, MOSAIC_PX, NO_TILES, PIECE_COUNT, RES_DEG, TILE_BYTES, TILE_PX, TILES, colOf, hasTile, latOf, lonOf, pieceRect, pieceUrl, rowOf,
  squareAround, sunElevation, tileKey, windowAround, withTile,
} from './geoGrid.js'
import { bboxAround } from './imagery.js'

const FCI = CACHE_LAYERS['mtg_fd:rgb_geocolour']
const IODC = CACHE_LAYERS['msg_iodc:ir108']
const T = Date.parse('2026-11-17T15:40:00Z')

describe('the frame cache grid', () => {
  it("is the scale of the app's 176 px frame: an 800 km square is exactly 176 rows, anywhere", () => {
    for (const [lat, lon] of [[0, 0], [48.857, 2.352], [-33.9, 18.4], [64.1, -21.9]]) {
      const w = windowAround(FCI, lat, lon)
      expect(w.y1 - w.y0).toBeCloseTo(CUT_MAX_PX, 9)
      // East to west there are more grid pixels than the picture shows, never fewer.
      expect(w.x1 - w.x0).toBeCloseTo(CUT_MAX_PX / Math.cos((lat * Math.PI) / 180), 6)
    }
  })

  it("cuts the square the app's own crops are (bboxAround), centred on the place", () => {
    expect(squareAround(48.857, 2.352, 400)).toEqual(bboxAround(48.857, 2.352, 400))
    const w = windowAround(IODC, 28.614, 77.209)
    expect(lonOf(IODC, (w.x0 + w.x1) / 2)).toBeCloseTo(77.209, 9)
    expect(latOf((w.y0 + w.y1) / 2)).toBeCloseTo(28.614, 9)
  })

  it('holds each disc whole, centred under its satellite', () => {
    expect(colOf(FCI, 0)).toBeCloseTo(MOSAIC_PX / 2, 9)
    expect(colOf(IODC, 45.5)).toBeCloseTo(MOSAIC_PX / 2, 9)
    expect(rowOf(0)).toBeCloseTo(MOSAIC_PX / 2, 9)
    // The edge of a geostationary disc is 81.3° from the point under the satellite.
    expect((MOSAIC_PX / 2) * RES_DEG).toBeGreaterThan(81.3)
    expect((MOSAIC_PX / 2) * RES_DEG).toBeLessThan(90)
  })

  it('fetches a frame as four quarters that meet without a gap', () => {
    expect(PIECE_COUNT).toBe(4)
    const [nw, ne, sw, se] = [0, 1, 2, 3].map((p) => pieceRect(IODC, p))
    expect(nw.east).toBeCloseTo(ne.west, 9)
    expect(nw.south).toBeCloseTo(sw.north, 9)
    expect(nw.south).toBeCloseTo(0, 9)
    expect(ne.west).toBeCloseTo(45.5, 9)
    expect([se.row, se.col]).toEqual([2048, 2048])
    const u = new URL(pieceUrl('https://view.eumetsat.int/geoserver', IODC, 1, T + 900))
    expect(u.origin + u.pathname).toBe('https://view.eumetsat.int/geoserver/wms')
    expect(u.searchParams.get('layers')).toBe('msg_iodc:ir108')
    expect(u.searchParams.get('format')).toBe('image/jpeg')
    expect(u.searchParams.get('bgcolor')).toBe('0x000000')
    expect(u.searchParams.get('time')).toBe('2026-11-17T15:40:00Z')
    expect(u.searchParams.get('width')).toBe('2048')
    // WMS 1.3.0 in EPSG:4326: south, west, north, east.
    const [s, w, n, e] = u.searchParams.get('bbox')!.split(',').map(Number)
    expect([s, w]).toEqual([0, 45.5])
    expect(n).toBeCloseTo(83.71867, 4)
    expect(e - w).toBeCloseTo(n - s, 5)
  })

  it('names a tile by layer, frame and place in the frame, and notes which tiles a frame has', () => {
    expect(tileKey('mtg_fd:rgb_geocolour', T, 3, 4)).toBe('t/mtg_fd:rgb_geocolour/2026-11-17T15:40:00Z/3_4')
    let mask = NO_TILES
    expect(hasTile(mask, 3, 4)).toBe(false)
    mask = withTile(withTile(mask, 3, 4), 7, 7)
    expect(mask).toBe('0000001000000080')
    expect(hasTile(mask, 3, 4)).toBe(true)
    expect(hasTile(mask, 7, 7)).toBe(true)
    expect(hasTile(mask, 4, 3)).toBe(false)
    expect(hasTile(mask, -1, 0)).toBe(false)
    expect(hasTile(mask, 0, TILES)).toBe(false)
  })

  it('knows day from night well enough to leave the dark side of a daylight product alone', () => {
    // 2026-11-17: sunset in Delhi 11:57Z, sunrise 01:15Z; the sun is overhead near 19°S.
    expect(sunElevation(28.614, 77.209, Date.parse('2026-11-17T06:45:00Z'))).toBeGreaterThan(40)
    expect(Math.abs(sunElevation(28.614, 77.209, Date.parse('2026-11-17T11:57:00Z')))).toBeLessThan(1.5)
    expect(sunElevation(28.614, 77.209, Date.parse('2026-11-17T19:00:00Z'))).toBeLessThan(-60)
    expect(sunElevation(-19.2, 0, Date.parse('2026-11-17T11:45:00Z'))).toBeGreaterThan(88)
  })
})

describe('cutting a picture from a stored frame', () => {
  /** A frame whose every pixel says where it is: red = row, green = col (mod 251), blue = tile parity. */
  const tile = (row: number, col: number) => {
    const d = new Uint8Array(TILE_BYTES)
    for (let y = 0; y < TILE_PX; y++) {
      for (let x = 0; x < TILE_PX; x++) {
        const o = (y * TILE_PX + x) * 3
        d[o] = (row * TILE_PX + y) % 251
        d[o + 1] = (col * TILE_PX + x) % 251
        d[o + 2] = (row + col) % 2 ? 200 : 40
      }
    }
    return d
  }

  it('copies the grid pixel for pixel at the scale of the grid, across tiles', () => {
    // 176 px over 176 grid pixels, a third of a pixel off the grid, straddling four tiles.
    const win = { x0: 2048 - 88 + 0.3, y0: 1536 - 88 - 0.4, x1: 2048 + 88 + 0.3, y1: 1536 + 88 - 0.4 }
    expect(tilesOf(win, 176)).toEqual([[2, 3], [2, 4], [3, 3], [3, 4]])
    const out = cutSquare(tile, win, 176)
    for (const [k, i] of [[0, 0], [87, 87], [88, 88], [175, 175], [10, 170]]) {
      const o = (k * 176 + i) * 4
      expect([out[o], out[o + 1], out[o + 3]]).toEqual([(1536 - 88 + k) % 251, (2048 - 88 + i) % 251, 255])
    }
  })

  it('averages the extra pixels a wide square has (away from the equator), and keeps the place in the middle', () => {
    // 60° north: twice as many grid pixels east to west as the picture shows.
    const win = windowAround(FCI, 60, 10)
    expect(win.x1 - win.x0).toBeCloseTo(352, 3)
    const flat = (r: number, c: number) => tile(r, c).map((v, i) => (i % 3 === 1 ? 100 : v))
    const out = cutSquare(flat, win, 176)
    // A flat field stays flat (the weights sum to one), and rows still copy.
    const mid = (88 * 176 + 88) * 4
    expect(out[mid + 1]).toBe(100)
    expect(out[mid]).toBe(Math.round(win.y0 + 88) % 251)
  })

  it('shrinks by averaging: the 112 px thumbnail of the same square', () => {
    const win = windowAround(FCI, 0, 0)
    const out = cutSquare(() => new Uint8Array(TILE_BYTES).fill(90), win, 112)
    expect([...out.slice(0, 4)]).toEqual([90, 90, 90, 255])
    expect(taps(win.y0, win.y1, 112).width).toBeGreaterThan(3)
  })

  it('is black where the frame has nothing: a missing tile, and past the edge of the grid', () => {
    const win = { x0: 512 - 88, y0: 512 - 88, x1: 512 + 88, y1: 512 + 88 }
    const out = cutSquare((r, c) => (r === 0 && c === 0 ? new Uint8Array(TILE_BYTES).fill(255) : null), win, 176)
    expect([...out.slice(0, 4)]).toEqual([255, 255, 255, 255]) // north-west corner: tile 0,0
    expect([...out.slice((175 * 176 + 175) * 4, (175 * 176 + 175) * 4 + 4)]).toEqual([0, 0, 0, 255])
    const off = windowAround(FCI, 10, 120) // far east of Meteosat-12's frame
    expect(tilesOf(off, 176)).toEqual([])
    expect(cutSquare(tile, off, 176).every((v, i) => v === (i % 4 === 3 ? 255 : 0))).toBe(true)
  })

  it('reads at most six tiles for a picture, even near the top of the disc', () => {
    for (const [lat, lon] of [[0, 0], [48.857, 2.352], [70, 25], [76, 0], [-60, 40]]) expect(tilesOf(windowAround(FCI, lat, lon), 176).length).toBeLessThanOrEqual(6)
  })
})
