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
GEO_EXTENT: dict[int, tuple[int, int]] = {
  0: (2, 1),
  1: (3, 2),
  2: (5, 3),
  3: (10, 5),
  4: (20, 10),
  5: (40, 20),
  6: (80, 40),
  7: (160, 80),
  8: (320, 160),
}

TILE_PX = 512
EMPTY_MEAN = 5.0

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
  """Newest usable daily browse tile for one geographic WMTS cell."""

  row: int
  col: int
  age_days: int
  layer: str
  date: str
  mean: float


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
  path = cache / f'geo_{layer}_{day}_z{z}_{row}_{col}.jpg'
  if path.exists() and path.stat().st_size > 800:
    data = path.read_bytes()
  else:
    data = fetch(geo_url(layer, day, z, row, col))
    if data:
      path.write_bytes(data)
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

  path = out / f'earth-single-{day}-z{z}.jpg'
  mosaic.save(path, quality=92, optimize=True)
  preview = mosaic.resize((mosaic.width // 4, mosaic.height // 4), Image.Resampling.LANCZOS)
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
  best: TilePick | None = None
  for back in range(0, lookback + 1):
    day = (ref - dt.timedelta(days=back)).isoformat()
    for layer in LAYERS:
      arr, mean = load_geo_tile(cache, layer, day, z, row, col)
      if arr is None or mean <= EMPTY_MEAN:
        continue
      cand = TilePick(row=row, col=col, age_days=back, layer=layer, date=day, mean=mean)
      if best is None:
        best_arr = arr.copy()
        best = cand
      elif back < best.age_days:
        best_arr = arr.copy()
        best = cand
      elif back == best.age_days:
        mask = best_arr.max(axis=2) <= 8
        if mask.any():
          best_arr[mask] = arr[mask]
      else:
        mask = best_arr.max(axis=2) <= 8
        if mask.any():
          best_arr[mask] = arr[mask]
    if best_arr is not None:
      hole = float((best_arr.max(axis=2) <= 8).mean())
      if hole < 0.02 and best.age_days <= back:
        break
  return best_arr, best


def stitch_latest(out: Path, cache: Path, z: int, lookback: int, workers: int) -> dict:
  ref = dt.datetime.now(dt.timezone.utc).date()
  cols, rows = GEO_EXTENT[z]
  jobs = [(r, c) for r in range(rows) for c in range(cols)]
  mosaic = np.zeros((rows * TILE_PX, cols * TILE_PX, 3), dtype=np.uint8)
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
      age_grid[r, c] = pick.age_days
      layer_grid[r, c] = LAYERS.index(pick.layer)
      picks.append(asdict(pick))
      filled += 1
  elapsed = time.time() - t0

  img = Image.fromarray(mosaic, 'RGB')
  path = out / f'earth-latest-{ref.isoformat()}-z{z}.jpg'
  img.save(path, quality=92, optimize=True)
  preview = img.resize((img.width // 4, img.height // 4), Image.Resampling.LANCZOS)
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
  cov = Image.fromarray(age_rgb, 'RGB').resize((cols * 48, rows * 48), Image.Resampling.NEAREST)
  cov_path = out / f'earth-coverage-age-{ref.isoformat()}.png'
  cov.save(cov_path)

  age_counts = {str(int(k)): int(v) for k, v in zip(*np.unique(age_grid, return_counts=True))}
  layer_counts = {
    LABEL[LAYERS[i]]: int(c)
    for i, c in zip(*np.unique(layer_grid[layer_grid >= 0], return_counts=True))
  }
  return {
    'mode': 'latest',
    'reference_date': ref.isoformat(),
    'zoom': z,
    'lookback_days': lookback,
    'grid': f'{cols}x{rows}',
    'pixels': f'{img.width}x{img.height}',
    'tiles_filled': filled,
    'tiles_total': len(jobs),
    'elapsed_s': round(elapsed, 1),
    'age_counts': age_counts,
    'layer_counts': layer_counts,
    'layers_priority': LAYERS,
    'files': {'mosaic': str(path), 'preview': str(prev_path), 'coverage_age': str(cov_path)},
    'picks': picks,
    'caveats': [
      'GIBS daily Corrected Reflectance browse, not a cloud-free monthly composite.',
      'Polar night and persistent gaps can remain black after lookback.',
      f'Native VIIRS GSD is ~375 m; z{z} samples coarser than that.',
    ],
  }


def main(argv: list[str] | None = None) -> int:
  p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
  p.add_argument('--mode', choices=('latest', 'single'), default='latest')
  p.add_argument('--zoom', type=int, default=5, choices=sorted(GEO_EXTENT))
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
  # picks can be large; keep them in a side file for latest mode
  picks = result.pop('picks', None)
  man.write_text(json.dumps(result, indent=2) + '\n')
  if picks is not None:
    (out / 'picks.json').write_text(json.dumps(picks) + '\n')
  print(json.dumps({k: result[k] for k in result if k != 'caveats'}, indent=2))
  print('manifest', man, file=sys.stderr)
  return 0


if __name__ == '__main__':
  raise SystemExit(main())
