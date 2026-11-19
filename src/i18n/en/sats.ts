/**
 * English copy about the satellites themselves: the one-sentence blurb under a pass's sentence in the pass view
 * (src/ui/results/PassDetail.tsx), saying what the satellite's camera or radar is.
 *
 * Why the blurbs live here and not in the profiles: src/engine/profiles.ts is the satellites' facts (swath, pixel
 * size, operator), loaded by the orbit-catalog worker at boot, which never shows a word. Each profile names its blurb by
 * key (`blurb: 'sentinel2'`); satellites that share a sentence share a key. The UI reads it in the visitor's language
 * (profileBlurb in profiles.ts, with useMsgs(enSats)).
 *
 * Satellite, constellation, instrument, mission, agency and company names are never translated (Sentinel-2, Landsat,
 * VIIRS, MODIS, AVHRR, OLCI, MERSI, GOES-East, Meteosat, Copernicus, Maxar, Planet, BlackSky, Airbus' Pléiades…). Each
 * blurb is ONE plain sentence with a full stop (DESIGN §7: no hype), body text that wraps, under the satellite's name;
 * "Its …" means that satellite's. Numbers are written into the text: group and punctuate them your language's way
 * (3,040 km is 3.040 km in German, 3 040 km in French; 1.1 km is 1,1 km), keep the units (m, km, cm) and the space.
 * "Swath": the width of ground a satellite sees as it passes. "Panchromatic": a single black-and-white band, sharper
 * than the colour ones.
 */
import { ns } from '../ns'

export default ns('sats', {
  /** A satellite's one-sentence blurb, by key (the profiles' `blurb`). Each comment names the satellites it is shown for */
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──

    /** Sentinel-2A, Sentinel-2B and Sentinel-2C */
    sentinel2: 'Copernicus multispectral imager: 13 bands, 10 m pixels, a 290 km swath.',
    /** Landsat 8: "Operational Land Imager" is the instrument's name (OLI); "panchromatic": black-and-white, sharper */
    landsat8: 'Operational Land Imager: 30 m colour and 15 m panchromatic pixels across a 185 km swath.',
    /** Landsat 9: the same instrument's second model */
    landsat9: 'Operational Land Imager 2: 30 m colour and 15 m panchromatic pixels across a 185 km swath.',

    // ── Weather satellites in polar orbit ──

    /** NOAA-20 and NOAA-21: "Its" is the satellite named above; VIIRS is the instrument */
    noaaViirs: 'Its VIIRS imager sweeps a 3,040 km swath, covering the whole planet twice a day.',
    /** Suomi NPP */
    suomiNpp: 'The first VIIRS imager in orbit, sweeping a 3,040 km swath since 2011.',
    /** Terra: "has watched": the product's word for photographing (see the results' verdicts) */
    terra: 'Its MODIS imager has watched the whole planet, 2,330 km at a time, since 1999.',
    /** Aqua: as `terra`, a different year */
    aqua: 'Its MODIS imager has watched the whole planet, 2,330 km at a time, since 2002.',
    /** MetOp-B and MetOp-C: "at 1.1 km": its pixels are 1.1 km across */
    metop: 'European polar weather satellite; its AVHRR imager covers a 2,900 km swath at 1.1 km.',
    /** Sentinel-3A and Sentinel-3B: "images" is a verb here: photographs */
    sentinel3: 'Its OLCI instrument images land and ocean colour in 21 bands across a 1,270 km swath.',
    /** Fengyun-3D, 3F and 3H */
    fengyun3: 'Chinese polar weather satellite; its MERSI imager covers a 2,900 km swath.',
    /** Fengyun-3E */
    fengyun3e: 'Chinese dawn–dusk orbit weather satellite with a low-light MERSI imager.',

    // ── Geostationary weather satellites (each sits over the equator and images the whole disc below it) ──

    /**
     * GOES-19: "GOES-East" is the name of the service it provides; "images" is a verb; "full disk": the whole face of
     * the Earth it sees
     */
    goesEast: 'GOES-East: images the full disk of the Americas every 10 minutes.',
    /** GOES-18: as `goesEast` */
    goesWest: 'GOES-West: images the full disk of the Pacific and the Americas every 10 minutes.',
    /** GOES-16 */
    goes16: 'The former GOES-East, kept in orbit as a standby spare.',
    /** GOES-17 */
    goes17: 'The former GOES-West, kept in orbit as a standby spare.',
    /** Himawari-9 */
    himawari9: 'Japan’s weather satellite: images the full disk of Asia and the Pacific every 10 minutes.',
    /** Himawari-8 */
    himawari8: 'Backup to Himawari-9.',
    /** Meteosat-12: MTG-I1 is its name before launch */
    meteosat12: 'The first third-generation Meteosat (MTG-I1): images Europe and Africa every 10 minutes.',
    /** Meteosat-9 */
    meteosat9: 'Covers the Indian Ocean region, imaging the full disk every 15 minutes.',
    /** Meteosat-10 and Meteosat-11: "not counted here": the app does not list it as watching the place */
    meteosatSecondGen: 'Second-generation Meteosat; not counted here as a full-disk imager of this place.',
    /** MTG-I2 */
    mtgI2: 'Second third-generation Meteosat imager; not yet the operational service.',
    /** GEO-KOMPSAT-2A */
    geoKompsat2a: 'Korea’s weather satellite: images the full disk every 10 minutes.',
    /** Fengyun-4B */
    fengyun4b: 'China’s operational geostationary weather satellite: images the full disk every 15 minutes.',
    /** Fengyun-4A */
    fengyun4a: 'Older Chinese geostationary imager, not counted as the primary service.',
    /** Fengyun-4C */
    fengyun4c: 'Newest Chinese geostationary imager; not yet the operational service.',
    /** INSAT-3DR and INSAT-3DS */
    insat: 'Indian weather satellite: images the full disk every 30 minutes.',
    /** INSAT-3D */
    insat3d: 'Older Indian weather satellite, not counted as an operational imager.',
    /** Elektro-L 3 and Elektro-L 4 */
    elektroL: 'Russian geostationary weather satellite: images the full disk every 30 minutes.',
    /** Elektro-L 2 */
    elektroL2: 'Older Russian geostationary weather satellite, not counted as an operational imager.',
    /** Elektro-L 5 */
    elektroL5: 'Newest Russian geostationary weather satellite; not yet counted as operational.',

    // ── Commercial and government high-resolution cameras ──

    /** WorldView-1 */
    worldview1: 'Panchromatic imager with 50 cm pixels that can point well off its ground track.',
    /** WorldView-2: "Eight-band": eight colour channels */
    worldview2: 'Eight-band imager with 46 cm panchromatic pixels.',
    /** WorldView-3 */
    worldview3: 'Imager with 31 cm panchromatic pixels and 16 spectral bands.',
    /** GeoEye-1 */
    geoeye1: 'Imager with 41 cm panchromatic pixels, in orbit since 2008.',
    /** WorldView Legion 1–6 */
    worldviewLegion: 'One of Maxar’s WorldView Legion imagers, with roughly 30 cm pixels.',
    /** SkySat (each satellite): Planet is a company (Planet Labs): never the common noun */
    skysat: 'Agile Planet imager with roughly 50 cm pixels; it is tasked to point at specific targets.',
    /** Pelican (each satellite): Planet is a company */
    pelican: 'Planet’s newer agile high-resolution imager.',
    /** Flock (each SuperDove): Planet and SuperDove are names; "the fleet images": the fleet photographs */
    superDove: 'A Planet SuperDove cubesat; the fleet images most of Earth’s land every day at about 3 m.',
    /** BlackSky Global (each satellite) */
    blacksky: 'A BlackSky rapid-revisit imager with roughly 1 m pixels or better.',
    /** Pléiades 1A and Pléiades 1B */
    pleiades: 'Agile imager delivering 50 cm panchromatic products.',
    /** Pléiades Neo 3 and 4 */
    pleiadesNeo: 'Agile imager with 30 cm native pixels.',
    /** SPOT 6 */
    spot6: 'Wide-area imager with 1.5 m panchromatic pixels and a 60 km swath.',
    /** SPOT 7: Azersky is its name in Azerbaijan's service */
    spot7: 'Twin of SPOT 6, operated by Azerbaijan as Azersky.',
    /** KOMPSAT-3 */
    kompsat3: 'Korean imager with 70 cm panchromatic pixels.',
    /** KOMPSAT-3A */
    kompsat3a: 'Korean imager with 55 cm panchromatic pixels and an infrared channel.',
    /** Jilin-1 (each satellite): Jilin-1 is the constellation's name */
    jilin1: 'Part of China’s Jilin-1 commercial constellation, with sub-metre imagers.',
    /** SuperView-1, SuperView Neo-1 and Neo-3 */
    superview: 'Chinese commercial imager with roughly 50 cm pixels or better.',
    /** Gaofen-1 and Gaofen-6 */
    gaofenWideField: 'Chinese government imager with 2 m panchromatic and 16 m wide-field cameras.',
    /** Gaofen-2 */
    gaofen2: 'Chinese government imager with 80 cm panchromatic pixels.',
    /** Gaofen-7 */
    gaofen7: 'Chinese government stereo-mapping imager with sub-metre pixels.',
    /** Gaofen-9, 11 and 14 */
    gaofenOptical: 'Chinese government high-resolution optical satellite; its specifications are not published.',

    // ── Radar satellites (they see through cloud and at night) ──

    /**
     * Sentinel-1A, 1C, 1D: the longest blurb: "C-band" is a radar frequency band (keep the Latin letter); "to one
     * side": radar looks sideways, not straight down
     */
    sentinel1: 'Copernicus C-band radar that publishes every image: a 250 km swath to one side at 20 m, through cloud, day or night.',
    /** ICEYE (each satellite) */
    iceye: 'Small X-band radar satellite that can be tasked to image through cloud, day or night.',
    /** Capella (each satellite): "spotlight": a radar imaging mode */
    capella: 'X-band radar satellite with roughly 50 cm spotlight imagery, day or night.',
    /** Umbra (each satellite) */
    umbra: 'X-band radar satellite with spotlight imagery down to about 25 cm.',
    /** StriX (Synspective) and QPS-SAR (iQPS) */
    japaneseSmallRadar: 'Japanese small X-band radar satellite.',
    /** KOMPSAT-5 */
    kompsat5: 'Korean X-band radar satellite with 1 m spotlight imagery.',
    /** TerraSAR-X */
    terrasarX: 'German X-band radar satellite, imaging since 2007.',
    /** TanDEM-X */
    tandemX: 'Flies in close formation with TerraSAR-X to map Earth’s topography by radar.',
    /** COSMO-SkyMed and its second generation (CSG) */
    cosmoSkymed: 'Italian X-band radar satellite of the COSMO-SkyMed system.',
    /** PAZ */
    paz: 'Spanish X-band radar satellite.',
    /** RADARSAT-2 */
    radarsat2: 'Canadian C-band radar satellite, imaging since 2007.',
    /** RCM-1, 2 and 3 */
    rcm: 'One of three satellites of the Canadian RADARSAT Constellation Mission.',
    /** SAOCOM 1A and 1B */
    saocom: 'Argentine L-band radar satellite that also measures soil moisture.',
    /** ALOS-2 */
    alos2: 'Japanese L-band radar satellite, imaging since 2014.',
    /** ALOS-4 */
    alos4: 'Japanese L-band radar satellite, successor to ALOS-2.',
    /** NISAR */
    nisar: 'Dual-band radar that maps a 242 km swath to measure how the ground moves.',
    /** SuperView Neo-2 */
    superviewNeo2: 'Chinese commercial X-band radar satellite.',
    /** Gaofen-3 */
    gaofen3: 'Chinese government C-band radar satellite.',
    /** Gaofen-12 */
    gaofen12: 'Chinese government radar satellite; its specifications are not published.',

    // ── Crewed space stations ──

    /** ISS: the month and year it has been crewed since */
    iss: 'The International Space Station, continuously crewed since November 2000.',
    /** Tiangong: Tianhe is the module's name */
    tiangong: 'China’s space station, built around the Tianhe core module launched in 2021.',
  },
})
