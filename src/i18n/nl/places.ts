/**
 * Dutch names for the curated places: the landing's three example chips and the `Verras me` pool (see
 * src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/nl.md §4.4, whose table gives every name here).
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the established
 * Dutch exonym where one exists (the Taalunie list of foreign place names: `Gizeh`, `Parijs`, `Venetië`, `Tokio`,
 * `Tafelberg`, `Niagarawatervallen`) and stays as it is otherwise (`Palm Jumeirah`, `Las Vegas Strip`, `Wadi Rum`).
 * Country names are `Intl.DisplayNames('nl')`'s (`Verenigde Staten`, `Turkije`, `Oekraïne`), except `Hongkong`, written
 * by hand (§8). Ukrainian places take the spelling Dutch and Flemish public media use (`Oblast Kyiv`). Dutch closes
 * compounds and hyphenates after a multi-word name (`Glen Canyon-dam`, `The World-eilanden`, §6). "Crop circles" are
 * irrigated round fields, `Ronde akkers`, never `graancirkels` (§4.4). Sublabels go most specific first, with commas
 * and `en`. Stats, lookups and shares keep the English label (Place.canonicalLabel), so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Area 51', label: 'Area 51', sublabel: 'Groom Lake, Nevada, Verenigde Staten' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'New York, Verenigde Staten' },
  giza: { chip: 'Gizeh', label: 'Piramides van Gizeh', sublabel: 'Gizeh, Egypte' },
  // "Verras me"
  uluru: { label: 'Uluru', sublabel: 'Noordelijk Territorium, Australië' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubai, Verenigde Arabische Emiraten' },
  worldIslands: { label: 'The World-eilanden', sublabel: 'Dubai, Verenigde Arabische Emiraten' },
  grandCanyon: { label: 'Grand Canyon', sublabel: 'Arizona, Verenigde Staten' },
  meteorCrater: { label: 'Meteor Crater', sublabel: 'Arizona, Verenigde Staten' },
  lowerManhattan: { label: 'Lower Manhattan', sublabel: 'New York, Verenigde Staten' },
  lasVegasStrip: { label: 'Las Vegas Strip', sublabel: 'Nevada, Verenigde Staten' },
  hooverDam: { label: 'Hooverdam en Lake Mead', sublabel: 'Nevada en Arizona, Verenigde Staten' },
  goldenGate: { label: 'Golden Gate', sublabel: 'San Francisco, Verenigde Staten' },
  kennedySpaceCenter: { label: 'Kennedy Space Center', sublabel: 'Florida, Verenigde Staten' },
  washingtonDc: { label: 'Washington D.C.', sublabel: 'National Mall, Verenigde Staten' },
  mountStHelens: { label: 'Mount St. Helens', sublabel: 'Washington, Verenigde Staten' },
  niagaraFalls: { label: 'Niagarawatervallen', sublabel: 'Ontario, Canada' },
  panamaCanal: { label: 'Panamakanaal', sublabel: 'Gatunsluizen, Panama' },
  rioDeJaneiro: { label: 'Rio de Janeiro', sublabel: 'Suikerbroodberg en Copacabana, Brazilië' },
  paris: { label: 'Parijs', sublabel: 'Île-de-France, Frankrijk' },
  venice: { label: 'Venetië', sublabel: 'Veneto, Italië' },
  vesuvius: { label: 'Vesuvius', sublabel: 'Napels, Italië' },
  istanbul: { label: 'Istanbul', sublabel: 'Bosporus, Turkije' },
  chernobyl: { label: 'Tsjernobyl', sublabel: 'Oblast Kyiv, Oekraïne' },
  tableMountain: { label: 'Tafelberg', sublabel: 'Kaapstad, Zuid-Afrika' },
  kilimanjaro: { label: 'Kilimanjaro', sublabel: 'Kilimanjaro, Tanzania' },
  everest: { label: 'Mount Everest', sublabel: 'Nepal en China' },
  angkorWat: { label: 'Angkor Wat', sublabel: 'Siem Reap, Cambodja' },
  singapore: { label: 'Singapore', sublabel: 'Marina Bay, Singapore' },
  hongKong: { label: 'Hongkong', sublabel: 'Victoria Harbour, Hongkong' },
  tokyo: { label: 'Tokio', sublabel: 'Tokio, Japan' },
  fuji: { label: 'Fuji', sublabel: 'Shizuoka, Japan' },
  sydneyHarbour: { label: 'Haven van Sydney', sublabel: 'Sydney, Australië' },
  richat: { label: 'Richatstructuur', sublabel: 'Sahara, Mauritanië' },
  greatBlueHole: { label: 'Great Blue Hole', sublabel: 'Lighthouse Reef, Belize' },
  boraBora: { label: 'Bora Bora', sublabel: 'Genootschapseilanden, Frans-Polynesië' },
  hardyReef: { label: 'Hardy Reef', sublabel: 'Groot Barrièrerif, Australië' },
  male: { label: 'Malé', sublabel: 'Noord-Malé-atol, Maldiven' },
  deadSea: { label: 'Zoutpannen van de Dode Zee', sublabel: 'Zuidelijk bekken, Israël en Jordanië' },
  binghamCanyon: { label: 'Bingham Canyon-mijn', sublabel: 'Utah, Verenigde Staten' },
  mountWhaleback: { label: 'Mount Whaleback-mijn', sublabel: 'Pilbara, Australië' },
  etna: { label: 'Etna', sublabel: 'Sicilië, Italië' },
  santorini: { label: 'Santorini', sublabel: 'Cycladen, Griekenland' },
  teide: { label: 'Teide', sublabel: 'Tenerife, Spanje' },
  kilauea: { label: 'Kīlauea', sublabel: 'Hawaï, Verenigde Staten' },
  craterLake: { label: 'Crater Lake', sublabel: 'Oregon, Verenigde Staten' },
  glenCanyonDam: { label: 'Glen Canyon-dam', sublabel: 'Page, Arizona, Verenigde Staten' },
  gardenCity: { label: 'Ronde akkers van Garden City', sublabel: 'Kansas, Verenigde Staten' },
  almeria: { label: 'Kassen van Almería', sublabel: 'Andalusië, Spanje' },
  gibraltar: { label: 'Gibraltar', sublabel: 'Straat van Gibraltar' },
  suezCanal: { label: 'Suezkanaal', sublabel: 'Ismaïlia, Egypte' },
  aswanDam: { label: 'Aswandam', sublabel: 'Nassermeer, Egypte' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Akaba, Jordanië' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'Namibwoestijn, Namibië' },
  victoriaFalls: { label: 'Victoriawatervallen', sublabel: 'Zambia en Zimbabwe' },
  threeGorges: { label: 'Drieklovendam', sublabel: 'Hubei, China' },
  shanghai: { label: 'Shanghai', sublabel: 'Huangpu, China' },
  itaipu: { label: 'Itaipudam', sublabel: 'Brazilië en Paraguay' },
}

export default places
