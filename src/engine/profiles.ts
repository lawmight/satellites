/**
 * Curated knowledge about the satellites that matter to Overflight.
 *
 * Rules for this table:
 *  - Factual and conservative. If a figure is not published, leave it out (the UI shows "—").
 *  - NORAD ids are preferred; name patterns are used for constellations and are anchored so they
 *    never catch unrelated objects (e.g. "JILIN-1 GAOFEN" must not match the GAOFEN profiles).
 *  - Geostationary longitudes are never stored here: they always come from propagation.
 *  - `scan` is how a geostationary imager covers the disc: ABI and AHI step their east-west swaths from north to
 *    south, SEVIRI and FCI from south to north; a full disc takes about 10 minutes (SEVIRI 12.5). It times the scan
 *    line's crossing of a place within a frame, to about a minute.
 *  - Blurbs are one plain sentence (docs/DESIGN.md §7). No hype. They are copy, so they live in the 'sats' namespace
 *    (src/i18n/en/sats.ts) and a profile names its own by key: this table is loaded by the orbit-catalog worker at
 *    boot, which shows no words, and the pass view reads the blurb in the visitor's language (`profileBlurb`).
 *  - Display names, operators and agencies are proper names: the same in every language (shares carry them).
 *
 * Resolution order: an exact NORAD id wins; otherwise the FIRST matching name pattern in table order.
 * Every catalog object that matches nothing is category 'other' (ambient only).
 */
import type { SatProfile } from '@/types'
import type enSats from '@/i18n/en/sats'

/** A blurb's key in the 'sats' namespace. */
export type SatBlurb = keyof (typeof enSats)['blurb']

const MAXAR = 'Maxar Intelligence'
const PLANET = 'Planet'
const AIRBUS = 'Airbus'

/** `blurb` is the key of the profile's sentence in the 'sats' namespace (src/i18n/en/sats.ts), never the sentence. */
export const PROFILES: readonly (SatProfile & { blurb: SatBlurb })[] = [
  // ───────────────────────────── open optical: real pixels via STAC ─────────────────────────────
  {
    norad: [40697],
    displayName: 'Sentinel-2A',
    operator: 'ESA / Copernicus',
    category: 'open-optical',
    swathKm: 290,
    resolutionM: 10,
    daylightOnly: true,
    stac: { collection: 'sentinel-2-l2a', platform: 'sentinel-2a' },
    blurb: 'sentinel2',
  },
  {
    norad: [42063],
    displayName: 'Sentinel-2B',
    operator: 'ESA / Copernicus',
    category: 'open-optical',
    swathKm: 290,
    resolutionM: 10,
    daylightOnly: true,
    stac: { collection: 'sentinel-2-l2a', platform: 'sentinel-2b' },
    blurb: 'sentinel2',
  },
  {
    norad: [60989],
    displayName: 'Sentinel-2C',
    operator: 'ESA / Copernicus',
    category: 'open-optical',
    swathKm: 290,
    resolutionM: 10,
    daylightOnly: true,
    stac: { collection: 'sentinel-2-l2a', platform: 'sentinel-2c' },
    blurb: 'sentinel2',
  },
  {
    norad: [39084],
    displayName: 'Landsat 8',
    operator: 'USGS / NASA',
    category: 'open-optical',
    swathKm: 185,
    resolutionM: 30,
    daylightOnly: true,
    stac: { collection: 'landsat-c2-l2', platform: 'landsat-8' },
    blurb: 'landsat8',
  },
  {
    norad: [49260],
    displayName: 'Landsat 9',
    operator: 'USGS / NASA',
    category: 'open-optical',
    swathKm: 185,
    resolutionM: 30,
    daylightOnly: true,
    stac: { collection: 'landsat-c2-l2', platform: 'landsat-9' },
    blurb: 'landsat9',
  },

  // ───────────────────────────── weather, polar orbit ─────────────────────────────
  {
    norad: [43013],
    displayName: 'NOAA-20',
    operator: 'NOAA',
    category: 'weather-leo',
    swathKm: 3040,
    resolutionM: 375,
    gibs: { collection: 'gibs-viirs-noaa20', layer: 'VIIRS_NOAA20_CorrectedReflectance_TrueColor', kind: 'daily' },
    blurb: 'noaaViirs',
  },
  {
    norad: [54234],
    displayName: 'NOAA-21',
    operator: 'NOAA',
    category: 'weather-leo',
    swathKm: 3040,
    resolutionM: 375,
    gibs: { collection: 'gibs-viirs-noaa21', layer: 'VIIRS_NOAA21_CorrectedReflectance_TrueColor', kind: 'daily' },
    blurb: 'noaaViirs',
  },
  {
    norad: [37849],
    displayName: 'Suomi NPP',
    operator: 'NASA / NOAA',
    category: 'weather-leo',
    swathKm: 3040,
    resolutionM: 375,
    gibs: { collection: 'gibs-viirs-snpp', layer: 'VIIRS_SNPP_CorrectedReflectance_TrueColor', kind: 'daily' },
    blurb: 'suomiNpp',
  },
  {
    norad: [25994],
    displayName: 'Terra',
    operator: 'NASA',
    category: 'weather-leo',
    swathKm: 2330,
    resolutionM: 250,
    gibs: { collection: 'gibs-modis-terra', layer: 'MODIS_Terra_CorrectedReflectance_TrueColor', kind: 'daily' },
    blurb: 'terra',
  },
  {
    norad: [27424],
    displayName: 'Aqua',
    operator: 'NASA',
    category: 'weather-leo',
    swathKm: 2330,
    resolutionM: 250,
    gibs: { collection: 'gibs-modis-aqua', layer: 'MODIS_Aqua_CorrectedReflectance_TrueColor', kind: 'daily' },
    blurb: 'aqua',
  },
  {
    norad: [38771],
    displayName: 'MetOp-B',
    operator: 'EUMETSAT',
    category: 'weather-leo',
    swathKm: 2900,
    resolutionM: 1100,
    blurb: 'metop',
  },
  {
    norad: [43689],
    displayName: 'MetOp-C',
    operator: 'EUMETSAT',
    category: 'weather-leo',
    swathKm: 2900,
    resolutionM: 1100,
    blurb: 'metop',
  },
  {
    norad: [41335],
    displayName: 'Sentinel-3A',
    operator: 'ESA / EUMETSAT',
    category: 'weather-leo',
    swathKm: 1270,
    resolutionM: 300,
    blurb: 'sentinel3',
  },
  {
    norad: [43437],
    displayName: 'Sentinel-3B',
    operator: 'ESA / EUMETSAT',
    category: 'weather-leo',
    swathKm: 1270,
    resolutionM: 300,
    blurb: 'sentinel3',
  },
  {
    namePattern: '^FENGYUN 3[DFH]$',
    operator: 'CMA',
    category: 'weather-leo',
    swathKm: 2900,
    resolutionM: 250,
    blurb: 'fengyun3',
  },
  {
    namePattern: '^FENGYUN 3E$',
    operator: 'CMA',
    category: 'weather-leo',
    swathKm: 2900,
    blurb: 'fengyun3e',
  },

  // ───────────────────────────── weather, geostationary ─────────────────────────────
  {
    norad: [60133],
    displayName: 'GOES-19',
    operator: 'NOAA',
    category: 'weather-geo',
    resolutionM: 500,
    operational: true,
    cadenceMin: 10,
    gibs: { collection: 'gibs-goes-east', layer: 'GOES-East_ABI_GeoColor', kind: 'subdaily' },
    frames: 'goes-east',
    scan: { from: 'north', minutes: 10 },
    blurb: 'goesEast',
  },
  {
    norad: [51850],
    displayName: 'GOES-18',
    operator: 'NOAA',
    category: 'weather-geo',
    resolutionM: 500,
    operational: true,
    cadenceMin: 10,
    gibs: { collection: 'gibs-goes-west', layer: 'GOES-West_ABI_GeoColor', kind: 'subdaily' },
    frames: 'goes-west',
    scan: { from: 'north', minutes: 10 },
    blurb: 'goesWest',
  },
  {
    norad: [41866],
    displayName: 'GOES-16',
    operator: 'NOAA',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 10,
    blurb: 'goes16',
  },
  {
    norad: [43226],
    displayName: 'GOES-17',
    operator: 'NOAA',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 10,
    blurb: 'goes17',
  },
  {
    norad: [41836],
    displayName: 'Himawari-9',
    operator: 'JMA',
    category: 'weather-geo',
    resolutionM: 500,
    operational: true,
    cadenceMin: 10,
    gibs: { collection: 'gibs-himawari', layer: 'Himawari_AHI_Band3_Red_Visible_1km', kind: 'subdaily' },
    frames: 'himawari',
    scan: { from: 'north', minutes: 10 },
    blurb: 'himawari9',
  },
  {
    norad: [40267],
    displayName: 'Himawari-8',
    operator: 'JMA',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 10,
    blurb: 'himawari8',
  },
  {
    norad: [54743],
    displayName: 'Meteosat-12',
    operator: 'EUMETSAT',
    category: 'weather-geo',
    resolutionM: 500,
    operational: true,
    cadenceMin: 10,
    frames: 'meteosat-0deg',
    scan: { from: 'south', minutes: 10 },
    blurb: 'meteosat12',
  },
  {
    norad: [28912],
    displayName: 'Meteosat-9',
    operator: 'EUMETSAT',
    category: 'weather-geo',
    resolutionM: 1000,
    operational: true,
    cadenceMin: 15,
    frames: 'meteosat-iodc',
    scan: { from: 'south', minutes: 12.5 },
    blurb: 'meteosat9',
  },
  {
    norad: [38552],
    displayName: 'Meteosat-10',
    operator: 'EUMETSAT',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 15,
    blurb: 'meteosatSecondGen',
  },
  {
    norad: [40732],
    displayName: 'Meteosat-11',
    operator: 'EUMETSAT',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 15,
    blurb: 'meteosatSecondGen',
  },
  {
    norad: [100530],
    displayName: 'MTG-I2',
    operator: 'EUMETSAT',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 10,
    blurb: 'mtgI2',
  },
  {
    norad: [43823],
    displayName: 'GEO-KOMPSAT-2A',
    operator: 'KMA',
    category: 'weather-geo',
    resolutionM: 500,
    operational: true,
    cadenceMin: 10,
    blurb: 'geoKompsat2a',
  },
  {
    norad: [48808],
    displayName: 'Fengyun-4B',
    operator: 'CMA',
    category: 'weather-geo',
    resolutionM: 500,
    operational: true,
    cadenceMin: 15,
    blurb: 'fengyun4b',
  },
  {
    norad: [41882],
    displayName: 'Fengyun-4A',
    operator: 'CMA',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 15,
    blurb: 'fengyun4a',
  },
  {
    norad: [67246],
    displayName: 'Fengyun-4C',
    operator: 'CMA',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 15,
    blurb: 'fengyun4c',
  },
  {
    norad: [41752],
    displayName: 'INSAT-3DR',
    operator: 'ISRO',
    category: 'weather-geo',
    resolutionM: 1000,
    operational: true,
    cadenceMin: 30,
    blurb: 'insat',
  },
  {
    norad: [58990],
    displayName: 'INSAT-3DS',
    operator: 'ISRO',
    category: 'weather-geo',
    resolutionM: 1000,
    operational: true,
    cadenceMin: 30,
    blurb: 'insat',
  },
  {
    norad: [39216],
    displayName: 'INSAT-3D',
    operator: 'ISRO',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 30,
    blurb: 'insat3d',
  },
  {
    norad: [44903],
    displayName: 'Elektro-L 3',
    operator: 'Roscosmos',
    category: 'weather-geo',
    resolutionM: 1000,
    operational: true,
    cadenceMin: 30,
    blurb: 'elektroL',
  },
  {
    norad: [55506],
    displayName: 'Elektro-L 4',
    operator: 'Roscosmos',
    category: 'weather-geo',
    resolutionM: 1000,
    operational: true,
    cadenceMin: 30,
    blurb: 'elektroL',
  },
  {
    norad: [41105],
    displayName: 'Elektro-L 2',
    operator: 'Roscosmos',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 30,
    blurb: 'elektroL2',
  },
  {
    norad: [67756],
    displayName: 'Elektro-L 5',
    operator: 'Roscosmos',
    category: 'weather-geo',
    operational: false,
    cadenceMin: 30,
    blurb: 'elektroL5',
  },

  // ───────────────────────────── commercial and government high-resolution optical ─────────────────────────────
  {
    norad: [32060],
    displayName: 'WorldView-1',
    operator: MAXAR,
    category: 'commercial-optical',
    resolutionM: 0.5,
    maxOffNadirDeg: 40,
    daylightOnly: true,
    blurb: 'worldview1',
  },
  {
    norad: [35946],
    displayName: 'WorldView-2',
    operator: MAXAR,
    category: 'commercial-optical',
    resolutionM: 0.46,
    maxOffNadirDeg: 40,
    daylightOnly: true,
    blurb: 'worldview2',
  },
  {
    norad: [40115],
    displayName: 'WorldView-3',
    operator: MAXAR,
    category: 'commercial-optical',
    resolutionM: 0.31,
    maxOffNadirDeg: 40,
    daylightOnly: true,
    blurb: 'worldview3',
  },
  {
    norad: [33331],
    displayName: 'GeoEye-1',
    operator: MAXAR,
    category: 'commercial-optical',
    resolutionM: 0.41,
    maxOffNadirDeg: 40,
    daylightOnly: true,
    blurb: 'geoeye1',
  },
  {
    norad: [59625, 59626, 60452, 60453, 62900, 62901],
    namePattern: '^LEGION \\d+$',
    operator: MAXAR,
    category: 'commercial-optical',
    resolutionM: 0.3,
    maxOffNadirDeg: 40,
    daylightOnly: true,
    blurb: 'worldviewLegion',
  },
  {
    namePattern: '^SKYSAT-',
    operator: PLANET,
    category: 'commercial-optical',
    resolutionM: 0.5,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'skysat',
  },
  {
    namePattern: '^PELICAN-',
    operator: PLANET,
    category: 'commercial-optical',
    resolutionM: 0.5,
    maxOffNadirDeg: 45,
    daylightOnly: true,
    blurb: 'pelican',
  },
  {
    namePattern: '^FLOCK ',
    operator: PLANET,
    category: 'commercial-optical',
    resolutionM: 3,
    swathKm: 32,
    daylightOnly: true,
    blurb: 'superDove',
  },
  {
    namePattern: '^GLOBAL-\\d+$',
    operator: 'BlackSky',
    category: 'commercial-optical',
    resolutionM: 1,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'blacksky',
  },
  {
    norad: [38012],
    displayName: 'Pléiades 1A',
    operator: AIRBUS,
    category: 'commercial-optical',
    resolutionM: 0.5,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'pleiades',
  },
  {
    norad: [39019],
    displayName: 'Pléiades 1B',
    operator: AIRBUS,
    category: 'commercial-optical',
    resolutionM: 0.5,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'pleiades',
  },
  {
    norad: [48268, 49070],
    namePattern: '^PLEIADES NEO \\d+$',
    operator: AIRBUS,
    category: 'commercial-optical',
    resolutionM: 0.3,
    maxOffNadirDeg: 45,
    daylightOnly: true,
    blurb: 'pleiadesNeo',
  },
  {
    norad: [38755],
    displayName: 'SPOT 6',
    operator: AIRBUS,
    category: 'commercial-optical',
    resolutionM: 1.5,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'spot6',
  },
  {
    norad: [40053],
    displayName: 'SPOT 7',
    operator: 'Azercosmos',
    category: 'commercial-optical',
    resolutionM: 1.5,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'spot7',
  },
  {
    norad: [38338],
    displayName: 'KOMPSAT-3',
    operator: 'KARI',
    category: 'commercial-optical',
    resolutionM: 0.7,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'kompsat3',
  },
  {
    norad: [40536],
    displayName: 'KOMPSAT-3A',
    operator: 'KARI',
    category: 'commercial-optical',
    resolutionM: 0.55,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'kompsat3a',
  },
  {
    namePattern: '^JILIN',
    operator: 'Chang Guang Satellite',
    category: 'commercial-optical',
    resolutionM: 0.75,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'jilin1',
  },
  {
    namePattern: '^SUPERVIEW(-1 |\\sNEO-1 |\\sNEO-3 )',
    operator: 'Siwei',
    category: 'commercial-optical',
    resolutionM: 0.5,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'superview',
  },
  {
    namePattern: '^GAOFEN-1( 0[2-4])?$',
    operator: 'CNSA',
    category: 'commercial-optical',
    resolutionM: 2,
    swathKm: 60,
    daylightOnly: true,
    blurb: 'gaofenWideField',
  },
  {
    namePattern: '^GAOFEN-6$',
    operator: 'CNSA',
    category: 'commercial-optical',
    resolutionM: 2,
    swathKm: 90,
    daylightOnly: true,
    blurb: 'gaofenWideField',
  },
  {
    namePattern: '^GAOFEN-2$',
    operator: 'CNSA',
    category: 'commercial-optical',
    resolutionM: 0.8,
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'gaofen2',
  },
  {
    namePattern: '^GAOFEN-7$',
    operator: 'CNSA',
    category: 'commercial-optical',
    resolutionM: 0.65,
    swathKm: 20,
    daylightOnly: true,
    blurb: 'gaofen7',
  },
  {
    namePattern: '^GAOFEN-(9|11|14) 0\\d$',
    operator: 'CNSA',
    category: 'commercial-optical',
    maxOffNadirDeg: 30,
    daylightOnly: true,
    blurb: 'gaofenOptical',
  },

  // ───────────────────────────── radar (SAR): sees through cloud and at night ─────────────────────────────
  {
    norad: [39634, 62261, 66315],
    namePattern: '^SENTINEL-1[A-Z]$',
    operator: 'ESA / Copernicus',
    category: 'radar',
    swathKm: 250,
    // Its IW images as published (GRD: 20 × 22 m); the 5 m is single-look range only, never shown here.
    resolutionM: 20,
    maxOffNadirDeg: 40,
    blurb: 'sentinel1',
    openArchive: true,
  },
  {
    namePattern: '^ICEYE-',
    operator: 'ICEYE',
    category: 'radar',
    resolutionM: 0.5,
    maxOffNadirDeg: 35,
    blurb: 'iceye',
  },
  {
    namePattern: '^CAPELLA-',
    operator: 'Capella Space',
    category: 'radar',
    resolutionM: 0.5,
    maxOffNadirDeg: 45,
    blurb: 'capella',
  },
  {
    namePattern: '^UMBRA-',
    operator: 'Umbra',
    category: 'radar',
    resolutionM: 0.25,
    maxOffNadirDeg: 45,
    blurb: 'umbra',
  },
  {
    namePattern: '^STRIX-',
    operator: 'Synspective',
    category: 'radar',
    resolutionM: 1,
    maxOffNadirDeg: 40,
    blurb: 'japaneseSmallRadar',
  },
  {
    namePattern: '^QPS-SAR-',
    operator: 'iQPS',
    category: 'radar',
    resolutionM: 0.5,
    maxOffNadirDeg: 40,
    blurb: 'japaneseSmallRadar',
  },
  {
    norad: [39227],
    displayName: 'KOMPSAT-5',
    operator: 'KARI',
    category: 'radar',
    resolutionM: 1,
    maxOffNadirDeg: 40,
    blurb: 'kompsat5',
  },
  {
    norad: [31698],
    displayName: 'TerraSAR-X',
    operator: 'DLR / Airbus',
    category: 'radar',
    resolutionM: 1,
    maxOffNadirDeg: 40,
    blurb: 'terrasarX',
  },
  {
    norad: [36605],
    displayName: 'TanDEM-X',
    operator: 'DLR / Airbus',
    category: 'radar',
    resolutionM: 1,
    maxOffNadirDeg: 40,
    blurb: 'tandemX',
  },
  {
    namePattern: '^(COSMO-SKYMED|CSG-)\\s?\\d$',
    operator: 'ASI',
    category: 'radar',
    resolutionM: 1,
    maxOffNadirDeg: 40,
    blurb: 'cosmoSkymed',
  },
  {
    norad: [43215],
    displayName: 'PAZ',
    operator: 'Hisdesat',
    category: 'radar',
    resolutionM: 1,
    maxOffNadirDeg: 40,
    blurb: 'paz',
  },
  {
    norad: [32382],
    displayName: 'RADARSAT-2',
    operator: 'MDA',
    category: 'radar',
    resolutionM: 1,
    maxOffNadirDeg: 45,
    blurb: 'radarsat2',
  },
  {
    namePattern: '^RCM-\\d$',
    operator: 'CSA',
    category: 'radar',
    resolutionM: 3,
    maxOffNadirDeg: 40,
    blurb: 'rcm',
  },
  {
    norad: [43641, 46265],
    namePattern: '^SAOCOM 1[AB]$',
    operator: 'CONAE',
    category: 'radar',
    resolutionM: 10,
    maxOffNadirDeg: 40,
    blurb: 'saocom',
  },
  {
    norad: [39766],
    displayName: 'ALOS-2',
    operator: 'JAXA',
    category: 'radar',
    resolutionM: 3,
    maxOffNadirDeg: 40,
    blurb: 'alos2',
  },
  {
    norad: [60182],
    displayName: 'ALOS-4',
    operator: 'JAXA',
    category: 'radar',
    resolutionM: 3,
    maxOffNadirDeg: 40,
    blurb: 'alos4',
  },
  {
    norad: [65053],
    displayName: 'NISAR',
    operator: 'NASA / ISRO',
    category: 'radar',
    swathKm: 242,
    maxOffNadirDeg: 40,
    blurb: 'nisar',
  },
  {
    namePattern: '^SUPERVIEW NEO-2 ',
    operator: 'Siwei',
    category: 'radar',
    maxOffNadirDeg: 40,
    blurb: 'superviewNeo2',
  },
  {
    namePattern: '^GAOFEN-3( 0[23])?$',
    operator: 'CNSA',
    category: 'radar',
    resolutionM: 1,
    maxOffNadirDeg: 45,
    blurb: 'gaofen3',
  },
  {
    namePattern: '^GAOFEN-12 0\\d$',
    operator: 'CNSA',
    category: 'radar',
    maxOffNadirDeg: 40,
    blurb: 'gaofen12',
  },

  // ───────────────────────────── crewed ─────────────────────────────
  {
    norad: [25544],
    displayName: 'ISS',
    operator: 'NASA / Roscosmos / ESA / JAXA / CSA',
    category: 'crewed',
    blurb: 'iss',
  },
  {
    norad: [48274],
    displayName: 'Tiangong',
    operator: 'CMSA',
    category: 'crewed',
    blurb: 'tiangong',
  },
]

// ───────────────────────────── resolution ─────────────────────────────

const byNorad = new Map<number, SatProfile>()
const patterns: { re: RegExp; profile: SatProfile }[] = []
for (const p of PROFILES) {
  for (const id of p.norad ?? []) byNorad.set(id, p)
  if (p.namePattern) patterns.push({ re: new RegExp(p.namePattern, 'i'), profile: p })
}

/** Resolve a profile from a NORAD id and (optionally) the catalog name. */
export function resolveProfile(norad: number, name?: string): SatProfile | undefined {
  const exact = byNorad.get(norad)
  if (exact) return exact
  if (!name) return undefined
  for (const { re, profile } of patterns) if (re.test(name)) return profile
  return undefined
}

/** STAC platform string (e.g. "sentinel-2c", "landsat-9") → NORAD id. Case-insensitive. */
export function noradForPlatform(platform: string): number | undefined {
  const key = platform.trim().toLowerCase()
  for (const p of PROFILES) if (p.stac && p.stac.platform === key && p.norad?.length === 1) return p.norad[0]
  return undefined
}

/** GIBS collection (e.g. "gibs-viirs-noaa20") → NORAD id of the satellite behind it. */
export function noradForGibsCollection(collection: string): number | undefined {
  for (const p of PROFILES) if (p.gibs && p.gibs.collection === collection && p.norad?.length === 1) return p.norad[0]
  return undefined
}

/**
 * A profile's blurb in `m`, the 'sats' messages of the language on screen (React: useMsgs(enSats); elsewhere
 * msgs(enSats), read at call time). '' when there is none (an unprofiled object, a test profile).
 */
export function profileBlurb(profile: Pick<SatProfile, 'blurb'> | undefined, m: typeof enSats): string {
  const key = profile?.blurb
  return key && Object.prototype.hasOwnProperty.call(m.blurb, key) ? m.blurb[key as SatBlurb] : ''
}

// ───────────────────────────── display names ─────────────────────────────

/** Brand casing for constellation names that are written in caps in the catalog. */
const BRAND_CASE: Record<string, string> = {
  SKYSAT: 'SkySat',
  FLOCK: 'Flock',
  PELICAN: 'Pelican',
  LEGION: 'WorldView Legion',
  CAPELLA: 'Capella',
  UMBRA: 'Umbra',
  STRIX: 'StriX',
  JILIN: 'Jilin',
  GAOFEN: 'Gaofen',
  KUANFU: 'Kuanfu',
  SUPERVIEW: 'SuperView',
  NEO: 'Neo',
  PLEIADES: 'Pléiades',
  FENGYUN: 'Fengyun',
  GLOBAL: 'BlackSky Global',
  OBJECT: 'Object',
  SKYMED: 'SkyMed',
}

/**
 * Human display name. Curated single-satellite profiles carry their own; constellation members get the
 * catalog name with brand casing and without the trailing parenthetical alias, e.g.
 *   "CAPELLA-14 (ACADIA-4)" → "Capella-14",  "LEGION 3" → "WorldView Legion 3".
 * Uncurated objects keep the catalog name verbatim.
 */
export function displayNameFor(name: string, profile?: SatProfile): string {
  if (profile?.displayName) return profile.displayName
  if (!profile) return name
  const base = name.replace(/\s*\(.*\)\s*$/, '').trim()
  return base
    .split(/(\s+|-)/)
    .map((tok) => BRAND_CASE[tok.toUpperCase()] ?? tok)
    .join('')
}
