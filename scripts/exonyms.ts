/**
 * How scripts/build-exonyms.ts chooses the names in the generated display tables (src/i18n/<locale>/exonyms.gen.ts,
 * read by src/imagery/exonyms.ts): the name a German, Italian, Ukrainian, Russian, Vietnamese, Persian or Hindi map
 * gives a place that the data (GeoNames, and the geocoders asked in English) names in English: München, Mosca, Київ,
 * Москва, Hà Nội, تهران, नई दिल्ली.
 *
 * Why these rules:
 *  - Every name ships in its language's table, a chunk of its own, and must earn its bytes (owner rule: costs nothing,
 *    stays fast). A Latin-script language writes only the names that differ from the English (München, not Berlin);
 *    Cyrillic, Persian and Hindi write every name, so their tables cover fewer places (RULES: the large towns
 *    everywhere, more at home, every first-level region at home), sized to stay under 20 kB compressed
 *    (src/imagery/exonymTables.test.ts: a table is a chunk of its own, fetched at idle after the landing, never on the
 *    first screen).
 *  - GeoNames marks few names preferred (Mailand, Londra and Київ are not), and lists historic, colloquial, inflected
 *    and administrative forms beside the name itself (Ленинград, Питер, Киевом, استان کرمانشاه, Thành phố Nam Định). So
 *    pickName takes the preferred name, else the first plain one, else a short one; never a historic or colloquial one;
 *    only in the language's script; and never a form `penalty` marks while a plain one exists.
 *  - The data is not always right for a reader (Mumbai's first Hindi name is बम्बई, Delhi's Persian one is Old Delhi):
 *    OVERRIDES fixes a name by GeoNames id or first-level code, and is the only place a name is written by hand. A
 *    wrong name is fixed there, then the tables are generated again.
 *  - A name is the same place's in every language, so one town is one row in the usage stats: a table only displays,
 *    and adds search names (ALIASES: Sài Gòn) that find the place without ever being shown.
 *
 * Pure TypeScript with no Node or DOM dependency: the build script reads the files and calls these, and the app's tests
 * check them.
 */
import { placeKey } from '../src/imagery/placeKey'

/** One alternate name, with GeoNames' flags. */
export interface AltName {
  name: string
  preferred: boolean
  short: boolean
  colloquial: boolean
  historic: boolean
}

/** The languages that get a generated table. */
export const LANGS = ['de', 'it', 'uk', 'ru', 'vi', 'fa', 'hi'] as const
export type Lang = (typeof LANGS)[number]

const LATIN_NAME = /^[\p{Script=Latin}\p{M}\p{N}][\p{Script=Latin}\p{M}\p{N} .,'’()/-]*$/u
const CYRILLIC_NAME = /^[\p{Script=Cyrillic}\p{M}\p{N}][\p{Script=Cyrillic}\p{M}\p{N} .,'’ʼ()-]*$/u
/**
 * Persian letters, marks and the zero-width non-joiner Persian writes inside words (U+200C); not Urdu's own letters
 * (ں ہ ے ٹ ڈ ڑ: GeoNames gives a few Afghan towns their Urdu or Pashto spelling).
 */
const PERSIAN_NAME = /^(?![^]*[ںہےۓٹڈڑ])[\p{Script=Arabic}\p{M}][\p{Script=Arabic}\p{M}\u200c ()-]*$/u
const DEVANAGARI_NAME = /^[\p{Script=Devanagari}\p{M}][\p{Script=Devanagari}\p{M}\u200c\u200d ()-]*$/u

/** How a language's table is built. */
export interface Rules {
  /** What a shown name may be written in */
  script: RegExp
  /** Latin script: a name is written only where it differs from the English one (the rest show as they come) */
  latin: boolean
  /** The language's own countries: ISO codes, or a country's first-level region (CH.TI: Ticino, Switzerland's Italian canton) */
  home: readonly string[]
  /** Which towns abroad get their names (by size, fame and rank: `famous`) */
  abroad: (t: TownFacts) => boolean
  /** And a town this large at home */
  homeMinPop: number
  /** And a town this large in the neighbours its readers search most (Ukraine's towns in Russian) */
  near?: { countries: readonly string[]; minPop: number }
  /**
   * First-level regions named: every one at home, and abroad the regions of the countries listed (or all), and any
   * other that OVERRIDES names by its code (Crimea in Hindi)
   */
  regionsAbroad: 'all' | readonly string[]
  /** How many of the best-known seas, oceans, gulfs and straits get their names (countryless) */
  waters: number
  /**
   * In a Sino-Vietnamese reading, one romanization is many names (Suzhou is Tô Châu in Jiangsu and Túc Châu in Anhui):
   * in these countries a namesake with no name of its own is not presumed to share the larger place's (addNamesake).
   */
  ownNamesakes?: readonly string[]
  /** Towns named whatever their size, by GeoNames id: the ones its readers know that the thresholds miss (Sotschi, Милан) */
  include?: readonly string[]
  /**
   * A script table writes one English spelling of a place (the data's). Its home regions, and these countries', get
   * every current English one too (Kharkiv Oblast, Rostov Oblast, Republic of Tatarstan): what Photon and Open-Meteo
   * write in a where line.
   */
  spelledRegions?: readonly string[]
  /**
   * The other spellings the geocoders give a region at home (Photon's and Nominatim's Khanh Hoa province, Bac Ninh
   * City, Thành phố Hà Nội), from its name in the table (`shown`) and the data's English ones: each names it in a
   * where line as the table does, so a line shows no province in English, nor a city twice (Hà Nội, Thành phố Hà Nội).
   */
  regionForms?: (region: { shown: string; english: readonly string[] }) => readonly string[]
  /**
   * How many of the named features at home the offline list carries get their names (its lakes, castles, islands,
   * airports: scripts/features.ts), the best known first; none if unset. A Latin table writes only the ones that
   * differ.
   */
  homeFeatures?: number
  /**
   * At home, a town GeoNames names by one part of the data's compound (Valmadrera for Valmadrera-Caserta, ISTAT's
   * census localities) or in another case only (Cassano all’Ionio for Cassano All'Ionio) takes that name.
   */
  compounds?: boolean
  /**
   * Search names in another language's spelling for the large towns at home (Ukrainian: Russian's, Луганск for
   * Луганськ, as many readers type a town's Russian name): `lang`'s name for each town of `minPop` people, never shown.
   */
  searchAs?: { lang: Lang; minPop: number }
  /**
   * The label of a region named like a town of its country, apart from its where-line name (a search lists both: قم
   * and استان قم, Thanh Hóa and Tỉnh Thanh Hóa); undefined to leave the two alike.
   */
  regionLabel?: (region: { shown: string; cc: string; english: readonly string[]; alts: readonly AltName[] | undefined }) => string | undefined
}

/** What the rules know of a town. */
export interface TownFacts {
  pop: number
  /** How many names it has in other languages in GeoNames: how widely it is known (Venice has 150, Weifang 24) */
  names: number
  capital: boolean
  /** ISO country code */
  cc: string
}

/**
 * The dependent territories (ISO codes of places with no seat at the UN): most of their capitals are villages and small
 * towns (Adamstown, Grytviken, Port-aux-Français, Mata-Utu), which a script table names only from TERRITORY_CAPITAL
 * people (San Juan, Saint-Denis, Nouméa) or as it would any town, and so are the capitals of small states far away
 * (Yaren, Majuro, Kingstown: few readers search them, and every name costs a script table its bytes). The territory or
 * state itself is named by the browser; Europe's small states keep their capitals (SMALL_STATES: Vaduz, Valletta, the
 * Vatican).
 */
const TERRITORIES = new Set(
  'AI AS AW AX BL BM BQ BV CC CK CW CX FK FO GF GG GI GL GP GS GU HM IM IO JE KY MF MP MQ MS NC NF NU PF PM PN PR RE SH SJ SX TC TF TK UM VG VI WF YT'.split(' '),
)

/**
 * Abroad, a table names the capitals and the towns that are large and widely known: population alone would spend a
 * script table's bytes on districts of Shanghai and on cities few readers search, and leave out Venice. A Latin table
 * writes only its differing names, so it can name many more.
 */
const LATIN_ABROAD = (t: TownFacts) => t.capital || t.pop >= 1_000_000 || (t.pop >= 100_000 && t.names >= 50) || t.names >= 90
const TERRITORY_CAPITAL = 50_000
/** Europe's small states, whose capitals a script table names whatever their size (Vaduz, Valletta, the Vatican). */
const SMALL_STATES = new Set(['VA', 'SM', 'LI', 'MC', 'AD', 'MT', 'LU'])
const SCRIPT_ABROAD = (t: TownFacts) =>
  (t.capital && (t.pop >= TERRITORY_CAPITAL || (!TERRITORIES.has(t.cc) && SMALL_STATES.has(t.cc)))) ||
  t.pop >= 5_000_000 ||
  (t.pop >= 1_000_000 && t.names >= 60) ||
  (t.pop >= 300_000 && t.names >= 90)

/**
 * The thresholds per language, chosen by size (src/imagery/exonymTables.test.ts holds each table to its budget).
 *
 * A Latin table writes only the names that differ from the English (München, not Berlin), so it names every town of
 * 5,000 people at home, the neighbours' towns of 50,000 (Ukraine's too in German: Cherson, Winnyzja), the known towns
 * abroad (LATIN_ABROAD) and the regions of the countries its readers know, in a few kB. A table in another script
 * writes every name it has, at ~12 bytes compressed a name, so it names what its readers search: the capitals and the
 * large, widely known towns abroad (SCRIPT_ABROAD, ~400, and by id the ones the thresholds miss: Милан, کربلا), every
 * region at home and the regions of a few large countries (the US states, the UK's nations), the home countries'
 * towns down to a size that fits (Russia's, Belarus's, Kazakhstan's and Kyrgyzstan's of 100,000+; Ukraine's of
 * 10,000+, as docs/i18n/uk.md §4.3 asks; Iran's, Afghanistan's and Tajikistan's of 50,000+; India's of 100,000+) and
 * every regional seat there, Ukraine's towns of 100,000+ in Russian, the neighbours' large towns, the curated
 * landmarks GeoNames knows and the well-known seas. The native review (2026-11-22) set the regions abroad and the
 * towns added by id.
 */
/**
 * Vietnamese: a province's label (Tỉnh Thanh Hóa), a centrally governed city's (Thành phố Hải Phòng, and China's
 * municipalities: Thành phố Thượng Hải), Vientiane's prefecture (Thủ đô Viêng Chăn), as a Vietnamese map labels them.
 */
const VIETNAMESE_CITIES = new Set(['Hà Nội', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ', 'Huế'])
const VIETNAMESE_REGION: Rules['regionLabel'] = ({ shown, cc, english, alts }) => {
  if (!['VN', 'CN', 'LA'].includes(cc) || /^(Tỉnh|Thành phố|Thủ đô) /iu.test(shown)) return undefined
  if (cc === 'VN' && VIETNAMESE_CITIES.has(shown)) return `Thành phố ${shown}`
  const own = (alts ?? []).map((a) => cleanName(a.name, 'vi')).find((n) => /^(Tỉnh|Thành phố) /iu.test(n) && stripAdmin(n, 'vi') === shown)
  if (own) return own.charAt(0).toLocaleUpperCase('vi') + own.slice(1)
  if (english.some((e) => /\b(city|municipality)\b/i.test(e))) return `Thành phố ${shown}`
  if (english.some((e) => /\bprefecture\b/i.test(e))) return `Thủ đô ${shown}`
  return `Tỉnh ${shown}`
}
/**
 * Vietnamese: the spellings Photon and Nominatim, asked in English, give the provinces and cities since the 2025
 * merger (read 2026-11-22), beside GeoNames': without accents (Quang Ninh, Ha Noi), with "Province" or "City" after the
 * name in either case (Khanh Hoa province, Lâm Đồng Province, Bac Ninh City and Quang Ninh City for provinces too), the
 * data's name without its class word (Thừa Thiên Huế, which Photon still writes «Thừa Thiên - Huế»), and with the
 * Vietnamese class noun before it, as OpenStreetMap names a place it has no English name for (Thành phố Hà Nội; Tỉnh
 * Thanh Hóa). A key folds accents and case (placeKey), so one spelling stands for both ways of writing it.
 */
const VIETNAMESE_FORMS: Rules['regionForms'] = ({ shown, english }) => {
  const bare = stripAdmin(shown, 'vi')
  const plain = bare.normalize('NFD').replace(/\p{M}/gu, '').replace(/Đ/g, 'D').replace(/đ/g, 'd')
  const city = bare !== shown || VIETNAMESE_CITIES.has(bare)
  return [
    ...new Set([
      ...english.map((e) => e.replace(/ (Province|City)$/i, '')),
      plain,
      `${plain} City`,
      ...(city ? [] : [`${plain} Province`]),
      `${city ? 'Thành phố' : 'Tỉnh'} ${bare}`,
    ]),
  ]
}

export const RULES: Record<Lang, Rules> = {
  de: {
    script: LATIN_NAME,
    latin: true,
    home: ['DE', 'AT', 'CH', 'LI'],
    abroad: LATIN_ABROAD,
    homeMinPop: 5_000,
    near: { countries: ['IT', 'FR', 'BE', 'NL', 'LU', 'DK', 'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'UA'], minPop: 50_000 },
    regionsAbroad: ['IT', 'FR', 'BE', 'NL', 'PL', 'CZ', 'ES', 'GB', 'US', 'RU', 'UA', 'GR', 'PS', 'CN', 'HU', 'DK', 'TR'],
    waters: 50,
    homeFeatures: 2_000,
  },
  it: {
    script: LATIN_NAME,
    latin: true,
    home: ['IT', 'SM', 'VA', 'CH.TI'],
    abroad: LATIN_ABROAD,
    homeMinPop: 5_000,
    near: { countries: ['CH', 'FR', 'DE', 'AT', 'SI', 'HR', 'ES', 'MT', 'BE', 'GR'], minPop: 50_000 },
    regionsAbroad: ['CH', 'FR', 'DE', 'AT', 'ES', 'BE', 'GB', 'US', 'RU', 'GR', 'MT', 'PL', 'NL', 'ZA', 'DK', 'RS', 'UA', 'CZ', 'PS', 'BY'],
    waters: 50,
    homeFeatures: 2_000,
    compounds: true,
  },
  uk: {
    script: CYRILLIC_NAME,
    latin: false,
    home: ['UA'],
    abroad: SCRIPT_ABROAD,
    homeMinPop: 10_000,
    near: { countries: ['RU', 'BY', 'PL', 'MD'], minPop: 500_000 },
    regionsAbroad: ['US', 'GB', 'PL', 'DE', 'CA', 'BY', 'RU', 'PS'],
    waters: 45,
    searchAs: { lang: 'ru', minPop: 100_000 },
  },
  ru: {
    script: CYRILLIC_NAME,
    latin: false,
    home: ['RU', 'BY', 'KZ', 'KG'],
    abroad: SCRIPT_ABROAD,
    homeMinPop: 100_000,
    near: { countries: ['UA'], minPop: 100_000 },
    regionsAbroad: ['UA', 'US', 'GB', 'DE', 'PL', 'CA', 'PS'],
    spelledRegions: ['UA'],
    waters: 45,
    include: ['3173435', '3164603', '3165524', '2660646', '1853909', '1216265', '1217662', '615532', '311046', '361291', '360995', '1151254', '1614295', '5809844', '5506956', '4164138', '6173331', '294801', '688533'],
  },
  vi: {
    script: LATIN_NAME,
    latin: true,
    home: ['VN'],
    abroad: LATIN_ABROAD,
    homeMinPop: 5_000,
    near: { countries: ['CN', 'LA', 'KH', 'TH'], minPop: 100_000 },
    regionsAbroad: ['CN', 'LA', 'KH', 'US', 'GB', 'TW', 'PS'],
    waters: 50,
    ownNamesakes: ['CN', 'TW'],
    homeFeatures: 2_000,
    regionLabel: VIETNAMESE_REGION,
    regionForms: VIETNAMESE_FORMS,
  },
  fa: {
    script: PERSIAN_NAME,
    latin: false,
    home: ['IR', 'AF', 'TJ'],
    abroad: SCRIPT_ABROAD,
    homeMinPop: 50_000,
    regionsAbroad: ['US', 'GB', 'CA', 'DE', 'IQ', 'PS'],
    waters: 45,
    include: ['94824', '98860', '99532', '95446', '1216265', '1217662'],
    homeFeatures: 40,
    // A province named like its capital: استان قم (Iran), ولایت هرات (Afghanistan); bare in a where line.
    regionLabel: ({ shown, cc }) => (cc === 'IR' ? `استان ${shown}` : cc === 'AF' ? `ولایت ${shown}` : undefined),
  },
  hi: {
    script: DEVANAGARI_NAME,
    latin: false,
    home: ['IN'],
    abroad: SCRIPT_ABROAD,
    homeMinPop: 100_000,
    near: { countries: ['PK', 'NP', 'BD', 'LK'], minPop: 500_000 },
    regionsAbroad: ['US', 'GB', 'CA', 'AU', 'NP', 'LK', 'PS'],
    waters: 45,
    include: ['1166993', '1169825', '1167528', '1282898', '6173331', '2643123'],
  },
}

/** Is a place (its country, and its first-level code `CC.xx`) at home for the language? */
export function atHome(rules: Rules, cc: string, admin1Code: string): boolean {
  return rules.home.some((h) => (h.includes('.') ? h === admin1Code : h === cc))
}

/** Characters the table's format reserves (src/i18n/en/exonyms.ts). */
const RESERVED = /[|;=:*~\n]/

/**
 * Names never shown in any language, whatever GeoNames' flags say: the Soviet-era names it lists as current beside
 * the city's own (Свердловск for Екатеринбург, Днепропетровск for Дніпро), and Bombay in Hindi.
 */
const NEVER = new Set(
  [
    'Ленинград', 'Свердловск', 'Горький', 'Куйбышев', 'Калинин', 'Сталинград', 'Царицын', 'Днепропетровск', 'Дніпропетровськ',
    'Кировоград', 'Кіровоград', 'Артёмовск', 'Артемовск', 'Артемівськ', 'Ворошиловград', 'Жданов', 'Загорск', 'Орджоникидзе',
    'Фрунзе', 'Ленинабад', 'Ленинакан', 'Целиноград', 'Акмола', 'Гурьев', 'Петроград', 'Станислав', 'Станиславов',
    'Станіслав', 'Кировабад', 'Молотов', 'Ворошилов', 'बम्बई', 'बॉम्बे', 'बंबई',
  ].map((n) => n.normalize('NFC')),
)

/**
 * Administrative forms that are not the place's name, per language: a province or county prefix on a Persian town
 * (استان کرمانشاه for Kermanshah), a Russian or Ukrainian settlement type; in a Latin table, the class noun before a
 * name (Thành phố Nam Định, Provinz Nghe An, Provincia di Teheran), which is dropped, so that what is left is the
 * language's own name for the place or nothing new. A script table takes a name with one only if the place has no
 * other (and a region's is its usual form: استان تهران). Italian's longer articles are tried first: voivodato della
 * Piccola Polonia is Piccola Polonia, not la Piccola Polonia.
 */
export const ADMIN_FORMS: Partial<Record<Lang, RegExp>> = {
  fa: /^(استان|شهرستان|شهرک|شهرك|شهر|بخش|دهستان|روستای|منطقه|ناحیه|بندر) /u,
  ru: /^(город|посёлок|поселок|село|деревня|станица|пгт|аул) /iu,
  uk: /^(місто|селище|село) /iu,
  vi: /^(thành phố|tp\.?|thị xã|thị trấn|tỉnh|huyện|quận|xã|phường) /iu,
  de: /^(Bundesstaat|Bundesland|Provinz|Präfektur|Distrikt|Departement|Département|Gouvernement|Gouvernorat|Woiwodschaft|Kanton|Region|Republik|Staat|Emirat|Bezirk|Landkreis|Kreis|Gemeinde|Stadt|Municipio) /u,
  it: /^(Provincia|Regione|Stato|Distretto|Divisione|Dipartimento|Governatorato|Prefettura|Cantone|Canton|Repubblica|Contea|Voivodato|Città-Stato|Città metropolitana|Comune|Municipio|Emirato)( autonoma| autonomo| federale)?( della| dello| delle| degli| dell[’']| dei| del| di|d[’'])? ?/iu,
}

/**
 * A name without its class noun (ADMIN_FORMS), unless what is left is a number: Ho Chi Minh City's districts are Quận
 * 10, not 10 (nor Mười).
 */
export function stripAdmin(name: string, lang: Lang): string {
  const admin = ADMIN_FORMS[lang]
  if (!admin) return name
  const bare = name.replace(admin, '').trim()
  return /^(\d+|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)( |$)/iu.test(bare) ? name : bare
}

/**
 * A Persian region is named bare in a where line, as an Iranian or Afghan address writes it (کرج، البرز، ایران):
 * GeoNames writes some with استان (province) or ولایت (Afghan province) and some without.
 */
const PERSIAN_REGION = /^(استان|ولایت) /u

/**
 * Names a language never takes for a place abroad: in Italian, a scholarly transliteration of a Cyrillic name (Iževsk,
 * Charkiv, Tjumen'), which is no Italian name; Italian has one only where it is a word of its own (Leopoli, Mosca).
 */
const FOREIGN_FORM: Partial<Record<Lang, RegExp>> = { it: /[čšžČŠŽ]|(?<!Oblast)['’](?= |$)/u }
/**
 * And in Italian, in the countries that write Cyrillic or a Turkic or Caucasian Latin alphabet: a transliteration's
 * letters (Jerevan, Semej, Ul'janovsk, Mahilëŭ, Şımkent, Qostanay, Aşgabat, Gäncä), which Italian names never have
 * there (an elided d’ or l’ is Italian: Lago d’Aral).
 */
const FOREIGN_LETTERS: Partial<Record<Lang, { countries: ReadonlySet<string>; letters: RegExp }>> = {
  it: { countries: new Set(['RU', 'UA', 'BY', 'KZ', 'KG', 'TJ', 'UZ', 'TM', 'AZ', 'AM', 'GE', 'MD']), letters: /[jJqQëŭşŞıİäöüğĞʹ]|(?<![dDlL])['’]/u },
}

/**
 * A Vietnamese letter: it tells a Vietnamese name for a foreign place (Luân Đôn, Bắc Kinh, Vũ Hán) from the place's own
 * (Moskva). Its tone marks over a plain vowel count too (à, í, ũ): Vũ Hán, Cam Túc.
 */
const VIETNAMESE = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹàáãèéìíòóõùúýĩũ]/iu
/**
 * The countries whose towns Vietnamese names by Sino-Vietnamese readings, which need no Vietnamese letter to be its own
 * (Nam Ninh for Nanning, Nam Kinh for Nanjing): any name that is not the data's spelling is one.
 */
const SINO_VIETNAMESE = new Set(['CN', 'TW', 'HK', 'MO'])

const marks = (s: string) => (s.normalize('NFD').match(/\p{M}/gu) ?? []).length
/** Is the key `inner` a whole-word run of the key `outer`? */
const within = (inner: string, outer: string) => ` ${outer} `.includes(` ${inner} `)

/**
 * In a Latin table, is `shown` worth writing for a place the data spells `english`? Not if it only drops or changes
 * accents (Bien Hoa for Biên Hòa, Hué for Huế, Ōsaka for Osaka), or only adds or drops words around the same name
 * (Präfektur Kanagawa, New York City for New York, Washington for Washington D.C.), or abbreviates (St. Augustin):
 * those are spellings, not the language's own name. Dropping an English class word is (Nghệ An for Nghệ An Province),
 * and so, at home, is adding the language's accents (Đà Nẵng for Da Nang, Zürich for Zurich).
 */
export function latinWorthWriting(english: string, shown: string, home: boolean, feature = false): boolean {
  const a = placeKey(english)
  const b = placeKey(shown)
  if (!a || !b || (shown.includes('.') && !english.includes('.'))) return false
  if (a === b) return home && marks(shown) > marks(english)
  // Dropping an English class word is the language's own name (Nghệ An for Nghệ An Province, Gent for Ghent City; for a
  // feature, Rügen for Rügen Island, Wartburg for Wartburg Castle).
  if (within(b, a)) {
    const rest = ` ${a} `.replace(` ${b} `, ' ').trim()
    return ENGLISH_CLASS.test(rest) || (feature && FEATURE_CLASS.test(rest))
  }
  return !within(a, b)
}

/** The English class words around a feature's name in the offline list (Rügen Island, Mount Pilatus, Wartburg Castle). */
const FEATURE_CLASS = /^((lake|castle|palace|island|isle|mount|mountains|glacier|forest|national park|park|the|of) ?)+$/

/** The English class words around a place's name in the data (Nghệ An Province, Kyiv City, Moscow Oblast). */
const ENGLISH_CLASS = /^((province|city|region|district|oblast|governorate|prefecture|state|municipality|county|division|krai|kray|republic|voivodeship|autonomous|okrug|territory|of|the) ?)+$/

/** Persian writes Persian letters: Arabic ي and ك become ی and ک, the tatweel goes, and the vowel marks too. */
export function persianForm(s: string): string {
  return s
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ـ/g, '')
    .replace(/[\u064b-\u0652\u0670]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Ukrainian writes its apostrophe as ’ (U+2019): the faces cannot draw ʼ (U+02BC), and ' is a typewriter's. */
const ukApostrophe = (s: string) => s.replace(/['ʼ]/g, '’')

/**
 * Persian joins a word's parts with the zero-width non-joiner, never a space (fa.md §6.1): GeoNames writes خرم آباد,
 * خمینی شهر, ناحیه های and بین المللی (an airport's "international") for خرم‌آباد, خمینی‌شهر, ناحیه‌های and
 * بین‌المللی, and خانآباد with آ joined on. After a letter that never joins the next, the parts are simply one word
 * (نظرآباد, فولادشهر).
 */
const persianJoins = (s: string) =>
  s
    .replace(/([اأدذرزژو]) (آباد|شهر)(?= |$)/gu, '$1$2')
    .replace(/(\S) (آباد|شهر|ها|های)(?= |$)/gu, '$1\u200c$2')
    .replace(/(^| )بین (?=الملل)/gu, '$1بین\u200c')
    .replace(/([بپتثجچحخسشصضطظعغفقکگلمنهی])آ/gu, '$1\u200cآ')

/**
 * Hindi spelling as the Central Hindi Directorate writes it (hi.md §0): a nasal before a consonant of its own class is
 * the anusvara (इन्दौर → इंदौर, हिन्द → हिंद, ताशकन्द → ताशकंद), and क, ख, ग take no nukta (लद्दाख़ → लद्दाख); ज़ and
 * फ़ keep it.
 */
const hindiForm = (s: string) =>
  s
    .replace(/\u200d/g, '')
    .replace(/ङ्(?=[कखगघ])|ञ्(?=[चछजझ])|ण्(?=[टठडढ])|न्(?=[तथदध])|म्(?=[पफबभ])/gu, 'ं')
    .normalize('NFD')
    .replace(/([कखग])\u093c/gu, '$1')
    .normalize('NFC')

/**
 * A name as the language's table writes it: Unicode normalization, Persian letter forms and half-spaces, with no
 * direction marks and only the town's part of GeoNames' "City، Region" form (فیلادلفیا، پنسیلوانیا), Hindi without
 * joiners and in the Directorate's spelling, the Cyrillic apostrophe, no stress marks (GeoNames marks the stress on a
 * few names), a class word in lower case as Russian and Ukrainian write it (GeoNames writes «Свердловская Область»,
 * «Тихий Океан»), Italian's typographic apostrophe (Francoforte sull’Oder, it.md), and Vietnamese Đ where GeoNames
 * writes the Icelandic Ð (Ðà Lạt).
 */
export function cleanName(name: string, lang: Lang): string {
  const s = name.normalize('NFC').trim()
  if (lang === 'fa') return persianJoins(persianForm(s.replace(/[\u200e\u200f\u202a-\u202e]/g, '').split(/\s*[،٬]\s*/)[0]))
  // GeoNames spells a few Hindi names with zero-width joiners that force half forms (Minsk): the plain spelling.
  if (lang === 'hi') return hindiForm(s)
  if (lang === 'uk' || lang === 'ru')
    return ukApostrophe(s)
      .replace(/[\u0300\u0301]/g, '')
      // A qualifier GeoNames adds (Ла-Манш (пролив)) is not the name.
      .replace(/\s*\([^)]*\)$/u, '')
      .replace(/ (Область|Край|Округ|Автономный Округ|Автономна Республіка|Океан|Море|Озеро|Залив|Затока|Пролив|Протока)(?= |$)/gu, (w) => w.toLowerCase())
  if (lang === 'it') return s.replace(/'/g, '’')
  if (lang === 'vi') return s.replace(/Ð/g, 'Đ').replace(/ð/g, 'đ')
  return s
}

/**
 * What depends on the place, not only the language: Ukrainian writes г, not ґ, in a foreign place's name (Правопис 2019
 * §122: Гамбург, Гібралтар; ґ stays at home, Ґорґани), and an Italian region takes no article (Piccola Polonia, not La
 * Piccola Polonia: a label never starts with one, as OVERRIDES' Pentagono).
 */
function placeForm(name: string, lang: Lang, { home, region }: { home: boolean; region: boolean }): string {
  if (lang === 'uk' && !home) return name.replace(/ґ/g, 'г').replace(/Ґ/g, 'Г')
  if (lang === 'it' && region) return name.replace(/^(La|Il|Lo|Le|Gli|I) (?=\p{Lu})|^L’(?=\p{Lu})/u, '')
  return name
}

/** Has the name vowel marks (Persian harakat), so a plain spelling should be preferred? */
const VOCALIZED = /[\u064b-\u0652\u0670]/

/**
 * A language's name for a place among its alternate names in that language: the preferred one, else the first that
 * is neither short nor flagged, else a short one; never a historic or colloquial name, and only one `ok` accepts.
 * A name `penalty` marks (an administrative form, a vocalized spelling) is taken only if nothing else is left.
 * `region`: a first-level region in a Latin table, whose short name is its usual one (Bayern, Tessin), not an
 * abbreviation (a Russian region's short name drops its class word: Челябинская).
 */
export function pickName(
  alts: readonly AltName[] | undefined,
  ok: (name: string) => boolean,
  penalty: (name: string) => boolean = () => false,
  region = false,
): string | undefined {
  const usable = (alts ?? []).filter((a) => !a.historic && !a.colloquial && ok(a.name))
  const plain = usable.filter((a) => !penalty(a.name))
  const order = region
    ? [plain.filter((a) => a.preferred && a.short), plain.filter((a) => a.short), plain.filter((a) => a.preferred), plain, usable]
    : [plain.filter((a) => a.preferred), plain.filter((a) => !a.short), usable.filter((a) => a.preferred), usable.filter((a) => !a.short), usable]
  for (const list of order) if (list.length) return list[0].name
  return undefined
}

/**
 * A display name as the table writes it, or undefined if the language has none for the place. `home`: the place is
 * in one of the language's own countries (abroad, a Vietnamese name must be Vietnamese: Luân Đôn, not Moskva). `cc`:
 * its country (GeoNames writes some Vietnamese places' Đ as GJ in other languages: GJien Bien).
 */
export function displayName(
  alts: readonly AltName[] | undefined,
  lang: Lang,
  { region = false, home = false, cc = '', english = [] as readonly string[], avoid }: { region?: boolean; home?: boolean; cc?: string; english?: readonly string[]; avoid?: (name: string) => boolean } = {},
): string | undefined {
  const rules = RULES[lang]
  const admin = ADMIN_FORMS[lang]
  // A vocalized spelling (Persian vowel marks: س\u0650ن\u064e\u0651) is a dictionary's, not a map's: taken only if nothing plain is left,
  // and judged before cleanName strips the marks (سن\u0651 without them is another word).
  const plain = (alts ?? []).filter((a) => !VOCALIZED.test(a.name))
  const cleaned = (plain.some((a) => !a.historic && !a.colloquial) ? plain : (alts ?? [])).map((a) => ({ ...a, name: placeForm(cleanName(a.name, lang), lang, { home, region }) }))
  let usable = cleaned
  if (rules.latin && admin) usable = usable.map((a) => ({ ...a, name: stripAdmin(a.name, lang) }))
  if (lang === 'fa' && region) usable = usable.map((a) => ({ ...a, name: a.name.replace(PERSIAN_REGION, '') }))
  const foreign = home ? undefined : FOREIGN_FORM[lang]
  const letters = home ? undefined : FOREIGN_LETTERS[lang]
  const theData = new Set(english.map(placeKey))
  const ok = (n: string) =>
    !!n &&
    rules.script.test(n) &&
    !RESERVED.test(n) &&
    !NEVER.has(n) &&
    (lang !== 'vi' || home || VIETNAMESE.test(n) || (SINO_VIETNAMESE.has(cc) && !theData.has(placeKey(n)))) &&
    !(cc === 'VN' && /G[Jj]/.test(n)) &&
    !foreign?.test(n) &&
    !(letters?.countries.has(cc) && letters.letters.test(n))
  const pick = (list: AltName[], asRegion: boolean, fine: (n: string) => boolean) =>
    pickName(list, (n) => ok(n) && fine(n), (n) => !rules.latin && !region && !!admin?.test(n), asRegion)
  let picked = pick(usable, region && rules.latin, () => true)
  // A Latin region's short or bare name that is a town's (Krasnodar for Region Krasnodar, Tscheljabinsk for Oblast
  // Tscheljabinsk, Columbia for Distretto di Columbia) or another region's names the wrong place: its full name.
  if (picked && region && rules.latin && avoid?.(picked)) picked = pick(cleaned, false, (n) => !avoid(n)) ?? picked
  if (!picked) return undefined
  // A name GeoNames writes in lower case ("oblast' di Zaporižžja") starts a label with a capital.
  return picked.charAt(0).toLocaleUpperCase(lang) + picked.slice(1)
}

/** A place a table may name: its English spellings (the data's), and what it is. */
export interface Named {
  /** The English spellings the data may carry: GeoNames' own name first (the offline list's), then its English name */
  english: readonly string[]
  cc: string
  region: boolean
  /** People (a region's: its towns'), for the order and for namesakes */
  pop: number
  /** In one of the language's own countries */
  home?: boolean
  /** A natural feature or a building (a lake, a castle: latinWorthWriting's class words) */
  feature?: boolean
}

/** One key of a table being built: the data's spellings, the name shown (null: ambiguous), and its people. */
export interface Entry {
  spellings: Set<string>
  shown: string | null
  pop: number
  /** In one of the language's own countries */
  home: boolean
  /** Written whatever latinWorthWriting says: a name fixed by hand (OVERRIDES), or the data's own name cleaned at home */
  forced?: boolean
  /** A landmark's or feature's name that a town shares the key of: written for landmarks only (`^`) */
  landmark?: boolean
  /** A natural feature's or a building's (Named.feature) */
  feature?: boolean
}
/** A table being built: by country, then by key (`*` before a region's). */
export type DisplayTable = Map<string, Map<string, Entry>>

const keyOf = (english: string, region: boolean) => `${region ? '*' : ''}${placeKey(english)}`

/**
 * Add a place's name to a table, under each of its English spellings' keys. Where another place in the same country
 * has the same key and another name, the key names neither (`shown` null): the label could be either. `label`: a
 * region's own label (`#`), apart from its name in a where line.
 */
export function addDisplay(table: DisplayTable, place: Named, shown: string, { forced = false, landmark = false, label = false } = {}) {
  let country = table.get(place.cc)
  if (!country) table.set(place.cc, (country = new Map()))
  for (const english of place.english) {
    if (!placeKey(english) || RESERVED.test(english)) continue
    const key = label ? `#${placeKey(english)}` : `${landmark ? '^' : ''}${keyOf(english, place.region)}`
    const had = country.get(key)
    if (!had)
      country.set(key, {
        spellings: new Set([english]),
        shown,
        pop: place.pop,
        home: !!place.home,
        ...(forced ? { forced } : {}),
        ...(landmark ? { landmark } : {}),
        ...(place.feature ? { feature: true } : {}),
      })
    else {
      had.spellings.add(english)
      had.pop = Math.max(had.pop, place.pop)
      if (had.shown !== shown) had.shown = null
    }
  }
}

/**
 * A place too small for the table (`shown`: its own name in the language, if it has one): a key it shares with a
 * place in the table, in the same country, names neither if their names differ and the namesake is not tiny beside
 * it (a tenth of its people or more). A namesake with no name in the language is presumed to share the larger
 * place's (unless `ownNames`: Rules.ownNamesakes), and so is a hamlet (Hanoi has a namesake of no people that GeoNames
 * calls Lâm in Vietnamese). A name fixed by hand stays.
 */
export function addNamesake(table: DisplayTable, place: Named, shown: string | undefined, { ownNames = false } = {}) {
  const country = table.get(place.cc)
  if (!country || (shown === undefined && !ownNames)) return
  for (const english of place.english) {
    const had = country.get(keyOf(english, place.region))
    if (had && had.shown !== null && !had.forced && had.shown !== shown && place.pop * 10 >= had.pop) had.shown = null
  }
}

/** A search-only name (ALIASES): finds a place, never shown. */
export interface Alias {
  cc: string
  english: string
  alias: string
}

/**
 * The table as src/i18n/en/exonyms.ts describes it, by country (the countries with the largest places first, the
 * countryless names last), each country's names largest first, so a search ranks by the order: a key's entry only if
 * it names one place and some spelling of it in the data is worth the bytes (in a Latin table, latinWorthWriting:
 * Zurich for Zürich at home; in a script table, any spelling; a name fixed by hand, any spelling it is not), written
 * under that spelling. A region gets its own entry even where a town of its name is shown alike (Moscow), since a
 * region's label is looked up among regions only.
 */
export function serializeDisplay(table: DisplayTable, latin: boolean, aliases: readonly Alias[] = []): string {
  const groups: { cc: string; top: number; entries: string[] }[] = []
  const countries = new Set([...table.keys(), ...aliases.map((a) => a.cc)])
  for (const cc of countries) {
    const rows: { pop: number; text: string }[] = []
    const here = table.get(cc)
    for (const [key, e] of here ?? []) {
      if (e.shown === null) continue
      const shown = e.shown
      const differs = (s: string) => placeKey(s) !== placeKey(shown) || s !== shown
      const english = [...e.spellings].find((s) => (e.forced ? differs(s) : latin ? latinWorthWriting(s, shown, e.home, e.feature) : placeKey(s) !== placeKey(shown)))
      if (english === undefined) continue
      rows.push({ pop: e.pop, text: `${/^[*^#]/.test(key) ? key[0] : ''}${english}=${e.shown}` })
    }
    rows.sort((a, b) => b.pop - a.pop)
    const entries = rows.map((r) => r.text)
    for (const a of aliases) if (a.cc === cc && !RESERVED.test(a.english.replace(/^\*/, '') + a.alias)) entries.push(`~${a.english}=${a.alias}`)
    if (entries.length) groups.push({ cc, top: cc ? (rows[0]?.pop ?? 0) : -1, entries })
  }
  groups.sort((a, b) => b.top - a.top || a.cc.localeCompare(b.cc))
  return groups.map((g) => `${g.cc}:${g.entries.join(';')}`).join('|')
}

// ── Curated names ────────────────────────────────────────────────────────────────────────

/**
 * Names fixed by hand, by GeoNames id (a town, a landmark's feature), by first-level code (`UA.01`), or by
 * `<CC>:<English name>` for a name the data gives in that country (a curated landmark's, scripts/landmarks.ts),
 * `:<English name>` for a place with no country (a sea). An empty name removes the entry: the place shows as it
 * comes. Each says why.
 *
 * The landmarks' names were read in every language (2026-11-22): GeoNames matched a few to a neighbour (Mecca to the
 * Kaaba, the Moai to Easter Island, LAX to Los Angeles), and spells a few as an import from the US gazetteer would
 * (Деас Вэлли for Death Valley); those are written here.
 */
export const OVERRIDES: Record<Lang, Record<string, string>> = {
  /**
   * German: Ukraine's oblasts and capital as docs/i18n/de.md §8 writes them (Kyjiw, Oblast Kyjiw: GeoNames mixes Kiew
   * and city names), Spain's and France's regions by their German names (GeoNames has Nordkastilien, Neuguitanien), the
   * Klagemauer; names GeoNames gives that are old, ancient or another language's are removed (Haltern in Westfalen,
   * Tralleis, Gäncä, Merath), and Aarhus is spelt so since 2011.
   */
  de: {
    'UA.02': 'Oblast Tschernihiw',
    'UA.05': 'Oblast Donezk',
    'UA.07': 'Oblast Charkiw',
    'UA.12': 'Kyjiw',
    'UA.13': 'Oblast Kyjiw',
    'UA.15': 'Oblast Lwiw',
    'UA.19': 'Oblast Riwne',
    'UA.27': 'Oblast Schytomyr',
    'ES.55': 'Kastilien und León',
    'ES.54': 'Kastilien-La Mancha',
    'ES.34': 'Asturien',
    'ES.32': 'Navarra',
    'FR.75': 'Nouvelle-Aquitaine',
    'IL:Western Wall': 'Klagemauer',
    'DE:Haltern am See': '',
    'DE:Burgdorf, Hanover': '',
    'DE:Heppenheim an der Bergstrasse': '',
    'DE:Rotenburg (Wümme)': '',
    'TR:Aydın': '',
    'TR:Afyonkarahisar': '',
    'KG:Manas': '',
    'AZ:Ganja': '',
    'UZ:Samarkand': '',
    'IN:Meerut': '',
    'IN:Howrah': '',
    /**
     * Native review (2026-11-22). Ukraine's towns by their Ukrainian-based German names (de.md §8: Saporischschja,
     * Iwano-Frankiwsk, Mykolajiw; GeoNames has Stanislau and nothing), Peking and Breslau (GeoNames prefers Beijing and
     * marks Breslau historic), Pskow and Czernowitz over Pleskau and Tschernowitz, and the regions in their full names.
     */
    'CN:Beijing': 'Peking',
    'CN.22': 'Peking',
    3081368: 'Breslau',
    687700: 'Saporischschja',
    707471: 'Iwano-Frankiwsk',
    700569: 'Mykolajiw',
    703845: 'Krywyj Rih',
    711350: 'Butscha',
    504341: 'Pskow',
    710719: 'Czernowitz',
    491422: 'Sotschi',
    2542997: 'Marrakesch',
    1135689: 'Kundus',
    1133616: 'Masar-e Scharif',
    359792: 'Assuan',
    3073803: 'Karlsbad',
    2624652: 'Aarhus',
    3991164: 'Querétaro',
    3522507: '',
    295514: 'Bne Berak',
    'UA.24': 'Oblast Wolyn',
    'RU.32': 'Autonomer Kreis der Chanten und Mansen',
    'RU.29': 'Oblast Kemerowo',
    'RU.59': 'Region Primorje',
    'RU.93': 'Region Transbaikalien',
    'RU.92': 'Region Kamtschatka',
    'PL.79': 'Woiwodschaft Oppeln',
    'PL.76': 'Woiwodschaft Lebus',
    'PL.84': 'Woiwodschaft Heiligkreuz',
    'CZ.80': 'Region Vysočina',
    'CZ.88': 'Mittelböhmische Region',
    'CH.SG': 'St. Gallen',
    'PS.GZ': 'Gazastreifen',
    'PS.WE': 'Westjordanland',
    'CN.20': 'Innere Mongolei',
    ':Yellow Sea': 'Gelbes Meer',
    /** South Tyrol's towns by their German names: the province is bilingual, with a German-speaking majority. */
    3173577: 'Meran',
    3181550: 'Brixen',
    3181480: 'Bruneck',
    3175235: 'Leifers',
    3164065: 'Sterzing',
    /** Gaza's towns as German reporting writes them (the data has Khān Yūnis, Jabālyā). */
    'PS:Khān Yūnis': 'Chan Yunis',
    'PS:Rafaḩ': 'Rafah',
    'PS:Jabālyā': 'Dschabalija',
    'PS:Dayr al Balaḩ': 'Deir al-Balah',
    'PS:Bayt Lāhyā': 'Beit Lahia',
    /** Features at home and nearby that German readers know in German. */
    'DE:Lake Constance': 'Bodensee',
    'CH:Lake Zurich': 'Zürichsee',
    'CH:Lake Leman': 'Genfersee',
    'CH:Lake Geneva': 'Genfersee',
    'AT:Lake Neusiedl': 'Neusiedler See',
    'DE:Black Forest': 'Schwarzwald',
    'DE:Thuringian Forest': 'Thüringer Wald',
    'DE:Heligoland': 'Helgoland',
    'CH:Rhine Falls': 'Rheinfall',
    'DE:Neuschwanstein Castle': 'Schloss Neuschwanstein',
    'DE:Cologne Cathedral': 'Kölner Dom',
    ':Alps': 'Alpen',
    'NL:Wadden Sea': 'Wattenmeer',
    ':Pyrenees': 'Pyrenäen',
    ':Carpathian Mountains': 'Karpaten',
    ':Iberian Peninsula': 'Iberische Halbinsel',
    'ES:Iberian Peninsula': 'Iberische Halbinsel',
    'ES:Majorca': 'Mallorca',
    'ES:Tenerife': 'Teneriffa',
    'GR:Crete': 'Kreta',
    /**
     * Names German reporting no longer uses (de.wikipedia's titles are the towns' own): the pre-1945 names of Polish,
     * Czech, Slovak, Hungarian and Romanian towns other than the large cities still called so (Warschau, Krakau,
     * Danzig, Stettin, Posen, Kattowitz, Breslau; Prag, Brünn, Pilsen, Budweis, Olmütz; Hermannstadt, Kronstadt,
     * Temeswar, Klausenburg), and other dated forms.
     */
    'PL:Gdynia': '',
    'PL:Częstochowa': '',
    'PL:Gliwice': '',
    'PL:Toruń': '',
    'PL:Bielsko-Biala': '',
    'PL:Elbląg': '',
    'PL:Zielona Góra': '',
    'PL:Kalisz': '',
    'PL:Legnica': '',
    'PL:Słupsk': '',
    'PL:Grudziądz': '',
    'PL:Nowy Sącz': '',
    'PL:Lubin': '',
    'PL:Fordon': '',
    'PL:Żory': '',
    'PL:Tarnowskie Góry': '',
    'PL:Świdnica': '',
    'PL:Racibórz': '',
    'PL:Ełk': '',
    'CZ:Liberec': '',
    'CZ:Ústí nad Labem': '',
    'CZ:Most': '',
    'CZ:Opava': '',
    'CZ:Teplice': '',
    'CZ:Jihlava': '',
    'CZ:Hradec Králové': '',
    'SK:Nitra': '',
    'SK:Žilina': '',
    'SK:Banská Bystrica': '',
    'SK:Trenčín': '',
    'HU:Szeged': '',
    'HU:Pécs': '',
    'HU:Sopron': '',
    'HU:Veszprém': '',
    'HU:Eger': '',
    'RO:Galaţi': '',
    'RO:Oradea': '',
    'RO:Satu Mare': '',
    "NL:'s-Hertogenbosch": '',
    'TN:Kairouan': '',
    'CH:Saint-Imier': '',
    'IT:Benevento': '',
    'BE:Mechelen': '',
    'SY:Deir ez-Zor': '',
    'PH:Magugpo Poblacion': '',
    'AU:Sydney Opera House': '',
    'UA:Moshchena': '',
    'ZA:Gqeberha': '',
    'MO:Macau': '',
    'UA:Sheptytskyi': 'Scheptyzkyj',
    ':White Sea': 'Weißes Meer',
    /**
     * Second pass over the native review (2026-11-22): the regions GeoNames names as their capital or not at all
     * (Region Stawropol, Oblast Orjol, Republik Altai; Luhansk, Sumy and Ternopil, the offline list's bare oblast names
     * in a where line), and the seas and straits GeoNames has no German name for (Golf von Biskaya, Straße von
     * Gibraltar, Beringmeer); Wattenmeer without GeoNames' qualifier, Korallenmeer in one word.
     */
    'RU.70': 'Region Stawropol',
    'RU.56': 'Oblast Orjol',
    'RU.03': 'Republik Altai',
    'RU.49': 'Oblast Murmansk',
    'UA.14': 'Oblast Luhansk',
    'UA.21': 'Oblast Sumy',
    'UA.22': 'Oblast Ternopil',
    // Photon's spellings of two cities the data spells otherwise (Mykolayiv, Zaporizhzhya).
    'UA:Mykolaiv': 'Mykolajiw',
    'UA:Zaporizhzhia': 'Saporischschja',
    ':Bay of Biscay': 'Golf von Biskaya',
    ':Strait of Gibraltar': 'Straße von Gibraltar',
    ':Bering Sea': 'Beringmeer',
    ':East China Sea': 'Ostchinesisches Meer',
    ':Sea of Japan': 'Japanisches Meer',
    ':Barents Sea': 'Barentssee',
    ':Gulf of Finland': 'Finnischer Meerbusen',
    ':Gulf of Bothnia': 'Bottnischer Meerbusen',
    ':Irish Sea': 'Irische See',
    ':Ionian Sea': 'Ionisches Meer',
    ':Kara Sea': 'Karasee',
    ':Laptev Sea': 'Laptewsee',
    ':Gulf of Thailand': 'Golf von Thailand',
    ':Gulf of Tonkin': 'Golf von Tonkin',
    ':Andaman Sea': 'Andamanensee',
    ':Tasman Sea': 'Tasmansee',
    ':Coral Sea': 'Korallenmeer',
    ':Wadden Sea': 'Wattenmeer',
    /**
     * Third review (2026-11-22). Photon's spellings of the city and the oblast (Zaporizhia) and of Stavropol Krai; the
     * world's landmarks German knows by German names, as Italian's block names them; the features at home GeoNames
     * names wrongly or not at all (Würmsee is Lake Starnberg's old name, Rhein-Main-Flughafen and DHM are not what
     * German readers call them); the lakes and mountains next door; Ukraine's towns German war reporting names
     * daily, and Russia's regional capitals beside their oblasts, in the Ukrainian- and Russian-based German forms
     * (de.md §8); the Czech regions by today's names (Region Liberec, not the pre-1945 Reichenberger Region).
     */
    'UA:Zaporizhia': 'Saporischschja',
    'UA:*Zaporizhia Oblast': 'Oblast Saporischschja',
    'RU:*Stavropol Krai': 'Region Stawropol',
    'FR:Eiffel Tower': 'Eiffelturm',
    'RU:Kremlin': 'Kreml',
    'CN:Great Wall of China': 'Chinesische Mauer',
    'CN:Forbidden City': 'Verbotene Stadt',
    'GR:Acropolis': 'Akropolis',
    'IT:Leaning Tower of Pisa': 'Schiefer Turm von Pisa',
    'BR:Christ the Redeemer': 'Cristo Redentor',
    'EG:Great Sphinx of Giza': 'Sphinx von Gizeh',
    'EG:Valley of the Kings': 'Tal der Könige',
    'EC:Galápagos Islands': 'Galápagos-Inseln',
    'AR:Iguazu Falls': 'Iguaçu-Wasserfälle',
    'VN:Ha Long Bay': 'Halong-Bucht',
    'BR:Amazon River': 'Amazonas',
    'TZ:Mount Kilimanjaro': 'Kilimandscharo',
    'DE:Lake Starnberg': 'Starnberger See',
    'CH:Lake Lucerne': 'Vierwaldstättersee',
    'DE:Lake Schwerin': 'Schweriner See',
    'DE:Hohenzollern Castle': 'Burg Hohenzollern',
    'DE:Eltz Castle': 'Burg Eltz',
    'DE:Reichenau Island': 'Reichenau',
    'CH:Rhône Glacier': 'Rhonegletscher',
    'DE:Franconian Forest': 'Frankenwald',
    'DE:Technical University Munich': 'Technische Universität München',
    'DE:University Cologne': 'Universität zu Köln',
    'DE:University of Hamburg': 'Universität Hamburg',
    'CH:University of Basel': 'Universität Basel',
    'AT:Vienna University of Technology': 'Technische Universität Wien',
    'AT:Graz University of Technology': 'Technische Universität Graz',
    'DE:Heinrich-Heine-University Dusseldorf': 'Heinrich-Heine-Universität Düsseldorf',
    'CH:Glarus Alps': 'Glarner Alpen',
    'AT:Allgau Alps': 'Allgäuer Alpen',
    'DE:Bellevue Palace': 'Schloss Bellevue',
    'DE:New Palace Potsdam': 'Neues Palais',
    'DE:Friedenstein Castle': 'Schloss Friedenstein',
    'AT:Ambras Castle': 'Schloss Ambras',
    'CH:Lake Hallwil': 'Hallwilersee',
    'CH:Lake Sempach': 'Sempachersee',
    'DE:Great Plön Lake': 'Großer Plöner See',
    'AT:Pasterze Glacier': 'Pasterze',
    'DE:Lake Kochel': 'Kochelsee',
    'DE:Lake Walchen': 'Walchensee',
    'DE:Lake Kummerow': 'Kummerower See',
    'DE:Lake Steinhude': 'Steinhuder Meer',
    'DE:Lake Stechlin': 'Stechlinsee',
    'DE:Rhön Mountains': 'Rhön',
    'DE:Palatinate Forest': 'Pfälzerwald',
    'DE:Vogelsberg Mountains': 'Vogelsberg',
    'DE:Frankfurt Airport': 'Flughafen Frankfurt am Main',
    'DE:Cologne Bonn Airport': 'Flughafen Köln/Bonn',
    'DE:Münster Osnabrück International Airport': 'Flughafen Münster/Osnabrück',
    'AT:Linz Airport': 'Flughafen Linz',
    'DE:German Historical Museum': 'Deutsches Historisches Museum',
    'DE:Stuttgart University of Applied Science': '',
    'DE:Memorial Park': '',
    'DE:Opera House': '',
    'DE:Carthusian monastery Astheim': '',
    'DE:Zoological Museum (c. 1809-1889)': '',
    'IT:Lake Garda': 'Gardasee',
    'IT:Lake Como': 'Comer See',
    'IT:Lake Maggiore': 'Lago Maggiore',
    'IT:Dolomites': 'Dolomiten',
    'IL:Sea of Galilee': 'See Genezareth',
    'TZ:Lake Victoria': 'Victoriasee',
    ':Himalayas': 'Himalaya',
    693468: 'Slowjansk',
    702972: 'Lyssytschansk',
    702320: 'Makijiwka',
    709932: 'Kamjanske',
    712451: 'Berdjansk',
    713716: 'Altschewsk',
    688148: 'Jenakijewe',
    707292: 'Isjum',
    703656: 'Kupjansk',
    713122: 'Awdijiwka',
    699839: 'Nowa Kachowka',
    707244: 'Kachowka',
    690823: 'Wuhledar',
    710915: 'Tschassiw Jar',
    695357: 'Kurachowe',
    713749: 'Ochtyrka',
    709334: 'Dschankoj',
    712160: 'Bilhorod-Dnistrowskyj',
    709611: 'Drohobytsch',
    500096: 'Rjasan',
    515012: 'Orjol',
    581049: 'Archangelsk',
    571476: 'Brjansk',
    511565: 'Pensa',
    487846: 'Stawropol',
    2025339: 'Tschita',
    1506271: 'Gorno-Altaisk',
    'CZ.83': 'Region Liberec',
    'CZ.89': 'Region Ústí',
    'CZ.82': 'Region Hradec Králové',
    'CZ.86': 'Region Pardubice',
    'CZ.87': 'Region Pilsen',
    'CZ.84': 'Region Olmütz',
    'CZ.81': 'Region Karlsbad',
    'CZ.90': 'Region Zlín',
    'OM:Strait of Hormuz': 'Straße von Hormus',
    'SY:Dayr az Zawr': 'Deir ez-Zor',
    2658822: 'St. Gallen',
    'ES.57': '',
    'DK.17': 'Region Hovedstaden',
    'UA.25': 'Oblast Transkarpatien',
    'RU.15': 'Autonomer Kreis der Tschuktschen',
    'HU.02': 'Komitat Baranya',
    'IT:Reggio Calabria': '',
    "AG:St John's": '',
    'GG:St Peter Port': '',
    // Egypt's governorates German tourists' where lines carry (GeoNames' German names transliterate the Arabic).
    'EG:*Red Sea': 'Rotes Meer',
    'EG:*South Sinai': 'Südsinai',
    'EG:*North Sinai': 'Nordsinai',
    'EG:*Cairo Governorate': 'Kairo',
    'EG:*Giza Governorate': 'Gizeh',
    'EG:*Luxor Governorate': 'Luxor',
    'EG:*Aswan Governorate': 'Assuan',
    // Pre-ship review (2026-11-22): Photon's usual name for Crimea's region (de.md §8: die Krim, assigned to no one).
    'UA:*Republic of Crimea': 'Krim',
  },
  /**
   * Italian: France's new regions by their Italian names (GeoNames has the provisional ones: Nord-Passo di
   * Calais-Piccardia), Flanders, Togliatti; ancient and colonial names removed (Iconio, Tralli, Gimma, Poona), and a
   * label never takes an article (Pentagono, not Il Pentagono).
   */
  it: {
    'FR.32': 'Alta Francia',
    'FR.75': 'Nuova Aquitania',
    'FR.44': '',
    'BE:*Flanders': 'Fiandre',
    'BE:*Flemish Region': 'Fiandre',
    'RU:*Mariy-El Republic': '',
    'RU:Tolyatti': 'Togliatti',
    'US:Pentagon': 'Pentagono',
    'CA:CN Tower': '',
    'TR:Kayseri': '',
    'TR:Konya': '',
    'TR:Antakya': '',
    'TR:Aydın': '',
    'TR:Edirne': '',
    'IN:Pune': '',
    'ET:Jimma': '',
    'IT:Lido di Jesolo': '',
    'IT:Cerese': '',
    /** Ukraine's towns as the gazetteer gives them (docs/i18n/it.md §8: Kyiv, Kharkiv, Odesa), Italian's own exonyms kept. */
    'UA:Kharkiv': '',
    'UA:Donetsk': '',
    'UA:Kremenchuk': '',
    'UA:Chernivtsi': '',
    /**
     * Native review (2026-11-22): the Persian Gulf as it.md §8 names it, Cadice, the District of Columbia whole, the
     * Altai Republic without an article, the neutral Santa Sofia, Italian exonyms the thresholds or the old-spelling
     * rule missed (Zara, La Valletta, Coira, Mentone, the bilingual Istrian and Slovene towns, Bengasi, Gedda,
     * Betlemme, Calcutta), and the scholarly transliterations GeoNames gives (Lipeck, Habarovsk, Vicebsk) removed.
     */
    ':Persian Gulf': 'Golfo Persico',
    ':Arabian Gulf': 'Golfo Persico',
    'ES.60': 'Comunità Valenciana',
    'ES.34': 'Asturie',
    'US.DC': 'Distretto di Columbia',
    'RU.03': 'Repubblica dell’Altaj',
    'RU.04': 'Territorio dell’Altaj',
    'RU.66': 'San Pietroburgo',
    'SA:*Mecca Region': 'Regione della Mecca',
    2520600: 'Cadice',
    'TR:Hagia Sophia': 'Santa Sofia',
    315373: '',
    2473449: '',
    99532: 'Bassora',
    105343: 'Gedda',
    728193: '',
    146384: '',
    1804879: '',
    2518559: '',
    6534221: '',
    2022890: '',
    535121: '',
    620127: '',
    1519922: '',
    616052: 'Erevan',
    2863941: '',
    3033123: '',
    418863: '',
    99072: '',
    1512569: '',
    3703443: 'Città di Panama',
    285787: '',
    108410: 'Riad',
    261745: '',
    2794055: '',
    3186952: 'Zara',
    2562305: 'La Valletta',
    2661169: 'Coira',
    2994497: 'Mentone',
    3197753: 'Capodistria',
    3193341: 'Pirano',
    3199017: 'Isola',
    3191518: 'Rovigno',
    3192699: 'Parenzo',
    3188498: 'Umago',
    88319: 'Bengasi',
    2214846: 'Misurata',
    284315: 'Betlemme',
    284899: 'Gerico',
    359792: 'Assuan',
    2463679: 'Corfù',
    267008: 'Tiro',
    2472706: 'Biserta',
    3184081: 'Scutari',
    2750053: 'Nimega',
    1275004: 'Calcutta',
    1809858: 'Canton',
    2519240: 'Cordova',
    'UA:Odesa': '',
    /** Home towns that GeoNames misspells, and the comuni its statistical localities stand for. */
    3179337: 'Cava de’ Tirreni',
    3172996: 'Montecatini Terme',
    3219114: 'Spinea',
    3172979: 'Montecchio Maggiore',
    3170657: 'Piove di Sacco',
    3173985: 'Marcon',
    3182854: 'Ariano Irpino',
    3181209: 'Caldogno',
    3181762: 'Borgoricco',
    3176277: 'Gavardo',
    3173660: 'Medicina',
    3183257: 'Almese',
    3173385: 'Mira',
    2522849: 'Troina',
    3165018: 'Usmate Velate',
    3167562: 'Santa Maria a Vico',
    3170487: 'Poggio a Caiano',
    3179297: 'Cavaria con Premezzo',
    3179629: 'Castelletto sopra Ticino',
    /** Features and landmarks Italians know only by their Italian names. */
    'IT:Leaning Tower of Pisa': 'Torre di Pisa',
    'IT:Lake Garda': 'Lago di Garda',
    'IT:Lake Como': 'Lago di Como',
    'IT:Lake Maggiore': 'Lago Maggiore',
    'IT:Lake Iseo': 'Lago d’Iseo',
    'CH:Lake Lugano': 'Lago di Lugano',
    'IT:Mount Etna': 'Etna',
    'IT:Mount Vesuvius': 'Vesuvio',
    'IT:Vesuvius': 'Vesuvio',
    'IT:Dolomites': 'Dolomiti',
    'IT:Aeolian Islands': 'Isole Eolie',
    'IT:Gulf of Naples': 'Golfo di Napoli',
    'IT:Herculaneum': 'Ercolano',
    ':Alps': 'Alpi',
    'FR:Eiffel Tower': 'Torre Eiffel',
    'RU:Kremlin': 'Cremlino',
    'CN:Great Wall of China': 'Grande Muraglia cinese',
    'CN:Forbidden City': 'Città Proibita',
    'BR:Christ the Redeemer': 'Cristo Redentore',
    'GR:Acropolis': 'Acropoli di Atene',
    'DE:Brandenburg Gate': 'Porta di Brandeburgo',
    'DE:Neuschwanstein Castle': 'Castello di Neuschwanstein',
    'EG:Great Sphinx of Giza': 'Sfinge di Giza',
    'EG:Valley of the Kings': 'Valle dei Re',
    'OM:Strait of Hormuz': 'Stretto di Hormuz',
    'TZ:Mount Kilimanjaro': 'Kilimangiaro',
    'US:Death Valley': 'Valle della Morte',
    'AU:Great Barrier Reef': 'Grande barriera corallina',
    'EC:Galápagos Islands': 'Isole Galápagos',
    'BR:Amazon River': 'Rio delle Amazzoni',
    'VN:Ha Long Bay': 'Baia di Ha Long',
    'AR:Iguazu Falls': 'Cascate dell’Iguazú',
    'MY:Petronas Towers': 'Torri Petronas',
    'NP:Mount Everest': 'Everest',
    'BO:Lake Titicaca': 'Lago Titicaca',
    'SA:Mecca': 'La Mecca',
    'IL:Western Wall': 'Muro del Pianto',
    'US:Hollywood Sign': 'Scritta Hollywood',
    'AU:Sydney Opera House': 'Opera House di Sydney',
    'ZA:Gqeberha': '',
    'XK:Pristina': '',
    'RU:Lake Baikal': 'Lago Baikal',
    'KZ:Aral Sea': 'Lago d’Aral',
    ':Indian Ocean': 'Oceano Indiano',
    ':Arctic Ocean': 'Oceano Artico',
    ':Southern Ocean': 'Oceano Antartico',
    ':Caspian Sea': 'Mar Caspio',
    ':Arabian Sea': 'Mar Arabico',
    ':Sea of Azov': 'Mar d’Azov',
    ':Gulf of Aqaba': 'Golfo di Aqaba',
    ':Strait of Gibraltar': 'Stretto di Gibilterra',
    ':Ionian Sea': 'Mar Ionio',
    ':Aegean Sea': 'Mar Egeo',
    ':South China Sea': 'Mar Cinese Meridionale',
    ':Sea of Japan': 'Mar del Giappone',
    ':Bay of Biscay': 'Golfo di Biscaglia',
    /**
     * Second pass over the native review (2026-11-22): Marrakech (GeoNames' Italian name is not kept), Heraklion for
     * the data's Irákleion, Lago di Ginevra, Friburgo for the Swiss city as for its canton, the Danish capital region
     * and central Serbia, Ukraine's oblasts as the table writes Kyiv's (Oblast di Kharkiv, in the gazetteer's spelling,
     * it.md §17), and the Greenland Sea.
     */
    2542997: 'Marrakech',
    'GR:Irákleion': 'Heraklion',
    'CH:Lake Leman': 'Lago di Ginevra',
    'CH:Lake Geneva': 'Lago di Ginevra',
    'CH:Fribourg': 'Friburgo',
    'RS.SE': 'Serbia centrale',
    ':Greenland Sea': 'Mare di Groenlandia',
    'UA.01': 'Oblast di Cherkasy',
    'UA.02': 'Oblast di Chernihiv',
    'UA.03': 'Oblast di Chernivtsi',
    'UA.04': 'Oblast di Dnipropetrovsk',
    'UA.05': 'Oblast di Donetsk',
    'UA.06': 'Oblast di Ivano-Frankivsk',
    'UA.07': 'Oblast di Kharkiv',
    'UA.08': 'Oblast di Kherson',
    'UA.09': 'Oblast di Khmelnytskyi',
    'UA.10': 'Oblast di Kirovohrad',
    'UA.14': 'Oblast di Luhansk',
    'UA.15': 'Oblast di Leopoli',
    'UA.16': 'Oblast di Mykolaiv',
    'UA.17': 'Oblast di Odesa',
    'UA.18': 'Oblast di Poltava',
    'UA.19': 'Oblast di Rivne',
    'UA.21': 'Oblast di Sumy',
    'UA.22': 'Oblast di Ternopil',
    'UA.23': 'Oblast di Vinnytsia',
    'UA.24': 'Oblast di Volinia',
    'UA.25': 'Transcarpazia',
    'UA.26': 'Oblast di Zaporizhzhia',
    'UA.27': 'Oblast di Zhytomyr',
    /**
     * Third review (2026-11-22). The Gaza Strip and the West Bank as it.md §8 names them (Striscia di Gaza,
     * Cisgiordania; Israel's "Judea and Samaria Area" takes the West Bank's name, geocode.ts westBank), Gaza's towns as
     * Italian reporting writes them; the features at home GeoNames names wrongly or not at all (Reggia di Caserta, not
     * the palace's other name; Campidoglio is the hill, not its square); the seas, ranges and lakes German already
     * names; the landmarks' where lines (Isola di Pasqua, Stretto della Sonda); Belarus's cities and regions as Italian
     * writes them (Mogilev, Gomel, Grodno); regions abroad in Italian (Ninive, Bengala Occidentale, Baden-Württemberg).
     */
    'PS.GZ': 'Striscia di Gaza',
    'PS.WE': 'Cisgiordania',
    'PS:Khān Yūnis': 'Khan Yunis',
    'PS:Rafaḩ': 'Rafah',
    'PS:Jabālyā': 'Jabalia',
    'PS:Dayr al Balaḩ': 'Deir el-Balah',
    "VA:Saint Peter's Square": 'Piazza San Pietro',
    'VA:Vatican museum': 'Musei Vaticani',
    'IT:Roman Forum': 'Foro Romano',
    'IT:Trevi Fountain': 'Fontana di Trevi',
    'IT:Caserta Palace': 'Reggia di Caserta',
    'IT:Field of Miracles': 'Piazza dei Miracoli',
    'IT:Appennines': 'Appennini',
    'IT:Gulf of Genoa': 'Golfo di Genova',
    'IT:Capitoline Hill': 'Campidoglio',
    'IT:Archaeological museum of Milan': 'Museo archeologico di Milano',
    'IT:Milano Malpensa Airport': 'Aeroporto di Milano-Malpensa',
    'IT:Liberty Bridge': 'Ponte della Libertà',
    'IT:International museum and library of music': 'Museo internazionale e biblioteca della musica',
    'IT:Crotone Airport': 'Aeroporto di Crotone',
    'IT:Island Sardinia': 'Sardegna',
    'IT:Sicily island': 'Sicilia',
    'IT:Pompeii': 'Scavi di Pompei',
    'IT:Eppan': 'Appiano sulla Strada del Vino',
    ':Strait of Bonifacio': 'Bocche di Bonifacio',
    'FR:Palace of Versailles': 'Reggia di Versailles',
    'KZ:Baikonur Cosmodrome': 'Cosmodromo di Bajkonur',
    'CL:Easter Island': 'Isola di Pasqua',
    'ID:Sunda Strait': 'Stretto della Sonda',
    'IO:Chagos Archipelago': 'Arcipelago delle Chagos',
    ':Pyrenees': 'Pirenei',
    ':Carpathian Mountains': 'Carpazi',
    ':Iberian Peninsula': 'Penisola iberica',
    'ES:Iberian Peninsula': 'Penisola iberica',
    ':Barents Sea': 'Mare di Barents',
    ':Bering Sea': 'Mare di Bering',
    ':Coral Sea': 'Mar dei Coralli',
    ':East China Sea': 'Mar Cinese Orientale',
    ':Gulf of Bothnia': 'Golfo di Botnia',
    ':Gulf of Finland': 'Golfo di Finlandia',
    ':Gulf of Thailand': 'Golfo di Thailandia',
    ':Gulf of Tonkin': 'Golfo del Tonchino',
    ':Kara Sea': 'Mare di Kara',
    ':Laptev Sea': 'Mare di Laptev',
    ':Tasman Sea': 'Mar di Tasman',
    ':Wadden Sea': 'Mare dei Wadden',
    'NL:Wadden Sea': 'Mare dei Wadden',
    ':White Sea': 'Mar Bianco',
    ':Andaman Sea': 'Mare delle Andamane',
    ':Himalayas': 'Himalaya',
    'DE:Lake Constance': 'Lago di Costanza',
    'TZ:Lake Victoria': 'Lago Vittoria',
    625665: 'Mogilev',
    627907: 'Gomel',
    'BY:Hrodna': 'Grodno',
    'BY.01': 'Regione di Brest',
    'BY.02': 'Regione di Gomel',
    'BY.03': 'Regione di Grodno',
    'BY.05': 'Regione di Minsk',
    'BY.06': 'Regione di Mogilev',
    'BY.07': 'Regione di Vitebsk',
    'DE:*Baden-Wurttemberg': 'Baden-Württemberg',
    'IQ:*Nineveh': 'Ninive',
    'LY:*Banghazi': 'Bengasi',
    'IN:*West Bengal': 'Bengala Occidentale',
    'LB:*South Governorate': 'Governatorato del Sud',
    'IL:*Northern District': 'Distretto Settentrionale',
    'IL:*Central District': 'Distretto Centrale',
    'IL:*Southern District': 'Distretto Meridionale',
    'IL:*Jerusalem District': 'Distretto di Gerusalemme',
    'IL:*Haifa District': 'Distretto di Haifa',
    'IL:*Tel Aviv District': 'Distretto di Tel Aviv',
    'RU:Khabarovsk': 'Chabarovsk',
    'DE:Hameln': '',
    'YT:Mamoudzou': '',
    'IT:Ischia Porto': '',
    'DK.17': 'Hovedstaden',
    // Pre-ship review (2026-11-22): Photon's usual name for Crimea's region (it.md §8: Crimea, attributed to no state).
    'UA:*Republic of Crimea': 'Crimea',
  },
  /**
   * Ukraine's first-level names as its Constitution lists them (docs/i18n/uk.md §4.3: official names are never
   * "corrected": the city is Дніпро, the oblast still Дніпропетровська). GeoNames' own Ukrainian names capitalise
   * «Область» and call Crimea «Республіка Крим».
   */
  uk: {
    'UA.01': 'Черкаська область',
    'UA.02': 'Чернігівська область',
    'UA.03': 'Чернівецька область',
    'UA.04': 'Дніпропетровська область',
    'UA.05': 'Донецька область',
    'UA.06': 'Івано-Франківська область',
    'UA.07': 'Харківська область',
    'UA.08': 'Херсонська область',
    'UA.09': 'Хмельницька область',
    'UA.10': 'Кіровоградська область',
    'UA.11': 'Автономна Республіка Крим',
    'UA.12': 'місто Київ',
    'UA.13': 'Київська область',
    'UA.14': 'Луганська область',
    'UA.15': 'Львівська область',
    'UA.16': 'Миколаївська область',
    'UA.17': 'Одеська область',
    'UA.18': 'Полтавська область',
    'UA.19': 'Рівненська область',
    'UA.20': 'місто Севастополь',
    'UA.21': 'Сумська область',
    'UA.22': 'Тернопільська область',
    'UA.23': 'Вінницька область',
    'UA.24': 'Волинська область',
    'UA.25': 'Закарпатська область',
    'UA.26': 'Запорізька область',
    'UA.27': 'Житомирська область',
    'TR:Hagia Sophia': 'Айя-Софія',
    'IN:Taj Mahal': 'Тадж-Махал',
    'CL:Moai': 'Моаї',
    'CH:Matterhorn': 'Маттерхорн',
    'GF:Guiana Space Centre': 'Гвіанський космічний центр',
    /** Towns renamed since 2016 that GeoNames still names in Ukrainian by their Soviet names (Красний Луч, Щорс). */
    'UA:Khrustalnyi': 'Хрустальний',
    'UA:Sheptytskyi': 'Шептицький',
    'UA:Khrestivka': 'Хрестівка',
    'UA:Holubivka': 'Голубівка',
    'UA:Snovsk': 'Сновськ',
    'UA:Chystyakove': 'Чистякове',
    'UA:Khanzhonkivskyi': '',
    'RU:Yekaterinburg': 'Єкатеринбург',
    "BY:Homyel'": 'Гомель',
    /**
     * Native review (2026-11-22). Towns GeoNames still names by a former name (Ювілейне for Katerynivka,
     * Юнокомунарівськ for Bunhe, renamed in 2016) or by a neighbour's (Станично-Луганське), and towns it has no
     * Ukrainian name for, or too few people (Druzhkivka, Kadiyivka); Delhi, not Old Delhi; the Golden Gate Bridge as
     * uk.md §4.4 names it; the standard spellings where GeoNames' first is another (Сан-Франциско, Братислава,
     * Брюссель, Макао; abroad, г for ґ by Правопис §122); the capitals and large cities GeoNames has no Ukrainian name
     * for; and Chernobyl's plant.
     */
    688073: 'Бунге',
    8354605: 'Святопетрівське',
    688089: 'Катеринівка',
    692953: 'Станиця Луганська',
    695965: 'П’ятихатки',
    616743: 'Дружківка',
    692975: 'Кадіївка',
    702417: 'Люботин',
    697592: 'Сокологірськ',
    699675: 'Новоазовськ',
    1273294: 'Делі',
    5391959: 'Сан-Франциско',
    1821274: 'Макао',
    1651944: 'В’єнтьян',
    3060972: 'Братислава',
    2800866: 'Брюссель',
    2729907: 'Лонг’їр',
    618426: 'Кишинів',
    'MD:Kishinev': 'Кишинів',
    538560: 'Курськ',
    578072: 'Бєлгород',
    571476: 'Брянськ',
    479561: 'Уфа',
    1502026: 'Красноярськ',
    472045: 'Воронеж',
    542420: 'Краснодар',
    1488754: 'Тюмень',
    482283: 'Тольятті',
    629634: 'Брест',
    627904: 'Гродно',
    620127: 'Вітебськ',
    625665: 'Могильов',
    761168: 'Перемишль',
    759734: 'Ряшів',
    765876: 'Люблін',
    774558: 'Холм',
    617239: 'Тирасполь',
    618605: 'Бєльці',
    112931: 'Тегеран',
    1261481: 'Нью-Делі',
    1269843: 'Хайдарабад',
    1526273: 'Астана',
    3871336: 'Сантьяго',
    2267057: 'Лісабон',
    792680: 'Белград',
    1221874: 'Душанбе',
    3703443: 'Панама',
    3598132: 'Гватемала',
    285787: 'Кувейт',
    6691831: 'Ватикан',
    2993458: 'Монако',
    3489854: 'Кінгстон',
    2422465: 'Конакрі',
    2427123: 'Нджамена',
    373303: 'Джуба',
    3041563: 'Андорра-ла-Велья',
    3042030: 'Вадуц',
    3173435: 'Мілан',
    1853909: 'Осака',
    1848354: 'Йокогама',
    6173331: 'Ванкувер',
    2925533: 'Франкфурт-на-Майні',
    2643123: 'Манчестер',
    311046: 'Ізмір',
    360995: 'Гіза',
    'US:Golden Gate Bridge': 'Міст Золоті Ворота',
    'US:Hartsfield–Jackson Airport': 'Аеропорт Гартсфілд-Джексон',
    'US:JFK Airport': 'Аеропорт імені Джона Кеннеді',
    'FR:Charles de Gaulle Airport': 'Аеропорт Шарль-де-Голль',
    'GB:Wembley Stadium': 'Стадіон «Вемблі»',
    'US:Lake Tahoe': 'Озеро Тахо',
    'UA:Chernobyl': 'Чорнобильська АЕС',
    ':Sea of Azov': 'Азовське море',
    'AE:Burj Khalifa': 'Бурдж-Халіфа',
    'CN:Great Wall of China': 'Великий китайський мур',
    'CN:Forbidden City': 'Заборонене місто',
    'PE:Machu Picchu': 'Мачу-Пікчу',
    'BR:Christ the Redeemer': 'Статуя Христа-Спасителя',
    'ES:Sagrada Família': 'Саграда Фамілія',
    'GR:Acropolis': 'Акрополь',
    'IT:Leaning Tower of Pisa': 'Пізанська вежа',
    'DE:Brandenburg Gate': 'Бранденбурзькі ворота',
    'KZ:Baikonur Cosmodrome': 'Космодром Байконур',
    'RU:Lake Baikal': 'Байкал',
    'NP:Mount Everest': 'Еверест',
    'AU:Ayers Rock': 'Улуру',
    ':Laptev Sea': 'Море Лаптєвих',
    /**
     * Second pass over the native review (2026-11-22): the towns of 10–16k a namesake's junk name hid (Миколаївка,
     * Слобожанське, Гірник, Кальміуське: one name for every town so spelt), the best-known districts, the regions of
     * Belarus, Poland and Russia GeoNames has no Ukrainian name for, OpenStreetMap's spellings of two oblasts,
     * Washington, D.C. as a where line writes it, Chornobyl's plant as the geocoders name it, and Uluru.
     */
    'UA:Mykolaivka': 'Миколаївка',
    // The districts of Kyiv, Kharkiv, Lviv and Odesa readers know by name, which a pin in the city is named by (the
    // table names no section of a city by rule: GeoNames' Ukrainian names for them are a namesake's as often as not).
    'UA:Obolon': 'Оболонь',
    'UA:Podil': 'Поділ',
    'UA:Pechersk': 'Печерськ',
    'UA:Vyhurivshchyna-Troyeshchyna': 'Вигурівщина-Троєщина',
    'UA:Darnytsya': 'Дарниця',
    'UA:Pozniaky': 'Позняки',
    'UA:Teremky': 'Теремки',
    'UA:Lukyanivka': 'Лук’янівка',
    'UA:Shulyavka': 'Шулявка',
    'UA:Kurenivka': 'Куренівка',
    'UA:Rusanivka': 'Русанівка',
    'UA:Svyatoshyn': 'Святошин',
    'UA:Holosiyiv': 'Голосіїв',
    'UA:Vynohradar': 'Виноградар',
    'UA:Saltivka': 'Салтівка',
    'UA:Sykhiv': 'Сихів',
    'UA:Moldavanka': 'Молдаванка',
    'UA:Slobozhanske': 'Слобожанське',
    'UA:Hirnyk': 'Гірник',
    "UA:Kal'mius'ke": 'Кальміуське',
    'UA:Chornobyl Nuclear Power Plant': 'Чорнобильська АЕС',
    'UA:*Zaporizhia Oblast': 'Запорізька область',
    'UA:*Vinnytsya Oblast': 'Вінницька область',
    'AU:Uluru': 'Улуру',
    'US:Washington, D.C.': 'Вашингтон',
    'BY.01': 'Брестська область',
    'BY.03': 'Гродненська область',
    'BY.06': 'Могильовська область',
    'PL.73': 'Куявсько-Поморське воєводство',
    'PL.78': 'Мазовецьке воєводство',
    'PL.79': 'Опольське воєводство',
    'PL.81': 'Підляське воєводство',
    'PL.82': 'Поморське воєводство',
    'PL.83': 'Сілезьке воєводство',
    'PL.84': 'Свентокшиське воєводство',
    'RU.29': 'Кемеровська область',
    'RU.32': 'Ханти-Мансійський автономний округ',
    'RU.66': 'Санкт-Петербург',
    'RU.68': 'Північна Осетія',
    'RU.80': 'Удмуртія',
    'RU.91': 'Красноярський край',
    'RU.92': 'Камчатський край',
    /**
     * Third review (2026-11-22). Gaza, the Gaza Strip and the West Bank as uk.md §8 names them, and Gaza's towns; the
     * geocoders' "Republic of Crimea"; Gomel's region (GeoNames marks the right spelling historic); any kremlin is
     * Кремль (the English key reaches Tula's too); the airports without «Міжнародний», as the others; the cities the
     * thresholds miss that Ukrainian readers search (Venice is §4.4's Венеція); Ukraine's own features, the seas and
     * the largest districts of Kyiv and Kharkiv, by hand (GeoNames' names for sections are often a namesake's); the
     * state of Washington as a state, and New York's as one on its own row.
     */
    'PS:Gaza': 'Газа',
    'PS.GZ': 'Сектор Гази',
    'PS.WE': 'Західний берег',
    'PS:Khān Yūnis': 'Хан-Юніс',
    'PS:Rafaḩ': 'Рафах',
    'PS:Jabālyā': 'Джабалія',
    294801: 'Хайфа',
    'UA:*Republic of Crimea': 'Автономна Республіка Крим',
    'BY.02': 'Гомельська область',
    'RU:Kremlin': 'Кремль',
    'AE:Dubai International Airport': 'Аеропорт Дубай',
    'CA:Pearson Airport': 'Аеропорт Торонто-Пірсон',
    'PL:*Lower Silesia': 'Нижньосілезьке воєводство',
    'US.WA': 'Штат Вашингтон',
    'US:#New York': 'Штат Нью-Йорк',
    3164603: 'Венеція',
    3165524: 'Турин',
    2660646: 'Женева',
    5809844: 'Сіетл',
    5506956: 'Лас-Вегас',
    4164138: 'Маямі',
    554234: 'Калінінград',
    491422: 'Сочі',
    518255: 'Новоросійськ',
    1856057: 'Нагоя',
    2825297: 'Штутгарт',
    2934246: 'Дюссельдорф',
    'SA:Mecca': 'Мекка',
    'OM:Strait of Hormuz': 'Ормузька протока',
    'AU:Great Barrier Reef': 'Великий Бар’єрний риф',
    'UA:Snake Island': 'Острів Зміїний',
    'UA:Hoverla': 'Говерла',
    'UA:Babi Yar': 'Бабин Яр',
    'UA:Ostriv Khortytsia': 'Хортиця',
    'UA:Svitiaz Lake': 'Світязь',
    'UA:Kerch Strait': 'Керченська протока',
    'UA:Crimean Bridge': 'Кримський міст',
    'UA:Trukhaniv Island': 'Труханів острів',
    'UA:Chonhar Peninsula': 'Чонгар',
    'UA:Boryspil Airport': 'Аеропорт Бориспіль',
    'UA:Odesa International Airport': 'Аеропорт Одеса',
    'UA:Kharkiv International Airport': 'Аеропорт Харків',
    ':Persian Gulf': 'Перська затока',
    ':English Channel': 'Ла-Манш',
    'GB:English Channel': 'Ла-Манш',
    ':Gulf of Finland': 'Фінська затока',
    ':Gulf of Aden': 'Аденська затока',
    ':Strait of Gibraltar': 'Гібралтарська протока',
    ':Bay of Biscay': 'Біскайська затока',
    ':Gulf of Thailand': 'Сіамська затока',
    ':Gulf of Tonkin': 'Тонкінська затока',
    ':Gulf of Oman': 'Оманська затока',
    'UA:Dniprovskyi': 'Дніпровський район',
    'UA:Saltivskyi': 'Салтівський район',
    'UA:Shevchenkivskyi': 'Шевченківський район',
    'UA:Borshchahivka': 'Борщагівка',
    'UA:Kholodna Hora': 'Холодна Гора',
    'UA:Oleksiyivka': 'Олексіївка',
    'UA:Nyvky': 'Нивки',
    'UA:Solomyanka': 'Солом’янка',
    'UA:Syrets': 'Сирець',
    'UA:Novyi Lviv': 'Новий Львів',
  },
  /**
   * Russian: Ukraine's oblasts by their standard Russian names (docs/i18n/ru.md §8: Днепропетровская, Кировоградская;
   * Crimea is Крым, in Ukraine, with no «Республика»: that is the occupying administration's name), and Sevastopol.
   */
  ru: {
    'UA.01': 'Черкасская область',
    'UA.02': 'Черниговская область',
    'UA.03': 'Черновицкая область',
    'UA.04': 'Днепропетровская область',
    'UA.05': 'Донецкая область',
    'UA.06': 'Ивано-Франковская область',
    'UA.07': 'Харьковская область',
    'UA.08': 'Херсонская область',
    'UA.09': 'Хмельницкая область',
    'UA.10': 'Кировоградская область',
    'UA.11': 'Крым',
    'UA.12': 'Киев',
    'UA.13': 'Киевская область',
    'UA.14': 'Луганская область',
    'UA.15': 'Львовская область',
    'UA.16': 'Николаевская область',
    'UA.17': 'Одесская область',
    'UA.18': 'Полтавская область',
    'UA.19': 'Ровенская область',
    'UA.20': 'Севастополь',
    'UA.21': 'Сумская область',
    'UA.22': 'Тернопольская область',
    'UA.23': 'Винницкая область',
    'UA.24': 'Волынская область',
    'UA.25': 'Закарпатская область',
    'UA.26': 'Запорожская область',
    'UA.27': 'Житомирская область',
    /** Brasília is Бразилиа (GeoNames gives it the country's name, Бразилия). */
    3469058: 'Бразилиа',
    'SA:Mecca': 'Мекка',
    'CL:Moai': 'Моаи',
    'TR:Hagia Sophia': 'Айя-София',
    'GF:Guiana Space Centre': 'Гвианский космический центр',
    'US:Vandenberg Space Force Base': 'База Ванденберг',
    'US:Yosemite Valley': 'Долина Йосемити',
    'US:Death Valley': 'Долина Смерти',
    'US:LAX': '',
    'US:Golden Gate Park': '',
    'PK:K2': '',
    'OM:Strait of Hormuz': 'Ормузский пролив',
    /** Regions in full, where GeoNames abbreviates or uses a colloquial name (Ставрополье, Ямало-Ненецкий АО). */
    'RU.70': 'Ставропольский край',
    'RU.29': 'Кемеровская область',
    'RU.64': 'Сахалинская область',
    'RU.87': 'Ямало-Ненецкий автономный округ',
    'RU.89': 'Еврейская автономная область',
    'RU.50': 'Ненецкий автономный округ',
    'RU.15': 'Чукотский автономный округ',
    /**
     * Native review (2026-11-22). Murmansk (GeoNames marks its only Russian name colloquial), Kherson and Bakhmut
     * (below the 100,000 the rule takes in Ukraine), Batken; Puebla, not its ceremonial name; ё where Russian writes it
     * (Могилёвская); misspelt capitals (Гитеге, Пагопаго); the republics by their usual short names, Коми with its
     * class word; the forms Russian readers use (Анталья, Калькутта, Алеппо, Кремниевая долина); short airport names;
     * the Golden Gate Bridge and Chernobyl's plant as ru.md §4.3 names them; and the places readers know in Russian
     * that GeoNames names but the thresholds miss (Rules.include).
     */
    524305: 'Мурманск',
    706448: 'Херсон',
    713174: 'Бахмут',
    1528735: 'Баткен',
    'KG:Issyk-Kul': 'Иссык-Куль',
    3521081: 'Пуэбла',
    'BY.06': 'Могилёвская область',
    9983718: 'Черёмушки',
    323777: 'Анталья',
    426272: 'Гитега',
    4795467: 'Шарлотта-Амалия',
    5881576: 'Паго-Паго',
    3579925: 'Сент-Джорджес',
    'RU.27': 'Карачаево-Черкесия',
    'RU.08': 'Башкортостан',
    'RU.11': 'Бурятия',
    'RU.79': 'Тыва',
    'RU.34': 'Республика Коми',
    1275004: 'Калькутта',
    170063: 'Алеппо',
    1521368: 'Байконур',
    'NZ:Milford Sound': 'Милфорд-Саунд',
    'US:Silicon Valley': 'Кремниевая долина',
    'US:Golden Gate Bridge': 'Мост Золотые Ворота',
    'US:JFK Airport': 'Аэропорт имени Кеннеди',
    'US:Hartsfield–Jackson Airport': 'Аэропорт Хартсфилд-Джексон',
    "US:O'Hare Airport": 'Аэропорт О’Хара',
    'CA:Pearson Airport': 'Аэропорт Пирсон',
    'US:Lake Tahoe': 'Озеро Тахо',
    'US:Mount Rainier': 'Гора Рейнир',
    'GB:Wembley Stadium': 'Стадион Уэмбли',
    'SG:Changi Airport': 'Аэропорт Чанги',
    'AQ:McMurdo Station': 'Станция Мак-Мердо',
    'AR:Iguazu Falls': 'Водопады Игуасу',
    'UA:Chernobyl': 'Чернобыльская АЭС',
    'KZ:Baikonur Cosmodrome': 'Космодром Байконур',
    'MD:Kishinev': 'Кишинёв',
    'AE:Burj Khalifa': 'Бурдж-Халифа',
    'CN:Great Wall of China': 'Великая Китайская стена',
    'CN:Forbidden City': 'Запретный город',
    'BR:Christ the Redeemer': 'Статуя Христа-Искупителя',
    'GR:Acropolis': 'Акрополь',
    'DE:Brandenburg Gate': 'Бранденбургские ворота',
    'NP:Mount Everest': 'Эверест',
    'JP:Mount Fuji': 'Фудзи',
    'US:Area 51': 'Зона 51',
    'EG:Pyramids of Giza': 'Пирамиды Гизы',
    'AU:Ayers Rock': 'Улуру',
    'US:Kennedy Space Center': 'Космический центр Кеннеди',
    'PA:Panama Canal': 'Панамский канал',
    'EG:Suez Canal': 'Суэцкий канал',
    'IT:Mount Vesuvius': 'Везувий',
    'IT:Vesuvius': 'Везувий',
    'ZA:Table Mountain': 'Столовая гора',
    'KH:Angkor Wat': 'Ангкор-Ват',
    ':Gulf of Tonkin': 'Тонкинский залив',
    'RU.63': 'Якутия',
    ':English Channel': 'Ла-Манш',
    /**
     * Second pass over the native review (2026-11-22): the regional seats under the size rule (Анадырь, Нарьян-Мар,
     * Магас), Moscow, Almaty and Osh as regions, Mecklenburg-Vorpommern, OpenStreetMap's spellings of the republics
     * and krais and of three regions of Belarus and Kazakhstan (what Photon writes in a where line), Washington, D.C.
     * as a landmark's where line writes it, and Uluru.
     */
    'RU:Anadyr': 'Анадырь',
    "RU:Nar'yan-Mar": 'Нарьян-Мар',
    'RU:Magas': 'Магас',
    'RU.48': 'Москва',
    'KZ.02': 'Алматы',
    'KG.10': 'Ош',
    'DE.12': 'Мекленбург — Передняя Померания',
    'AU:Uluru': 'Улуру',
    'US:Washington, D.C.': 'Вашингтон',
    'RU:*Republic of Tatarstan': 'Татарстан',
    'RU:*Republic of Bashkortostan': 'Башкортостан',
    'RU:*Republic of Mordovia': 'Мордовия',
    'RU:*Primorsky Krai': 'Приморский край',
    'RU:*Stavropol Krai': 'Ставропольский край',
    'RU:*Zabaykalsky Krai': 'Забайкальский край',
    'RU:*Republic of Dagestan': 'Дагестан',
    'RU:*Udmurt Republic': 'Удмуртия',
    'RU:*Republic of Buryatia': 'Бурятия',
    'RU:*Sakha Republic': 'Якутия',
    'RU:*Republic of Ingushetia': 'Ингушетия',
    'RU:*Kabardino-Balkarian Republic': 'Кабардино-Балкария',
    'RU:*Karachay-Cherkess Republic': 'Карачаево-Черкесия',
    'RU:*Republic of Adygea': 'Адыгея',
    'RU:*Republic of Kalmykia': 'Калмыкия',
    'RU:*Republic of Khakassia': 'Хакасия',
    'RU:*Mari El Republic': 'Марий Эл',
    'RU:*Khanty-Mansi Autonomous Okrug': 'Ханты-Мансийский автономный округ',
    'BY:*Hrodna Region': 'Гродненская область',
    'BY:*Grodno Region': 'Гродненская область',
    'KZ:*Jetisu Region': 'Жетысуская область',
    /**
     * Third review (2026-11-22). The geocoders' "Republic of Crimea" is Крым (ru.md §8), and Crimea's resort towns; the
     * Ukrainian towns the news names whose GeoNames populations are stale (Краматорск, Славянск, Буча, Ирпень); the
     * tourist places, the best-known cities of Europe and the US, and the home towns under 100,000 Russian readers
     * search; the world's best-known landmarks; Gaza, the Gaza Strip and the West Bank; the state of Washington as
     * ru.md §4.3 writes it, and New York's as a state on its own row; Dubai's airport as short as the others, the
     * Gateway Arch as ru.wikipedia names it; two home regions as Open-Meteo spells them.
     */
    'UA:*Republic of Crimea': 'Крым',
    713513: 'Алушта',
    692315: 'Судак',
    709161: 'Феодосия',
    697124: 'Коктебель',
    712969: 'Бахчисарай',
    704508: 'Краматорск',
    693468: 'Славянск',
    702972: 'Лисичанск',
    704422: 'Покровск',
    711350: 'Буча',
    707565: 'Ирпень',
    707292: 'Изюм',
    349340: 'Шарм-эль-Шейх',
    324190: 'Аланья',
    1572151: 'Нячанг',
    1645528: 'Денпасар',
    2643123: 'Манчестер',
    2644210: 'Ливерпуль',
    2996944: 'Лион',
    2990440: 'Ницца',
    2825297: 'Штутгарт',
    2934246: 'Дюссельдорф',
    2910831: 'Ганновер',
    2861650: 'Нюрнберг',
    2944388: 'Бремен',
    2747891: 'Роттердам',
    2514256: 'Малага',
    2510911: 'Севилья',
    5110302: 'Бруклин',
    5125771: 'Манхэттен',
    470546: 'Выборг',
    582182: 'Анапа',
    510291: 'Петергоф',
    'ES:Sagrada Família': 'Саграда Фамилия',
    'MX:Chichén Itzá': 'Чичен-Ица',
    'MX:Teotihuacan': 'Теотиуакан',
    'AU:Great Barrier Reef': 'Большой Барьерный риф',
    'VN:Ha Long Bay': 'Бухта Халонг',
    'EC:Galápagos Islands': 'Галапагосские острова',
    'US:Yellowstone': 'Йеллоустон',
    'US:Mount Rushmore': 'Гора Рашмор',
    'US:Mauna Kea': 'Мауна-Кеа',
    'TR:Cappadocia': 'Каппадокия',
    'BR:Amazon River': 'Амазонка',
    'BR:Maracanã': 'Маракана',
    'MY:Petronas Towers': 'Башни Петронас',
    'ID:Borobudur': 'Боробудур',
    'EG:Great Sphinx of Giza': 'Большой сфинкс',
    'EG:Valley of the Kings': 'Долина царей',
    'NL:Schiphol': 'Схипхол',
    'FR:Charles de Gaulle Airport': 'Аэропорт Шарль-де-Голль',
    'CU:Guantanamo Bay': 'Гуантанамо',
    'JP:Fukushima Daiichi': 'АЭС Фукусима-1',
    'PH:Mount Pinatubo': 'Пинатубо',
    'IS:Eyjafjallajökull': 'Эйяфьядлайёкюдль',
    'BO:Salar de Uyuni': 'Солончак Уюни',
    'VE:Angel Falls': 'Анхель',
    'PS:Gaza': 'Газа',
    'PS.GZ': 'Сектор Газа',
    'PS.WE': 'Западный берег реки Иордан',
    'US.WA': 'Штат Вашингтон',
    'US:#New York': 'Штат Нью-Йорк',
    'AE:Dubai International Airport': 'Аэропорт Дубай',
    'US:Gateway Arch': 'Ворота на Запад',
    'RU:*Khanty-Mansiysk Autonomous Okrug – Ugra': 'Ханты-Мансийский автономный округ — Югра',
    'RU:*Sakha (Yakutia)': 'Якутия',
  },
  /**
   * Vietnamese: the 34 provinces and cities since the 2025 merger by their Vietnamese names (GeoNames has few, and
   * writes the new ones in ASCII), bare as a where line writes them (Nghệ An, not Tỉnh Nghệ An); Ho Chi Minh City by
   * its official name, as the task and docs/i18n/vi.md write it. The East Sea and its islands by their Vietnamese names
   * on Vietnamese pages, display only, as Korean shows 동해 (vi.md §8; approved by the owner, 2026-11-22): countryless,
   * and in the countries the data files them under.
   */
  vi: {
    'VN.01': 'Hà Nội',
    'VN.04': 'Cao Bằng',
    'VN.08': 'Tuyên Quang',
    'VN.11': 'Điện Biên',
    'VN.12': 'Lai Châu',
    'VN.14': 'Sơn La',
    'VN.15': 'Lào Cai',
    'VN.19': 'Thái Nguyên',
    'VN.20': 'Lạng Sơn',
    'VN.22': 'Quảng Ninh',
    'VN.24': 'Bắc Ninh',
    'VN.25': 'Phú Thọ',
    'VN.31': 'Hải Phòng',
    'VN.33': 'Hưng Yên',
    'VN.37': 'Ninh Bình',
    'VN.38': 'Thanh Hóa',
    'VN.40': 'Nghệ An',
    'VN.42': 'Hà Tĩnh',
    'VN.44': 'Quảng Trị',
    'VN.46': 'Huế',
    'VN.48': 'Đà Nẵng',
    'VN.51': 'Quảng Ngãi',
    'VN.52': 'Gia Lai',
    'VN.56': 'Khánh Hòa',
    'VN.66': 'Đắk Lắk',
    'VN.68': 'Lâm Đồng',
    'VN.75': 'Đồng Nai',
    'VN.79': 'Thành phố Hồ Chí Minh',
    'VN.80': 'Tây Ninh',
    'VN.82': 'Đồng Tháp',
    'VN.86': 'Vĩnh Long',
    'VN.91': 'An Giang',
    'VN.92': 'Cần Thơ',
    'VN.96': 'Cà Mau',
    1566083: 'Thành phố Hồ Chí Minh',
    ':South China Sea': 'Biển Đông',
    'VN:South China Sea': 'Biển Đông',
    'TH:South China Sea': 'Biển Đông',
    ':Paracel Islands': 'Quần đảo Hoàng Sa',
    ':Xisha Islands': 'Quần đảo Hoàng Sa',
    ':Spratly Islands': 'Quần đảo Trường Sa',
    ':Nansha Islands': 'Quần đảo Trường Sa',
    'FR:Mont Blanc': '',
    /** Modern Vietnamese writes these as their own names (Busan, Incheon, Pleiku), not as old Sino-Vietnamese ones. */
    'KR:Busan': '',
    'KR:Incheon': '',
    'KR:Daegu': '',
    'VN:Pleiku': '',
    'NZ:Lower Hutt': '',
    'US:Palm Desert': '',
    'KH:*Kampot': '',
    /**
     * Native review (2026-11-22). The Paracels as the offline list names them (Xisha Islands(Paracel Islands)), the
     * islands and reefs of both archipelagos by their Vietnamese names wherever the data files them (display only, as
     * Biển Đông: vi.md §8, approved by the owner on 2026-11-22; the country GeoNames gives some, China, is still the
     * owner's to decide), the country's own features, airports and sights in Vietnamese, Ho Chi Minh City's districts
     * by number, GeoNames' misspellings at home, the Chinese provinces and towns GeoNames names in pinyin, and
     * namesakes that took another place's name (Longshan as Liêu Nguyên).
     */
    ':Xisha Islands(Paracel Islands)': 'Quần đảo Hoàng Sa',
    'CN:Johnson Reef': 'Đá Gạc Ma',
    'CN:Meiji Reef': 'Đá Vành Khăn',
    'CN:Mischief Reef': 'Đá Vành Khăn',
    'CN:Sand Cay': 'Đảo Sơn Ca',
    'CN:Triton Island': 'Đảo Tri Tôn',
    'CN:Tree Island': 'Đảo Cây',
    'CN:Rocky Island': 'Đảo Đá',
    ':Woody Island': 'Đảo Phú Lâm',
    'CN:Yongxing Island Airport': 'Sân bay đảo Phú Lâm',
    'CN:Taiping Island Airport': 'Sân bay đảo Ba Bình',
    'CN:Walker Shoal': 'Bãi Walker',
    'CN:North Danger Reef': 'Cụm Song Tử',
    'VN:Pattle Island': 'Đảo Hoàng Sa',
    'VN:Spratly Island': 'Đảo Trường Sa',
    'VN:Amboyna Cay': 'Đảo An Bang',
    'VN:Namyit Island': 'Đảo Nam Yết',
    ':Sin Cowe Island': 'Đảo Sinh Tồn',
    ':Southwest Cay': 'Đảo Song Tử Tây',
    'VN:Pulau Kondor Islands': 'Côn Đảo',
    'VN:Ha Long Bay': 'Vịnh Hạ Long',
    'VN:Hạ Long Bay': 'Vịnh Hạ Long',
    ':Gulf of Tonkin': 'Vịnh Bắc Bộ',
    ':Gulf of Thailand': 'Vịnh Thái Lan',
    'VN:Mekong Delta': 'Đồng bằng sông Cửu Long',
    7304197: 'Mũi Né',
    'VN:Noi Bai International Airport': 'Sân bay quốc tế Nội Bài',
    'VN:Tan Son Nhat International Airport': 'Sân bay quốc tế Tân Sơn Nhất',
    'VN:Da Nang International Airport': 'Sân bay quốc tế Đà Nẵng',
    'VN:Ho Chi Minh Mausoleum': 'Lăng Chủ tịch Hồ Chí Minh',
    'VN:Turtle Tower': 'Tháp Rùa',
    'VN:Long Bien Bridge': 'Cầu Long Biên',
    'VN:Quận Một': 'Quận 1',
    'VN:Quận Hai': 'Quận 2',
    'VN:Quận Ba': 'Quận 3',
    'VN:Quận Bốn': 'Quận 4',
    'VN:Quận Năm': 'Quận 5',
    'VN:Quận Sáu': 'Quận 6',
    'VN:Quận Bảy': 'Quận 7',
    'VN:Quận Chín': 'Quận 9',
    'VN:Quận Mười': 'Quận 10',
    'VN:Quận Mười Một': 'Quận 11',
    'VN:Đưc Trọng': 'Đức Trọng',
    1587048: 'Ea Na',
    1590428: 'Ea Hiao',
    'CN:Longshan': '',
    1810821: 'Phúc Châu',
    'CN.10': 'Hà Bắc',
    'CN.09': 'Hà Nam',
    'CN.01': 'An Huy',
    'CN.15': 'Cam Túc',
    'CN.13': 'Tân Cương',
    'CN.21': 'Ninh Hạ',
    'CN.33': 'Trùng Khánh',
    1673820: 'Cao Hùng',
    'TW.02': 'Cao Hùng',
    'GB.ENG': 'Anh',
    'LA.24': 'Viêng Chăn',
    1651944: 'Viêng Chăn',
    'US:Central Park': '',
    1822214: '',
    3067696: 'Praha',
    'US.SC': 'Nam Carolina',
    'US.SD': 'Nam Dakota',
    'UA:Kyiv': '',
    'US:Denali': '',
    'MO:Macau': '',
    'MO:Macao': '',
    'GB:Newcastle upon Tyne': '',
    'US:Golden Gate Park': '',
    /**
     * Second pass over the native review (2026-11-22): Itu Aba (Đảo Ba Bình) as the offline list names it, the regions
     * named like their cities (Bắc Kinh, Thượng Hải, Thiên Tân, Phnôm Pênh), Taiwan's two, and the seas GeoNames has no
     * Vietnamese name for; Taishan and Fuyang are two cities each in China with one English name, so neither is named
     * (a search still finds the larger by its name, ALIASES).
     */
    ':Itu Aba Island': 'Đảo Ba Bình',
    'CN.22': 'Bắc Kinh',
    'CN.23': 'Thượng Hải',
    'CN.28': 'Thiên Tân',
    'KH.22': 'Phnôm Pênh',
    'TW.01': 'Phúc Kiến',
    'TW.04': 'Đài Loan',
    'CN:Taishan': '',
    'CN:Fuyang': '',
    ':Mediterranean Sea': 'Địa Trung Hải',
    ':Red Sea': 'Biển Đỏ',
    ':East China Sea': 'Biển Hoa Đông',
    ':Arctic Ocean': 'Bắc Băng Dương',
    ':Southern Ocean': 'Nam Đại Dương',
    ':Andaman Sea': 'Biển Andaman',
    ':Persian Gulf': 'Vịnh Ba Tư',
    ':Arabian Sea': 'Biển Ả Rập',
    ':Caspian Sea': 'Biển Caspi',
    ':Sea of Japan': 'Biển Nhật Bản',
    ':North Sea': 'Biển Bắc',
    ':Baltic Sea': 'Biển Baltic',
    ':Gulf of Mexico': 'Vịnh Mexico',
    /**
     * Third review (2026-11-22). Yagong Dao is Đảo Ba Ba (Đảo Quang Ảnh is Money Island, 23 km off); the reefs and
     * islands of the archipelagos take their Vietnamese names (vi.md §8: GeoNames' where it has them, the usual names
     * otherwise); the features at home the offline list shows in English or half in English (Ba Bể Lake); Laos's and
     * Cambodia's provinces without the English "Province" (Lào and Campuchia are in the regions abroad); Changsha,
     * whose namesake in Guangdong is written with the same characters; the Tyrrhenian Sea as the press writes it; Phnom
     * Penh one way, the city's.
     */
    ':Yagong Dao': 'Đảo Ba Ba',
    ':Robert Island': 'Đảo Hữu Nhật',
    ':Bombay Reef': 'Đá Bông Bay',
    ':Loaita Island': 'Đảo Loại Ta',
    ':Cornwallis South Reef': 'Đá Núi Le',
    ':Commodore Reef': 'Đá Công Đo',
    ':Half Moon Shoal': 'Bãi Trăng Khuyết',
    ':Hughes Reef': 'Đá Tư Nghĩa',
    'MY:Swallow Reef': 'Đá Hoa Lau',
    ':Cuarteron Reef': 'Đá Châu Viên',
    ':Ardasier Reef': 'Đá Kiệu Ngựa',
    ':Mariveles Reef': 'Đá Kỳ Vân',
    ':Ladd Reef': 'Đá Lát',
    ':Erica Reef': 'Đá Én Ca',
    ':Collins Reef': 'Đá Cô Lin',
    ':Gaven Reefs': 'Đá Ga Ven',
    ':Tizard Bank': 'Cụm Nam Yết',
    'PH:Thitu Island': 'Đảo Thị Tứ',
    ':Northeast Cay': 'Đảo Song Tử Đông',
    ':Flat Island': 'Đảo Bình Nguyên',
    ':Irving Reef': 'Đá Cá Nhám',
    ':Lankiam Cay': 'Đảo Panata',
    ':Investigator Shoal': 'Bãi Thám Hiểm',
    'VN:Nanshan Island': 'Đảo Vĩnh Viễn',
    'VN:Cam Ranh International Airport': 'Sân bay quốc tế Cam Ranh',
    'VN:Can Tho International Airport': 'Sân bay quốc tế Cần Thơ',
    'VN:Phu Quoc International Airport': 'Sân bay quốc tế Phú Quốc',
    'VN:Cat Bi International Airport': 'Sân bay quốc tế Cát Bi',
    'VN:Phu Quoc Island': 'Đảo Phú Quốc',
    'VN:Ba Bể Lake': 'Hồ Ba Bể',
    'VN:Trúc Bạch Lake': 'Hồ Trúc Bạch',
    'VN:Bạch Long Vĩ Island': 'Đảo Bạch Long Vĩ',
    'VN:Côn Sơn Island': 'Đảo Côn Sơn',
    'VN:Cat Ba Island': 'Đảo Cát Bà',
    'VN:Temple of Literature': 'Văn Miếu – Quốc Tử Giám',
    'VN:Phong Nha-Ke Bang National Park': 'Vườn quốc gia Phong Nha – Kẻ Bàng',
    'VN:Presidential Palace, Hanoi': 'Phủ Chủ tịch',
    'VN:Hoa Binh Dam': 'Thủy điện Hòa Bình',
    'VN:Vietnam Museum of Ethnology': 'Bảo tàng Dân tộc học Việt Nam',
    'VN:Ngok Linh': 'Ngọc Linh',
    'VN:Hoan Kiem Lake': 'Hồ Hoàn Kiếm',
    'VN:Tra Que Vegetable Village': 'Làng rau Trà Quế',
    'LA:*Champasak Province': 'Chămpasắc',
    'LA:*Savannakhet Province': 'Savannakhet',
    'LA:*Khammouane Province': 'Khăm Muộn',
    'LA:*Luang Prabang Province': 'Luông Pha Băng',
    'LA:*Salavan Province': 'Salavan',
    'KH:*Kampong Speu Province': 'Kampong Speu',
    'KH:*Phnom Penh': '',
    1815577: 'Trường Sa',
    ':Tyrrhenian Sea': 'Biển Tyrrhenian',
    /**
     * Pre-ship review (2026-11-22). The time-lapse's war zones as vi.md §8 names them: the Gaza Strip and the West Bank
     * (Gaza, Kyiv, Kharkiv and Odesa keep their own names, and Ukraine and Lebanon are countries, which the browser
     * names), and Crimea as Crimea under each of the geocoders' names for it (Photon's "Republic of Crimea" most often;
     * GeoNames' Cộng hòa Tự trị Krym is the qualifier vi.md rules out).
     */
    'PS.GZ': 'Dải Gaza',
    'PS.WE': 'Bờ Tây',
    'UA.11': 'Crimea',
    'UA:*Autonomous Republic of Crimea': 'Crimea',
    'UA:*Republic of Crimea': 'Crimea',
  },
  /**
   * Persian: Delhi is دهلی (GeoNames' first Persian name for it is Old Delhi), Gorgan گرگان; the Persian Gulf is
   * خلیج فارس wherever the data names it, by either name (fa.md §8.4: never any other name).
   */
  fa: {
    1273294: 'دهلی',
    132892: 'گرگان',
    ':Persian Gulf': 'خلیج فارس',
    ':Arabian Gulf': 'خلیج فارس',
    'SA:Mecca': 'مکه',
    'CL:Moai': 'موآی',
    /**
     * Iranian towns GeoNames names in Persian by something else: a quarantine, a construction site, a castle, a former
     * name (قرنطینۀ کمال آباد, محل احداث شهرک مسکونی پرند, قلعۀ مریوان, اشرف), or misspelt (امروجان for Borujen).
     */
    'IR:Kamālshahr': 'کمال\u200cشهر',
    'IR:Marīvān': 'مریوان',
    'IR:Shahr-e Ṣadrā': 'صدرا',
    'IR:Pardīs': 'پردیس',
    'IR:Parand': 'پرند',
    'IR:Behshahr': 'بهشهر',
    'IR:Bāqershahr': 'باقرشهر',
    'IR:Meshkīn Dasht': 'مشکین\u200cدشت',
    'IR:Ṣāleḥīeh': 'صالحیه',
    'IR:Borūjen': 'بروجن',
    'IR:Dehdasht': 'دهدشت',
    'IR:Şabbāshahr': 'صباشهر',
    'IR:Borāzjān': 'برازجان',
    'IR:Mehestan': 'مهستان',
    'IR:Tūyserkān': 'تویسرکان',
    'IR:Būmahen': 'بومهن',
    'AF:Ghazni': 'غزنی',
    /**
     * Native review (2026-11-22). Lviv by its Ukrainian-based name (fa.md §8.9), Bombay and Casablanca as Persian
     * writes them, Shahr-e Qods by its full name (bare قدس reads as Jerusalem), Iranian towns by their official
     * spellings and half-spaces, Afghan and Tajik names in Dari and Tajik Persian, misspelt or cut capitals
     * (مونته‌ویدئ), and the capitals and cities Persian readers know that GeoNames has no Persian name for, or the
     * thresholds miss.
     */
    702550: 'لویو',
    1275339: 'بمبئی',
    2553604: 'کازابلانکا',
    120292: 'شهر قدس',
    115770: 'شهرکرد',
    143122: 'آران و بیدگل',
    144038: 'علی‌آباد کتول',
    8521444: 'بندر امام خمینی',
    141653: 'بندر ترکمن',
    136014: 'دوگنبدان',
    13405749: 'نسیم‌شهر',
    13562246: 'باغستان',
    143073: 'اردکان',
    'IR:Shahr-e Bābak': 'شهربابک',
    'AF.24': 'کندز',
    1147540: 'بغلان',
    'AF.39': 'ارزگان',
    'TJ.01': 'کوهستان بدخشان',
    1221194: 'کولاب',
    1790630: 'شی‌آن',
    2935022: 'درسدن',
    3441575: 'مونته‌ویدئو',
    3060972: 'براتیسلاوا',
    3378644: 'جورج‌تاون',
    71137: 'صنعا',
    1835329: 'دائگو',
    1819729: 'هنگ‌کنگ',
    'PK:K2': '',
    'US:Central Park': 'سنترال پارک',
    'OM:Strait of Hormuz': 'تنگهٔ هرمز',
    'US:Statue of Liberty': 'مجسمهٔ آزادی',
    'US:Silicon Valley': 'درهٔ سیلیکون',
    'US:Lake Tahoe': 'دریاچهٔ تاهو',
    'AU:Sydney Opera House': 'خانهٔ اپرای سیدنی',
    'KZ:Aral Sea': 'دریاچهٔ آرال',
    'IO:Diego Garcia': 'جزیرهٔ دیه‌گو گارسیا',
    'US:Half Dome': 'هاف دوم',
    'FR:Charles de Gaulle Airport': 'فرودگاه شارل دوگل',
    'US:LAX': 'فرودگاه بین‌المللی لس‌آنجلس',
    706483: 'خارکیف',
    709930: 'دنیپرو',
    4140963: 'واشینگتن',
    1261481: 'دهلی نو',
    1668341: 'تایپه',
    2618425: 'کپنهاگ',
    792680: 'بلگراد',
    285787: 'شهر کویت',
    1526273: 'آستانه',
    618426: 'کیشیناو',
    1282027: 'ماله',
    3492908: 'سانتو دومینگو',
    2422465: 'کوناکری',
    6611854: 'نیپیداو',
    2993458: 'موناکو',
    6691831: 'واتیکان',
    3041563: 'آندورا لا ولا',
    3042030: 'فادوتس',
    3374036: 'بریج‌تاون',
    426272: 'گیتگا',
    1566083: 'شهر هوشی‌مین',
    3173435: 'میلان',
    1853909: 'اوساکا',
    1848354: 'یوکوهاما',
    311046: 'ازمیر',
    360995: 'جیزه',
    6173331: 'ونکوور',
    3164603: 'ونیز',
    1167528: 'کویته',
    1166993: 'راولپندی',
    1179400: 'فیصل‌آباد',
    ':Caspian Sea': 'دریای خزر',
    ':Gulf of Oman': 'دریای عمان',
    ':Pacific Ocean': 'اقیانوس آرام',
    'AF:Mehtar Lām': 'مهترلام',
    'AF:Aībak': 'ایبک',
    'AF:Tarinkot': 'ترینکوت',
    /**
     * Second pass over the native review (2026-11-22): Omsk and Los Angeles as Persian writes them (one spelling for
     * the city and its airport), the capital and the large cities GeoNames has no Persian name for (Port Vila, Nagoya,
     * Surat, Kano, Xiamen, Diyarbakır), Crimea, and Washington, D.C. as the curated places write it.
     */
    'RU:Omsk': 'اومسک',
    'US:Los Angeles': 'لس\u200cآنجلس',
    'VU:Port-Vila': 'پورت ویلا',
    'JP:Nagoya': 'ناگویا',
    'IN:Surat': 'سورت',
    'NG:Kano': 'کانو',
    'CN:Xiamen': 'شیامن',
    'TR:Diyarbakır': 'دیاربکر',
    'UA:*Crimea': 'کریمه',
    'US:Washington, D.C.': 'واشینگتن دی\u200cسی',
    /**
     * Third review (2026-11-22). The war-zone places fa.md §8.2 lists: Gaza, the Gaza Strip, the West Bank and Gaza's
     * towns, and Ukraine's cities in the news (Chernobyl is §8.9's own example); Iran's, Afghanistan's and Tajikistan's
     * landmarks and features, which GeoNames names in Persian rarely or not at all; the seas Persian readers know;
     * Bokhtar is Bactria's باختر, Almaty آلماتی (not Alma-Ata's), Shymkent شمکند, as Persian Wikipedia writes them; and
     * the spellings the review corrected (تورینگن, ایلینوی, خاروغ, لشکرگاه, اوخوتسک, نووگورود, غازی‌آنتپ, the ezafe of
     * تنگهٔ).
     */
    'PS:Gaza': 'غزه',
    'PS.GZ': 'نوار غزه',
    'PS.WE': 'کرانه باختری',
    'PS:Rafaḩ': 'رفح',
    'PS:Khān Yūnis': 'خان یونس',
    701822: 'ماریوپل',
    687700: 'زاپوریژیا',
    706448: 'خرسون',
    694423: 'سواستوپول',
    693805: 'سیمفروپول',
    'UA:Chernobyl': 'چرنوبیل',
    'IR:Persepolis': 'تخت جمشید',
    'IR:Pasargadae': 'پاسارگاد',
    'IR:Mount Damavand': 'کوه دماوند',
    'IR:Kish Island': 'جزیرهٔ کیش',
    'IR:Qishm Island': 'جزیرهٔ قشم',
    'IR:Azadi Square': 'میدان آزادی',
    'IR:Azadi Stadium': 'ورزشگاه آزادی',
    'IR:Borj-e Mīlād': 'برج میلاد',
    'IR:Mehrabad International Airport': 'فرودگاه مهرآباد',
    'IR:Naqsh-e Rustam': 'نقش رستم',
    'IR:Mount Sabalan': 'سبلان',
    'IR:Tochal Peak': 'توچال',
    'IR:Zagros Mountains': 'زاگرس',
    'IR:Alborz Mountains': 'البرز',
    'IR:Daryā-ye ‘Omān': 'دریای عمان',
    'AF:Hindu Kush': 'هندوکش',
    'TJ:Pamir Mountains': 'پامیر',
    ':Red Sea': 'دریای سرخ',
    ':Arabian Sea': 'دریای عرب',
    ':Gulf of Aden': 'خلیج عدن',
    'TJ:Bokhtar': 'باختر',
    'KZ:Almaty': 'آلماتی',
    'KZ:Shymkent': 'شمکند',
    'DE:*Thuringia': 'تورینگن',
    'US:*Illinois': 'ایلینوی',
    'DE:*Baden-Wurttemberg': 'بادن-وورتمبرگ',
    'TJ:Khorugh': 'خاروغ',
    'AF:Lashkar Gāh': 'لشکرگاه',
    ':Sea of Okhotsk': 'دریای اوخوتسک',
    'RU:Nizhniy Novgorod': 'نیژنی نووگورود',
    'TR:Gaziantep': 'غازی‌آنتپ',
    ':Strait of Gibraltar': 'تنگهٔ جبل‌الطارق',
    'IR:Shahrak-e Pardīsān': 'پردیسان',
    'IR:Nasīm Shahr': 'نسیم‌شهر',
    'IR:Andīsheh': 'اندیشه',
    1486209: 'یکاترینبورگ',
    1176734: 'حیدرآباد',
    365137: 'ام‌درمان',
    1859171: 'کوبه',
    1863967: 'فوکوئوکا',
    'US:#New York': 'ایالت نیویورک',
    'RU:Nizhny Novgorod': 'نیژنی نووگورود',
    // The well-known towns at home under 50,000 people (ports, islands, resorts, Natanz; Rudaki's Panjakent).
    'IR:Chabahar': 'چابهار',
    'IR:Kish': 'کیش',
    'IR:Qeshm': 'قشم',
    'IR:Bandar-e Lengeh': 'بندر لنگه',
    'IR:Ramsar': 'رامسر',
    'IR:Babolsar': 'بابلسر',
    'IR:Natanz': 'نطنز',
    'IR:Damavand': 'دماوند',
    'IR:Tabas': 'طبس',
    'IR:Maku': 'ماکو',
    'IR:Sarakhs': 'سرخس',
    'IR:Astara': 'آستارا',
    'IR:Nowshahr': 'نوشهر',
    'IR:Tonekabon': 'تنکابن',
    'IR:Garmsar': 'گرمسار',
    'IR:Rudsar': 'رودسر',
    'TJ:Panjakent': 'پنجکنت',
    'TJ:Vahdat': 'وحدت',
    'TJ:Tursunzoda': 'تورسون‌زاده',
    'TJ:Hisor': 'حصار',
    'AF:Pul-e Alam': 'پل علم',
    'AF:Qala i Naw': 'قلعه نو',
    'AF:Chaghcharan': 'چغچران',
    /**
     * Pre-ship review (2026-11-22): the two Afghan airports GeoNames names in malformed Dari (میدانٔ هوائئ کندهار: the
     * ezafe's hamza on ن, a doubled ئ, and کندهار beside the table's قندهار), named as Iranian Persian names an
     * airport, as the table's others are (فرودگاه مهرآباد); Kabul's by its city, as Persian reporting names it.
     */
    'AF:Kandahar Airport': 'فرودگاه قندهار',
    'AF:Hamid Karzai International Airport': 'فرودگاه بین‌المللی کابل',
    // And the geocoders' names for Crimea's region (fa.md §8.9: کریمه, with no qualifier; Photon's is the second).
    'UA:*Autonomous Republic of Crimea': 'کریمه',
    'UA:*Republic of Crimea': 'کریمه',
  },
  /**
   * Hindi: the modern official names where GeoNames' first Hindi name is the old one (मुंबई, not बम्बई; बेंगलुरु, not
   * बंगलौर; प्रयागराज, not इलाहाबाद), the common spellings of Moscow and Paris, and the states and territories it has
   * no Hindi name for, in the Central Hindi Directorate's spelling (anusvara: झारखंड, आंध्र प्रदेश).
   */
  hi: {
    1275339: 'मुंबई',
    1277333: 'बेंगलुरु',
    1278994: 'प्रयागराज',
    1261731: 'नासिक',
    524901: 'मॉस्को',
    2988507: 'पेरिस',
    'IN.21': 'ओडिशा',
    'IN.14': 'लक्षद्वीप',
    'IN.52': 'दादरा और नगर हवेली और दमन और दीव',
    'IN.02': 'आंध्र प्रदेश',
    'IN.38': 'झारखंड',
    'IN.20': 'नागालैंड',
    'IN.05': 'चंडीगढ़',
    'IN.25': 'तमिलनाडु',
    'IN.01': 'अंडमान और निकोबार द्वीपसमूह',
    'GB:Stonehenge': 'स्टोनहेंज',
    'US:Mount Rainier': 'माउंट रेनियर',
    'PK:K2': 'के2',
    'CL:Moai': 'मोआई',
    'ES:Alhambra': 'अलहम्ब्रा',
    /** Modern official names where GeoNames' Hindi one is the old (गुलबर्ग, मैंगलूर, बेलगाँव), and a few misspellings. */
    'IN:Kalaburagi': 'कलबुर्गी',
    'IN:Mangaluru': 'मंगलुरु',
    'IN:Belagavi': 'बेलगावी',
    'IN:Mysuru': 'मैसूरु',
    'IN:Shivamogga': 'शिवमोग्गा',
    'IN:Ballari': 'बल्लारी',
    'IN:Korba': 'कोरबा',
    'IN:Gondiā': 'गोंदिया',
    'IN:Malda': 'मालदा',
    'IN:Gangtok': 'गंगटोक',
    'IN:Kozhikode': 'कोझिकोड',
    'RU:Rostov-on-Don': 'रोस्तोव-ऑन-डॉन',
    /**
     * Native review (2026-11-22). Bern (GeoNames' first Hindi name for it is the Atharvaveda), names Hindi readers and
     * the Hindi press write otherwise than GeoNames' only form (त्रिपोली, मैड्रिड, नेपल्स; हवाई अड्डा, not
     * विमानक्षेत्र, and an airport's name as its label gives it), misspellings, Intl's own spelling of Hong Kong and
     * Macao, and the capitals, Indian cities and seas GeoNames has no Hindi name for.
     */
    2661552: 'बर्न',
    2210247: 'त्रिपोली',
    170063: 'अलेप्पो',
    3117735: 'मैड्रिड',
    3435910: 'ब्यूनस आयर्स',
    3172394: 'नेपल्स',
    325363: 'अदाना',
    933773: 'गाबोरोने',
    792680: 'बेलग्रेड',
    2759794: 'एम्स्टर्डम',
    276781: 'बेरूत',
    1819729: 'हाँग काँग',
    1821274: 'मकाऊ',
    2314302: 'किंशासा',
    2193733: 'ऑकलैंड',
    2158177: 'मेलबर्न',
    287286: 'मस्कट',
    1735161: 'कुआलालंपुर',
    ':Atlantic Ocean': 'अटलांटिक महासागर',
    'SG:Changi Airport': 'चांगी हवाई अड्डा',
    'GB:Heathrow Airport': 'हीथ्रो हवाई अड्डा',
    'AE:Dubai International Airport': 'दुबई अंतरराष्ट्रीय हवाई अड्डा',
    'CA:Pearson Airport': 'पियर्सन हवाई अड्डा',
    'FR:Charles de Gaulle Airport': 'चार्ल्स डी गॉल हवाई अड्डा',
    'IN:Puducherry': 'पुडुचेरी',
    1268782: 'जालंधर',
    1254361: 'तिरुनेलवेली',
    1254348: 'तिरुप्पुर',
    1261529: 'नेल्लोर',
    1253573: 'वडोदरा',
    1253993: 'ऊटी',
    1252948: 'वारंगल',
    1265859: 'कृष्णनगर',
    1261931: 'नंदुरबार',
    1262332: 'मुज़फ़्फ़रनगर',
    1253184: 'विजयवाड़ा',
    1264521: 'मदुरै',
    1271175: 'गिरिडीह',
    162183: 'अश्गाबात',
    5391959: 'सैन फ़्रांसिस्को',
    'US:Golden Gate Bridge': 'गोल्डन गेट ब्रिज',
    2879139: 'लाइपज़िग',
    1821306: 'नोम पेन्ह',
    611717: 'त्बिलिसी',
    3583361: 'सैन साल्वाडोर',
    1835329: 'देगू',
    4699066: 'ह्यूस्टन',
    2413876: 'बंजुल',
    2950159: 'बर्लिन',
    360630: 'काहिरा',
    4140963: 'वॉशिंगटन',
    3530597: 'मैक्सिको सिटी',
    98182: 'बगदाद',
    756135: 'वारसॉ',
    6094817: 'ओटावा',
    1566083: 'हो ची मिन्ह सिटी',
    1853909: 'ओसाका',
    3173435: 'मिलान',
    3871336: 'सैंटियागो',
    1526273: 'अस्ताना',
    2538475: 'रबात',
    344979: 'अदीस अबाबा',
    264371: 'एथेंस',
    3067696: 'प्राग',
    2618425: 'कोपेनहेगन',
    2964574: 'डबलिन',
    2800866: 'ब्रसेल्स',
    290030: 'दोहा',
    285787: 'कुवैत सिटी',
    290340: 'मनामा',
    71137: 'सना',
    1258847: 'राजकोट',
    1270396: 'हावड़ा',
    1256436: 'सोलापुर',
    1268295: 'कल्याण',
    1269920: 'हुबली',
    1262801: 'मुरादाबाद',
    1266285: 'कोल्हापुर',
    1278718: 'अमरावती',
    1257806: 'सहारनपुर',
    1271439: 'गया',
    1260107: 'पटियाला',
    1269006: 'झाँसी',
    1276300: 'भागलपुर',
    1271715: 'गांधीनगर',
    1260476: 'पानीपत',
    1267708: 'करनाल',
    1275362: 'बोकारो',
    1272175: 'दुर्गापुर',
    1254187: 'त्रिशूर',
    1278094: 'अयोध्या',
    6619347: 'नवी मुंबई',
    1256259: 'सिलवासा',
    1179400: 'फ़ैसलाबाद',
    ':Arabian Sea': 'अरब सागर',
    ':Bay of Bengal': 'बंगाल की खाड़ी',
    ':Mediterranean Sea': 'भूमध्य सागर',
    ':Red Sea': 'लाल सागर',
    ':Persian Gulf': 'फ़ारस की खाड़ी',
    ':South China Sea': 'दक्षिण चीन सागर',
    'VN:South China Sea': 'दक्षिण चीन सागर',
    ':Arctic Ocean': 'आर्कटिक महासागर',
    'NP:Mount Everest': 'माउंट एवरेस्ट',
    'IN.22': 'पुडुचेरी',
    /**
     * Second pass over the native review (2026-11-22): Manchester as the Hindi press spells it, Gurgaon's landmark row
     * as the city is now named, Aurangabad as its English label still has it (its renaming, like Port Blair's, is the
     * owner's to decide), Washington, D.C. as hi.md's chip writes it, and the regions of Canada, Australia, the UK and
     * Nepal GeoNames has no Hindi name for.
     */
    'GB:Manchester': 'मैनचेस्टर',
    'IN:Gurgaon': 'गुरुग्राम',
    'IN:Aurangabad': 'औरंगाबाद',
    'US:Washington, D.C.': 'वॉशिंगटन डी.सी.',
    'CA.04': 'न्यू ब्रंसविक',
    'CA.05': 'न्यूफ़ाउंडलैंड और लैब्राडोर',
    'CA.07': 'नोवा स्कोटिया',
    'CA.09': 'प्रिंस एडवर्ड आइलैंड',
    'CA.10': 'क्यूबेक',
    'CA.11': 'सस्केचेवान',
    'CA.12': 'युकॉन',
    'CA.13': 'नॉर्थवेस्ट टेरिटरीज़',
    'CA.14': 'नुनावुत',
    'AU.04': 'क्वींसलैंड',
    'AU.05': 'दक्षिण ऑस्ट्रेलिया',
    'GB.WLS': 'वेल्स',
    'NP.1': 'कोशी प्रदेश',
    'NP.2': 'मधेश प्रदेश',
    'NP.3': 'बागमती प्रदेश',
    'NP.4': 'गंडकी प्रदेश',
    'NP.5': 'लुंबिनी प्रदेश',
    'NP.6': 'कर्णाली प्रदेश',
    'NP.7': 'सुदूरपश्चिम प्रदेश',
    /**
     * Third review (2026-11-22). The US states as the curated chips spell them (एरिज़ोना, नेवादा, यूटा, ओरेगन, कैनसस;
     * GeoNames has the candra-e and old word-for-word forms: टॅक्सस, नया मेक्सिको) and New York's as a state on its own
     * row; Rio, Wuhan and Tel Aviv as the Hindi press writes them (the chip writes रियो डी जनेरियो); Leh and Kavaratti,
     * missing though GeoNames names them; Venice and Cape Town as the chips write them; the nukta on ज़ and फ़ (hi.md
     * §0); and the world's best-known landmarks.
     */
    'US.TX': 'टेक्सास',
    'US.NM': 'न्यू मैक्सिको',
    'US.NH': 'न्यू हैम्पशायर',
    'US.AZ': 'एरिज़ोना',
    'US.NV': 'नेवादा',
    'US.UT': 'यूटा',
    'US.OR': 'ओरेगन',
    'US.KS': 'कैनसस',
    'US.CO': 'कोलोराडो',
    'US.ND': 'नॉर्थ डकोटा',
    'US.SD': 'साउथ डकोटा',
    'US.NC': 'नॉर्थ कैरोलिना',
    'US.SC': 'साउथ कैरोलिना',
    'US:#New York': 'न्यूयॉर्क राज्य',
    3451190: 'रियो डी जनेरियो',
    1791247: 'वुहान',
    293397: 'तेल अवीव',
    1264976: 'लेह',
    1267390: 'कवरत्ती',
    3164603: 'वेनिस',
    3369157: 'केप टाउन',
    'AU.03': 'नॉर्दर्न टेरिटरी',
    'IN:Muzaffarpur': 'मुज़फ़्फ़रपुर',
    'IN:Faridabad': 'फ़रीदाबाद',
    'IN:Najafgarh': 'नजफ़गढ़',
    'IN:Hazāribāgh': 'हज़ारीबाग',
    'FR:Eiffel Tower': 'एफ़िल टॉवर',
    'US:Statue of Liberty': 'स्टैच्यू ऑफ़ लिबर्टी',
    'AE:Burj Khalifa': 'बुर्ज खलीफ़ा',
    'CN:Great Wall of China': 'चीन की महान दीवार',
    'RU:Kremlin': 'क्रेमलिन',
    'SA:Mecca': 'मक्का',
    'AU:Great Barrier Reef': 'ग्रेट बैरियर रीफ़',
    /**
     * Pre-ship review (2026-11-22). The time-lapse's war zones as hi.md §8 names them, in §0's spelling (no nukta on
     * ग): the Gaza Strip and Gaza (GeoNames' ग़ज़ा is BBC Hindi's, a search name below), the West Bank (GeoNames'
     * पश्चिमी तट too), and Crimea by the geocoders' three names for it (Photon's "Republic of Crimea" most often),
     * with no qualifier; Ukraine and Lebanon are countries, which the browser names.
     */
    'PS.GZ': 'गाज़ा पट्टी',
    'PS.WE': 'वेस्ट बैंक',
    281133: 'गाज़ा',
    'UA.11': 'क्रीमिया',
    'UA:*Autonomous Republic of Crimea': 'क्रीमिया',
    'UA:*Republic of Crimea': 'क्रीमिया',
  },
}

/**
 * Search-only names, by GeoNames id or by `CC:English` (`CC:*English` for a region): what people type for a place whose
 * shown name is another (Sài Gòn for Ho Chi Minh City, colloquial and never shown, docs/i18n/vi.md; Kiew for Kyiv in
 * German, Киев for Київ in Ukrainian, a former name for a renamed town). Never displayed.
 */
export const ALIASES: Record<Lang, Record<string, readonly string[]>> = {
  de: { 703448: ['Kiew'], 702550: ['Lemberg'], 706483: ['Charkow'], 698740: ['Odesa'] },
  it: {
    698740: ['Odessa'],
    703448: ['Kiev'],
    360630: ['Il Cairo'],
    3553478: ['Avana'],
    2747373: ['Aia'],
    'IL:Western Wall': ['Muro Occidentale'],
    'CH:Lake Leman': ['Lago Lemano'],
    'RU:Lake Baikal': ['Lago Bajkal'],
  },
  uk: {
    703448: ['Киев'],
    698740: ['Одесса'],
    706483: ['Харьков'],
    700569: ['Николаев'],
    687700: ['Запорожье'],
    709930: ['Днепр', 'Дніпропетровськ', 'Днепропетровск'],
    705812: ['Кіровоград', 'Кировоград'],
    702550: ['Львов'],
    // The towns' former names, as people still type them (search only).
    709932: ['Дніпродзержинськ'],
    699445: ['Новомосковськ'],
    704403: ['Краснодон'],
    710554: ['Червоноград'],
    713174: ['Артемівськ'],
  },
  ru: {
    498817: ['Петербург', 'Питер'],
    'RU:*Moscow Oblast': ['Подмосковье'],
    1526384: ['Алма-Ата'],
    323777: ['Анталия'],
    588409: ['Таллинн'],
    'UA:Chernobyl': ['Чернобыль'],
    709930: ['Днепропетровск'],
    1526273: ['Нур-Султан'],
  },
  vi: {
    1566083: ['Sài Gòn', 'Hồ Chí Minh', 'TP Hồ Chí Minh', 'TPHCM'],
    1586896: ['Buôn Mê Thuột', 'Ban Mê Thuột'],
    // Two cities in China each, one English name: shown as it comes, found by the larger's name (Jiangsu's, Fujian's, Anhui's).
    'CN:Suzhou': ['Tô Châu'],
    'CN:Fuzhou': ['Phúc Châu'],
    'CN:Fuyang': ['Phụ Dương'],
    1568043: ['Sapa'],
    'VN:Đỉnh Phan Xi Phăng': ['Phan Xi Păng', 'Fansipan'],
    1822214: ['Xiêm Riệp'],
    // The archipelagos by their bare names, which Vietnamese readers type for them: «Trường Sa» found Changsha's four
    // towns (Trường Sa, Hồ Nam) before the Spratlys.
    ':Spratly Islands': ['Trường Sa'],
    ':Xisha Islands(Paracel Islands)': ['Hoàng Sa'],
  },
  fa: {
    703448: ['کیف'],
    4140963: ['واشنگتن'],
    745044: ['اسلامبول'],
    611717: ['تبلیسی'],
    281184: ['قدس', 'بیت‌المقدس'],
    1526384: ['آلماآتی'],
    'TJ:Bokhtar': ['بختر', 'بختار'],
  },
  hi: {
    1275339: ['बम्बई', 'बंबई'],
    1277333: ['बंगलौर', 'बैंगलोर', 'बेंगलूरु', 'बंगलुरु', 'बेंगलुरू'],
    1279228: ['अहमदनगर'],
    1269939: ['होशंगाबाद'],
    1278149: ['छत्रपति संभाजीनगर', 'संभाजीनगर'],
    1259385: ['श्री विजयपुरम'],
    1278994: ['इलाहाबाद'],
    1261481: ['नयी दिल्ली'],
    1275004: ['कलकत्ता'],
    1253405: ['बनारस', 'काशी'],
    1270642: ['गुड़गांव', 'गुड़गाँव'],
    1264527: ['मद्रास'],
    1259229: ['पूना'],
    1253573: ['बड़ौदा'],
    1254163: ['त्रिवेंद्रम'],
    1273874: ['कोचीन'],
    1262321: ['मैसूर'],
    1263780: ['मंगलौर'],
    1276533: ['बेलगाम'],
    1270752: ['गुलबर्गा'],
    2988507: ['पैरिस'],
    // Gaza as BBC Hindi writes it, and the West Bank as GeoNames does (hi.md §8 shows गाज़ा, वेस्ट बैंक).
    281133: ['ग़ज़ा'],
    'PS:*Gaza Strip': ['ग़ज़ा पट्टी'],
    'PS:*West Bank': ['पश्चिमी तट'],
  },
}
