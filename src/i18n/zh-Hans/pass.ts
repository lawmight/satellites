/**
 * Simplified Chinese copy for one pass's paragraph (see docs/i18n/zh-Hans.md §3.5, every case): the sentences under a
 * pass's picture or plan view.
 *
 * Why the sentences are shaped this way: the satellite opens the paragraph and the moment follows with 于 ("Sentinel-2C
 * 于 16:14:21 UTC…"), so the paragraph starts on the name, not on a mono clock; the clock always carries its zone, so
 * 当地时间 is never written before it (it would be false at sea). Chinese words a direction three ways, so there are
 * three uses of one table: a heading (向南飞行), an offset that names its reference point (在这里以西 61 km 处, 西南方向 for
 * the diagonals) and a direction in your sky (你西南方的天空). A camera looking down 俯视 (the English's personified
 * "looking"); a radar 成像, never 拍下; "dark" is 天黑 (the sun below the horizon), not 夜里. "Scene" is 整幅画面.
 * Names arrive bare and are spaced through cjkGap (withName), so "Sentinel-2C 于" and "为 Waterloo 成像" but "为北京成像".
 * Every number with its unit is a num() part, as in English. The 16-point compass stays Latin: Chinese 16-point names
 * (北东北) are unfamiliar to most readers, and the readouts are technical notation (§4.2, §6.6).
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import type { Compass8, Compass16 } from '@/ui/results/lib/copy'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import { withName } from '../../../api/_lib/i18n/card/zh-Hans'

const f = fmt('zh-Hans')

/** The 8 compass words, east or west first (东北, never 北东) */
const WORD: Record<Compass8, string> = { n: '北', ne: '东北', e: '东', se: '东南', s: '南', sw: '西南', w: '西', nw: '西北' }
/** Where the satellite was from the place, after 这里: 以西 for the cardinal points, 西南方向 for the diagonals */
const FROM: Record<Compass8, string> = {
  n: '以北',
  ne: '东北方向',
  e: '以东',
  se: '东南方向',
  s: '以南',
  sw: '西南方向',
  w: '以西',
  nw: '西北方向',
}

const km = (n: number) => num(f.int(n), 'km')
const clock = (time: string, zone: string) => num(time, zone)
const deg1 = (deg: number) => num(f.dec(deg, 1), '°')
/** "Sentinel-2C 于 ": the satellite opens the sentence, its moment follows */
const at = (sat: string) => `${withName('', sat, '于')} `
/** "从正上方 786 km 高空经过" / "从 786 km 高空经过，在这里以西 61 km 处" (after the clock) */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset ? [' 从 ', km(altKm), ` 高空经过，在这里${FROM[offset.dir]} `, km(offset.km), ' 处'] : [' 从正上方 ', km(altKm), ' 高空经过']

/** "0.2°W" → "西经 0.2°": prose spells the hemisphere in Han, before the number (§6.6); anything else is kept as it is */
function seatPhrase(seat: string): string {
  const m = /^(\d+(?:\.\d+)?)°([EW])$/.exec(seat.trim())
  return m ? `它悬在${m[2] === 'E' ? '东经' : '西经'} ${m[1]}° 的赤道上空 ` : `它悬在 ${seat} 的赤道上空 `
}

const pass: typeof en = {
  compass16: {
    n: 'N',
    nne: 'NNE',
    ne: 'NE',
    ene: 'ENE',
    e: 'E',
    ese: 'ESE',
    se: 'SE',
    sse: 'SSE',
    s: 'S',
    ssw: 'SSW',
    sw: 'SW',
    wsw: 'WSW',
    w: 'W',
    wnw: 'WNW',
    nw: 'NW',
    nnw: 'NNW',
  } satisfies Record<Compass16, string>,

  // ── a geostationary scan ──────────────────────────────────────────────────────────────────
  geo: {
    /** "Meteosat-12 从不过境。它悬在西经 0.2° 的赤道上空 35,778 km 处，每 10 分钟把下方的整个地球圆盘扫描一遍。" */
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      withName('', o.sat, '从不过境。'),
      o.seat !== undefined ? seatPhrase(o.seat) : '它悬在赤道上空 ',
      km(o.altKm),
      ...(!o.cadenceMin
        ? [' 处，不停地扫描下方的整个地球圆盘。']
        : o.cadenceMin === 1
          ? [' 处，每分钟把下方的整个地球圆盘扫描一遍。']
          : [' 处，每 ', num(f.int(o.cadenceMin), '分钟'), '把下方的整个地球圆盘扫描一遍。']),
    ],
    /** "这一次，扫描线约在 07:49 CET 扫到 Paris，正向北移动。" */
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      '这一次，扫描线约在 ',
      clock(o.time, o.zone),
      withName(' 扫到', o.place, `，正向${WORD[o.heading]}移动。`),
    ],
    infrared: '当时这里天已经黑了，所以这是红外图像：亮度表示云顶温度，越冷越亮。',
  },

  // ── a pass with a picture ─────────────────────────────────────────────────────────────────
  /** "Sentinel-2C 于 11:21:13 EST 从 786 km 高空经过，在这里以西 61 km 处，正以 7.46 km/s 向南飞行。" */
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    at(o.sat),
    clock(o.time, o.zone),
    ...where(o.altKm, o.offset),
    '，正以 ',
    num(f.dec(o.speedKmS, 2), 'km/s'),
    ` 向${WORD[o.heading]}飞行。`,
  ],
  /** "它的 VIIRS 成像仪把 Waterloo 扫入了 NASA 每日真彩色拼接图，每像素 375 m。" */
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    withName(withName('它的', o.sensor, '成像仪把'), o.place, '扫入了 NASA 每日真彩色拼接图，每像素 '),
    num(f.int(o.gsdM), 'm'),
    '。',
  ],
  /** "它的雷达朝侧面偏 23.1°，以每像素 20 m 为 Waterloo 成像，当时天已经黑了。" */
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    '它的雷达朝侧面偏 ',
    deg1(o.deg),
    '，以每像素 ',
    num(f.int(o.gsdM), 'm'),
    withName(' 为', o.place, o.dark ? '成像，当时天已经黑了。' : '成像。'),
  ],
  lookingDown: '它当时垂直俯视。',
  lookingOff: (deg: number): Rich => ['它当时的视线偏离垂直方向 ', deg1(deg), '。'],
  cloudCover: (pct: number): Rich => ['整幅画面的云量：', num(f.int(pct), '%'), '。'],

  // ── "很可能注视过" ──────────────────────────────────────────────────────────────────────────
  likely: {
    /** "Landsat 9 于 10:21:07 EST 从 705 km 高空经过，在这里以东 40 km 处。这里在它 185 km 宽的成像带内。" */
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      at(o.sat),
      clock(o.time, o.zone),
      ...where(o.altKm, o.offset),
      ...(o.swathKm ? ['。这里在它 ', km(o.swathKm), ' 宽的成像带内。'] : ['。']),
    ],
    archiveFailed: '当时是白天，所以它应该记录下了这里。暂时无法检索图像库。',
    noScene: '这次过境没有对应的图像。Sentinel-2 只记录陆地和近岸水域，也可能没有安排对这里成像。',
    notYet: '当时是白天，所以它几乎肯定记录下了这里。这次过境的图像还没有公开；图像库可能延迟一天或更久。',
    dark: '当时这里天已经黑了。气象成像仪夜间也在用红外扫描，所以它看到的是你头顶的云，不是你的街道。',
    mosaicUnconfirmed: '无法确认 NASA 这次过境的每日拼接图在此处有画面。',
    notPublished: '它的图像用于天气预报，不会公开成我们能展示的画面。',
  },

  // ── "能对准这里" ────────────────────────────────────────────────────────────────────────────
  could: {
    /** "WorldView Legion 4 于 10:52 EST 经过这里以西 61 km 处，这里在它的可视范围内。" / "…从正上方经过，…" */
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      at(o.sat),
      clock(o.time, o.zone),
      ...(o.offset
        ? [` 经过这里${FROM[o.offset.dir]} `, km(o.offset.km), ' 处，这里在它的可视范围内。']
        : [' 从正上方经过，这里在它的可视范围内。']),
    ],
    /** "Waterloo 在它 24 km 宽的成像带内。运营方不公开它在哪里成过像，所以我们无从得知它是否注视过。" */
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      withName('', o.place, '在它 '),
      km(o.swathKm),
      ' 宽的成像带内。运营方不公开它在哪里成过像，所以我们无从得知它是否注视过。',
    ],
    /** "雷达能穿透云层，也不受黑夜影响。只要朝侧面偏 23.0°，它就能为 Waterloo 成像。…" */
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      '雷达能穿透云层，也不受黑夜影响。',
      ...(o.deg === undefined
        ? [withName('它能为', o.place, '成像。')]
        : ['只要朝侧面偏 ', deg1(o.deg), withName('，它就能为', o.place, '成像。')]),
      o.openArchive ? '我们没有找到这次过境的公开图像。' : '它是否真的成像过，我们无从得知。',
    ],
    /** "只要视线偏离垂直方向 12.3°，它就能注视 Waterloo。它是否真的注视过，我们无从得知。" */
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined ? ['只要垂直俯视，'] : ['只要视线偏离垂直方向 ', deg1(o.deg), '，']),
      withName('它就能注视', o.place, '。它是否真的注视过，我们无从得知。'),
    ],
  },

  // ── "从上空经过" ────────────────────────────────────────────────────────────────────────────
  /** "ISS (ZARYA) 于 21:14 EST 从 420 km 高空经过，出现在你西南方的天空，高出地平线 62°。" / "…高出地平线 84°，几乎就在你头顶正上方。" */
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    at(o.sat),
    clock(o.time, o.zone),
    ' 从 ',
    km(o.altKm),
    o.toward === undefined ? ' 高空经过，高出地平线 ' : ` 高空经过，出现在你${WORD[o.toward]}方的天空，高出地平线 `,
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? '，几乎就在你头顶正上方。' : '。',
  ],
  darkStation: '当时你那里天已经黑了。如果空间站当时仍在阳光下，它会以一个明亮、不闪烁的光点划过你的天空。',
}

export default pass
