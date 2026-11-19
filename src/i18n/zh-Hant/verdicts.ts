/**
 * Traditional Chinese verdict vocabulary (see docs/i18n/zh-Hant.md §3.6, §4.1): the one set of words every screen uses
 * for a pass's verdict.
 *
 * Why these words: the three degrees must read at a glance, side by side on a phone: 注視過 (it did), 很可能注視過
 * (very probably), 或許曾對準這裡 (perhaps). Their lanes are 影像 · 很可能 · 或許 · 上空, and 可能 alone is never a lane
 * word, because beside 很可能 the two blur. The imaged lane says 影像, not 照片: it holds radar images and weather
 * mosaics too. Every verdict counts passes, and zh has one plural category, so the unit is one form for every count
 * ("1 次過境", "31 次過境"). The likely definition says 但沒有公開的影像 ("there is no published image"), never
 * 影像沒有公開, which would claim an image exists. The engine's footnotes quote these titles (相關過境仍算作注視過,
 * 顯示為很可能注視過): keep them in step.
 */
import type en from '../en/verdicts'

/** "31 次過境": every verdict counts passes, one form for every count */
const passes = (_n: number) => '次過境'

const verdicts: typeof en = {
  imaged: {
    title: '注視過',
    short: '影像',
    unit: passes,
    definition: '公開影像庫中有這個地方的真實影像。',
    verb: '注視過',
  },
  likely: {
    title: '很可能注視過',
    short: '很可能',
    unit: passes,
    definition: '固定鏡頭的掃描帶涵蓋了這個地方，但沒有公開的影像。',
    verb: '掃過',
  },
  could: {
    title: '或許曾對準這裡',
    short: '或許',
    unit: passes,
    definition: '可轉向或私營的鏡頭當時在可視範圍內。營運商不透露它有沒有看向這裡。',
    verb: '經過時在可視範圍內',
  },
  overhead: {
    title: '從上空經過',
    short: '上空',
    unit: passes,
    definition: '從你的天空劃過。太空站和其他衛星都算在內。',
    verb: '從上空經過',
  },
}

export default verdicts
