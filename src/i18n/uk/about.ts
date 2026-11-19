/**
 * Ukrainian copy for the About page (see docs/i18n/uk.md §3.9): every heading, paragraph, fact, credit and key.
 *
 * Why it reads this way: About is the owner's plain voice, so it talks to one person with ти and keeps the answers
 * short («Мене видно? Ні.»); the product is ми. No sentence has ти as the subject of a past tense (the reader's gender
 * is unknown, §1.4): «Якщо твоє місце було в досяжності», «вибраний проліт». The privacy rows are translated exactly,
 * promising nothing more or less than the English. The em dash appears only where Ukrainian grammar needs it for a
 * missing link verb («Автомобіль — це один піксель»), with an NBSP before it. The catalog line splits into two
 * sentences so the count changes only its noun («1 об’єкт · 2 об’єкти · 5 об’єктів») and nothing has to agree with it.
 * Licence lines, product, agency and person's names stay as they are; OpenStreetMap's credit takes the form OSM
 * gives for Ukrainian. The Type credit names the Cyrillic faces too, because a uk reader sees Noto, not Instrument.
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('uk')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

/** A count as it is set: grouped («16 893»), a fraction kept (its plural form is `other`). */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))

const about: typeof en = {
  bar: 'Про проєкт',
  close: 'Закрити',
  sectionsLabel: 'Розділи',
  title: [['Як це'], [accent('працює'), '.']] as Rich[],
  lede: 'Обери точку на Землі. Ми обчислюємо, які супутники пролітали над нею за останній тиждень, і шукаємо знімки, які вони зробили. Усе працює у твоєму браузері, на відкритих даних.',

  sections: {
    short: 'Коротко',
    method: 'Як ми шукаємо прольоти',
    words: 'Що означають позначки',
    accuracy: 'Чого ми не бачимо',
    privacy: 'Приватність',
    credits: 'Подяки',
    keys: 'Клавіатура',
  },

  short: {
    live: {
      term: 'Це в реальному часі?',
      text: 'Не зовсім. Знімки потрапляють до архівів за кілька годин або за день-два після зйомки, тож для найсвіжіших прольотів їх може ще не бути.',
    },
    seeMe: {
      term: 'Мене видно?',
      text: 'Ні. Найдрібніший піксель тут\u00a0— 10\u00a0м. Автомобіль\u00a0— це один піксель. Тебе на знімку не видно.',
    },
    every: {
      term: 'Тут усі супутники?',
      text: 'Ні. Військових і розвідувальних супутників здебільшого немає у відкритих каталогах, а компанії не кажуть, куди спрямовують свої камери.',
    },
  },

  method: {
    orbits: [
      'Для кожного об’єкта на орбіті є відкритий набір чисел, що описує його шлях. ',
      link('CelesTrak'),
      ' публікує ці набори за даними спостережень Космічних сил США, а ми беремо свіжу копію кожні шість годин.',
    ] as AboutPart[],
    loaded: (n: number, stamp: string): AboutPart[] => [
      'Ця сторінка завантажила ',
      num(count(n)),
      `\u00a0${f.plural(n, { one: 'об’єкт', few: 'об’єкти', many: 'об’єктів', other: 'об’єкта' })}. Каталог отримано `,
      num(stamp),
      '.',
    ],
    sgp4: 'Рух кожного супутника за останні сім днів ми розраховуємо за допомогою SGP4, стандартної моделі орбіт, і відзначаємо кожен раз, коли він міг бачити твою точку.',
    facts: {
      straightDown: {
        term: 'Прямо вниз',
        text: 'Sentinel-2 та Landsat дивляться прямо вниз на смугу землі: у Sentinel-2 вона завширшки близько 290\u00a0км, у Landsat\u00a0— 185\u00a0км. Ти маєш бути в цій смузі.',
      },
      tilting: {
        term: 'Поворотні камери',
        text: 'Багато комерційних супутників можуть нахилятися на 30–\u206045\u00a0градусів. Якщо твоє місце було в досяжності, ми пишемо «Могли дивитися сюди».',
      },
      daylight: {
        term: 'Денне світло',
        text: 'Звичайним камерам потрібне сонце. Проліт у темряві ніколи не вважається фото.',
      },
      radar: {
        term: 'Радар',
        text: 'Супутнику Sentinel-1 сонце не потрібне. Він випромінює мікрохвилі й записує відлуння, тож бачить крізь хмари й уночі, дивлячись убік від своєї траси. Його знімки теж публікують, тому ми їх показуємо у відтінках сірого: світле\u00a0— це нерівна земля й будівлі, темне\u00a0— спокійна вода.',
      },
      weather: {
        term: 'Метеосупутники',
        text: 'Кілька висять над екватором і кожні 10\u00a0хвилин дивляться на пів планети. Якщо ти на їхньому боці Землі, ти в кожному кадрі.',
      },
    },
    archives:
      'Потім ми шукаємо в архівах знімків (Microsoft Planetary Computer, Element 84 та NASA) і зіставляємо кожен знімок із прольотом, під час якого його знято. Кожен знімок, який ти бачиш, справжній: його обрізано навколо твоєї точки.',
    photoFacts: {
      touchUps: {
        term: 'Обробка',
        text: 'Для твого екрана ми вирівнюємо кольори фото Sentinel-2 та Landsat, згладжуємо зображення й трохи підвищуємо різкість, однаково по всьому знімку. Нічого не додаємо й не прибираємо.',
      },
      whichWayUp: {
        term: 'Де північ',
        text: 'Фото Sentinel-2 та Landsat зберігають власну картографічну сітку архіву для твого місця, тож північ може відхилятися від напрямку вгору на кілька градусів. Коли відкриєш фото, його стрілка N покаже, де саме північ.',
      },
    },
  },

  verdictMore: {
    imaged: 'Якщо ми його показуємо, це справжній знімок.',
    likely: 'Можливо, він ще не вийшов або його відкинули через хмари.',
    could: 'Дізнатися, чи так було насправді, неможливо.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: 'Точні положення',
      text: 'Відкриті дані про орбіти мають точність близько кілометра й щодня трохи втрачають її. Час може відхилятися на кілька секунд.',
    },
    secret: {
      term: 'Секретні супутники',
      text: 'Деякі з найкращих камер на орбіті належать військовим. Тут їх немає.',
    },
    clouds: {
      term: 'Хмари',
      text: 'Чимало фото\u00a0— це лише хмари. Якщо архів дає дані про хмарність, ми перевіряємо піксель саме над твоєю точкою й повідомляємо про це.',
    },
    delays: { term: 'Затримки', text: 'Фото можуть з’явитися через день-два.' },
  },

  privacy: {
    where: { term: 'Де це працює', text: 'Розрахунки орбіт відбуваються у твоєму браузері.' },
    kept: {
      term: 'Що ми зберігаємо',
      text: 'Ми рахуємо пошуки за населеним пунктом і ділянкою близько 10\u00a0км, ніколи не за твоїм точним місцем, і ведемо лік того, що відкривають і чим діляться. Жодних IP-адрес, жодних власних файлів cookie, нічого, що пов’язувало б один візит із наступним.',
    },
    others: {
      term: 'Хто ще це бачить',
      text: 'Більшість назв місць береться зі списку, вбудованого в сайт. Інші пошукові запити йдуть до Open-Meteo, Photon або Nominatim. Знімки завантажуються напряму з архівів. Наш хостинг без файлів cookie рахує перегляди сторінок і вимірює швидкість, а також може встановити один захисний файл cookie, щоб відрізняти людей від ботів. Ми його ніколи не читаємо.',
    },
    links: {
      term: 'Посилання для поширення',
      text: 'Створюються, лише коли ти чимось ділишся. Кожен, у кого є посилання, бачить назву місця, координати з точністю близько 1\u00a0км і вибраний проліт.',
    },
  },

  credits: {
    madeBy: { who: 'Автор', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' в X'] },
    gibs: 'Знімки з NASA GIBS, частини EOSDIS. GOES\u00a0— через NOAA та CIRA, Himawari\u00a0— через JMA.',
    archives: {
      who: 'Архіви',
      text: 'Microsoft Planetary Computer та Element 84 Earth Search; 15-метровий канал Landsat\u00a0— з Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Орбіти', text: 'Набори елементів від CelesTrak. SGP4 з бібліотеки satellite.js.' },
    placeNames: { who: 'Назви місць', text: 'Photon від komoot. Дані карти © учасники OpenStreetMap (ODbL).' },
    textures: { who: 'Текстури Землі', text: 'Solar System Scope (CC BY 4.0), на основі NASA Blue Marble та Black Marble.' },
    type: {
      who: 'Шрифти',
      text: 'Instrument Sans та Serif від Instrument, Martian Mono від Evil Martians, Noto Sans і Noto Serif Display від Google для кирилиці (SIL OFL).',
    },
  },

  keys: {
    search: 'Знайти місце',
    suggestions: 'Перейти між підказками',
    choose: 'Вибрати',
    passes: 'Гортати прольоти',
    photos: 'Попередній / наступний знімок',
    expand: 'Розгорнути знімок',
    zoom: 'Масштабувати (коли розгорнуто)',
    play: 'Відтворити або призупинити повтор',
    back: 'Назад або закрити',
    help: 'Ця сторінка',
  },
  keyNames: { enter: 'Enter', space: 'Пробіл', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['Автор\u00a0— ', link(handle)],
  footerNote: 'Зроблено з відкритих даних. Жодного з цих знімків ми не робили.',
}
export default about
