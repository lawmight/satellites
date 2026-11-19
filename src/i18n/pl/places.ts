/**
 * Polish names for the curated places (see docs/i18n/pl.md §4.3, §8): the landing's three example chips and the
 * "Surprise me" pool, every id with the same fields as English.
 *
 * Why these names: each is the guide's table, the established Polish exonym where one exists («Piramidy w Gizie»,
 * «Wielki Kanion», «Wodospad Niagara», «Kilimandżaro») and the place's own name where Polish has none («Palm
 * Jumeirah», «Las Vegas Strip», «Hardy Reef»). Two labels say what the point is rather than translate the English
 * word for word: «Elektrownia w Czarnobylu», because the pin is the plant, about 15 km from the town, and «Okrągłe
 * pola w Garden City», because these are centre-pivot fields and «kręgi zbożowe» would be the alien legend. A label
 * may be declined inside itself, because a translator wrote it, but once picked it is a [PLACE] slot like any other
 * (§5.1). Sublabels run from the most specific place outward, with commas, and write countries in full («Stany
 * Zjednoczone»), lowercase for a common noun before a name («stan Waszyngton», «obwód kijowski», «rzeka Huangpu»,
 * «pustynia Namib»). A label is set in display headlines, so a one-letter word and «Strefa 51»'s number are tied to
 * the next word by a no-break space (§6.3). Chips stay under ~14 characters. Usage stats, record_lookup and shares
 * keep the English label, so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Strefa\u00a051', label: 'Strefa\u00a051', sublabel: 'Groom Lake, Nevada, Stany Zjednoczone' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'Nowy Jork, Stany Zjednoczone' },
  giza: { chip: 'Giza', label: 'Piramidy w\u00a0Gizie', sublabel: 'Giza, Egipt' },
  // "Surprise me"
  uluru: { label: 'Uluru', sublabel: 'Terytorium Północne, Australia' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubaj, Zjednoczone Emiraty Arabskie' },
  worldIslands: { label: 'Archipelag The World', sublabel: 'Dubaj, Zjednoczone Emiraty Arabskie' },
  grandCanyon: { label: 'Wielki Kanion', sublabel: 'Arizona, Stany Zjednoczone' },
  meteorCrater: { label: 'Krater Barringera', sublabel: 'Arizona, Stany Zjednoczone' },
  lowerManhattan: { label: 'Dolny Manhattan', sublabel: 'Nowy Jork, Stany Zjednoczone' },
  lasVegasStrip: { label: 'Las Vegas Strip', sublabel: 'Nevada, Stany Zjednoczone' },
  hooverDam: { label: 'Zapora Hoovera i\u00a0jezioro Mead', sublabel: 'Nevada i\u00a0Arizona, Stany Zjednoczone' },
  goldenGate: { label: 'Golden Gate', sublabel: 'San Francisco, Stany Zjednoczone' },
  kennedySpaceCenter: { label: 'Centrum Kosmiczne Kennedy’ego', sublabel: 'Floryda, Stany Zjednoczone' },
  washingtonDc: { label: 'Waszyngton', sublabel: 'National Mall, Stany Zjednoczone' },
  mountStHelens: { label: 'Mount St. Helens', sublabel: 'stan Waszyngton, Stany Zjednoczone' },
  niagaraFalls: { label: 'Wodospad Niagara', sublabel: 'Ontario, Kanada' },
  panamaCanal: { label: 'Kanał Panamski', sublabel: 'Śluzy Gatún, Panama' },
  rioDeJaneiro: { label: 'Rio de Janeiro', sublabel: 'Głowa Cukru i\u00a0Copacabana, Brazylia' },
  paris: { label: 'Paryż', sublabel: 'Île-de-France, Francja' },
  venice: { label: 'Wenecja', sublabel: 'Wenecja Euganejska, Włochy' },
  vesuvius: { label: 'Wezuwiusz', sublabel: 'Neapol, Włochy' },
  istanbul: { label: 'Stambuł', sublabel: 'Bosfor, Turcja' },
  chernobyl: { label: 'Elektrownia w\u00a0Czarnobylu', sublabel: 'obwód kijowski, Ukraina' },
  tableMountain: { label: 'Góra Stołowa', sublabel: 'Kapsztad, Republika Południowej Afryki' },
  kilimanjaro: { label: 'Kilimandżaro', sublabel: 'Kilimandżaro, Tanzania' },
  everest: { label: 'Mount Everest', sublabel: 'Nepal i\u00a0Chiny' },
  angkorWat: { label: 'Angkor Wat', sublabel: 'Siem Reap, Kambodża' },
  singapore: { label: 'Singapur', sublabel: 'Marina Bay, Singapur' },
  hongKong: { label: 'Hongkong', sublabel: 'Port Wiktorii, Hongkong' },
  tokyo: { label: 'Tokio', sublabel: 'Tokio, Japonia' },
  fuji: { label: 'Fudżi', sublabel: 'Shizuoka, Japonia' },
  sydneyHarbour: { label: 'Port w\u00a0Sydney', sublabel: 'Sydney, Australia' },
  richat: { label: 'Struktura Richat', sublabel: 'Sahara, Mauretania' },
  greatBlueHole: { label: 'Wielka Błękitna Dziura', sublabel: 'Lighthouse Reef, Belize' },
  boraBora: { label: 'Bora-Bora', sublabel: 'Wyspy Towarzystwa, Polinezja Francuska' },
  hardyReef: { label: 'Hardy Reef', sublabel: 'Wielka Rafa Koralowa, Australia' },
  male: { label: 'Male', sublabel: 'Atol Male Północny, Malediwy' },
  deadSea: { label: 'Baseny solne Morza Martwego', sublabel: 'basen południowy, Izrael i\u00a0Jordania' },
  binghamCanyon: { label: 'Kopalnia Bingham Canyon', sublabel: 'Utah, Stany Zjednoczone' },
  mountWhaleback: { label: 'Kopalnia Mount Whaleback', sublabel: 'Pilbara, Australia' },
  etna: { label: 'Etna', sublabel: 'Sycylia, Włochy' },
  santorini: { label: 'Santoryn', sublabel: 'Cyklady, Grecja' },
  teide: { label: 'Teide', sublabel: 'Teneryfa, Hiszpania' },
  kilauea: { label: 'Kīlauea', sublabel: 'Hawaje, Stany Zjednoczone' },
  craterLake: { label: 'Jezioro Kraterowe', sublabel: 'Oregon, Stany Zjednoczone' },
  glenCanyonDam: { label: 'Zapora Glen Canyon', sublabel: 'Page, Arizona, Stany Zjednoczone' },
  gardenCity: { label: 'Okrągłe pola w\u00a0Garden City', sublabel: 'Kansas, Stany Zjednoczone' },
  almeria: { label: 'Szklarnie w\u00a0Almerii', sublabel: 'Andaluzja, Hiszpania' },
  gibraltar: { label: 'Gibraltar', sublabel: 'Cieśnina Gibraltarska' },
  suezCanal: { label: 'Kanał Sueski', sublabel: 'Ismailia, Egipt' },
  aswanDam: { label: 'Wysoka Tama w\u00a0Asuanie', sublabel: 'Jezioro Nasera, Egipt' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Akaba, Jordania' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'pustynia Namib, Namibia' },
  victoriaFalls: { label: 'Wodospady Wiktorii', sublabel: 'Zambia i\u00a0Zimbabwe' },
  threeGorges: { label: 'Zapora Trzech Przełomów', sublabel: 'Hubei, Chiny' },
  shanghai: { label: 'Szanghaj', sublabel: 'rzeka Huangpu, Chiny' },
  itaipu: { label: 'Zapora Itaipu', sublabel: 'Brazylia i\u00a0Paragwaj' },
}
export default places
