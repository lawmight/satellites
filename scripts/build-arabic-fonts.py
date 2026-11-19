#!/usr/bin/env python3
"""
Build the two Arabic webfonts the Arabic pages use (src/styles/scripts.css), from the Fontsource packages in
devDependencies, into src/assets/fonts/.

Why generated, not imported: Noto Sans Arabic's variable file is 283 kB (every weight 100-900, every width 62.5-100,
Arabic Supplement and Extended, presentation forms). The design only uses weights 400-700 and widths 75-100, and only
the basic Arabic block, so we keep exactly that: 62 kB. Amiri (the serif accent, one word on the hero) is trimmed to
the same block: 74 kB. unicode-range keeps both off every page that shows no Arabic, so nobody else downloads them.

Every layout feature is kept (Arabic shaping lives in GSUB: init/medi/fina/isol, ligatures, marks); subsetting runs
before instancing, without lazy loading, or fontTools' instancer trips on gvar.

Usage: python3 scripts/build-arabic-fonts.py   (needs: pip install fonttools brotli; npm ci for the sources)
"""
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'assets' / 'fonts'
# The basic Arabic block, plus ZWNJ / ZWJ and the directional marks (LRM, RLM) that Arabic text carries, and the space
# and no-break space: mono labels take them from this file ('Watched Arabic Space', scripts.css), or the space between
# two Arabic words in a mono slot is Martian Mono's full cell.
UNICODES = [0x0020, 0x00A0] + list(range(0x0600, 0x0700)) + list(range(0x200C, 0x2010))


def subset_font(src: Path) -> TTFont:
    font = TTFont(src, lazy=False)
    opts = subset.Options()
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.name_languages = ['*']
    opts.notdef_outline = True
    opts.glyph_names = False
    opts.hinting = False
    sub = subset.Subsetter(options=opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    return font


def save(font: TTFont, name: str) -> None:
    font.flavor = 'woff2'
    path = OUT / name
    font.save(path)
    print(f'{path.relative_to(ROOT)}: {path.stat().st_size:,} bytes')


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    noto = subset_font(ROOT / 'node_modules/@fontsource-variable/noto-sans-arabic/files/noto-sans-arabic-arabic-standard-normal.woff2')
    noto = instancer.instantiateVariableFont(noto, {'wght': (400, 700), 'wdth': (75, 100)})
    save(noto, 'noto-sans-arabic-wght400-700-wdth75-100.woff2')
    amiri = subset_font(ROOT / 'node_modules/@fontsource/amiri/files/amiri-arabic-400-normal.woff2')
    save(amiri, 'amiri-400-arabic.woff2')


if __name__ == '__main__':
    main()
