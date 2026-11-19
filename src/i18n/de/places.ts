/**
 * German names for the curated places: the landing's three example chips and the "Überrasch mich" pool (see
 * src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/de.md §4.3, which gives every name here).
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the established
 * German name where one exists (*Pyramiden von Gizeh*, *Venedig*, *Vesuv*, *Niagarafälle*, *Tschernobyl*) and keeps
 * the name where German has none (*Central Park*, *Palm Jumeirah*, *Lower Manhattan*). Chip, label and sublabel change
 * together, so the chip and the headline always match; chips stay under ~14 characters (*Gizeh*). No label carries an
 * article: the headline frames take the accusative article and the *von* form from the German article table, as plain
 * text before the serif name (§5.1), so a label must stay exactly as that table spells it. Countries are
 * `Intl.DisplayNames('de')`'s long names, with *USA* and *Hongkong* in the short style (§6.7). *Garden City*'s circles
 * are centre-pivot irrigation, never *Kornkreise*; *Mount St. Helens* gets *Bundesstaat* so the state is not read as
 * the city; *Kīlauea* keeps its macron; the Chernobyl site keeps its established German name beside *Oblast Kyjiw*
 * (§8). Usage stats, lookups and shares keep the English label (Place.canonicalLabel), so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Area 51', label: 'Area 51', sublabel: 'Groom Lake, Nevada, USA' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'New York, USA' },
  giza: { chip: 'Gizeh', label: 'Pyramiden von Gizeh', sublabel: 'Gizeh, Ägypten' },
  // "Überrasch mich"
  uluru: { label: 'Uluru', sublabel: 'Northern Territory, Australien' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubai, Vereinigte Arabische Emirate' },
  worldIslands: { label: 'Inselgruppe The World', sublabel: 'Dubai, Vereinigte Arabische Emirate' },
  grandCanyon: { label: 'Grand Canyon', sublabel: 'Arizona, USA' },
  meteorCrater: { label: 'Barringer-Krater', sublabel: 'Arizona, USA' },
  lowerManhattan: { label: 'Lower Manhattan', sublabel: 'New York, USA' },
  lasVegasStrip: { label: 'Las Vegas Strip', sublabel: 'Nevada, USA' },
  hooverDam: { label: 'Hoover-Damm und Lake Mead', sublabel: 'Nevada und Arizona, USA' },
  goldenGate: { label: 'Golden Gate', sublabel: 'San Francisco, USA' },
  kennedySpaceCenter: { label: 'Kennedy Space Center', sublabel: 'Florida, USA' },
  washingtonDc: { label: 'Washington, D.C.', sublabel: 'National Mall, USA' },
  mountStHelens: { label: 'Mount St. Helens', sublabel: 'Bundesstaat Washington, USA' },
  niagaraFalls: { label: 'Niagarafälle', sublabel: 'Ontario, Kanada' },
  panamaCanal: { label: 'Panamakanal', sublabel: 'Gatún-Schleusen, Panama' },
  rioDeJaneiro: { label: 'Rio de Janeiro', sublabel: 'Zuckerhut und Copacabana, Brasilien' },
  paris: { label: 'Paris', sublabel: 'Île-de-France, Frankreich' },
  venice: { label: 'Venedig', sublabel: 'Venetien, Italien' },
  vesuvius: { label: 'Vesuv', sublabel: 'Neapel, Italien' },
  istanbul: { label: 'Istanbul', sublabel: 'Bosporus, Türkei' },
  chernobyl: { label: 'Tschernobyl', sublabel: 'Oblast Kyjiw, Ukraine' },
  tableMountain: { label: 'Tafelberg', sublabel: 'Kapstadt, Südafrika' },
  kilimanjaro: { label: 'Kilimandscharo', sublabel: 'Kilimandscharo, Tansania' },
  everest: { label: 'Mount Everest', sublabel: 'Nepal und China' },
  angkorWat: { label: 'Angkor Wat', sublabel: 'Siem Reap, Kambodscha' },
  singapore: { label: 'Singapur', sublabel: 'Marina Bay, Singapur' },
  hongKong: { label: 'Hongkong', sublabel: 'Victoria Harbour, Hongkong' },
  tokyo: { label: 'Tokio', sublabel: 'Tokio, Japan' },
  fuji: { label: 'Fuji', sublabel: 'Shizuoka, Japan' },
  sydneyHarbour: { label: 'Hafen von Sydney', sublabel: 'Sydney, Australien' },
  richat: { label: 'Richat-Struktur', sublabel: 'Sahara, Mauretanien' },
  greatBlueHole: { label: 'Great Blue Hole', sublabel: 'Lighthouse Reef, Belize' },
  boraBora: { label: 'Bora Bora', sublabel: 'Gesellschaftsinseln, Französisch-Polynesien' },
  hardyReef: { label: 'Hardy Reef', sublabel: 'Great Barrier Reef, Australien' },
  male: { label: 'Malé', sublabel: 'Nord-Malé-Atoll, Malediven' },
  deadSea: { label: 'Salzbecken am Toten Meer', sublabel: 'Südbecken, Israel und Jordanien' },
  binghamCanyon: { label: 'Bingham-Canyon-Mine', sublabel: 'Utah, USA' },
  mountWhaleback: { label: 'Mount-Whaleback-Mine', sublabel: 'Pilbara, Australien' },
  etna: { label: 'Ätna', sublabel: 'Sizilien, Italien' },
  santorini: { label: 'Santorin', sublabel: 'Kykladen, Griechenland' },
  teide: { label: 'Teide', sublabel: 'Teneriffa, Spanien' },
  kilauea: { label: 'Kīlauea', sublabel: 'Hawaii, USA' },
  craterLake: { label: 'Crater Lake', sublabel: 'Oregon, USA' },
  glenCanyonDam: { label: 'Glen-Canyon-Talsperre', sublabel: 'Page, Arizona, USA' },
  gardenCity: { label: 'Bewässerungskreise von Garden City', sublabel: 'Kansas, USA' },
  almeria: { label: 'Gewächshäuser von Almería', sublabel: 'Andalusien, Spanien' },
  gibraltar: { label: 'Gibraltar', sublabel: 'Straße von Gibraltar' },
  suezCanal: { label: 'Suezkanal', sublabel: 'Ismailia, Ägypten' },
  aswanDam: { label: 'Assuan-Staudamm', sublabel: 'Nassersee, Ägypten' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Akaba, Jordanien' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'Namib, Namibia' },
  victoriaFalls: { label: 'Victoriafälle', sublabel: 'Sambia und Simbabwe' },
  threeGorges: { label: 'Drei-Schluchten-Talsperre', sublabel: 'Hubei, China' },
  shanghai: { label: 'Shanghai', sublabel: 'Huangpu-Fluss, China' },
  itaipu: { label: 'Itaipú-Talsperre', sublabel: 'Brasilien und Paraguay' },
}
export default places
