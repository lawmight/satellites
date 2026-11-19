/**
 * French names for the curated places: the landing's three example chips and the «Au hasard» pool (see
 * src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/fr.md §4.3, which gives every name here).
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the French exonym
 * where one exists (*Venise*, *Vésuve*, *Pyramides de Gizeh*, *Angkor Vat*) and keeps the English name where French
 * readers use it (*Central Park*, *Meteor Crater*, *Palm Jumeirah*). No leading article, and the first word is a
 * capital because the label is a title: it goes into [PLACE] slots in the serif, where a bare title reads as a name
 * (*256 satellites ont observé Pyramides de Gizeh*). Chips stay under 14 characters (*Zone 51*, *Gizeh*). Countries
 * are `Intl.DisplayNames('fr')`'s long names (Hong Kong its short one, §6.8); *Kyiv* and *Tchernobyl* as §8 decides;
 * the salt ponds keep the English source's *Israël et Jordanie*. *Kīlauea* keeps its macron, as in English. Usage
 * stats, lookups and shares keep the English label (Place.canonicalLabel), so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Zone 51', label: 'Zone 51', sublabel: 'Groom Lake, Nevada, États-Unis' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'New York, États-Unis' },
  giza: { chip: 'Gizeh', label: 'Pyramides de Gizeh', sublabel: 'Gizeh, Égypte' },
  // «Au hasard»
  uluru: { label: 'Uluru', sublabel: 'Territoire du Nord, Australie' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubaï, Émirats arabes unis' },
  worldIslands: { label: 'Archipel The World', sublabel: 'Dubaï, Émirats arabes unis' },
  grandCanyon: { label: 'Grand Canyon', sublabel: 'Arizona, États-Unis' },
  meteorCrater: { label: 'Meteor Crater', sublabel: 'Arizona, États-Unis' },
  lowerManhattan: { label: 'Lower Manhattan', sublabel: 'New York, États-Unis' },
  lasVegasStrip: { label: 'Strip de Las Vegas', sublabel: 'Nevada, États-Unis' },
  hooverDam: { label: 'Barrage Hoover et lac Mead', sublabel: 'Nevada et Arizona, États-Unis' },
  goldenGate: { label: 'Golden Gate', sublabel: 'San Francisco, États-Unis' },
  kennedySpaceCenter: { label: 'Centre spatial Kennedy', sublabel: 'Floride, États-Unis' },
  washingtonDc: { label: 'Washington', sublabel: 'National Mall, États-Unis' },
  mountStHelens: { label: 'Mont Saint Helens', sublabel: 'État de Washington, États-Unis' },
  niagaraFalls: { label: 'Chutes du Niagara', sublabel: 'Ontario, Canada' },
  panamaCanal: { label: 'Canal de Panama', sublabel: 'Écluses de Gatún, Panama' },
  rioDeJaneiro: { label: 'Rio de Janeiro', sublabel: 'Pain de Sucre et Copacabana, Brésil' },
  paris: { label: 'Paris', sublabel: 'Île-de-France, France' },
  venice: { label: 'Venise', sublabel: 'Vénétie, Italie' },
  vesuvius: { label: 'Vésuve', sublabel: 'Naples, Italie' },
  istanbul: { label: 'Istanbul', sublabel: 'Bosphore, Turquie' },
  chernobyl: { label: 'Tchernobyl', sublabel: 'Oblast de Kyiv, Ukraine' },
  tableMountain: { label: 'Montagne de la Table', sublabel: 'Le Cap, Afrique du Sud' },
  kilimanjaro: { label: 'Kilimandjaro', sublabel: 'Kilimandjaro, Tanzanie' },
  everest: { label: 'Mont Everest', sublabel: 'Népal et Chine' },
  angkorWat: { label: 'Angkor Vat', sublabel: 'Siem Reap, Cambodge' },
  singapore: { label: 'Singapour', sublabel: 'Marina Bay, Singapour' },
  hongKong: { label: 'Hong Kong', sublabel: 'Port Victoria, Hong Kong' },
  tokyo: { label: 'Tokyo', sublabel: 'Tokyo, Japon' },
  fuji: { label: 'Mont Fuji', sublabel: 'Shizuoka, Japon' },
  sydneyHarbour: { label: 'Port de Sydney', sublabel: 'Sydney, Australie' },
  richat: { label: 'Structure de Richat', sublabel: 'Sahara, Mauritanie' },
  greatBlueHole: { label: 'Grand Trou bleu', sublabel: 'Lighthouse Reef, Belize' },
  boraBora: { label: 'Bora-Bora', sublabel: 'Îles de la Société, Polynésie française' },
  hardyReef: { label: 'Hardy Reef', sublabel: 'Grande Barrière de corail, Australie' },
  male: { label: 'Malé', sublabel: 'Atoll de Malé Nord, Maldives' },
  deadSea: { label: 'Salines de la mer Morte', sublabel: 'Bassin sud, Israël et Jordanie' },
  binghamCanyon: { label: 'Mine de Bingham Canyon', sublabel: 'Utah, États-Unis' },
  mountWhaleback: { label: 'Mine du mont Whaleback', sublabel: 'Pilbara, Australie' },
  etna: { label: 'Etna', sublabel: 'Sicile, Italie' },
  santorini: { label: 'Santorin', sublabel: 'Cyclades, Grèce' },
  teide: { label: 'Teide', sublabel: 'Tenerife, Espagne' },
  kilauea: { label: 'Kīlauea', sublabel: 'Hawaï, États-Unis' },
  craterLake: { label: 'Crater Lake', sublabel: 'Oregon, États-Unis' },
  glenCanyonDam: { label: 'Barrage de Glen Canyon', sublabel: 'Page, Arizona, États-Unis' },
  gardenCity: { label: 'Champs circulaires de Garden City', sublabel: 'Kansas, États-Unis' },
  almeria: { label: 'Serres d’Almería', sublabel: 'Andalousie, Espagne' },
  gibraltar: { label: 'Gibraltar', sublabel: 'Détroit de Gibraltar' },
  suezCanal: { label: 'Canal de Suez', sublabel: 'Ismaïlia, Égypte' },
  aswanDam: { label: 'Haut barrage d’Assouan', sublabel: 'Lac Nasser, Égypte' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Aqaba, Jordanie' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'Désert du Namib, Namibie' },
  victoriaFalls: { label: 'Chutes Victoria', sublabel: 'Zambie et Zimbabwe' },
  threeGorges: { label: 'Barrage des Trois-Gorges', sublabel: 'Hubei, Chine' },
  shanghai: { label: 'Shanghai', sublabel: 'Rivière Huangpu, Chine' },
  itaipu: { label: 'Barrage d’Itaipu', sublabel: 'Brésil et Paraguay' },
}

export default places
