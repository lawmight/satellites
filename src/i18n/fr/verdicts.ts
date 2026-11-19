/**
 * French verdict vocabulary: the four names, lanes, units, definitions and verbs every screen uses for a pass's verdict
 * (see src/i18n/en/verdicts.ts for where each word shows; docs/i18n/fr.md §3.6 fixes every word here).
 *
 * Why it reads this way:
 *  - Titles are labels about the place and agree with an implied *lieu* (masculine singular): *Observé*, *Survolé*.
 *    *Aurait pu viser ici* has the satellite as its implied subject and agrees with nothing. Never a sentence about the
 *    reader (fr.md §1.3).
 *  - The lane says *Image*, not *Photo*: it holds radar images and weather mosaics too, and a radar image is not a
 *    photo. *Probablement*, not *Sans doute*, which many readers take as "without doubt".
 *  - Every verdict counts passes: *passage* / *passages* / *de passages* by fmt('fr').plural; 0 is singular in French
 *    (*0 passage*) and `many` (exact millions) takes *de* (§5.3).
 *  - The verb is one unbroken string (*pouvait viser*, never a verb split around its object): it stands alone after the
 *    satellite's name in a row's spoken summary, and the share headline sets it between a name and a place. *avoir*
 *    verbs and the imparfait only, so nothing agrees with a satellite's name.
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('fr')

/** "1 passage", "31 passages", "1 000 000 de passages": every verdict counts passes */
const passes = (n: number) => f.plural(n, { one: 'passage', many: 'de passages', other: 'passages' })

const verdicts: typeof en = {
  imaged: {
    title: 'Observé',
    short: 'Image',
    unit: passes,
    definition: 'Une image réelle de ce lieu figure dans des archives publiques.',
    verb: 'a observé',
  },
  likely: {
    title: 'Probablement observé',
    short: 'Probable',
    unit: passes,
    definition: 'La fauchée d’une caméra fixe a couvert ce lieu. Aucune image n’en est publiée.',
    verb: 'a balayé',
  },
  could: {
    title: 'Aurait pu viser ici',
    short: 'Possible',
    unit: passes,
    definition: 'Une caméra orientable ou privée était à portée. Son opérateur ne dit pas si elle a visé ce lieu.',
    verb: 'pouvait viser',
  },
  overhead: {
    title: 'Survolé',
    short: 'Survol',
    unit: passes,
    // One colon per sentence (fr.md §2.2); a subject the English fragment lacks.
    definition: 'Passage dans votre ciel\u00a0: les stations spatiales, et tout le reste.',
    verb: 'a survolé',
  },
}
export default verdicts
