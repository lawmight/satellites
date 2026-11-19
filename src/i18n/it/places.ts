/**
 * Italian names for the curated places: the landing's three example chips and the "Sorprendimi" pool (see
 * src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/it.md §4, "Curated places").
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the name an
 * Italian map prints. The label is inserted bare into the headline as [PLACE] (*…hanno osservato Piramidi di Giza.*),
 * so it is written as a map label: the established Italian exonym, with no article (*Piramidi di Giza*, *Cascate del
 * Niagara*, *Diga di Hoover e lago Mead*, *Monte Sant’Elena*, *Parigi*, *Vesuvio*, *Etna*, *Kilimangiaro*), and the
 * original name where Italians use it (*Central Park*, *Area 51*, *Grand Canyon*, *Golden Gate*, *Kennedy Space
 * Center*, *Meteor Crater*, *Table Mountain*, *Great Blue Hole*). A generic noun inside a name is lowercase (*lago
 * Mead*), as Italian maps write it; a name starts with a capital. The "crop circles" of Garden City are centre-pivot
 * fields, so they are *Campi circolari*, not the hoax's *cerchi nel grano*. Chips stay under 14 characters. Sublabels
 * go most specific first, with commas, and countries are as `Intl.DisplayNames('it')` writes them (*Stati Uniti*,
 * *Emirati Arabi Uniti*, *Polinesia Francese*, *Sudafrica*, *Turchia*, *RAS di Hong Kong*), taken as they come so a
 * curated sublabel names a country as the search results do (it.md §8); the label itself stays *Hong Kong*. Ukrainian
 * places are spelled as the gazetteer spells them (*Kyiv*, it.md §8). Stats, lookups and shares keep the English label
 * (Place.canonicalLabel), so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Area 51', label: 'Area 51', sublabel: 'Groom Lake, Nevada, Stati Uniti' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'New York, Stati Uniti' },
  giza: { chip: 'Giza', label: 'Piramidi di Giza', sublabel: 'Giza, Egitto' },
  // "Sorprendimi"
  uluru: { label: 'Uluru', sublabel: 'Territorio del Nord, Australia' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubai, Emirati Arabi Uniti' },
  worldIslands: { label: 'The World Islands', sublabel: 'Dubai, Emirati Arabi Uniti' },
  grandCanyon: { label: 'Grand Canyon', sublabel: 'Arizona, Stati Uniti' },
  meteorCrater: { label: 'Meteor Crater', sublabel: 'Arizona, Stati Uniti' },
  lowerManhattan: { label: 'Lower Manhattan', sublabel: 'New York, Stati Uniti' },
  lasVegasStrip: { label: 'Las Vegas Strip', sublabel: 'Nevada, Stati Uniti' },
  hooverDam: { label: 'Diga di Hoover e lago Mead', sublabel: 'Nevada e Arizona, Stati Uniti' },
  goldenGate: { label: 'Golden Gate', sublabel: 'San Francisco, Stati Uniti' },
  kennedySpaceCenter: { label: 'Kennedy Space Center', sublabel: 'Florida, Stati Uniti' },
  washingtonDc: { label: 'Washington, D.C.', sublabel: 'National Mall, Stati Uniti' },
  mountStHelens: { label: 'Monte Sant’Elena', sublabel: 'Washington, Stati Uniti' },
  niagaraFalls: { label: 'Cascate del Niagara', sublabel: 'Ontario, Canada' },
  panamaCanal: { label: 'Canale di Panama', sublabel: 'Chiuse di Gatún, Panama' },
  rioDeJaneiro: { label: 'Rio de Janeiro', sublabel: 'Pan di Zucchero e Copacabana, Brasile' },
  paris: { label: 'Parigi', sublabel: 'Île-de-France, Francia' },
  venice: { label: 'Venezia', sublabel: 'Veneto, Italia' },
  vesuvius: { label: 'Vesuvio', sublabel: 'Napoli, Italia' },
  istanbul: { label: 'Istanbul', sublabel: 'Bosforo, Turchia' },
  chernobyl: { label: 'Chernobyl', sublabel: 'Oblast di Kyiv, Ucraina' },
  tableMountain: { label: 'Table Mountain', sublabel: 'Città del Capo, Sudafrica' },
  kilimanjaro: { label: 'Kilimangiaro', sublabel: 'Kilimangiaro, Tanzania' },
  everest: { label: 'Monte Everest', sublabel: 'Nepal e Cina' },
  angkorWat: { label: 'Angkor Wat', sublabel: 'Siem Reap, Cambogia' },
  singapore: { label: 'Singapore', sublabel: 'Marina Bay, Singapore' },
  hongKong: { label: 'Hong Kong', sublabel: 'Porto di Victoria, RAS di Hong Kong' },
  tokyo: { label: 'Tokyo', sublabel: 'Tokyo, Giappone' },
  fuji: { label: 'Monte Fuji', sublabel: 'Shizuoka, Giappone' },
  sydneyHarbour: { label: 'Porto di Sydney', sublabel: 'Sydney, Australia' },
  richat: { label: 'Struttura di Richat', sublabel: 'Sahara, Mauritania' },
  greatBlueHole: { label: 'Great Blue Hole', sublabel: 'Lighthouse Reef, Belize' },
  boraBora: { label: 'Bora Bora', sublabel: 'Isole della Società, Polinesia Francese' },
  hardyReef: { label: 'Hardy Reef', sublabel: 'Grande barriera corallina, Australia' },
  male: { label: 'Malé', sublabel: 'Atollo di Malé Nord, Maldive' },
  deadSea: { label: 'Saline del Mar Morto', sublabel: 'Bacino meridionale, Israele e Giordania' },
  binghamCanyon: { label: 'Miniera di Bingham Canyon', sublabel: 'Utah, Stati Uniti' },
  mountWhaleback: { label: 'Miniera di Mount Whaleback', sublabel: 'Pilbara, Australia' },
  etna: { label: 'Etna', sublabel: 'Sicilia, Italia' },
  santorini: { label: 'Santorini', sublabel: 'Cicladi, Grecia' },
  teide: { label: 'Teide', sublabel: 'Tenerife, Spagna' },
  kilauea: { label: 'Kīlauea', sublabel: 'Hawaii, Stati Uniti' },
  craterLake: { label: 'Crater Lake', sublabel: 'Oregon, Stati Uniti' },
  glenCanyonDam: { label: 'Diga di Glen Canyon', sublabel: 'Page, Arizona, Stati Uniti' },
  gardenCity: { label: 'Campi circolari di Garden City', sublabel: 'Kansas, Stati Uniti' },
  almeria: { label: 'Serre di Almería', sublabel: 'Andalusia, Spagna' },
  gibraltar: { label: 'Gibilterra', sublabel: 'Stretto di Gibilterra' },
  suezCanal: { label: 'Canale di Suez', sublabel: 'Ismailia, Egitto' },
  aswanDam: { label: 'Grande diga di Assuan', sublabel: 'Lago Nasser, Egitto' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Aqaba, Giordania' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'Deserto del Namib, Namibia' },
  victoriaFalls: { label: 'Cascate Vittoria', sublabel: 'Zambia e Zimbabwe' },
  threeGorges: { label: 'Diga delle Tre Gole', sublabel: 'Hubei, Cina' },
  shanghai: { label: 'Shanghai', sublabel: 'Fiume Huangpu, Cina' },
  itaipu: { label: 'Diga di Itaipú', sublabel: 'Brasile e Paraguay' },
}

export default places
