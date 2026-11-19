/**
 * The 'card' namespace for the app: the share card's and share page's English copy. It lives with the server
 * (api/_lib/i18n/card/en.ts), because the Open Graph card and the share page print the same words as the share sheet's
 * preview and PNG, and the server cannot import the app's catalogs.
 *
 * One translation home: a language's card is api/_lib/i18n/card/<locale>.ts, and its app bundle lists that same module
 * as `card` (src/i18n/<locale>/index.ts imports it from there; there is no src/i18n/<locale>/card.ts), so a translator
 * writes the card once and the type checks hold it to this English.
 *
 * The card builders (api/_lib/cardSpec.ts) take the card's locale explicitly and call cardMessages(locale)
 * (api/_lib/i18n/card/index.ts), because they also run on the server. Importing this module installs the app's answer
 * to that call: for the app's active language, the namespace as its loaded bundle has it (msgs), so the preview, the
 * PNG and the post's card words follow the bundle, and `?hl=pseudo` reaches the card like every other namespace. For
 * any other language, or English, the card catalog answers as it does on the server. The share code imports this
 * (src/ui/share/card.ts, links.ts) before it builds a card.
 */
import { currentLocale, msgs, ns } from '../runtime'
import card from '../../../api/_lib/i18n/card/en'
import { provideCardMessages } from '../../../api/_lib/i18n/card/index'

const enCard = ns('card', card)

provideCardMessages((locale) => {
  if (locale !== currentLocale()) return undefined
  const m = msgs(enCard)
  // The bundle has no card (English, or a language without one yet): the card catalog's own table answers.
  return m === enCard ? undefined : m
})

export default enCard
