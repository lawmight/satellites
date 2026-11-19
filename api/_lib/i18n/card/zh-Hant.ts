/**
 * Traditional Chinese copy for the share card and the share page (see docs/i18n/zh-Hant.md §3.5). Pure TypeScript with
 * no DOM, Node or src/ imports, like ./en.ts: the server reads it through cardMessages(locale), and the app's zh-Hant
 * bundle lists this same module as its 'card' namespace. Cards and share pages are rendered from `l=zh-Hant` for every
 * sharer, so they print the base words (什麼, 天) and carry no Hong Kong overlay (§1.4).
 *
 * Why it is shaped this way:
 *  - Chinese needs no inflection, article or gender, so every frame takes any place or satellite name as it comes. What
 *    it does need is the space between Han and a name written in Latin letters ("注視過 Waterloo。", but "注視過九龍。"):
 *    `cjkGap` decides it from the two edge characters, at every [PLACE] and [SAT] boundary, so the result is the same in
 *    every renderer (DOM, canvas, satori, plain text). The app's zh-Hant catalogs import it, `withName` and the date
 *    helpers from here.
 *  - The place is the accent block. It is last, with 。 as its own part (dropped when the place was cut), except in
 *    `headlineBy.could`, which puts the place first ("Waterloo 曾在 Capella-14 的可視範圍內。": a frame with the place
 *    last read like a claim that it saw); there 。 ends the text block and a cut never drops it. Blocks join with
 *    nothing (sentenceGap ''), so the lead ends with the gap to the place, and a block after the place starts with it.
 *  - Dates are built by hand from the place's local fields (dates.ts dateFormat at the place's zone, read as numbers),
 *    never from Intl's numeric zh output ("2026/11/1"), which Taiwan and Hong Kong read as different days: the chips
 *    write "2026年11月1日 週日", prose "2026年11月1日（週日）" (§5.5, §6.4).
 *  - zh has one plural category, so every count has one form; the zero cases are their own sentences.
 *  - Names in the card's headline keep their plain spaces: a long name ("WorldView Legion 4") must still wrap in the
 *    466 px column. `keepName` (U+00A0) is for the app's on-screen prose only (§5.2).
 */
import { fmt } from '../format.js'
import { accent, type Rich } from '../parts.js'
import { dateFormat } from '../dates.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('zh-Hant')

// ── Spacing between Han and names in other scripts (docs/i18n/zh-Hant.md §5.1, §6.2, Appendix B.4) ───────────────────

const HAN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々ー]/u
/** A character of a script written with spaces: a letter or digit (Latin, Cyrillic, Hangul…), or an ASCII symbol */
const SPACED = /[\p{L}\p{N}\p{M}\p{Sm}\p{Sc}]|[\x21-\x7e]/u

const firstChar = (s: string) => (s ? String.fromCodePoint(s.codePointAt(0)!) : '')
const lastChar = (s: string) => {
  const cs = Array.from(s)
  return cs.length ? cs[cs.length - 1] : ''
}

/**
 * One ASCII space where Han meets a letter, digit or symbol of a script written with spaces, nothing otherwise (two
 * Han, a space or full-width punctuation at either edge). Called at the edges of every inserted place and satellite name.
 */
export function cjkGap(before: string, after: string): string {
  const a = lastChar(before)
  const b = firstChar(after)
  if (!a || !b) return ''
  const ha = HAN.test(a)
  const hb = HAN.test(b)
  if (ha === hb) return ''
  return SPACED.test(ha ? b : a) ? ' ' : ''
}

/** Text with a name in it: the name is joined to its neighbours through cjkGap. */
export function withName(before: string, name: string, after: string): string {
  return `${before}${cjkGap(before, name)}${name}${cjkGap(name, after)}${after}`
}

/**
 * A satellite's name that never breaks across lines in on-screen prose ("WorldView Legion 4", "ISS (ZARYA)"): its
 * spaces become U+00A0 (Instrument Sans has it). Post text, file names and the card keep plain spaces (§5.2, B.11).
 */
export const keepName = (name: string) => name.replace(/ /g, ' ')

// ── Dates at the place, by hand (docs/i18n/zh-Hant.md §5.5, §6.4) ───────────────────────────────────────────────────

const FIELDS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' }
/** 週 + this character: dow 0 is Sunday (週日), as both regions' Intl say it */
const WEEKDAY = '日一二三四五六'

/** The calendar day of an instant at a zone, as numbers (dow 0 = Sunday) */
export function zhFields(ms: number, timeZone: string): { year: number; month: number; day: number; dow: number } {
  const ps = dateFormat('zh-Hant', timeZone, FIELDS).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => Number(ps.find((p) => p.type === t)?.value ?? NaN)
  const year = get('year')
  const month = get('month')
  const day = get('day')
  return { year, month, day, dow: new Date(Date.UTC(year, month - 1, day)).getUTCDay() }
}

/** "週日" */
export const zhWeekday = (dow: number) => `週${WEEKDAY[dow] ?? ''}`
/** "11月1日（週日）": the day in prose (the post) */
export function zhDayProse(ms: number, timeZone: string): string {
  const d = zhFields(ms, timeZone)
  return `${d.month}月${d.day}日（${zhWeekday(d.dow)}）`
}
/** "2026年11月1日（週日）": the share page carries the year */
const dayYearProse = (ms: number, timeZone: string) => {
  const d = zhFields(ms, timeZone)
  return `${d.year}年${d.month}月${d.day}日（${zhWeekday(d.dow)}）`
}
/** "2026年11月1日 週日": the card's mono chips (no parentheses) */
const dayYearChip = (ms: number, timeZone: string) => {
  const d = zhFields(ms, timeZone)
  return `${d.year}年${d.month}月${d.day}日 ${zhWeekday(d.dow)}`
}

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** A satellite with no name, as a label or an object ("來自一顆衛星") */
const A_SATELLITE = '一顆衛星'
/** …and as a subject, which Chinese introduces with 有 ("有一顆衛星注視過 Waterloo。") */
const A_SATELLITE_SUBJECT = '有一顆衛星'
const named = (sat: SatName) => sat ?? A_SATELLITE
const subject = (sat: SatName) => sat ?? A_SATELLITE_SUBJECT

/** The headline's lead, with the gap to the place that follows it */
const lead = (text: string, place: string) => `${text}${cjkGap(text, place)}`
/**
 * The card's lead as phrases (the results headline's words), one line each where a typesetter breaks a display
 * headline; the card never breaks inside a part: "有 7 顆衛星" "注視過 ", or "我們追蹤的衛星" "沒有一顆注視過 ".
 * Flattened with no gap they read as the sentence.
 */
const watched = (n: number, place: string) =>
  n > 0 ? [`有 ${f.int(n)} 顆衛星`, lead('注視過', place)] : ['我們追蹤的衛星', lead('沒有一顆注視過', place)]
/** The place as the accent block, with its 。 as its own part unless the place was cut short */
const placeBlock = (place: string, cut: boolean) => (cut ? accent(place) : accent(place, '。'))
/** The satellite's own headline: "Sentinel-2C " | "注視過 " | "Waterloo。", the name and the verb a line each */
const byName = (sat: SatName, verb: string, place: string, cut: boolean): Rich => [
  `${subject(sat)}${cjkGap(subject(sat), verb)}`,
  lead(verb, place),
  placeBlock(place, cut),
]

const COMPASS = ['北', '東北', '東', '東南', '南', '西南', '西', '西北']
const compass = (heading?: number) => (heading !== undefined ? COMPASS[heading] : undefined)
/** "於 2026年11月1日（週日）11:21 EST", or nothing when the moment is unknown */
const at = (w?: CardWhen) => (w ? `於 ${dayYearProse(w.ms, w.timeZone)}${w.clock} ${w.zone}` : '')
/** "，向南移動", or nothing when the heading is unknown */
const moving = (heading?: number) => (compass(heading) ? `，向${compass(heading)}移動` : '')
/**
 * The subject and the clauses that follow it, the missing ones left out: "Sentinel-2C" "於 …11:21 EST" "從 Waterloo
 * 上空 795 km 處飛過". Every clause starts with Han, so the space between two of them is cjkGap's.
 */
const clauses = (...parts: string[]) => parts.filter(Boolean).reduce((out, p) => `${out}${cjkGap(out, p)}${p}`, '')

const card: CardMessages = {
  // ── The headline (rich: text blocks in the condensed face, the accent block in the serif) ─────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [...watched(satellites, place), placeBlock(place, cut)],
  headlineBy: {
    imaged: (sat: SatName, place: string, cut: boolean): Rich => byName(sat, '注視過', place, cut),
    likely: (sat: SatName, place: string, cut: boolean): Rich => byName(sat, '掃過', place, cut),
    /**
     * Place first: "Waterloo" | " 曾在" | "Capella-14 " | "的可視範圍內。" (its 。 is in the text block, so a cut never
     * drops it). A Latin name takes a line of its own, as in the other verdicts' headlines, so a long one does not shrink
     * the card; a Han one stays with 曾在 ("曾在一顆衛星")
     */
    could: (sat: SatName, place: string, _cut: boolean): Rich => {
      const name = named(sat)
      const by = cjkGap('曾在', name) ? ['曾在', `${name}${cjkGap(name, '的')}`] : [`曾在${name}`]
      return [accent(place), `${cjkGap(place, by[0])}${by[0]}`, ...by.slice(1).map((p) => ` ${p}`), '的可視範圍內。']
    },
    overhead: (sat: SatName, place: string, cut: boolean): Rich => byName(sat, '飛越', place, cut),
  },
  /** Chinese cannot put "this week" after the place: 這星期， is the first line */
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => ['這星期，', ...watched(satellites, place), placeBlock(place, cut)],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  photos: (count: number, atLeast: boolean) =>
    count <= 0 ? '沒有影像公開。' : atLeast ? `至少已有 ${f.int(count)} 張影像公開。` : `已有 ${f.int(count)} 張影像公開。`,
  archiveDown: '影像庫沒有回應，暫時無法計算公開影像的數量。',
  archiveDownShort: '影像庫沒有回應。',
  cloud: {
    only: {
      sub: (_pct: number) => '雲層遮蔽，只看到雲。',
      chip: (pct: number) => `雲層遮蔽 · ${f.int(pct)}%`,
      post: (_pct: number) => '它只看到雲。',
      desc: (pct: number) => `它只看到雲（${f.int(pct)}%）。`,
    },
    mostly: {
      sub: (pct: number) => `大部分是雲：原圖的 ${f.int(pct)}%。`,
      chip: (pct: number) => `大部分是雲 · ${f.int(pct)}%`,
      post: (pct: number) => `它看到的大多是雲（${f.int(pct)}%）。`,
      desc: (pct: number) => `它看到的大多是雲（${f.int(pct)}%）。`,
    },
    spot: { sub: '雲正好蓋住這個地點。', chip: '地點被雲遮蔽', post: '雲蓋住了這個地點。', desc: '雲蓋住了這個地點。' },
  },

  // ── The top row (the chip form of a day: §6.4) ────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYearChip(ms, timeZone)} · ${clock} ${zone}`,
  weekTo: (ms: number, timeZone: string) => `截至 ${dayYearChip(ms, timeZone)} · 7 天`,
  lastWeek: '過去 7 天',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: '高度',
    elevation: '仰角',
    speed: '速度',
    offNadir: '側視角',
    pixel: '像素',
    mosaicPixel: '拼接像素',
    closest: '最近距離',
  },
  lane: { imaged: '影像', likely: '很可能', could: '或許', overhead: '上空' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`),
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${Math.round(km * 1000)} m`),
  geometry: '過境幾何 · 北方朝上',
  note: {
    imageInApp: '影像可在網站中開啟',
    imageUnavailable: '暫時無法取得影像',
    commercial: '商業影像庫，不公開',
    inSwath: '在掃描帶內，尚無公開影像',
    groundTrack: '最接近時的地面軌跡',
  },
  acquiring: '接收中…',
  noPublicPhoto: '這星期沒有公開影像',
  noPhoto: '沒有可顯示的影像',
  look: {
    closest: '最清晰的一張',
    lastClear: '最近一張無雲影像',
    clouded: '雲層遮蔽',
    radar: '雷達',
  },
  lookDay: (ms: number, timeZone: string) => {
    const d = zhFields(ms, timeZone)
    return `${d.month}月${d.day}日`
  },
  aSatellite: A_SATELLITE,
  /** 是什麼, never 誰: the satellites are not people (§3.5) */
  invite: '看看是什麼注視過你',

  // ── The default card ─────────────────────────────────────────────────────────────────────────────────────────────

  /** Three display lines, no comma: on a Chinese poster the line break is the pause (§3.1) */
  hero: [['這星期'], ['有東西'], ['注視過', accent('你'), '。']] as Rich[],
  enterAnyPlace: '輸入地球上任何地點',
  defaultPlace: '朱美拉棕櫚島',
  defaultAlt: '一張真實的 Sentinel-2 衛星照片，拍的是杜拜的朱美拉棕櫚島，旁邊寫著：這星期，有東西注視過你。輸入地球上任何地點。',

  // ── The share page ───────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: '這星期，有東西注視過你。',
    description: '輸入地球上任何一個地方，看看過去 7 天從上空飛過的每一顆衛星，以及它們實際拍下的影像。',
    /** A heading: no 。 and no ？ */
    placeTitle: (place: string) => withName('這星期，是什麼注視過', place, ''),
    placeDescription: (place: string) =>
      withName('過去 7 天從', place, '上空飛過的每一顆衛星，以及它們實際拍下的影像。這星期，是什麼注視過你？'),
    opening: ['正在開啟 ', accent('Watched')] as Rich,
  },
  /**
   * "Sentinel-2C 於 2026年11月1日（週日）11:21 EST 從 Waterloo 上空 795 km 處飛過，向南移動。" (overhead: 經過). A part
   * that is missing (the time, the altitude, the heading) drops its clause and the sentence stays whole.
   */
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) => {
    const where = withName('從', o.place, o.altitudeKm !== undefined ? `上空 ${f.int(Math.round(o.altitudeKm))} km 處` : '上空')
    const verb = o.verdict === 'overhead' ? '經過' : '飛過'
    return `${clauses(subject(o.sat), at(o.when), `${where}${verb}`)}${moving(o.heading)}。`
  },
  /** "WorldView Legion 4 於 …10:52 EST 向西北經過，Waterloo 在它的可視範圍內。" (the heading goes with the verb) */
  withinView: (o: PassFacts) => {
    const motion = compass(o.heading) ? `向${compass(o.heading)}經過` : '經過'
    return `${clauses(subject(o.sat), at(o.when), motion)}，${withName('', o.place, '在它的可視範圍內。')}`
  },
  couldHave: '它可能對準過這裡，但營運商不會透露。',
  straightDown: '它當時直視正下方。',
  offNadir: (deg: number) => `它當時的視線偏離正下方 ${f.dec(deg, 1)}°。`,
  cloudCover: (pct: number) => `雲量：${f.int(pct)}%。`,
  inSwath: (place: string) => withName('', place, '在它的掃描帶內。'),
  bestFrom: {
    closest: (sat: SatName) => withName('最清晰的一張來自', named(sat), '。'),
    lastClear: (sat: SatName) => withName('最近一張無雲影像來自', named(sat), '。'),
    first: (sat: SatName) => withName('第一張影像來自', named(sat), '。'),
  },
  question: '這星期，是什麼注視過你？',
  cardAlt: {
    withPhoto: (sat: SatName) => withName('分享卡片，附上這星期最清晰的一張照片，來自', named(sat), '。'),
    plain: '分享卡片。',
  },
}

export default card
