/**
 * Italian verdict vocabulary: the ONE set of words for a pass's verdict, on every screen (see src/i18n/en/verdicts.ts;
 * docs/i18n/it.md §3.6, §4).
 *
 * Why these words and no others:
 *  - Titles are the guide's final four (*Osservato*, *Probabilmente osservato*, *Poteva puntare qui*, *Nel tuo
 *    cielo*). The two participles are masculine singular, the Italian default for a status (*il passaggio*): they
 *    never agree with the reader. *Nel tuo cielo* follows the English definition (*Crossed your sky*) and avoids
 *    *passato sopra*, which reads as "ran you over" or "let it go".
 *  - Lane words are the pair Italians read at once (*Probabile* / *Possibile*), *Foto* where English says "Photo"
 *    (the lane holds the pictures), and *In cielo*.
 *  - Every verdict counts passes: *1 passaggio*, *31 passaggi*, *1.000.000 di passaggi* (CLDR `many` takes *di*).
 *  - The spoken row verbs are the participles of the headline verbs (*osservato*, *inquadrato*, *sorvolato*) and the
 *    in-range term *a portata*: each stands alone after a satellite's name in a comma list, agreeing with nothing.
 *  - These words are never reused for anything else (the geostationary "In your sky" is *Dal tuo punto*).
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('it')

/** *passaggio · passaggi · di passaggi*: the unit after a count of passes, in the form the count takes */
const passes = (n: number) => f.plural(n, { one: 'passaggio', many: 'di passaggi', other: 'passaggi' })

const verdicts: typeof en = {
  imaged: {
    title: 'Osservato',
    // «Immagine», not «Foto»: the lane also holds radar images and daily mosaics (English says Image; owner)
    short: 'Immagine',
    unit: passes,
    definition: 'In un archivio pubblico c’è un’immagine reale di questo luogo.',
    verb: 'osservato',
  },
  likely: {
    title: 'Probabilmente osservato',
    short: 'Probabile',
    unit: passes,
    definition: 'Questo luogo era nella fascia di ripresa di una fotocamera fissa. Non ne è stata pubblicata nessuna immagine.',
    verb: 'inquadrato',
  },
  could: {
    title: 'Poteva puntare qui',
    short: 'Possibile',
    unit: passes,
    definition: 'Era a portata una fotocamera orientabile o privata. Il suo operatore non dice se ha puntato qui.',
    verb: 'a portata',
  },
  overhead: {
    title: 'Nel tuo cielo',
    short: 'In cielo',
    unit: passes,
    definition: 'Ha attraversato il tuo cielo. Stazioni spaziali e tutto il resto.',
    verb: 'sorvolato',
  },
}
export default verdicts
