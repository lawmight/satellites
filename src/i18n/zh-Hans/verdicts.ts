/**
 * The one verdict vocabulary in Simplified Chinese (see docs/i18n/zh-Hans.md §3.7): every word the product uses for a
 * pass's verdict, wherever it is said.
 *
 * Why these words: the three degrees read at a glance, 注视过 (it did), 很可能注视过 (probably: 可能 alone would say
 * "possibly" and understate a camera that is always on), 能对准这里 (it could; never 本可, which says it did not look).
 * The imaged lane says 图像, not 照片, because it holds weather mosaics and radar images too. 过顶 is the native term for
 * a satellite crossing your sky. Every verdict counts passes, and zh has one plural category, so the unit is one form
 * (次过境) for every count. The likely definition says 没有公开的画面: we do not know that a picture exists.
 */
import type en from '../en/verdicts'

/** "1 次过境", "31 次过境": the count is written beside it */
const passes = (_n: number) => '次过境'

const verdicts: typeof en = {
  imaged: {
    title: '注视过',
    short: '图像',
    unit: passes,
    definition: '公开图像库里有这个地方的真实图像。',
    verb: '注视过',
  },
  likely: {
    title: '很可能注视过',
    short: '很可能',
    unit: passes,
    definition: '这里在一台固定朝下的相机的成像带内。没有公开的画面。',
    verb: '扫过',
  },
  could: {
    title: '能对准这里',
    short: '可对准',
    unit: passes,
    definition: '这里在一台可转向相机或私营相机的可视范围内。运营方不公开它是否对准过这里。',
    verb: '经过时能对准',
  },
  overhead: {
    title: '从上空经过',
    short: '过顶',
    unit: passes,
    definition: '从你头顶经过。空间站，以及其余所有卫星。',
    verb: '从上空经过',
  },
}

export default verdicts
