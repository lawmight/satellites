/**
 * Korean copy for one pass's paragraph (see docs/i18n/ko.md §3.4, §3.7 "pass", §5): the sentences under a pass's
 * picture or plan view.
 *
 * Why the sentences are built this way: the first sentence takes the satellite as its topic with the buffer 위성은
 * ([SAT] 위성은 …), because a particle that changes with the last sound (은/는, 이/가, 을/를) can never follow a runtime
 * name, and 위성 always ends in ㅇ; later sentences drop the subject (Korean never says 그것 for a satellite). The place
 * takes the buffer 일대 the same way ([PLACE] 일대를) or an invariant particle ([PLACE]에). Time comes before place
 * ([TIME]에 고도 [ALT]에서 …), and an English participial tail ("…, moving south at 7.46 km/s") becomes its own short
 * sentence ending in 이동 중이었다, so the endings vary. Prose directions always end in 쪽 (서쪽으로, 남쪽을 향해, 남서쪽
 * 하늘), which fixes every particle after them; the position ("61 km to the west") and the heading ("moving south") keep
 * two tables, as the English asks, filled with the same words. 이곳 바로 위 is said only when the code says overhead
 * (within 15 km); otherwise the offset is measured from 이곳. Numbers with SI units, degrees and percent are num() parts
 * (786 km, 7.46 km/s, 5.4°, 25%), and particles after them take the vowel forms (km에서, km/s로, °였다); a counter (분) is
 * plain text right after its number. Instruments: 찍다 only where the English says a camera imaged, 담다 for radar, 훑다
 * for a sweep, never 촬영 or 감시. "Your horizon", "your sky", "your spot" are 이곳 지평선, 이곳 하늘, 이 지점: 당신 is
 * kept for the brand lines. The 16-point readout compass is the Korea Meteorological Administration's wind words.
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import type { Compass8 } from '@/ui/results/lib/copy'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('ko')

/** The 8-point compass in prose: every word ends in 쪽, so 으로, 을 향해 and 하늘 after it are fixed */
const WORDS: Record<Compass8, string> = {
  n: '북쪽',
  ne: '북동쪽',
  e: '동쪽',
  se: '남동쪽',
  s: '남쪽',
  sw: '남서쪽',
  w: '서쪽',
  nw: '북서쪽',
}
/** Where the satellite or the sky was from the place: "이곳에서 서쪽으로", "남서쪽 하늘" */
const TOWARD: Record<Compass8, string> = WORDS
/** Where the satellite or the scan line was moving: "남쪽을 향해", "북쪽으로 이동 중이었다" */
const HEADING: Record<Compass8, string> = WORDS

const km = (n: number) => num(f.int(n), 'km')
const deg1 = (n: number) => num(f.dec(n, 1), '°')
const clock = (time: string, zone: string) => num(time, zone)

/** "0.2°W" → "서경 0.2°", "140.8°E" → "동경 140.8°": the seat arrives in international notation; prose says it in words */
function longitude(seat: string): string {
  const m = /^(\d+(?:\.\d+)?)°\s*([EW])$/.exec(seat.trim())
  return m ? `${m[2] === 'W' ? '서경' : '동경'} ${m[1]}°` : seat
}

/**
 * After "[SAT] 위성은 [TIME]": "에 고도 786 km에서 이곳 바로 위를 지나갔다." / "에 고도 786 km, 이곳에서 서쪽으로 61 km
 * 떨어진 곳 위를 지나갔다."
 */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset
    ? ['에 고도 ', km(altKm), `, 이곳에서 ${TOWARD[offset.dir]}으로 `, km(offset.km), ' 떨어진 곳 위를 지나갔다.']
    : ['에 고도 ', km(altKm), '에서 이곳 바로 위를 지나갔다.']

const pass: typeof en = {
  /** The KMA's 16 wind directions, in Hangul (never Latin NNE in a ko readout): at most 3 syllables */
  compass16: {
    n: '북',
    nne: '북북동',
    ne: '북동',
    ene: '동북동',
    e: '동',
    ese: '동남동',
    se: '남동',
    sse: '남남동',
    s: '남',
    ssw: '남남서',
    sw: '남서',
    wsw: '서남서',
    w: '서',
    wnw: '서북서',
    nw: '북서',
    nnw: '북북서',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    /**
     * "Meteosat-12 위성은 지나가지 않는다. 적도 상공 35,778 km, 서경 0.2°에 머물며 10분마다 아래로 보이는 지구 전면을
     * 훑는다." (no seat: 적도 상공 35,778 km에 머물며 …; no cadence: …머물며 아래로 보이는 지구 전면을 훑는다.)
     */
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `${o.sat} 위성은 지나가지 않는다. 적도 상공 `,
      km(o.altKm),
      o.seat !== undefined ? `, ${longitude(o.seat)}에 머물며 ` : '에 머물며 ',
      ...(o.cadenceMin ? [num(f.int(o.cadenceMin)), '분마다 아래로 보이는 지구 전면을 훑는다.'] : ['아래로 보이는 지구 전면을 훑는다.']),
    ],
    /** "이번 스캔 선은 07:49 CET쯤 Paris에 닿았고, 북쪽으로 이동 중이었다." (쯤 attaches to the clock: "about") */
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      '이번 스캔 선은 ',
      clock(o.time, o.zone),
      `쯤 ${o.place}에 닿았고, ${HEADING[o.heading]}으로 이동 중이었다.`,
    ],
    infrared: '이곳은 어두웠다. 그래서 이 이미지는 적외선이다. 구름 꼭대기를 온도로 나타내며, 차가울수록 밝다.',
  },

  // ── a pass with a picture ────────────────────────────────────────────────────────────────
  /**
   * "Sentinel-2C 위성은 16:14:21 UTC에 고도 786 km에서 이곳 바로 위를 지나갔다. 남쪽을 향해 7.46 km/s로 이동
   * 중이었다." (향해 avoids two 로 in a row)
   */
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    `${o.sat} 위성은 `,
    clock(o.time, o.zone),
    ...where(o.altKm, o.offset),
    ` ${HEADING[o.heading]}을 향해 `,
    num(f.dec(o.speedKmS, 2), 'km/s'),
    '로 이동 중이었다.',
  ],
  /** "VIIRS 센서가 Waterloo 일대를 훑었다. 그 모습은 NASA의 일일 자연색 합성 이미지에 픽셀당 375 m로 담겼다." */
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `${o.sensor} 센서가 ${o.place} 일대를 훑었다. 그 모습은 NASA의 일일 자연색 합성 이미지에 픽셀당 `,
    num(f.int(o.gsdM), 'm'),
    '로 담겼다.',
  ],
  /** "레이더가 옆으로 35.2° 비스듬히 Waterloo 일대를 픽셀당 20 m로 담았다." (+ 어둠 속이었다.): radar 담다, never 찍다 */
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    '레이더가 옆으로 ',
    deg1(o.deg),
    ` 비스듬히 ${o.place} 일대를 픽셀당 `,
    num(f.int(o.gsdM), 'm'),
    o.dark ? '로 담았다. 어둠 속이었다.' : '로 담았다.',
  ],
  lookingDown: '바로 아래를 보고 있었다.',
  lookingOff: (deg: number): Rich => ['바로 아래에서 ', deg1(deg), ' 비스듬히 보고 있었다.'],
  /** A readout-like fact: a noun and a colon */
  cloudCover: (pct: number): Rich => ['장면 전체 구름양: ', num(f.int(pct), '%'), '.'],

  // ── "Likely watched" ─────────────────────────────────────────────────────────────────────
  likely: {
    /**
     * "… 이곳 바로 위를 지나갔다. 이곳은 관측 폭 290 km 안이었다." (no swath: the first sentence alone). The noun +
     * copula 안이었다 (as 이동 중이었다), not 안에 있었다: the sentences that follow (notYet's 기록했다, 공개되지 않았다;
     * dark's 어두웠다) end in plain -었다 too, and §2.2 allows no three in a row
     */
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      `${o.sat} 위성은 `,
      clock(o.time, o.zone),
      ...where(o.altKm, o.offset),
      ...(o.swathKm ? [' 이곳은 관측 폭 ', km(o.swathKm), ' 안이었다.'] : []),
    ],
    /** "could not be searched just now": 방금 (a moment ago), which agrees with the past 없었다; 지금은 would not */
    archiveFailed: '낮이었으므로 이 지점을 기록했을 것이다. 방금은 아카이브를 검색할 수 없었다.',
    noScene: '이번 통과의 장면은 없다. Sentinel-2는 육지와 연안 수역만 기록하며, 이 지점을 관측 계획에 넣지 않았을 수 있다.',
    notYet:
      '낮이었으므로 이 지점을 거의 확실히 기록했다. ' +
      '이번 통과의 장면은 아직 공개되지 않았다. 아카이브 반영은 하루 이상 늦어질 수 있다.',
    /** "your clouds, not your streets": the reader is still the one whose clouds were seen, without 당신의 */
    dark: '여기는 어두웠다. 기상위성의 센서는 밤에도 적외선으로 계속 훑는다. 그래서 거리가 아니라 구름을 봤다.',
    mosaicUnconfirmed: '이번 통과의 NASA 일일 합성 이미지가 이 지점에서 확인되지 않았다.',
    notPublished: '이 위성의 이미지는 일기예보에 쓰인다. 여기서 보여 줄 수 있는 이미지로는 공개되지 않는다.',
  },

  // ── "Could have pointed here" ────────────────────────────────────────────────────────────
  could: {
    /**
     * "WorldView Legion 4 위성은 10:52 EST에 이곳이 보이는 범위를 지나갔다. 이곳에서 서쪽으로 61 km 떨어진 곳이었다."
     * (no offset: "… 10:52 EST에 이곳 바로 위를 지나갔다.")
     */
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `${o.sat} 위성은 `,
      clock(o.time, o.zone),
      ...(o.offset
        ? [`에 이곳이 보이는 범위를 지나갔다. 이곳에서 ${TOWARD[o.offset.dir]}으로 `, km(o.offset.km), ' 떨어진 곳이었다.']
        : ['에 이곳 바로 위를 지나갔다.']),
    ],
    /** Starts with the place: "Waterloo 일대는 관측 폭 290 km 안에 있었다. …" ("we can't know" without 우리) */
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      `${o.place} 일대는 관측 폭 `,
      km(o.swathKm),
      ' 안에 있었다. 운영사는 어디를 찍었는지 공개하지 않는다. 그래서 실제로 찍었는지는 알 수 없다.',
    ],
    /** "레이더는 구름과 어둠을 뚫고 본다. 옆으로 23.4° 비스듬히 향했다면 Waterloo 일대를 담을 수 있었다. …" */
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      '레이더는 구름과 어둠을 뚫고 본다. ',
      ...(o.deg === undefined ? [] : ['옆으로 ', deg1(o.deg), ' 비스듬히 향했다면 ']),
      `${o.place} 일대를 담을 수 있었다.`,
      o.openArchive ? ' 이번 통과에서 공개된 이미지는 찾지 못했다.' : ' 실제로 그랬는지는 알 수 없다.',
    ],
    /** "바로 아래에서 23.4° 기울였다면 Waterloo 일대를 지켜볼 수 있었다. 실제로 그랬는지는 알 수 없다." */
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined ? ['바로 아래를 보고 있었다면 '] : ['바로 아래에서 ', deg1(o.deg), ' 기울였다면 ']),
      `${o.place} 일대를 지켜볼 수 있었다. 실제로 그랬는지는 알 수 없다.`,
    ],
  },

  // ── "Passed overhead" ────────────────────────────────────────────────────────────────────
  /**
   * "ISS 위성은 21:04 CET에 고도 418 km 상공을 지나갔다. 이곳에서 보면 남서쪽 하늘, 지평선 위 54°였다." / near the
   * zenith: "… 이곳에서 보면 지평선 위 84°, 거의 바로 머리 위였다." (never 천정, heard as 천장)
   */
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `${o.sat} 위성은 `,
    clock(o.time, o.zone),
    '에 고도 ',
    km(o.altKm),
    ' 상공을 지나갔다. 이곳에서 보면 ',
    ...(o.toward === undefined
      ? ['지평선 위 ', num(f.int(o.elevationDeg), '°'), ', 거의 바로 머리 위였다.']
      : [`${TOWARD[o.toward]} 하늘, 지평선 위 `, num(f.int(o.elevationDeg), '°'), '였다.']),
  ],
  darkStation: '이곳은 어두웠다. 우주정거장이 아직 햇빛을 받고 있었다면, 깜빡이지 않는 밝은 점으로 이곳 하늘을 가로질렀을 것이다.',
}
export default pass
