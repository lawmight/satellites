/**
 * Vietnamese names for the curated places: the landing's three example chips and the "Ngẫu nhiên" pool (see
 * src/i18n/en/plain/placeNames.ts for the fields, and docs/i18n/vi.md §4.3, which gives every name here).
 *
 * Why these are translated when no other place name is: they are copy, chosen by us, so each takes the name Vietnamese
 * readers know (*Kênh đào Suez*, *Núi Phú Sĩ*, *Cầu Cổng Vàng*, *Thượng Hải*). A class noun (*Núi*, *Đập*, *Thác*) is
 * allowed here because the place is known; runtime place slots never get one (vi.md §5.1). Countries are CLDR `vi`'s
 * names (*Hoa Kỳ*, *Úc*, *Italy*, *Ai Cập*), Hong Kong its Vietnamese name, Chinese places their Sino-Vietnamese names
 * where the press uses them, and Ukrainian places in Ukrainian transliteration (*Kyiv*, vi.md §8). Sublabels go most
 * specific first, with commas. Stats, lookups and shares keep the English label (Place.canonicalLabel), so nothing here
 * splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'Khu vực 51', label: 'Khu vực 51', sublabel: 'Hồ Groom, Nevada, Hoa Kỳ' },
  centralPark: { chip: 'Central Park', label: 'Central Park', sublabel: 'New York, Hoa Kỳ' },
  giza: { chip: 'Giza', label: 'Kim tự tháp Giza', sublabel: 'Giza, Ai Cập' },
  // "Ngẫu nhiên"
  uluru: { label: 'Uluru', sublabel: 'Lãnh thổ Bắc Úc, Úc' },
  palmJumeirah: { label: 'Palm Jumeirah', sublabel: 'Dubai, Các Tiểu Vương quốc Ả Rập Thống nhất' },
  worldIslands: { label: 'Quần đảo Thế giới', sublabel: 'Dubai, Các Tiểu Vương quốc Ả Rập Thống nhất' },
  grandCanyon: { label: 'Hẻm núi Grand Canyon', sublabel: 'Arizona, Hoa Kỳ' },
  meteorCrater: { label: 'Hố thiên thạch Meteor', sublabel: 'Arizona, Hoa Kỳ' },
  lowerManhattan: { label: 'Hạ Manhattan', sublabel: 'New York, Hoa Kỳ' },
  lasVegasStrip: { label: 'Las Vegas Strip', sublabel: 'Nevada, Hoa Kỳ' },
  hooverDam: { label: 'Đập Hoover và hồ Mead', sublabel: 'Nevada và Arizona, Hoa Kỳ' },
  goldenGate: { label: 'Cầu Cổng Vàng', sublabel: 'San Francisco, Hoa Kỳ' },
  kennedySpaceCenter: { label: 'Trung tâm Vũ trụ Kennedy', sublabel: 'Florida, Hoa Kỳ' },
  washingtonDc: { label: 'Washington, D.C.', sublabel: 'National Mall, Hoa Kỳ' },
  mountStHelens: { label: 'Núi St. Helens', sublabel: 'Washington, Hoa Kỳ' },
  niagaraFalls: { label: 'Thác Niagara', sublabel: 'Ontario, Canada' },
  panamaCanal: { label: 'Kênh đào Panama', sublabel: 'Âu tàu Gatun, Panama' },
  rioDeJaneiro: { label: 'Rio de Janeiro', sublabel: 'Núi Sugarloaf và Copacabana, Brazil' },
  paris: { label: 'Paris', sublabel: 'Île-de-France, Pháp' },
  venice: { label: 'Venice', sublabel: 'Veneto, Italy' },
  vesuvius: { label: 'Núi lửa Vesuvius', sublabel: 'Napoli, Italy' },
  istanbul: { label: 'Istanbul', sublabel: 'Eo biển Bosphorus, Thổ Nhĩ Kỳ' },
  chernobyl: { label: 'Chernobyl', sublabel: 'Tỉnh Kyiv, Ukraina' },
  tableMountain: { label: 'Núi Bàn', sublabel: 'Cape Town, Nam Phi' },
  kilimanjaro: { label: 'Núi Kilimanjaro', sublabel: 'Kilimanjaro, Tanzania' },
  everest: { label: 'Đỉnh Everest', sublabel: 'Nepal và Trung Quốc' },
  angkorWat: { label: 'Angkor Wat', sublabel: 'Siem Reap, Campuchia' },
  singapore: { label: 'Singapore', sublabel: 'Vịnh Marina, Singapore' },
  hongKong: { label: 'Hồng Kông', sublabel: 'Cảng Victoria, Hồng Kông' },
  tokyo: { label: 'Tokyo', sublabel: 'Tokyo, Nhật Bản' },
  fuji: { label: 'Núi Phú Sĩ', sublabel: 'Shizuoka, Nhật Bản' },
  sydneyHarbour: { label: 'Cảng Sydney', sublabel: 'Sydney, Úc' },
  richat: { label: 'Cấu trúc Richat', sublabel: 'Sahara, Mauritania' },
  greatBlueHole: { label: 'Hố Xanh Lớn', sublabel: 'Rạn Lighthouse, Belize' },
  boraBora: { label: 'Bora Bora', sublabel: 'Quần đảo Société, Polynesia thuộc Pháp' },
  hardyReef: { label: 'Rạn Hardy', sublabel: 'Rạn san hô Great Barrier, Úc' },
  male: { label: 'Malé', sublabel: 'Đảo san hô vòng Bắc Malé, Maldives' },
  deadSea: { label: 'Ruộng muối Biển Chết', sublabel: 'Lòng chảo phía nam, Israel và Jordan' },
  binghamCanyon: { label: 'Mỏ Bingham Canyon', sublabel: 'Utah, Hoa Kỳ' },
  mountWhaleback: { label: 'Mỏ Mount Whaleback', sublabel: 'Pilbara, Úc' },
  etna: { label: 'Núi lửa Etna', sublabel: 'Sicilia, Italy' },
  santorini: { label: 'Santorini', sublabel: 'Quần đảo Cyclades, Hy Lạp' },
  teide: { label: 'Núi lửa Teide', sublabel: 'Tenerife, Tây Ban Nha' },
  kilauea: { label: 'Núi lửa Kīlauea', sublabel: 'Hawaii, Hoa Kỳ' },
  craterLake: { label: 'Hồ Crater', sublabel: 'Oregon, Hoa Kỳ' },
  glenCanyonDam: { label: 'Đập Glen Canyon', sublabel: 'Page, Arizona, Hoa Kỳ' },
  gardenCity: { label: 'Cánh đồng tròn Garden City', sublabel: 'Kansas, Hoa Kỳ' },
  almeria: { label: 'Nhà kính Almería', sublabel: 'Andalucía, Tây Ban Nha' },
  gibraltar: { label: 'Gibraltar', sublabel: 'Eo biển Gibraltar' },
  suezCanal: { label: 'Kênh đào Suez', sublabel: 'Ismailia, Ai Cập' },
  aswanDam: { label: 'Đập cao Aswan', sublabel: 'Hồ Nasser, Ai Cập' },
  wadiRum: { label: 'Wadi Rum', sublabel: 'Aqaba, Jordan' },
  sossusvlei: { label: 'Sossusvlei', sublabel: 'Sa mạc Namib, Namibia' },
  victoriaFalls: { label: 'Thác Victoria', sublabel: 'Zambia và Zimbabwe' },
  threeGorges: { label: 'Đập Tam Hiệp', sublabel: 'Hồ Bắc, Trung Quốc' },
  shanghai: { label: 'Thượng Hải', sublabel: 'Sông Hoàng Phố, Trung Quốc' },
  itaipu: { label: 'Đập Itaipu', sublabel: 'Brazil và Paraguay' },
}
export default places
