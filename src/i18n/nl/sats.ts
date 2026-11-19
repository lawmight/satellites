/**
 * Dutch copy about the satellites themselves: the one-sentence blurb under a pass's sentence in the pass view (see
 * src/i18n/en/sats.ts; docs/i18n/nl.md is the authority on every word here, §2 and §5 in particular).
 *
 * Why it reads this way: each blurb is one plain sentence under the satellite's name, so it never repeats the name and
 * never refers back to the satellite with `hij`, `het` or `zijn` (§5). English "Its …" becomes the instrument with the
 * definite article (`De VIIRS-camera …`, `Het instrument OLCI …`); a description of the whole satellite is a noun
 * phrase (`Japanse X-bandradarsatelliet`, `Wendbare camera van Planet …`), continued with `die` where it needs a verb,
 * never a subjectless verb. "imager" is `camera`; a geostationary full-disc image is `een beeld van de hele
 * aardschijf` (§3.4: never `het hele aardoppervlak`). The glossary's words throughout: `strook` for a swath, `banden`
 * for spectral bands, `panchromatisch`, `X-bandradarsatelliet` (closed after the letter's hyphen), `per opdracht` for
 * tasking, `spotlightmodus`, `kijkt sinds` for an ongoing state (§2: never `heeft … gekeken sinds`). "High-resolution"
 * is said as `zeer scherpe beelden`, because `resolutie` belongs to About's prose only (§4.1). Numbers are typed the
 * Dutch way: a thousands point (`3.040 km`), a decimal comma (`1,1 km`), a no-break space before every unit (§6).
 * Satellite, instrument, mission, agency and company names stay as they are; a constellation or instrument name may
 * take a hyphenated noun (`VIIRS-camera`, `WorldView Legion-camera’s`), a satellite's own name never does.
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──

    sentinel2: 'Multispectrale camera van Copernicus: 13 banden, pixels van 10 m en een strook van 290 km.',
    landsat8: 'Operational Land Imager: kleurpixels van 30 m en panchromatische pixels van 15 m, over een strook van 185 km.',
    landsat9: 'Operational Land Imager 2: kleurpixels van 30 m en panchromatische pixels van 15 m, over een strook van 185 km.',

    // ── Weather satellites in polar orbit ──

    noaaViirs: 'De VIIRS-camera bestrijkt een strook van 3.040 km en brengt twee keer per dag de hele planeet in beeld.',
    /** nl.md §2, word for word */
    suomiNpp: 'De eerste VIIRS-camera in een baan om de aarde, die sinds 2011 een strook van 3.040 km bestrijkt.',
    /** nl.md §2, word for word: present tense with `sinds` */
    terra: 'De MODIS-camera kijkt sinds 1999 naar de hele planeet, 2.330 km tegelijk.',
    aqua: 'De MODIS-camera kijkt sinds 2002 naar de hele planeet, 2.330 km tegelijk.',
    metop: 'Europese weersatelliet in een polaire baan; de AVHRR-camera bestrijkt een strook van 2.900 km met 1,1 km per pixel.',
    sentinel3: 'Het instrument OLCI legt de kleur van land en oceaan vast in 21 banden, over een strook van 1.270 km.',
    fengyun3: 'Chinese weersatelliet in een polaire baan; de MERSI-camera bestrijkt een strook van 2.900 km.',
    /** A dawn–dusk orbit follows the terminator, the `dag-nachtgrens` */
    fengyun3e: 'Chinese weersatelliet in een baan langs de dag-nachtgrens, met een lichtgevoelige MERSI-camera.',

    // ── Geostationary weather satellites (each sits over the equator and images the whole disc below it) ──

    /** `de Amerika’s`: North and South America together */
    goesEast: 'GOES-East: elke 10 minuten een beeld van de hele aardschijf met de Amerika’s.',
    goesWest: 'GOES-West: elke 10 minuten een beeld van de hele aardschijf met de Stille Oceaan en de Amerika’s.',
    goes16: 'De voormalige GOES-East, die als reserve in een baan om de aarde blijft.',
    goes17: 'De voormalige GOES-West, die als reserve in een baan om de aarde blijft.',
    himawari9: 'De Japanse weersatelliet: elke 10 minuten een beeld van de hele aardschijf met Azië en de Stille Oceaan.',
    himawari8: 'Reserve voor Himawari-9.',
    meteosat12: 'De eerste Meteosat van de derde generatie (MTG-I1): elke 10 minuten een beeld van Europa en Afrika.',
    meteosat9: 'Voor het gebied rond de Indische Oceaan: elke 15 minuten een beeld van de hele aardschijf.',
    meteosatSecondGen: 'Meteosat van de tweede generatie, hier niet meegeteld als satelliet die deze plek op de hele aardschijf vastlegt.',
    mtgI2: 'Tweede Meteosat van de derde generatie, nog niet in operationele dienst.',
    /** "Korea" is the South: `Zuid-Koreaans` */
    geoKompsat2a: 'De Zuid-Koreaanse weersatelliet: elke 10 minuten een beeld van de hele aardschijf.',
    fengyun4b: 'De operationele geostationaire weersatelliet van China: elke 15 minuten een beeld van de hele aardschijf.',
    fengyun4a: 'Oudere Chinese geostationaire weersatelliet, niet meegeteld als de primaire dienst.',
    fengyun4c: 'Nieuwste Chinese geostationaire weersatelliet, nog niet in operationele dienst.',
    insat: 'Indiase weersatelliet: elke 30 minuten een beeld van de hele aardschijf.',
    insat3d: 'Oudere Indiase weersatelliet, niet meegeteld als operationele camera.',
    elektroL: 'Russische geostationaire weersatelliet: elke 30 minuten een beeld van de hele aardschijf.',
    elektroL2: 'Oudere Russische geostationaire weersatelliet, niet meegeteld als operationele camera.',
    elektroL5: 'Nieuwste Russische geostationaire weersatelliet, nog niet meegeteld als operationeel.',

    // ── Commercial and government high-resolution cameras ──

    /** `kan` (singular) ties `die` to the camera, not to the pixels */
    worldview1: 'Panchromatische camera met pixels van 50 cm, die ver naast het grondspoor kan kijken.',
    worldview2: 'Camera met acht banden en panchromatische pixels van 46 cm.',
    worldview3: 'Camera met panchromatische pixels van 31 cm en 16 spectrale banden.',
    geoeye1: 'Camera met panchromatische pixels van 41 cm, sinds 2008 in een baan om de aarde.',
    worldviewLegion: 'Een van de WorldView Legion-camera’s van Maxar, met pixels van ongeveer 30 cm.',
    /** Planet is the company (capital P); `per opdracht` is tasking */
    skysat: 'Wendbare camera van Planet met pixels van ongeveer 50 cm, die per opdracht op een bepaald doel wordt gericht.',
    pelican: 'De nieuwere wendbare camera van Planet, voor zeer scherpe beelden.',
    superDove: 'Een SuperDove-cubesat van Planet; de vloot legt dagelijks het meeste land op aarde vast, met ongeveer 3 m per pixel.',
    /** "or better" for pixels is `of fijner` */
    blacksky: 'Een camera van BlackSky die vaak terugkomt boven dezelfde plek, met pixels van ongeveer 1 m of fijner.',
    pleiades: 'Wendbare camera die panchromatische beelden levert met 50 cm per pixel.',
    /** "native pixels": the camera's own pixel size, not resampled (`pixelgrootte`, §4.1) */
    pleiadesNeo: 'Wendbare camera met een eigen pixelgrootte van 30 cm.',
    spot6: 'Camera voor grote gebieden, met panchromatische pixels van 1,5 m en een strook van 60 km.',
    spot7: 'Tweeling van SPOT 6; Azerbeidzjan exploiteert de satelliet als Azersky.',
    kompsat3: 'Zuid-Koreaanse camera met panchromatische pixels van 70 cm.',
    kompsat3a: 'Zuid-Koreaanse camera met panchromatische pixels van 55 cm en een infraroodkanaal.',
    jilin1: 'Onderdeel van Jilin-1, een Chinese commerciële constellatie met pixels kleiner dan een meter.',
    superview: 'Chinese commerciële camera met pixels van ongeveer 50 cm of fijner.',
    gaofenWideField: 'Chinese overheidssatelliet met panchromatische pixels van 2 m en groothoekcamera’s met pixels van 16 m.',
    gaofen2: 'Chinese overheidssatelliet met panchromatische pixels van 80 cm.',
    gaofen7: 'Chinese overheidssatelliet voor stereokartering, met pixels kleiner dan een meter.',
    gaofenOptical: 'Chinese optische overheidssatelliet voor zeer scherpe beelden; de specificaties zijn niet gepubliceerd.',

    // ── Radar satellites (they see through cloud and at night) ──

    /** `schuin opzij`: radar looks sideways, as About's radar fact says it */
    sentinel1: 'C-bandradar van Copernicus die elk beeld publiceert: een strook van 250 km schuin opzij, met 20 m per pixel, door wolken heen, dag en nacht.',
    iceye: 'Kleine X-bandradarsatelliet die per opdracht door wolken heen beelden maakt, dag en nacht.',
    capella: 'X-bandradarsatelliet die in spotlightmodus beelden maakt met ongeveer 50 cm per pixel, dag en nacht.',
    umbra: 'X-bandradarsatelliet die in spotlightmodus beelden maakt tot ongeveer 25 cm per pixel.',
    japaneseSmallRadar: 'Kleine Japanse X-bandradarsatelliet.',
    kompsat5: 'Zuid-Koreaanse X-bandradarsatelliet die in spotlightmodus beelden maakt met 1 m per pixel.',
    /** nl.md §2, word for word */
    terrasarX: 'Duitse X-bandradarsatelliet die sinds 2007 beelden maakt.',
    tandemX: 'Radarsatelliet die in nauwe formatie met TerraSAR-X vliegt om het reliëf van de aarde in kaart te brengen.',
    cosmoSkymed: 'Italiaanse X-bandradarsatelliet van het systeem COSMO-SkyMed.',
    paz: 'Spaanse X-bandradarsatelliet.',
    radarsat2: 'Canadese C-bandradarsatelliet die sinds 2007 beelden maakt.',
    rcm: 'Een van de drie satellieten van de Canadese RADARSAT Constellation Mission.',
    saocom: 'Argentijnse L-bandradarsatelliet die ook bodemvocht meet.',
    alos2: 'Japanse L-bandradarsatelliet die sinds 2014 beelden maakt.',
    alos4: 'Japanse L-bandradarsatelliet, opvolger van ALOS-2.',
    /** A radar's bands are `frequentiebanden`; `die` follows `Radar` directly, so it cannot attach to the bands */
    nisar: 'Radar die op twee frequentiebanden een strook van 242 km in kaart brengt om te meten hoe de grond beweegt.',
    superviewNeo2: 'Chinese commerciële X-bandradarsatelliet.',
    gaofen3: 'Chinese C-bandradarsatelliet van de overheid.',
    gaofen12: 'Chinese radarsatelliet van de overheid; de specificaties zijn niet gepubliceerd.',

    // ── Crewed space stations ──

    iss: 'Het Internationaal Ruimtestation, sinds november 2000 onafgebroken bemand.',
    tiangong: 'Het Chinese ruimtestation, gebouwd rond de kernmodule Tianhe, die in 2021 werd gelanceerd.',
  },
}

export default sats
