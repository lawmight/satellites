/**
 * Ukrainian names for the curated places (see docs/i18n/uk.md §4.4, §8): the landing's three example chips and the
 * "Surprise me" pool, every id with the same fields as English.
 *
 * Why these names: each is the established Ukrainian exonym where one exists («Піраміди Гізи», «Великий каньйон»,
 * «Ніагарський водоспад»), otherwise a transliteration by Ukrainian rules («Лас-Вегас-Стрип», «Соссусфлей»). Two are
 * deliberate: «Міст Золоті Ворота», because the bare «Золоті Ворота» is Kyiv's gate to a Ukrainian reader, and
 * «Чорнобильська АЕС», because the pin is the plant, about 15 km from the town (the one stated exception to §8's rule
 * on Ukrainian sites). Sublabels use the short forms Ukrainians write («США», «ОАЕ», «ПАР»), most specific first, and
 * «й / і» by the euphony rule (both sides are fixed text here). Usage stats, record_lookup and shares keep the English
 * label, so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Зона 51', label: 'Зона 51', sublabel: 'Грум-Лейк, Невада, США' },
  centralPark: { chip: 'Центральний парк', label: 'Центральний парк', sublabel: 'Нью-Йорк, США' },
  giza: { chip: 'Гіза', label: 'Піраміди Гізи', sublabel: 'Гіза, Єгипет' },
  // "Surprise me"
  uluru: { label: 'Улуру', sublabel: 'Північна територія, Австралія' },
  palmJumeirah: { label: 'Пальма Джумейра', sublabel: 'Дубай, ОАЕ' },
  worldIslands: { label: 'Острови «Світ»', sublabel: 'Дубай, ОАЕ' },
  grandCanyon: { label: 'Великий каньйон', sublabel: 'Аризона, США' },
  meteorCrater: { label: 'Метеоритний кратер', sublabel: 'Аризона, США' },
  lowerManhattan: { label: 'Нижній Мангеттен', sublabel: 'Нью-Йорк, США' },
  lasVegasStrip: { label: 'Лас-Вегас-Стрип', sublabel: 'Невада, США' },
  hooverDam: { label: 'Гребля Гувера й озеро Мід', sublabel: 'Невада й Аризона, США' },
  goldenGate: { label: 'Міст Золоті Ворота', sublabel: 'Сан-Франциско, США' },
  kennedySpaceCenter: { label: 'Космічний центр Кеннеді', sublabel: 'Флорида, США' },
  washingtonDc: { label: 'Вашингтон', sublabel: 'Національна алея, США' },
  mountStHelens: { label: 'Гора Сент-Геленс', sublabel: 'штат Вашингтон, США' },
  niagaraFalls: { label: 'Ніагарський водоспад', sublabel: 'Онтаріо, Канада' },
  panamaCanal: { label: 'Панамський канал', sublabel: 'Шлюзи Гатун, Панама' },
  rioDeJaneiro: { label: 'Ріо-де-Жанейро', sublabel: 'Цукрова Голова й Копакабана, Бразилія' },
  paris: { label: 'Париж', sublabel: 'Іль-де-Франс, Франція' },
  venice: { label: 'Венеція', sublabel: 'Венето, Італія' },
  vesuvius: { label: 'Везувій', sublabel: 'Неаполь, Італія' },
  istanbul: { label: 'Стамбул', sublabel: 'Босфор, Туреччина' },
  chernobyl: { label: 'Чорнобильська АЕС', sublabel: 'Київська область, Україна' },
  tableMountain: { label: 'Столова гора', sublabel: 'Кейптаун, ПАР' },
  kilimanjaro: { label: 'Кіліманджаро', sublabel: 'Кіліманджаро, Танзанія' },
  everest: { label: 'Еверест', sublabel: 'Непал і Китай' },
  angkorWat: { label: 'Ангкор-Ват', sublabel: 'Сіємреап, Камбоджа' },
  singapore: { label: 'Сінгапур', sublabel: 'Марина-Бей, Сінгапур' },
  hongKong: { label: 'Гонконг', sublabel: 'Гавань Вікторія, Гонконг' },
  tokyo: { label: 'Токіо', sublabel: 'Токіо, Японія' },
  fuji: { label: 'Фудзі', sublabel: 'Сідзуока, Японія' },
  sydneyHarbour: { label: 'Сіднейська гавань', sublabel: 'Сідней, Австралія' },
  richat: { label: 'Структура Рішат', sublabel: 'Сахара, Мавританія' },
  greatBlueHole: { label: 'Велика блакитна діра', sublabel: 'Риф Лайтгаус, Беліз' },
  boraBora: { label: 'Бора-Бора', sublabel: 'Острови Товариства, Французька Полінезія' },
  hardyReef: { label: 'Риф Гарді', sublabel: 'Великий Бар’єрний риф, Австралія' },
  male: { label: 'Мале', sublabel: 'Атол Північний Мале, Мальдіви' },
  deadSea: { label: 'Солеварні Мертвого моря', sublabel: 'Південний басейн, Ізраїль і Йорданія' },
  binghamCanyon: { label: 'Кар’єр Бінгем-Каньйон', sublabel: 'Юта, США' },
  mountWhaleback: { label: 'Кар’єр Маунт-Вейлбек', sublabel: 'Пілбара, Австралія' },
  etna: { label: 'Етна', sublabel: 'Сицилія, Італія' },
  santorini: { label: 'Санторині', sublabel: 'Кіклади, Греція' },
  teide: { label: 'Тейде', sublabel: 'Тенерифе, Іспанія' },
  kilauea: { label: 'Кілауеа', sublabel: 'Гаваї, США' },
  craterLake: { label: 'Озеро Крейтер', sublabel: 'Орегон, США' },
  glenCanyonDam: { label: 'Гребля Глен-Каньйон', sublabel: 'Пейдж, Аризона, США' },
  gardenCity: { label: 'Круглі поля Гарден-Сіті', sublabel: 'Канзас, США' },
  almeria: { label: 'Теплиці Альмерії', sublabel: 'Андалусія, Іспанія' },
  gibraltar: { label: 'Гібралтар', sublabel: 'Гібралтарська протока' },
  suezCanal: { label: 'Суецький канал', sublabel: 'Ісмаїлія, Єгипет' },
  aswanDam: { label: 'Асуанська гребля', sublabel: 'Озеро Насер, Єгипет' },
  wadiRum: { label: 'Ваді-Рам', sublabel: 'Акаба, Йорданія' },
  sossusvlei: { label: 'Соссусфлей', sublabel: 'Пустеля Наміб, Намібія' },
  victoriaFalls: { label: 'Водоспад Вікторія', sublabel: 'Замбія й Зімбабве' },
  threeGorges: { label: 'Гребля «Три ущелини»', sublabel: 'Хубей, Китай' },
  shanghai: { label: 'Шанхай', sublabel: 'Річка Хуанпу, Китай' },
  itaipu: { label: 'Гребля Ітайпу', sublabel: 'Бразилія й Парагвай' },
}
export default places
