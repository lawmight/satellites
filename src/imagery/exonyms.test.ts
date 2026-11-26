import { afterEach, describe, expect, it, vi } from 'vitest'
import { tableChunk } from '@/i18n/optionalChunks'
import { setBundleForTests } from '@/i18n/runtime'
import enGeo from '@/i18n/en/geo'
import koExonyms from '@/i18n/ko/exonyms'
import { ensureExonyms, EXONYM_WAIT_MS, exonym, exonymsReady, parseExonyms, prefetchExonyms } from './exonyms'
import { displayLabel, displaySublabel } from './geocode'

/** A small German table, in the generated tables' format. */
const DE = 'DE:Munich=München;Cologne=Köln;*Bavaria=Bayern;*North Rhine-Westphalia=Nordrhein-Westfalen|IT:Milan=Mailand;*Lombardy=Lombardei|GB:London=London'
const UK = 'UA:Kyiv=Київ;Lviv=Львів;*Lviv=Львівська область;*Kyiv City=місто Київ;*Kherson=Херсонська область|PL:Warsaw=Варшава'

describe('exonyms', () => {
  afterEach(() => setBundleForTests('en', null))

  it('parses the table by country, towns apart from regions, keyed as typed', () => {
    const t = parseExonyms(`${DE}|:Sea of Japan=동해|junk|XX:noequals;=nothing;empty=`)
    expect(t.towns.get('DE|munich')).toBe('München')
    expect(t.towns.get('IT|milan')).toBe('Mailand')
    expect(t.regions.get('DE|bavaria')).toBe('Bayern')
    expect(t.regions.get('DE|north rhine westphalia')).toBe('Nordrhein-Westfalen')
    expect(t.towns.get('|sea of japan')).toBe('동해')
    expect(t.towns.size + t.regions.size).toBe(8)
  })

  it('gives a region its own label where the table writes one, and its plain name in a where line', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}، ${country}`)
    setBundleForTests('fa', { exonyms: { names: 'IR:Qom=قم;*Qom Province=قم;#Qom Province=استان قم' }, geo: { ...enGeo, where } })
    expect(displayLabel({ label: 'Qom Province', countryCode: 'ir', kind: 'region' })).toBe('استان قم')
    expect(displayLabel({ label: 'Qom', countryCode: 'ir' })).toBe('قم')
    expect(displaySublabel({ label: 'Kahak', sublabel: 'Qom Province, Iran', countryCode: 'ir' })).toBe('قم، ایران')
    expect(parseExonyms('IR:#Qom Province=استان قم').labels.get('IR|qom province')).toBe('استان قم')
  })

  it('keeps a search-only name off the screen', () => {
    const t = parseExonyms('VN:Ho Chi Minh City=Thành phố Hồ Chí Minh;~Ho Chi Minh City=Sài Gòn')
    expect([...t.towns]).toEqual([['VN|ho chi minh city', 'Thành phố Hồ Chí Minh']])
  })

  it('waits for a table that is a chunk of its own, and never changes a name once it is shown', async () => {
    const lazy = () => {
      const ns: { names: string; load: () => Promise<void> } = { names: '', load: async () => void (ns.names = 'RU:Moscow=Москва') }
      return ns
    }
    setBundleForTests('ru', { exonyms: lazy() })
    expect(exonymsReady()).toBe(false)
    await ensureExonyms()
    expect([exonymsReady(), exonym('Moscow', 'ru', 'label')]).toEqual([true, 'Москва'])
    // Shown before its table was in: the page keeps the name it showed, even once the table could load.
    setBundleForTests('ru', { exonyms: lazy() })
    expect(exonym('Moscow', 'ru', 'label')).toBe('Moscow')
    await ensureExonyms()
    expect(exonym('Moscow', 'ru', 'label')).toBe('Moscow')
  })

  it('waits for a table that never arrives no longer than EXONYM_WAIT_MS, and then keeps the names as they came', async () => {
    vi.useFakeTimers()
    try {
      let arrive: (() => void) | undefined
      const ns: { names: string; load: () => Promise<void> } = {
        names: '',
        load: () => new Promise<void>((done) => (arrive = () => ((ns.names = 'RU:Moscow=Москва'), done()))),
      }
      setBundleForTests('ru', { exonyms: ns })
      let waited = false
      void ensureExonyms().then(() => (waited = true))
      await vi.advanceTimersByTimeAsync(EXONYM_WAIT_MS - 100)
      expect(waited).toBe(false)
      await vi.advanceTimersByTimeAsync(200)
      expect(waited).toBe(true)
      expect(exonym('Moscow', 'ru', 'label')).toBe('Moscow')
      arrive?.()
      await vi.advanceTimersByTimeAsync(0)
      expect(exonym('Moscow', 'ru', 'label')).toBe('Moscow')
    } finally {
      vi.useRealTimers()
    }
  })

  it('waits for a stalled table once: later calls never wait for it again, and use it once it arrives', async () => {
    vi.useFakeTimers()
    try {
      let arrive: (() => void) | undefined
      const ns: { names: string; load: () => Promise<void> } = { names: '', load: () => table }
      const table = new Promise<void>((done) => (arrive = () => ((ns.names = 'RU:Moscow=Москва'), done())))
      setBundleForTests('ru', { exonyms: ns })
      let waits = 0
      const call = () => void ensureExonyms().then(() => waits++)
      call()
      await vi.advanceTimersByTimeAsync(EXONYM_WAIT_MS + 100)
      expect(waits).toBe(1)
      call()
      await vi.advanceTimersByTimeAsync(0)
      expect(waits).toBe(2) // a search typed after it: no second wait
      arrive?.()
      call()
      await vi.advanceTimersByTimeAsync(0)
      expect([waits, exonymsReady(), exonym('Moscow', 'ru', 'label')]).toEqual([3, true, 'Москва'])
    } finally {
      vi.useRealTimers()
    }
  })

  it('lets the first search wait for a table a prefetch ran out on: only a held wait marks it overdue', async () => {
    vi.useFakeTimers()
    try {
      let arrive: (() => void) | undefined
      const ns: { names: string; load: () => Promise<void> } = { names: '', load: () => table }
      const table = new Promise<void>((done) => (arrive = () => ((ns.names = 'RU:Moscow=Москва'), done())))
      setBundleForTests('ru', { exonyms: ns })
      let prefetched = false
      void prefetchExonyms().then(() => (prefetched = true)) // the landing, at idle
      await vi.advanceTimersByTimeAsync(EXONYM_WAIT_MS + 600)
      expect(prefetched).toBe(true) // resolves within EXONYM_WAIT_MS all the same
      let searched = false
      void ensureExonyms().then(() => (searched = true)) // the first search, the table a moment away
      await vi.advanceTimersByTimeAsync(900)
      expect(searched).toBe(false)
      arrive?.()
      await vi.advanceTimersByTimeAsync(0)
      expect([searched, exonym('Moscow', 'ru', 'label')]).toEqual([true, 'Москва'])
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps a failed table download from reloading the page while it runs, Safari included', async () => {
    const shared = globalThis as { [k: symbol]: Set<string> | undefined }
    const quiet = () => [...(shared[Symbol.for('watched.quietChunks')] ?? [])]
    let fail: ((err: Error) => void) | undefined
    const ns = tableChunk({ names: '' }, () => new Promise<{ default: string }>((_, no) => (fail = no)))
    setBundleForTests('ru', { exonyms: ns })
    const done = ensureExonyms()
    expect(quiet()).toContain('exonyms.gen-')
    fail?.(new TypeError('Importing a module script failed.'))
    await done
    expect(quiet()).not.toContain('exonyms.gen-')
    expect(quiet()).not.toContain('exonymSearch-') // in long since
  })

  it('names nothing in English, or in a language without a table', () => {
    expect(exonym('Munich', 'de', 'label')).toBe('Munich')
    setBundleForTests('fr', {})
    expect(exonym('Munich', 'de', 'label')).toBe('Munich')
  })

  it("looks a name up in the place's own country only", () => {
    setBundleForTests('de', { exonyms: { names: DE } })
    expect(exonym('Munich', 'de', 'label')).toBe('München')
    expect(exonym('MUNICH', 'DE', 'label')).toBe('München')
    expect(exonym('Munich', 'us', 'label')).toBe('Munich') // Munich, North Dakota
    expect(exonym('Munich', undefined, 'label')).toBe('Munich') // a link carries no country
    expect(exonym('Milan', 'it', 'label')).toBe('Mailand')
    expect(exonym('Milan', 'us', 'label')).toBe('Milan')
  })

  it('names a town as a town, a region as a region, and a part of the where line among regions first', () => {
    setBundleForTests('uk', { exonyms: { names: UK } })
    expect(exonym('Lviv', 'ua', 'label')).toBe('Львів')
    expect(exonym('Lviv', 'ua', 'region')).toBe('Львівська область')
    expect(exonym('Lviv', 'ua', 'where')).toBe('Львівська область')
    expect(exonym('Kyiv City', 'ua', 'region')).toBe('місто Київ')
    // A town the table has no name for never takes its region's (Kherson the city is not Херсонська область), nor a
    // region its capital's.
    expect(exonym('Kherson', 'ua', 'label')).toBe('Kherson')
    expect(exonym('Warsaw', 'pl', 'region')).toBe('Warsaw')
    expect(exonym('Kyiv City', 'ua', 'label')).toBe('Kyiv City')
    expect(displayLabel({ label: 'Kherson', countryCode: 'ua', kind: 'region' })).toBe('Херсонська область')
    expect(displayLabel({ label: 'Kherson', countryCode: 'ua' })).toBe('Kherson')
  })

  it('names a landmark by a name written for landmarks, which a town of that name never takes', () => {
    setBundleForTests('vi', { exonyms: { names: 'US:^White House=Nhà Trắng;Central Park=Công viên Trung tâm|:Woody Island=Đảo Phú Lâm' } })
    expect(displayLabel({ label: 'White House', countryCode: 'us', kind: 'feature' })).toBe('Nhà Trắng')
    expect(displayLabel({ label: 'White House', countryCode: 'us' })).toBe('White House') // the town in Tennessee
    expect(displayLabel({ label: 'Central Park', countryCode: 'us', kind: 'feature' })).toBe('Công viên Trung tâm')
    // A countryless name is a countryless place's: Woody Island in Australia keeps its name.
    expect(displayLabel({ label: 'Woody Island' })).toBe('Đảo Phú Lâm')
    expect(displayLabel({ label: 'Woody Island', countryCode: 'au', kind: 'feature' })).toBe('Woody Island')
  })

  it('shows Korean readers 동해, 독도, 백두산 and 황해 where the data names them otherwise, and nothing else', () => {
    setBundleForTests('ko', { exonyms: koExonyms })
    const shown = (label: string, countryCode?: string) => displayLabel({ label, countryCode })
    // As the offline list and Photon spell them, with the country they give.
    expect([shown('Sea of Japan'), shown('Yellow Sea'), shown('Liancourt Rocks', 'kr'), shown('Dokdo', 'KR')]).toEqual(['동해', '황해', '독도', '독도'])
    expect([shown('Paektu-san', 'cn'), shown('Paektu Mountain', 'kp'), shown('Changbai Mountain', 'cn'), shown('Baekdu Mountain')]).toEqual(['백두산', '백두산', '백두산', '백두산'])
    // A restaurant in Tokyo, a bar in Greece, the town of Changbai and the islands of Japan called Takeshima keep their names.
    expect([shown('Sea of Japan', 'jp'), shown('Yellow Sea', 'gr'), shown('Changbai', 'cn'), shown('Takeshima', 'jp')]).toEqual([
      'Sea of Japan',
      'Yellow Sea',
      'Changbai',
      'Takeshima',
    ])
    expect(displaySublabel({ sublabel: 'North Gyeongsang, South Korea', countryCode: 'kr' })).toBe('North Gyeongsang, 대한민국')
    // Korean's where line stays the data's under a Korean name too (its table names no region: no `ownScript`).
    expect(displaySublabel({ label: 'Liancourt Rocks', sublabel: 'North Gyeongsang, South Korea', countryCode: 'kr' })).toBe('North Gyeongsang, 대한민국')
  })

  it('shows the label and the where line in the visitor’s language, and keeps the Place English', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`)
    setBundleForTests('de', { exonyms: { names: DE }, geo: { ...enGeo, where } })
    const munich = { label: 'Munich', sublabel: 'Bavaria, Germany', countryCode: 'de' }
    expect([displayLabel(munich), displaySublabel(munich)]).toEqual(['München', 'Bayern, Deutschland'])
    // Each part of the where line, in its order and punctuation; parts it has no name for stay as they came.
    expect(displaySublabel({ sublabel: 'Cologne, North Rhine-Westphalia, Germany', countryCode: 'de' })).toBe('Köln, Nordrhein-Westfalen, Deutschland')
    expect(displaySublabel({ sublabel: 'Bus stop, Milan, Lombardy, Italy', countryCode: 'it' })).toBe('Bus stop, Mailand, Lombardei, Italien')
    // A where line that does not end with the place's country is a curated place's copy, or a geocoder's own: as it came.
    expect(displaySublabel({ sublabel: 'Bavaria, Deutschland', countryCode: 'de' })).toBe('Bavaria, Deutschland')
    expect(munich).toEqual({ label: 'Munich', sublabel: 'Bavaria, Germany', countryCode: 'de' })
    setBundleForTests('en', null)
    expect([displayLabel(munich), displaySublabel(munich)]).toEqual(['Munich', 'Bavaria, Germany'])
  })

  it('reads a where line’s earlier parts as towns and its last as a region, and says a repeated name once', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`)
    const names = 'UA:Odesa=Одеса;Chelyabinsk=Челябінськ;*Odesa=Одеська область;*Odesa Oblast=Одеська область;*Kyiv City=місто Київ;*Kyiv=місто Київ'
    setBundleForTests('uk', { exonyms: { names, ownScript: true }, geo: { ...enGeo, where } })
    // Photon's city, then its state: Odesa the city, in Odesa Oblast (not the oblast twice).
    expect(displaySublabel({ label: 'Derybasivska', sublabel: 'Odesa, Odesa Oblast, Ukraine', countryCode: 'ua' })).toBe('Одеса, Одеська область, Україна')
    // The offline list's region, and Photon's state on its own.
    expect(displaySublabel({ label: 'Yuzhne', sublabel: 'Odesa, Ukraine', countryCode: 'ua' })).toBe('Одеська область, Україна')
    expect(displaySublabel({ label: 'Golden Gate', sublabel: 'Kyiv, Ukraine', countryCode: 'ua' })).toBe('місто Київ, Україна')
    expect(displaySublabel({ label: 'Kyiv', sublabel: 'Kyiv City, Kyiv, Ukraine', countryCode: 'ua' })).toBe('місто Київ, Україна')
  })

  it('shows the data’s apostrophe as Italian writes it, in the label and the where line', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`)
    setBundleForTests('it', { exonyms: { names: 'IT:Rome=Roma', apostrophes: true }, geo: { ...enGeo, where } })
    expect(displayLabel({ label: "L'Aquila", countryCode: 'it' })).toBe('L’Aquila')
    expect(displaySublabel({ label: "Reggio nell'Emilia", sublabel: "Reggio nell'Emilia, Emilia-Romagna, Italy", countryCode: 'it' })).toBe('Reggio nell’Emilia, Emilia-Romagna, Italia')
    setBundleForTests('en', null)
    expect(displayLabel({ label: "L'Aquila", countryCode: 'it' })).toBe("L'Aquila")
  })

  it('names Israel’s region for the West Bank as the West Bank, with no country after it', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`)
    setBundleForTests('de', { exonyms: { names: 'PS:*West Bank=Westjordanland;*Gaza Strip=Gazastreifen' }, geo: { ...enGeo, where } })
    expect(displaySublabel({ label: 'Ariel', sublabel: 'Judea and Samaria Area, Israel', countryCode: 'il' })).toBe('Westjordanland')
    expect(displaySublabel({ label: 'Mall', sublabel: 'Ariel, Judea and Samaria Area, Israel', countryCode: 'il' })).toBe('Ariel, Westjordanland')
    const region = { label: 'Judea and Samaria Area', sublabel: 'Israel', countryCode: 'il', kind: 'region' as const }
    expect([displayLabel(region), displaySublabel(region)]).toEqual(['Westjordanland', undefined])
    expect(displaySublabel({ label: 'Haifa', sublabel: 'Haifa, Israel', countryCode: 'il' })).toBe('Haifa, Israel')
    // A language with no name for the West Bank, and English: as it came.
    setBundleForTests('vi', { exonyms: { names: 'PS:Gaza=Gaza' }, geo: { ...enGeo, where } })
    expect(displaySublabel({ label: 'Ariel', sublabel: 'Judea and Samaria Area, Israel', countryCode: 'il' })).toBe('Judea and Samaria Area, Israel')
    setBundleForTests('en', null)
    expect([displayLabel(region), displaySublabel(region)]).toEqual(['Judea and Samaria Area', 'Israel'])
  })

  it('joins the parts it names as the language joins a list (Persian «، »), and leaves the data’s own as they came', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}، ${country}`)
    setBundleForTests('fa', { exonyms: { names: 'US:Atlanta=آتلانتا;*Georgia=جورجیا', ownScript: true }, geo: { ...enGeo, where, parts: '، ' } })
    const airport = { label: 'Hartsfield–Jackson Atlanta International Airport', sublabel: 'Atlanta, Georgia, United States', countryCode: 'us' }
    expect(displaySublabel(airport)).toBe('آتلانتا، جورجیا، ایالات متحده')
    expect(displaySublabel({ label: 'Mall', sublabel: 'Peachtree, Brookhaven, United States', countryCode: 'us' })).toBe('Peachtree, Brookhaven، ایالات متحده')
  })

  it('reads a landmark’s hand-written where line in the language: two countries, two regions', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`)
    setBundleForTests('it', { exonyms: { names: 'IT:Rome=Roma' }, geo: { ...enGeo, where } })
    expect(displaySublabel({ sublabel: 'France and Italy', countryCode: 'fr' })).toBe('Francia e Italia')
    expect(displaySublabel({ sublabel: 'France and Italy', countryCode: 'ch' })).toBe('France and Italy') // not its country
    // Another country at the end: the parts in its names (the Vatican's Rome, Italy), and a line with no country at all.
    expect(displaySublabel({ sublabel: 'Rome, Italy', countryCode: 'va', kind: 'feature' })).toBe('Roma, Italia')
    expect(displaySublabel({ sublabel: 'Rome, Italy', countryCode: 'va' })).toBe('Rome, Italy') // a geocoder's: as it came
    setBundleForTests('it', { exonyms: { names: 'IT:Rome=Roma|IL:Jerusalem=Gerusalemme|US:*California=California' }, geo: { ...enGeo, where } })
    expect(displaySublabel({ sublabel: 'Jerusalem', countryCode: 'il', kind: 'feature' })).toBe('Gerusalemme')
    expect(displaySublabel({ sublabel: 'Chagos Archipelago', countryCode: 'io', kind: 'feature' })).toBe('Chagos Archipelago')
    expect(displaySublabel({ sublabel: 'Arizona and Utah, United States', countryCode: 'us' })).toBe('Arizona e Utah, Stati Uniti')
    expect(displaySublabel({ sublabel: 'Southern basin, Israel and Jordan', countryCode: 'jo' })).toBe('Southern basin, Israele e Giordania')
    setBundleForTests('ru', { exonyms: { names: 'US:*Nevada=Невада;*Arizona=Аризона;*Sistan and Baluchestan=x|IR:*Fars=Фарс' }, geo: { ...enGeo, where } })
    expect(displaySublabel({ sublabel: 'Nevada and Arizona, United States', countryCode: 'us' })).toBe('Невада и Аризона, Соединенные Штаты')
    expect(displaySublabel({ sublabel: 'Sistan and Baluchestan, Iran', countryCode: 'ir' })).toBe('Sistan and Baluchestan, Иран') // one name
    setBundleForTests('en', null)
    expect(displaySublabel({ sublabel: 'France and Italy', countryCode: 'fr' })).toBe('France and Italy')
  })

  it('leaves out a landmark’s line with no country under a label in another script when it stays Latin', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`)
    setBundleForTests('ru', { exonyms: { names: 'IO:Diego Garcia=Диего-Гарсия|IL:Jerusalem=Иерусалим', ownScript: true }, geo: { ...enGeo, where } })
    expect(displaySublabel({ label: 'Diego Garcia', sublabel: 'Chagos Archipelago', countryCode: 'io', kind: 'feature' })).toBeUndefined()
    expect(displaySublabel({ label: 'Western Wall', sublabel: 'Jerusalem', countryCode: 'il', kind: 'feature' })).toBe('Иерусалим')
    expect(displaySublabel({ label: 'Pine Gap', sublabel: 'Chagos Archipelago', countryCode: 'io', kind: 'feature' })).toBe('Chagos Archipelago')
  })

  it('leaves out a part in Latin letters under a label in another script, and keeps it under a Latin one', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`)
    setBundleForTests('ru', { exonyms: { names: 'GB:London=Лондон|US:*Illinois=Иллинойс', ownScript: true }, geo: { ...enGeo, where } })
    expect(displaySublabel({ label: 'London', sublabel: 'England, United Kingdom', countryCode: 'gb' })).toBe('Великобритания')
    expect(displaySublabel({ label: 'Chicago', sublabel: 'Illinois, United States', countryCode: 'us' })).toBe('Иллинойс, Соединенные Штаты')
    expect(displaySublabel({ label: 'Leeds', sublabel: 'England, United Kingdom', countryCode: 'gb' })).toBe('England, Великобритания')
    // Washington, D.C. is one part: never the state of Washington (Persian showed the White House in ایالت واشینگتن).
    setBundleForTests('ru', { exonyms: { names: 'US:^White House=Белый дом;Washington, D.C.=Вашингтон;*Washington=Вашингтон (штат)', ownScript: true }, geo: { ...enGeo, where } })
    expect(displaySublabel({ label: 'White House', sublabel: 'Washington, D.C., United States', countryCode: 'us', kind: 'feature' })).toBe('Вашингтон, Соединенные Штаты')
    setBundleForTests('en', null)
    expect(displaySublabel({ label: 'White House', sublabel: 'Washington, D.C., United States', countryCode: 'us' })).toBe('Washington, D.C., United States')
  })

  it('shows no where line for a place a Vietnamese reader holds to be Vietnam’s that the data files under another country', async () => {
    const { default: vi } = await import('@/i18n/vi/exonyms')
    setBundleForTests('vi', { exonyms: vi })
    expect(displaySublabel({ label: 'Johnson Reef', sublabel: 'China', countryCode: 'cn', lat: 9.715, lon: 114.287 })).toBeUndefined()
    expect(displaySublabel({ label: 'Meiji Reef', sublabel: 'Hainan, China', countryCode: 'cn', lat: 9.927, lon: 115.534 })).toBeUndefined()
    expect(displaySublabel({ label: 'Pattle Island', sublabel: 'Da Nang City, Vietnam', countryCode: 'vn', lat: 16.534, lon: 111.608 })).toBe('Da Nang City, Việt Nam')
    expect(displaySublabel({ label: 'Haikou', sublabel: 'Hainan, China', countryCode: 'cn', lat: 20.046, lon: 110.342 })).toBe('Hainan, Trung Quốc')
    // The Philippines' Spratly claim east of 116° is in; Sabah's islands and Palawan's Balabac Strait are not.
    expect(displaySublabel({ label: 'Investigator Northeast Shoal', sublabel: 'Mimaropa, Philippines', countryCode: 'ph', lat: 9.175, lon: 116.463 })).toBeUndefined()
    expect(displaySublabel({ label: 'Pulau Balambangan', sublabel: 'Sabah, Malaysia', countryCode: 'my', lat: 7.273, lon: 116.932 })).toBe('Sabah, Malaysia')
    expect(displaySublabel({ label: 'Kalampunian Island', sublabel: 'Sabah, Malaysia', countryCode: 'my', lat: 7.052, lon: 116.746 })).toBe('Sabah, Malaysia')
    expect(displaySublabel({ label: 'Balabac Strait', sublabel: 'Philippines', countryCode: 'ph', lat: 7.667, lon: 117.0 })).toBe('Philippines')
    setBundleForTests('en', null)
    expect(displaySublabel({ label: 'Johnson Reef', sublabel: 'China', countryCode: 'cn', lat: 9.715, lon: 114.287 })).toBe('China')
  })
})
