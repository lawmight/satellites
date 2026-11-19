/**
 * The German verdict vocabulary (see src/i18n/en/verdicts.ts for where each word shows; docs/i18n/de.md §3.6 is the
 * authority on every word here, and the engine's footnotes, About and the pass list quote them).
 *
 * Why these words:
 *  - *Beobachtet* is the product verb itself, as a participle, and *Überflogen* its plain parallel (never *Nur
 *    überflogen*, a judgement the English doesn't make). *Vermutlich beobachtet* is the hedged twin of *Beobachtet*.
 *    *Konnte hierher blicken* states a capability in the indicative, exactly what is known: *hätte … können* would
 *    suggest it did not look.
 *  - The lanes are one mono word each: `BILD` (never `FOTO`: the lane holds radar images and mosaics), `VERMUTLICH`,
 *    `MÖGLICH`, `ÜBERFLOGEN`.
 *  - Every verdict counts passes, so the tiles read alike: *1 Überflug*, *12 Überflüge*.
 *  - The camera that could have looked is *schwenkbar* or *kommerziell*, never *privat* (a person's own camera, the
 *    very surveillance reading to avoid). A sentence never opens on a capital *Ihr/Sie* pronoun, which reads as formal
 *    address: the operator is *Der Betreiber* (§1.4).
 *  - Running text never lowercases a title: German writes its own sentences around them (results.timeline.summary).
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('de')

/** "1 Überflug", "31 Überflüge": every verdict counts passes */
const passes = (n: number) => f.plural(n, { one: 'Überflug', other: 'Überflüge' })

const verdicts: typeof en = {
  imaged: {
    title: 'Beobachtet',
    // The lane holds the pictures, radar and mosaics among them: *Bild*, never *Foto*.
    short: 'Bild',
    unit: passes,
    definition: 'Ein echtes Bild dieses Ortes liegt in einem öffentlichen Archiv.',
    verb: 'beobachtet',
  },
  likely: {
    title: 'Vermutlich beobachtet',
    short: 'Vermutlich',
    unit: passes,
    definition: 'Der Aufnahmestreifen einer fest ausgerichteten Kamera lag über diesem Ort. Ein Bild davon ist nicht veröffentlicht.',
    // Never *überstrichen*: lay readers hear "painted over" (§3.6).
    verb: 'vermutlich erfasst',
  },
  could: {
    title: 'Konnte hierher blicken',
    short: 'Möglich',
    unit: passes,
    definition: 'Eine schwenkbare oder kommerzielle Kamera war in Reichweite. Der Betreiber sagt nicht, ob sie hingesehen hat.',
    verb: 'in Sichtweite',
  },
  overhead: {
    title: 'Überflogen',
    short: 'Überflogen',
    unit: passes,
    definition: 'Über deinen Himmel gezogen. Raumstationen und alles andere.',
    verb: 'überflogen',
  },
}

export default verdicts
