#!/usr/bin/env python3
"""
Build the latest true-colour Earth mosaic and a coverage-age map from NASA GIBS.

Why this script exists: watched.earth asks GIBS for one square around a pin
(src/imagery/gibs.ts, gibsTiles.ts). It never walks the globe or stitches tiles.
Planetary Computer STAC is also pin-centred (one crop = one scene). The only
full-Earth images in the product are static textures from build-textures.py.
This lever downloads GIBS's own daily Corrected Reflectance browse tiles
(geographic WMTS, TileMatrixSet 250m) and assembles:

  1. a stitched equirectangular mosaic (single day, or latest-available gap-fill)
  2. a coverage age choropleth + JSON manifest

WMS is deliberately unused here. On 2026-11-12, bulk WMS probes overloaded GIBS;
pre-cut tiles stayed fast (see gibsTiles.ts header).

Needs Python 3, NumPy, and Pillow: `python3 -m pip install numpy pillow`.

Usage:
  python3 scripts/earth-latest-mosaic.py --help
  python3 scripts/earth-latest-mosaic.py --zoom 2 --lookback 3 --out scratch/earth-mosaic
  npm run earth:mosaic
"""
from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import io
import json
import sys
import time
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

# Geographic 250m matrix from GIBS GetCapabilities (not power-of-2).
# Zooms 7–8 exceed JPEG width limits (~65500 px); CLI stops at 6.
GEO_EXTENT: dict[int, tuple[int, int]] = {
  0: (2, 1),
  1: (3, 2),
  2: (5, 3),
  3: (10, 5),
  4: (20, 10),
  5: (40, 20),
  6: (80, 40),
}

# Deg/pixel at zoom 0. Low zooms allocate tiles past ±180/±90; crop to this world.
GEO_RES0 = 0.5625
TILE_PX = 512
EMPTY_MEAN = 5.0
HOLE_MAX = 8
RECENT_CACHE_DAYS = 2
JPEG_ZOOMS = tuple(sorted(GEO_EXTENT))

LAYERS = [
  'VIIRS_NOAA20_CorrectedReflectance_TrueColor',
  'VIIRS_NOAA21_CorrectedReflectance_TrueColor',
  'MODIS_Aqua_CorrectedReflectance_TrueColor',
  'MODIS_Terra_CorrectedReflectance_TrueColor',
  'VIIRS_SNPP_CorrectedReflectance_TrueColor',
]

LABEL = {
  'VIIRS_NOAA20_CorrectedReflectance_TrueColor': 'NOAA-20',
  'VIIRS_NOAA21_CorrectedReflectance_TrueColor': 'NOAA-21',
  'MODIS_Aqua_CorrectedReflectance_TrueColor': 'Aqua',
  'MODIS_Terra_CorrectedReflectance_TrueColor': 'Terra',
  'VIIRS_SNPP_CorrectedReflectance_TrueColor': 'SNPP',
}


@dataclass(frozen=True)
class TilePick:
  """Provenance for one geographic WMTS cell after latest-available assembly."""

  row: int
  col: int
  age_days: int
  majority_age_days: int
  oldest_age_days: int
  fill_fraction: float
  mixed: bool
  layer: str
  date: str
  mean: float


def world_size_px(z: int) -> tuple[int, int]:
  res = GEO_RES0 / (2 ** z)
  return int(round(360 / res)), int(round(180 / res))


def crop_world_image(im: Image.Image, z: int) -> Image.Image:
  w, h = world_size_px(z)
  return im.crop((0, 0, min(w, im.width), min(h, im.height)))


def crop_world_array(arr: np.ndarray, z: int) -> np.ndarray:
  w, h = world_size_px(z)
  return arr[: min(h, arr.shape[0]), : min(w, arr.shape[1])]


def geo_url(layer: str, day: str, z: int, row: int, col: int) -> str:
  return (
    f'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/{layer}/default/'
    f'{day}/250m/{z}/{row}/{col}.jpg'
  )


def merc_url(layer: str, day: str, z: int, row: int, col: int) -> str:
  return (
    f'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/'
    f'{day}/GoogleMapsCompatible_Level9/{z}/{row}/{col}.jpg'
  )


def fetch(url: str, retries: int = 3) -> bytes | None:
  for i in range(retries):
    try:
      with urllib.request.urlopen(url, timeout=60) as r:
        data = r.read()
      return data if data[:2] == b'\xff\xd8' else None
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
      time.sleep(0.35 * (i + 1))
  return None


def tile_mean(data: bytes) -> float:
  im = Image.open(io.BytesIO(data))
  return float(np.asarray(im).mean())


def load_geo_tile(
  cache: Path, layer: str, day: str, z: int, row: int, col: int
) -> tuple[np.ndarray | None, float]:
  """Load one geographic tile. Refetch the last two UTC days so same-day fills are not sticky."""
  path = cache / f'geo_{layer}_{day}_z{z}_{row}_{col}.jpg'
  cached = path.read_bytes() if path.exists() and path.stat().st_size > 800 else None
  recent = dt.date.fromisoformat(day) >= dt.datetime.now(dt.timezone.utc).date() - dt.timedelta(days=RECENT_CACHE_DAYS)
  if recent or cached is None:
    fetched = fetch(geo_url(layer, day, z, row, col))
    if fetched:
      path.write_bytes(fetched)
      data = fetched
    else:
      data = cached
  else:
    data = cached
  if not data:
    return None, 0.0
  im = Image.open(io.BytesIO(data)).convert('RGB')
  if im.size != (TILE_PX, TILE_PX):
    im = im.resize((TILE_PX, TILE_PX), Image.Resampling.BILINEAR)
  arr = np.asarray(im)
  return arr, float(arr.mean())


def find_latest_global_day(max_back: int = 7) -> tuple[str, str]:
  """Newest UTC day whose mid-Atlantic mercator tile is non-black for a preferred layer."""
  today = dt.datetime.now(dt.timezone.utc).date()
  order = [LAYERS[0], LAYERS[2], LAYERS[3], LAYERS[1], LAYERS[4]]
  for back in range(0, max_back + 1):
    day = (today - dt.timedelta(days=back)).isoformat()
    for layer in order:
      data = fetch(merc_url(layer, day, 4, 6, 8), retries=2)
      if data and tile_mean(data) > EMPTY_MEAN:
        return day, layer
  raise SystemExit('no non-empty daily mosaic found in lookback')


def stitch_single(out: Path, cache: Path, z: int, workers: int) -> dict:
  day, layer = find_latest_global_day()
  cols, rows = GEO_EXTENT[z]
  jobs = [(r, c) for r in range(rows) for c in range(cols)]
  mosaic = Image.new('RGB', (cols * TILE_PX, rows * TILE_PX), (0, 0, 0))
  filled = 0

  def one(rc: tuple[int, int]):
    r, c = rc
    arr, mean = load_geo_tile(cache, layer, day, z, r, c)
    return r, c, arr, mean

  with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as ex:
    for r, c, arr, mean in ex.map(one, jobs):
      if arr is None or mean <= EMPTY_MEAN:
        continue
      mosaic.paste(Image.fromarray(arr, 'RGB'), (c * TILE_PX, r * TILE_PX))
      filled += 1

  mosaic = crop_world_image(mosaic, z)
  path = out / f'earth-single-{day}-z{z}.jpg'
  mosaic.save(path, quality=92, optimize=True)
  preview = mosaic.resize((max(1, mosaic.width // 4), max(1, mosaic.height // 4)), Image.Resampling.LANCZOS)
  prev_path = out / f'earth-single-{day}-z{z}-preview.jpg'
  preview.save(prev_path, quality=85, optimize=True)
  return {
    'mode': 'single',
    'date': day,
    'layer': layer,
    'zoom': z,
    'tiles_filled': filled,
    'tiles_total': len(jobs),
    'pixels': f'{mosaic.width}x{mosaic.height}',
    'files': {'mosaic': str(path), 'preview': str(prev_path)},
  }


def pick_latest_tile(
  cache: Path, ref: dt.date, z: int, row: int, col: int, lookback: int
) -> tuple[np.ndarray | None, TilePick | None]:
  best_arr: np.ndarray | None = None
  primary: TilePick | None = None
  # Per-pixel age of the contributor currently painted (lookback+1 = empty).
  age_px: np.ndarray | None = None
  layer_px: np.ndarray | None = None

  for back in range(0, lookback + 1):
    day = (ref - dt.timedelta(days=back)).isoformat()
    for li, layer in enumerate(LAYERS):
      arr, mean = load_geo_tile(cache, layer, day, z, row, col)
      if arr is None or mean <= EMPTY_MEAN:
        continue
      usable = arr.max(axis=2) > HOLE_MAX
      if not usable.any():
        continue
      if best_arr is None:
        best_arr = np.zeros_like(arr)
        age_px = np.full(arr.shape[:2], lookback + 1, dtype=np.int16)
        layer_px = np.full(arr.shape[:2], -1, dtype=np.int8)
      assert age_px is not None and layer_px is not None
      hole = best_arr.max(axis=2) <= HOLE_MAX
      take = usable & hole
      if not take.any() and primary is not None and back > primary.age_days:
        continue
      if primary is None:
        best_arr[usable] = arr[usable]
        age_px[usable] = back
        layer_px[usable] = li
        primary = TilePick(
          row=row, col=col, age_days=back, majority_age_days=back, oldest_age_days=back,
          fill_fraction=0.0, mixed=False, layer=layer, date=day, mean=mean,
        )
      elif back < primary.age_days:
        # Newer day found (should not happen with ascending back); replace.
        best_arr = np.zeros_like(arr)
        age_px = np.full(arr.shape[:2], lookback + 1, dtype=np.int16)
        layer_px = np.full(arr.shape[:2], -1, dtype=np.int8)
        best_arr[usable] = arr[usable]
        age_px[usable] = back
        layer_px[usable] = li
        primary = TilePick(
          row=row, col=col, age_days=back, majority_age_days=back, oldest_age_days=back,
          fill_fraction=0.0, mixed=False, layer=layer, date=day, mean=mean,
        )
      else:
        # Same day other sensor, or older day: fill holes only.
        if take.any():
          best_arr[take] = arr[take]
          age_px[take] = back
          layer_px[take] = li
    if best_arr is not None and primary is not None:
      hole = float((best_arr.max(axis=2) <= HOLE_MAX).mean())
      if hole < 0.02 and primary.age_days <= back:
        break

  if best_arr is None or primary is None or age_px is None or layer_px is None:
    return None, None

  painted = age_px <= lookback
  if not painted.any():
    return None, None
  vals, counts = np.unique(age_px[painted], return_counts=True)
  majority = int(vals[int(counts.argmax())])
  oldest = int(age_px[painted].max())
  fill = float(((age_px != primary.age_days) & painted).mean())
  mixed = fill > 0.02 or bool((layer_px[painted] != LAYERS.index(primary.layer)).any())
  pick = TilePick(
    row=row,
    col=col,
    age_days=primary.age_days,
    majority_age_days=majority,
    oldest_age_days=oldest,
    fill_fraction=round(fill, 4),
    mixed=mixed,
    layer=primary.layer,
    date=primary.date,
    mean=float(best_arr.mean()),
  )
  return best_arr, pick


def stitch_latest(out: Path, cache: Path, z: int, lookback: int, workers: int) -> dict:
  ref = dt.datetime.now(dt.timezone.utc).date()
  cols, rows = GEO_EXTENT[z]
  jobs = [(r, c) for r in range(rows) for c in range(cols)]
  mosaic = np.zeros((rows * TILE_PX, cols * TILE_PX, 3), dtype=np.uint8)
  # Coverage colour uses majority pixel age; picks.json keeps primary/oldest/fill/mixed.
  age_grid = np.full((rows, cols), lookback + 1, dtype=np.int16)
  layer_grid = np.full((rows, cols), -1, dtype=np.int8)
  picks: list[dict] = []
  filled = 0

  def one(rc: tuple[int, int]):
    r, c = rc
    return r, c, *pick_latest_tile(cache, ref, z, r, c, lookback)

  t0 = time.time()
  with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as ex:
    for r, c, arr, pick in ex.map(one, jobs):
      if arr is None or pick is None:
        continue
      mosaic[r * TILE_PX:(r + 1) * TILE_PX, c * TILE_PX:(c + 1) * TILE_PX] = arr
      age_grid[r, c] = pick.majority_age_days
      layer_grid[r, c] = LAYERS.index(pick.layer)
      picks.append(asdict(pick))
      filled += 1
  elapsed = time.time() - t0

  mosaic = crop_world_array(mosaic, z)
  img = Image.fromarray(mosaic, 'RGB')
  path = out / f'earth-latest-{ref.isoformat()}-z{z}.jpg'
  img.save(path, quality=92, optimize=True)
  preview = img.resize((max(1, img.width // 4), max(1, img.height // 4)), Image.Resampling.LANCZOS)
  prev_path = out / f'earth-latest-{ref.isoformat()}-z{z}-preview.jpg'
  preview.save(prev_path, quality=85, optimize=True)

  age_rgb = np.zeros((rows, cols, 3), dtype=np.uint8)
  for r in range(rows):
    for c in range(cols):
      age = int(age_grid[r, c])
      if age > lookback:
        age_rgb[r, c] = (40, 40, 50)
      else:
        t = age / max(1, lookback)
        age_rgb[r, c] = (int(255 * t), int(255 * (1 - t * 0.85)), int(40 * (1 - t)))
  # Crop coverage choropleth to the same world fraction as the mosaic (cell grid).
  world_w, world_h = world_size_px(z)
  cov_cols = max(1, int(round(cols * (world_w / (cols * TILE_PX)))))
  cov_rows = max(1, int(round(rows * (world_h / (rows * TILE_PX)))))
  age_rgb = age_rgb[:cov_rows, :cov_cols]
  cov = Image.fromarray(age_rgb, 'RGB').resize((cov_cols * 48, cov_rows * 48), Image.Resampling.NEAREST)
  cov_path = out / f'earth-coverage-age-{ref.isoformat()}.png'
  cov.save(cov_path)

  age_counts = {str(int(k)): int(v) for k, v in zip(*np.unique(age_grid, return_counts=True))}
  layer_counts = {
    LABEL[LAYERS[i]]: int(c)
    for i, c in zip(*np.unique(layer_grid[layer_grid >= 0], return_counts=True))
  }
  mixed_cells = sum(1 for p in picks if p['mixed'])
  return {
    'mode': 'latest',
    'reference_date': ref.isoformat(),
    'zoom': z,
    'lookback_days': lookback,
    'grid': f'{cols}x{rows}',
    'pixels': f'{img.width}x{img.height}',
    'tiles_filled': filled,
    'tiles_total': len(jobs),
    'mixed_cells': mixed_cells,
    'elapsed_s': round(elapsed, 1),
    'age_counts': age_counts,
    'layer_counts': layer_counts,
    'layers_priority': LAYERS,
    'coverage_age_basis': 'majority_pixel_age',
    'files': {'mosaic': str(path), 'preview': str(prev_path), 'coverage_age': str(cov_path)},
    'picks': picks,
    'caveats': [
      'GIBS daily Corrected Reflectance browse, not a cloud-free monthly composite.',
      'Polar night and persistent gaps can remain black after lookback.',
      'Coverage age is the majority pixel age; picks.json also has oldest_age_days, fill_fraction, mixed.',
      f'Native VIIRS GSD is ~375 m; z{z} samples coarser than that.',
    ],
  }


def main(argv: list[str] | None = None) -> int:
  p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
  p.add_argument('--mode', choices=('latest', 'single'), default='latest')
  p.add_argument(
    '--zoom', type=int, default=5, choices=JPEG_ZOOMS,
    help='GIBS geographic 250m zoom (0–6; higher exceeds JPEG width limits)',
  )
  p.add_argument('--lookback', type=int, default=7)
  p.add_argument('--out', type=Path, default=Path('scratch/earth-mosaic'))
  p.add_argument('--cache', type=Path, default=None)
  p.add_argument('--workers', type=int, default=16)
  args = p.parse_args(argv)

  out: Path = args.out
  out.mkdir(parents=True, exist_ok=True)
  cache = args.cache or (out / 'tiles')
  cache.mkdir(parents=True, exist_ok=True)

  if args.mode == 'single':
    result = stitch_single(out, cache, args.zoom, args.workers)
  else:
    result = stitch_latest(out, cache, args.zoom, args.lookback, args.workers)

  result['generated_at_utc'] = dt.datetime.now(dt.timezone.utc).isoformat()
  result['projection'] = 'EPSG:4326 / CRS84 GIBS TileMatrixSet 250m'
  man = out / 'manifest.json'
  picks = result.pop('picks', None)
  man.write_text(json.dumps(result, indent=2) + '\n')
  if picks is not None:
    (out / 'picks.json').write_text(json.dumps(picks) + '\n')
  print(json.dumps({k: result[k] for k in result if k != 'caveats'}, indent=2))
  print('manifest', man, file=sys.stderr)
  return 0


if __name__ == '__main__':
  raise SystemExit(main())
