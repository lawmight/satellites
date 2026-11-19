/**
 * Traditional Chinese copy for one pass's paragraph (see docs/i18n/zh-Hant.md §3.4, §4.2, §5.1, §5.2): the sentences
 * under a pass's picture or plan view.
 *
 * Why the sentences are built this way: Chinese reports put the time and the place BEFORE the verb ("Sentinel-2C 於
 * 16:14:21 UTC 從正上方 786 km 高空飛過，以 7.46 km/s 向南移動。"), so every message is a whole sentence in that order,
 * with each number and its unit a num() part wherever the sentence needs it. Directions need two tables: movement keeps
 * the bare word (向南移動), an offset from the place is [DIR]方 [DIST] 處 (西方 61 km 處; never 偏西, which means
 * "veering westward"), and the sky position is 你西北方天空. The likely sentence makes the PLACE the subject of 在它…的
 * 掃描帶內 (the satellite is never inside its own swath); "could" merges its clauses (就可能注視過 Waterloo，但我們無從
 * 得知: no 這樣做); radar never 拍, it 取得…的影像 or 測繪; the geostationary imager scans the disc it sees (它看得到的
 * 整個地球圓面), never the whole Earth. Names arrive bare and take their spaces from cjkGap (withName), so a Latin and a
 * Han name both read right; a satellite's words are joined with no-break spaces (keepName) so "WorldView Legion 4"
 * never breaks across lines. A seat given as "0.2°W" is written in prose as 西經 0.2°.
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import { keepName, withName } from '../../../api/_lib/i18n/card/zh-Hant'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('zh-Hant')

/** Where it moved: "向南移動", "向東北移動" (east / west first: 東北, never 北東) */
const MOVE: Record<Compass8, string> = { n: '北', ne: '東北', e: '東', se: '東南', s: '南', sw: '西南', w: '西', nw: '西北' }
/** Where it was from the place, or where in your sky: "西方 61 km 處", "你西北方天空" */
const SIDE: Record<Compass8, string> = { n: '北方', ne: '東北方', e: '東方', se: '東南方', s: '南方', sw: '西南方', w: '西方', nw: '西北方' }

const km = (n: number) => num(f.int(n), 'km')
const clock = (time: string, zone: string) => num(time, zone)
/** The satellite opening a sentence, spaced from the Han that follows it: "Sentinel-2C 於 " */
const subject = (sat: string, after: string) => withName('', keepName(sat), after)

/** "在 705 km 高空、西方 61 km 處" / "從正上方 786 km 高空": where it crossed, before the verb */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset ? [' 在 ', km(altKm), ` 高空、${SIDE[offset.dir]} `, km(offset.km), ' 處'] : [' 從正上方 ', km(altKm), ' 高空']

/** "0.2°W" → "西經 0.2°", "140.8°E" → "東經 140.8°" (prose puts the hemisphere word first, §6.6); anything else as given */
function seatZh(seat: string): string {
  const m = /^(\d+(?:\.\d+)?)°([EW])$/.exec(seat.trim())
  return m ? `${m[2] === 'W' ? '西經' : '東經'} ${m[1]}°` : seat
}

const pass: typeof en = {
  /** Readouts, 16 points (§4.2): never the Latin SSW, which few readers decode */
  compass16: {
    n: '北',
    nne: '北北東',
    ne: '東北',
    ene: '東北東',
    e: '東',
    ese: '東南東',
    se: '東南',
    sse: '南南東',
    s: '南',
    ssw: '南南西',
    sw: '西南',
    wsw: '西南西',
    w: '西',
    wnw: '西北西',
    nw: '西北',
    nnw: '北北西',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    /** "Meteosat-12 不會過境。它定點在赤道上空 35,778 km、西經 0.2° 處，每 10 分鐘把它看得到的整個地球圓面掃描一次。" */
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      subject(o.sat, '不會過境。它定點在赤道上空 '),
      km(o.altKm),
      o.seat !== undefined ? `、${seatZh(o.seat)} 處，` : ' 處，',
      ...(!o.cadenceMin
        ? ['持續掃描它看得到的整個地球圓面。']
        : o.cadenceMin === 1
          ? ['每分鐘把它看得到的整個地球圓面掃描一次。']
          : ['每 ', num(f.int(o.cadenceMin), '分鐘'), '把它看得到的整個地球圓面掃描一次。']),
    ],
    /** "這次掃描約於 07:49 CET 到達 Paris，掃描線向北移動。" (one 掃 per clause) */
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      '這次掃描約於 ',
      clock(o.time, o.zone),
      ` ${withName('到達', o.place, `，掃描線向${MOVE[o.heading]}移動。`)}`,
    ],
    infrared: '當時這裡天黑，所以這是紅外線影像：以溫度呈現雲頂，越冷越亮。',
  },

  // ── a pass with a picture ("Watched") ────────────────────────────────────────────────────
  /** "Sentinel-2C 於 16:14:21 UTC 從正上方 786 km 高空飛過，以 7.46 km/s 向南移動。" */
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    subject(o.sat, '於 '),
    clock(o.time, o.zone),
    ...where(o.altKm, o.offset),
    '飛過，以 ',
    num(f.dec(o.speedKmS, 2), 'km/s'),
    ` 向${MOVE[o.heading]}移動。`,
  ],
  /** "它的 VIIRS 成像儀把 Waterloo 掃進了 NASA 每日真實色彩拼接影像，每像素 375 m。" */
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    withName(withName('它的', o.sensor, '成像儀把'), o.place, '掃進了 NASA 每日真實色彩拼接影像，每像素 '),
    num(f.int(o.gsdM), 'm'),
    '。',
  ],
  /** "它的雷達朝側面 32.1° 觀測，（在黑暗中）取得了 Waterloo 的影像，每像素 20 m。": radar never 拍 */
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    '它的雷達朝側面 ',
    num(f.dec(o.deg, 1), '°'),
    ` ${withName(`觀測，${o.dark ? '在黑暗中' : ''}取得了`, o.place, '的影像，每像素 ')}`,
    num(f.int(o.gsdM), 'm'),
    '。',
  ],
  lookingDown: '它當時直視正下方。',
  lookingOff: (deg: number): Rich => ['它當時的視線偏離正下方 ', num(f.dec(deg, 1), '°'), '。'],
  /** 原圖: the archive's whole image, as opposed to the crop on screen */
  cloudCover: (pct: number): Rich => ['原圖整體雲量：', num(f.int(pct), '%'), '。'],

  // ── "Likely watched" ─────────────────────────────────────────────────────────────────────
  likely: {
    /** "…在 786 km 高空、東方 98 km 處飛過，這個地點在它 290 km 寬的掃描帶內。" (the place is the subject of 在…內) */
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      subject(o.sat, '於 '),
      clock(o.time, o.zone),
      ...where(o.altKm, o.offset),
      ...(o.swathKm ? ['飛過，這個地點在它 ', km(o.swathKm), ' 寬的掃描帶內。'] : ['飛過。']),
    ],
    archiveFailed: '當時是白天，它應該記錄了這個地點。暫時無法搜尋影像庫。',
    noScene: '這次過境沒有影像。Sentinel-2 只記錄陸地和近岸水域，可能沒有排定觀測這個地點。',
    /** 還沒有任何影像公開, never 影像還沒有公開: we do not know that an image exists */
    notYet: '當時是白天，它幾乎肯定記錄了這個地點。這次過境還沒有任何影像公開；影像庫可能延遲一天以上。',
    dark: '當時這裡天黑。氣象成像儀夜間仍以紅外線持續掃描，所以它看到的是你頭上的雲，不是你的街道。',
    mosaicUnconfirmed: '無法確認 NASA 這次過境的每日拼接影像涵蓋你選的地點。',
    notPublished: '它的影像用於天氣預報，不會以我們能顯示的形式公開。',
  },

  // ── "Could have pointed here" ────────────────────────────────────────────────────────────
  could: {
    /** "WorldView Legion 4 於 10:52 EST 在西方 61 km 處經過，這裡在它的可視範圍內。" / "…從正上方經過，…" */
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      subject(o.sat, '於 '),
      clock(o.time, o.zone),
      ...(o.offset
        ? [` 在${SIDE[o.offset.dir]} `, km(o.offset.km), ' 處經過，這裡在它的可視範圍內。']
        : [' 從正上方經過，這裡在它的可視範圍內。']),
    ],
    /** "Waterloo 在它 24 km 寬的掃描帶內。營運商不公開…" (starts with the place, as the English does) */
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      withName('', o.place, '在它 '),
      km(o.swathKm),
      ' 寬的掃描帶內。營運商不公開它觀測過哪些地方，所以我們無從得知它有沒有注視過。',
    ],
    /** "雷達能穿透雲層和黑暗。它只要朝側面偏 25.0°，就可能測繪過 Waterloo。這次過境找不到它公開的影像。" */
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => {
      const tail = o.openArchive ? '。這次過境找不到它公開的影像。' : '，但我們無從得知。'
      return [
        '雷達能穿透雲層和黑暗。',
        ...(o.deg === undefined
          ? [withName('它可能測繪過', o.place, tail)]
          : ['它只要朝側面偏 ', num(f.dec(o.deg, 1), '°'), withName('，就可能測繪過', o.place, tail)]),
      ]
    },
    /** "它只要偏離正下方 12.3°，就可能注視過 Waterloo，但我們無從得知。" (one sentence, no pro-verb) */
    camera: (o: { place: string; deg?: number }): Rich =>
      o.deg === undefined
        ? [withName('它只要直視正下方，就可能注視過', o.place, '，但我們無從得知。')]
        : ['它只要偏離正下方 ', num(f.dec(o.deg, 1), '°'), withName('，就可能注視過', o.place, '，但我們無從得知。')],
  },

  // ── "Passed overhead" ────────────────────────────────────────────────────────────────────
  /** "ISS 於 19:02 EST 從 418 km 高空經過，位於你西北方天空、仰角 54° 處。" / "…，仰角 86°，幾乎就在你頭頂。" */
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    subject(o.sat, '於 '),
    clock(o.time, o.zone),
    ' 從 ',
    km(o.altKm),
    ' 高空經過，',
    ...(o.toward === undefined
      ? ['仰角 ', num(f.int(o.elevationDeg), '°'), '，幾乎就在你頭頂。']
      : [`位於你${SIDE[o.toward]}天空、仰角 `, num(f.int(o.elevationDeg), '°'), ' 處。']),
  ],
  darkStation: '當時你那裡天黑。如果太空站仍在陽光下，它就會像一個明亮、穩定的光點劃過你的天空。',
}

export default pass
