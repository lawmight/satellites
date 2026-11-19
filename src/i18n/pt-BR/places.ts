/**
 * Brazilian Portuguese names for the curated places: the landing's three example chips and the *Surpreenda-me* pool
 * (see src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/pt-BR.md §8, which lists the names that have an
 * established Portuguese form).
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the established
 * Portuguese name where one exists (*Pirâmides de Gizé*, *Cataratas do Niágara*, *Veneza*, *Istambul*, *Usina de
 * Itaipu*, *Monte Santa Helena*, *Montanha da Mesa*) and the local or English name otherwise, as Brazilians write them
 * (*Central Park*, *Grand Canyon*, *Palm Jumeirah*, *Uluru*, *Sossusvlei*, *Lower Manhattan*). Where Brazil and
 * Portugal spell a name differently, the Brazilian form wins (*Nova York*, *Vêneto*, *Havaí*, *Represa Hoover*).
 * Country names are the ones Intl gives pt-BR (*Egito*, *Zimbábue*, *Turquia* for Türkiye), so a sublabel never
 * disagrees with a country shown elsewhere; Hong Kong is the bare *Hong Kong*, as the English has it. Ukrainian places
 * are kept out of static copy: Chernobyl's sublabel is *Norte da Ucrânia* (§8), so this list never spells a Ukrainian
 * city otherwise than the gazetteer does. Only the first letter of a label or sublabel is a capital where Portuguese
 * would not capitalise the word (*Bacia sul*); a lake, sea or mountain that is part of a proper name keeps its capital
 * (*Lago Mead*, *Mar Morto*). Chips stay under ~14 characters. Stats, lookups and shares keep the English label
 * (Place.canonicalLabel), so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Área 51', label: 'Área 51', sublabel: 'Groom Lake, Nevada, Estados Unidos' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'Nova York, Estados Unidos' },
  giza: { chip: 'Gizé', label: 'Pirâmides de Gizé', sublabel: 'Gizé, Egito' },
  // "Surpreenda-me"
  uluru: { label: 'Uluru', sublabel: 'Território do Norte, Austrália' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubai, Emirados Árabes Unidos' },
  worldIslands: { label: 'Ilhas The World', sublabel: 'Dubai, Emirados Árabes Unidos' },
  grandCanyon: { label: 'Grand Canyon', sublabel: 'Arizona, Estados Unidos' },
  meteorCrater: { label: 'Cratera de Barringer', sublabel: 'Arizona, Estados Unidos' },
  lowerManhattan: { label: 'Lower Manhattan', sublabel: 'Nova York, Estados Unidos' },
  lasVegasStrip: { label: 'Las Vegas Strip', sublabel: 'Nevada, Estados Unidos' },
  hooverDam: { label: 'Represa Hoover e Lago Mead', sublabel: 'Nevada e Arizona, Estados Unidos' },
  goldenGate: { label: 'Golden Gate', sublabel: 'São Francisco, Estados Unidos' },
  kennedySpaceCenter: { label: 'Centro Espacial Kennedy', sublabel: 'Flórida, Estados Unidos' },
  washingtonDc: { label: 'Washington, D.C.', sublabel: 'National Mall, Estados Unidos' },
  mountStHelens: { label: 'Monte Santa Helena', sublabel: 'Washington, Estados Unidos' },
  niagaraFalls: { label: 'Cataratas do Niágara', sublabel: 'Ontário, Canadá' },
  panamaCanal: { label: 'Canal do Panamá', sublabel: 'Eclusas de Gatún, Panamá' },
  rioDeJaneiro: { label: 'Rio de Janeiro', sublabel: 'Pão de Açúcar e Copacabana, Brasil' },
  paris: { label: 'Paris', sublabel: 'Île-de-France, França' },
  venice: { label: 'Veneza', sublabel: 'Vêneto, Itália' },
  vesuvius: { label: 'Monte Vesúvio', sublabel: 'Nápoles, Itália' },
  istanbul: { label: 'Istambul', sublabel: 'Bósforo, Turquia' },
  chernobyl: { label: 'Chernobyl', sublabel: 'Norte da Ucrânia' },
  tableMountain: { label: 'Montanha da Mesa', sublabel: 'Cidade do Cabo, África do Sul' },
  kilimanjaro: { label: 'Kilimanjaro', sublabel: 'Kilimanjaro, Tanzânia' },
  everest: { label: 'Monte Everest', sublabel: 'Nepal e China' },
  angkorWat: { label: 'Angkor Wat', sublabel: 'Siem Reap, Camboja' },
  singapore: { label: 'Singapura', sublabel: 'Marina Bay, Singapura' },
  hongKong: { label: 'Hong Kong', sublabel: 'Victoria Harbour, Hong Kong' },
  tokyo: { label: 'Tóquio', sublabel: 'Tóquio, Japão' },
  fuji: { label: 'Monte Fuji', sublabel: 'Shizuoka, Japão' },
  sydneyHarbour: { label: 'Porto de Sydney', sublabel: 'Sydney, Austrália' },
  richat: { label: 'Estrutura de Richat', sublabel: 'Saara, Mauritânia' },
  greatBlueHole: { label: 'Grande Buraco Azul', sublabel: 'Lighthouse Reef, Belize' },
  boraBora: { label: 'Bora Bora', sublabel: 'Ilhas da Sociedade, Polinésia Francesa' },
  hardyReef: { label: 'Hardy Reef', sublabel: 'Grande Barreira de Coral, Austrália' },
  male: { label: 'Malé', sublabel: 'Atol de Malé Norte, Maldivas' },
  deadSea: { label: 'Salinas do Mar Morto', sublabel: 'Bacia sul, Israel e Jordânia' },
  binghamCanyon: { label: 'Mina de Bingham Canyon', sublabel: 'Utah, Estados Unidos' },
  mountWhaleback: { label: 'Mina de Mount Whaleback', sublabel: 'Pilbara, Austrália' },
  etna: { label: 'Monte Etna', sublabel: 'Sicília, Itália' },
  santorini: { label: 'Santorini', sublabel: 'Cíclades, Grécia' },
  teide: { label: 'Teide', sublabel: 'Tenerife, Espanha' },
  kilauea: { label: 'Kilauea', sublabel: 'Havaí, Estados Unidos' },
  craterLake: { label: 'Crater Lake', sublabel: 'Oregon, Estados Unidos' },
  glenCanyonDam: { label: 'Represa Glen Canyon', sublabel: 'Page, Arizona, Estados Unidos' },
  /** Round irrigated fields (centre pivots), not the other kind of crop circle */
  gardenCity: { label: 'Plantações circulares de Garden City', sublabel: 'Kansas, Estados Unidos' },
  almeria: { label: 'Estufas de Almería', sublabel: 'Andaluzia, Espanha' },
  gibraltar: { label: 'Gibraltar', sublabel: 'Estreito de Gibraltar' },
  suezCanal: { label: 'Canal de Suez', sublabel: 'Ismaília, Egito' },
  aswanDam: { label: 'Represa de Assuã', sublabel: 'Lago Nasser, Egito' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Aqaba, Jordânia' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'Deserto do Namibe, Namíbia' },
  victoriaFalls: { label: 'Cataratas Vitória', sublabel: 'Zâmbia e Zimbábue' },
  threeGorges: { label: 'Usina de Três Gargantas', sublabel: 'Hubei, China' },
  shanghai: { label: 'Xangai', sublabel: 'Rio Huangpu, China' },
  itaipu: { label: 'Usina de Itaipu', sublabel: 'Brasil e Paraguai' },
}

export default places
