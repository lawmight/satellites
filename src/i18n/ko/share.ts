/**
 * Korean copy for the share sheet, the post it prefills and the PNG's file name (see docs/i18n/ko.md §3.6, §3.7
 * "share"). The card and the share page speak from api/_lib/i18n/card/ko.ts.
 *
 * Why the post reads this way: it says what the card headline says, subject first, with buffers so no particle
 * follows a name ([SAT] 위성이 … [PLACE] 일대를 / 상공을, §5.1), and the moment before the place, as Korean orders
 * time before place: 현지 시각 11월 1일(일) 11:21에 (the English says "local" with no zone; 현지 시각 covers the day and
 * the clock). The day is the card catalog's koDayProse, in words, because a dotted "11.1" is read as a decimal. Each
 * first paragraph has about 30 fixed syllables besides the names, inside the 60 the guide allows (X counts Hangul
 * twice: links.ts xLength already weights it). The hooks are the hero's words: 당신도 for "you too", and 머리 위 is the
 * idiom for "over you". Buttons are nouns of at most six syllables (공유, 링크 복사, X에 게시, PNG 저장), so three fit a
 * 360 px phone; status lines end in 중… or 됨. File names stay lowercase ASCII, as in English.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { koDayProse } from '../../../api/_lib/i18n/card/ko'

const f = fmt('ko')

/** "795 km": the satellite's altitude, in whole km (a no-break space: the post never breaks a number from its unit) */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}\u00a0km`
/** "10 m", "2 km": a pixel's size, in whole metres or whole km from 1,000 m */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)}\u00a0km` : `${f.int(m)}\u00a0m`)
/** " 픽셀당 10 m.", or nothing when the pixel size is unknown */
const perPixel = (m?: number) => (m !== undefined ? ` 픽셀당 ${pixel(m)}.` : '')
/** "Sentinel-2C 위성이 현지 시각 11월 1일(일) 11:21에 ": the subject and the moment that open every post */
const opening = (sat: string, w: PostWhen) => `${sat} 위성이 현지 시각 ${koDayProse(w.ms, w.timeZone)} ${w.clock}에 `

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: '이 통과 공유',
  titleImage: '이 이미지 공유',
  /** 지난 일주일, never 이번 주 (the calendar week) */
  titleWeek: '지난 일주일 공유',
  close: '닫기',
  closeTitle: '닫기(Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: '이미지 공유',
  preparingImage: '이미지 준비 중…',
  share: '공유',
  copyLink: '링크 복사',
  copied: '복사됨',
  postToX: 'X에 게시',
  copyImage: '이미지 복사',
  savePng: 'PNG 저장',
  tryAgain: '다시 시도',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: '링크',
  directLink: '직접 링크: 지금은 짧은 링크를 만들 수 없다',
  creatingLink: '링크 생성 중…',
  linkLater: '공유할 때 생성',
  postLabel: '게시글',
  renderFailed: '이 브라우저에서는 카드를 그리지 못했다. 링크는 그대로 쓸 수 있다.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    /** "…지켜봤다. 픽셀당 10 m. 실제 이미지다." (no pixel size: "…지켜봤다. 실제 이미지다.") */
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${opening(sat, w)}고도 ${km(altitudeKm)}에서 ${place} 일대를 지켜봤다.${perPixel(pixelM)} 실제 이미지다.`,
    /** `cloud` is the card's own sentence (구름만 보였다. and the like) */
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${opening(sat, w)}고도 ${km(altitudeKm)}에서 ${place} 일대를 지켜봤다. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${opening(sat, w)}고도 ${km(altitudeKm)}에서 ${place} 일대를 훑고 지나갔다. 카메라의 관측 폭이 이 지점을 덮었다.`,
    /** Three sentences, as the English: the window, the possibility, what the operator does not say */
    could: (sat: string, place: string, w: PostWhen) =>
      `${opening(sat, w)}${place} 일대가 보이는 곳을 지나갔다. 이쪽을 볼 수도 있었다. 실제로 봤는지 운영사는 밝히지 않는다.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${opening(sat, w)}고도 ${km(altitudeKm)}에서 ${place} 상공을 지나갔다.`,
  },
  /** The hero's words and order, with 도 for "too" */
  hookWatched: '지난 일주일, 무언가 당신도 지켜봤다.',
  hookPassed: '지난 일주일, 당신 머리 위로는 무엇이 지나갔을까?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names (lowercase ASCII, as English) ──────────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-week-${day}.png`,
}

export default share
