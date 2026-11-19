/**
 * The ONE verdict vocabulary in Ukrainian (see docs/i18n/uk.md §3.6, §4.1): every screen that names a verdict reads it
 * from here, so «Побачено» on the summary, the timeline, the pass list and About is one word everywhere.
 *
 * Why these forms: a title never needs the satellite's gender, so each is a status form in -но («Побачено»), an
 * impersonal plural («Могли дивитися сюди») or a noun phrase («Над головою»). The lanes are the standard pair for
 * "probable / possible" (ІМОВІРНО / МОЖЛИВО), ≤ 8 characters in mono caps. Every verdict counts passes, so the unit is
 * «проліт» in uk's four plural forms. The spoken verb stands alone after a bare satellite name in a comma list, so it
 * is the title's own gender-free words in running case, never a past tense («пролетів» alone is also slang for
 * "failed").
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('uk')

/** «1 проліт», «2 прольоти», «5 прольотів», «1,5 прольоту» */
const passes = (n: number) => f.plural(n, { one: 'проліт', few: 'прольоти', many: 'прольотів', other: 'прольоту' })

const verdicts: typeof en = {
  imaged: {
    title: 'Побачено',
    short: 'Знімок',
    unit: passes,
    definition: 'Справжній знімок цього місця є у відкритому архіві.',
    verb: 'побачено',
  },
  likely: {
    title: 'Імовірно побачено',
    short: 'Імовірно',
    unit: passes,
    definition: 'Це місце потрапило в смугу огляду нерухомої камери. Знімка не оприлюднено.',
    verb: 'імовірно побачено',
  },
  could: {
    title: 'Могли дивитися сюди',
    short: 'Можливо',
    unit: passes,
    definition: 'Це місце було в досяжності поворотної або приватної камери. Оператор не повідомляє, чи вона дивилася сюди.',
    verb: 'могли дивитися сюди',
  },
  overhead: {
    title: 'Над головою',
    short: 'У небі',
    unit: passes,
    definition: 'Проліт твоїм небом. Станції та все інше.',
    verb: 'над головою',
  },
}
export default verdicts
