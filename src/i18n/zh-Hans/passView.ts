/**
 * Simplified Chinese copy for the pass list and the view of one pass (see docs/i18n/zh-Hans.md §3.5, §4, Appendix A).
 *
 * Why the words are these: a pass is 过境, counted with 次, and every verdict counts passes, so a count is one form
 * ("1 次过境", "31 次过境"; zh has one plural category). Rows are 条 ("再显示 40 条": 次 there would say "show it again
 * 40 times"). The notes under the plan view point up at the drawing (上图是这次过境的示意图), and a radar image is
 * never a 照片. A number and its measure word are joined by U+00A0, so "31 颗" never splits, and so are a number and
 * its unit in the notes that wrap ("每像素 375 m"). Readout labels are noun
 * phrases with no punctuation but · and /; `latest` and `closest` keep their trailing space (a mono row's label and
 * value are spaced). Satellite names are placed through cjkGap.
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'
import { withName } from '../../../api/_lib/i18n/card/zh-Hans'

const f = fmt('zh-Hans')
const NB = ' '
/** The footnote's second sentence: the drawing is above it */
const PLAN = '上图是这次过境的示意图。'

/** "每 10 分钟", "每分钟", "每隔几分钟": how often a geostationary imager takes a full-disc image */
const every = (min?: number) => (!min ? '每隔几分钟就' : min === 1 ? '每分钟都' : `每 ${f.int(min)}${NB}分钟就`)

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty: '这段时间里，我们追踪的卫星没有一颗经过这里。这种情况很少见；如果当时有数据源出了故障，上面的说明会写明。',
  imagedOrder: '最清晰画面在前，其余由新到旧',
  /** Every verdict counts passes (DESIGN §7): one unit for all */
  count: (n: number, _verdict: Verdict) => `${f.int(n)}${NB}次过境`,
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), '次过境'),
  sats: (n: number) => `${f.int(n)}${NB}颗`,
  showAllSats: (n: number) => `显示全部 ${f.int(n)}${NB}颗卫星`,
  showAllRows: (n: number) => `显示全部 ${f.int(n)}${NB}条`,
  showMore: (n: number) => `再显示 ${f.int(n)}${NB}条`,
  left: (n: number) => `还有 ${f.int(n)}${NB}条`,
  showFewer: '收起',
  tag: {
    mosaic: '拼接图',
    radar: '雷达',
    cloudedPct: (pct: number) => `云层遮挡 · ${f.int(pct)}%`,
    cloudedAtSpot: '此处有云',
  },
  /** "Sentinel-2C，注视过，11月6日星期五 11:21 EST，41 小时前，云量 25%，云层遮挡" */
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [o.sat, o.verb, `${o.day} ${o.time} ${o.zone}`, o.ago, o.cloudPct !== undefined ? `云量 ${f.int(o.cloudPct)}%` : undefined, o.clouded ? '云层遮挡' : undefined]
      .filter(Boolean)
      .join('，'),
  offNadir: (deg: number) => `偏离垂直 ${f.dec(deg, 1)}°`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)} km`,
  cloudPct: (pct: number) => `云量 ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `查看大图：${sat}，${day} ${time}`,
  expandTitle: '查看大图',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `，${o.operator}` : ''}，${f.int(o.passes)}${NB}次过境，最新一次：${o.day} ${o.time}`,
  latest: '最新 ',
  closest: '最接近 ',
  cloudChip: '有云',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: '图像',
  planSection: '示意图',
  /** 观测几何, not 过境几何: the same section rule heads a geostationary scan, whose sentence says it never passes */
  geometry: '观测几何',
  replay: '回放',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `这是一张全圆盘图像：这颗卫星能看到的一切都在这一张画面里，这里每像素 ${pixel}。画面虽然粗糙，但是真实的，也是已发布的最新一张；这一周它${every(cadenceMin)}获取一张这样的图像。`,
  mosaicNote: (gsdM: number) =>
    `这是一张每日拼接图：NASA 把每天的成像带拼成一张画面，每像素 ${f.int(gsdM)}${NB}m。画面虽然粗糙，但是真实的，而且来自这次过境的当天。`,
  radarNote:
    '这是雷达图像，不是照片：Sentinel-1 发射微波并记录回波，所以云层和黑夜都挡不住它。亮度表示地面反射微波的强弱：建筑和粗糙的地面较亮，平静的水面较暗。',
  noImage: {
    openArchive: (sat: string) => `${withName('', sat, '这次过境没有此处的图像。')}${PLAN}`,
    radarPrivate: `没有公开图像：这家雷达运营方的图像库不公开。${PLAN}`,
    commercialPrivate: `没有公开图像：商业图像库不公开。${PLAN}`,
    noneToShow: `这次过境没有可显示的图像。${PLAN}`,
    archiveDown: `暂时无法检索图像库。${PLAN}`,
    noScene: `这次过境没有对应的图像。${PLAN}`,
    notYet: '还没有与这次过境对应的公开图像。Sentinel-2 和 Landsat 的图像通常在一天内出现。',
    crewed: '载人空间站带有相机，但它们的照片不会按地点和时间公开。',
    unavailable: '这次过境的图像无法显示。',
  },
  links: {
    openToSave: '打开图像后保存',
    downloading: '正在下载…',
    download: '下载图像',
    viewSource: (archive: string) => `查看来源 · ${archive}`,
  },
  spot: {
    checking: '正在读取此处的像素…',
    clear: '此处上空无云。',
    cirrus: '此处上空有薄卷云，画面可能略显模糊。',
    cloud: '此处有云。',
    shadow: '此处当时在云影里。',
  },

  // ── the readout strip ───────────────────────────────────────────────────────────────────
  strip: {
    altitude: '高度',
    elevation: '仰角',
    offNadir: '偏离垂直',
    pixel: '像素',
    band: '波段',
    sun: '太阳',
    cloud: '云量',
    cloudAtSpot: '此处云况',
  },
  band: { infrared: '红外', visible: '可见光', colour: '彩色' },
  spotValue: { clear: '无云', cirrus: '薄卷云', cloud: '有云', shadow: '云影' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    /** 仰角 already says "above your horizon": the strip shows no unit after it */
    up: '',
    mosaic: '拼接图',
    scene: '整幅',
    sun: { day: '白天', twilight: '晨昏', night: '夜间' },
  },

  // ── 01 / Geometry ──────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: '最接近 · UTC',
    closestLocal: '最接近 · 当地',
    groundDistance: '地面距离',
    elevationFromYou: '此处仰角',
    groundSpeed: '地面速度',
    heading: '航向',
    sunElevation: '太阳高度角',
    fieldOfRegard: '可视范围',
    swath: '幅宽',
    inSwath: '在成像带内',
    inView: '在可视范围内',
    window: '时间窗',
    noradPass: 'NORAD · 过境',
    scanUtc: '扫描线到达 · UTC',
    scanLocal: '扫描线到达 · 当地',
    aboveEquator: '定点经度',
    inYourSky: '你的天空',
    scanDirection: '扫描方向',
    lineSpeed: '扫描线速度',
    coverage: '覆盖',
    thisScan: '本次扫描',
    noradScan: 'NORAD · 扫描',
  },
  northToSouth: '北 → 南',
  southToNorth: '南 → 北',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: '白天', twilight: '晨昏', night: '夜间' },
  fullDisc: '全圆盘',
  everyMin: (n: number) => `每 ${f.int(n)}${NB}分钟`,
  /** "In your sky": the elevation (仰角) and the compass point it stands at */
  upCompass: (compass: string) => `仰角 · ${compass}`,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? '升轨' : '降轨'}`,
}

export default passView
