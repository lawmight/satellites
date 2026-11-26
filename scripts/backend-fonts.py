#!/usr/bin/env python3
"""
Build the static fonts the OG card renderer (api/og.tsx, satori) needs.

satori cannot read variable fonts or WOFF2, so we instance the self-hosted variable fonts at the
exact axis positions the design system uses on the web, and write plain TTFs:

  display  Instrument Sans   wdth 75   wght 560   (condensed display headline)
  sans     Instrument Sans   wdth 100  wght 400   (body)
  mono     Martian Mono      wdth 87.5 wght 350   (labels, readouts)
  serif    Instrument Serif  italic 400           (the one human phrase)

Each comes in two files, `latin` and `latin-ext`, mirroring fontsource's subsets. Both carry the role's family name,
but the card registers each file under a name of its own (`<role>`, `<role> Ext`; api/_lib/fonts.ts): satori keeps one
face per name, weight and style and never asks a second file registered under the same name. Each role's stack names
both, so "São Paulo", "Łódź" and "İstanbul" render in the brand faces.

Cyrillic (Ukrainian) gets the faces the web gives it (src/styles/scripts.css), one `-cyrillic` file per role. They carry
the role's family name too, and the card registers them as `<role> Cyrillic`, after the latin files in each stack:

  display  Noto Sans           wdth 67.5 wght 560         size-adjust 95 %    (Instrument's density: its axis stops at 75)
  sans     Noto Sans           wdth 100  wght 400         size-adjust 95 %
  mono     Martian Mono        wdth 87.5 wght 350         (its own Cyrillic: the Latin's design; it has no Serbian,
                                                          Macedonian or Kazakh letters, which the card takes from sans)
  serif    Noto Serif Display  italic, wdth 62.5 wght 320  size-adjust 98.5 %  (Instrument Serif italic's measure and colour)

Each is cut to the web's unicode-range for those faces, so spaces, digits and Latin letters in a Ukrainian line come
from the brand faces exactly as in the browser. The size-adjust is baked in the way the CSS descriptor applies it:
outlines, advances, kerning and line metrics all scaled (to an em of 950 or 985 units, then called 1000 again).

Vietnamese gets the faces the web gives a Vietnamese page (src/styles/scripts.css, scripts/build-vietnamese-fonts.py),
one `-vietnamese` file per role, registered as `<role> Vietnamese`: first in every role's stack on a Vietnamese card (its
Latin letters and digits too, as on the page, so a word is never half in one face), last on any other card (a Vietnamese
place name's letters, which the brand faces lack, then come from here instead of a Google Fonts request):

  display  Noto Sans           wdth 67.5 wght 560         size-adjust 95 %
  sans     Noto Sans           wdth 100  wght 400         size-adjust 95 %
  mono     JetBrains Mono      the web's file at CSS 350  size 108.33 % (Martian Mono's 0.65 em cell)
  serif    Noto Serif Display  italic, wdth 62.5 wght 320  size-adjust 98.5 %  (the web's static file)

Each holds latin, Vietnamese and Latin Extended-A in one file (three instances merged), and the vertical metrics the
web's ascent/descent-override give it: the brand face's, so a line sits where the page and the canvas put it.

Other non-Latin scripts fall through to the dynamic Noto loader (api/_lib/fallbackFonts.ts).

A rebuild keeps each existing file's timestamp (fontTools would stamp the time of the build), so a font whose source
did not change is rewritten byte for byte: `git diff api/_fonts` after a run shows only what really changed.

Usage:  python3 scripts/backend-fonts.py        (writes api/_fonts/*.ttf)
"""
from __future__ import annotations

import io
import pathlib

from fontTools.merge import Merger
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.ttLib.scaleUpem import scale_upem
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
NM = ROOT / "node_modules"
OUT = ROOT / "api" / "_fonts"

SUBSETS = ("latin", "latin-ext")

VARIABLE = [
    # (output stem, family name written into the font, source pattern, axis location)
    ("display", "Overflight Display", "@fontsource-variable/instrument-sans/files/instrument-sans-{s}-standard-normal.woff2", {"wdth": 75, "wght": 560}),
    ("sans", "Overflight Sans", "@fontsource-variable/instrument-sans/files/instrument-sans-{s}-standard-normal.woff2", {"wdth": 100, "wght": 400}),
    ("mono", "Overflight Mono", "@fontsource-variable/martian-mono/files/martian-mono-{s}-standard-normal.woff2", {"wdth": 87.5, "wght": 350}),
]
STATIC = [
    ("serif-italic", "Overflight Serif", "@fontsource/instrument-serif/files/instrument-serif-{s}-400-italic.woff"),
]

NOTO_SANS_CYRILLIC = "@fontsource-variable/noto-sans/files/noto-sans-cyrillic-wdth-normal.woff2"
CYRILLIC = [
    # (output stem, family name, source, axis location, size-adjust): the values of src/styles/scripts.css
    ("display", "Overflight Display", NOTO_SANS_CYRILLIC, {"wdth": 67.5, "wght": 560}, 0.95),
    ("sans", "Overflight Sans", NOTO_SANS_CYRILLIC, {"wdth": 100, "wght": 400}, 0.95),
    ("mono", "Overflight Mono", "@fontsource-variable/martian-mono/files/martian-mono-cyrillic-standard-normal.woff2", {"wdth": 87.5, "wght": 350}, 1),
    ("serif-italic", "Overflight Serif", "@fontsource-variable/noto-serif-display/files/noto-serif-display-cyrillic-wdth-italic.woff2", {"wdth": 62.5, "wght": 320}, 0.985),
]
# The web's unicode-range for these faces (scripts.css, and fontsource's cyrillic subset for Martian Mono).
CYRILLIC_RANGE = [0x0301, *range(0x0400, 0x0460), 0x0490, 0x0491, 0x04B0, 0x04B1, 0x2116]

# Vietnamese: the sources and the web's ranges (scripts/build-vietnamese-fonts.py), and each cut's metrics, in units of
# its em: the brand face's ascent and descent (Instrument Sans, Instrument Serif; the mono's is Martian Mono's plus
# room for a stacked mark on a capital), as scripts.css's overrides set them.
VI_LATIN = [*range(0x0020, 0x007F), *range(0x00A0, 0x0100), 0x0131, 0x0152, 0x0153, 0x02BB, 0x02BC, 0x02C6, 0x02DA, 0x02DC,
            0x0304, 0x0308, 0x0329, *range(0x2000, 0x2070), 0x20AC, 0x2122, 0x2191, 0x2193, 0x2212, 0x2215]
VI_VIETNAMESE = [0x0102, 0x0103, 0x0110, 0x0111, 0x0128, 0x0129, 0x0168, 0x0169, 0x01A0, 0x01A1, 0x01AF, 0x01B0, 0x0300, 0x0301,
                 0x0303, 0x0304, 0x0308, 0x0309, 0x0323, 0x0329, *range(0x1EA0, 0x1EFA), 0x20AB]
VI_EXT_A = [c for c in [*range(0x0100, 0x0180), *range(0x0218, 0x021C)] if c not in VI_VIETNAMESE]
NOTO_SANS = "@fontsource-variable/noto-sans/files/noto-sans-{s}-wdth-normal.woff2"
VI_NOTO_EXT_A = ROOT / "src" / "assets" / "fonts" / "noto-sans-latin-ext-a-wdth-normal.woff2"
VI_MONO = ROOT / "src" / "assets" / "fonts" / "jetbrains-mono-{s}-wght300-700.woff2"
VI_SERIF = ROOT / "src" / "assets" / "fonts" / "noto-serif-display-vietnamese-italic-320-62.woff2"
VIETNAMESE = [
    # (output stem, family name, [(source, unicodes)], axis location, size, (ascent, descent))
    ("display", "Overflight Display", [(NM / NOTO_SANS.format(s="latin"), VI_LATIN), (NM / NOTO_SANS.format(s="vietnamese"), VI_VIETNAMESE), (VI_NOTO_EXT_A, VI_EXT_A)],
     {"wdth": 67.5, "wght": 560}, 0.95, (970, -250)),
    ("sans", "Overflight Sans", [(NM / NOTO_SANS.format(s="latin"), VI_LATIN), (NM / NOTO_SANS.format(s="vietnamese"), VI_VIETNAMESE), (VI_NOTO_EXT_A, VI_EXT_A)],
     {"wdth": 100, "wght": 400}, 0.95, (970, -250)),
    ("mono", "Overflight Mono", [(pathlib.Path(str(VI_MONO).format(s=s)), u) for s, u in (("latin", VI_LATIN), ("vietnamese", VI_VIETNAMESE), ("latin-ext-a", VI_EXT_A))],
     {"wght": 350}, 0.65 / 0.6, (1100, -200)),
    ("serif-italic", "Overflight Serif", [(VI_SERIF, VI_LATIN + VI_VIETNAMESE + VI_EXT_A)], {}, 0.985, (990, -310)),
]

# Tables satori never reads; dropping them keeps the function bundle small.
DROP = ("DSIG", "hdmx", "LTSH", "VDMX", "gasp", "STAT", "MVAR", "HVAR", "avar", "fvar", "gvar", "cvar")


def rename(font: TTFont, family: str) -> None:
    name = font["name"]
    for rec in list(name.names):
        if rec.nameID in (1, 4, 16):
            rec.string = family
        elif rec.nameID == 6:
            rec.string = family.replace(" ", "") + "-Regular"
        elif rec.nameID in (2, 17):
            rec.string = "Regular"


def subset(font: TTFont, codepoints: list[int]) -> None:
    """Keep only these characters (and the glyphs and layout rules they need); hinting goes, satori never hints."""
    opts = Options()
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.name_languages = ["*"]
    opts.notdef_outline = True
    opts.hinting = False
    sub = Subsetter(opts)
    sub.populate(unicodes=codepoints)
    sub.subset(font)


def size_adjust(font: TTFont, factor: float) -> None:
    """CSS size-adjust, baked in: every coordinate and metric scaled by `factor`, the em left as it was."""
    if factor == 1:
        return
    upem = font["head"].unitsPerEm
    scale_upem(font, round(upem * factor))
    font["head"].unitsPerEm = upem


def merged(parts: list[TTFont]) -> TTFont:
    """Static instances of one design's subsets as one font (fontTools.merge reads them from plain sfnt bytes)."""
    if len(parts) == 1:
        return parts[0]
    files = []
    for part in parts:
        buf = io.BytesIO()
        part.flavor = None
        part.save(buf)
        buf.seek(0)
        files.append(buf)
    return Merger().merge(files)


def line_metrics(font: TTFont, ascent: int, descent: int) -> None:
    """Every table's ascent and descent set to these (font units), the line gap to none: CSS's metric overrides."""
    hhea, os2 = font["hhea"], font["OS/2"]
    hhea.ascent, hhea.descent, hhea.lineGap = ascent, descent, 0
    os2.sTypoAscender, os2.sTypoDescender, os2.sTypoLineGap = ascent, descent, 0
    os2.usWinAscent, os2.usWinDescent = ascent, -descent
    os2.fsSelection |= 1 << 7  # USE_TYPO_METRICS


def finish(font: TTFont, family: str, out: pathlib.Path) -> None:
    for tag in DROP:
        if tag in font:
            del font[tag]
    font.flavor = None  # plain sfnt (TTF/OTF), what satori/opentype.js accept
    rename(font, family)
    # The existing file's timestamp, so an unchanged font is rewritten byte for byte (a new file keeps its source's).
    font.recalcTimestamp = False
    old = out.read_bytes() if out.exists() else None
    if old is not None:
        with TTFont(io.BytesIO(old)) as prev:
            font["head"].modified = prev["head"].modified
    buf = io.BytesIO()
    font.save(buf)
    data = buf.getvalue()
    out.write_bytes(data)
    print(f"  {out.relative_to(ROOT)}  {len(data) / 1024:.1f} KB{'  (unchanged)' if data == old else ''}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for stem, family, pattern, loc in VARIABLE:
        for s in SUBSETS:
            src = NM / pattern.format(s=s)
            font = TTFont(src)
            # updateFontNames would need STAT names; we rename ourselves.
            inst = instantiateVariableFont(font, loc, inplace=False, overlap=True)
            finish(inst, family, OUT / f"{stem}-{s}.ttf")
    for stem, family, pattern in STATIC:
        for s in SUBSETS:
            src = NM / pattern.format(s=s)
            finish(TTFont(src), family, OUT / f"{stem}-{s}.ttf")
    for stem, family, src, loc, adjust in CYRILLIC:
        inst = instantiateVariableFont(TTFont(NM / src), loc, inplace=False, overlap=True)
        subset(inst, CYRILLIC_RANGE)
        size_adjust(inst, adjust)
        finish(inst, family, OUT / f"{stem}-cyrillic.ttf")
    for stem, family, sources, loc, adjust, (asc, desc) in VIETNAMESE:
        parts = []
        for src, codepoints in sources:
            font = TTFont(src)
            font = instantiateVariableFont(font, loc, inplace=False, overlap=True) if "fvar" in font else font
            subset(font, codepoints)
            parts.append(font)
        font = merged(parts)
        size_adjust(font, adjust)
        line_metrics(font, asc, desc)
        finish(font, family, OUT / f"{stem}-vietnamese.ttf")


if __name__ == "__main__":
    main()
