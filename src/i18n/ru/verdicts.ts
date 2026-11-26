/**
 * The ONE verdict vocabulary in Russian (see docs/i18n/ru.md §3.6, §4.1): every screen that names a verdict reads it
 * from here, so «Увидено» on the summary, the timeline, the pass list and About is one word everywhere.
 *
 * Why these forms: a title never needs the satellite's gender, so each is a status form in -но («Увидено», as
 * «Отправлено» or «Просмотрено» in a messenger), an impersonal plural («Могли смотреть сюда») or a noun phrase («Над
 * головой»). «Вероятно» is a parenthetical word, so «Вероятно, увидено» keeps its comma even as a label. The lanes are
 * the standard pair for "probable / possible" (ВЕРОЯТНО / ВОЗМОЖНО), ≤ 8 characters in mono caps; the imaged lane is
 * СНИМОК because radar images and daily mosaics share it. Every verdict counts passes, so the unit is «пролёт» in ru's
 * four plural forms. The spoken verb stands alone after a bare satellite name in a comma list, so it is the title's
 * own gender-free words in running case, never a past tense.
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('ru')

/** «1 пролёт», «2 пролёта», «5 пролётов», «1,5 пролёта» */
const passes = (n: number) => f.plural(n, { one: 'пролёт', few: 'пролёта', many: 'пролётов', other: 'пролёта' })

const verdicts: typeof en = {
  imaged: {
    title: 'Увидено',
    short: 'Снимок',
    unit: passes,
    definition: 'Настоящий снимок этого места есть в открытом архиве.',
    verb: 'увидено',
  },
  likely: {
    title: 'Вероятно, увидено',
    short: 'Вероятно',
    unit: passes,
    definition: 'Это место попало в полосу обзора неподвижной камеры. Снимок не опубликован.',
    verb: 'вероятно, увидено',
  },
  could: {
    title: 'Могли смотреть сюда',
    short: 'Возможно',
    unit: passes,
    // «камера с закрытым архивом» for English's "private": «частная камера» is a person's camera, and some of these are
    // governments'. «в зоне досягаемости», as results.why.radar says it.
    definition: 'Это место было в зоне досягаемости поворотной камеры или камеры с закрытым архивом. Оператор не сообщает, смотрела ли она сюда.',
    verb: 'могли смотреть сюда',
  },
  overhead: {
    title: 'Над головой',
    short: 'В небе',
    unit: passes,
    definition: 'Пролёт над твоей головой. Станции и всё остальное.',
    verb: 'над головой',
  },
}
export default verdicts
