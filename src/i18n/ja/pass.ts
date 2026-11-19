/**
 * Japanese copy for one pass's paragraph (see docs/i18n/ja.md §3.4, §5.1, §5.2): the sentences under a pass's picture
 * or plan view.
 *
 * Why the sentences are built this way: the first sentence takes the satellite as its topic (Sentinel-2Cは…) and the
 * later ones drop the subject, because Japanese never says それ or 彼 for a satellite. A position is given as place +
 * direction + distance (この場所の西61 km), so the 8-point compass is one table for both a position and a heading (北東,
 * 南へ). An English participial tail ("…, moving south at 7.46 km/s") becomes a 連用形 join in the same sentence (通り、…
 * 向かっていた). The clock arrives with its zone ("16:14:21 EST") and takes に directly. Numbers with SI units are num()
 * parts (786 km, 7.46 km/s, 25%, 5.4°); a counter (分, 回) is plain text right after its number, with no space. Place
 * and satellite names arrive bare: particles attach straight to them, with no article, quotes or suffix, and the place
 * is plain text here (the serif accent belongs to the results headline). The readouts' 16-point compass is in kanji, as
 * Japanese instruments and weather reports write it.
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import type { Compass8 } from '@/ui/results/lib/copy'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('ja')

/** Prose directions: a position (この場所の西) and a heading (南へ) take the same word */
const DIR: Record<Compass8, string> = {
  n: '北',
  ne: '北東',
  e: '東',
  se: '南東',
  s: '南',
  sw: '南西',
  w: '西',
  nw: '北西',
}

const km = (n: number) => num(f.int(n), 'km')
const clock = (time: string, zone: string) => num(time, zone)
const deg1 = (n: number) => num(f.dec(n, 1), '°')

/** "0.2°W" → "西経0.2°", "140.8°E" → "東経140.8°": the seat arrives in international notation; prose says it in words */
function longitude(seat: string): string {
  const m = /^(\d+(?:\.\d+)?)°([EW])$/.exec(seat.trim())
  return m ? `${m[2] === 'W' ? '西経' : '東経'}${f.dec(Number(m[1]), 1)}°` : seat
}

/**
 * Where it crossed, after "[SAT]は[TIME]に": "高度786 kmで真上を" / "この場所の西61 km、高度786 kmを". The verb follows
 * (通り、 / 通った。).
 */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset ? [`、この場所の${DIR[offset.dir]}`, km(offset.km), '、高度', km(altKm), 'を'] : ['、高度', km(altKm), 'で真上を']

const pass: typeof en = {
  /** Kanji, as Japanese readouts write them: 南南西 (3 glyphs at most) */
  compass16: {
    n: '北',
    nne: '北北東',
    ne: '北東',
    ene: '東北東',
    e: '東',
    ese: '東南東',
    se: '南東',
    sse: '南南東',
    s: '南',
    ssw: '南南西',
    sw: '南西',
    wsw: '西南西',
    w: '西',
    wnw: '西北西',
    nw: '北西',
    nnw: '北北西',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    /** "Meteosat-12は上空を通らない。西経0.2°の赤道上空35,778 kmにとどまり、眼下に見える地球全体を10分ごとに走査している。" */
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `${o.sat}は上空を通らない。${o.seat !== undefined ? `${longitude(o.seat)}の` : ''}赤道上空`,
      km(o.altKm),
      'にとどまり、眼下に見える地球全体を',
      ...(o.cadenceMin ? [num(f.int(o.cadenceMin)), '分ごとに走査している。'] : ['走査している。']),
    ],
    /** "今回の走査線がParisに達したのは07:49 CETごろ。北へ進んでいた。" (ごろ: "about" with a clock, never 約) */
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      `今回の走査線が${o.place}に達したのは`,
      clock(o.time, o.zone),
      `ごろ。${DIR[o.heading]}へ進んでいた。`,
    ],
    infrared: 'ここは夜だったので、これは赤外画像。雲頂を温度で表し、冷たいほど明るい。',
  },

  // ── a pass with a picture ("Watched") ────────────────────────────────────────────────────
  /** "Sentinel-2Cは16:14:21 ESTに、この場所の西61 km、高度786 kmを通り、7.46 km/sで南へ向かっていた。" */
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    `${o.sat}は`,
    clock(o.time, o.zone),
    'に',
    ...where(o.altKm, o.offset),
    '通り、',
    num(f.dec(o.speedKmS, 2), 'km/s'),
    `で${DIR[o.heading]}へ向かっていた。`,
  ],
  /** 日別画像 (stitched day): never モザイク or 合成画像. The subject ("its imager") is the sensor itself */
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `${o.sensor}イメージャーが${o.place}を走査し、NASAのトゥルーカラー日別画像に収めた。1ピクセル`,
    num(f.int(o.gsdM), 'm'),
    '。',
  ],
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'レーダーは横に',
    deg1(o.deg),
    o.dark ? `向けて、暗闇のなかで${o.place}を観測した。1ピクセル` : `向けて${o.place}を観測した。1ピクセル`,
    num(f.int(o.gsdM), 'm'),
    '。',
  ],
  lookingDown: '真下を見ていた。',
  lookingOff: (deg: number): Rich => ['真下から', deg1(deg), '傾いた方向を見ていた。'],
  /** A noun ending: it breaks the run of た endings */
  cloudCover: (pct: number): Rich => ['シーン全体の雲量は', num(f.int(pct), '%'), '。'],

  // ── "Likely watched" ─────────────────────────────────────────────────────────────────────
  likely: {
    /** "Sentinel-2Aは16:14:21 ESTに、高度786 kmで真上を通った。この場所は290 kmの観測幅に入っていた。" */
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      `${o.sat}は`,
      clock(o.time, o.zone),
      'に',
      ...where(o.altKm, o.offset),
      '通った。',
      ...(o.swathKm ? ['この場所は', km(o.swathKm), 'の観測幅に入っていた。'] : []),
    ],
    archiveFailed: '日中だったので、この地点を記録していたはずだ。いまはアーカイブを検索できなかった。',
    /** 観測計画 (the acquisition plan): never 撮影予定 */
    noScene: 'この通過のシーンは存在しない。Sentinel-2が記録するのは陸地と沿岸の海だけで、この地点を観測計画に入れていなかった可能性がある。',
    notYet: '日中だったので、この地点をほぼ確実に記録している。この通過のシーンはまだ公開されていない。アーカイブは1日以上遅れることがある。',
    /** "your clouds, not your streets": 見えたのは雲で、街並みではない (no あなたの) */
    dark: 'ここは夜だった。気象衛星のカメラは夜も赤外線で走査を続けるので、見えたのは雲で、街並みではない。',
    mosaicUnconfirmed: 'この通過のNASA日別画像を、この地点で確認できなかった。',
    notPublished: 'その画像は天気予報に使われ、表示できる画像としては公開されていない。',
  },

  // ── "Could have pointed here" ────────────────────────────────────────────────────────────
  could: {
    /** "WorldView Legion 4は10:52 ESTに、この場所の西61 kmを通った。" / "…10:52 ESTに真上を通った。" */
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `${o.sat}は`,
      clock(o.time, o.zone),
      ...(o.offset ? [`に、この場所の${DIR[o.offset.dir]}`, km(o.offset.km), 'を通った。'] : ['に真上を通った。']),
    ],
    /** The place can open a sentence as its topic */
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      `${o.place}は観測幅`,
      km(o.swathKm),
      'の内側にあった。運用者はどこを観測したかを公開していないため、記録したかどうかは分からない。',
    ],
    /**
     * 観測できる範囲 / 観測できた for radar: never 射程. Without 〜ば (straight overhead) a bare past 観測できた reads as
     * "it did observe", so that case says 観測することもできた, the unrealised possibility
     */
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'レーダーは雲も暗闇も通して見る。',
      ...(o.deg === undefined ? [] : ['横に', deg1(o.deg), '向ければ、']),
      `${o.place}を観測${o.deg === undefined ? 'することも' : ''}できた。`,
      o.openArchive ? 'この通過の公開画像は見つからなかった。' : '実際に観測したかどうかは分からない。',
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined ? ['真下を向いていれば、'] : ['カメラを真下から', deg1(o.deg), '傾ければ、']),
      `${o.place}が見えた。見たかどうかは分からない。`,
    ],
  },

  // ── "Passed overhead" ────────────────────────────────────────────────────────────────────
  /** "ISSは21:04 ESTに高度418 kmを通った。南西の空、地平線から58°。" / "…地平線から84°、ほぼ真上。" */
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `${o.sat}は`,
    clock(o.time, o.zone),
    'に高度',
    km(o.altKm),
    'を通った。',
    ...(o.toward === undefined
      ? ['地平線から', num(f.int(o.elevationDeg), '°'), '、ほぼ真上。']
      : [`${DIR[o.toward]}の空、地平線から`, num(f.int(o.elevationDeg), '°'), '。']),
  ],
  darkStation: 'この場所は夜だった。ステーションにまだ日が当たっていれば、明るく瞬かない光の点として空を横切ったはずだ。',
}
export default pass
