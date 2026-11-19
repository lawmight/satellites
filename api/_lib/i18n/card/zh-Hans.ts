/**
 * Simplified Chinese copy for the share card and the share page (see docs/i18n/zh-Hans.md §3.6). Pure TypeScript with
 * no DOM, Node or src/ imports, like ./en.ts: the server reads it through cardMessages(locale), and the app's zh-Hans
 * bundle lists this same module as its 'card' namespace.
 *
 * Why it is shaped this way:
 *  - Chinese needs no inflection, article or gender, so every frame takes any place or satellite name as it comes. What
 *    it does need is the space between Han and a name written in Latin letters ("注视过 Waterloo。", but "注视过北京。"):
 *    `cjkGap` decides it from the two edge characters, at every [PLACE] and [SAT] boundary, so the result is the same in
 *    every renderer (DOM, canvas, satori, plain text). The app's zh-Hans catalogs import it from here.
 *  - The place is always the accent block and always last, with 。 as its own part (dropped when the place was cut);
 *    the lead block ends with the gap, so the share page title (blocks joined with nothing) reads "有 7 颗卫星注视过
 *    Waterloo。".
 *  - Dates are built by hand from the place's local fields (dates.ts dateFormat at the place's zone, read as numbers):
 *    Intl's zh output ("11/1周日") is not the house style. The card's stamps are ISO digits; prose writes
 *    "2026年11月1日（周日）".
 *  - zh has one plural category, so every count has one form; the zero cases are their own sentences. A number and
 *    its measure word are joined by U+00A0, so "7 颗" never splits across lines.
 */
import { fmt } from '../format.js'
import { accent, type Rich } from '../parts.js'
import { dateFormat } from '../dates.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('zh-Hans')
const NB = ' '

// ── Spacing between Han and names in other scripts (docs/i18n/zh-Hans.md §5.1, Appendix B.3) ─────────────────────────

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

/** Text with a name in it: each name is joined to its neighbours through cjkGap. */
export function withName(before: string, name: string, after: string): string {
  return `${before}${cjkGap(before, name)}${name}${cjkGap(name, after)}${after}`
}

// ── Dates at the place, by hand (docs/i18n/zh-Hans.md §5.5, §6.4) ───────────────────────────────────────────────────

const FIELDS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' }
const WEEKDAY = '日一二三四五六'
const pad2 = (n: number) => String(n).padStart(2, '0')

/** The calendar day of an instant at a zone, as numbers (dow 0 = Sunday) */
export function zhFields(ms: number, timeZone: string): { year: number; month: number; day: number; dow: number } {
  const ps = dateFormat('zh-Hans', timeZone, FIELDS).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => Number(ps.find((p) => p.type === t)?.value ?? NaN)
  const year = get('year')
  const month = get('month')
  const day = get('day')
  return { year, month, day, dow: new Date(Date.UTC(year, month - 1, day)).getUTCDay() }
}

/** "11月1日（周日）": the day in prose (the post) */
export function zhDayProse(ms: number, timeZone: string): string {
  const d = zhFields(ms, timeZone)
  return `${d.month}月${d.day}日（周${WEEKDAY[d.dow]}）`
}
/** "2026年11月1日（周日）": the share page carries the year */
const dayYearProse = (ms: number, timeZone: string) => {
  const d = zhFields(ms, timeZone)
  return `${d.year}年${d.month}月${d.day}日（周${WEEKDAY[d.dow]}）`
}
/** "2026-11-01": the card's stamps (mono, no weekday) */
const iso = (ms: number, timeZone: string) => {
  const d = zhFields(ms, timeZone)
  return `${d.year}-${pad2(d.month)}-${pad2(d.day)}`
}

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** A satellite with no name, wherever a sentence needs one */
const A_SATELLITE = '一颗卫星'
const named = (sat: SatName) => sat ?? A_SATELLITE

/** The headline's last text part, with the gap to the place that follows it */
const lead = (text: string, place: string) => `${text}${cjkGap(text, place)}`
/**
 * The card's lead as phrases, one line each where a typesetter breaks a display headline (the card never breaks inside
 * a part): "有 7 颗卫星" "注视过 ", or "我们追踪的卫星" "没有一颗注视过 ". Flattened with no gap they read as the sentence.
 */
const watched = (n: number, place: string) =>
  n > 0 ? [`有 ${f.int(n)}${NB}颗卫星`, lead('注视过', place)] : ['我们追踪的卫星', lead('没有一颗注视过', place)]
/** "Sentinel-2C " "注视过 ": the satellite on its own line, then the verb, each with the gap to what follows */
const byName = (sat: SatName, verb: string, place: string, cut: boolean): Rich => [
  `${named(sat)}${cjkGap(named(sat), verb)}`,
  lead(verb, place),
  placeBlock(place, cut),
]
/** The place as the accent block, with its 。 as its own part unless the place was cut short */
const placeBlock = (place: string, cut: boolean) => (cut ? accent(place) : accent(place, '。'))

const COMPASS = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
/** "于2026年11月1日（周日）11:21 EST", or nothing when the moment is unknown */
const at = (w?: CardWhen) => (w ? `于${dayYearProse(w.ms, w.timeZone)}${w.clock} ${w.zone}` : '')
/** "，正向南飞行", or nothing when the heading is unknown */
const moving = (heading?: number) => (heading !== undefined && COMPASS[heading] ? `，正向${COMPASS[heading]}飞行` : '')
/**
 * The satellite's name and the clauses that follow it, the missing ones left out: "Sentinel-2C" "于…11:21 EST" "在
 * 795 km 高空" "飞越 Waterloo". Every clause starts with Han, so the space between two of them is cjkGap's.
 */
const clauses = (...parts: string[]) => parts.filter(Boolean).reduce((out, p) => `${out}${cjkGap(out, p)}${p}`, '')

const card: CardMessages = {
  // ── The headline (rich: text blocks in the condensed face, the accent block in the serif) ─────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [...watched(satellites, place), placeBlock(place, cut)],
  headlineBy: {
    imaged: (sat: SatName, place: string, cut: boolean): Rich => byName(sat, '注视过', place, cut),
    likely: (sat: SatName, place: string, cut: boolean): Rich => byName(sat, '扫过', place, cut),
    could: (sat: SatName, place: string, cut: boolean): Rich => byName(sat, '经过时能对准', place, cut),
    overhead: (sat: SatName, place: string, cut: boolean): Rich => byName(sat, '飞越', place, cut),
  },
  /** Chinese cannot put "this week" after the place: 这一周， is the first line */
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [
    '这一周，',
    ...watched(satellites, place),
    placeBlock(place, cut),
  ],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  photos: (count: number, atLeast: boolean) =>
    count <= 0 ? '没有公开的图像。' : atLeast ? `至少 ${f.int(count)}${NB}张图像已公开。` : `${f.int(count)}${NB}张图像已公开。`,
  archiveDown: '图像库没有及时响应，暂时无法统计公开图像。',
  archiveDownShort: '图像库没有响应。',
  cloud: {
    only: {
      sub: (_pct: number) => '云层遮挡。它只看到了云。',
      chip: (pct: number) => `云层遮挡 · ${f.int(pct)}%`,
      post: (_pct: number) => '它只看到了云。',
      desc: (pct: number) => `它只看到了云（${f.int(pct)}%）。`,
    },
    mostly: {
      sub: (pct: number) => `大部分是云：占整幅的 ${f.int(pct)}%。`,
      chip: (pct: number) => `大部分是云 · ${f.int(pct)}%`,
      post: (pct: number) => `它看到的大多是云（${f.int(pct)}%）。`,
      desc: (pct: number) => `它看到的大多是云（${f.int(pct)}%）。`,
    },
    spot: { sub: '此处正好被云遮住。', chip: '此处有云', post: '此处被云遮住了。', desc: '此处被云遮住了。' },
  },

  // ── The top row (ISO days: §6.4) ──────────────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${iso(ms, timeZone)} · ${clock} ${zone}`,
  weekTo: (ms: number, timeZone: string) => `截至 ${iso(ms, timeZone)} 的 7${NB}天`,
  lastWeek: `过去 7${NB}天`,

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: '高度',
    elevation: '仰角',
    speed: '速度',
    offNadir: '偏离垂直',
    pixel: '像素',
    mosaicPixel: '拼接图像素',
    closest: '最近距离',
  },
  lane: { imaged: '图像', likely: '很可能', could: '可对准', overhead: '过顶' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`),
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${Math.round(km * 1000)} m`),
  geometry: '过境几何 · 上北',
  note: {
    imageInApp: '图像可在网站中查看',
    imageUnavailable: '图像暂时无法显示',
    commercial: '商业图像库，不公开',
    inSwath: '在成像带内，暂无公开图像',
    groundTrack: '最接近时的地面轨迹',
  },
  acquiring: '获取中…',
  noPublicPhoto: '这一周没有公开图像',
  noPhoto: '没有可显示的图像',
  look: {
    closest: '最清晰画面',
    lastClear: '最近一次无云画面',
    clouded: '云层遮挡',
    radar: '雷达',
  },
  lookDay: (ms: number, timeZone: string) => {
    const d = zhFields(ms, timeZone)
    return `${d.month}月${d.day}日`
  },
  aSatellite: A_SATELLITE,
  invite: '看看是什么注视过你',

  // ── The default card ─────────────────────────────────────────────────────────────────────────────────────────────

  /** Three display lines, no comma: on a Chinese poster the line break is the pause (§3.1) */
  hero: [['这一周'], ['有东西'], ['注视过', accent('你'), '。']] as Rich[],
  enterAnyPlace: '输入地球上的任何地方',
  defaultPlace: '朱美拉棕榈岛',
  defaultAlt: '一张朱美拉棕榈岛（迪拜）的 Sentinel-2 卫星真实照片，旁边写着：这一周，有东西注视过你。输入地球上的任何地方。',

  // ── The share page (its title and description are the whole preview in WeChat and Weibo: they stand alone) ──────

  page: {
    title: '这一周，有东西注视过你。',
    description: `输入地球上的任何地方。你会看到过去 7${NB}天里飞过那里的每一颗卫星，以及它们拍下的真实图像。`,
    placeTitle: (place: string) => withName('这一周，是什么注视过', place, '？'),
    placeDescription: (place: string) =>
      `${withName(`过去 7${NB}天里飞过`, place, '的每一颗卫星')}，以及它们拍下的真实图像。这一周，是什么注视过你？`,
    opening: ['正在打开 ', accent('Watched')] as Rich,
  },
  /**
   * "Sentinel-2C 于2026年11月1日（周日）11:21 EST 在 795 km 高空飞越 Waterloo，正向南飞行。" A part that is missing (the
   * time, the altitude, the heading) drops its clause and the sentence stays whole.
   */
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) => {
    const height = o.altitudeKm !== undefined ? `在 ${Math.round(o.altitudeKm)}${NB}km 高空` : ''
    const verb = o.verdict === 'overhead' ? withName('从', o.place, '上空经过') : withName('飞越', o.place, '')
    return `${clauses(named(o.sat), at(o.when), height, verb)}${moving(o.heading)}。`
  },
  /** "WorldView Legion 4 于…10:52 EST 向西北飞行，Waterloo 在它的可视范围内。" (no heading: "…经过时，…") */
  withinView: (o: PassFacts) => {
    const motion = o.heading !== undefined && COMPASS[o.heading] ? `向${COMPASS[o.heading]}飞行` : '经过时'
    return `${clauses(named(o.sat), at(o.when), motion)}，${withName('', o.place, '在它的可视范围内。')}`
  },
  couldHave: '它能对准这里。运营方不公开它是否真的对准过。',
  straightDown: '它当时垂直俯视。',
  offNadir: (deg: number) => `它当时的视线偏离垂直方向 ${f.dec(deg, 1)}°。`,
  cloudCover: (pct: number) => `云量：${f.int(pct)}%。`,
  inSwath: (place: string) => withName('', place, '在它的成像带内。'),
  bestFrom: {
    closest: (sat: SatName) => withName('最清晰画面来自', named(sat), '。'),
    lastClear: (sat: SatName) => withName('最近一次无云画面来自', named(sat), '。'),
    first: (sat: SatName) => withName('第一张图像来自', named(sat), '。'),
  },
  question: '这一周，是什么注视过你？',
  cardAlt: {
    withPhoto: (sat: SatName) => withName('分享卡片，附有这一周最清晰的画面，来自', named(sat), '。'),
    plain: '分享卡片。',
  },
}

export default card
