/**
 * Arabic copy for the passes: the list grouped by verdict and the view of one pass (see src/i18n/en/passView.ts for
 * where each message shows; docs/i18n/ar.md §3.7 "passView" is the authority on every line here).
 *
 * Why it reads this way:
 *  - A pass is «مرور» (m), counted with «مرة» in every verdict, so the verdict a count arrives with changes nothing.
 *    Where number and noun are one run of text (a group header, an accessible name) one and two are words («مرة
 *    واحدة»، «مرتان»); where the number is its own figure over its unit (`countStack`) the digit stays and the unit
 *    agrees with it («1 مرة»، «2 مرتان»، «3 مرات»، «31 مرة»), ar.md §5.4. All six CLDR categories are written out.
 *  - Notes are verb-first MSA. The satellite follows its head noun («القمر الصناعي Sentinel-2C»، masculine throughout);
 *    an agency or archive as a subject has one too («تجمع ناسا»، «أرشيف هذا الرادار»). The place is «المكان» or «البقعة»
 *    (our nouns), never the slot, and "your spot" is the unvocalised «بقعتك».
 *  - Readout labels are nouns with the article («الارتفاع»، «زاوية الارتفاع»، «الانحراف»), never «الميل» (inclination)
 *    or «الهندسة» (engineering): the geometry section is «القياسات». Units are the symbols («كم»، «م»، «كم/ث»، «د»);
 *    prose spells metres with agreement («250 مترًا»). Compass points arrive in Latin letters («SSW») and stay.
 *  - Spans and directions read right to left with ← (ar.md §6.1); each clock stays its own island. A degree after an
 *    Arabic word is one LRI…PDI island (DOM-only text, §6.2.7), or right-to-left text draws its «°» before the digits.
 *  - Joins inside accessible names use «، », and a percentage is said in words there («25 بالمئة», ar.md §5.5).
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'

const f = fmt('ar')
/** A whole count, or a fraction kept (its plural form is `other`) */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
const nb = '\u00a0'
/** U+2066 LEFT-TO-RIGHT ISOLATE \u2026 U+2069 POP DIRECTIONAL ISOLATE: one left-to-right run in a DOM-only string */
const ltr = (s: string) => `\u2066${s}\u2069`

/** Passes in a run of text: «مرة واحدة» · «مرتان» · «3 مرات» · «11 مرة» · «100 مرة» (and «0 مرة») */
const passes = (n: number) =>
  f.plural(n, {
    zero: `${count(n)}${nb}مرة`,
    one: 'مرة واحدة',
    two: 'مرتان',
    few: `${count(n)}${nb}مرات`,
    many: `${count(n)}${nb}مرة`,
    other: `${count(n)}${nb}مرة`,
  })
/** The unit under a stacked digit, agreeing with it: «0 مرة»، «1 مرة»، «2 مرتان»، «3 مرات»، «31 مرة»، «100 مرة» */
const passUnit = (n: number) => f.plural(n, { zero: 'مرة', one: 'مرة', two: 'مرتان', few: 'مرات', many: 'مرة', other: 'مرة' })
/** Satellites in a run of text: «قمر صناعي واحد» · «قمران صناعيان» · «7 أقمار صناعية» · «11 قمرًا صناعيًا» · «100 قمر صناعي» */
const satellites = (n: number) =>
  f.plural(n, {
    zero: `${count(n)}${nb}قمر صناعي`,
    one: 'قمر صناعي واحد',
    two: 'قمران صناعيان',
    few: `${count(n)}${nb}أقمار صناعية`,
    many: `${count(n)}${nb}قمرًا صناعيًا`,
    other: `${count(n)}${nb}قمر صناعي`,
  })
/** "N more rows", the object of «عرض»: «صف آخر» · «صفين آخرين» · «3 صفوف أخرى» · «40 صفًا آخر» · «100 صف آخر» */
const moreRows = (n: number) =>
  f.plural(n, {
    zero: `${count(n)}${nb}صف آخر`,
    one: 'صف آخر',
    two: 'صفين آخرين',
    few: `${count(n)}${nb}صفوف أخرى`,
    many: `${count(n)}${nb}صفًا آخر`,
    other: `${count(n)}${nb}صف آخر`,
  })
/** Metres after «بدقة» (genitive): «متر واحد» · «مترين» · «5 أمتار» · «250 مترًا» · «500 متر» */
const metres = (m: number) => {
  const n = Math.round(m)
  return f.plural(n, {
    zero: `${f.int(n)}${nb}متر`,
    one: 'متر واحد',
    two: 'مترين',
    few: `${f.int(n)}${nb}أمتار`,
    many: `${f.int(n)}${nb}مترًا`,
    other: `${f.int(n)}${nb}متر`,
  })
}
/** How often a geostationary satellite takes a full disc: «كل دقيقة» · «كل دقيقتين» · «كل 10 دقائق» · «كل 15 دقيقة» */
const everyMinutes = (n: number) =>
  f.plural(n, {
    zero: 'كل بضع دقائق',
    one: 'كل دقيقة',
    two: 'كل دقيقتين',
    few: `كل ${count(n)}${nb}دقائق`,
    many: `كل ${count(n)}${nb}دقيقة`,
    other: `كل ${count(n)}${nb}دقيقة`,
  })

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty:
    'لم يمرّ أي قمر صناعي نتتبّعه فوق هذا المكان خلال هذه الفترة. هذا نادر؛ والملاحظات أعلاه تذكر إن كان أحد مصادر البيانات معطّلًا.',
  imagedOrder: 'أقرب نظرة، ثم الأحدث',
  count: (n: number, _verdict: Verdict) => passes(n),
  countStack: (n: number, _verdict: Verdict): NumPart => num(count(n), passUnit(n)),
  sats: (n: number) => satellites(n),
  // Label and value: one form for every count, and the number never sits after a preposition.
  showAllSats: (n: number) => `عرض كل الأقمار الصناعية: ${f.int(n)}`,
  showAllRows: (n: number) => `عرض كل الصفوف: ${f.int(n)}`,
  showMore: (n: number) => `عرض ${moreRows(n)}`,
  left: (n: number) => `متبقٍّ: ${f.int(n)}`,
  showFewer: 'عرض أقل',
  tag: {
    mosaic: 'فسيفساء',
    radar: 'رادار',
    // Percentages after Arabic words are left-to-right islands, or «81%» draws «%81»
    cloudedPct: (pct: number) => `سحب · \u2066${f.int(pct)}%\u2069`,
    cloudedAtSpot: 'سحب فوق البقعة',
  },
  // «Sentinel-2C، رصد، الجمعة، 6 نوفمبر 16:14 EST، قبل 41 ساعة، السحب 25 بالمئة، تحت السحب»
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day} ${o.time} ${o.zone}`,
      o.ago,
      o.cloudPct !== undefined ? `السحب ${f.int(o.cloudPct)} بالمئة` : undefined,
      o.clouded ? 'تحت السحب' : undefined,
    ]
      .filter(Boolean)
      .join('، '),
  // The angle is isolated, as in the timeline's tooltip (results.ts): after an Arabic word «8.9°» would display «°8.9».
  offNadir: (deg: number) => `انحراف ${ltr(`${f.dec(deg, 1)}°`)}`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)}${nb}كم`,
  cloudPct: (pct: number) => `السحب \u2066${f.int(pct)}%\u2069`,
  expandLabel: (sat: string, day: string, time: string) => `تكبير الصورة: ${sat}، ${day} ${time}`,
  expandTitle: 'تكبير الصورة',
  // «Sentinel-2C، ESA، 31 مرة، الأحدث الجمعة، 6 نوفمبر 16:14»
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `، ${o.operator}` : ''}، ${passes(o.passes)}، الأحدث ${o.day} ${o.time}`,
  latest: 'الأحدث ',
  closest: 'الأقرب ',
  cloudChip: 'سحب',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'الصور',
  planSection: 'المنظر العلوي',
  geometry: 'القياسات',
  replay: 'إعادة العرض',
  // «خشنة، لكنها حقيقية» agrees with the image (صورة، f); «التقط» with the satellite (m).
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `صورة للقرص الكامل: لقطة واحدة لكل ما يراه القمر الصناعي، بدقة ${pixel} لكل بكسل هنا. خشنة، لكنها حقيقية، وأحدث ما نُشر؛ وقد التقط مثلها ${
      cadenceMin ? everyMinutes(cadenceMin) : 'كل بضع دقائق'
    } طوال الأسبوع.`,
  mosaicNote: (gsdM: number) =>
    `فسيفساء يومية: تجمع ناسا مسارات كل يوم في صورة واحدة بدقة ${metres(gsdM)} لكل بكسل. خشنة، لكنها حقيقية، ومن يوم هذا المرور.`,
  radarNote:
    `صورة رادارية، لا صورة فوتوغرافية: يُرسل القمر الصناعي${nb}Sentinel-1 موجات ميكروية ويسجّل صداها، فلا تحجبه السحب ولا الظلام. السطوع هو قوة ارتداد الموجات عن الأرض: المباني والأرض الوعرة ساطعة، والماء الساكن داكن.`,
  noImage: {
    openArchive: (sat: string) => `لا صورة من القمر الصناعي${nb}${sat} لهذه البقعة من هذا المرور. منظر علوي للمرور.`,
    radarPrivate: 'لا صورة منشورة: أرشيف هذا الرادار غير متاح للعموم. منظر علوي للمرور.',
    commercialPrivate: 'لا صورة منشورة: الأرشيفات التجارية غير متاحة للعموم. منظر علوي للمرور.',
    noneToShow: 'لا صورة لعرضها من هذا المرور. منظر علوي للمرور.',
    archiveDown: 'تعذّر البحث في الأرشيف الآن. منظر علوي للمرور.',
    noScene: 'لا يوجد مشهد لهذا المرور. منظر علوي للمرور.',
    notYet: 'لا يطابق هذا المرور أي مشهد منشور بعد. تظهر مشاهد Sentinel-2 وLandsat عادةً خلال يوم.',
    crewed: 'تحمل المحطات المأهولة كاميرات، لكن صورها لا تُنشر بحسب المكان والوقت.',
    unavailable: 'صورة هذا المرور غير متاحة.',
  },
  links: {
    openToSave: 'فتح الصورة لحفظها',
    downloading: 'جارٍ التنزيل…',
    download: 'تنزيل الصورة',
    viewSource: (archive: string) => `عرض المصدر · ${archive}`,
  },
  spot: {
    checking: 'جارٍ قراءة البكسل فوق بقعتك…',
    clear: 'صافٍ فوق بقعتك.',
    cirrus: 'ظهر سمحاق رقيق فوق بقعتك؛ قد يخفف حدة الصورة.',
    cloud: 'سحب فوق بقعتك.',
    shadow: 'كانت بقعتك في ظل سحابة.',
  },

  // ── the readout strip ───────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'الارتفاع',
    elevation: 'زاوية الارتفاع',
    offNadir: 'الانحراف',
    pixel: 'البكسل',
    band: 'الحزمة',
    sun: 'الشمس',
    cloud: 'السحب',
    cloudAtSpot: 'السحب هنا',
  },
  // A 21 px nowrap value in the last of four cells: «تحت الحمراء» (two words, 128 px) overflows the panel where
  // "Infrared" is 104 px, so infrared takes its tight Latin form «IR» (ar.md §4.1, §6.7), as the timeline chip does.
  band: { infrared: 'IR', visible: 'مرئي', colour: 'ألوان' },
  spotValue: { clear: 'صافٍ', cirrus: 'سمحاق', cloud: 'سحب', shadow: 'ظل' },
  unit: {
    km: 'كم',
    m: 'م',
    kmS: 'كم/ث',
    // «62° ارتفاعًا»: degrees of elevation, the tamyiz after the angle
    up: 'ارتفاعًا',
    mosaic: 'فسيفساء',
    scene: 'المشهد',
    sun: { day: 'نهار', twilight: 'شفق', night: 'ليل' },
  },

  // ── 01 / القياسات ───────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'أقرب نقطة · UTC',
    closestLocal: 'أقرب نقطة · محلي',
    groundDistance: 'المسافة الأرضية',
    elevationFromYou: 'زاوية الارتفاع من مكانك',
    groundSpeed: 'السرعة الأرضية',
    heading: 'الاتجاه',
    sunElevation: 'ارتفاع الشمس',
    fieldOfRegard: 'مدى التوجيه',
    swath: 'نطاق المسح',
    inSwath: 'ضمن نطاق المسح',
    inView: 'ضمن المدى',
    window: 'النافذة الزمنية',
    noradPass: 'NORAD · المرور',
    scanUtc: 'خط المسح هنا · UTC',
    scanLocal: 'خط المسح هنا · محلي',
    aboveEquator: 'فوق خط الاستواء عند',
    inYourSky: 'في سمائك',
    scanDirection: 'اتجاه المسح',
    lineSpeed: 'سرعة الخط هنا',
    coverage: 'التغطية',
    thisScan: 'هذا المسح',
    noradScan: 'NORAD · المسح',
  },
  northToSouth: 'الشمال ← الجنوب',
  southToNorth: 'الجنوب ← الشمال',
  // From first, in logical order: under dir="rtl" it sits on the right and ← points to the end (ar.md §6.2.4).
  timeRange: (from: string, to: string) => `${from} ← ${to}`,
  sunPhase: { day: 'نهار', twilight: 'شفق', night: 'ليل' },
  fullDisc: 'القرص الكامل',
  everyMin: (n: number) => `كل ${count(n)}${nb}د`,
  upCompass: (compass: string) => `ارتفاعًا · ${compass}`,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'صاعد' : 'هابط'}`,
}
export default passView
