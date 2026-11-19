/**
 * The serif accent face of a CJK language (scripts/build-accent-fonts.py): only the glyphs of that language's static
 * accents, carried as base64 inside its messages chunk and installed with the FontFace API, so the hero's word for
 * "you" is a real serif on every platform at the cost of a few kB in a chunk that downloads anyway, with no request of
 * its own. Installed before the first render in that language (runtime.startLocale) and swapped on a switch.
 *
 * Declared italic because the accent rules ask for italic: a Latin accent keeps Instrument Serif's real italic, and
 * the CJK glyphs are drawn upright, never slanted (scripts.css also turns synthetic italics off for CJK).
 */
export interface AccentFont {
  /** The characters it covers (for the record) */
  text: string
  unicodeRange: string
  /** The woff2 file, base64 */
  woff2: string
}

/** The family name scripts.css puts in --font-accent for CJK. */
export const ACCENT_FAMILY = 'Watched Accent'

let installed: FontFace | null = null

/** Install a language's accent face (or none), replacing the previous one. Never rejects. */
export async function installAccentFont(font: AccentFont | undefined): Promise<void> {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined' || !document.fonts) return
  if (installed) {
    document.fonts.delete(installed)
    installed = null
  }
  if (!font) return
  try {
    const bytes = Uint8Array.from(atob(font.woff2), (c) => c.charCodeAt(0))
    const face = new FontFace(ACCENT_FAMILY, bytes, { style: 'italic', weight: '400 700', unicodeRange: font.unicodeRange, display: 'swap' })
    await face.load()
    document.fonts.add(face)
    installed = face
  } catch {
    /* the platform serif then the sans draw the accent */
  }
}
