/**
 * The generated place-name tables (src/i18n/<locale>/exonyms.gen.ts) and the rules that choose their names
 * (scripts/exonyms.ts): the choices pinned on small cases, then the committed tables held to their size budget (owner
 * rule: costs nothing, stays fast) and to the names the languages' guides decide.
 */
import { describe, expect, it } from 'vitest'
import {
  addDisplay,
  addNamesake,
  cleanName,
  displayName,
  latinWorthWriting,
  persianForm,
  pickName,
  RULES,
  serializeDisplay,
  stripAdmin,
  type AltName,
  type DisplayTable,
  type Lang,
} from '../../scripts/exonyms'
import de from '@/i18n/de/exonyms.gen'
import it_ from '@/i18n/it/exonyms.gen'
import uk from '@/i18n/uk/exonyms.gen'
import ru from '@/i18n/ru/exonyms.gen'
import vi from '@/i18n/vi/exonyms.gen'
import fa from '@/i18n/fa/exonyms.gen'
import hi from '@/i18n/hi/exonyms.gen'
import deNs from '@/i18n/de/exonyms'
import itNs from '@/i18n/it/exonyms'
import ukNs from '@/i18n/uk/exonyms'
import ruNs from '@/i18n/ru/exonyms'
import viNs from '@/i18n/vi/exonyms'
import faNs from '@/i18n/fa/exonyms'
import hiNs from '@/i18n/hi/exonyms'
import hiPass from '@/i18n/hi/pass'
import { plain } from '../../api/_lib/i18n/parts'
import { parseExonyms } from './exonyms'
import { placeKey } from './placeKey'

const alt = (name: string, flags = ''): AltName => ({
  name,
  preferred: flags.includes('P'),
  short: flags.includes('S'),
  colloquial: flags.includes('C'),
  historic: flags.includes('H'),
})

describe('choosing a name', () => {
  it('takes the preferred name, else the first plain one, else a short one; never a historic or colloquial one', () => {
    const any = () => true
    expect(pickName([alt('Muenchen'), alt('München', 'P')], any)).toBe('München')
    expect(pickName([alt('СПб', 'S'), alt('Ленинград', 'H'), alt('Питер', 'C'), alt('Санкт-Петербург')], any)).toBe('Санкт-Петербург')
    expect(pickName([alt('TPHCM', 'S')], any)).toBe('TPHCM')
    expect(pickName([alt('Sài Gòn', 'H')], any)).toBeUndefined()
    // A first-level region in a Latin table: its short name is its usual one.
    expect(pickName([alt('Kanton Tessin', 'P'), alt('Tessin', 'S')], any, undefined, true)).toBe('Tessin')
  })

  it('writes each language in its own script and forms', () => {
    expect(displayName([alt('Moskva'), alt('Москва', 'P')], 'ru')).toBe('Москва')
    expect(displayName([alt('Bakhmut'), alt('Бахмут', 'P')], 'uk')).toBe('Бахмут')
    expect(displayName([alt("Кам'янське")], 'uk')).toBe('Кам’янське') // the apostrophe the faces draw
    expect(displayName([alt('Свердловская Область')], 'ru', { region: true })).toBe('Свердловская область')
    expect(displayName([alt('Свердловск'), alt('Екатеринбург')], 'ru')).toBe('Екатеринбург') // never the Soviet name
    expect(displayName([alt('बम्बई'), alt('मुंबई')], 'hi')).toBe('मुंबई')
    expect(displayName([alt('Paris')], 'hi')).toBeUndefined()
  })

  it('writes Persian letters, prefers a plain spelling and the town over its province', () => {
    expect(persianForm('كاشان')).toBe('کاشان')
    expect(persianForm('تِهران')).toBe('تهران')
    expect(displayName([alt('استان کرمانشاه'), alt('کرمانشاه')], 'fa')).toBe('کرمانشاه')
    expect(displayName([alt('سِنَّ'), alt('سنندج')], 'fa')).toBe('سنندج') // not سن, the vowel marks stripped
    expect(displayName([alt('استان تهران')], 'fa', { region: true })).toBe('تهران')
    expect(cleanName('يزد', 'fa')).toBe('یزد')
  })

  it('drops a Vietnamese class noun, and abroad takes only a Vietnamese name', () => {
    expect(displayName([alt('Thành Phố Nam Định')], 'vi', { home: true })).toBe('Nam Định')
    expect(displayName([alt('Luân Đôn')], 'vi')).toBe('Luân Đôn')
    expect(displayName([alt('Moskva')], 'vi')).toBeUndefined()
    expect(displayName([alt('GJien Bien')], 'de', { cc: 'VN' })).toBeUndefined()
  })

  it('in a Latin table, writes a name only where it is the language’s own', () => {
    expect(latinWorthWriting('Munich', 'München', false)).toBe(true)
    expect(latinWorthWriting('Biên Hòa', 'Bien Hoa', false)).toBe(false) // accents dropped
    expect(latinWorthWriting('Osaka', 'Ōsaka', false)).toBe(false) // accents added abroad
    expect(latinWorthWriting('Da Nang', 'Đà Nẵng', true)).toBe(true) // and at home
    expect(latinWorthWriting('Kanagawa', 'Präfektur Kanagawa', false)).toBe(false)
    expect(latinWorthWriting('New York', 'New York City', false)).toBe(false)
    expect(latinWorthWriting('Nghệ An Province', 'Nghệ An', true)).toBe(true) // an English class word dropped
    expect(latinWorthWriting('Sankt Augustin', 'St. Augustin', true)).toBe(false)
    // A feature's English class word dropped is the language's name too (Rügen for Rügen Island), not a town's.
    expect([latinWorthWriting('Rügen Island', 'Rügen', true, true), latinWorthWriting('Rügen Island', 'Rügen', true)]).toEqual([true, false])
    // An Italian name for a place abroad is never a scholarly transliteration.
    expect(displayName([alt('Čerkasy')], 'it')).toBeUndefined()
    expect(displayName([alt('Leopoli')], 'it')).toBe('Leopoli')
    expect(displayName([alt('Città del Messico')], 'it')).toBe('Città del Messico')
    expect(displayName([alt('Provincia di Teheran')], 'it', { region: true })).toBe('Teheran')
  })

  it('writes a region’s own label apart from its where-line name, and a Vietnamese one as a Vietnamese map labels it', () => {
    const t: DisplayTable = new Map()
    addDisplay(t, { english: ['Qom Province'], cc: 'IR', region: true, pop: 2 }, 'قم')
    addDisplay(t, { english: ['Qom Province'], cc: 'IR', region: false, pop: 2 }, RULES.fa.regionLabel!({ shown: 'قم', cc: 'IR', english: ['Qom Province'], alts: [] })!, { forced: true, label: true })
    expect(serializeDisplay(t, false)).toBe('IR:*Qom Province=قم;#Qom Province=استان قم')
    const vi = (shown: string, cc: string, english: string[]) => RULES.vi.regionLabel!({ shown, cc, english, alts: [] })
    expect([vi('Thanh Hóa', 'VN', ['Thanh Hóa Province']), vi('Hải Phòng', 'VN', ['Hai Phong']), vi('Thượng Hải', 'CN', ['Shanghai', 'Shanghai Municipality'])]).toEqual([
      'Tỉnh Thanh Hóa',
      'Thành phố Hải Phòng',
      'Thành phố Thượng Hải',
    ])
  })

  it('names a Vietnamese province and city under the geocoders’ spellings of it too', () => {
    const forms = RULES.vi.regionForms!
    expect(forms({ shown: 'Khánh Hòa', english: ['Khanh Hoa'] })).toEqual([
      'Khanh Hoa',
      'Khanh Hoa City',
      'Khanh Hoa Province',
      'Tỉnh Khánh Hòa',
    ])
    expect(forms({ shown: 'Huế', english: ['Thừa Thiên Huế Province'] })).toEqual([
      'Thừa Thiên Huế',
      'Hue',
      'Hue City',
      'Thành phố Huế',
    ])
    expect(forms({ shown: 'Thành phố Hồ Chí Minh', english: ['Ho Chi Minh City (HCMC)'] })).toEqual([
      'Ho Chi Minh City (HCMC)',
      'Ho Chi Minh',
      'Ho Chi Minh City',
      'Thành phố Hồ Chí Minh',
    ])
    expect(forms({ shown: 'Đắk Lắk', english: ['Dak Lak'] })).toContain('Dak Lak Province')
  })

  it('cleans each language’s forms (native review, 2026-11-22)', () => {
    // Persian: the town of GeoNames' "City، Region", no direction marks, half-spaces where the parts join.
    expect(cleanName('فیلادلفیا، پنسیلوانیا', 'fa')).toBe('فیلادلفیا')
    expect(cleanName('پوئبلا٬ پوئبلا', 'fa')).toBe('پوئبلا')
    expect(cleanName('گیلان\u200e', 'fa')).toBe('گیلان')
    expect(cleanName('خرم آباد', 'fa')).toBe('خرم\u200cآباد')
    expect(cleanName('نظر آباد', 'fa')).toBe('نظرآباد') // ر never joins: one word
    expect(cleanName('ناحیه های تابع جمهوری', 'fa')).toBe('ناحیه\u200cهای تابع جمهوری')
    expect(cleanName('خانآباد', 'fa')).toBe('خان\u200cآباد')
    expect(cleanName('فرودگاه بین المللی بندرعباس', 'fa')).toBe('فرودگاه بین\u200cالمللی بندرعباس')
    expect(displayName([alt('پاروں')], 'fa')).toBeUndefined() // an Urdu letter
    // Hindi: the anusvara for a nasal before its own class, no nukta on क ख ग (ज़ and फ़ keep theirs).
    expect(cleanName('इन्दौर', 'hi')).toBe('इंदौर')
    expect(cleanName('लद्दाख़', 'hi')).toBe('लद्दाख')
    expect(cleanName('ज़्यूरिख़', 'hi')).toBe('ज़्यूरिख')
    expect(cleanName('दिल्ली', 'hi')).toBe('दिल्ली')
    // Cyrillic class words in lower case, and no qualifier; Italian's apostrophe; Vietnamese Đ.
    expect(cleanName('Тихий Океан', 'ru')).toBe('Тихий океан')
    expect(cleanName('Ла-Манш (пролив)', 'ru')).toBe('Ла-Манш')
    expect(cleanName("Francoforte sull'Oder", 'it')).toBe('Francoforte sull’Oder')
    expect(cleanName('Ðà Lạt', 'vi')).toBe('Đà Lạt')
    // Ukrainian г abroad, ґ at home; an Italian region without its article.
    expect(displayName([alt('Гамбурґ')], 'uk')).toBe('Гамбург')
    expect(displayName([alt('Ґорґани')], 'uk', { home: true })).toBe('Ґорґани')
    expect(displayName([alt('La Piccola Polonia')], 'it', { region: true })).toBe('Piccola Polonia')
    expect(displayName([alt('La Spezia')], 'it', { home: true })).toBe('La Spezia')
  })

  it('takes a language’s own name, not a transliteration, and a region’s full name where its short one is a town’s', () => {
    expect(displayName([alt('Jerevan')], 'it', { cc: 'AM' })).toBeUndefined()
    expect(displayName([alt('Qostanay')], 'it', { cc: 'KZ' })).toBeUndefined()
    expect(displayName([alt('Lago d’Aral')], 'it', { cc: 'KZ' })).toBe('Lago d’Aral')
    expect(displayName([alt('Erevan')], 'it', { cc: 'AM' })).toBe('Erevan')
    // Sino-Vietnamese names need no Vietnamese letter in China; a tone mark over a plain vowel counts as one.
    expect(displayName([alt('Nam Ninh')], 'vi', { cc: 'CN', english: ['Nanning'] })).toBe('Nam Ninh')
    expect(displayName([alt('Nanning')], 'vi', { cc: 'CN', english: ['Nanning'] })).toBeUndefined()
    expect(displayName([alt('Nam Ninh')], 'vi', { cc: 'RU' })).toBeUndefined()
    expect(displayName([alt('Vũ Hán')], 'vi', { cc: 'CN' })).toBe('Vũ Hán')
    const town = (n: string) => n === 'Krasnodar'
    expect(displayName([alt('Region Krasnodar', 'P'), alt('Krasnodar', 'S')], 'de', { region: true, avoid: town })).toBe('Region Krasnodar')
    expect(displayName([alt('Region Krasnodar', 'P'), alt('Krasnodar', 'S')], 'de', { region: true })).toBe('Krasnodar')
    expect(stripAdmin('Thị Trấn Đông Triều', 'vi')).toBe('Đông Triều')
    expect(stripAdmin('Quận Mười', 'vi')).toBe('Quận Mười') // a number is no name: Quận 10 is fixed by hand
    // Italian's longer articles first: the region is Piccola Polonia, not la Piccola Polonia.
    expect(displayName([alt('voivodato della Piccola Polonia')], 'it', { region: true, cc: 'PL' })).toBe('Piccola Polonia')
    expect(stripAdmin('Regione della Mecca', 'it')).toBe('Mecca')
  })
})

describe('building a table', () => {
  it('names a key only if every place under it in the country shares the name', () => {
    const t: DisplayTable = new Map()
    addDisplay(t, { english: ['Kyiv', 'Kiev'], cc: 'UA', region: false, pop: 2_900_000 }, 'Київ')
    addDisplay(t, { english: ['Kyiv City'], cc: 'UA', region: true, pop: 2_900_000 }, 'місто Київ')
    addDisplay(t, { english: ['Troitsk'], cc: 'RU', region: false, pop: 60_000 }, 'Троицк')
    addDisplay(t, { english: ['Troitsk'], cc: 'RU', region: false, pop: 70_000 }, 'Троицк')
    addDisplay(t, { english: ['Novyi'], cc: 'UA', region: false, pop: 20_000 }, 'Новий')
    addDisplay(t, { english: ['Novyi'], cc: 'UA', region: false, pop: 30_000 }, 'Нове')
    // A namesake too small for the table: a hamlet never takes a city's name away; a town its size does.
    addDisplay(t, { english: ['Hanoi'], cc: 'VN', region: false, pop: 8_000_000 }, 'Hà Nội')
    addNamesake(t, { english: ['Hanoi'], cc: 'VN', region: false, pop: 0 }, 'Lâm')
    addDisplay(t, { english: ['Oleksandriia'], cc: 'UA', region: false, pop: 80_000 }, 'Олександрія')
    addNamesake(t, { english: ['Oleksandriia'], cc: 'UA', region: false, pop: 50_000 }, 'Александрия')
    expect(serializeDisplay(t, false, [{ cc: 'UA', english: 'Kyiv', alias: 'Київ-місто' }])).toBe(
      'VN:Hanoi=Hà Nội|UA:Kyiv=Київ;Kiev=Київ;*Kyiv City=місто Київ;~Kyiv=Київ-місто|RU:Troitsk=Троицк',
    )
    // The largest country first, each country's names largest first; a key two names claim is left out (Novyi).
    expect(serializeDisplay(t, true)).toMatch(/^VN:Hanoi=Hà Nội\|/)
  })

  it('writes a name fixed by hand as it is, a landmark a town shares for landmarks only, and Sino-Vietnamese namesakes apart', () => {
    const t: DisplayTable = new Map()
    // Not "worth writing" by latinWorthWriting (Thừa Thiên is no English class word), but fixed by hand.
    addDisplay(t, { english: ['Thừa Thiên Huế Province'], cc: 'VN', region: true, pop: 1 }, 'Huế', { forced: true })
    addDisplay(t, { english: ['White House'], cc: 'US', region: false, pop: 1 }, 'Nhà Trắng', { landmark: true })
    addDisplay(t, { english: ['Suzhou'], cc: 'CN', region: false, pop: 6_000_000 }, 'Tô Châu')
    addNamesake(t, { english: ['Suzhou'], cc: 'CN', region: false, pop: 1_600_000 }, undefined, { ownNames: true })
    expect(serializeDisplay(t, true)).toBe('US:^White House=Nhà Trắng|VN:*Thừa Thiên Huế Province=Huế')
  })
})

/** The committed tables, compressed as a browser fetches them (gzip). */
const TABLES = { de, it: it_, uk, ru, vi, fa, hi }
const NAMESPACES = { de: deNs, it: itNs, uk: ukNs, ru: ruNs, vi: viNs, fa: faNs, hi: hiNs }
const gzip = async (s: string) => (await new Response(new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()).byteLength

describe('the generated tables', () => {
  it('stay within their budget: a chunk of its own up to 20 KiB compressed, one in the language’s chunk up to 5 KiB', async () => {
    for (const [lang, src] of Object.entries(TABLES)) {
      const size = await gzip(src)
      const lazy = !!NAMESPACES[lang as keyof typeof NAMESPACES].load
      expect({ lang, fits: size <= (lazy ? 20 * 1024 : 5 * 1024) }).toEqual({ lang, fits: true })
    }
  })

  it('know each language’s own countries as the rules do', () => {
    for (const [lang, ns] of Object.entries(NAMESPACES)) expect([lang, ns.home]).toEqual([lang, RULES[lang as Lang].home.filter((h) => !h.includes('.'))])
  })

  it('parse whole, with no reserved character inside a name', () => {
    for (const src of Object.values(TABLES)) {
      const t = parseExonyms(src)
      expect(t.towns.size + t.regions.size).toBeGreaterThan(200)
      for (const group of src.split('|')) for (const entry of group.slice(group.indexOf(':') + 1).split(';')) expect(entry.split('=')).toHaveLength(2)
    }
  })

  it('name the places each language’s guide decides', () => {
    const name = (src: string, cc: string, english: string, region = false) => parseExonyms(src)[region ? 'regions' : 'towns'].get(`${cc}|${english.toLowerCase()}`)
    expect([name(de, 'DE', 'munich'), name(de, 'IT', 'milan'), name(de, 'RU', 'moscow'), name(de, 'UA', 'kyiv')]).toEqual(['München', 'Mailand', 'Moskau', 'Kyjiw'])
    expect([name(it_, 'DE', 'munich'), name(it_, 'GB', 'london'), name(it_, 'RU', 'moscow'), name(it_, 'CN', 'beijing')]).toEqual([
      'Monaco di Baviera',
      'Londra',
      'Mosca',
      'Pechino',
    ])
    expect([name(uk, 'UA', 'kyiv'), name(uk, 'UA', 'kharkiv'), name(uk, 'UA', 'lviv'), name(uk, 'RU', 'moscow'), name(uk, 'UA', 'crimea', true)]).toEqual([
      'Київ',
      'Харків',
      'Львів',
      'Москва',
      'Автономна Республіка Крим',
    ])
    expect([name(ru, 'UA', 'kyiv'), name(ru, 'UA', 'kharkiv'), name(ru, 'UA', 'odesa'), name(ru, 'UA', 'dnipro'), name(ru, 'UA', 'crimea', true)]).toEqual([
      'Киев',
      'Харьков',
      'Одесса',
      'Днепр',
      'Крым',
    ])
    // Never a Soviet-era, colonial or colloquial name on screen (Sài Gòn is a search name only).
    const shown = new Set(Object.values(TABLES).flatMap((src) => [...parseExonyms(src).towns.values(), ...parseExonyms(src).regions.values()]))
    for (const never of ['Ленинград', 'Свердловск', 'Днепропетровск', 'Дніпропетровськ', 'Кіровоград', 'बम्बई', 'बंगलौर', 'Sài Gòn']) expect(shown).not.toContain(never)
    expect([name(vi, 'VN', 'hanoi'), name(vi, 'VN', 'ho chi minh city'), name(vi, 'VN', 'da nang'), name(vi, '', 'south china sea')]).toEqual([
      'Hà Nội',
      'Thành phố Hồ Chí Minh',
      'Đà Nẵng',
      'Biển Đông',
    ])
    expect(vi).toContain('~Ho Chi Minh City=Sài Gòn') // a search name, never shown
    expect([name(fa, 'IR', 'tehran'), name(fa, 'IR', 'isfahan'), name(fa, 'RU', 'moscow'), name(fa, '', 'persian gulf')]).toEqual(['تهران', 'اصفهان', 'مسکو', 'خلیج فارس'])
    expect(fa).not.toMatch(/[يك]/) // Persian letters, not Arabic ones
    expect([name(hi, 'IN', 'new delhi'), name(hi, 'IN', 'mumbai'), name(hi, 'IN', 'kolkata'), name(hi, 'IN', 'bengaluru'), name(hi, 'IN', 'uttar pradesh', true)]).toEqual([
      'नई दिल्ली',
      'मुंबई',
      'कोलकाता',
      'बेंगलुरु',
      'उत्तर प्रदेश',
    ])
    // What the native review (2026-11-22) found wrong, as the guides decide it.
    expect([name(de, 'UA', 'kherson'), name(de, 'UA', 'zaporizhzhya'), name(de, 'CN', 'beijing'), name(de, 'PS', 'west bank', true), name(de, '', 'yellow sea')]).toEqual([
      'Cherson',
      'Saporischschja',
      'Peking',
      'Westjordanland',
      'Gelbes Meer',
    ])
    expect([name(it_, '', 'persian gulf'), name(it_, 'ES', 'valencia', true), name(it_, 'ES', 'cadiz'), name(it_, 'US', 'district of columbia', true)]).toEqual([
      'Golfo Persico',
      'Comunità Valenciana',
      'Cadice',
      'Distretto di Columbia',
    ])
    expect([name(uk, 'UA', 'bunhe'), name(uk, 'IN', 'delhi'), name(uk, 'US', 'golden gate bridge'), name(uk, 'MD', 'chisinau')]).toEqual(['Бунге', 'Делі', 'Міст Золоті Ворота', 'Кишинів'])
    expect([name(ru, 'RU', 'murmansk'), name(ru, 'UA', 'kherson'), name(ru, 'RU', 'chelyabinsk', true), name(ru, '', 'pacific ocean')]).toEqual([
      'Мурманск',
      'Херсон',
      'Челябинская область',
      'Тихий океан',
    ])
    expect([name(vi, '', 'xisha islands paracel islands'), name(vi, 'VN', 'thua thien hue province', true), name(vi, 'UA', 'kyiv')]).toEqual(['Quần đảo Hoàng Sa', 'Huế', undefined])
    expect([name(fa, 'UA', 'lviv'), name(fa, 'IR', 'gilan province', true), name(fa, 'IR', 'qods')]).toEqual(['لویو', 'گیلان', 'شهر قدس'])
    expect([name(hi, 'CH', 'bern'), name(hi, '', 'atlantic ocean')]).toEqual(['बर्न', 'अटलांटिक महासागर'])
    // And what a second pass over it found (a class noun cut with its article, a bare oblast in a where line, the
    // city's own region, Iran's provinces as OpenStreetMap writes them, a district, a key two cities share).
    expect([name(it_, 'PL', 'lesser poland', true), name(de, 'UA', 'luhansk', true), name(ru, 'RU', 'moscow', true), name(fa, 'IR', 'gilan', true)]).toEqual([
      'Piccola Polonia',
      'Oblast Luhansk',
      'Москва',
      'گیلان',
    ])
    expect([name(uk, 'UA', 'obolon'), name(vi, 'CN', 'taishan'), name(hi, 'GB', 'wales', true), name(de, '', 'bay of biscay')]).toEqual([
      'Оболонь',
      undefined,
      'वेल्स',
      'Golf von Biskaya',
    ])
    // A landmark a town shares is a landmark's name only.
    expect(vi).toMatch(/\|US:[^|]*;\^White House=Nhà Trắng[;|]/)
  })

  it('name the time-lapse’s war zones as each guide does, Crimea under each geocoder’s name (pre-ship review)', () => {
    // As a where line or a label shows it: the table's name, else the data's.
    const shown = (src: string, cc: string, english: string, region = false) =>
      parseExonyms(src)[region ? 'regions' : 'towns'].get(`${cc}|${placeKey(english)}`) ?? english
    const zones = (src: string) => [
      shown(src, 'PS', 'Gaza'),
      shown(src, 'PS', 'Gaza Strip', true),
      shown(src, 'PS', 'West Bank', true),
    ]
    const crimea = (src: string) =>
      ['Crimea', 'Autonomous Republic of Crimea', 'Republic of Crimea'].map((e) => shown(src, 'UA', e, true))
    expect([zones(hi), crimea(hi)]).toEqual([
      ['गाज़ा', 'गाज़ा पट्टी', 'वेस्ट बैंक'],
      ['क्रीमिया', 'क्रीमिया', 'क्रीमिया'],
    ])
    expect([zones(vi), crimea(vi)]).toEqual([
      ['Gaza', 'Dải Gaza', 'Bờ Tây'],
      ['Crimea', 'Crimea', 'Crimea'],
    ])
    expect([zones(de), zones(it_), zones(uk), zones(ru), zones(fa)]).toEqual([
      ['Gaza', 'Gazastreifen', 'Westjordanland'],
      ['Gaza', 'Striscia di Gaza', 'Cisgiordania'],
      ['Газа', 'Сектор Гази', 'Західний берег'],
      ['Газа', 'Сектор Газа', 'Западный берег реки Иордан'],
      ['غزه', 'نوار غزه', 'کرانه باختری'],
    ])
    for (const [src, krim] of [
      [de, 'Krim'],
      [it_, 'Crimea'],
      [uk, 'Автономна Республіка Крим'],
      [ru, 'Крым'],
      [fa, 'کریمه'],
    ])
      expect(crimea(src)).toEqual([krim, krim, krim])
    // BBC Hindi's Gaza and GeoNames' West Bank find them, and are never shown.
    expect([hi.includes('~Gaza=गज़ा'), hi.includes('~*West Bank=पश्चिमी तट')]).toEqual([true, true])
  })

  it('never puts the Hindi swath beside the place’s name, which may be the Gaza Strip, गाज़ा पट्टी (hi.md §8)', () => {
    const gaza = parseExonyms(hi).regions.get(`PS|${placeKey('Gaza Strip')}`) ?? ''
    expect(gaza).toContain('पट्टी')
    // Every pass sentence that is given the place, as the pass paragraph would say it for a Gaza Strip search.
    const o = { place: gaza, sat: 'Flock 4', sensor: 'VIIRS', swathKm: 32, deg: 12.5, gsdM: 3, dark: false }
    const at = { ...o, openArchive: false, time: '10:52', zone: 'IST', heading: 'n' as const }
    const said = [
      hiPass.could.insideSwath(at),
      hiPass.could.radar(at),
      hiPass.could.camera(at),
      hiPass.mosaic(at),
      hiPass.radarImaged(at),
      hiPass.geo.reached(at),
    ]
    const twice = said.flatMap((r) => plain(r).split('।')).filter((s) => s.split('पट्टी').length > 2)
    expect(twice).toEqual([])
  })

  it('name Vietnam’s provinces under the geocoders’ spellings, so a where line says a city once (pre-ship)', () => {
    const t = parseExonyms(vi)
    const region = (english: string) => t.regions.get(`VN|${placeKey(english)}`)
    // Photon's and Nominatim's states and cities (2026-11-22).
    const states = ['Khanh Hoa province', 'Phu Tho province', 'Lâm Đồng Province', 'Bac Ninh City', 'Quang Ninh City']
    expect(states.map(region)).toEqual([
      'Khánh Hòa',
      'Phú Thọ',
      'Lâm Đồng',
      'Bắc Ninh',
      'Quảng Ninh',
    ])
    expect(['Quang Ninh', 'Thành phố Hà Nội', 'Ha Noi', 'Hồ Chí Minh', 'Thừa Thiên - Huế'].map(region)).toEqual([
      'Quảng Ninh',
      'Hà Nội',
      'Hà Nội',
      'Thành phố Hồ Chí Minh',
      'Huế',
    ])
    // The city's row and its region's read alike, so a where line says it once (Hà Nội, Việt Nam).
    expect(t.towns.get('VN|hanoi')).toBe(region('Thành phố Hà Nội'))
    // A region's own label is unchanged: a province's is Tỉnh, a city's Thành phố.
    expect([t.labels.get('VN|khanh hoa'), t.labels.get('VN|hanoi')]).toEqual(['Tỉnh Khánh Hòa', 'Thành phố Hà Nội'])
  })

  it('write Persian as fa.md §6.1 does: the ezafe’s hamza on a final ه only, one ئ, its letters, half-spaces', () => {
    const t = parseExonyms(fa)
    const names = [t.towns, t.regions, t.features, t.labels].flatMap((m) => [...m.values()])
    const malformed = /[^ه]\u0654|\u0654(?![\s\u200c]|$)|ئئ|[يكىة]|\p{Script=Latin}|بین الملل/u
    expect(names.filter((n) => malformed.test(n))).toEqual([])
    // The Afghan airports GeoNames names میدانٔ هوائئ کندهار and میدانٔ هوائیٔ کابل (pre-ship review, 2026-11-22).
    expect([t.towns.get('AF|kandahar airport'), t.towns.get('AF|hamid karzai international airport')]).toEqual([
      'فرودگاه قندهار',
      'فرودگاه بین\u200cالمللی کابل',
    ])
  })
})
