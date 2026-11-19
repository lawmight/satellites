/**
 * The share card's and share page's copy in a given language: cardMessages(locale).
 *
 * Why the locale is always passed in, never read from a store: the same builders run in the browser (the share
 * sheet's preview and PNG, in the sharer's language) and on the server (the Open Graph card and the share page, in
 * the language a link names with `l=`), and the server has no notion of a current language. English (./en.ts) is the
 * source and the type.
 *
 * Each language is translated once, here: ./<locale>.ts, `const xx: CardMessages = { … }`. Two readers take that one
 * file. The server reads it from TABLE below. The app reads it from its own language bundle, which lists this very
 * module as its 'card' namespace (src/i18n/<locale>/index.ts: `card: xx`, imported from here, never a second copy), and
 * answers for the card through the source it installs (src/i18n/en/card.ts): so the preview and the PNG speak exactly
 * what the app's bundle speaks, the dev pseudo-locale included, and the server's card for the same link matches them.
 * Until a language is translated, its locale reads English (never a blank or a key).
 *
 * The browser imports this module too, so the server's translations live in ./server.ts, which only server code imports
 * (api/_lib/share.ts): the app never downloads every language's card (it has its own in its bundle).
 */
import type { Locale } from '../locales.js'
import en from './en.js'

export type { CardWhen, PassFacts, SatName } from './en.js'

/** Every message the card and the share page print, as English has them (a translation must match this type). */
export type CardMessages = typeof en

/** The translated card copy, by locale, as the server prints it (English is the fallback for any locale not listed). */
const TABLE: Partial<Record<Locale, CardMessages>> = { en }

/** The server's translations (./server.ts registers them; the browser never imports that module). */
export function provideServerCards(cards: Partial<Record<Locale, CardMessages>>): void {
  Object.assign(TABLE, cards)
}

/** Where the app's own language bundle answers for the card (undefined: not that language, or nothing loaded). */
export type CardMessageSource = (locale: Locale) => CardMessages | undefined

let appSource: CardMessageSource | undefined

/**
 * The app installs this once (src/i18n/en/card.ts), so a card in the app's language takes its words from the app's
 * loaded bundle. The server never installs one: its cards come from TABLE.
 */
export function provideCardMessages(source: CardMessageSource): void {
  appSource = source
}

export function cardMessages(locale: Locale): CardMessages {
  return appSource?.(locale) ?? TABLE[locale] ?? en
}
