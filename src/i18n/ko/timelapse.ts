/**
 * Korean copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the words drawn
 * into the MP4 (see docs/i18n/ko.md §3.7 "timelapse", §6.3, §8).
 *
 * Why it reads this way: a frame is 프레임 and a clear look 맑은 모습, both counted with 장 (scenes with 개), and a
 * progress count puts the total first, as Korean does (장면 12개 중 3개). Dates are built from the frame's day read at
 * 'UTC' (its `ms` is UTC midnight of that day): dotted with the year in the mono readouts (2015.10.22, never
 * zero-padded), in words when it stands without a year or is spoken (10월 22일, 2015년 10월 22일), because a bare
 * dotted day is read aloud as a decimal. A year is never grouped (2015년부터). The single-season captions name only
 * the season every frame is from (해마다 여름에 1장), never why: no word of war or melting the English lacks (§8).
 * Status lines are nouns (만드는 중, 만들기 실패, 링크 복사됨), the developing step is 현상, as a film is developed, and
 * the video draws these words as they are (Hangul has no case). Names (Sentinel-2, Planetary Computer, H.264,
 * Chrome) stay as they are; the place is inserted bare, at a phrase's end or before 타임랩스, so it needs no particle.
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'
import { koFields } from '../../../api/_lib/i18n/card/ko'

const f = fmt('ko')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** "10월 22일": the frame's day, read at 'UTC' */
const dayMonth = (ms: number) => {
  const d = koFields(ms, 'UTC')
  return `${d.month}월 ${d.day}일`
}
/** "2015.10.22" (mono, with its year) */
const day = (ms: number) => {
  const d = koFields(ms, 'UTC')
  return `${d.year}.${d.month}.${d.day}`
}
/** "2015년 10월 22일" (spoken) */
const daySpoken = (ms: number) => `${koFields(ms, 'UTC').year}년 ${dayMonth(ms)}`
/** "맑은 모습 11장" */
const looks = (n: number) => `맑은 모습 ${f.int(n)}장`
const EACH: Record<SeasonName, string> = {
  winter: '해마다 겨울에 1장',
  spring: '해마다 봄에 1장',
  summer: '해마다 여름에 1장',
  autumn: '해마다 가을에 1장',
}
/** The first sentence both notes share */
const SQUARE = (km: number) => `모든 프레임은 Sentinel-2가 찍은 가로세로 ${f.int(km)} km의 같은 땅으로, 여기 있는 다른 사진처럼 색을 보정했다.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `${place} 타임랩스`,
  title: '타임랩스',
  close: '닫기',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: '재생',
  pause: '일시정지',
  slider: '프레임',
  frameList: '프레임 목록',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `프레임 ${f.int(total)}장 중 ${f.int(index)}번째: ${daySpoken(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · 해마다 1장`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `해마다 맑은 모습 1장 · ${since}년부터`,
  captionShort: '이곳의 타임랩스 없음',
  /** A label: a noun ending, no full stop */
  captionError: '아카이브 응답 없음',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  /** 되도록 keeps the English "aims for": a year with no clear look in its season takes any clear date (timelapse.ts) */
  note: (km: number) => `${SQUARE(km)} 해마다 되도록 다른 계절을 고르고, 맑은 모습이 없는 해는 뺀다.`,
  /** Here the season is a rule, not an aim: no hedge */
  noteOneSeason: (km: number) => `${SQUARE(km)} 해마다 같은 계절을 고르고, 그 계절에 맑은 모습이 없는 해는 뺀다.`,
  /** The names stay; only 경유 ("via") is Korean */
  source: 'Copernicus Sentinel-2, Planetary Computer 경유',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: '아카이브 목록 확인 중',
  choosing: '맑은 모습 고르는 중',
  /** 현상: a film being developed, as the English "developing" is */
  developing: '프레임 현상 중',
  choosingProgress: (done: number, total: number) => `맑은 모습 고르는 중, 장면 ${f.int(total)}개 중 ${f.int(done)}개`,
  developingProgress: (done: number, total: number) => `프레임 현상 중, ${f.int(total)}장 중 ${f.int(done)}장`,
  tooCloudy: '구름이 너무 잦아 이곳은 타임랩스를 만들 수 없다.',
  /** A zero has its own words: never 맑은 모습 0장 */
  tooFew: (count: number, since: number, needed: number) =>
    `${since}년부터 ${count === 0 ? '맑은 모습 없음' : looks(count)} · ${f.int(needed)}장 필요`,
  noAnswer: '아카이브가 응답하지 않았다.',
  unreachable: 'Planetary Computer에 연결할 수 없음',
  retry: '다시 시도',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: '공유',
  linkCopied: '링크 복사됨',
  shareTitle: (place: string) => `해마다 본 ${place}`,
  /** 동영상, never 영상 or 비디오 */
  video: '동영상',
  /** Padded to two digits, as English, so the 132 px button never changes width as it counts */
  rendering: (pct: number) => `만드는 중 ${pad2(pct)}%`,
  videoFailed: '만들기 실패',
  saveVideo: '동영상 저장',
  noH264: '이 브라우저에는 H.264 인코더가 없다. 파일은 Chrome과 Firefox에서 재생된다.',
  fileNamePlace: 'place',
}

export default timelapse
