/**
 * Arabic copy about the satellites themselves: the one-sentence blurb under a pass's sentence in the pass view (see
 * src/i18n/en/sats.ts for where it shows; docs/i18n/ar.md §3.7 "Small namespaces" and the glossary §4.1 are the
 * authority on the words).
 *
 * Why it reads this way:
 *  - Each blurb is one plain sentence in MSA that starts with an Arabic word, so the line never begins with a Latin
 *    name. Most open on a noun of known gender («جهاز تصوير»، «قمر طقس»، «قمر رادار»، «رادار»، «محطة الفضاء»); the rest
 *    have the satellite named above as their unstated subject, so their verbs are masculine («يلتقط»، «يقدّم»، «يغطّي»),
 *    as every reference to a satellite is (§5.2). English "Its …" is the suffix ـه («جهاز تصويره VIIRS»), and ـها in
 *    the Tiangong blurb, where it means the station («وحدتها المركزية»). An instrument as a subject takes «جهاز» (§5.3).
 *  - Names stay in Latin letters, never with «ال» or a case ending: satellites, instruments, missions, programmes,
 *    companies (Planet is always «شركة Planet», never the common noun), and radar bands as «النطاق X / C / L» (§4.1).
 *    "Dual-band" is «ثنائي التردد», so «نطاق» never appears without its letter.
 *  - The glossary's words hold: swath «نطاق مسح بعرض … كم» (never «شريحة»), imager «جهاز تصوير», multispectral «متعدد
 *    الأطياف», band «حزمة طيفية», panchromatic «بانكروماتي», cubesat «قمر صناعي مكعب», constellation «كوكبة», full disk
 *    «القرص الكامل», geostationary «ثابت» (its only use), operational «عامل». The product's verb «يرصد» stands for
 *    "has watched"; "images" is «يلتقط صورة», never «صوّر» (§2.3); «مسح» stays a noun (§8).
 *  - Numbers come from fmt('ar') (Western digits, «3,040», «1.1»), years ungrouped («منذ 2011»), with the symbol units
 *    «كم»، «م»، «سم» after a no-break space (§3.7: the blurbs use symbols). Counts follow §5.4 («13 حزمة طيفية»، «ثماني
 *    حزم»), a digit tied to its noun by the same no-break space, as «القمر الصناعي» is to the name after it (§6.7). The
 *    ISS's month comes from Intl, as every month does.
 *  - Radar "spotlight" imagery is said by what the mode gives («صور مركّزة على مساحة صغيرة»): «الضوء الكاشف»
 *    (searchlight) would put a light on a radar, which needs none.
 */
import type en from '../en/sats'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('ar')
const nb = '\u00a0'
/** A whole number or a decimal, grouped by fmt('ar') and tied to its unit */
const n = (v: number) => (Number.isInteger(v) ? f.int(v) : f.dec(v, 1))
const km = (v: number) => `${n(v)}${nb}كم`
const m = (v: number) => `${n(v)}${nb}م`
const cm = (v: number) => `${n(v)}${nb}سم`
/** «كل 10 دقائق» · «كل 15 دقيقة» · «كل 30 دقيقة»: the cadences these blurbs state (10 is `few`, 15 and 30 `many`) */
const every = { 10: `كل 10${nb}دقائق`, 15: `كل 15${nb}دقيقة`, 30: `كل 30${nb}دقيقة` }

/** "November 2000" in CLDR's Arabic months («نوفمبر 2000») */
const issSince = formatDate('ar', Date.UTC(2000, 10, 2), 'UTC', { month: 'long', year: 'numeric' })

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──
    sentinel2: `جهاز تصوير متعدد الأطياف من برنامج Copernicus: له 13${nb}حزمة طيفية، ودقة ${m(10)} لكل بكسل، ونطاق مسح بعرض ${km(290)}.`,
    landsat8: `جهاز Operational Land Imager: بكسلات ملونة بدقة ${m(30)} وأخرى بانكروماتية بدقة ${m(15)}، على نطاق مسح بعرض ${km(185)}.`,
    landsat9: `جهاز Operational Land Imager 2: بكسلات ملونة بدقة ${m(30)} وأخرى بانكروماتية بدقة ${m(15)}، على نطاق مسح بعرض ${km(185)}.`,

    // ── Weather satellites in polar orbit ──
    noaaViirs: `يغطّي جهاز تصويره VIIRS نطاق مسح بعرض ${km(3040)}، فيرصد الكوكب كله مرتين في اليوم.`,
    suomiNpp: `أول جهاز تصوير VIIRS في المدار، يغطّي نطاق مسح بعرض ${km(3040)} منذ 2011.`,
    terra: `يرصد جهاز تصويره MODIS الكوكب كله، بعرض ${km(2330)} في كل مرة، منذ 1999.`,
    aqua: `يرصد جهاز تصويره MODIS الكوكب كله، بعرض ${km(2330)} في كل مرة، منذ 2002.`,
    metop: `قمر طقس أوروبي في مدار قطبي؛ يغطّي جهاز تصويره AVHRR نطاق مسح بعرض ${km(2900)} بدقة ${km(1.1)} لكل بكسل.`,
    sentinel3: `يرصد جهازه OLCI ألوان اليابسة والمحيطات في 21${nb}حزمة طيفية، على نطاق مسح بعرض ${km(1270)}.`,
    fengyun3: `قمر طقس صيني في مدار قطبي؛ يغطّي جهاز تصويره MERSI نطاق مسح بعرض ${km(2900)}.`,
    fengyun3e: 'قمر طقس صيني في مدار الفجر والغسق، مزوّد بجهاز تصوير MERSI يعمل في الإضاءة الخافتة.',

    // ── Geostationary weather satellites ──
    goesEast: `يقدّم خدمة GOES-East، ويلتقط صورة للقرص الكامل فوق الأمريكتين ${every[10]}.`,
    goesWest: `يقدّم خدمة GOES-West، ويلتقط صورة للقرص الكامل فوق المحيط الهادئ والأمريكتين ${every[10]}.`,
    goes16: 'كان يقدّم خدمة GOES-East، وأُبقي في المدار احتياطيًا.',
    goes17: 'كان يقدّم خدمة GOES-West، وأُبقي في المدار احتياطيًا.',
    himawari9: `قمر الطقس الياباني، يلتقط صورة للقرص الكامل فوق آسيا والمحيط الهادئ ${every[10]}.`,
    himawari8: `يعمل احتياطيًا للقمر الصناعي${nb}Himawari-9.`,
    meteosat12: `أول أقمار Meteosat من الجيل الثالث (MTG-I1)، يلتقط صورة لأوروبا وأفريقيا ${every[10]}.`,
    meteosat9: `يغطّي منطقة المحيط الهندي، ويلتقط صورة للقرص الكامل ${every[15]}.`,
    meteosatSecondGen: 'أحد أقمار Meteosat من الجيل الثاني؛ لا نعدّه هنا ضمن أجهزة تصوير القرص الكامل التي ترصد هذا المكان.',
    mtgI2: 'ثاني أقمار Meteosat من الجيل الثالث؛ لا يقدّم الخدمة التشغيلية بعد.',
    geoKompsat2a: `قمر الطقس الكوري الجنوبي، يلتقط صورة للقرص الكامل ${every[10]}.`,
    fengyun4b: `قمر الطقس الصيني الثابت العامل، يلتقط صورة للقرص الكامل ${every[15]}.`,
    fengyun4a: 'قمر طقس صيني ثابت أقدم، لا نعدّه الخدمة الأساسية.',
    fengyun4c: 'أحدث قمر طقس صيني ثابت؛ لا يقدّم الخدمة التشغيلية بعد.',
    insat: `قمر طقس هندي، يلتقط صورة للقرص الكامل ${every[30]}.`,
    insat3d: 'قمر طقس هندي أقدم، لا نعدّه من أجهزة التصوير العاملة.',
    elektroL: `قمر طقس روسي ثابت، يلتقط صورة للقرص الكامل ${every[30]}.`,
    elektroL2: 'قمر طقس روسي ثابت أقدم، لا نعدّه من أجهزة التصوير العاملة.',
    elektroL5: 'أحدث قمر طقس روسي ثابت؛ لا نعدّه عاملًا بعد.',

    // ── Commercial and government high-resolution cameras ──
    worldview1: `جهاز تصوير بانكروماتي بدقة ${cm(50)} لكل بكسل، يمكنه النظر بعيدًا عن مساره الأرضي.`,
    worldview2: `جهاز تصوير له ثماني حزم طيفية، وبكسلات بانكروماتية بدقة ${cm(46)}.`,
    worldview3: `جهاز تصوير له بكسلات بانكروماتية بدقة ${cm(31)}، و16${nb}حزمة طيفية.`,
    geoeye1: `جهاز تصوير له بكسلات بانكروماتية بدقة ${cm(41)}، في المدار منذ 2008.`,
    worldviewLegion: `أحد أجهزة التصوير WorldView Legion التابعة لشركة Maxar، بدقة نحو ${cm(30)} لكل بكسل.`,
    skysat: `جهاز تصوير سريع المناورة تابع لشركة Planet، بدقة نحو ${cm(50)} لكل بكسل؛ يُوجّه إلى أهداف محددة عند الطلب.`,
    pelican: 'جهاز تصوير عالي الدقة وسريع المناورة، من الجيل الأحدث لدى شركة Planet.',
    superDove: `قمر صناعي مكعب من طراز SuperDove تابع لشركة Planet؛ يرصد أسطوله معظم يابسة الأرض كل يوم بدقة نحو ${m(3)}.`,
    blacksky: `جهاز تصوير تابع لشركة BlackSky يعود سريعًا إلى المكان نفسه، بدقة نحو ${m(1)} لكل بكسل أو أفضل.`,
    pleiades: `جهاز تصوير سريع المناورة يقدّم منتجات بانكروماتية بدقة ${cm(50)}.`,
    pleiadesNeo: `جهاز تصوير سريع المناورة بدقة أصلية ${cm(30)} لكل بكسل.`,
    spot6: `جهاز تصوير للمساحات الواسعة، له بكسلات بانكروماتية بدقة ${m(1.5)} ونطاق مسح بعرض ${km(60)}.`,
    spot7: `توأم القمر الصناعي${nb}SPOT 6، تشغّله أذربيجان باسم Azersky.`,
    kompsat3: `جهاز تصوير كوري جنوبي له بكسلات بانكروماتية بدقة ${cm(70)}.`,
    kompsat3a: `جهاز تصوير كوري جنوبي له بكسلات بانكروماتية بدقة ${cm(55)} وقناة للأشعة تحت الحمراء.`,
    jilin1: 'جزء من كوكبة Jilin-1 التجارية الصينية، مزوّد بأجهزة تصوير دقتها دون المتر.',
    superview: `جهاز تصوير تجاري صيني بدقة نحو ${cm(50)} لكل بكسل أو أفضل.`,
    gaofenWideField: `جهاز تصوير حكومي صيني، له كاميرات بانكروماتية بدقة ${m(2)} وأخرى واسعة المجال بدقة ${m(16)}.`,
    gaofen2: `جهاز تصوير حكومي صيني له بكسلات بانكروماتية بدقة ${cm(80)}.`,
    gaofen7: 'جهاز تصوير حكومي صيني لرسم الخرائط المجسمة، بدقة دون المتر لكل بكسل.',
    gaofenOptical: 'قمر صناعي بصري حكومي صيني عالي الدقة؛ مواصفاته غير منشورة.',

    // ── Radar satellites ──
    sentinel1: `رادار في النطاق C من برنامج Copernicus، تُنشر كل صوره: نطاق مسح بعرض ${km(250)} على أحد جانبي مساره، بدقة ${m(20)}، عبر السحب، ليلًا ونهارًا.`,
    iceye: 'قمر رادار صغير يعمل في النطاق X، يمكن تكليفه بالتقاط صور عبر السحب، ليلًا ونهارًا.',
    capella: `قمر رادار يعمل في النطاق X، يلتقط صورًا مركّزة على مساحة صغيرة بدقة نحو ${cm(50)}، ليلًا ونهارًا.`,
    umbra: `قمر رادار يعمل في النطاق X، يلتقط صورًا مركّزة على مساحة صغيرة بدقة تصل إلى نحو ${cm(25)}.`,
    japaneseSmallRadar: 'قمر رادار ياباني صغير يعمل في النطاق X.',
    kompsat5: `قمر رادار كوري جنوبي يعمل في النطاق X، يلتقط صورًا مركّزة على مساحة صغيرة بدقة ${m(1)}.`,
    terrasarX: 'قمر رادار ألماني يعمل في النطاق X، يلتقط الصور منذ 2007.',
    tandemX: `يدور في تشكيل متقارب مع القمر الصناعي${nb}TerraSAR-X لرسم خريطة تضاريس الأرض بالرادار.`,
    cosmoSkymed: 'قمر رادار إيطالي يعمل في النطاق X، ضمن منظومة COSMO-SkyMed.',
    paz: 'قمر رادار إسباني يعمل في النطاق X.',
    radarsat2: 'قمر رادار كندي يعمل في النطاق C، يلتقط الصور منذ 2007.',
    rcm: 'أحد ثلاثة أقمار صناعية في البعثة الكندية RADARSAT Constellation Mission.',
    saocom: 'قمر رادار أرجنتيني يعمل في النطاق L، ويقيس رطوبة التربة أيضًا.',
    alos2: 'قمر رادار ياباني يعمل في النطاق L، يلتقط الصور منذ 2014.',
    alos4: `قمر رادار ياباني يعمل في النطاق L، خلفًا للقمر الصناعي${nb}ALOS-2.`,
    nisar: `رادار ثنائي التردد يرسم الخرائط على نطاق مسح بعرض ${km(242)} ليقيس حركة سطح الأرض.`,
    superviewNeo2: 'قمر رادار تجاري صيني يعمل في النطاق X.',
    gaofen3: 'قمر رادار حكومي صيني يعمل في النطاق C.',
    gaofen12: 'قمر رادار حكومي صيني؛ مواصفاته غير منشورة.',

    // ── Crewed space stations (feminine: «محطة») ──
    iss: `محطة الفضاء الدولية، مأهولة دون انقطاع منذ ${issSince}.`,
    tiangong: 'محطة الفضاء الصينية، بُنيت حول وحدتها المركزية Tianhe التي أُطلقت عام 2021.',
  },
}

export default sats
