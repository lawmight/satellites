/**
 * Dutch verdict vocabulary (see docs/i18n/nl.md §3.5, §4.1, §5 "Verdict names inside sentences"): the one set of words
 * for a pass's verdict, wherever the app says it.
 *
 * Why these words:
 *  - The titles are the guide's, letter for letter: `Bekeken` / `Waarschijnlijk bekeken` / `Kon hierheen kijken` /
 *    `Vloog over je heen`. `Bekeken` shares its root with the prose verb `kijken naar`; `kon` states a capacity and
 *    never the counterfactual `had … kunnen`; `Vloog over je heen` keeps the "overhead" the tile adds to its count.
 *  - The lane words are the noun of each prose verb, 5–6 characters for the timeline's 8-character lane: `Beeld`
 *    (never `Foto`: the lane holds radar images and mosaics too), `Strook`, `Bereik`, `Hemel`.
 *  - Every verdict counts passes, so the unit is `overvlucht` / `overvluchten` in nl's two plural forms.
 *  - The verb stands alone after the satellite's name in a row's spoken list (`Sentinel-2C, keek naar, …`), so each is
 *    a verb that reads without an object. "Passed within view" is `kwam binnen bereik`: the card's `had … binnen bereik`
 *    needs the place between its two halves, which a comma-separated list cannot give it.
 *  - Definitions never use a pronoun for a satellite (§5): the camera, its swath and its operator carry the sentence.
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('nl')

/** "1 overvlucht", "0 overvluchten", "31 overvluchten": every verdict counts passes */
const passes = (n: number) => f.plural(n, { one: 'overvlucht', other: 'overvluchten' })

const verdicts: typeof en = {
  imaged: {
    title: 'Bekeken',
    short: 'Beeld',
    unit: passes,
    definition: 'Er staat een echt beeld van deze plek in een openbaar archief.',
    verb: 'keek naar',
  },
  likely: {
    title: 'Waarschijnlijk bekeken',
    short: 'Strook',
    unit: passes,
    definition: 'De opnamestrook van een vaste camera bestreek deze plek. Er is geen beeld van gepubliceerd.',
    verb: 'streek over',
  },
  could: {
    title: 'Kon hierheen kijken',
    short: 'Bereik',
    unit: passes,
    definition: 'Een richtbare of commerciële camera was binnen bereik. De exploitant zegt niet of er gekeken is.',
    verb: 'kwam binnen bereik',
  },
  overhead: {
    title: 'Vloog over je heen',
    short: 'Hemel',
    unit: passes,
    definition: 'Trok over je hemel. Ruimtestations en al het andere.',
    verb: 'vloog over',
  },
}
export default verdicts
