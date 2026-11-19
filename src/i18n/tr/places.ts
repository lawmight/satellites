/**
 * Turkish names for the curated places: the landing's three example chips and the *Beni şaşırt* pool (see
 * src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/tr.md §3.12, whose table gives every name here).
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the established
 * Turkish exonym where Turkish has one (*Gize Piramitleri, Büyük Kanyon, Niagara Şelalesi, Venedik, Vezüv Yanardağı,
 * Çernobil, Cebelitarık, Süveyş Kanalı, Şanghay*) and the name as it is otherwise (*Palm Jumeirah, Las Vegas Strip,
 * Wadi Rum, Golden Gate*). A generic noun that belongs to the established name is capitalised (*Masa Dağı, Büyük Mavi
 * Delik, Hoover Barajı*); one that only describes the place is lowercase (*Almería seraları, Lut Gölü tuz havuzları,
 * Garden City dairesel tarlaları*: centre-pivot fields, never *ekin çemberleri*, which are crop circles). Sublabels go
 * most specific first, with commas and *ve*, and write *ABD* and *BAE*, universal in Turkish and as short as the
 * English. Ukrainian places keep the gazetteer's form (*Kyiv Oblastı*, §8.4), and *İstanbul* is spelt the Turkish way
 * here, unlike the GeoNames labels (§8.5). The chips stay short on a 390 px phone (*Gize*). Stats, lookups and shares
 * keep the English label (Place.canonicalLabel), so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Area 51', label: 'Area 51', sublabel: 'Groom Gölü, Nevada, ABD' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'New York, ABD' },
  giza: { chip: 'Gize', label: 'Gize Piramitleri', sublabel: 'Gize, Mısır' },
  // "Beni şaşırt"
  uluru: { label: 'Uluru', sublabel: 'Kuzey Bölgesi, Avustralya' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubai, BAE' },
  worldIslands: { label: 'Dünya Adaları', sublabel: 'Dubai, BAE' },
  grandCanyon: { label: 'Büyük Kanyon', sublabel: 'Arizona, ABD' },
  meteorCrater: { label: 'Meteor Krateri', sublabel: 'Arizona, ABD' },
  lowerManhattan: { label: 'Aşağı Manhattan', sublabel: 'New York, ABD' },
  lasVegasStrip: { label: 'Las Vegas Strip', sublabel: 'Nevada, ABD' },
  hooverDam: { label: 'Hoover Barajı ve Mead Gölü', sublabel: 'Nevada ve Arizona, ABD' },
  goldenGate: { label: 'Golden Gate', sublabel: 'San Francisco, ABD' },
  kennedySpaceCenter: { label: 'Kennedy Uzay Merkezi', sublabel: 'Florida, ABD' },
  washingtonDc: { label: 'Washington, D.C.', sublabel: 'National Mall, ABD' },
  mountStHelens: { label: 'St. Helens Dağı', sublabel: 'Washington, ABD' },
  niagaraFalls: { label: 'Niagara Şelalesi', sublabel: 'Ontario, Kanada' },
  /** §3.12 gives *Gatun* (the locks' town and lake) for the English "Gatun Locks" */
  panamaCanal: { label: 'Panama Kanalı', sublabel: 'Gatun, Panama' },
  rioDeJaneiro: { label: 'Rio de Janeiro', sublabel: 'Pão de Açúcar ve Copacabana, Brezilya' },
  paris: { label: 'Paris', sublabel: 'Île-de-France, Fransa' },
  venice: { label: 'Venedik', sublabel: 'Veneto, İtalya' },
  vesuvius: { label: 'Vezüv Yanardağı', sublabel: 'Napoli, İtalya' },
  /** The strait, not *Boğaziçi* (the region) */
  istanbul: { label: 'İstanbul', sublabel: 'İstanbul Boğazı, Türkiye' },
  chernobyl: { label: 'Çernobil', sublabel: 'Kyiv Oblastı, Ukrayna' },
  tableMountain: { label: 'Masa Dağı', sublabel: 'Cape Town, Güney Afrika' },
  kilimanjaro: { label: 'Kilimanjaro', sublabel: 'Kilimanjaro, Tanzanya' },
  everest: { label: 'Everest Dağı', sublabel: 'Nepal ve Çin' },
  angkorWat: { label: 'Angkor Wat', sublabel: 'Siem Reap, Kamboçya' },
  singapore: { label: 'Singapur', sublabel: 'Marina Bay, Singapur' },
  hongKong: { label: 'Hong Kong', sublabel: 'Victoria Limanı, Hong Kong' },
  tokyo: { label: 'Tokyo', sublabel: 'Tokyo, Japonya' },
  fuji: { label: 'Fuji Dağı', sublabel: 'Shizuoka, Japonya' },
  sydneyHarbour: { label: 'Sidney Limanı', sublabel: 'Sidney, Avustralya' },
  richat: { label: 'Richat Yapısı', sublabel: 'Sahra, Moritanya' },
  greatBlueHole: { label: 'Büyük Mavi Delik', sublabel: 'Lighthouse Resifi, Belize' },
  /** §3.12 gives the territory alone for the English "Society Islands, French Polynesia" */
  boraBora: { label: 'Bora Bora', sublabel: 'Fransız Polinezyası' },
  hardyReef: { label: 'Hardy Resifi', sublabel: 'Büyük Set Resifi, Avustralya' },
  male: { label: 'Malé', sublabel: 'Kuzey Malé Atolü, Maldivler' },
  deadSea: { label: 'Lut Gölü tuz havuzları', sublabel: 'Güney havzası, İsrail ve Ürdün' },
  binghamCanyon: { label: 'Bingham Canyon Madeni', sublabel: 'Utah, ABD' },
  mountWhaleback: { label: 'Mount Whaleback Madeni', sublabel: 'Pilbara, Avustralya' },
  etna: { label: 'Etna Yanardağı', sublabel: 'Sicilya, İtalya' },
  santorini: { label: 'Santorini', sublabel: 'Kiklad Adaları, Yunanistan' },
  teide: { label: 'Teide', sublabel: 'Tenerife, İspanya' },
  kilauea: { label: 'Kīlauea', sublabel: 'Hawaii, ABD' },
  craterLake: { label: 'Crater Gölü', sublabel: 'Oregon, ABD' },
  glenCanyonDam: { label: 'Glen Canyon Barajı', sublabel: 'Page, Arizona, ABD' },
  gardenCity: { label: 'Garden City dairesel tarlaları', sublabel: 'Kansas, ABD' },
  almeria: { label: 'Almería seraları', sublabel: 'Endülüs, İspanya' },
  gibraltar: { label: 'Cebelitarık', sublabel: 'Cebelitarık Boğazı' },
  suezCanal: { label: 'Süveyş Kanalı', sublabel: 'İsmailiye, Mısır' },
  aswanDam: { label: 'Asvan Yüksek Barajı', sublabel: 'Nasır Gölü, Mısır' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Akabe, Ürdün' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'Namib Çölü, Namibya' },
  victoriaFalls: { label: 'Victoria Şelalesi', sublabel: 'Zambiya ve Zimbabve' },
  threeGorges: { label: 'Üç Boğaz Barajı', sublabel: 'Hubei, Çin' },
  shanghai: { label: 'Şanghay', sublabel: 'Huangpu Nehri, Çin' },
  itaipu: { label: 'Itaipu Barajı', sublabel: 'Brezilya ve Paraguay' },
}

export default places
