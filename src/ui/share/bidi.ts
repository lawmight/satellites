/**
 * Arabic on the share card, drawn by the app (the canvas PNG, src/ui/share/card.ts, and its DOM preview,
 * ShareCard.tsx; the server draws right-to-left links in English: api/og.tsx cardLocale).
 *
 * The card is a left-to-right composition in every language: the three renderers agree on where each box is. Inside
 * its box, each text is one paragraph in its own direction, so Arabic reads right to left there. Inside such a
 * paragraph the bidi algorithm turns a trailing percent sign or a clock's zone around ("%81", "EST 11:21") and lets a
 * number after a Latin name join the name ("SENTINEL-2C · 10" with its "م" left behind at the far end). The app's own
 * Arabic catalogs isolate those with LRI…PDI; the card's catalog is plain text, because satori and X take it too
 * (docs/i18n/ar.md §6.2.7). So the app isolates them as it draws, the same way in the PNG and in the preview.
 *
 * Text with no Arabic letter is returned as it is: English and every other card are untouched.
 */
const LRI = '⁦'
const PDI = '⁩'
const ARABIC = /[؀-ۿݐ-ݿࡰ-ࣿﭐ-﷿ﹰ-﻿]/

/** What keeps its own left-to-right order inside an Arabic paragraph, longest first at each position. */
const ISLAND = new RegExp(
  [
    // a clock and its zone: "11:21 EST", "11:21:09 UTC−5"
    String.raw`\d{1,2}:\d{2}(?::\d{2})?(?: (?:UTC|GMT|[A-Z]{2,5})(?:[+−-]\d{1,2}(?::\d{2})?)?)?`,
    // a number with its percent sign: "81%", "≈ 25 %"
    String.raw`(?:≈ ?)?[−-]?\d[\d.,]* ?%`,
    // a Latin name, with the words and numbers that belong to it: "SENTINEL-2C", "Sentinel-2 L2A", "Landsat 9"
    String.raw`[A-Za-z][A-Za-z0-9]*(?:[-.’'][A-Za-z0-9]+)*(?: (?:[A-Za-z][A-Za-z0-9]*|\d+)(?:[-.][A-Za-z0-9]+)*)*`,
  ].join('|'),
  'g',
)

/** `text` with its clocks, percentages and Latin names isolated, when it holds Arabic (else unchanged). */
export function isolateIslands(text: string): string {
  if (!ARABIC.test(text) || text.includes(LRI)) return text
  return text.replace(ISLAND, (m) => LRI + m + PDI)
}

/** The text a paragraph's direction is read from: what lies outside its isolates (as unicode-bidi: plaintext reads it). */
export const outsideIsolates = (text: string) => text.replace(/⁦[^⁩]*(?:⁩|$)/g, '')

/** Every string in a card spec with its islands isolated (the preview's copy of the spec; URLs and ids have no Arabic). */
export function isolateSpec<T>(value: T): T {
  if (typeof value === 'string') return isolateIslands(value) as T
  if (Array.isArray(value)) return value.map(isolateSpec) as T
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, isolateSpec(v)])) as T
  return value
}
