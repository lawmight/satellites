/**
 * Polish copy for the About page (see docs/i18n/pl.md §1, §3.6, §3.9, §4.2, §8): every heading, paragraph, fact,
 * credit and key.
 *
 * Why it reads this way: About is the owner's plain voice, so it speaks to one person with a lowercase «ty» and as
 * «my» in the present tense («Liczymy…», «Niczego nie dodajemy»), in short sentences. The reader is never the subject
 * of a past tense (their gender is unknown, §1.4): «Jeśli twoje miejsce było w zasięgu», «wybrany przez ciebie
 * przelot», «Czy mnie widać?». Satellites stand behind a classifier when a verb or a preposition needs them
 * («Satelita Sentinel-1», «z satelitów Landsat»), and service names behind theirs («do usług Open-Meteo, Photon lub
 * Nominatim», «z serwisu CelesTrak»), so no foreign name is ever declined (§4.2). The quoted verdict is its exact
 * title in „ ” (§3.6). Nothing says «śledzić» (§8): the orbits come from the Space Force's «obserwacje». The catalog
 * line counts objects in pl's four forms after «wczytała» and hangs the stamp on «z kopii pobranej», which agrees with
 * «kopia» and so with nothing that varies. The privacy rows promise exactly what the English does, with no legal
 * vocabulary. Licence lines, product, agency and person names stay as they are; OpenStreetMap's credit takes the form
 * OSM gives for Polish. One-letter words and a number's unit are tied by a no-break space (§6.3).
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('pl')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

/** A count as it is set: grouped from five digits («16 893»), a fraction kept (its plural form is `other`). */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** The object of «wczytała»: «1 obiekt · 3 obiekty · 16 893 obiekty · 12 847 obiektów · 1,5 obiektu» */
const objects = (n: number) => f.plural(n, { one: 'obiekt', few: 'obiekty', many: 'obiektów', other: 'obiektu' })

const about: typeof en = {
  bar: 'O projekcie',
  close: 'Zamknij',
  sectionsLabel: 'Sekcje',
  title: [['Jak to'], [accent('działa'), '.']] as Rich[],
  lede: 'Wybierz punkt na Ziemi. Ustalamy, które satelity przeleciały nad nim w\u00a0ostatnim tygodniu, a\u00a0potem szukamy ich zdjęć. Wszystko działa w\u00a0twojej przeglądarce, na publicznych danych.',

  sections: {
    short: 'W skrócie',
    method: 'Jak znajdujemy przeloty',
    words: 'Co znaczą etykiety',
    accuracy: 'Czego nie widać',
    privacy: 'Prywatność',
    credits: 'Źródła',
    keys: 'Klawiatura',
  },

  short: {
    live: {
      term: 'Czy to na żywo?',
      text: 'Nie do końca. Zdjęcia trafiają do archiwów od kilku godzin do paru dni po wykonaniu, więc najnowsze przeloty mogą jeszcze nie mieć zdjęcia.',
    },
    seeMe: {
      term: 'Czy mnie widać?',
      text: 'Nie. Piksel ma tu w\u00a0najlepszym razie 10\u00a0m. Samochód to jeden piksel. Ciebie w\u00a0nim nie ma.',
    },
    every: {
      term: 'Czy to wszystkie satelity?',
      text: 'Nie. Satelitów wojskowych i\u00a0szpiegowskich zwykle nie ma w\u00a0publicznych katalogach, a\u00a0firmy nie mówią, gdzie kierują kamery.',
    },
  },

  method: {
    orbits: [
      'Każdy obiekt na orbicie ma publiczny zestaw liczb, który opisuje jego tor. Serwis ',
      link('CelesTrak'),
      ' publikuje te zestawy na podstawie obserwacji Sił Kosmicznych USA, a\u00a0my co sześć godzin pobieramy świeżą kopię.',
    ] as AboutPart[],
    loaded: (n: number, stamp: string): AboutPart[] =>
      n <= 0
        ? ['Ta strona nie wczytała żadnego obiektu z\u00a0kopii pobranej ', num(stamp), '.']
        : ['Ta strona wczytała ', num(count(n)), `\u00a0${objects(n)} z\u00a0kopii pobranej `, num(stamp), '.'],
    sgp4: 'Pozycje każdego satelity z\u00a0ostatnich siedmiu dni liczymy za pomocą SGP4, standardowego modelu orbit, i\u00a0zapisujemy każdą chwilę, w\u00a0której twój punkt był w\u00a0jego polu widzenia.',
    facts: {
      straightDown: {
        term: 'Prosto w dół',
        text: 'Satelity Sentinel-2 i\u00a0Landsat patrzą prosto w\u00a0dół na pas ziemi o\u00a0szerokości ok.\u00a0290\u00a0km (Sentinel-2) lub 185\u00a0km (Landsat). Musisz się w\u00a0nim znaleźć.',
      },
      tilting: {
        term: 'Wychylne kamery',
        text: 'Wiele satelitów komercyjnych może się wychylić o\u00a030–45\u00a0stopni. Jeśli twoje miejsce było w\u00a0zasięgu, nazywamy to „Satelita mógł spojrzeć”.',
      },
      daylight: {
        term: 'Światło dzienne',
        text: 'Zwykłe kamery potrzebują słońca. Przelot w\u00a0ciemności nigdy nie liczy się jako zdjęcie.',
      },
      radar: {
        term: 'Radar',
        text: 'Satelita Sentinel-1 nie potrzebuje słońca. Wysyła mikrofale i\u00a0rejestruje ich echo, dzięki czemu widzi przez chmury i\u00a0w\u00a0nocy, patrząc w\u00a0bok od śladu orbity. Jego obrazy też są publiczne, więc je pokazujemy, w\u00a0odcieniach szarości: nierówny teren i\u00a0budynki są jasne, spokojna woda ciemna.',
      },
      weather: {
        term: 'Satelity pogodowe',
        text: 'Kilka z\u00a0nich wisi nad równikiem i\u00a0co 10\u00a0minut obserwuje pół planety. Jeśli jesteś po ich stronie Ziemi, jesteś w\u00a0każdej klatce.',
      },
    },
    archives:
      'Potem przeszukujemy archiwa obrazów (Microsoft Planetary Computer, Element 84 i\u00a0NASA) i\u00a0dopasowujemy każdy obraz do przelotu, podczas którego powstał. Każdy obraz, który widzisz, jest prawdziwy: to wycinek wokół twojego punktu.',
    photoFacts: {
      touchUps: {
        term: 'Obróbka',
        text: 'Zdjęcia z\u00a0satelitów Sentinel-2 i\u00a0Landsat mają wyrównane barwy, są wygładzone i\u00a0lekko wyostrzone z\u00a0myślą o\u00a0twoim ekranie, jednakowo w\u00a0każdym miejscu zdjęcia. Niczego nie dodajemy ani nie usuwamy.',
      },
      whichWayUp: {
        term: 'Gdzie jest północ',
        text: 'Zdjęcia z\u00a0satelitów Sentinel-2 i\u00a0Landsat zachowują siatkę kartograficzną archiwum dla twojego miejsca, więc północ nie zawsze jest idealnie u\u00a0góry: może być odchylona o\u00a0kilka stopni. Gdy otworzysz zdjęcie, jego strzałka N pokaże, gdzie dokładnie jest północ.',
      },
    },
  },

  verdictMore: {
    imaged: 'Jeśli go pokazujemy, to jest prawdziwy obraz.',
    likely: 'Zdjęcie nie jest jeszcze publiczne albo odrzucono je z\u00a0powodu chmur.',
    could: 'Nie da się sprawdzić, czy tak było.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: 'Dokładne pozycje',
      text: 'Publiczne dane orbitalne mają dokładność ok.\u00a0kilometra i\u00a0każdego dnia trochę ją tracą. Czasy mogą się różnić o\u00a0kilka sekund.',
    },
    secret: {
      term: 'Tajne satelity',
      text: 'Niektóre z\u00a0najlepszych kamer na orbicie należą do wojska. Tu ich nie ma.',
    },
    clouds: {
      term: 'Chmury',
      text: 'Na wielu zdjęciach widać tylko chmury. Gdy archiwum podaje dane o\u00a0chmurach, sprawdzamy piksel dokładnie nad twoim punktem i\u00a0mówimy, co na nim widać.',
    },
    delays: { term: 'Opóźnienia', text: 'Zdjęcia mogą się pojawić dopiero po dniu albo dwóch.' },
  },

  privacy: {
    where: { term: 'Gdzie to działa', text: 'Orbity obliczamy w\u00a0twojej przeglądarce.' },
    kept: {
      term: 'Co przechowujemy',
      text: 'Liczymy wyszukiwania według miejscowości i\u00a0przybliżonego obszaru ok.\u00a010\u00a0km, nigdy według twojego dokładnego punktu, i\u00a0prowadzimy licznik tego, co ktoś otwiera i\u00a0udostępnia. Bez adresów IP, bez własnych plików cookie, bez niczego, co łączy jedną wizytę z\u00a0następną.',
    },
    others: {
      term: 'Kto jeszcze to widzi',
      text: 'Większość nazw miejsc pochodzi z\u00a0listy wbudowanej w\u00a0stronę. Pozostałe wyszukiwania trafiają do usług Open-Meteo, Photon lub Nominatim. Zdjęcia wczytują się prosto z\u00a0archiwów. Nasz dostawca hostingu liczy wyświetlenia stron i\u00a0mierzy ich szybkość, bez plików cookie. Może też ustawić jeden plik cookie zabezpieczający, żeby odróżnić ludzi od botów. Nigdy go nie czytamy.',
    },
    links: {
      term: 'Linki do udostępniania',
      text: 'Powstają tylko wtedy, gdy coś udostępniasz. Każdy, kto ma link, widzi nazwę miejsca, punkt zaokrąglony do ok.\u00a01\u00a0km i\u00a0wybrany przez ciebie przelot.',
    },
  },

  credits: {
    madeBy: { who: 'Autor', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' na X'] },
    support: { who: 'Wsparcie', text: [link('Pomóż utrzymać Watched za darmo :)')] as AboutPart[] },
    gibs: 'Obrazy z\u00a0usługi NASA GIBS, części systemu EOSDIS. GOES via NOAA i\u00a0CIRA, Himawari via JMA.',
    archives: {
      who: 'Archiwa',
      text: 'Microsoft Planetary Computer i\u00a0Element 84 Earth Search; kanał 15\u00a0m satelitów Landsat z\u00a0platformy Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Orbity', text: 'Elementy orbitalne z\u00a0serwisu CelesTrak. SGP4 z\u00a0biblioteki satellite.js.' },
    placeNames: { who: 'Nazwy miejsc', text: 'Photon od komoot. Dane mapy © autorzy OpenStreetMap (ODbL).' },
    textures: { who: 'Tekstury Ziemi', text: 'Solar System Scope (CC BY 4.0), na podstawie map NASA Blue Marble i\u00a0Black Marble.' },
    type: {
      who: 'Kroje pisma',
      text: 'Instrument Sans i\u00a0Serif od studia Instrument, Martian Mono od studia Evil Martians (SIL OFL).',
    },
  },

  keys: {
    search: 'Szukaj miejsca',
    suggestions: 'Poruszaj się po podpowiedziach',
    choose: 'Wybierz',
    passes: 'Przechodź między przelotami',
    photos: 'Poprzednie / następne zdjęcie',
    expand: 'Powiększ zdjęcie',
    zoom: 'Przybliż lub oddal (po powiększeniu)',
    play: 'Odtwórz lub wstrzymaj powtórkę',
    back: 'Wróć lub zamknij',
    help: 'Ta strona',
  },
  keyNames: { enter: 'Enter', space: 'Spacja', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['Autor: ', link(handle)],
  footerNote: 'Zbudowane z\u00a0publicznych danych. Żadne z\u00a0tych zdjęć nie jest nasze.',
}
export default about
