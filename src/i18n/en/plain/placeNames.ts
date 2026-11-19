/**
 * The curated places' English names: the landing's three example chips and the "Surprise me" pool, by a stable id. This
 * is the English text of the 'places' namespace (../places.ts wraps it; translate it into src/i18n/<locale>/places.ts,
 * one entry per id, with the same fields).
 *
 * Why it sits apart, in plain/: scripts/build-places.ts reads these names under plain Node (the offline place list
 * carries the same English names), through src/ui/landing/places.ts, and Node cannot load the i18n runtime that
 * ../places.ts imports. So this module imports nothing. Not a namespace itself: never translate this file as one.
 *
 * Fields (a translation gives every id the same ones):
 *   chip      the example chip's text (the first three only): mono caps (by CSS), one short line on a 390 px phone,
 *             keep it under ~14 characters. Usually the place's shortest common name ("Giza")
 *   label     the place's name as readers of your language know it (the usual exonym: "Pyramides de Gizeh",
 *             "ギザの三大ピラミッド"); the chip's accessible name and, once picked, the results header's title
 *   sublabel  where it is, most specific first, in your language's own list style (commas here); shown under the name
 *             (the chip's hover hint, the results header) and read with it by screen readers
 *
 * The English labels must stay unique: they are what a curated place is known by (Place.canonicalLabel) in usage
 * stats, record_lookup and links, and how "Surprise me" avoids the same place twice in a row. Translated labels need
 * not be unique: a translation only changes what is shown.
 */
export const CURATED_NAMES = {
  // The example chips
  area51: { chip: 'Area 51', label: 'Area 51', sublabel: 'Groom Lake, Nevada, United States' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'New York, United States' },
  giza: { chip: 'Giza', label: 'Pyramids of Giza', sublabel: 'Giza, Egypt' },
  // "Surprise me"
  uluru: { label: 'Uluru', sublabel: 'Northern Territory, Australia' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubai, United Arab Emirates' },
  worldIslands: { label: 'The World Islands', sublabel: 'Dubai, United Arab Emirates' },
  grandCanyon: { label: 'Grand Canyon', sublabel: 'Arizona, United States' },
  meteorCrater: { label: 'Meteor Crater', sublabel: 'Arizona, United States' },
  lowerManhattan: { label: 'Lower Manhattan', sublabel: 'New York, United States' },
  lasVegasStrip: { label: 'Las Vegas Strip', sublabel: 'Nevada, United States' },
  hooverDam: { label: 'Hoover Dam and Lake Mead', sublabel: 'Nevada and Arizona, United States' },
  goldenGate: { label: 'Golden Gate', sublabel: 'San Francisco, United States' },
  kennedySpaceCenter: { label: 'Kennedy Space Center', sublabel: 'Florida, United States' },
  washingtonDc: { label: 'Washington, D.C.', sublabel: 'The National Mall, United States' },
  mountStHelens: { label: 'Mount St. Helens', sublabel: 'Washington, United States' },
  niagaraFalls: { label: 'Niagara Falls', sublabel: 'Ontario, Canada' },
  panamaCanal: { label: 'Panama Canal', sublabel: 'Gatun Locks, Panama' },
  rioDeJaneiro: { label: 'Rio de Janeiro', sublabel: 'Sugarloaf and Copacabana, Brazil' },
  paris: { label: 'Paris', sublabel: 'Île-de-France, France' },
  venice: { label: 'Venice', sublabel: 'Veneto, Italy' },
  vesuvius: { label: 'Mount Vesuvius', sublabel: 'Naples, Italy' },
  istanbul: { label: 'Istanbul', sublabel: 'The Bosphorus, Türkiye' },
  chernobyl: { label: 'Chernobyl', sublabel: 'Kyiv Oblast, Ukraine' },
  tableMountain: { label: 'Table Mountain', sublabel: 'Cape Town, South Africa' },
  kilimanjaro: { label: 'Kilimanjaro', sublabel: 'Kilimanjaro, Tanzania' },
  everest: { label: 'Mount Everest', sublabel: 'Nepal and China' },
  angkorWat: { label: 'Angkor Wat', sublabel: 'Siem Reap, Cambodia' },
  singapore: { label: 'Singapore', sublabel: 'Marina Bay, Singapore' },
  hongKong: { label: 'Hong Kong', sublabel: 'Victoria Harbour, Hong Kong' },
  tokyo: { label: 'Tokyo', sublabel: 'Tokyo, Japan' },
  fuji: { label: 'Mount Fuji', sublabel: 'Shizuoka, Japan' },
  sydneyHarbour: { label: 'Sydney Harbour', sublabel: 'Sydney, Australia' },
  richat: { label: 'Richat Structure', sublabel: 'Sahara, Mauritania' },
  greatBlueHole: { label: 'Great Blue Hole', sublabel: 'Lighthouse Reef, Belize' },
  boraBora: { label: 'Bora Bora', sublabel: 'Society Islands, French Polynesia' },
  hardyReef: { label: 'Hardy Reef', sublabel: 'Great Barrier Reef, Australia' },
  male: { label: 'Malé', sublabel: 'North Malé Atoll, Maldives' },
  deadSea: { label: 'Dead Sea Salt Ponds', sublabel: 'Southern basin, Israel and Jordan' },
  binghamCanyon: { label: 'Bingham Canyon Mine', sublabel: 'Utah, United States' },
  mountWhaleback: { label: 'Mount Whaleback Mine', sublabel: 'Pilbara, Australia' },
  etna: { label: 'Mount Etna', sublabel: 'Sicily, Italy' },
  santorini: { label: 'Santorini', sublabel: 'Cyclades, Greece' },
  teide: { label: 'Teide', sublabel: 'Tenerife, Spain' },
  kilauea: { label: 'Kīlauea', sublabel: 'Hawaii, United States' },
  craterLake: { label: 'Crater Lake', sublabel: 'Oregon, United States' },
  glenCanyonDam: { label: 'Glen Canyon Dam', sublabel: 'Page, Arizona, United States' },
  gardenCity: { label: 'Garden City Crop Circles', sublabel: 'Kansas, United States' },
  almeria: { label: 'Almería Greenhouses', sublabel: 'Andalusia, Spain' },
  gibraltar: { label: 'Gibraltar', sublabel: 'Strait of Gibraltar' },
  suezCanal: { label: 'Suez Canal', sublabel: 'Ismailia, Egypt' },
  aswanDam: { label: 'Aswan High Dam', sublabel: 'Lake Nasser, Egypt' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Aqaba, Jordan' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'Namib Desert, Namibia' },
  victoriaFalls: { label: 'Victoria Falls', sublabel: 'Zambia and Zimbabwe' },
  threeGorges: { label: 'Three Gorges Dam', sublabel: 'Hubei, China' },
  shanghai: { label: 'Shanghai', sublabel: 'The Huangpu River, China' },
  itaipu: { label: 'Itaipu Dam', sublabel: 'Brazil and Paraguay' },
}
