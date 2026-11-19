/**
 * Korean verdict vocabulary (see docs/i18n/ko.md §3.5): the one set of words every screen uses for a pass's verdict.
 *
 * Why these words: the titles hang together on the product's verbs, 지켜보다 and 보다 (지켜봤다, 아마 지켜봤다, 여기를 볼
 * 수도 있었다), except overhead, which makes no claim about seeing: 상공을 지나갔다 (never 머리 위를 지나갔다, which
 * claims the zenith). 여기를 볼 수도 있었다 is the honest counterfactual of "could have pointed here": a capability, with
 * 도 marking possibility, not an event. 아마 지켜봤다 is the narrative 아마 with a plain past; never "correct" it to
 * 아마 지켜봤을 것이다. The lanes are short Sino-Korean legend words; the imaged lane is 이미지, not 사진, because it also
 * holds radar images, daily composites and geostationary frames. Every verdict counts passes with 회, and ko has one
 * plural category, so the unit is the same for 1 and 31. A fixed camera is 늘 바로 아래를 보는 카메라 (고정 카메라 reads
 * as CCTV); an operator is 운영사. Never 촬영, never 감시. The engine's footnotes (./engine.ts) quote these titles in
 * ‘ ’, and every title ends in 다, so the particle after the quote (로) is fixed.
 */
import type en from '../en/verdicts'

/** "1회", "31회": every verdict counts passes, one form for every count */
const passes = (_n: number) => '회'

const verdicts: typeof en = {
  imaged: {
    title: '지켜봤다',
    /** 이미지, not 사진: the lane also holds radar images, daily composites and full-disc frames */
    short: '이미지',
    unit: passes,
    definition: '이 장소의 실제 이미지가 공개 아카이브에 있다.',
    verb: '지켜봤다',
  },
  likely: {
    title: '아마 지켜봤다',
    short: '추정',
    unit: passes,
    definition: '늘 바로 아래를 보는 카메라의 관측 폭이 이 장소를 덮었다. 이곳을 찍은 이미지는 공개되지 않았다.',
    verb: '훑고 지나갔다',
  },
  could: {
    title: '여기를 볼 수도 있었다',
    short: '가능',
    unit: passes,
    /** The place is the subject: what is known is that it was within reach, not where the camera looked */
    definition: '이곳이 방향을 돌릴 수 있는 카메라나 비공개 카메라가 닿는 범위 안에 있었다. 실제로 이쪽을 봤는지 운영사는 밝히지 않는다.',
    verb: '보이는 곳을 지나갔다',
  },
  overhead: {
    title: '상공을 지나갔다',
    short: '상공',
    unit: passes,
    definition: '이곳 하늘을 가로질렀다. 우주정거장과 나머지 모든 위성.',
    verb: '상공을 지나갔다',
  },
}
export default verdicts
