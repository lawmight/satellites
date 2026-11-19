/**
 * Japanese copy for the share card and the share page (see docs/i18n/ja.md §3.6). Pure TypeScript with no DOM, Node or
 * src/ imports, like ./en.ts: the server reads it through cardMessages(locale), and the app's ja bundle lists this same
 * module as its 'card' namespace.
 *
 * Why it is shaped this way:
 *  - The place is always the last block. A text block after it would open a display line on a particle (を見ていた。),
 *    and words inside the accent would be set in the serif, so the card headline is a relative clause with a noun
 *    ending (衛星7基が／見ていた／*Waterloo*。): the accent holds only the place and its 。 (dropped when the place
 *    was cut short, as English drops its stop). Each phrase is its own text part, because a ja line breaks only between
 *    parts (§6.7): at most four lead parts, each within the 466 px column at the 84 px size (about 5.5 glyphs), which is
 *    why the count reads 衛星7基が and not 7基の衛星が (6.5 glyphs with three digits: が fell alone onto a line).
 *  - Japanese needs no inflection, article, gender or space around a name: particles attach straight to any place or
 *    satellite name, in any script. A nameless satellite is ある衛星 in sentences and 不明な衛星 as a label.
 *  - Dates are built by hand from the place's local fields (dates.ts dateFormat at the place's zone): 2026/11/1(日) in
 *    mono, 2026年11月1日（日） in prose with full-width parentheses (§6.3). Intl's own prose form keeps half-width ones.
 *    The app's ja post text takes its day from here too (jaDayProse).
 *  - ja has one plural category, so every count is one string; a zero is its own sentence, never 0基.
 *  - Data says この1週間 (a rolling week); 今週 (the calendar week) only in the brand lines: the hero, the share page's
 *    title and the closing question.
 */
import { fmt } from '../format.js'
import { accent, type Rich } from '../parts.js'
import { dateFormat } from '../dates.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('ja')

// ── Dates at the place, by hand (docs/i18n/ja.md §6.3) ──────────────────────────────────────────────────────────────

const FIELDS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }

/** The calendar day of an instant at a zone: year, month and day as numbers, and the short weekday (日, 月, …) */
export function jaFields(ms: number, timeZone: string): { year: number; month: number; day: number; weekday: string } {
  const ps = dateFormat('ja', timeZone, FIELDS).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => ps.find((p) => p.type === t)?.value ?? ''
  return { year: Number(get('year')), month: Number(get('month')), day: Number(get('day')), weekday: get('weekday') }
}

/** "11月1日（日）": the day in prose (the post) */
export function jaDayProse(ms: number, timeZone: string): string {
  const d = jaFields(ms, timeZone)
  return `${d.month}月${d.day}日（${d.weekday}）`
}
/** "2026年11月1日（日）": the share page carries the year */
const dayYearProse = (ms: number, timeZone: string) => `${jaFields(ms, timeZone).year}年${jaDayProse(ms, timeZone)}`
/** "2026/11/1(日)": the card's mono stamps */
const dayYearMono = (ms: number, timeZone: string) => {
  const d = jaFields(ms, timeZone)
  return `${d.year}/${d.month}/${d.day}(${d.weekday})`
}

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** A satellite with no name, inside a sentence */
const SOME_SATELLITE = 'ある衛星'
/** …and as a label on its own (a chip, the plan plate's callout) */
const UNKNOWN_SATELLITE = '不明な衛星'
const named = (sat: SatName) => sat ?? SOME_SATELLITE

/** The place as the accent block, with its 。 as its own part unless the place was cut short */
const placeBlock = (place: string, cut: boolean) => (cut ? accent(place) : accent(place, '。'))
/** "衛星7基が" "見ていた", or the zero sentence's phrases: the headline's lead parts, one line each */
const watched = (n: number) => (n > 0 ? [`衛星${f.int(n)}基が`, '見ていた'] : ['追跡中の', 'どの衛星も', '見ていなかった'])

/** Eight compass points for prose, 0 north, 1 northeast, … 7 northwest */
const COMPASS = ['北', '北東', '東', '南東', '南', '南西', '西', '北西']
/** "2026年11月1日（日）11:21 EST、", or nothing when the moment is unknown */
const at = (w?: CardWhen) => (w ? `${dayYearProse(w.ms, w.timeZone)}${w.clock} ${w.zone}、` : '')
/** The end of a sentence of motion: "通り、南へ向かっていた。", or "通った。" when the heading is unknown */
const went = (heading?: number) => {
  const dir = heading !== undefined ? COMPASS[heading] : undefined
  return dir ? `通り、${dir}へ向かっていた。` : '通った。'
}

const card: CardMessages = {
  // ── The headline (rich: text blocks in the condensed face, the accent block in the serif) ─────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [...watched(satellites), placeBlock(place, cut)],
  headlineBy: {
    imaged: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)}が`, '見ていた', placeBlock(place, cut)],
    likely: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)}の`, '観測幅に入った', placeBlock(place, cut)],
    could: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)}が`, '向ければ見えた', placeBlock(place, cut)],
    overhead: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)}が`, '上空を通った', placeBlock(place, cut)],
  },
  /** Japanese cannot put "this week" after the place: この1週間、 opens the lead */
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [
    'この1週間、',
    ...watched(satellites),
    placeBlock(place, cut),
  ],

  // ── The line under the headline (it ends on the number, the fact the reader came for) ─────────────────────────────

  photos: (count: number, atLeast: boolean) =>
    count <= 0 ? '公開された画像はない。' : atLeast ? `公開された画像は少なくとも${f.int(count)}枚。` : `公開された画像は${f.int(count)}枚。`,
  archiveDown: '画像アーカイブが応答せず、公開画像をいま数えられない。',
  archiveDownShort: '画像アーカイブが応答しなかった。',
  /**
   * `desc` ends on a noun: on the share page it follows two sentences that end in 〜た (crossed, then straightDown or
   * offNadir), and a third in a row is the run §2.2 forbids. `post` follows only one, so it keeps its verb.
   */
  cloud: {
    only: {
      sub: (_pct: number) => '雲に覆われ、雲しか見えなかった。',
      chip: (pct: number) => `雲に覆われた · ${f.int(pct)}%`,
      post: (_pct: number) => '雲しか見えなかった。',
      desc: (pct: number) => `見えたのは雲だけ（${f.int(pct)}%）。`,
    },
    mostly: {
      sub: (pct: number) => `ほぼ雲。シーンの${f.int(pct)}%。`,
      chip: (pct: number) => `ほぼ雲 · ${f.int(pct)}%`,
      post: (pct: number) => `ほとんど雲だった（${f.int(pct)}%）。`,
      desc: (pct: number) => `見えたのはほぼ雲（${f.int(pct)}%）。`,
    },
    spot: { sub: '地点の真上に雲。', chip: '地点に雲', post: 'この地点は雲に覆われていた。', desc: 'この地点の真上に雲。' },
  },

  // ── The top row (mono days: 2026/11/1(日)) ────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYearMono(ms, timeZone)} · ${clock} ${zone}`,
  weekTo: (ms: number, timeZone: string) => `${dayYearMono(ms, timeZone)}までの7日間`,
  lastWeek: '過去7日間',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: '高度',
    elevation: '仰角',
    speed: '速度',
    offNadir: '傾き',
    pixel: 'ピクセル',
    mosaicPixel: '日別ピクセル',
    closest: '最短距離',
  },
  /** The verdicts' lanes (§3.5): 画像, not 写真, because the lane also holds radar images and weather mosaics */
  lane: { imaged: '画像', likely: '推定', could: '可能性', overhead: '上空' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`),
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${f.int(km * 1000)} m`),
  geometry: '通過の位置関係 · 北が上',
  note: {
    imageInApp: '画像はアプリで表示',
    imageUnavailable: '画像をいま取得できない',
    commercial: '商業アーカイブ · 非公開',
    inSwath: '観測幅内 · 公開画像はまだない',
    groundTrack: '最接近時の地上軌跡',
  },
  acquiring: '取得中…',
  noPublicPhoto: 'この1週間、公開画像なし',
  noPhoto: '表示できる画像なし',
  look: {
    closest: '最も詳細な画像',
    lastClear: '直近の晴天画像',
    clouded: '雲に覆われた',
    radar: 'レーダー',
  },
  /** "11/3" */
  lookDay: (ms: number, timeZone: string) => {
    const d = jaFields(ms, timeZone)
    return `${d.month}/${d.day}`
  },
  aSatellite: UNKNOWN_SATELLITE,
  invite: 'あなたを見ていたものを見る',

  // ── The default card ─────────────────────────────────────────────────────────────────────────────────────────────

  /**
   * The landing hero in four lines, not three: 今週、何かが is 6 em at 88 px and would overflow the 466 px column
   * (satori has no palt). Parts touch, so no spaces anywhere (§3.1).
   */
  hero: [['今週、'], ['何かが'], [accent('あなた'), 'を'], ['見ていた。']] as Rich[],
  enterAnyPlace: '地球上の好きな場所を入力',
  defaultPlace: 'パーム・ジュメイラ',
  defaultAlt:
    'パーム・ジュメイラ（ドバイ）を写した実際のSentinel-2の衛星写真と、「今週、何かがあなたを見ていた。地球上の好きな場所を入力」の一文。',

  // ── The share page ───────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: '今週、何かがあなたを見ていた。',
    /** The landing's sub line (§3.2): a consequence conditional, never a command */
    description: '地球上の好きな場所を入力すると、過去7日間にその上空を通ったすべての衛星と、実際に撮られた画像が見られる。',
    placeTitle: (place: string) => `この1週間、${place}を見ていたもの`,
    placeDescription: (place: string) =>
      `過去7日間に${place}の上空を通ったすべての衛星と、実際に撮られた画像。今週、あなたを見ていたのは？`,
    opening: [accent('Watched'), 'へ移動中…'] as Rich,
  },
  /**
   * "Sentinel-2Cは2026年11月1日（日）11:21 EST、Waterlooの上空795 kmを通り、南へ向かっていた。" The satellite is the
   * paragraph's topic (は); a missing time drops its clause, a missing altitude leaves 上空を通り, a missing heading ends
   * the sentence on 通った. Japanese says "crossed" and "passed" with the one verb 通る, and an overhead pass keeps its
   * altitude, as the English does ("passed 420 km above").
   */
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) => {
    const altitude = o.altitudeKm !== undefined ? `${f.int(o.altitudeKm)} km` : ''
    return `${named(o.sat)}は${at(o.when)}${o.place}の上空${altitude}を${went(o.heading)}`
  },
  /** "WorldView Legion 4は…10:52 EST、Waterlooが見える範囲を通り、北西へ向かっていた。" */
  withinView: (o: PassFacts) => `${named(o.sat)}は${at(o.when)}${o.place}が見える範囲を${went(o.heading)}`,
  couldHave: 'ここにカメラを向けることもできた。向けたかどうか、運用者は明かしていない。',
  straightDown: '真下を見ていた。',
  offNadir: (deg: number) => `真下から${f.dec(deg, 1)}°傾いた方向を見ていた。`,
  cloudCover: (pct: number) => `雲量は${f.int(pct)}%。`,
  inSwath: (place: string) => `${place}は観測幅に入っていた。`,
  bestFrom: {
    closest: (sat: SatName) => `最も詳細な画像は${named(sat)}によるもの。`,
    lastClear: (sat: SatName) => `直近の晴天画像は${named(sat)}によるもの。`,
    first: (sat: SatName) => `最初の画像は${named(sat)}によるもの。`,
  },
  /** "What watched you this week?": the product verb, as the English has it (not the post's hookPassed) */
  question: '今週、あなたを見ていたのは？',
  cardAlt: {
    /**
     * After the week's title, which already says この1週間. The satellite gets its own sentence, as in bestFrom: put
     * before 画像, its name would narrow 最も詳細な to that satellite's images. Without a name it is simply left out:
     * ある衛星によるもの would add nothing but a stumble.
     */
    withPhoto: (sat: SatName) => (sat ? `最も詳細な画像を載せた共有カード。画像は${sat}によるもの。` : '最も詳細な画像を載せた共有カード。'),
    plain: '共有カード。',
  },
}

export default card
