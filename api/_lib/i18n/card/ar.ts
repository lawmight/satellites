/**
 * Arabic copy for the share card and the share page (see docs/i18n/ar.md §3.1, §3.3, §3.5, §4.2, §5, §6): every word
 * the card prints and every word the server writes around it. Pure TypeScript, no DOM, Node or src/ imports: the server
 * reads it through cardMessages('ar'), and the app's ar bundle lists this very module.
 *
 * Why it is built this way:
 *  - The headline is the results headline without its window: the verb first, singular and masculine for every count
 *    (it agrees with «قمر»), then the count phrase in all six CLDR forms, then the place in the serif as the verb's
 *    object («رصد 7 أقمار صناعية | *Waterloo.*»). One and two are words («قمر صناعي واحد»، «قمران صناعيان»). Zero is
 *    its own sentence, the subject named before the place so the place never reads as the subject («لم يرصد أي قمر
 *    صناعي نتتبّعه | *Waterloo.*»). The week's card puts «هذا الأسبوع،» first, as the app's headline does.
 *  - The satellite always follows its head noun «القمر الصناعي» (a no-break space between them), masculine throughout.
 *    When the place would be the object right after the satellite's name the sentence is nominal («القمر الصناعي
 *    Sentinel-2C رصد | *Waterloo.*»), so two Latin names never touch; with a preposition between them the verb leads.
 *    A nameless satellite is an indefinite «قمر صناعي» after the verb. These messages get no crewed flag, so a crewed
 *    station is recognised by its display name (ISS, Tiangong), as the pass view and the results recognise it: the
 *    overhead sentences, the only ones that can name one, say «مرّت المحطة الفضائية ISS» (f), never «القمر الصناعي
 *    ISS», which no Arabic writer says (ar.md §5.2, §9.1).
 *  - The place is never inflected, never takes an attached preposition, an article or a pronoun pointing back at it.
 *  - Plain text everywhere (the PNG, the og tags, the page title): it starts with an Arabic letter, holds no bidi
 *    control characters (the renderer strips them; X counts each as two), uses «،» and «؟», and never an em dash.
 *  - Days come from Intl in CLDR `ar` (Gregorian, Western digits) at the place's zone, as Intl writes them («الأحد، 1
 *    نوفمبر 2026»). Clocks and zones arrive formatted and are followed by Arabic words, never by a bare unit.
 *  - Numbers come from fmt('ar'); a no-break space ties a number to its unit or counted noun. Readout labels are nouns
 *    with the article; units are the symbols («كم»، «م»، «كم/ث»).
 */
import { fmt } from '../format.js'
import { formatDate } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('ar')
const nb = '\u00a0'

// ── Days at the place, from Intl ────────────────────────────────────────────────────────────────────────────────────

/** «الأحد، 1 نوفمبر 2026»: the card is the one place a human date carries the year */
const dayYear = (ms: number, timeZone: string) =>
  formatDate('ar', ms, timeZone, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
/** «3 نوفمبر» (Arabic has no abbreviated months) */
const dayMonth = (ms: number, timeZone: string) => formatDate('ar', ms, timeZone, { day: 'numeric', month: 'long' })

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** The count phrase after «رصد»: «قمر صناعي واحد» · «قمران صناعيان» · «7 أقمار صناعية» · «256 قمرًا صناعيًا» · «200 قمر صناعي» */
const satellites = (n: number) =>
  f.plural(n, {
    zero: `${f.int(n)}${nb}قمر صناعي`,
    one: 'قمر صناعي واحد',
    two: 'قمران صناعيان',
    few: `${f.int(n)}${nb}أقمار صناعية`,
    many: `${f.int(n)}${nb}قمرًا صناعيًا`,
    other: `${f.int(n)}${nb}قمر صناعي`,
  })
/** «رصد 256 قمرًا صناعيًا» / «لم يرصد أي قمر صناعي نتتبّعه»: the subject is named before the place */
const watched = (n: number) => (n > 0 ? `رصد ${satellites(n)}` : 'لم يرصد أي قمر صناعي نتتبّعه')
/** The full stop after the place, unless it was cut short or already ends on a stop («…», «D.C.») */
const stop = (cut: boolean, place: string) => (cut || /[.…!?؟]$/u.test(place) ? [] : ['.'])
/** The serif block: the place and its full stop (its own part, as English keeps it) */
const head = (place: string, cut: boolean) => accent(place, ...stop(cut, place))

/** «صورة واحدة» · «صورتان» · «7 صور» · «31 صورة» · «100 صورة» (the subject of «نُشرت») */
const images = (n: number) =>
  f.plural(n, {
    zero: `${f.int(n)}${nb}صورة`,
    one: 'صورة واحدة',
    two: 'صورتان',
    few: `${f.int(n)}${nb}صور`,
    many: `${f.int(n)}${nb}صورة`,
    other: `${f.int(n)}${nb}صورة`,
  })

/** «القمر الصناعي Sentinel-2C», or an indefinite «قمر صناعي» for a nameless one (after a verb or a preposition) */
const theSat = (sat: SatName) => (sat ? `القمر الصناعي${nb}${sat}` : 'قمر صناعي')
/**
 * Display names of the crewed stations (src/engine/profiles.ts: ISS, Tiangong). No message carries a crewed flag, so
 * the station is recognised by its name, as the pass view and the results do (src/i18n/ar/pass.ts, results.ts).
 */
const CREWED = /^(ISS|Tiangong)\b/
const isStation = (sat: SatName) => !!sat && CREWED.test(sat)
/** "[SAT] passed": «مرّ القمر الصناعي X» (m), or «مرّت المحطة الفضائية ISS» (f), never «القمر الصناعي ISS» (ar.md §9.1) */
const passed = (sat: SatName) => (isStation(sat) ? `مرّت المحطة الفضائية${nb}${sat}` : `مرّ ${theSat(sat)}`)

/** Moving: 0 north … 7 northwest (ar.md §4.2, the "heading" column) */
const HEADING = [
  'نحو الشمال',
  'نحو الشمال الشرقي',
  'نحو الشرق',
  'نحو الجنوب الشرقي',
  'نحو الجنوب',
  'نحو الجنوب الغربي',
  'نحو الغرب',
  'نحو الشمال الغربي',
]
/** « عند 11:21 EST يوم الأحد، 1 نوفمبر 2026» (running prose that wraps: a no-break space ties the clock to its zone) */
const at = (w?: CardWhen) => (w ? ` عند ${w.clock}${nb}${w.zone} يوم ${dayYear(w.ms, w.timeZone)}` : '')
/** «، متجهًا نحو الجنوب» (its subject is the sentence's satellite; «متجهةً» for a station, f) */
const moving = (heading?: number, station = false) =>
  heading !== undefined && HEADING[heading] ? `، ${station ? 'متجهةً' : 'متجهًا'} ${HEADING[heading]}` : ''
const pct = (n: number) => `${f.int(n)}%`

const ar: CardMessages = {
  // ── The headline: the lead in the condensed face, then the place in the serif ─────────────────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), head(place, cut)],
  headlineBy: {
    // Nominal when the place would follow the satellite's name; a nameless satellite comes after the verb.
    imaged: (sat: SatName, place: string, cut: boolean): Rich => [
      sat ? `${theSat(sat)} رصد` : 'رصد قمر صناعي',
      head(place, cut),
    ],
    likely: (sat: SatName, place: string, cut: boolean): Rich => [
      sat ? `${theSat(sat)} غطّى` : 'غطّى قمر صناعي',
      head(place, cut),
    ],
    could: (sat: SatName, place: string, cut: boolean): Rich => [`مرّ ${theSat(sat)} على مرأى من`, head(place, cut)],
    overhead: (sat: SatName, place: string, cut: boolean): Rich => [`${passed(sat)} فوق`, head(place, cut)],
  },
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [
    `هذا الأسبوع، ${watched(satellites)}`,
    head(place, cut),
  ],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  // Verb first: «نُشرت» agrees with «صورة» (f) in every form; «على الأقل» closes the sentence.
  photos: (count: number, atLeast: boolean) =>
    count <= 0 ? 'لم تُنشر للعموم أي صورة.' : `نُشرت للعموم ${images(count)}${atLeast ? ' على الأقل' : ''}.`,
  archiveDown: 'لم تستجب أرشيفات الصور، لذا لا يمكننا الآن عدّ الصور المنشورة للعموم.',
  archiveDownShort: 'لم تستجب أرشيفات الصور.',
  cloud: {
    only: {
      sub: (_pct: number) => 'غطّت السحب المشهد: لم ير سواها.',
      chip: (p: number) => `تحت السحب · ${pct(p)}`,
      post: (_pct: number) => 'لم ير سوى السحب.',
      desc: (p: number) => `لم ير سوى السحب (${pct(p)}).`,
    },
    // «معظم المشهد سحب», naming the scene: the percentage is the scene's (ar.md decisions, item 13).
    mostly: {
      sub: (p: number) => `معظم المشهد سحب: ${pct(p)}.`,
      chip: (p: number) => `معظم المشهد سحب · ${pct(p)}`,
      post: (p: number) => `رأى سحبًا في معظم المشهد (${pct(p)}).`,
      desc: (p: number) => `رأى سحبًا في معظم المشهد (${pct(p)}).`,
    },
    spot: { sub: 'سحب فوق البقعة نفسها.', chip: 'سحب فوق البقعة', post: 'غطّت السحب البقعة.', desc: 'غطّت السحب البقعة.' },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  // A no-break space keeps the clock with its zone, as in every Arabic stamp (ar.md §6.7).
  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock}${nb}${zone}`,
  // A mono stamp may start with a digit (ar.md §6.2.2); the week is always seven days.
  weekTo: (ms: number, timeZone: string) => `7${nb}أيام حتى ${dayYear(ms, timeZone)}`,
  lastWeek: `آخر 7${nb}أيام`,

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: 'الارتفاع',
    // Always with «زاوية»: a bare «الارتفاع» is the altitude
    elevation: 'زاوية الارتفاع',
    speed: 'السرعة',
    // Never «الميل», which reads as orbital inclination
    offNadir: 'الانحراف',
    pixel: 'البكسل',
    mosaicPixel: 'بكسل الفسيفساء',
    closest: 'أقرب مسافة',
  },
  lane: { imaged: 'صورة', likely: 'مرجّح', could: 'ممكن', overhead: 'فوقك' },
  unit: { km: 'كم', m: 'م', kmPerSecond: 'كم/ث' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) =>
    metres >= 1000 ? `${f.int(metres / 1000)}${nb}كم` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)}${nb}م`,
  distance: (km: number) => `${f.int(km)}${nb}كم`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)}${nb}كم` : `${f.int(km * 1000)}${nb}م`),
  // «مسار المرور», never «الهندسة» (engineering)
  geometry: 'مسار المرور · الشمال للأعلى',
  note: {
    // «التطبيق», not «الموقع», which this product also uses for "your location"
    imageInApp: 'تُفتح الصورة في التطبيق',
    imageUnavailable: 'الصورة غير متاحة الآن',
    commercial: 'أرشيف تجاري غير متاح للعموم',
    inSwath: 'ضمن نطاق المسح، ولا صورة منشورة بعد',
    groundTrack: 'المسار الأرضي عند أقرب نقطة',
  },
  acquiring: 'جارٍ الالتقاط…',
  noPublicPhoto: 'لا صورة منشورة هذا الأسبوع',
  noPhoto: 'لا صورة للعرض',
  look: {
    closest: 'أقرب نظرة',
    // Never «آخر نظرة», the farewell to the dead (ar.md §8)
    lastClear: 'أحدث نظرة صافية',
    clouded: 'تحت السحب',
    radar: 'رادار',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  // A lone label (chips, the plan plate's callout); sentences say «قمر صناعي» themselves.
  aSatellite: 'قمر صناعي',
  // A question replaces the English imperative "See what watched you".
  invite: 'ما الذي رصدك؟',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────

  // "There is something / that watched *you* / this week." (ar.md §3.1): the accent is «أنت», never vocalised.
  hero: [['ثمّة شيء'], ['رصدك ', accent('أنت')], ['هذا الأسبوع.']] as Rich[],
  enterAnyPlace: 'أي مكان على الأرض',
  defaultPlace: 'نخلة جميرا',
  defaultAlt:
    `صورة حقيقية من القمر الصناعي${nb}Sentinel-2 لنخلة جميرا في دبي، بجانب العبارة: ثمّة شيء رصدك أنت هذا الأسبوع. أي مكان على الأرض.`,

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: 'ثمّة شيء رصدك أنت هذا الأسبوع.',
    // The sub line (ar.md §3.2): «نريك» replaces the English imperatives with the product's "we".
    description: `أي مكان على الأرض، نريك كل قمر صناعي مرّ فوقه خلال آخر 7${nb}أيام، والصور الحقيقية التي التقطها.`,
    // «الذي» is the subject and comes first, so the place can only be the object.
    placeTitle: (place: string) => `ما الذي رصد ${place} هذا الأسبوع`,
    placeDescription: (place: string) =>
      `كل قمر صناعي مرّ فوق ${place} خلال آخر 7${nb}أيام، والصور الحقيقية التي التقطها. ما الذي رصدك هذا الأسبوع؟`,
    opening: ['جارٍ فتح ', accent('Watched')] as Rich,
  },
  // Imaged, likely and overhead all «مرّ … فوق» (never «عبر» or «حلّق», ar.md §3.4); the altitude, the moment and the
  // heading each drop out cleanly when unknown.
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) => {
    const alt = o.altitudeKm !== undefined ? ` على ارتفاع ${f.int(o.altitudeKm)}${nb}كم` : ''
    return `${passed(o.sat)}${alt} فوق ${o.place}${at(o.when)}${moving(o.heading, isStation(o.sat))}.`
  },
  withinView: (o: PassFacts) => `مرّ ${theSat(o.sat)} على مرأى من ${o.place}${at(o.when)}${moving(o.heading)}.`,
  couldHave: 'كان بإمكانه توجيه كاميرته إلى هنا. لا يقول مشغّله إن كان قد فعل.',
  straightDown: 'كان ينظر عموديًا إلى الأسفل.',
  offNadir: (deg: number) => `كان ينظر إلى الأسفل بانحراف ${f.dec(deg, 1)}° عن العمودي.`,
  cloudCover: (p: number) => `الغطاء السحابي: ${pct(p)}.`,
  // The place cannot be the subject of «كان» (its gender is unknown): the swath is (ar.md §5.1).
  inSwath: (place: string) => `كان نطاق مسحه يشمل ${place}.`,
  bestFrom: {
    closest: (sat: SatName) => `أقرب نظرة من ${theSat(sat)}.`,
    lastClear: (sat: SatName) => `أحدث نظرة صافية من ${theSat(sat)}.`,
    first: (sat: SatName) => `أول صورة من ${theSat(sat)}.`,
  },
  question: 'ما الذي رصدك هذا الأسبوع؟',
  cardAlt: {
    withPhoto: (sat: SatName) => `بطاقة المشاركة، مع أقرب صورة هذا الأسبوع، من ${theSat(sat)}.`,
    plain: 'بطاقة المشاركة.',
  },
}

export default ar
