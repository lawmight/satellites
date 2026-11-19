/**
 * Korean copy for the pass list and the view of one pass (see docs/i18n/ko.md §3.7 "passView", §4, §5.4).
 *
 * Why the words are these: a pass is 통과 (패스 means pass, password or skip), and every verdict counts passes, so a
 * count is one form for all, 회 (1회, 31회; ko has one plural category). Satellites take 기 and list rows 개: a row is a
 * satellite or a photo, not a pass, so 40회 더 보기 would state a false count. In a stacked readout the counter may be
 * the num unit (`countStack`); everywhere else it is text attached to the number. Readout labels are Sino-Korean
 * nouns of two to five syllables with no particle (고도, 고도각, 기울기, 지점 구름), because the strip's four cells
 * share a phone's width: elevation is 고도각 (고도 is the orbit's height), off-nadir 기울기, heading 진행 방향,
 * ascending and descending 북행 / 남행 (never 상승 / 하강, which climb). The notes under the plan view say what is
 * missing, then 통과 평면도를 보여 준다; a radar image is never 사진, a daily mosaic is 일일 합성 이미지 (모자이크 means
 * censorship blurring). A satellite's name takes the buffer 위성이 (§5.1); "your spot" is 이 지점, never 당신의.
 * `latest` and `closest` keep their trailing space: a mono row's label and value are separate words.
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'

const f = fmt('ko')
/** The footnote's second sentence: the drawing above it */
const PLAN = '통과 평면도를 보여 준다.'

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty: '추적 중인 어떤 위성도 이 기간에 이곳을 지나가지 않았다. 드문 일이다. 데이터 출처가 멈췄다면 위의 주석에 적혀 있다.',
  imagedOrder: '가장 자세한 모습부터, 이후 최신순',
  /** Every verdict counts passes (DESIGN §7): one unit, 회, for all */
  count: (n: number, _verdict: Verdict) => `${f.int(n)}회`,
  /** A stacked readout: here the counter is the num unit, like 786 km */
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), '회'),
  sats: (n: number) => `위성 ${f.int(n)}기`,
  showAllSats: (n: number) => `위성 ${f.int(n)}기 모두 보기`,
  showAllRows: (n: number) => `${f.int(n)}개 모두 보기`,
  showMore: (n: number) => `${f.int(n)}개 더 보기`,
  left: (n: number) => `${f.int(n)}개 남음`,
  showFewer: '접기',
  tag: {
    mosaic: '합성',
    radar: '레이더',
    cloudedPct: (pct: number) => `구름 · ${f.int(pct)}%`,
    /** The glossary's 지점 구름: it reads as one tag when it stands alone (no cloud percentage) */
    cloudedAtSpot: '지점 구름',
  },
  /** "Sentinel-2C, 지켜봤다, 11월 6일 금요일 16:14 EST, 41시간 전, 구름 25퍼센트, 구름에 가림" (read aloud: 퍼센트 in words) */
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [o.sat, o.verb, `${o.day} ${o.time} ${o.zone}`, o.ago, o.cloudPct !== undefined ? `구름 ${f.int(o.cloudPct)}퍼센트` : undefined, o.clouded ? '구름에 가림' : undefined]
      .filter(Boolean)
      .join(', '),
  offNadir: (deg: number) => `기울기 ${f.dec(deg, 1)}°`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)} km`,
  cloudPct: (pct: number) => `구름 ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `이미지 크게 보기: ${sat}, ${day} ${time}`,
  expandTitle: '크게 보기',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, 통과 ${f.int(o.passes)}회, 최근 ${o.day} ${o.time}`,
  latest: '최근 ',
  closest: '최근접 ',
  cloudChip: '구름',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: '이미지',
  planSection: '평면도',
  /** 통과 기하, as the share card says: 기하 alone reads as the school subject */
  geometry: '통과 기하',
  replay: '다시 보기',
  /** 찍다 is right here: the English says the satellite "has taken" these images. `pixel` ends on a unit read with a vowel (킬로미터), so 다 */
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `지구 전면 이미지: 위성이 볼 수 있는 모든 것을 한 장에 담은 이미지다. 이곳에서는 픽셀 하나가 ${pixel}다. 거칠지만 실제 이미지이고, 공개된 것 중 가장 최신이다. 이 위성은 일주일 내내 ${
      cadenceMin ? `${f.int(cadenceMin)}분마다` : '몇 분마다'
    } 이런 이미지를 찍었다.`,
  /** 이어 붙인 (stitched): never 모자이크 */
  mosaicNote: (gsdM: number) =>
    `일일 합성 이미지: NASA가 하루 동안의 관측 폭을 한 장으로 이어 붙인 이미지다. 픽셀당 ${f.int(gsdM)} m. 거칠지만 실제 이미지이고, 이번 통과가 있던 날의 것이다.`,
  radarNote:
    '레이더 이미지이지 사진이 아니다. Sentinel-1은 마이크로파를 쏘고 그 반사파를 기록하므로, 구름과 어둠에 막히지 않는다. 밝기는 지면이 전파를 얼마나 강하게 되돌려 보내는지를 나타낸다. 건물과 거친 지면은 밝고, 잔잔한 물은 어둡다.',
  noImage: {
    /** Only Sentinel-1 has an open archive (profiles.ts), so the satellite is a radar: 담다, never 찍다 (§2.3) */
    openArchive: (sat: string) => `${sat} 위성이 이번 통과에서 이 지점을 담은 이미지는 없다. ${PLAN}`,
    radarPrivate: `공개 이미지 없음: 이 레이더 운영사의 아카이브는 비공개다. ${PLAN}`,
    commercialPrivate: `공개 이미지 없음: 상업 아카이브는 비공개다. ${PLAN}`,
    noneToShow: `이번 통과에 보여 줄 이미지가 없다. ${PLAN}`,
    /** "just now" is 방금은, as pass.likely.archiveFailed says it: it agrees with the past 없었다, and 지금은 would not */
    archiveDown: `방금은 아카이브를 검색할 수 없었다. ${PLAN}`,
    noScene: `이번 통과의 장면은 없다. ${PLAN}`,
    notYet: '이번 통과와 맞는 공개 장면이 아직 없다. Sentinel-2와 Landsat 장면은 보통 하루 안에 올라온다.',
    crewed: '우주정거장에도 카메라가 있지만, 그 사진은 장소와 시각별로 공개되지 않는다.',
    unavailable: '이번 통과의 이미지를 불러올 수 없다.',
  },
  /** 저장, never 다운로드, on a button */
  links: {
    openToSave: '이미지 열어서 저장',
    downloading: '저장 중…',
    download: '이미지 저장',
    viewSource: (archive: string) => `원본 보기 · ${archive}`,
  },
  spot: {
    checking: '이 지점의 픽셀을 읽는 중…',
    clear: '이 지점 위는 맑았다.',
    cirrus: '이 지점 위에 얇은 권운이 표시됐다. 이미지가 조금 흐릴 수 있다.',
    cloud: '이 지점 위에 구름이 있었다.',
    shadow: '이 지점은 구름 그림자 속이었다.',
  },

  // ── the readout strip (four cells across: two to five syllables a label) ─────────────────
  strip: {
    altitude: '고도',
    elevation: '고도각',
    offNadir: '기울기',
    pixel: '픽셀',
    band: '밴드',
    sun: '태양',
    cloud: '구름양',
    cloudAtSpot: '지점 구름',
  },
  band: { infrared: '적외선', visible: '가시광', colour: '컬러' },
  spotValue: { clear: '맑음', cirrus: '권운', cloud: '구름', shadow: '그림자' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    /** degrees above the horizon: 위 */
    up: '위',
    mosaic: '합성',
    scene: '장면',
    /** 낮, never 일 (a date, and Sunday) */
    sun: { day: '낮', twilight: '박명', night: '밤' },
  },

  // ── 01 / Geometry ───────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: '최근접 시각 · UTC',
    closestLocal: '최근접 시각 · 현지',
    groundDistance: '지상 거리',
    elevationFromYou: '고도각',
    groundSpeed: '지상 속도',
    heading: '진행 방향',
    sunElevation: '태양 고도',
    fieldOfRegard: '지향 범위',
    swath: '관측 폭',
    inSwath: '관측 폭 안',
    inView: '시야 안',
    window: '기간',
    noradPass: 'NORAD · 통과',
    scanUtc: '스캔 선 도달 · UTC',
    scanLocal: '스캔 선 도달 · 현지',
    /** The value is a longitude (0.2°W) */
    aboveEquator: '적도 위 경도',
    inYourSky: '이곳 하늘',
    scanDirection: '스캔 방향',
    lineSpeed: '이곳 스캔 속도',
    coverage: '관측 범위',
    thisScan: '이번 스캔',
    noradScan: 'NORAD · 스캔',
  },
  northToSouth: '북 → 남',
  southToNorth: '남 → 북',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: '낮', twilight: '박명', night: '밤' },
  fullDisc: '지구 전면',
  everyMin: (n: number) => `${f.int(n)}분마다`,
  upCompass: (compass: string) => `위 · ${compass}`,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? '북행' : '남행'}`,
}

export default passView
