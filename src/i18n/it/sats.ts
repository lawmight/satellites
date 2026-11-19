/**
 * Italian copy about the satellites themselves: the one-sentence blurb under a pass's sentence in the pass view (see
 * src/i18n/en/sats.ts; docs/i18n/it.md §4 is the authority on words).
 *
 * Why it reads this way: each blurb is one plain sentence under the satellite's name, so most are noun phrases
 * (*Satellite radar spagnolo in banda X.*) and none needs a subject pronoun; English "Its …" is the possessive, which
 * agrees with the thing owned (*Il suo strumento VIIRS*), never *esso* or *lui*. Where a participle or adjective must
 * agree, it agrees with a noun written in the blurb (*Satellite…, non contato*), never with the satellite's name (it.md
 * §5.2). The glossary's words hold: an imager on board is a *strumento*, swath *fascia*, band *banda* (radar *in banda
 * C / X / L*, keeping the Latin letter), *pixel* invariable, full disk *disco intero*, standby spare *riserva in
 * orbita*, tasked *su richiesta*, *modalità spotlight*, *submetrico*, *orbita alba-tramonto*, the imaging verb
 * *riprendere* and the product verb *osservare* (never *fotografare*). *riprendere* always takes its object (alone
 * it reads as "resume"): where the English has none, *acquisisce immagini*. "or better" for a pixel size is *o meno*.
 * Countries are CLDR `it`'s (*Corea del Sud*, *Azerbaigian*). Every name (satellite, instrument, mission, agency,
 * company, "Planet" included) stays as it is. Numbers are written the Italian way (*1,1 km*; *3040 km* has no grouping
 * point: CLDR groups from five digits; years never grouped), with U+00A0 between a number and its unit.
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──
    sentinel2: 'Satellite ottico multispettrale di Copernicus: 13 bande, pixel da 10 m, fascia di 290 km.',
    landsat8: 'Operational Land Imager: pixel a colori da 30 m e pancromatici da 15 m, su una fascia di 185 km.',
    landsat9: 'Operational Land Imager 2: pixel a colori da 30 m e pancromatici da 15 m, su una fascia di 185 km.',

    // ── Weather satellites in polar orbit ──
    noaaViirs: 'Il suo strumento VIIRS scandisce una fascia di 3040 km e copre tutto il pianeta due volte al giorno.',
    suomiNpp: 'Il primo strumento VIIRS in orbita: scandisce una fascia di 3040 km dal 2011.',
    /** "has watched": the product verb, *osservare*, in the present with *dal* (ongoing since) */
    terra: 'Il suo strumento MODIS osserva tutto il pianeta, 2330 km alla volta, dal 1999.',
    aqua: 'Il suo strumento MODIS osserva tutto il pianeta, 2330 km alla volta, dal 2002.',
    metop: 'Satellite meteo europeo in orbita polare; il suo strumento AVHRR copre una fascia di 2900 km con pixel da 1,1 km.',
    sentinel3: 'Il suo strumento OLCI riprende il colore delle terre emerse e degli oceani in 21 bande, su una fascia di 1270 km.',
    fengyun3: 'Satellite meteo cinese in orbita polare; il suo strumento MERSI copre una fascia di 2900 km.',
    fengyun3e: 'Satellite meteo cinese in orbita alba-tramonto, con uno strumento MERSI sensibile alla luce debole.',

    // ── Geostationary weather satellites ──
    goesEast: 'GOES-East: riprende il disco intero delle Americhe ogni 10 minuti.',
    goesWest: 'GOES-West: riprende il disco intero del Pacifico e delle Americhe ogni 10 minuti.',
    goes16: 'L’ex GOES-East, ora riserva in orbita.',
    goes17: 'L’ex GOES-West, ora riserva in orbita.',
    himawari9: 'Il satellite meteo del Giappone: riprende il disco intero dell’Asia e del Pacifico ogni 10 minuti.',
    himawari8: 'Riserva di Himawari-9.',
    meteosat12: 'Il primo Meteosat di terza generazione (MTG-I1): riprende l’Europa e l’Africa ogni 10 minuti.',
    meteosat9: 'Copre la regione dell’Oceano Indiano e riprende il disco intero ogni 15 minuti.',
    /** "not counted here": the app does not list it as watching the place (*lo*: a Meteosat, written in the blurb) */
    meteosatSecondGen: 'Meteosat di seconda generazione; qui non lo contiamo tra i satelliti che riprendono questo luogo a disco intero.',
    mtgI2: 'Secondo Meteosat di terza generazione; non è ancora il servizio operativo.',
    geoKompsat2a: 'Il satellite meteo della Corea del Sud: riprende il disco intero ogni 10 minuti.',
    fengyun4b: 'Il satellite meteo geostazionario operativo della Cina: riprende il disco intero ogni 15 minuti.',
    fengyun4a: 'Satellite geostazionario cinese meno recente, non contato come servizio principale.',
    fengyun4c: 'Il più recente satellite geostazionario cinese; non è ancora il servizio operativo.',
    insat: 'Satellite meteo indiano: riprende il disco intero ogni 30 minuti.',
    insat3d: 'Satellite meteo indiano meno recente, non contato tra quelli operativi.',
    elektroL: 'Satellite meteo geostazionario russo: riprende il disco intero ogni 30 minuti.',
    elektroL2: 'Satellite meteo geostazionario russo meno recente, non contato tra quelli operativi.',
    elektroL5: 'Il più recente satellite meteo geostazionario russo; non ancora contato tra quelli operativi.',

    // ── Commercial and government high-resolution cameras ──
    worldview1: 'Satellite pancromatico con pixel da 50 cm, che può puntare molto lontano dalla sua traccia al suolo.',
    worldview2: 'Satellite a otto bande con pixel pancromatici da 46 cm.',
    worldview3: 'Satellite con pixel pancromatici da 31 cm e 16 bande spettrali.',
    geoeye1: 'Satellite con pixel pancromatici da 41 cm, in orbita dal 2008.',
    worldviewLegion: 'Uno dei satelliti WorldView Legion di Maxar, con pixel da circa 30 cm.',
    /** Planet is a company (Planet Labs): *di Planet*, never *pianeta* */
    skysat: 'Satellite agile di Planet con pixel da circa 50 cm, che su richiesta punta verso obiettivi precisi.',
    pelican: 'Satellite agile ad alta risoluzione di Planet, di generazione più recente.',
    superDove: 'Un cubesat SuperDove di Planet; la flotta riprende ogni giorno gran parte delle terre emerse, con pixel da circa 3 m.',
    blacksky: 'Un satellite BlackSky a rivisitazione rapida, con pixel da circa 1 m o meno.',
    pleiades: 'Satellite agile che fornisce prodotti pancromatici da 50 cm.',
    pleiadesNeo: 'Satellite agile con pixel nativi da 30 cm.',
    spot6: 'Satellite ad ampia copertura con pixel pancromatici da 1,5 m e una fascia di 60 km.',
    spot7: 'Gemello di SPOT 6, gestito dall’Azerbaigian con il nome di Azersky.',
    kompsat3: 'Satellite coreano con pixel pancromatici da 70 cm.',
    kompsat3a: 'Satellite coreano con pixel pancromatici da 55 cm e un canale infrarosso.',
    jilin1: 'Fa parte della costellazione commerciale cinese Jilin-1, con risoluzione submetrica.',
    superview: 'Satellite commerciale cinese con pixel da circa 50 cm o meno.',
    gaofenWideField: 'Satellite governativo cinese con fotocamere pancromatiche da 2 m e a grande campo da 16 m.',
    gaofen2: 'Satellite governativo cinese con pixel pancromatici da 80 cm.',
    gaofen7: 'Satellite governativo cinese per la cartografia stereoscopica, con pixel submetrici.',
    gaofenOptical: 'Satellite ottico governativo cinese ad alta risoluzione; le sue specifiche non sono pubblicate.',

    // ── Radar satellites (they see through cloud and at night) ──
    sentinel1: 'Radar in banda C di Copernicus che pubblica ogni immagine: guarda di lato su una fascia di 250 km, a 20 m per pixel, attraverso le nuvole, di giorno e di notte.',
    iceye: 'Piccolo satellite radar in banda X che acquisisce immagini su richiesta, attraverso le nuvole, di giorno e di notte.',
    capella: 'Satellite radar in banda X con immagini in modalità spotlight da circa 50 cm, di giorno e di notte.',
    umbra: 'Satellite radar in banda X con immagini in modalità spotlight fino a circa 25 cm.',
    japaneseSmallRadar: 'Piccolo satellite radar giapponese in banda X.',
    kompsat5: 'Satellite radar coreano in banda X con immagini in modalità spotlight da 1 m.',
    terrasarX: 'Satellite radar tedesco in banda X, che acquisisce immagini dal 2007.',
    tandemX: 'Vola in stretta formazione con TerraSAR-X per mappare con il radar la topografia della Terra.',
    cosmoSkymed: 'Satellite radar italiano in banda X, parte del sistema COSMO-SkyMed.',
    paz: 'Satellite radar spagnolo in banda X.',
    radarsat2: 'Satellite radar canadese in banda C, che acquisisce immagini dal 2007.',
    rcm: 'Uno dei tre satelliti della RADARSAT Constellation Mission canadese.',
    saocom: 'Satellite radar argentino in banda L che misura anche l’umidità del suolo.',
    alos2: 'Satellite radar giapponese in banda L, che acquisisce immagini dal 2014.',
    alos4: 'Satellite radar giapponese in banda L, successore di ALOS-2.',
    nisar: 'Radar a doppia banda che mappa una fascia di 242 km per misurare come si muove il suolo.',
    superviewNeo2: 'Satellite radar commerciale cinese in banda X.',
    gaofen3: 'Satellite radar governativo cinese in banda C.',
    gaofen12: 'Satellite radar governativo cinese; le sue specifiche non sono pubblicate.',

    // ── Crewed space stations ──
    /**
     * *abitata senza interruzioni*: the established Italian phrase for the station's continuous crew, agreeing with
     * *Stazione*, written in the sentence (the glossary's *con equipaggio* is the category, as in the pass list). A
     * fixed date, not a runtime one: the month is written out (*novembre*), lowercase
     */
    iss: 'La Stazione Spaziale Internazionale, abitata senza interruzioni dal novembre 2000.',
    tiangong: 'La stazione spaziale cinese, costruita intorno al modulo centrale Tianhe, lanciato nel 2021.',
  },
}

export default sats
