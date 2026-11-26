#!/usr/bin/env python3
"""
Build the Vietnamese pages' webfonts (src/styles/scripts.css, `:root:lang(vi)`) from the Fontsource packages, into
src/assets/fonts/.

Why Vietnamese gets faces of its own: Instrument Sans, Instrument Serif and Martian Mono have no Vietnamese letters
(Ơ ơ Ư ư, Ĩ ĩ Ũ ũ and the 90 letters with a dot below, a hook above or two stacked marks, U+1EA0-1EF9). Left to
fallback, *Việt* was drawn V-i-t in Instrument and ệ in a system face, in the middle of the word. So a Vietnamese page
sets everything, its Latin letters and digits too, in faces that have every one of them, matched to the brand faces:

  sans     Noto Sans, the web's own Fontsource files (wdth 62.5-100, the display at 67.5 as Cyrillic's), and from here
           only `noto-sans-latin-ext-a`: Latin Extended-A and Romanian's ș ț, for a Polish or Czech place name on a
           Vietnamese page (Fontsource's latin-ext file is 290 kB; this cut is 24 kB, and loads only for such a name).
  serif    Noto Serif Display italic at wght 320 / wdth 62.5, the instance the Cyrillic accent uses (Instrument Serif
           italic's measure and colour), as ONE static file: latin, Vietnamese and Latin Extended-A merged.
  mono     JetBrains Mono, the closest mono to Martian Mono that has Vietnamese: at 108.33 % its advance is Martian's at
           87.5 % (0.65 em) and its capitals are as tall, so a label's measure is the English one. Three files
           (latin, Vietnamese, Latin Extended-A), each cut to the CSS weights the site asks for (300-700), with the
           weight axis renamed so that a CSS weight draws the stems Martian Mono draws at that weight (measured below,
           not guessed: JetBrains Mono is lighter, about wght 410 for Martian's 300 and 650 for its 500). Its code
           ligatures (calt: -> as an arrow, => ...) are dropped: a label is prose, not code.

Every layout feature that shapes the letters is kept (ccmp, locl, mark, mkmk, kern). The script fails unless every
Vietnamese letter, upper and lower case, is in each role's files. Fontsource's own files keep their
names and ranges; the ranges of the files built here are the ones scripts.css declares (src/styles/scriptFonts.test.ts
holds the page's stacks to them).

Usage: python3 scripts/build-vietnamese-fonts.py   (needs: pip install fonttools brotli; npm ci for the sources)
"""
from __future__ import annotations

import io
from pathlib import Path

from fontTools import subset
from fontTools.merge import Merger
from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
NM = ROOT / 'node_modules'
OUT = ROOT / 'src' / 'assets' / 'fonts'

# Fontsource's ranges (its CSS), and the Latin Extended-A cut's: U+0100-017F and Romanian's comma-below letters, without
# the Vietnamese letters in that block (they come from the Vietnamese file, which a Vietnamese page loads anyway).
LATIN = [*range(0x0000, 0x0100), 0x0131, 0x0152, 0x0153, 0x02BB, 0x02BC, 0x02C6, 0x02DA, 0x02DC, 0x0304, 0x0308, 0x0329,
         *range(0x2000, 0x2070), 0x20AC, 0x2122, 0x2191, 0x2193, 0x2212, 0x2215, 0xFEFF, 0xFFFD]
VIETNAMESE = [0x0102, 0x0103, 0x0110, 0x0111, 0x0128, 0x0129, 0x0168, 0x0169, 0x01A0, 0x01A1, 0x01AF, 0x01B0, 0x0300, 0x0301,
              0x0303, 0x0304, 0x0308, 0x0309, 0x0323, 0x0329, *range(0x1EA0, 0x1EFA), 0x20AB]
EXT_A = [c for c in [*range(0x0100, 0x0180), *range(0x0218, 0x021C)] if c not in VIETNAMESE]

# Every letter Vietnamese writes, both cases: the check below.
VI_LETTERS = sorted({*'aăâbcdđeêghiklmnoôơpqrstuưvxy', *map(chr, range(0x1EA0, 0x1EFA)), *'àáãảạèéẽẻẹìíĩỉịòóõỏọùúũủụỳýỹỷỵ'})
VI_LETTERS = sorted({c for ch in VI_LETTERS for c in (ch, ch.upper())})

NOTO_SANS = 'node_modules/@fontsource-variable/noto-sans/files/noto-sans-{}-wdth-normal.woff2'
NOTO_SERIF = 'node_modules/@fontsource-variable/noto-serif-display/files/noto-serif-display-{}-wdth-italic.woff2'
JETBRAINS = 'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-{}-wght-normal.woff2'
MARTIAN = 'node_modules/@fontsource-variable/martian-mono/files/martian-mono-latin-standard-normal.woff2'

# The serif accent's one instance (as scripts/build-cyrillic-fonts.py and backend-fonts.py's Cyrillic serif).
SERIF_AT = {'wght': 320, 'wdth': 62.5}
# The mono: Martian Mono's width on the page (font-stretch 87.5 %), JetBrains Mono's size against it (scripts.css
# size-adjust), and the CSS weights the new axis spans (every mono weight the site sets lies in it).
MARTIAN_WDTH = 87.5
MONO_SIZE = 0.65 / 0.6
CSS_WEIGHTS = [300, 350, 400, 450, 500, 600, 700]

LAYOUT = ['ccmp', 'locl', 'mark', 'mkmk', 'kern', 'case', 'frac', 'numr', 'dnom', 'sups', 'subs', 'ordn', 'tnum', 'pnum', 'lnum', 'liga']


def cut(path: str, unicodes: list[int], features: list[str] | None = None) -> TTFont:
    """The source file with only these characters (and the glyphs and rules they need); hinting goes."""
    font = TTFont(ROOT / path, lazy=False)
    opts = subset.Options()
    opts.layout_features = features or ['*']
    opts.name_IDs = ['*']
    opts.name_languages = ['*']
    opts.notdef_outline = True
    opts.glyph_names = False
    opts.hinting = False
    sub = subset.Subsetter(options=opts)
    sub.populate(unicodes=unicodes)
    sub.subset(font)
    return font


def save(font: TTFont, name: str) -> None:
    font.flavor = 'woff2'
    font.recalcTimestamp = False
    path = OUT / name
    font.save(path)
    print(f'  {path.relative_to(ROOT)}: {path.stat().st_size:,} bytes, {len(font.getBestCmap())} characters')


# ── Stem weight ─────────────────────────────────────────────────────────────────────────────


class _Segments(BasePen):
    """An outline as straight segments (curves flattened), enough to find where a horizontal line crosses it."""

    def __init__(self, glyphs):
        super().__init__(glyphs)
        self.segs: list[tuple[tuple[float, float], tuple[float, float]]] = []
        self.cur = self.start = (0.0, 0.0)

    def _moveTo(self, p):
        self.cur = self.start = p

    def _lineTo(self, p):
        self.segs.append((self.cur, p))
        self.cur = p

    def _curveToOne(self, a, b, c):
        p0 = self.cur
        for i in range(1, 17):
            t = i / 16
            self._lineTo(tuple((1 - t) ** 3 * p0[k] + 3 * (1 - t) ** 2 * t * a[k] + 3 * (1 - t) * t * t * b[k] + t ** 3 * c[k] for k in (0, 1)))

    def _qCurveToOne(self, a, b):
        p0 = self.cur
        for i in range(1, 17):
            t = i / 16
            self._lineTo(tuple((1 - t) ** 2 * p0[k] + 2 * (1 - t) * t * a[k] + t * t * b[k] for k in (0, 1)))

    def _closePath(self):
        if self.cur != self.start:
            self._lineTo(self.start)


def stem(font: TTFont, location: dict[str, float]) -> float:
    """The width of H's left stem, at a third of its height, in em: what a weight looks like."""
    inst = instancer.instantiateVariableFont(font, location, inplace=False)
    glyphs = inst.getGlyphSet()
    pen = _Segments(glyphs)
    glyphs[inst.getBestCmap()[ord('H')]].draw(pen)
    top = max(max(a[1], b[1]) for a, b in pen.segs)
    y = top / 3
    xs = sorted(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]) for a, b in pen.segs if (a[1] - y) * (b[1] - y) < 0)
    return (xs[1] - xs[0]) / inst['head'].unitsPerEm


def matched_weights() -> list[tuple[int, float]]:
    """For each CSS weight, the JetBrains Mono weight whose stem, at MONO_SIZE, is Martian Mono's at that weight."""
    martian = TTFont(ROOT / MARTIAN, lazy=False)
    jb = TTFont(ROOT / JETBRAINS.format('latin'), lazy=False)
    axis = next(a for a in jb['fvar'].axes if a.axisTag == 'wght')
    out = []
    for w in CSS_WEIGHTS:
        want = stem(martian, {'wdth': MARTIAN_WDTH, 'wght': w}) / MONO_SIZE
        lo, hi = axis.minValue, axis.maxValue
        for _ in range(24):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if stem(jb, {'wght': mid}) < want else (lo, mid)
        out.append((w, round((lo + hi) / 2, 1)))
    return out


def renamed_weights(font: TTFont, css_to_design: list[tuple[int, float]]) -> None:
    """
    Rename the weight axis: CSS weight w draws the design weight given for it (piecewise linear between the points).
    The font must already span exactly [first design, last design] with its default at the first. fvar then says
    [first CSS, last CSS] and avar maps the new normalised coordinates to the old ones, so the outlines are untouched.
    """
    fvar = font['fvar']
    axis = next(a for a in fvar.axes if a.axisTag == 'wght')
    d0, d1 = css_to_design[0][1], css_to_design[-1][1]
    assert (axis.minValue, axis.defaultValue, axis.maxValue) == (d0, d0, d1), (axis.minValue, axis.defaultValue, axis.maxValue)
    old = font['avar'].segments.get('wght') if 'avar' in font else None

    def through_old(x: float) -> float:
        if not old:
            return x
        pts = sorted(old.items())
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            if x0 <= x <= x1:
                return y0 + (y1 - y0) * (x - x0) / (x1 - x0) if x1 > x0 else y0
        return x

    c0, c1 = css_to_design[0][0], css_to_design[-1][0]
    seg = {-1.0: -1.0, 0.0: 0.0, 1.0: 1.0}
    for css, design in css_to_design[1:-1]:
        seg[round((css - c0) / (c1 - c0), 6)] = round(through_old((design - d0) / (d1 - d0)), 6)
    if 'avar' not in font:
        from fontTools.ttLib import newTable

        font['avar'] = newTable('avar')
        font['avar'].segments = {a.axisTag: {-1.0: -1.0, 0.0: 0.0, 1.0: 1.0} for a in fvar.axes}
    font['avar'].segments['wght'] = dict(sorted(seg.items()))
    axis.minValue, axis.defaultValue, axis.maxValue = float(c0), float(c0), float(c1)
    fvar.instances = []
    if 'STAT' in font:
        del font['STAT']
    font['OS/2'].usWeightClass = c0


def mono(subset_name: str, unicodes: list[int], weights: list[tuple[int, float]], out: str) -> TTFont:
    font = cut(JETBRAINS.format(subset_name), unicodes, LAYOUT)
    font = instancer.instantiateVariableFont(font, {'wght': (weights[0][1], weights[0][1], weights[-1][1])})
    renamed_weights(font, weights)
    save(font, out)
    return font


def serif() -> TTFont:
    """The accent's one instance, latin + Vietnamese + Latin Extended-A, merged into one static file."""
    parts = []
    for name, unicodes in (('latin', LATIN), ('vietnamese', VIETNAMESE), ('latin-ext', EXT_A)):
        inst = instancer.instantiateVariableFont(cut(NOTO_SERIF.format(name), unicodes), SERIF_AT, inplace=False, overlap=True)
        buf = io.BytesIO()
        inst.flavor = None
        inst.save(buf)
        buf.seek(0)
        parts.append(buf)
    font = Merger().merge(parts)
    save(font, 'noto-serif-display-vietnamese-italic-320-62.woff2')
    return font


def has_letters(fonts: list[TTFont], role: str) -> None:
    have = set().union(*(f.getBestCmap() for f in fonts))
    missing = [c for c in VI_LETTERS if ord(c) not in have]
    assert not missing, f'{role}: no glyph for {"".join(missing)}'


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print('sans (Latin Extended-A; latin and Vietnamese are Fontsource\'s own files)')
    ext = cut(NOTO_SANS.format('latin-ext'), EXT_A)
    save(ext, 'noto-sans-latin-ext-a-wdth-normal.woff2')
    has_letters([TTFont(ROOT / NOTO_SANS.format(s)) for s in ('latin', 'vietnamese')], 'sans')
    print('serif')
    has_letters([serif()], 'serif')
    weights = matched_weights()
    print('mono, CSS weight → JetBrains Mono weight:', ', '.join(f'{c} → {d:g}' for c, d in weights))
    fonts = [
        mono('latin', LATIN, weights, 'jetbrains-mono-latin-wght300-700.woff2'),
        mono('vietnamese', VIETNAMESE, weights, 'jetbrains-mono-vietnamese-wght300-700.woff2'),
        mono('latin-ext', EXT_A, weights, 'jetbrains-mono-latin-ext-a-wght300-700.woff2'),
    ]
    has_letters(fonts, 'mono')


if __name__ == '__main__':
    main()
