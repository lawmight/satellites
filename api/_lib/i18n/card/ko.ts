/**
 * Korean copy for the share card and the share page (see docs/i18n/ko.md §3.6, §3.7 "card", §6.3). Pure TypeScript
 * with no DOM, Node or src/ imports, like ./en.ts: the server reads it through cardMessages(locale), and the app's ko
 * bundle lists this same module as its 'card' namespace.
 *
 * Why it is shaped this way:
 *  - A particle that changes with the last sound (이/가, 을/를, 은/는) never follows a name: code cannot choose it for
 *    Latin names (Paris takes 를, London 을). So every frame puts a buffer noun after the slot, which carries a fixed
 *    particle: [SAT] 위성이, [PLACE] 일대를, [PLACE] 상공을 (§5.1).
 *  - The headline is phrase parts around the place ("위성 7기가 / *Waterloo* / 일대를 / 지켜봤다."): Korean ends on its
 *    verb, so words follow the place. Each text part is one card line, never broken inside, so parts are display
 *    phrases cut at word boundaries; none has a leading space (the renderers join blocks with the locale's space), and
 *    none sits inside the accent, which would set it in the serif. The full stop sits in the
 *    tail, so a place cut short (`cut`) changes nothing.
 *  - A nameless satellite writes 이름 미상 into the [SAT] slot (이름 미상 위성이); the label alone is 이름 미상 위성.
 *  - ko has one plural category, so every count is one string; a zero has its own sentence, never 위성 0기. Counters
 *    are text attached to the number (위성 31기, 이미지 31장); SI units are spaced (786 km).
 *  - Dates are built by hand from the place's local fields: dotted only with a year (2026.11.1(일), the mono stamps),
 *    in words in prose (2026년 11월 1일(일)), no space before the parenthesis, never Intl's "2026. 11. 1. (일)". The
 *    app's ko post text and time-lapse take their days from here too (koDayProse, koFields).
 *  - 한다체 throughout, no honorifics; 당신 only in the brand lines (the hero, the page's title and question).
 */
import { fmt } from '../format.js'
import { accent, type Rich } from '../parts.js'
import { dateFormat } from '../dates.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('ko')

// ── Dates at the place, by hand (docs/i18n/ko.md §6.3) ──────────────────────────────────────────────────────────────

const FIELDS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }

/** The calendar day of an instant at a zone: year, month and day as numbers, and the one-syllable weekday (일, 월, …) */
export function koFields(ms: number, timeZone: string): { year: number; month: number; day: number; weekday: string } {
  const ps = dateFormat('ko', timeZone, FIELDS).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => ps.find((p) => p.type === t)?.value ?? ''
  return { year: Number(get('year')), month: Number(get('month')), day: Number(get('day')), weekday: get('weekday') }
}

/** "11월 1일(일)": the day in prose (the post) */
export function koDayProse(ms: number, timeZone: string): string {
  const d = koFields(ms, timeZone)
  return `${d.month}월 ${d.day}일(${d.weekday})`
}
/** "2026년 11월 1일(일)": the share page carries the year */
const dayYearProse = (ms: number, timeZone: string) => `${koFields(ms, timeZone).year}년 ${koDayProse(ms, timeZone)}`
/** "2026.11.1(일)": the card's mono stamps (dotted only with a year, never zero-padded) */
const dayYearMono = (ms: number, timeZone: string) => {
  const d = koFields(ms, timeZone)
  return `${d.year}.${d.month}.${d.day}(${d.weekday})`
}

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** A satellite with no name, in the [SAT] slot before 위성 (이름 미상 위성이) */
const named = (sat: SatName) => sat ?? '이름 미상'
/** "Sentinel-2C 위성이": the satellite as a sentence's subject, with the buffer that fixes its particle */
const satIs = (sat: SatName) => `${named(sat)} 위성이`

/** Eight compass points for prose, 0 north, 1 northeast, … 7 northwest: always with 쪽, so the particle is fixed */
const COMPASS = ['북쪽', '북동쪽', '동쪽', '남동쪽', '남쪽', '남서쪽', '서쪽', '북서쪽']
/** "2026년 11월 1일(일) 11:21 EST에 ", or nothing when the moment is unknown */
const at = (w?: CardWhen) => (w ? `${dayYearProse(w.ms, w.timeZone)} ${w.clock} ${w.zone}에 ` : '')
/** " 남쪽을 향해 이동 중이었다.": the second sentence, or nothing when the heading is unknown */
const moving = (heading?: number) => {
  const dir = heading !== undefined ? COMPASS[heading] : undefined
  return dir ? ` ${dir}을 향해 이동 중이었다.` : ''
}

const card: CardMessages = {
  // ── The headline (rich: text blocks in the condensed face, the accent block in the serif) ─────────────────────────

  /**
   * "위성 7기가 / *Waterloo* / 일대를 / 지켜봤다." (n ≥ 1; the tail keeps its stop when the place is cut). Each text part
   * is one line of the card, never broken inside (cardSpec headlineSizeCjk), so the parts are display phrases of about
   * 4–8 syllables cut at word (어절) boundaries; flat text joins them with a space and reads as the one sentence.
   */
  headline: (satellites: number, place: string, _cut: boolean): Rich => [`위성 ${f.int(satellites)}기가`, accent(place), '일대를', '지켜봤다.'],
  /** 이 in headlines (the satellite is the news), with 이름 미상 in the slot when the share kept no name */
  headlineBy: {
    imaged: (sat: SatName, place: string, _cut: boolean): Rich => [named(sat), '위성이', accent(place), '일대를 지켜봤다.'],
    likely: (sat: SatName, place: string, _cut: boolean): Rich => [named(sat), '위성이', accent(place), '일대를 훑고', '지나갔다.'],
    could: (sat: SatName, place: string, _cut: boolean): Rich => [named(sat), '위성이', accent(place), '일대가', '보이는 곳을', '지나갔다.'],
    overhead: (sat: SatName, place: string, _cut: boolean): Rich => [named(sat), '위성이', accent(place), '상공을 지나갔다.'],
  },
  /** Both week frames open on the hero's time topic, 지난 일주일, ; a zero has its own sentence */
  headlineWeek: (satellites: number, place: string, _cut: boolean): Rich =>
    satellites > 0
      ? ['지난 일주일,', `위성 ${f.int(satellites)}기가`, accent(place), '일대를 지켜봤다.']
      : ['지난 일주일,', '추적 중인 어떤 위성도', accent(place), '일대를 지켜보지', '않았다.'],

  // ── The line under the headline (it rhymes with the headline: 지켜봤다. / 공개됐다.) ─────────────────────────────────

  photos: (count: number, atLeast: boolean) =>
    count <= 0 ? '공개된 이미지는 없다.' : atLeast ? `이미지가 최소 ${f.int(count)}장 공개됐다.` : `이미지가 ${f.int(count)}장 공개됐다.`,
  archiveDown: '이미지 아카이브가 응답하지 않아, 지금은 공개 이미지를 셀 수 없다.',
  archiveDownShort: '이미지 아카이브가 응답하지 않았다.',
  cloud: {
    only: {
      sub: (_pct: number) => '구름에 가렸다. 구름만 보였다.',
      chip: (pct: number) => `구름에 가림 · ${f.int(pct)}%`,
      post: (_pct: number) => '구름만 보였다.',
      desc: (pct: number) => `구름만 보였다(${f.int(pct)}%).`,
    },
    mostly: {
      sub: (pct: number) => `대부분 구름: 장면의 ${f.int(pct)}%.`,
      chip: (pct: number) => `대부분 구름 · ${f.int(pct)}%`,
      post: (pct: number) => `대부분 구름이었다(${f.int(pct)}%).`,
      desc: (pct: number) => `대부분 구름이었다(${f.int(pct)}%).`,
    },
    spot: { sub: '이 지점 위에 구름이 있었다.', chip: '지점 위 구름', post: '구름이 이 지점을 덮었다.', desc: '구름이 이 지점을 덮었다.' },
  },

  // ── The top row (mono days: 2026.11.1(일)) ────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYearMono(ms, timeZone)} · ${clock} ${zone}`,
  /** The year stays, as the English requires */
  weekTo: (ms: number, timeZone: string) => `${dayYearMono(ms, timeZone)}까지 7일`,
  lastWeek: '최근 7일',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: '고도',
    /** 고도각, never 고도 (the orbit's height) */
    elevation: '고도각',
    speed: '속도',
    offNadir: '기울기',
    pixel: '픽셀',
    /** 합성, never 모자이크 (blurring and censorship to Korean readers) */
    mosaicPixel: '합성 픽셀',
    closest: '최근접 거리',
  },
  /** The verdicts' lanes (§3.5): 이미지, not 사진, because the lane also holds radar images and daily composites */
  lane: { imaged: '이미지', likely: '추정', could: '가능', overhead: '상공' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`),
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${f.int(km * 1000)} m`),
  geometry: '통과 기하 · 북쪽 위',
  note: {
    imageInApp: '이미지는 앱에서 볼 수 있음',
    imageUnavailable: '지금은 이미지를 받을 수 없음',
    commercial: '상업 아카이브, 비공개',
    inSwath: '관측 폭 안, 공개 이미지 아직 없음',
    groundTrack: '최근접 시점의 지상 궤적',
  },
  acquiring: '포착 중…',
  noPublicPhoto: '지난 일주일 공개 이미지 없음',
  noPhoto: '보여 줄 이미지 없음',
  /** The gallery's own words for why a picture leads (가장 자세한 모습: the most detailed clear image, never 최근접) */
  look: {
    closest: '가장 자세한 모습',
    lastClear: '마지막 맑은 모습',
    clouded: '구름에 가림',
    radar: '레이더',
  },
  /** "11월 3일": a bare day-month in words (a dotted "11.3" is read aloud as a decimal) */
  lookDay: (ms: number, timeZone: string) => {
    const d = koFields(ms, timeZone)
    return `${d.month}월 ${d.day}일`
  },
  aSatellite: '이름 미상 위성',
  /** First person: the share sheet's post preview already carries 당신도 */
  invite: '무엇이 나를 지켜봤을까',

  // ── The default card ─────────────────────────────────────────────────────────────────────────────────────────────

  /**
   * The poster without its time (§3.1): 지난 일주일, would overflow the 466 px column at 88 px, and the card's stamp
   * already says 최근 7일. 당신 and 을 touch (no space at the boundary).
   */
  hero: [['무언가'], [accent('당신'), '을'], ['지켜봤다.']] as Rich[],
  enterAnyPlace: '지구 어디든 입력',
  defaultPlace: '팜 주메이라',
  /** It quotes the card's hero: keep the two in step */
  defaultAlt: 'Sentinel-2 위성이 실제로 찍은 두바이 팜 주메이라 사진. 옆에 ‘무언가 당신을 지켜봤다. 지구 어디든 입력’이라는 문구가 있다.',

  // ── The share page ───────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: '지난 일주일, 무언가 당신을 지켜봤다.',
    /** The landing's sub line (§3.2): a conditional, never a command */
    description: '지구 어디든 입력하면, 최근 7일 동안 그 상공을 지나간 모든 위성과 실제로 찍힌 이미지가 보인다.',
    /** The news-headline question in -나, natural without a question mark (the English wants none) */
    placeTitle: (place: string) => `지난 일주일, 무엇이 ${place} 일대를 지켜봤나`,
    placeDescription: (place: string) =>
      `최근 7일 동안 ${place} 일대 상공을 지나간 모든 위성과 실제로 찍힌 이미지. 지난 일주일, 무엇이 당신을 지켜봤을까?`,
    opening: [accent('Watched'), ' 여는 중'] as Rich,
  },
  /**
   * "Sentinel-2C 위성이 2026년 11월 1일(일) 11:21 EST에 고도 786 km에서 Waterloo 상공을 지나갔다. 남쪽을 향해 이동
   * 중이었다." Each part may be missing: no moment drops its phrase, no altitude leaves "Waterloo 상공을 지나갔다", no
   * heading ends on the first sentence. Korean says "crossed" and "passed" with the one verb 지나가다.
   */
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) => {
    const altitude = o.altitudeKm !== undefined ? `고도 ${f.int(o.altitudeKm)} km에서 ` : ''
    return `${satIs(o.sat)} ${at(o.when)}${altitude}${o.place} 상공을 지나갔다.${moving(o.heading)}`
  },
  /** "WorldView Legion 4 위성이 … 10:52 EST에 Waterloo 일대가 보이는 곳을 지나갔다. 북서쪽을 향해 이동 중이었다." */
  withinView: (o: PassFacts) => `${satIs(o.sat)} ${at(o.when)}${o.place} 일대가 보이는 곳을 지나갔다.${moving(o.heading)}`,
  couldHave: '이쪽을 볼 수도 있었다. 실제로 봤는지 운영사는 밝히지 않는다.',
  straightDown: '바로 아래를 보고 있었다.',
  offNadir: (deg: number) => `바로 아래에서 ${f.dec(deg, 1)}° 비스듬히 보고 있었다.`,
  cloudCover: (pct: number) => `구름양: ${f.int(pct)}%.`,
  inSwath: (place: string) => `${place} 일대는 관측 폭 안에 있었다.`,
  bestFrom: {
    closest: (sat: SatName) => `가장 자세한 모습은 ${satIs(sat)} 찍었다.`,
    lastClear: (sat: SatName) => `마지막 맑은 모습은 ${satIs(sat)} 찍었다.`,
    first: (sat: SatName) => `첫 이미지는 ${satIs(sat)} 찍었다.`,
  },
  question: '지난 일주일, 무엇이 당신을 지켜봤을까?',
  cardAlt: {
    /** 이미지, not 사진: the week's lead may be a radar image or a composite */
    withPhoto: (sat: SatName) => `공유 카드. 지난 일주일의 가장 자세한 이미지는 ${satIs(sat)} 찍었다.`,
    plain: '공유 카드.',
  },
}

export default card
