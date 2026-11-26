#!/usr/bin/env python3
"""
Build the two Devanagari webfonts the Hindi pages use (src/styles/scripts.css), from the Fontsource packages in
devDependencies, into src/assets/fonts/.

Why generated, not imported: Fontsource's Devanagari file of Noto Sans Devanagari is 209 kB (every weight 100-900,
every width 62.5-100, the Vedic extensions and Devanagari Extended). The design uses weights 400-700 and widths 75
(the condensed display, beside Instrument Sans at 75%) to 100 (running text, labels), and Hindi needs only the main
Devanagari block, so we keep exactly that: 119 kB. Both axes stay: a single width would set the hero's Devanagari
wide beside the condensed Latin (or running text condensed), and the two widths as separate files cost more than one
file with the axis. The serif accent is one instance of Noto Serif Devanagari (wght 350, wdth 87.5: the colour and
measure of Instrument Serif's italic beside it), 45 kB. unicode-range keeps both off every page that shows no
Devanagari, and the stacks that name them exist only on Hindi pages, so nobody else downloads them.

The whole block, not the letters Hindi's copy uses today: place names are unbounded (Marathi ळ, Nepali, Sanskrit
conjuncts), and the copy changes. Every layout feature is kept (Devanagari's conjuncts, half forms, reph, the i-matra's
reordering and the matras' positions live in GSUB and GPOS); the dotted circle (U+25CC) too, which a shaper draws under
a mark that has no letter. Subsetting runs before instancing, without lazy loading, or fontTools' instancer trips on
gvar.

The space and no-break space are kept in the sans: mono labels take them from it ('Watched Devanagari Space',
scripts.css), or the space between two Hindi words in a mono slot is Martian Mono's full cell.

Usage: python3 scripts/build-devanagari-fonts.py   (needs: pip install fonttools brotli; npm ci for the sources)
"""
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'assets' / 'fonts'
SRC = ROOT / 'node_modules' / '@fontsource-variable'
# The Devanagari block, ZWNJ / ZWJ (they choose a half form or a full one), the dotted circle, and the two spaces.
UNICODES = [0x0020, 0x00A0] + list(range(0x0900, 0x0980)) + [0x200C, 0x200D, 0x25CC]
SERIF_WGHT = 350
SERIF_WDTH = 87.5


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
    sans = subset_font(SRC / 'noto-sans-devanagari/files/noto-sans-devanagari-devanagari-standard-normal.woff2')
    sans = instancer.instantiateVariableFont(sans, {'wght': (400, 700), 'wdth': (75, 100)})
    save(sans, 'noto-sans-devanagari-wght400-700-wdth75-100.woff2')
    serif = subset_font(SRC / 'noto-serif-devanagari/files/noto-serif-devanagari-devanagari-standard-normal.woff2')
    serif = instancer.instantiateVariableFont(serif, {'wght': SERIF_WGHT, 'wdth': SERIF_WDTH})
    save(serif, f'noto-serif-devanagari-{SERIF_WGHT}-{int(SERIF_WDTH)}.woff2')


if __name__ == '__main__':
    main()
