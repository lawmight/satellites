/**
 * Japanese copy for the pass list and the view of one pass (see docs/i18n/ja.md §3.7 "passView", §4).
 *
 * Why the words are these: a pass is 通過 (パス means path, password or skip), counted with 回, and every verdict counts
 * passes, so a count is one form for all ("1回", "31回"; ja has one plural category). Satellites take 基, rows 件 ("さらに
 * 40件を表示"). Readout labels are short kanji nouns with no particle but の, because the strip's four cells share a
 * phone's width: off-nadir is 傾き, elevation 仰角 (never 標高), heading 進行方向, ascending and descending 北上 / 南下.
 * 仰角 already says "up", so that unit is empty and the compass point stands alone. The notes under the plan view say
 * what is missing, then 通過の平面図を示す; a radar image is never a 写真, and a daily mosaic is 日別画像 (モザイク means
 * censorship pixelation). Particles attach straight to satellite names; `latest` and `closest` keep their trailing
 * space, because a mono row's label and value are separate fields.
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'

const f = fmt('ja')
/** The footnote's second sentence: the drawing above it */
const PLAN = '通過の平面図を示す。'

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty: '追跡中の衛星で、この期間にこの場所を通ったものはない。まれなことで、データ源が止まっていた場合は上の注記に書いてある。',
  imagedOrder: '最も詳細な画像、以下新しい順',
  /** Every verdict counts passes (DESIGN §7): one unit, 回, for all */
  count: (n: number, _verdict: Verdict) => `${f.int(n)}回`,
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), '回'),
  sats: (n: number) => `${f.int(n)}基`,
  showAllSats: (n: number) => `衛星${f.int(n)}基をすべて表示`,
  showAllRows: (n: number) => `${f.int(n)}件をすべて表示`,
  showMore: (n: number) => `さらに${f.int(n)}件を表示`,
  left: (n: number) => `残り${f.int(n)}件`,
  showFewer: '表示を減らす',
  tag: {
    mosaic: '日別',
    radar: 'レーダー',
    cloudedPct: (pct: number) => `雲に覆われた · ${f.int(pct)}%`,
    cloudedAtSpot: '地点に雲',
  },
  /** "Sentinel-2C、見ていた、11月6日金曜日 11:21 EST、41時間前、雲量81%、雲に覆われた" */
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [o.sat, o.verb, `${o.day} ${o.time} ${o.zone}`, o.ago, o.cloudPct !== undefined ? `雲量${f.int(o.cloudPct)}%` : undefined, o.clouded ? '雲に覆われた' : undefined]
      .filter(Boolean)
      .join('、'),
  offNadir: (deg: number) => `傾き ${f.dec(deg, 1)}°`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)} km`,
  cloudPct: (pct: number) => `雲量 ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `画像を拡大：${sat}、${day} ${time}`,
  expandTitle: '画像を拡大',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `、${o.operator}` : ''}、通過${f.int(o.passes)}回、最新 ${o.day} ${o.time}`,
  latest: '最新 ',
  closest: '最接近 ',
  cloudChip: '雲',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: '画像',
  planSection: '平面図',
  geometry: '位置関係',
  replay: 'リプレイ',
  /** 撮る is allowed here: the English says the satellite "has taken" these images */
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `全球画像：衛星から見える範囲すべてを1枚に収めた画像で、この場所では1ピクセル${pixel}。粗いが実際の画像で、公開されている最新のもの。この1週間、${
      cadenceMin ? `${f.int(cadenceMin)}分ごとに` : '数分ごとに'
    }同じような画像を撮り続けている。`,
  /** つなぎ合わせた (stitched): never 合成画像, which reads as a faked picture */
  mosaicNote: (gsdM: number) => `日別画像：NASAが1日分の観測幅をつなぎ合わせた1枚の画像。1ピクセル${f.int(gsdM)} m。粗いが実際の画像で、この通過の日のもの。`,
  radarNote:
    '写真ではなくレーダー画像。Sentinel-1はマイクロ波を出してその反射を記録するので、雲も暗さも妨げにならない。明るさは地面がマイクロ波を返す強さを表し、建物や凹凸のある地面は明るく、静かな水面は暗い。',
  noImage: {
    openArchive: (sat: string) => `この通過で撮られた、この地点の${sat}の画像はない。${PLAN}`,
    radarPrivate: `公開画像なし：このレーダー衛星の運用者のアーカイブは非公開。${PLAN}`,
    commercialPrivate: `公開画像なし：商業アーカイブは非公開。${PLAN}`,
    noneToShow: `この通過で表示できる画像はない。${PLAN}`,
    archiveDown: `いまはアーカイブを検索できなかった。${PLAN}`,
    noScene: `この通過のシーンは存在しない。${PLAN}`,
    notYet: 'この通過に一致するシーンはまだ公開されていない。Sentinel-2とLandsatのシーンは、ふつう1日以内に公開される。',
    crewed: '有人ステーションにもカメラはあるが、その写真は場所と時刻ごとには公開されていない。',
    unavailable: 'この通過の画像は利用できない。',
  },
  links: {
    openToSave: '画像を開いて保存',
    downloading: '保存中…',
    download: '画像を保存',
    viewSource: (archive: string) => `出典を見る · ${archive}`,
  },
  /** "your spot" is この地点: never あなたの */
  spot: {
    checking: 'この地点のピクセルを読み取り中…',
    clear: 'この地点は雲なし。',
    cirrus: 'この地点は薄い巻雲ありと判定。画像がややぼやける可能性がある。',
    cloud: 'この地点に雲。',
    shadow: 'この地点は雲の影に入っていた。',
  },

  // ── the readout strip (four cells across: at most five glyphs a label) ──────────────────
  strip: {
    altitude: '高度',
    elevation: '仰角',
    offNadir: '傾き',
    pixel: 'ピクセル',
    band: 'バンド',
    sun: '太陽',
    cloud: '雲量',
    cloudAtSpot: '地点の雲',
  },
  band: { infrared: '赤外', visible: '可視', colour: 'カラー' },
  spotValue: { clear: '雲なし', cirrus: '巻雲', cloud: '雲', shadow: '影' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    /** Empty: the label 仰角 already says "above the horizon" */
    up: '',
    mosaic: '日別',
    scene: 'シーン',
    sun: { day: '昼', twilight: '薄明', night: '夜' },
  },

  // ── 01 / Geometry ───────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: '最接近 · UTC',
    closestLocal: '最接近 · 現地',
    groundDistance: '地上距離',
    elevationFromYou: '仰角',
    groundSpeed: '対地速度',
    heading: '進行方向',
    sunElevation: '太陽高度',
    fieldOfRegard: '指向範囲',
    swath: '観測幅',
    inSwath: '観測幅内',
    inView: '見える範囲',
    window: '時間枠',
    noradPass: 'NORAD · 通過',
    scanUtc: '走査線の到達 · UTC',
    scanLocal: '走査線の到達 · 現地',
    aboveEquator: '赤道上空',
    inYourSky: 'この場所の空',
    scanDirection: '走査方向',
    lineSpeed: '走査線の速度',
    coverage: '範囲',
    thisScan: '今回の走査',
    noradScan: 'NORAD · 走査',
  },
  northToSouth: '北 → 南',
  southToNorth: '南 → 北',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: '昼', twilight: '薄明', night: '夜' },
  fullDisc: '全球',
  everyMin: (n: number) => `${f.int(n)}分ごと`,
  /** 仰角 already says "up": only the compass point (南南西) */
  upCompass: (compass: string) => compass,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? '北上' : '南下'}`,
}

export default passView
