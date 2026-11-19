/**
 * Traditional Chinese copy for the pass list and the view of one pass (see docs/i18n/zh-Hant.md §3.4, §4, Appendix A).
 *
 * Why the words are these: a pass is 過境, counted with 次, and every verdict counts passes, so a count is one form
 * ("1 次過境", "31 次過境"; zh has one plural category). Rows are 項 ("再顯示 40 項": 次 there would say "show it again
 * 40 times"), satellites 顆. The footnotes under the plan view point up at the drawing (上圖是這次過境的平面圖, never
 * 以下是), and an open archive's footnote avoids 拍攝 because that archive can be radar. Offsets from nadir are 側視角
 * in labels and 偏離正下方 in prose; a scene's own cloud cover is 原圖 against the crop on screen. Readout labels are
 * noun phrases with no punctuation but · and /; `latest` and `closest` keep their trailing space (a mono row's label
 * and value are spaced). The elevation's unit is empty or the compass word alone: the label already says 仰角.
 * Satellite names are placed through cjkGap, and kept on one line (keepName) where a footnote prints them.
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'
import { keepName, withName } from '../../../api/_lib/i18n/card/zh-Hant'

const f = fmt('zh-Hant')
/** The footnote's second sentence: the drawing is above it */
const PLAN = '上圖是這次過境的平面圖。'

/** "每 10 分鐘就", "每分鐘就", "每隔幾分鐘就": how often a geostationary imager takes a full-disc image */
const every = (min?: number) => (!min ? '每隔幾分鐘就' : min === 1 ? '每分鐘就' : `每 ${f.int(min)} 分鐘就`)

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty: '這段期間沒有我們追蹤的衛星飛越這個地點。這很少見；上方的說明會指出是否有資料來源中斷。',
  imagedOrder: '最清晰的一張在前，其餘由新到舊',
  /** Every verdict counts passes (DESIGN §7): one unit for all */
  count: (n: number, _verdict: Verdict) => `${f.int(n)} 次過境`,
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), '次過境'),
  sats: (n: number) => `${f.int(n)} 顆`,
  showAllSats: (n: number) => `顯示全部 ${f.int(n)} 顆衛星`,
  showAllRows: (n: number) => `顯示全部 ${f.int(n)} 項`,
  showMore: (n: number) => `再顯示 ${f.int(n)} 項`,
  left: (n: number) => `還有 ${f.int(n)} 項`,
  showFewer: '收起',
  tag: {
    mosaic: '拼接',
    radar: '雷達',
    cloudedPct: (pct: number) => `雲層遮蔽 · ${f.int(pct)}%`,
    cloudedAtSpot: '雲層遮蔽 · 地點有雲',
  },
  /** "Sentinel-2B，注視過，11月6日星期五 10:52 EST，41 小時前，雲量 25%，雲層遮蔽" */
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [o.sat, o.verb, `${o.day} ${o.time} ${o.zone}`, o.ago, o.cloudPct !== undefined ? `雲量 ${f.int(o.cloudPct)}%` : undefined, o.clouded ? '雲層遮蔽' : undefined]
      .filter(Boolean)
      .join('，'),
  offNadir: (deg: number) => `側視角 ${f.dec(deg, 1)}°`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)} km`,
  cloudPct: (pct: number) => `雲量 ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `放大影像：${sat}，${day} ${time}`,
  expandTitle: '放大影像',
  /** "Sentinel-2B，ESA，3 次過境，最新一次 11月6日星期五 10:52" */
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `，${o.operator}` : ''}，${f.int(o.passes)} 次過境，最新一次 ${o.day} ${o.time}`,
  latest: '最新 ',
  closest: '最接近 ',
  cloudChip: '雲',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: '影像',
  planSection: '平面圖',
  geometry: '幾何',
  replay: '重播',
  /** 整個星期, never 這星期: a shared frame can sit in an older window (§3.4: the window may be an older week) */
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `這是一張全圓盤影像：衛星看得到的整個地球圓面拍成一張，這裡每像素 ${pixel}。雖然粗略，但是真實的，也是最新公開的一張；它整個星期${every(cadenceMin)}拍一張這樣的影像。`,
  mosaicNote: (gsdM: number) =>
    `這是每日拼接影像：NASA 把每天的掃描帶拼成一張，每像素 ${f.int(gsdM)} m。雖然粗略，但是真實的，也來自這次過境的那一天。`,
  radarNote:
    '這是雷達影像，不是照片：Sentinel-1 發出微波並記錄回波，所以不受雲層和黑暗影響。亮度代表地面反射回來的強弱：建築物和粗糙地面較亮，平靜的水面較暗。',
  noImage: {
    openArchive: (sat: string) => `${withName('', keepName(sat), '這次過境沒有這個地點的影像。')}${PLAN}`,
    radarPrivate: `沒有公開影像：這家雷達營運商的影像庫不公開。${PLAN}`,
    commercialPrivate: `沒有公開影像：商業影像庫不公開。${PLAN}`,
    noneToShow: `這次過境沒有可顯示的影像。${PLAN}`,
    archiveDown: `暫時無法搜尋影像庫。${PLAN}`,
    noScene: `這次過境沒有影像。${PLAN}`,
    notYet: '還沒有公開影像對應這次過境。Sentinel-2 和 Landsat 的影像通常在一天內出現。',
    crewed: '載人太空站上有相機，但照片不會按地點和時間公開。',
    unavailable: '無法取得這次過境的影像。',
  },
  links: {
    openToSave: '開啟影像以儲存',
    downloading: '下載中…',
    download: '下載影像',
    viewSource: (archive: string) => `查看來源 · ${archive}`,
  },
  spot: {
    checking: '正在讀取地點上的像素…',
    clear: '你選的地點上空無雲。',
    cirrus: '你選的地點上空有薄卷雲，畫面可能稍微模糊。',
    cloud: '你選的地點上空有雲。',
    shadow: '你選的地點在雲影中。',
  },

  // ── the readout strip ───────────────────────────────────────────────────────────────────
  strip: {
    altitude: '高度',
    elevation: '仰角',
    offNadir: '側視角',
    pixel: '像素',
    band: '波段',
    sun: '太陽',
    cloud: '雲量',
    cloudAtSpot: '地點雲況',
  },
  band: { infrared: '紅外線', visible: '可見光', colour: '彩色' },
  spotValue: { clear: '無雲', cirrus: '卷雲', cloud: '有雲', shadow: '雲影' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    /** 仰角 already says "above your horizon": no unit after it */
    up: '',
    mosaic: '拼接',
    scene: '原圖',
    sun: { day: '日間', twilight: '晨昏', night: '夜間' },
  },

  // ── 01 / Geometry ──────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: '最接近 · UTC',
    closestLocal: '最接近 · 當地',
    groundDistance: '地面距離',
    elevationFromYou: '仰角',
    groundSpeed: '地面速度',
    heading: '航向',
    sunElevation: '太陽仰角',
    fieldOfRegard: '可轉向範圍',
    swath: '掃描帶',
    inSwath: '在掃描帶內',
    inView: '在可視範圍內',
    window: '時段',
    noradPass: 'NORAD · 過境',
    scanUtc: '掃描線到達 · UTC',
    scanLocal: '掃描線到達 · 當地',
    aboveEquator: '赤道上空位置',
    inYourSky: '天空位置',
    scanDirection: '掃描方向',
    lineSpeed: '掃描線速度',
    coverage: '涵蓋範圍',
    thisScan: '這次掃描',
    noradScan: 'NORAD · 掃描',
  },
  northToSouth: '北 → 南',
  southToNorth: '南 → 北',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: '日間', twilight: '晨昏', night: '夜間' },
  fullDisc: '全圓盤',
  everyMin: (n: number) => `每 ${f.int(n)} 分鐘`,
  /** The compass word alone after the elevation ("南南西"): the degrees already say how high (§4.2) */
  upCompass: (compass: string) => compass,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? '升軌' : '降軌'}`,
}

export default passView
