/**
 * Arabic names for the curated places: the landing's three example chips and the «فاجئني» pool (see
 * src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/ar.md §4.3, which gives every name here).
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the established
 * Arabic exonym («أهرامات الجيزة»، «البندقية»، «جبل طارق»، «عين الصحراء», the name Arab readers know the Richat
 * Structure by) and is otherwise written in Arabic letters as Arabic writers spell it («سنترال بارك»، «لاس فيغاس
 * ستريب», never «قطاع», which is Gaza's word). A label goes into the headline's place slot as it is, so none adds or
 * drops an article for grammar. Chips start with an Arabic letter and stay within about 14 characters. Sublabels go
 * most specific first, joined with «، ». Country names are exactly `Intl.DisplayNames('ar-u-nu-latn')`'s long names
 * (Hong Kong its short one, §6.9.8), and two countries are joined with «و» in Arabic alphabetical order, ignoring
 * «ال» («الأردن وإسرائيل»، «الصين ونيبال»، «باراغواي والبرازيل»). «ولاية واشنطن» keeps Mount St. Helens apart from
 * the capital. Usage stats, lookups and shares keep the English label (Place.canonicalLabel), so nothing here splits a
 * count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'المنطقة 51', label: 'المنطقة 51', sublabel: 'بحيرة غروم، نيفادا، الولايات المتحدة' },
  centralPark: { chip: 'سنترال بارك', label: 'سنترال بارك', sublabel: 'نيويورك، الولايات المتحدة' },
  giza: { chip: 'الجيزة', label: 'أهرامات الجيزة', sublabel: 'الجيزة، مصر' },
  // «فاجئني»
  uluru: { label: 'أولورو', sublabel: 'الإقليم الشمالي، أستراليا' },
  palmJumeirah: { label: 'نخلة جميرا', sublabel: 'دبي، الإمارات العربية المتحدة' },
  worldIslands: { label: 'جزر العالم', sublabel: 'دبي، الإمارات العربية المتحدة' },
  grandCanyon: { label: 'الأخدود العظيم', sublabel: 'أريزونا، الولايات المتحدة' },
  meteorCrater: { label: 'فوهة النيزك', sublabel: 'أريزونا، الولايات المتحدة' },
  lowerManhattan: { label: 'مانهاتن السفلى', sublabel: 'نيويورك، الولايات المتحدة' },
  lasVegasStrip: { label: 'لاس فيغاس ستريب', sublabel: 'نيفادا، الولايات المتحدة' },
  hooverDam: { label: 'سد هوفر وبحيرة ميد', sublabel: 'نيفادا وأريزونا، الولايات المتحدة' },
  goldenGate: { label: 'البوابة الذهبية', sublabel: 'سان فرانسيسكو، الولايات المتحدة' },
  kennedySpaceCenter: { label: 'مركز كينيدي للفضاء', sublabel: 'فلوريدا، الولايات المتحدة' },
  washingtonDc: { label: 'واشنطن العاصمة', sublabel: 'ناشونال مول، الولايات المتحدة' },
  mountStHelens: { label: 'جبل سانت هيلينز', sublabel: 'ولاية واشنطن، الولايات المتحدة' },
  niagaraFalls: { label: 'شلالات نياغارا', sublabel: 'أونتاريو، كندا' },
  panamaCanal: { label: 'قناة بنما', sublabel: 'أهوسة غاتون، بنما' },
  rioDeJaneiro: { label: 'ريو دي جانيرو', sublabel: 'جبل السكر وكوباكابانا، البرازيل' },
  paris: { label: 'باريس', sublabel: 'إيل دو فرانس، فرنسا' },
  venice: { label: 'البندقية', sublabel: 'فينيتو، إيطاليا' },
  vesuvius: { label: 'جبل فيزوف', sublabel: 'نابولي، إيطاليا' },
  istanbul: { label: 'إسطنبول', sublabel: 'البوسفور، تركيا' },
  chernobyl: { label: 'تشيرنوبل', sublabel: 'مقاطعة كييف، أوكرانيا' },
  tableMountain: { label: 'جبل الطاولة', sublabel: 'كيب تاون، جنوب أفريقيا' },
  kilimanjaro: { label: 'كليمنجارو', sublabel: 'كليمنجارو، تنزانيا' },
  everest: { label: 'جبل إيفرست', sublabel: 'الصين ونيبال' },
  angkorWat: { label: 'أنغكور وات', sublabel: 'سييم ريب، كمبوديا' },
  singapore: { label: 'سنغافورة', sublabel: 'مارينا باي، سنغافورة' },
  hongKong: { label: 'هونغ كونغ', sublabel: 'ميناء فيكتوريا، هونغ كونغ' },
  tokyo: { label: 'طوكيو', sublabel: 'طوكيو، اليابان' },
  fuji: { label: 'جبل فوجي', sublabel: 'شيزوكا، اليابان' },
  sydneyHarbour: { label: 'ميناء سيدني', sublabel: 'سيدني، أستراليا' },
  richat: { label: 'عين الصحراء', sublabel: 'الصحراء الكبرى، موريتانيا' },
  greatBlueHole: { label: 'الثقب الأزرق العظيم', sublabel: 'شعاب لايتهاوس، بليز' },
  boraBora: { label: 'بورا بورا', sublabel: 'جزر المجتمع، بولينيزيا الفرنسية' },
  hardyReef: { label: 'شعاب هاردي', sublabel: 'الحاجز المرجاني العظيم، أستراليا' },
  male: { label: 'ماليه', sublabel: 'أتول ماليه الشمالي، جزر المالديف' },
  deadSea: { label: 'برك الملح في البحر الميت', sublabel: 'الحوض الجنوبي، الأردن وإسرائيل' },
  binghamCanyon: { label: 'منجم بينغهام كانيون', sublabel: 'يوتا، الولايات المتحدة' },
  mountWhaleback: { label: 'منجم جبل ويلباك', sublabel: 'بيلبارا، أستراليا' },
  etna: { label: 'جبل إتنا', sublabel: 'صقلية، إيطاليا' },
  santorini: { label: 'سانتوريني', sublabel: 'جزر كيكلادس، اليونان' },
  teide: { label: 'جبل تيدي', sublabel: 'تينيريفي، إسبانيا' },
  kilauea: { label: 'كيلاويا', sublabel: 'هاواي، الولايات المتحدة' },
  craterLake: { label: 'بحيرة كريتر', sublabel: 'أوريغون، الولايات المتحدة' },
  glenCanyonDam: { label: 'سد غلين كانيون', sublabel: 'بيج، أريزونا، الولايات المتحدة' },
  gardenCity: { label: 'الحقول الدائرية في غاردن سيتي', sublabel: 'كانساس، الولايات المتحدة' },
  almeria: { label: 'البيوت المحمية في المرية', sublabel: 'الأندلس، إسبانيا' },
  gibraltar: { label: 'جبل طارق', sublabel: 'مضيق جبل طارق' },
  suezCanal: { label: 'قناة السويس', sublabel: 'الإسماعيلية، مصر' },
  aswanDam: { label: 'السد العالي', sublabel: 'بحيرة ناصر، مصر' },
  wadiRum: { label: 'وادي رم', sublabel: 'العقبة، الأردن' },
  sossusvlei: { label: 'سوسوسفلي', sublabel: 'صحراء ناميب، ناميبيا' },
  victoriaFalls: { label: 'شلالات فيكتوريا', sublabel: 'زامبيا وزيمبابوي' },
  threeGorges: { label: 'سد الخوانق الثلاثة', sublabel: 'هوبي، الصين' },
  shanghai: { label: 'شنغهاي', sublabel: 'نهر هوانغبو، الصين' },
  itaipu: { label: 'سد إيتايبو', sublabel: 'باراغواي والبرازيل' },
}

export default places
