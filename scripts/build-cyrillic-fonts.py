#!/usr/bin/env python3
"""
Build the Ukrainian serif accent face ('Watched Cyrillic Serif' in src/styles/scripts.css) from the Fontsource package
in devDependencies, into src/assets/fonts/.

Why generated, not imported: the design sets the Cyrillic accent in ONE instance of Noto Serif Display italic, wght 320
and wdth 62.5 (Instrument Serif italic's measure and colour; the share card's satori cut, scripts/backend-fonts.py, is
made at the same values), but Fontsource ships the Cyrillic italic as a variable file of every weight 100-900 and every
width 62.5-100: 65 kB, nearly all of it outlines' deltas that page never draws. Pinned to that one instance it is a
static font a fraction of the size, which the boot preload (vite.config.ts SCRIPT_FONTS) fetches for Ukrainian pages.

Nothing a page shows changes: every glyph, every layout feature (ccmp, locl, kern, mark, mkmk: the combining acute's
placement lives in mark) and the same unicode coverage as the source are kept, and the outlines and advances are the
variable font's own at that instance (rounded to the unit, as a renderer's are); only the variation tables go. The
script checks all three before it writes. The source's timestamp is kept, so a rebuild writes the same bytes.

Usage: python3 scripts/build-cyrillic-fonts.py   (needs: pip install fonttools brotli; npm ci for the source)
"""
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'assets' / 'fonts'
SRC = ROOT / 'node_modules/@fontsource-variable/noto-serif-display/files/noto-serif-display-cyrillic-wdth-italic.woff2'
# The one instance the design uses (scripts.css, and backend-fonts.py's CYRILLIC serif-italic).
LOCATION = {'wght': 320, 'wdth': 62.5}
NAME = 'noto-serif-display-cyrillic-italic-320-62.woff2'


def features(font: TTFont) -> dict[str, set[str]]:
    return {t: {r.FeatureTag for r in font[t].table.FeatureList.FeatureRecord} for t in ('GSUB', 'GPOS') if t in font}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    source = TTFont(SRC, lazy=False)
    before = (dict(source.getBestCmap()), features(source), source.getGlyphOrder())
    font = instancer.instantiateVariableFont(TTFont(SRC, lazy=False), LOCATION, inplace=False, overlap=True)
    assert 'fvar' not in font and 'gvar' not in font, 'not a static instance'
    assert (dict(font.getBestCmap()), features(font), font.getGlyphOrder()) == before, 'coverage, features or glyphs changed'
    font.flavor = 'woff2'
    font.recalcTimestamp = False
    path = OUT / NAME
    font.save(path)
    print(f'{SRC.relative_to(ROOT)}: {SRC.stat().st_size:,} bytes')
    print(f'{path.relative_to(ROOT)}: {path.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
