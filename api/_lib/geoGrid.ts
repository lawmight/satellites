/**
 * The grid the Meteosat frame cache is kept on: where each layer's pixels sit, which pieces are fetched from EUMETSAT
 * and which stored tiles a place's small picture is cut from. Pure geometry, shared by the fill (geoFill.ts), the
 * cut (geoCut.ts, api/geo.ts) and the app (src/imagery/eumetsat.ts), so they cannot disagree.
 *
 * Why it is shaped this way:
 *  - EUMETSAT asked (User Service Helpdesk, 2026-11-17) that the app stop sending each visitor's requests to its map
 *    service and cache on its own side instead: about one request a minute per layer is its measure of fair use. A
 *    place's picture is cut around that place, so no two visitors share one; what can be shared is the frame itself.
 *  - So each frame is fetched ONCE, whole, as four 2048 px pieces (four requests per layer every 10 or 15 minutes,
 *    whatever the traffic), and every small picture is cut from it here. Its download speed, not its drawing, is what
 *    limits a piece (50–165 kB/s measured), so pieces are JPEG (about 1 MB each); the same frame as lossless PNG is
 *    7 MB a piece and took over 90 s.
 *  - The grid is plain longitude / latitude (EPSG:4326, as the app's own crops are) at exactly the scale of the
 *    app's largest small picture: an 800 km square at 176 px. North to south such a picture is therefore a straight
 *    copy of 176 rows, moved by at most half a pixel (2.3 km) to land on the grid; east to west it has MORE pixels
 *    than it needs away from the equator (a degree of longitude is shorter there) and is averaged down. Nothing is
 *    ever enlarged, so the cut holds what EUMETSAT's own render of that square at that size would.
 *  - Tiles are 512 px of raw RGB (786 kB): a cut reads the one to six it touches and decodes nothing. A piece is
 *    decoded once, when it is fetched.
 *
 * Larger pictures (the 1024 px card of an opened frame) are not cut from this: the grid is too coarse for them, and
 * they are few. They are still asked of EUMETSAT, by the visitor who opens one.
 */

const EARTH_RADIUS_KM = 6371
const DEG = Math.PI / 180

/** Half the side of every geostationary picture in the app, in km (cardSpec.ts GEO_HALF_KM, captures.ts cropSpec). */
export const CUT_HALF_KM = 400
/** The largest picture cut from the cache: the watcher list's frame (GeoWatchers.tsx, report.ts GEO_FRAME_PROBE). */
export const CUT_MAX_PX = 176
export const CUT_MIN_PX = 16

/** Degrees of latitude 400 km spans (as bboxAround). */
const HALF_DEG_LAT = (CUT_HALF_KM / EARTH_RADIUS_KM) * (180 / Math.PI)
/** Degrees per grid pixel, both ways: an 800 km picture is exactly CUT_MAX_PX rows. */
export const RES_DEG = (2 * HALF_DEG_LAT) / CUT_MAX_PX

/** The stored frame is MOSAIC_PX square: ±83.7° around the point under the satellite, past the edge of its disc. */
export const MOSAIC_PX = 4096
export const TILE_PX = 512
/** Tiles per side. */
export const TILES = MOSAIC_PX / TILE_PX
export const TILE_BYTES = TILE_PX * TILE_PX * 3
/** A piece is one request to EUMETSAT: a quarter of the frame. */
export const PIECE_PX = 2048
/** Pieces per side. */
export const PIECES = MOSAIC_PX / PIECE_PX
export const PIECE_COUNT = PIECES * PIECES
const MOSAIC_HALF_DEG = (MOSAIC_PX / 2) * RES_DEG

export interface CacheLayer {
  /** EUMETView's "workspace:name" */
  layer: string
  /** Longitude under the satellite: the middle of the stored frame */
  subLon: number
  /** Minutes between frames */
  stepMin: number
  /** A daylight product: masked where the sun is down, so pieces wholly in the dark are not fetched */
  daylight?: boolean
}

/** The layers the cache keeps: every one the app shows a Meteosat frame from (src/imagery/geoFrames.ts GEO_FRAMES). */
export const CACHE_LAYERS: Readonly<Record<string, CacheLayer>> = {
  'mtg_fd:rgb_geocolour': { layer: 'mtg_fd:rgb_geocolour', subLon: 0, stepMin: 10 },
  'msg_iodc:rgb_naturalenhncd': { layer: 'msg_iodc:rgb_naturalenhncd', subLon: 45.5, stepMin: 15, daylight: true },
  'msg_iodc:ir108': { layer: 'msg_iodc:ir108', subLon: 45.5, stepMin: 15 },
}

/** Grid column (fractional, pixel i spans [i, i + 1)) of a longitude, and row of a latitude: row 0 is north. */
export const colOf = (l: CacheLayer, lon: number) => (lon - (l.subLon - MOSAIC_HALF_DEG)) / RES_DEG
export const rowOf = (lat: number) => (MOSAIC_HALF_DEG - lat) / RES_DEG
export const lonOf = (l: CacheLayer, col: number) => l.subLon - MOSAIC_HALF_DEG + col * RES_DEG
export const latOf = (row: number) => MOSAIC_HALF_DEG - row * RES_DEG

/** Square [west, south, east, north] of half-size km around a point (as src/lib/geo.ts and imagery.ts bboxAround). */
export function squareAround(lat: number, lon: number, halfKm: number): [number, number, number, number] {
  const dLat = (halfKm / EARTH_RADIUS_KM) * (180 / Math.PI)
  const dLon = dLat / Math.max(0.01, Math.cos(lat * DEG))
  return [lon - dLon, lat - dLat, lon + dLon, lat + dLat]
}

/** A picture's square on the grid, in fractional pixels: [x0, x1) across, [y0, y1) down. */
export interface GridWindow {
  x0: number
  y0: number
  x1: number
  y1: number
}

/** The 800 km square around a place, on a layer's grid. It may reach past the grid: nothing is there (black). */
export function windowAround(l: CacheLayer, lat: number, lon: number): GridWindow {
  const [w, s, e, n] = squareAround(lat, lon, CUT_HALF_KM)
  return { x0: colOf(l, w), y0: rowOf(n), x1: colOf(l, e), y1: rowOf(s) }
}

/** One of the four pieces a frame is fetched in (0..3, row by row from the north-west), as grid pixels and degrees. */
export function pieceRect(l: CacheLayer, piece: number): { row: number; col: number; south: number; west: number; north: number; east: number } {
  const row = Math.floor(piece / PIECES) * PIECE_PX
  const col = (piece % PIECES) * PIECE_PX
  return { row, col, north: latOf(row), south: latOf(row + PIECE_PX), west: lonOf(l, col), east: lonOf(l, col + PIECE_PX) }
}

/** ISO time to the second ("2026-11-17T15:40:00Z"), as EUMETView's TIME parameter and the app's item ids write it. */
export const isoSecond = (ms: number) => new Date(ms).toISOString().slice(0, 19) + 'Z'

/**
 * The request for one piece of one frame: WMS 1.3.0 in EPSG:4326 (BBOX is south,west,north,east), black where there
 * is no data, as the app asks for its own crops.
 */
export function pieceUrl(geoserver: string, l: CacheLayer, piece: number, timeMs: number): string {
  const r = pieceRect(l, piece)
  const f = (v: number) => v.toFixed(6)
  return (
    `${geoserver}/wms?service=WMS&version=1.3.0&request=GetMap&layers=${encodeURIComponent(l.layer)}&styles=` +
    `&format=${encodeURIComponent('image/jpeg')}&crs=EPSG:4326&bbox=${f(r.south)},${f(r.west)},${f(r.north)},${f(r.east)}` +
    `&width=${PIECE_PX}&height=${PIECE_PX}&bgcolor=0x000000&time=${encodeURIComponent(isoSecond(timeMs))}`
  )
}

/** Where a tile is kept: "t/<layer>/<frame time>/<row>_<col>". */
export const tileKey = (layer: string, timeMs: number, row: number, col: number) => `t/${layer}/${isoSecond(timeMs)}/${row}_${col}`

// ── which tiles of a frame hold anything: 64 bits, written as 16 hex digits (two per row of tiles) ──

export const NO_TILES = '0'.repeat(2 * TILES)

export function hasTile(mask: string, row: number, col: number): boolean {
  if (row < 0 || col < 0 || row >= TILES || col >= TILES) return false
  return ((parseInt(mask.slice(2 * row, 2 * row + 2), 16) >> col) & 1) === 1
}

export function withTile(mask: string, row: number, col: number): string {
  const byte = parseInt(mask.slice(2 * row, 2 * row + 2), 16) | (1 << col)
  return mask.slice(0, 2 * row) + byte.toString(16).padStart(2, '0') + mask.slice(2 * row + 2)
}

/**
 * The sun's elevation at a place, in degrees, to about half a degree (declination and the equation of time from the
 * day of the year). Only used to leave out pieces of a daylight product that are wholly in the dark, with degrees
 * to spare (geoFill.ts), so it need not be the app's own (src/lib/geo.ts).
 */
export function sunElevation(lat: number, lon: number, ms: number): number {
  const d = new Date(ms)
  const day = (Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86_400_000
  const hours = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600
  const decl = -23.44 * Math.cos((2 * Math.PI * (day + 10)) / 365)
  const b = (2 * Math.PI * (day - 81)) / 364
  const eotMin = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
  const subLon = -15 * (hours - 12 + eotMin / 60)
  const sin = Math.sin(lat * DEG) * Math.sin(decl * DEG) + Math.cos(lat * DEG) * Math.cos(decl * DEG) * Math.cos((lon - subLon) * DEG)
  return Math.asin(Math.max(-1, Math.min(1, sin))) / DEG
}
