/**
 * Spanish names for the curated places: the landing's three example chips and the *Sorpréndeme* pool (see
 * src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/es.md §8, whose table gives every name here).
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the established
 * Spanish exonym where one exists (*Pirámides de Guiza*, *Cataratas del Niágara*, *Estambul*, *Chernóbil*) and the
 * original otherwise (*Palm Jumeirah*, *Las Vegas Strip*, *Wadi Rum*). Inside a name the generic noun is lowercase
 * (*Presa Hoover y lago Mead*, *Salinas del mar Muerto*); only the first letter of a label or sublabel is capital, as
 * any label starts (§6). "Crop circles" are irrigated round fields, *campos circulares*; *Represa* for Itaipú is the
 * local usage, *Presa* everywhere else. Ukrainian places use the established Spanish forms (*Óblast de Kiev*),
 * *Türkiye* is *Turquía*, *Dubái*, *Hawái* and *Sídney* take their accents. Sublabels go most specific first, with
 * commas and *y*. Stats, lookups and shares keep the English label (Place.canonicalLabel), so nothing here splits a
 * count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Área 51', label: 'Área 51', sublabel: 'Groom Lake, Nevada, Estados Unidos' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'Nueva York, Estados Unidos' },
  giza: { chip: 'Guiza', label: 'Pirámides de Guiza', sublabel: 'Guiza, Egipto' },
  // "Sorpréndeme"
  uluru: { label: 'Uluru', sublabel: 'Territorio del Norte, Australia' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubái, Emiratos Árabes Unidos' },
  worldIslands: { label: 'Islas The World', sublabel: 'Dubái, Emiratos Árabes Unidos' },
  grandCanyon: { label: 'Gran Cañón', sublabel: 'Arizona, Estados Unidos' },
  meteorCrater: { label: 'Cráter Barringer', sublabel: 'Arizona, Estados Unidos' },
  lowerManhattan: { label: 'Bajo Manhattan', sublabel: 'Nueva York, Estados Unidos' },
  lasVegasStrip: { label: 'Las Vegas Strip', sublabel: 'Nevada, Estados Unidos' },
  hooverDam: { label: 'Presa Hoover y lago Mead', sublabel: 'Nevada y Arizona, Estados Unidos' },
  goldenGate: { label: 'Golden Gate', sublabel: 'San Francisco, Estados Unidos' },
  kennedySpaceCenter: { label: 'Centro Espacial Kennedy', sublabel: 'Florida, Estados Unidos' },
  /** The no-break space keeps "D. C." on one line */
  washingtonDc: { label: 'Washington D. C.', sublabel: 'National Mall, Estados Unidos' },
  mountStHelens: { label: 'Monte Santa Helena', sublabel: 'Washington, Estados Unidos' },
  niagaraFalls: { label: 'Cataratas del Niágara', sublabel: 'Ontario, Canadá' },
  panamaCanal: { label: 'Canal de Panamá', sublabel: 'Esclusas de Gatún, Panamá' },
  rioDeJaneiro: { label: 'Río de Janeiro', sublabel: 'Pan de Azúcar y Copacabana, Brasil' },
  paris: { label: 'París', sublabel: 'Isla de Francia, Francia' },
  venice: { label: 'Venecia', sublabel: 'Véneto, Italia' },
  vesuvius: { label: 'Vesubio', sublabel: 'Nápoles, Italia' },
  istanbul: { label: 'Estambul', sublabel: 'Bósforo, Turquía' },
  chernobyl: { label: 'Chernóbil', sublabel: 'Óblast de Kiev, Ucrania' },
  tableMountain: { label: 'Montaña de la Mesa', sublabel: 'Ciudad del Cabo, Sudáfrica' },
  kilimanjaro: { label: 'Kilimanjaro', sublabel: 'Kilimanjaro, Tanzania' },
  everest: { label: 'Monte Everest', sublabel: 'Nepal y China' },
  angkorWat: { label: 'Angkor Wat', sublabel: 'Siem Reap, Camboya' },
  singapore: { label: 'Singapur', sublabel: 'Marina Bay, Singapur' },
  hongKong: { label: 'Hong Kong', sublabel: 'Puerto de Victoria, Hong Kong' },
  tokyo: { label: 'Tokio', sublabel: 'Tokio, Japón' },
  fuji: { label: 'Monte Fuji', sublabel: 'Shizuoka, Japón' },
  sydneyHarbour: { label: 'Puerto de Sídney', sublabel: 'Sídney, Australia' },
  richat: { label: 'Estructura de Richat', sublabel: 'Sáhara, Mauritania' },
  greatBlueHole: { label: 'Gran Agujero Azul', sublabel: 'Lighthouse Reef, Belice' },
  boraBora: { label: 'Bora Bora', sublabel: 'Islas de la Sociedad, Polinesia Francesa' },
  hardyReef: { label: 'Arrecife Hardy', sublabel: 'Gran Barrera de Coral, Australia' },
  male: { label: 'Malé', sublabel: 'Atolón Malé Norte, Maldivas' },
  deadSea: { label: 'Salinas del mar Muerto', sublabel: 'Cuenca sur, Israel y Jordania' },
  binghamCanyon: { label: 'Mina de Bingham Canyon', sublabel: 'Utah, Estados Unidos' },
  mountWhaleback: { label: 'Mina de Mount Whaleback', sublabel: 'Pilbara, Australia' },
  etna: { label: 'Etna', sublabel: 'Sicilia, Italia' },
  santorini: { label: 'Santorini', sublabel: 'Cícladas, Grecia' },
  teide: { label: 'Teide', sublabel: 'Tenerife, España' },
  kilauea: { label: 'Kilauea', sublabel: 'Hawái, Estados Unidos' },
  craterLake: { label: 'Lago del Cráter', sublabel: 'Oregón, Estados Unidos' },
  glenCanyonDam: { label: 'Presa del Glen Canyon', sublabel: 'Page, Arizona, Estados Unidos' },
  gardenCity: { label: 'Campos circulares de Garden City', sublabel: 'Kansas, Estados Unidos' },
  almeria: { label: 'Invernaderos de Almería', sublabel: 'Andalucía, España' },
  gibraltar: { label: 'Gibraltar', sublabel: 'Estrecho de Gibraltar' },
  suezCanal: { label: 'Canal de Suez', sublabel: 'Ismailía, Egipto' },
  aswanDam: { label: 'Presa de Asuán', sublabel: 'Lago Nasser, Egipto' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Áqaba, Jordania' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'Desierto del Namib, Namibia' },
  victoriaFalls: { label: 'Cataratas Victoria', sublabel: 'Zambia y Zimbabue' },
  threeGorges: { label: 'Presa de las Tres Gargantas', sublabel: 'Hubei, China' },
  shanghai: { label: 'Shanghái', sublabel: 'Río Huangpu, China' },
  itaipu: { label: 'Represa de Itaipú', sublabel: 'Brasil y Paraguay' },
}

export default places
