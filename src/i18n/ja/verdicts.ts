/**
 * Japanese verdict vocabulary (see docs/i18n/ja.md §3.5): the one set of words every screen uses for a pass's verdict.
 *
 * Why these words: the titles hang together on 見る / 見える (見ていた, おそらく見ていた, 向ければ見えた), except
 * overhead, which makes no claim about seeing: 上空を通った (never 真上を通った: most overhead passes are nowhere near the
 * zenith). 向ければ見えた is the honest counterfactual of "could have pointed here", and its verb says only that the place
 * was 見える範囲 (within reach), never 視野 (in the camera's view). The lanes are short kanji nouns for an instrument
 * legend; the imaged lane is 画像, not 写真 ("Photo" in English), because it also holds radar images, weather mosaics and
 * geostationary frames. Every verdict counts passes with 回, and Japanese has one plural category, so the unit is the
 * same for 1 and 31. Never 撮影, never 監視. The engine's footnotes (./engine.ts) quote these titles in 「」.
 */
import type en from '../en/verdicts'

/** "1回", "31回": every verdict counts passes, one form for every count */
const passes = (_n: number) => '回'

const verdicts: typeof en = {
  imaged: {
    title: '見ていた',
    /** 画像, not 写真: the lane also holds radar images, daily mosaics and geostationary frames */
    short: '画像',
    unit: passes,
    definition: 'この場所の実際の画像が、公開アーカイブにある。',
    verb: '見ていた',
  },
  likely: {
    title: 'おそらく見ていた',
    short: '推定',
    unit: passes,
    /** A fixed camera is 真下を見続けるカメラ: 固定カメラ reads as CCTV */
    definition: '真下を見続けるカメラの観測幅が、この場所を覆った。その画像は公開されていない。',
    verb: '観測幅に入った',
  },
  could: {
    title: '向ければ見えた',
    short: '可能性',
    unit: passes,
    definition: 'この場所は、向きを変えられるカメラか非公開のカメラの届く範囲に入っていた。実際に見たかどうか、運用者は明かしていない。',
    verb: '見える範囲を通った',
  },
  overhead: {
    title: '上空を通った',
    short: '上空',
    unit: passes,
    definition: 'この場所の空を横切った。宇宙ステーションも、それ以外も。',
    verb: '上空を通った',
  },
}
export default verdicts
