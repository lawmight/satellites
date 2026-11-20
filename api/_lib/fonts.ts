/**
 * Static font instances for satori (built by scripts/backend-fonts.py into api/_fonts/).
 *
 * The Worker registers its bundled copies (api/_lib/bundled.ts). Under Node (tests, scripts) they are read from
 * disk next to this module; the cwd-based path is a second chance for runners that relocate the compiled module.
 *
 * Every role's text is split over several files: fontsource's latin and latin-ext subsets of the brand face, and for
 * Cyrillic the faces the web gives Ukrainian (src/styles/scripts.css). satori keeps one face per name, weight and style
 * (a second file under a name it already has is never asked for a glyph), so each file has a name of its own: `<role>`
 * (latin), `<role> Ext` (latin-ext: İ Ş Ğ, Ł ą ę ś ź ż …) and `<role> Cyrillic`. Each role's `fontFamily` names its
 * files in that order (FAMILY), as the web's stacks and unicode-ranges do, and a family a card did not register is
 * skipped. A glyph none of them has is drawn from any other registered font that has it, else from a Noto subset
 * fetched for the card (fallbackFonts.ts).
 *
 * The Cyrillic files are read only for a card that prints Cyrillic or speaks Ukrainian (cardFonts): any other card
 * gets the very list it always had, so it costs nothing more to render.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { bundled } from './bundled.js'
import { LOCALE_INFO, type Locale } from './i18n/locales.js'

export const FONT = {
  display: 'Overflight Display', // Instrument Sans, wdth 75 / wght 560
  sans: 'Overflight Sans', //       Instrument Sans, wdth 100 / wght 400
  mono: 'Overflight Mono', //       Martian Mono, wdth 87.5 / wght 350 (and 500 for the wordmark lockup)
  serif: 'Overflight Serif', //     Instrument Serif italic
} as const

/** The latin-ext files' names (the same faces as the latin ones). */
const EXT_NAME = (name: string) => `${name} Ext`
/** The Cyrillic faces' names: Noto Sans wdth 67.5 / 100, Martian Mono's own Cyrillic, Noto Serif Display italic. */
const CYRILLIC_NAME = (name: string) => `${name} Cyrillic`

/** A role's files, in the order a glyph is looked for in them. */
const stack = (name: string) => `${name}, ${EXT_NAME(name)}, ${CYRILLIC_NAME(name)}`

/**
 * What the card's text is set in (its `fontFamily`): each role's face, its latin-ext file, then its Cyrillic cut.
 * Martian Mono's Cyrillic has every Ukrainian, Russian and Belarusian letter but not Serbian, Macedonian or Kazakh ones
 * (Ђ Ѓ Ѕ Ј Љ Њ Ћ Ќ Џ Ѐ Ѝ Ұ and their small letters): in a mono label those come from the sans cut, regular width, where
 * the web falls to the system's monospace, rather than from the first registered font that has them (the condensed
 * display).
 */
export const FAMILY = {
  display: stack(FONT.display),
  sans: stack(FONT.sans),
  mono: `${stack(FONT.mono)}, ${CYRILLIC_NAME(FONT.sans)}`,
  serif: stack(FONT.serif),
} as const

type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export interface SatoriFont {
  name: string
  data: ArrayBuffer
  weight: Weight
  style: 'normal' | 'italic'
  /** satori's script code, for a fallback font that draws one script (fallbackFonts.ts). */
  lang?: string
}

interface FontFile {
  file: string
  name: string
  weight: Weight
  style: 'normal' | 'italic'
}

const FILES: { stem: string; name: string; weight: Weight; style: 'normal' | 'italic' }[] = [
  { stem: 'display', name: FONT.display, weight: 600, style: 'normal' },
  { stem: 'sans', name: FONT.sans, weight: 400, style: 'normal' },
  { stem: 'mono', name: FONT.mono, weight: 400, style: 'normal' },
  { stem: 'serif-italic', name: FONT.serif, weight: 400, style: 'italic' },
]
const SUBSETS = ['latin', 'latin-ext'] as const
/**
 * Extra single-subset instances: Martian Mono at wght 500 for the OVERFLIGHT lockup (as the HUD
 * wordmark). ASCII only, so latin is enough (built by scratch/polish/fix-share/build-lockup-font.py).
 */
const EXTRA: FontFile[] = [{ file: 'mono-medium-latin.ttf', name: FONT.mono, weight: 500, style: 'normal' }]

/** Every card's fonts: each role's latin file under its name, its latin-ext file under `<role> Ext`. */
const LATIN: FontFile[] = [
  ...SUBSETS.flatMap((subset) => FILES.map((f) => ({ ...f, file: `${f.stem}-${subset}.ttf`, name: subset === 'latin' ? f.name : EXT_NAME(f.name) }))),
  ...EXTRA,
]
/** Added for a card that prints Cyrillic: each role's Cyrillic cut, registered as the role asks for it. */
const CYRILLIC: FontFile[] = FILES.map((f) => ({ ...f, file: `${f.stem}-cyrillic.ttf`, name: CYRILLIC_NAME(f.name) }))

/** Every file the card may read (a host that cannot read api/_fonts registers each of these: worker/index.ts). */
export const FONT_FILES: readonly string[] = [...LATIN, ...CYRILLIC].map((f) => f.file)

async function readFont(file: string): Promise<ArrayBuffer> {
  const registered = bundled(`_fonts/${file}`) // a Worker's copy (bundled.ts)
  if (registered instanceof ArrayBuffer) return registered
  let buf: Buffer
  try {
    buf = await readFile(fileURLToPath(new URL(`../_fonts/${file}`, import.meta.url)))
  } catch {
    buf = await readFile(path.join(process.cwd(), 'api', '_fonts', file))
  }
  // Hand satori an exact ArrayBuffer (Node may pool small Buffers into a larger one).
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

const read = (files: FontFile[]) =>
  Promise.all(files.map(async (f): Promise<SatoriFont> => ({ name: f.name, weight: f.weight, style: f.style, data: await readFont(f.file) })))

/** Read once per warm instance; a transient failure is not pinned for the life of the instance. */
function once(load: () => Promise<SatoriFont[]>): () => Promise<SatoriFont[]> {
  let cached: Promise<SatoriFont[]> | null = null
  return () =>
    (cached ??= load().catch((err) => {
      cached = null
      throw err
    }))
}

/** The card fonts every card has (Latin), read once per warm instance. */
export const loadFonts = once(() => read(LATIN))

/**
 * The same list plus the Cyrillic cuts, its own array (satori keeps a font loader per list): the Latin entries are
 * the very same objects, so their files are read and parsed once.
 */
const loadCyrillicFonts = once(async () => {
  const [latin, cyrillic] = await Promise.all([loadFonts(), read(CYRILLIC)])
  return [...latin, ...cyrillic]
})

/** Cyrillic letters (U+0400–04FF). The cuts hold the basic block the web's do; anything else falls through to Noto. */
const CYRILLIC_TEXT = /[Ѐ-ӿ]/

/** Whether a card in `locale` that prints `text` needs the Cyrillic cuts. */
export function needsCyrillic(locale: Locale, text: string): boolean {
  return LOCALE_INFO[locale].script === 'cyrillic' || CYRILLIC_TEXT.test(text)
}

/** The fonts for one card: what its language and its words need, and nothing more. */
export function cardFonts(locale: Locale, text: string): Promise<SatoriFont[]> {
  return needsCyrillic(locale, text) ? loadCyrillicFonts() : loadFonts()
}
