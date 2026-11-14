#!/usr/bin/env python3
"""
Stitch the latest daily true-color Earth from NASA GIBS geographic tiles.

WMS renders every request on demand and does not cache it. On 2026-11-12 that
path slowed from under a second to tens of seconds. A Sentinel-2 global search
is a different scene, orbit, and cloud state in every 100 km square, and the
archive pages out before it covers a desert. GIBS already publishes each day
of VIIRS and MODIS corrected reflectance as pre-cut geographic WMTS tiles.
This script downloads those tiles and stitches them.

The matrix is EPSG:4326 TileMatrixSet 250m. It is not the power-of-two web
mercator pyramid. Zoom 5 is 40 by 20 tiles of 512 px, and that grid is exactly
360 by 180 degrees. Lower zooms pad past the antimeridian and the south pole.
The saved image is cropped back to the world using the level's scale.

A cell with no data is HTTP 404, or HTTP 200 with a black JPEG. Mean brightness
at or below 5 is empty.

TilePick is one cell. It records the newest non-black tile in the lookback,
in layer priority order, and holds the pixels after same-day then older
sensors fill the remaining black. The site still crops one place at a time.
Nothing under src/ imports this script.

Usage, from the repo root:
  python3 scripts/earth-latest-mosaic.py --help
  python3 scripts/earth-latest-mosaic.py
  python3 scripts/earth-latest-mosaic.py --zoom 2 --mode latest --lookback 3 --out /tmp/earth-mosaic-smoke
  npm run earth:mosaic
"""
import argparse
import datetime as dt
import io
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageStat

Image.MAX_IMAGE_PIXELS = None

# EPSG:4326 TileMatrixSet 250m, from WMTSCapabilities.xml on 2026-11-14.
# Columns then rows. TopLeftCorner is -180 90. Each tile is 512 px.
# Level 0 scale denominator 223632905.6114871 is exactly 0.5625 deg/px.
MATRIX: dict[int, tuple[int, int]] = {
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
DEG_PER_PX_Z0 = 0.5625
# A single JPEG cannot store zoom 7 (81920 px) or zoom 8.
JPEG_MAX_PX = 65500
# One threshold for a whole tile and for a pixel. GIBS answers "no data" with a black JPEG.
EMPTY_MEAN = 5
# A finished NOAA-20 day on this grid was 0.875 non-black at zoom 4 on 2026-11-13.
# An unpublished day is 0. The cut sits between those two.
SOLID_DAY_FRACTION = 0.70
USER_AGENT = 'watched-earth-mosaic/1.0'
HOLE_LUT = [255 if i <= EMPTY_MEAN else 0 for i in range(256)]
EQUATOR_KM = 40075.017

# Priority is list order. Same day, the first layer with pixels wins the cell.
LAYERS: tuple[tuple[str, str], ...] = (
    ('VIIRS_NOAA20_CorrectedReflectance_TrueColor', 'NOAA-20'),
    ('VIIRS_NOAA21_CorrectedReflectance_TrueColor', 'NOAA-21'),
    ('MODIS_Aqua_CorrectedReflectance_TrueColor', 'Aqua'),
    ('MODIS_Terra_CorrectedReflectance_TrueColor', 'Terra'),
    ('VIIRS_SNPP_CorrectedReflectance_TrueColor', 'SNPP'),
)
LABELS = {layer_id: label for layer_id, label in LAYERS}

CAVEATS = [
    'This is the latest GIBS daily true-color browse product, not a cloud-free monthly composite.',
    'Polar night and persistent swath gaps can remain black after the lookback.',
    'Clouds in the mosaic are the clouds in the source tiles.',
    'A missing day is HTTP 404. An empty swath is HTTP 200 with a black JPEG. Mean brightness at or below 5 counts as empty.',
    'Tiles are the pre-cut EPSG:4326 250m set. The script does not call WMS, and it does not search Sentinel-2.',
    'Some zooms pad past 180 degrees. The mosaic is cropped to the world using 0.5625 deg/px at level 0.',
]


@dataclass
class TilePick:
    """Newest usable daily tile for one geographic cell, plus the filled pixels."""

    row: int
    col: int
    age_days: int
    oldest_age_days: int
    mixed: bool
    layer_id: str
    date: str
    mean_brightness: float
    pixels: Image.Image | None


def world_px(z: int) -> tuple[int, int]:
    """Width and height of 360 by 180 degrees at this zoom, in pixels."""
    deg = DEG_PER_PX_Z0 / (2 ** z)
    return int(round(360 / deg)), int(round(180 / deg))


def deg_per_px(z: int) -> float:
    return DEG_PER_PX_Z0 / (2 ** z)


def crop_to_world(im: Image.Image, z: int) -> Image.Image:
    """Drop the matrix padding east of 180 and south of -90."""
    width, height = world_px(z)
    width = min(width, im.size[0])
    height = min(height, im.size[1])
    if (width, height) == im.size:
        return im
    cropped = im.crop((0, 0, width, height))
    im.close()
    return cropped


def tile_url(layer_id: str, day: str, z: int, row: int, col: int) -> str:
    # The capabilities template ends in .jpeg. .jpg returns the same bytes.
    return (
        'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/'
        f'{layer_id}/default/{day}/250m/{z}/{row}/{col}.jpeg'
    )


def cache_path(cache: Path, layer_id: str, day: str, z: int, row: int, col: int) -> Path:
    return cache / layer_id / day / str(z) / f'{row}_{col}.jpeg'


def day_list(reference: dt.date, lookback: int) -> list[tuple[int, str]]:
    return [(age, (reference - dt.timedelta(days=age)).isoformat()) for age in range(lookback + 1)]


def fetch_jpeg(url: str) -> bytes | None:
    """Return JPEG bytes, or None for 404 and for a body that is not a JPEG."""
    delay = 0.4
    last = 'error'
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT, 'Accept': 'image/jpeg'})
            with urllib.request.urlopen(req, timeout=45) as res:
                data = res.read()
            if data[:2] != b'\xff\xd8':
                return None
            return data
        except urllib.error.HTTPError as err:
            if err.code == 404:
                return None
            last = f'HTTP {err.code}'
            if err.code not in (429, 500, 502, 503, 504):
                print(f'{last} {url}', file=sys.stderr)
                return None
        except TimeoutError as err:
            # Public archives: timed-out requests are not asked again (CLAUDE.md).
            print(f'timeout {url} {err}', file=sys.stderr)
            return None
        except urllib.error.URLError as err:
            if isinstance(err.reason, TimeoutError) or 'timed out' in str(err.reason).lower():
                print(f'timeout {url} {err}', file=sys.stderr)
                return None
            last = str(err)
        except (ConnectionError, OSError) as err:
            last = str(err)
        if attempt < 2:
            time.sleep(delay)
            delay *= 2
    print(f'fetch failed {url} {last}', file=sys.stderr)
    return None


def open_rgb(data: bytes) -> Image.Image | None:
    try:
        with Image.open(io.BytesIO(data)) as im:
            rgb = im.convert('RGB')
    except (OSError, ValueError):
        return None
    if rgb.size != (TILE_PX, TILE_PX):
        rgb.close()
        return None
    return rgb


def luma_stats(im: Image.Image) -> tuple[int, float, int]:
    gray = im.convert('L')
    lo, hi = gray.getextrema()
    mean = float(ImageStat.Stat(gray).mean[0])
    return int(lo), mean, int(hi)


def has_holes(im: Image.Image) -> bool:
    return im.convert('L').getextrema()[0] <= EMPTY_MEAN


def fill_holes(base: Image.Image, donor: Image.Image) -> Image.Image:
    """Paint donor pixels into base where base is at or below the empty threshold."""
    mask = base.convert('L').point(HOLE_LUT)
    if mask.getextrema()[1] == 0:
        return base
    filled = Image.composite(donor, base, mask)
    base.close()
    return filled


def store_jpeg(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + f'.{os.getpid()}.tmp')
    try:
        tmp.write_bytes(data)
        os.replace(tmp, path)
    except OSError as err:
        tmp.unlink(missing_ok=True)
        print(f'cache write failed {path} {err}', file=sys.stderr)


def load_image(
    cache: Path, layer_id: str, day: str, z: int, row: int, col: int, use_cache: bool,
) -> Image.Image | None:
    # The reference day can still be publishing, so it is never read from cache.
    # Older days stay as they were written.
    path = cache_path(cache, layer_id, day, z, row, col)
    if use_cache and path.exists():
        im = open_rgb(path.read_bytes())
        if im is not None:
            return im
        path.unlink(missing_ok=True)
    data = fetch_jpeg(tile_url(layer_id, day, z, row, col))
    if data is None:
        return None
    im = open_rgb(data)
    if im is None:
        return None
    if use_cache:
        store_jpeg(path, data)
    return im


def empty_age(lookback: int) -> int:
    return lookback + 1


def blank_pick(row: int, col: int, lookback: int, mean: float = 0.0) -> TilePick:
    age = empty_age(lookback)
    return TilePick(row, col, age, age, False, '', '', mean, None)


def pick_latest(
    cache: Path, z: int, row: int, col: int, days: list[tuple[int, str]], lookback: int,
) -> TilePick:
    """Newest non-black sample, then same-day and older samples fill black pixels."""
    base: Image.Image | None = None
    base_mean = 0.0
    base_layer = ''
    base_date = ''
    base_age = 0
    oldest_age = 0
    mixed = False
    # Donors that arrived before a usable base (partially empty early tiles).
    prior: list[tuple[Image.Image, int, str]] = []

    def finish() -> TilePick:
        assert base is not None
        return TilePick(row, col, base_age, oldest_age, mixed, base_layer, base_date, base_mean, base)

    def absorb(donor: Image.Image, donor_age: int, donor_layer: str) -> None:
        nonlocal base, oldest_age, mixed
        assert base is not None
        if not has_holes(base):
            return
        before = base.convert('L').point(HOLE_LUT).getextrema()[1]
        base = fill_holes(base, donor)
        after = base.convert('L').point(HOLE_LUT).getextrema()[1]
        if before > 0 and after < before:
            oldest_age = max(oldest_age, donor_age)
            if donor_age != base_age or donor_layer != base_layer:
                mixed = True

    for age, day in days:
        for layer_id, _label in LAYERS:
            im = load_image(cache, layer_id, day, z, row, col, use_cache=age > 0)
            if im is None:
                continue
            _lo, mean, hi = luma_stats(im)
            if base is None:
                if mean <= EMPTY_MEAN:
                    if hi > EMPTY_MEAN:
                        prior.append((im, age, layer_id))
                    else:
                        im.close()
                    continue
                base = im
                base_mean = mean
                base_layer = layer_id
                base_date = day
                base_age = age
                oldest_age = age
                for donor, donor_age, donor_layer in prior:
                    absorb(donor, donor_age, donor_layer)
                    donor.close()
                prior.clear()
                if not has_holes(base):
                    return finish()
                continue
            if hi > EMPTY_MEAN:
                absorb(im, age, layer_id)
            im.close()
            if not has_holes(base):
                return finish()

    for donor, _donor_age, _donor_layer in prior:
        donor.close()
    if base is None:
        return blank_pick(row, col, lookback)
    return finish()


def run_latest(
    cache: Path, z: int, rows: int, cols: int, days: list[tuple[int, str]], lookback: int, workers: int,
) -> list[TilePick]:
    cells = [(r, c) for r in range(rows) for c in range(cols)]
    total = len(cells)
    picks: list[TilePick] = []
    done = 0
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(pick_latest, cache, z, r, c, days, lookback) for r, c in cells]
        for fut in as_completed(futures):
            pick = fut.result()
            picks.append(pick)
            done += 1
            if done == 1 or done == total or done % 25 == 0:
                who = LABELS.get(pick.layer_id, 'empty')
                print(f'{done}/{total} row {pick.row} col {pick.col} {who} {pick.date or "-"} age {pick.age_days}')
    return picks


def read_cell(
    cache: Path, layer_id: str, day: str, age: int, z: int, row: int, col: int, lookback: int,
) -> TilePick:
    im = load_image(cache, layer_id, day, z, row, col, use_cache=age > 0)
    if im is None:
        return blank_pick(row, col, lookback)
    _lo, mean, _hi = luma_stats(im)
    if mean <= EMPTY_MEAN:
        empty = empty_age(lookback)
        return TilePick(row, col, empty, empty, False, '', '', mean, im)
    return TilePick(row, col, age, age, False, layer_id, day, mean, im)


def fetch_day(
    cache: Path, layer_id: str, day: str, age: int, z: int, rows: int, cols: int, lookback: int, workers: int,
) -> list[TilePick]:
    cells = [(r, c) for r in range(rows) for c in range(cols)]
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(read_cell, cache, layer_id, day, age, z, r, c, lookback) for r, c in cells]
        return [fut.result() for fut in futures]


def close_pixels(picks: list[TilePick]) -> None:
    for pick in picks:
        if pick.pixels is not None:
            pick.pixels.close()
            pick.pixels = None


def non_black_fraction(picks: list[TilePick]) -> float:
    if not picks:
        return 0.0
    return sum(1 for pick in picks if pick.layer_id) / len(picks)


def run_single(
    cache: Path, z: int, rows: int, cols: int, days: list[tuple[int, str]], lookback: int, workers: int,
) -> tuple[list[TilePick], dict]:
    """NOAA-20 on the newest day in the lookback that covers the grid."""
    layer_id, label = LAYERS[0]
    best: list[TilePick] | None = None
    best_frac = -1.0
    best_meta: dict = {}
    for age, day in days:
        picks = fetch_day(cache, layer_id, day, age, z, rows, cols, lookback, workers)
        frac = non_black_fraction(picks)
        print(f'{label} {day} non-black {round(frac, 3)}')
        if frac > best_frac:
            if best is not None:
                close_pixels(best)
            best = picks
            best_frac = frac
            best_meta = {
                'single_layer': layer_id,
                'single_label': label,
                'single_date': day,
                'single_age_days': age,
                'single_non_black_fraction': round(frac, 4),
                'single_day_solid': frac >= SOLID_DAY_FRACTION,
            }
        else:
            close_pixels(picks)
        if frac >= SOLID_DAY_FRACTION:
            break
    assert best is not None
    return best, best_meta


def render_mosaic(picks: list[TilePick], rows: int, cols: int) -> Image.Image:
    canvas = Image.new('RGB', (cols * TILE_PX, rows * TILE_PX), (0, 0, 0))
    for pick in picks:
        if pick.pixels is None:
            continue
        canvas.paste(pick.pixels, (pick.col * TILE_PX, pick.row * TILE_PX))
        pick.pixels.close()
        pick.pixels = None
    return canvas


def age_color(age: int, lookback: int) -> tuple[int, int, int]:
    if age > lookback:
        return (22, 24, 28)
    if lookback <= 0:
        return (42, 168, 74)

    def mix(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
        return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

    t = age / lookback
    if t <= 0.5:
        return mix((42, 168, 74), (232, 196, 48), t / 0.5)
    return mix((232, 196, 48), (176, 48, 42), (t - 0.5) / 0.5)


def render_coverage(picks: list[TilePick], rows: int, cols: int, z: int, lookback: int) -> Image.Image:
    cell = max(8, min(36, 720 // max(1, cols)))
    map_w = cols * cell
    map_h = rows * cell
    chart = Image.new('RGB', (map_w, map_h), (12, 14, 18))
    draw = ImageDraw.Draw(chart)
    gap = 1 if cell >= 8 else 0
    for pick in picks:
        x0 = pick.col * cell
        y0 = pick.row * cell
        color = age_color(pick.age_days, lookback)
        draw.rectangle((x0, y0, x0 + cell - 1 - gap, y0 + cell - 1 - gap), fill=color)
    world_w, world_h = world_px(z)
    keep_w = min(map_w, int(round(map_w * world_w / (cols * TILE_PX))))
    keep_h = min(map_h, int(round(map_h * world_h / (rows * TILE_PX))))
    chart = chart.crop((0, 0, max(1, keep_w), max(1, keep_h)))
    legend_h = 48
    width = max(chart.size[0], 380)
    im = Image.new('RGB', (width, chart.size[1] + legend_h), (12, 14, 18))
    im.paste(chart, (0, 0))
    legend = ImageDraw.Draw(im)
    font = ImageFont.load_default()
    swatches: list[tuple[int, str]] = [(0, '0 days')]
    if lookback > 0:
        swatches.append((lookback, f'{lookback} days'))
    swatches.append((empty_age(lookback), 'none'))
    x = 8
    y = chart.size[1] + 14
    for age, text in swatches:
        legend.rectangle((x, y, x + 18, y + 18), fill=age_color(age, lookback))
        legend.text((x + 24, y + 4), text, fill=(230, 230, 230), font=font)
        x += 120
    chart.close()
    return im


def counts(picks: list[TilePick]) -> tuple[dict[str, int], dict[str, int]]:
    ages: dict[str, int] = {}
    layers: dict[str, int] = {}
    for pick in picks:
        key = str(pick.age_days)
        ages[key] = ages.get(key, 0) + 1
        if pick.layer_id:
            label = LABELS.get(pick.layer_id, pick.layer_id)
            layers[label] = layers.get(label, 0) + 1
    ages = {key: ages[key] for key in sorted(ages, key=int)}
    layers = {label: layers[label] for _layer_id, label in LAYERS if label in layers}
    return ages, layers


def atomic_bytes(path: Path, put) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + f'.{os.getpid()}.tmp')
    try:
        put(tmp)
        os.replace(tmp, path)
    except Exception:
        tmp.unlink(missing_ok=True)
        raise


def write_outputs(out: Path, mosaic: Image.Image, coverage: Image.Image, manifest: dict) -> tuple[Path, Path, Path]:
    mosaic_path = out / 'mosaic.jpg'
    coverage_path = out / 'coverage.png'
    manifest_path = out / 'manifest.json'

    def save_mosaic(tmp: Path) -> None:
        mosaic.save(tmp, format='JPEG', quality=90)

    def save_coverage(tmp: Path) -> None:
        coverage.save(tmp, format='PNG')

    def save_manifest(tmp: Path) -> None:
        tmp.write_text(json.dumps(manifest, indent=2) + '\n')

    atomic_bytes(mosaic_path, save_mosaic)
    atomic_bytes(coverage_path, save_coverage)
    manifest['files'] = {
        'mosaic': str(mosaic_path.resolve()),
        'coverage': str(coverage_path.resolve()),
        'manifest': str(manifest_path.resolve()),
    }
    atomic_bytes(manifest_path, save_manifest)
    return mosaic_path, coverage_path, manifest_path


def parse_args(argv: list[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--mode', choices=('latest', 'single'), default='latest')
    parser.add_argument('--zoom', type=int, default=5, choices=sorted(MATRIX))
    parser.add_argument('--lookback', type=int, default=7)
    parser.add_argument('--out', type=Path, default=Path(os.environ.get('EARTH_MOSAIC_OUT', 'scratch/earth-mosaic')))
    parser.add_argument('--cache', type=Path, default=None)
    parser.add_argument('--workers', type=int, default=16)
    parser.add_argument('--date', default=None, help='Reference UTC day YYYY-MM-DD. Default is today.')
    args = parser.parse_args(argv)
    if args.lookback < 0 or args.lookback > 60:
        parser.error('--lookback must be from 0 to 60')
    if args.workers < 1 or args.workers > 64:
        parser.error('--workers must be from 1 to 64')
    width, height = world_px(args.zoom)
    if width > JPEG_MAX_PX or height > JPEG_MAX_PX:
        parser.error(
            f'zoom {args.zoom} is {width} by {height} px. A JPEG stops near {JPEG_MAX_PX} px. Use zoom 6 or lower.'
        )
    if args.date:
        try:
            args.reference = dt.date.fromisoformat(args.date)
        except ValueError:
            parser.error('--date must be YYYY-MM-DD')
    else:
        args.reference = dt.datetime.now(dt.timezone.utc).date()
    if args.cache is None:
        args.cache = args.out / 'cache'
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    cols, rows = MATRIX[args.zoom]
    days = day_list(args.reference, args.lookback)
    args.out.mkdir(parents=True, exist_ok=True)
    args.cache.mkdir(parents=True, exist_ok=True)
    print(
        f'mode {args.mode} zoom {args.zoom} grid {cols}x{rows} '
        f'lookback {args.lookback} reference {args.reference.isoformat()}'
    )
    started = time.perf_counter()
    extra: dict = {}
    if args.mode == 'single':
        picks, extra = run_single(args.cache, args.zoom, rows, cols, days, args.lookback, args.workers)
    else:
        picks = run_latest(args.cache, args.zoom, rows, cols, days, args.lookback, args.workers)
    age_counts, layer_counts = counts(picks)
    picked = sum(layer_counts.values())
    mixed_cells = sum(1 for pick in picks if pick.mixed)
    mosaic = crop_to_world(render_mosaic(picks, rows, cols), args.zoom)
    coverage = render_coverage(picks, rows, cols, args.zoom, args.lookback)
    cells = [
        {
            'row': pick.row,
            'col': pick.col,
            'age_days': pick.age_days,
            'oldest_age_days': pick.oldest_age_days,
            'mixed': pick.mixed,
            'layer': LABELS.get(pick.layer_id, pick.layer_id),
            'date': pick.date,
            'mean': round(pick.mean_brightness, 2),
        }
        for pick in picks
    ]
    manifest = {
        'generated_at_utc': dt.datetime.now(dt.timezone.utc).isoformat(),
        'reference_date': args.reference.isoformat(),
        'mode': args.mode,
        'method': (
            'One NOAA-20 day, the newest in the lookback whose non-black share reaches 0.70.'
            if args.mode == 'single'
            else (
                'Per geographic WMTS tile, the newest non-black JPEG across the daily '
                'Corrected Reflectance layers, then same-day and older sensors fill residual black pixels.'
            )
        ),
        'projection': 'EPSG:4326 / CRS84 GIBS TileMatrixSet 250m',
        'zoom': args.zoom,
        'grid': f'{cols}x{rows}',
        'tile_px': TILE_PX,
        'grid_pixels': f'{cols * TILE_PX}x{rows * TILE_PX}',
        'pixels': f'{mosaic.width}x{mosaic.height}',
        'deg_per_px': round(deg_per_px(args.zoom), 6),
        'equator_km_per_px': round(deg_per_px(args.zoom) * (EQUATOR_KM / 360), 3),
        'lookback_days': args.lookback,
        'empty_mean_brightness_max': EMPTY_MEAN,
        'layers_priority': [layer_id for layer_id, _label in LAYERS],
        'age_counts': age_counts,
        'layer_counts': layer_counts,
        'picked_tiles': picked,
        'empty_tiles': len(picks) - picked,
        'mixed_cells': mixed_cells,
        'coverage_age_basis': 'newest_tile_in_cell',
        'cells': cells,
        'elapsed_s': round(time.perf_counter() - started, 1),
        'caveats': CAVEATS + [
            'Coverage colour uses the newest tile that started the cell. cells[].oldest_age_days and mixed mark gap-fill.',
        ],
    }
    manifest.update(extra)
    mosaic_path, coverage_path, manifest_path = write_outputs(args.out, mosaic, coverage, manifest)
    mosaic.close()
    coverage.close()
    print(f'age_counts {json.dumps(age_counts)}')
    print(f'layer_counts {json.dumps(layer_counts)}')
    print(f'mosaic {mosaic_path}')
    print(f'coverage {coverage_path}')
    print(f'manifest {manifest_path}')
    if picked == 0:
        print('no imagery found', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
