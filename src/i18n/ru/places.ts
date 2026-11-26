/**
 * Russian names for the curated places (see docs/i18n/ru.md §4.3, §8): the landing's three example chips and the
 * "Surprise me" pool, every id with the same fields as English.
 *
 * Why these names: each is the established Russian name where one exists («Пирамиды Гизы», «Большой каньон»,
 * «Аризонский кратер», «Ниагарский водопад»), otherwise a transcription by Russian practice («Лас-Вегас-Стрип»,
 * «Соссусфлей»). Two are deliberate: «Мост Золотые Ворота», because the bare «Золотые Ворота» is also Kyiv's and
 * Vladimir's gate and Istanbul's strait, and «Чернобыльская АЭС», because the pin is the plant, about 15 km from the
 * town (the one stated exception to §8's rule on sites of the war). Static copy uses the standard Russian exonyms
 * («Киевская область», «Турция»). Sublabels use the short forms Russian writes («США», «ОАЭ», «ЮАР»), most specific
 * first. Usage stats, record_lookup and shares keep the English label, so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Зона 51', label: 'Зона 51', sublabel: 'Грум-Лейк, Невада, США' },
  centralPark: { chip: 'Центральный парк', label: 'Центральный парк', sublabel: 'Нью-Йорк, США' },
  giza: { chip: 'Гиза', label: 'Пирамиды Гизы', sublabel: 'Гиза, Египет' },
  // "Surprise me"
  uluru: { label: 'Улуру', sublabel: 'Северная территория, Австралия' },
  palmJumeirah: { label: 'Пальма Джумейра', sublabel: 'Дубай, ОАЭ' },
  worldIslands: { label: 'Острова «Мир»', sublabel: 'Дубай, ОАЭ' },
  grandCanyon: { label: 'Большой каньон', sublabel: 'Аризона, США' },
  meteorCrater: { label: 'Аризонский кратер', sublabel: 'Аризона, США' },
  lowerManhattan: { label: 'Нижний Манхэттен', sublabel: 'Нью-Йорк, США' },
  lasVegasStrip: { label: 'Лас-Вегас-Стрип', sublabel: 'Невада, США' },
  hooverDam: { label: 'Плотина Гувера и озеро Мид', sublabel: 'Невада и Аризона, США' },
  goldenGate: { label: 'Мост Золотые Ворота', sublabel: 'Сан-Франциско, США' },
  kennedySpaceCenter: { label: 'Космический центр Кеннеди', sublabel: 'Флорида, США' },
  washingtonDc: { label: 'Вашингтон', sublabel: 'Национальная аллея, США' },
  mountStHelens: { label: 'Гора Сент-Хеленс', sublabel: 'Штат Вашингтон, США' },
  niagaraFalls: { label: 'Ниагарский водопад', sublabel: 'Онтарио, Канада' },
  panamaCanal: { label: 'Панамский канал', sublabel: 'Шлюзы Гатун, Панама' },
  rioDeJaneiro: { label: 'Рио-де-Жанейро', sublabel: 'Сахарная Голова и Копакабана, Бразилия' },
  paris: { label: 'Париж', sublabel: 'Иль-де-Франс, Франция' },
  venice: { label: 'Венеция', sublabel: 'Венето, Италия' },
  vesuvius: { label: 'Везувий', sublabel: 'Неаполь, Италия' },
  istanbul: { label: 'Стамбул', sublabel: 'Босфор, Турция' },
  chernobyl: { label: 'Чернобыльская АЭС', sublabel: 'Киевская область, Украина' },
  tableMountain: { label: 'Столовая гора', sublabel: 'Кейптаун, ЮАР' },
  kilimanjaro: { label: 'Килиманджаро', sublabel: 'Килиманджаро, Танзания' },
  everest: { label: 'Эверест', sublabel: 'Непал и Китай' },
  angkorWat: { label: 'Ангкор-Ват', sublabel: 'Сиемреап, Камбоджа' },
  singapore: { label: 'Сингапур', sublabel: 'Марина-Бэй, Сингапур' },
  hongKong: { label: 'Гонконг', sublabel: 'Гавань Виктория, Гонконг' },
  tokyo: { label: 'Токио', sublabel: 'Токио, Япония' },
  fuji: { label: 'Фудзи', sublabel: 'Сидзуока, Япония' },
  sydneyHarbour: { label: 'Сиднейская гавань', sublabel: 'Сидней, Австралия' },
  richat: { label: 'Структура Ришат', sublabel: 'Сахара, Мавритания' },
  greatBlueHole: { label: 'Большая голубая дыра', sublabel: 'Риф Лайтхаус, Белиз' },
  boraBora: { label: 'Бора-Бора', sublabel: 'Острова Общества, Французская Полинезия' },
  hardyReef: { label: 'Риф Харди', sublabel: 'Большой Барьерный риф, Австралия' },
  male: { label: 'Мале', sublabel: 'Атолл Северный Мале, Мальдивы' },
  deadSea: { label: 'Солеварни Мёртвого моря', sublabel: 'Южный бассейн, Израиль и Иордания' },
  binghamCanyon: { label: 'Карьер Бингем-Каньон', sublabel: 'Юта, США' },
  mountWhaleback: { label: 'Карьер Маунт-Уэйлбэк', sublabel: 'Пилбара, Австралия' },
  etna: { label: 'Этна', sublabel: 'Сицилия, Италия' },
  santorini: { label: 'Санторини', sublabel: 'Киклады, Греция' },
  teide: { label: 'Тейде', sublabel: 'Тенерифе, Испания' },
  kilauea: { label: 'Килауэа', sublabel: 'Гавайи, США' },
  craterLake: { label: 'Озеро Крейтер', sublabel: 'Орегон, США' },
  glenCanyonDam: { label: 'Плотина Глен-Каньон', sublabel: 'Пейдж, Аризона, США' },
  gardenCity: { label: 'Круглые поля Гарден-Сити', sublabel: 'Канзас, США' },
  almeria: { label: 'Теплицы Альмерии', sublabel: 'Андалусия, Испания' },
  gibraltar: { label: 'Гибралтар', sublabel: 'Гибралтарский пролив' },
  suezCanal: { label: 'Суэцкий канал', sublabel: 'Исмаилия, Египет' },
  aswanDam: { label: 'Асуанская плотина', sublabel: 'Озеро Насер, Египет' },
  wadiRum: { label: 'Вади-Рам', sublabel: 'Акаба, Иордания' },
  sossusvlei: { label: 'Соссусфлей', sublabel: 'Пустыня Намиб, Намибия' },
  victoriaFalls: { label: 'Водопад Виктория', sublabel: 'Замбия и Зимбабве' },
  threeGorges: { label: 'Плотина «Три ущелья»', sublabel: 'Хубэй, Китай' },
  shanghai: { label: 'Шанхай', sublabel: 'Река Хуанпу, Китай' },
  itaipu: { label: 'Плотина Итайпу', sublabel: 'Бразилия и Парагвай' },
}
export default places
