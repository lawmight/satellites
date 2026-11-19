/**
 * Indonesian names for the curated places: the landing's three example chips and the "Pilih acak" pool (see
 * src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/id.md §4.4, which gives every name here).
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the name
 * Indonesian readers know (*Terusan Suez*, *Gunung Fuji*, *Venesia*). A class noun (*Gunung*, *Danau*, *Bendungan*) is
 * allowed here because the place is known; runtime place slots never get one (id.md §5.1). Countries are CLDR `id`'s
 * names (*Amerika Serikat*, *Tiongkok*, *Yordania*), Hong Kong its short name, and Ukrainian places in Ukrainian
 * transliteration (*Kyiv*). Sublabels go most specific first, with commas. Stats, lookups and shares keep the English
 * label (Place.canonicalLabel), so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Area 51', label: 'Area 51', sublabel: 'Groom Lake, Nevada, Amerika Serikat' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'New York, Amerika Serikat' },
  giza: { chip: 'Giza', label: 'Piramida Giza', sublabel: 'Giza, Mesir' },
  // "Pilih acak"
  uluru: { label: 'Uluru', sublabel: 'Wilayah Utara, Australia' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubai, Uni Emirat Arab' },
  worldIslands: { label: 'The World Islands', sublabel: 'Dubai, Uni Emirat Arab' },
  grandCanyon: { label: 'Grand Canyon', sublabel: 'Arizona, Amerika Serikat' },
  meteorCrater: { label: 'Kawah Meteor', sublabel: 'Arizona, Amerika Serikat' },
  lowerManhattan: { label: 'Lower Manhattan', sublabel: 'New York, Amerika Serikat' },
  lasVegasStrip: { label: 'Las Vegas Strip', sublabel: 'Nevada, Amerika Serikat' },
  hooverDam: { label: 'Bendungan Hoover dan Danau Mead', sublabel: 'Nevada dan Arizona, Amerika Serikat' },
  goldenGate: { label: 'Golden Gate', sublabel: 'San Francisco, Amerika Serikat' },
  kennedySpaceCenter: { label: 'Pusat Antariksa Kennedy', sublabel: 'Florida, Amerika Serikat' },
  washingtonDc: { label: 'Washington, D.C.', sublabel: 'National Mall, Amerika Serikat' },
  mountStHelens: { label: 'Gunung St. Helens', sublabel: 'Washington, Amerika Serikat' },
  niagaraFalls: { label: 'Air Terjun Niagara', sublabel: 'Ontario, Kanada' },
  panamaCanal: { label: 'Terusan Panama', sublabel: 'Pintu Air Gatun, Panama' },
  rioDeJaneiro: { label: 'Rio de Janeiro', sublabel: 'Sugarloaf dan Copacabana, Brasil' },
  paris: { label: 'Paris', sublabel: 'Île-de-France, Prancis' },
  venice: { label: 'Venesia', sublabel: 'Veneto, Italia' },
  vesuvius: { label: 'Gunung Vesuvius', sublabel: 'Napoli, Italia' },
  istanbul: { label: 'Istanbul', sublabel: 'Selat Bosporus, Turki' },
  chernobyl: { label: 'Chernobyl', sublabel: 'Oblast Kyiv, Ukraina' },
  tableMountain: { label: 'Gunung Meja', sublabel: 'Cape Town, Afrika Selatan' },
  kilimanjaro: { label: 'Gunung Kilimanjaro', sublabel: 'Kilimanjaro, Tanzania' },
  everest: { label: 'Gunung Everest', sublabel: 'Nepal dan Tiongkok' },
  angkorWat: { label: 'Angkor Wat', sublabel: 'Siem Reap, Kamboja' },
  singapore: { label: 'Singapura', sublabel: 'Marina Bay, Singapura' },
  hongKong: { label: 'Hong Kong', sublabel: 'Pelabuhan Victoria, Hong Kong' },
  tokyo: { label: 'Tokyo', sublabel: 'Tokyo, Jepang' },
  fuji: { label: 'Gunung Fuji', sublabel: 'Shizuoka, Jepang' },
  sydneyHarbour: { label: 'Pelabuhan Sydney', sublabel: 'Sydney, Australia' },
  richat: { label: 'Struktur Richat', sublabel: 'Sahara, Mauritania' },
  greatBlueHole: { label: 'Great Blue Hole', sublabel: 'Lighthouse Reef, Belize' },
  boraBora: { label: 'Bora Bora', sublabel: 'Kepulauan Society, Polinesia Prancis' },
  hardyReef: { label: 'Hardy Reef', sublabel: 'Karang Penghalang Besar, Australia' },
  male: { label: 'Malé', sublabel: 'Atol Malé Utara, Maladewa' },
  deadSea: { label: 'Kolam Garam Laut Mati', sublabel: 'Cekungan selatan, Israel dan Yordania' },
  binghamCanyon: { label: 'Tambang Bingham Canyon', sublabel: 'Utah, Amerika Serikat' },
  mountWhaleback: { label: 'Tambang Mount Whaleback', sublabel: 'Pilbara, Australia' },
  etna: { label: 'Gunung Etna', sublabel: 'Sisilia, Italia' },
  santorini: { label: 'Santorini', sublabel: 'Kiklades, Yunani' },
  teide: { label: 'Gunung Teide', sublabel: 'Tenerife, Spanyol' },
  kilauea: { label: 'Kīlauea', sublabel: 'Hawaii, Amerika Serikat' },
  craterLake: { label: 'Crater Lake', sublabel: 'Oregon, Amerika Serikat' },
  glenCanyonDam: { label: 'Bendungan Glen Canyon', sublabel: 'Page, Arizona, Amerika Serikat' },
  gardenCity: { label: 'Ladang Bundar Garden City', sublabel: 'Kansas, Amerika Serikat' },
  almeria: { label: 'Rumah Kaca Almería', sublabel: 'Andalusia, Spanyol' },
  gibraltar: { label: 'Gibraltar', sublabel: 'Selat Gibraltar' },
  suezCanal: { label: 'Terusan Suez', sublabel: 'Ismailia, Mesir' },
  aswanDam: { label: 'Bendungan Tinggi Aswan', sublabel: 'Danau Nasser, Mesir' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Aqaba, Yordania' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'Gurun Namib, Namibia' },
  victoriaFalls: { label: 'Air Terjun Victoria', sublabel: 'Zambia dan Zimbabwe' },
  threeGorges: { label: 'Bendungan Tiga Ngarai', sublabel: 'Hubei, Tiongkok' },
  shanghai: { label: 'Shanghai', sublabel: 'Sungai Huangpu, Tiongkok' },
  itaipu: { label: 'Bendungan Itaipu', sublabel: 'Brasil dan Paraguay' },
}

export default places
