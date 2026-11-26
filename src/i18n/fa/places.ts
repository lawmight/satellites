/**
 * Persian names for the curated places: the landing's three example chips and the «غافلگیرم کن» pool (see
 * src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/fa.md §4.3).
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the name Persian
 * readers know («اهرام جیزه», «ونیز», «جبل‌الطارق», «چشم صحرا», the name the Richat Structure went round the Persian web
 * by) and is otherwise written in Persian letters as Persian writers spell it («سنترال پارک», «گرند کنیون»). A label
 * goes into the headline's place slot as it is, followed by «را», so none needs a grammatical ending. Chips start with
 * a Persian letter and stay within about 14 characters. Sublabels go most specific first, joined with «، ». Country
 * names are exactly `Intl.DisplayNames('fa')`'s long names (Hong Kong its short one), and two countries are joined
 * with «و» in Persian alphabetical order («اردن و اسرائیل», «چین و نپال», «برزیل و پاراگوئه»). «ایالت واشینگتن» keeps
 * Mount St. Helens apart from the capital. Usage stats, lookups and shares keep the English label
 * (Place.canonicalLabel), so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'منطقهٔ 51', label: 'منطقهٔ 51', sublabel: 'دریاچهٔ گروم، نوادا، ایالات متحده' },
  centralPark: { chip: 'سنترال پارک', label: 'سنترال پارک', sublabel: 'نیویورک، ایالات متحده' },
  giza: { chip: 'جیزه', label: 'اهرام جیزه', sublabel: 'جیزه، مصر' },
  // «غافلگیرم کن»
  uluru: { label: 'اولورو', sublabel: 'قلمرو شمالی، استرالیا' },
  palmJumeirah: { label: 'نخل جمیرا', sublabel: 'دبی، امارات متحدهٔ عربی' },
  worldIslands: { label: 'جزایر جهان', sublabel: 'دبی، امارات متحدهٔ عربی' },
  grandCanyon: { label: 'گرند کنیون', sublabel: 'آریزونا، ایالات متحده' },
  meteorCrater: { label: 'دهانهٔ شهاب‌سنگ', sublabel: 'آریزونا، ایالات متحده' },
  lowerManhattan: { label: 'منهتن جنوبی', sublabel: 'نیویورک، ایالات متحده' },
  lasVegasStrip: { label: 'استریپ لاس وگاس', sublabel: 'نوادا، ایالات متحده' },
  hooverDam: { label: 'سد هوور و دریاچهٔ مید', sublabel: 'نوادا و آریزونا، ایالات متحده' },
  goldenGate: { label: 'گلدن گیت', sublabel: 'سان فرانسیسکو، ایالات متحده' },
  kennedySpaceCenter: { label: 'مرکز فضایی کندی', sublabel: 'فلوریدا، ایالات متحده' },
  washingtonDc: { label: 'واشینگتن دی‌سی', sublabel: 'نشنال مال، ایالات متحده' },
  mountStHelens: { label: 'کوه سنت هلنز', sublabel: 'ایالت واشینگتن، ایالات متحده' },
  niagaraFalls: { label: 'آبشار نیاگارا', sublabel: 'انتاریو، کانادا' },
  panamaCanal: { label: 'کانال پاناما', sublabel: 'آب‌بندهای گاتون، پاناما' },
  rioDeJaneiro: { label: 'ریو دو ژانیرو', sublabel: 'کوه شوگرلوف و کوپاکابانا، برزیل' },
  paris: { label: 'پاریس', sublabel: 'ایل دو فرانس، فرانسه' },
  venice: { label: 'ونیز', sublabel: 'ونتو، ایتالیا' },
  vesuvius: { label: 'کوه وزوویوس', sublabel: 'ناپل، ایتالیا' },
  istanbul: { label: 'استانبول', sublabel: 'تنگهٔ بسفر، ترکیه' },
  chernobyl: { label: 'چرنوبیل', sublabel: 'استان کی‌یف، اوکراین' },
  tableMountain: { label: 'کوه تیبل', sublabel: 'کیپ‌تاون، افریقای جنوبی' },
  kilimanjaro: { label: 'کلیمانجارو', sublabel: 'کلیمانجارو، تانزانیا' },
  everest: { label: 'قلهٔ اورست', sublabel: 'چین و نپال' },
  angkorWat: { label: 'انگکور وات', sublabel: 'سیم ریپ، کامبوج' },
  singapore: { label: 'سنگاپور', sublabel: 'خلیج مارینا، سنگاپور' },
  hongKong: { label: 'هنگ‌کنگ', sublabel: 'بندر ویکتوریا، هنگ‌کنگ' },
  tokyo: { label: 'توکیو', sublabel: 'توکیو، ژاپن' },
  fuji: { label: 'کوه فوجی', sublabel: 'شیزوئوکا، ژاپن' },
  sydneyHarbour: { label: 'بندر سیدنی', sublabel: 'سیدنی، استرالیا' },
  richat: { label: 'چشم صحرا', sublabel: 'صحرای بزرگ آفریقا، موریتانی' },
  greatBlueHole: { label: 'گودال بزرگ آبی', sublabel: 'آبسنگ لایت‌هاوس، بلیز' },
  boraBora: { label: 'بورابورا', sublabel: 'جزایر سوسایتی، پلی‌نزی فرانسه' },
  hardyReef: { label: 'آبسنگ هاردی', sublabel: 'دیوارهٔ بزرگ مرجانی، استرالیا' },
  male: { label: 'ماله', sublabel: 'آتول ماله شمالی، مالدیو' },
  deadSea: { label: 'حوضچه‌های نمک دریای مرده', sublabel: 'حوضهٔ جنوبی، اردن و اسرائیل' },
  binghamCanyon: { label: 'معدن بینگهام کنیون', sublabel: 'یوتا، ایالات متحده' },
  mountWhaleback: { label: 'معدن کوه ویل‌بک', sublabel: 'پیلبارا، استرالیا' },
  etna: { label: 'کوه اتنا', sublabel: 'سیسیل، ایتالیا' },
  santorini: { label: 'سانتورینی', sublabel: 'جزایر سیکلاد، یونان' },
  teide: { label: 'کوه تیده', sublabel: 'تنریف، اسپانیا' },
  kilauea: { label: 'کیلائوئا', sublabel: 'هاوایی، ایالات متحده' },
  craterLake: { label: 'دریاچهٔ کریتر', sublabel: 'اورگن، ایالات متحده' },
  glenCanyonDam: { label: 'سد گلن کنیون', sublabel: 'پیج، آریزونا، ایالات متحده' },
  gardenCity: { label: 'دایره‌های کشت گاردن سیتی', sublabel: 'کانزاس، ایالات متحده' },
  almeria: { label: 'گلخانه‌های آلمریا', sublabel: 'اندلس، اسپانیا' },
  gibraltar: { label: 'جبل‌الطارق', sublabel: 'تنگهٔ جبل‌الطارق' },
  suezCanal: { label: 'کانال سوئز', sublabel: 'اسماعیلیه، مصر' },
  aswanDam: { label: 'سد بلند اسوان', sublabel: 'دریاچهٔ ناصر، مصر' },
  wadiRum: { label: 'وادی رم', sublabel: 'عقبه، اردن' },
  sossusvlei: { label: 'سوسوسفلی', sublabel: 'صحرای نامیب، نامیبیا' },
  victoriaFalls: { label: 'آبشار ویکتوریا', sublabel: 'زامبیا و زیمبابوه' },
  threeGorges: { label: 'سد سه دره', sublabel: 'هوبئی، چین' },
  shanghai: { label: 'شانگهای', sublabel: 'رود هوانگپو، چین' },
  itaipu: { label: 'سد ایتایپو', sublabel: 'برزیل و پاراگوئه' },
}

export default places
