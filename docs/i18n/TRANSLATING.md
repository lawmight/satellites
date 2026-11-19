# Translating Watched

How a language's copy is written and checked. Read `docs/I18N.md` (the system) and your language's style guide
(`docs/i18n/<locale>.md`: register, voice, the key lines, glossary, grammar for inserted names and counts, typography,
length, sensitive content, pitfalls) before writing a word. The guide is the authority: if this page and the guide
disagree on language, the guide wins.

## What to translate

Every English namespace `src/i18n/en/<namespace>.ts` becomes `src/i18n/<locale>/<namespace>.ts`, and the share card's
copy `api/_lib/i18n/card/en.ts` becomes `api/_lib/i18n/card/<locale>.ts`. `src/i18n/<locale>/index.ts` gathers the
namespaces into the language's bundle; `src/i18n/<locale>/boot.ts` holds the three strings the loading screen shows
before the app runs (`loading`, `slow`, `title`).

```ts
// src/i18n/de/landing.ts
/** German copy for the landing (see docs/i18n/de.md). */
import type en from '../en/landing'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('de')

const landing: typeof en = {
  search: 'Ort suchen',
  hero: [['Etwas hat ', accent('dich')], ['diese Woche'], ['beobachtet.']] as Rich[],
  matches: (n: number) => f.plural(n, { one: `${f.int(n)} Treffer`, other: `${f.int(n)} Treffer` }),
}
export default landing
```

The file is typed against English (`typeof en`): a missing key, an extra key or a wrong parameter is a compile error.

## Rules

- **Translate the meaning and the voice, not the words.** Each English message is a complete thought; rebuild it the
  way a native writer of your language would, following the guide's register and glossary. Never calque English
  structure, never add politeness, marketing or exclamation the English doesn't have.
- **Keep every slot and its meaning.** Parameters are raw values: format numbers with `fmt('<locale>')` (`int`, `dec`),
  counts with `f.plural` and every category your language has, dates with `api/_lib/i18n/dates.ts` (never a hand-made
  month table). A slot's value may be anything the doc comment says (an arbitrary place name in Latin, Cyrillic or Han;
  a satellite name like "Sentinel-2C"): the sentence must be grammatical for all of them, without inflecting them.
- **Rich messages keep their parts.** A message that returns parts keeps the same kinds of parts (`num`, `accent`,
  `strong`), in the order your language needs; the accent is still the one human moment, emphasis still the phrase that
  carries the meaning. Never drop or add an accent.
- **Constraints are real.** A key whose comment says "chip", "mono caps", "one line on a phone" or a length must fit:
  shorten by choosing a better word, never by an abbreviation your readers would not use. Mono labels are written in
  sentence case and uppercased by CSS.
- **Names stay as they are**: the brand (Watched., www.watched.earth), satellite, sensor, agency and programme names,
  NORAD ids, UTC, time-zone abbreviations, licence credits ("Contains modified Copernicus Sentinel data"). Curated place
  names (the `places` namespace) use your language's established name for the place, where one exists.
- **Typography of your language**: quotation marks, spaces before punctuation, number and unit spacing, line-break
  preferences, as your guide says. Use real characters (’ “ ” « » 「」 ، ؟), never ASCII stand-ins.
- **Check every message in context**: imagine it on the screen it describes (the comments say where), with the longest
  and shortest plausible slot values, for the counts 0, 1, 2, 5, 21, 1,715.

## Review

Each namespace is reviewed by two independent reviewers before it ships: one for meaning and grammar (every message,
every slot and plural form), one for voice, naturalness, typography and length on screen. Then every namespace of a
language is read together for consistency with the glossary. `npx tsc -p tsconfig.app.json --noEmit` and
`npx vitest run src/i18n` must pass, and `?hl=<locale>` must look right on every screen.
