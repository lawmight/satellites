/**
 * Polish blurbs for the satellites (see docs/i18n/pl.md §4.1, §4.2, §5.2, §6.3, §8): the one sentence under a
 * satellite's name in the pass view, saying what its camera or radar is.
 *
 * Why these forms: the name is the header above, so each blurb either says what the satellite is («Chiński satelita
 * pogodowy…», «Satelita radarowy w paśmie X…»), whose noun fixes the gender of anything that follows, or starts with
 * «Jego …», which points back to that satellite. Verbs about it are in the present («rejestruje», «obserwuje od 1999
 * r.», «leci»), which shows no gender, so a name read as feminine («Aqua», «Umbra») never clashes with a past tense
 * (§5.2). An imaging satellite is «satelita obserwacyjny», a named instrument «instrument» (never «obrazownik»), a
 * pixel size «piksel N m», a swath «pas obrazowania», «images» «rejestruje obrazy», and «watched» the product's
 * «obserwuje». Names after a preposition stand behind a classifier («firmy Planet», «programu Copernicus», «z satelitą
 * TerraSAR-X»), so none is declined (§4.2). Radar bands keep their Latin letter («w paśmie C»), and a radar mode keeps
 * its name («tryb spotlight»). Nothing says «cel» or «celować» (§8): a tasked camera is pointed «na konkretne
 * miejsca». Numbers are written the Polish way, grouped only from five digits («3040 km», «1,1 km», §6.4), a bare
 * year in prose takes «r.», and a number and its unit, or a one-letter word and the next, are tied by a no-break space.
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──
    sentinel2: 'Wielospektralny satelita obserwacyjny programu Copernicus: 13\u00a0kanałów, piksel 10\u00a0m, pas obrazowania 290\u00a0km.',
    landsat8: 'Instrument Operational Land Imager: piksel 30\u00a0m w\u00a0kolorze i\u00a015\u00a0m w\u00a0kanale panchromatycznym, pas obrazowania 185\u00a0km.',
    landsat9: 'Instrument Operational Land Imager 2: piksel 30\u00a0m w\u00a0kolorze i\u00a015\u00a0m w\u00a0kanale panchromatycznym, pas obrazowania 185\u00a0km.',

    // ── Weather satellites in polar orbit ──
    noaaViirs: 'Jego instrument VIIRS omiata pas obrazowania o\u00a0szerokości 3040\u00a0km, obejmując całą planetę dwa razy na dobę.',
    suomiNpp: 'Pierwszy instrument VIIRS na orbicie: od 2011\u00a0r. omiata pas obrazowania o\u00a0szerokości 3040\u00a0km.',
    terra: 'Jego instrument MODIS od 1999\u00a0r. obserwuje całą planetę pasami o\u00a0szerokości 2330\u00a0km.',
    aqua: 'Jego instrument MODIS od 2002\u00a0r. obserwuje całą planetę pasami o\u00a0szerokości 2330\u00a0km.',
    metop: 'Europejski satelita pogodowy na orbicie okołobiegunowej; jego instrument AVHRR obejmuje pas obrazowania o\u00a0szerokości 2900\u00a0km z\u00a0pikselem 1,1\u00a0km.',
    sentinel3: 'Jego instrument OLCI rejestruje barwę lądów i\u00a0oceanów w\u00a021\u00a0kanałach, w\u00a0pasie obrazowania o\u00a0szerokości 1270\u00a0km.',
    fengyun3: 'Chiński satelita pogodowy na orbicie okołobiegunowej; jego instrument MERSI obejmuje pas obrazowania o\u00a0szerokości 2900\u00a0km.',
    fengyun3e: 'Chiński satelita pogodowy na orbicie typu świt–zmierzch, z\u00a0instrumentem MERSI czułym na słabe światło.',

    // ── Geostationary weather satellites (each sits over the equator and images the whole disc below it) ──
    goesEast: 'GOES-East: co 10\u00a0minut rejestruje obraz pełnej tarczy Ziemi z\u00a0obiema Amerykami.',
    goesWest: 'GOES-West: co 10\u00a0minut rejestruje obraz pełnej tarczy Ziemi z\u00a0Pacyfikiem i\u00a0obiema Amerykami.',
    goes16: 'Dawny GOES-East, dziś satelita rezerwowy utrzymywany na orbicie.',
    goes17: 'Dawny GOES-West, dziś satelita rezerwowy utrzymywany na orbicie.',
    himawari9: 'Japoński satelita pogodowy: co 10\u00a0minut rejestruje obraz pełnej tarczy Ziemi z\u00a0Azją i\u00a0Pacyfikiem.',
    himawari8: 'Rezerwa dla satelity Himawari-9.',
    meteosat12: 'Pierwszy satelita Meteosat trzeciej generacji (MTG-I1): co 10\u00a0minut rejestruje obrazy Europy i\u00a0Afryki.',
    meteosat9: 'Obejmuje region Oceanu Indyjskiego i\u00a0co 15\u00a0minut rejestruje obraz pełnej tarczy Ziemi.',
    meteosatSecondGen: 'Satelita Meteosat drugiej generacji; nie liczymy go tu wśród satelitów, których obrazy pełnej tarczy obejmują to miejsce.',
    mtgI2: 'Drugi satelita Meteosat trzeciej generacji; jeszcze nie pracuje operacyjnie.',
    geoKompsat2a: 'Koreański satelita pogodowy: co 10\u00a0minut rejestruje obraz pełnej tarczy Ziemi.',
    fengyun4b: 'Chiński operacyjny satelita pogodowy na orbicie geostacjonarnej: co 15\u00a0minut rejestruje obraz pełnej tarczy Ziemi.',
    fengyun4a: 'Starszy chiński satelita geostacjonarny; nie liczymy go jako głównego.',
    fengyun4c: 'Najnowszy chiński satelita geostacjonarny; jeszcze nie pracuje operacyjnie.',
    insat: 'Indyjski satelita pogodowy: co 30\u00a0minut rejestruje obraz pełnej tarczy Ziemi.',
    insat3d: 'Starszy indyjski satelita pogodowy; nie liczymy go jako operacyjnego.',
    elektroL: 'Rosyjski geostacjonarny satelita pogodowy: co 30\u00a0minut rejestruje obraz pełnej tarczy Ziemi.',
    elektroL2: 'Starszy rosyjski geostacjonarny satelita pogodowy; nie liczymy go jako operacyjnego.',
    elektroL5: 'Najnowszy rosyjski geostacjonarny satelita pogodowy; jeszcze nie liczymy go jako operacyjnego.',

    // ── Commercial and government high-resolution cameras ──
    worldview1: 'Satelita z\u00a0kamerą panchromatyczną o\u00a0pikselu 50\u00a0cm; może patrzeć daleko w\u00a0bok od śladu orbity.',
    worldview2: 'Ośmiokanałowy satelita obserwacyjny z\u00a0pikselem panchromatycznym 46\u00a0cm.',
    worldview3: 'Satelita obserwacyjny z\u00a0pikselem panchromatycznym 31\u00a0cm i\u00a016\u00a0kanałami spektralnymi.',
    geoeye1: 'Satelita obserwacyjny z\u00a0pikselem panchromatycznym 41\u00a0cm, na orbicie od 2008\u00a0r.',
    worldviewLegion: 'Jeden z\u00a0satelitów WorldView Legion firmy Maxar, z\u00a0pikselem ok.\u00a030\u00a0cm.',
    skysat: 'Zwrotny satelita obserwacyjny firmy Planet z\u00a0pikselem ok.\u00a050\u00a0cm; operator na zamówienie kieruje go na konkretne miejsca.',
    pelican: 'Nowszy zwrotny satelita obserwacyjny firmy Planet o\u00a0wysokiej rozdzielczości.',
    superDove: 'Cubesat SuperDove firmy Planet; cała flota codziennie rejestruje obrazy większości lądów Ziemi z\u00a0pikselem ok.\u00a03\u00a0m.',
    blacksky: 'Satelita obserwacyjny firmy BlackSky z\u00a0pikselem ok.\u00a01\u00a0m lub mniejszym; często wraca nad te same miejsca.',
    pleiades: 'Zwrotny satelita obserwacyjny dostarczający obrazy panchromatyczne o\u00a0rozdzielczości 50\u00a0cm.',
    pleiadesNeo: 'Zwrotny satelita obserwacyjny z\u00a0natywnym pikselem 30\u00a0cm.',
    spot6: 'Satelita do obserwacji dużych obszarów, z\u00a0pikselem panchromatycznym 1,5\u00a0m i\u00a0pasem obrazowania 60\u00a0km.',
    spot7: 'Bliźniak satelity SPOT 6, eksploatowany przez Azerbejdżan jako Azersky.',
    kompsat3: 'Koreański satelita obserwacyjny z\u00a0pikselem panchromatycznym 70\u00a0cm.',
    kompsat3a: 'Koreański satelita obserwacyjny z\u00a0pikselem panchromatycznym 55\u00a0cm i\u00a0kanałem podczerwieni.',
    jilin1: 'Część chińskiej komercyjnej konstelacji Jilin-1, z\u00a0kamerami o\u00a0pikselu mniejszym niż metr.',
    superview: 'Chiński komercyjny satelita obserwacyjny z\u00a0pikselem ok.\u00a050\u00a0cm lub mniejszym.',
    gaofenWideField: 'Chiński rządowy satelita obserwacyjny z\u00a0kamerą panchromatyczną o\u00a0pikselu 2\u00a0m i\u00a0kamerami szerokopolowymi o\u00a0pikselu 16\u00a0m.',
    gaofen2: 'Chiński rządowy satelita obserwacyjny z\u00a0pikselem panchromatycznym 80\u00a0cm.',
    gaofen7: 'Chiński rządowy satelita do mapowania stereoskopowego z\u00a0pikselem mniejszym niż metr.',
    gaofenOptical: 'Chiński rządowy satelita optyczny wysokiej rozdzielczości; jego parametrów nie opublikowano.',

    // ── Radar satellites (they see through cloud and at night) ──
    sentinel1: 'Satelita radarowy programu Copernicus w\u00a0paśmie C, który publikuje każdy obraz: pas obrazowania 250\u00a0km z\u00a0boku, piksel 20\u00a0m, przez chmury, w\u00a0dzień i\u00a0w\u00a0nocy.',
    iceye: 'Mały satelita radarowy w\u00a0paśmie X, który na zamówienie może rejestrować obrazy przez chmury, w\u00a0dzień i\u00a0w\u00a0nocy.',
    capella: 'Satelita radarowy w\u00a0paśmie X z\u00a0obrazami w\u00a0trybie spotlight o\u00a0rozdzielczości ok.\u00a050\u00a0cm, w\u00a0dzień i\u00a0w\u00a0nocy.',
    umbra: 'Satelita radarowy w\u00a0paśmie X z\u00a0obrazami w\u00a0trybie spotlight o\u00a0rozdzielczości do ok.\u00a025\u00a0cm.',
    japaneseSmallRadar: 'Mały japoński satelita radarowy w\u00a0paśmie X.',
    kompsat5: 'Koreański satelita radarowy w\u00a0paśmie X z\u00a0obrazami w\u00a0trybie spotlight o\u00a0rozdzielczości 1\u00a0m.',
    terrasarX: 'Niemiecki satelita radarowy w\u00a0paśmie X, rejestrujący obrazy od 2007\u00a0r.',
    tandemX: 'Leci w\u00a0ciasnej formacji z\u00a0satelitą TerraSAR-X i\u00a0radarem mapuje ukształtowanie powierzchni Ziemi.',
    cosmoSkymed: 'Włoski satelita radarowy w\u00a0paśmie X z\u00a0systemu COSMO-SkyMed.',
    paz: 'Hiszpański satelita radarowy w\u00a0paśmie X.',
    radarsat2: 'Kanadyjski satelita radarowy w\u00a0paśmie C, rejestrujący obrazy od 2007\u00a0r.',
    rcm: 'Jeden z\u00a0trzech satelitów kanadyjskiego programu RADARSAT Constellation Mission.',
    saocom: 'Argentyński satelita radarowy w\u00a0paśmie L, który mierzy też wilgotność gleby.',
    alos2: 'Japoński satelita radarowy w\u00a0paśmie L, rejestrujący obrazy od 2014\u00a0r.',
    alos4: 'Japoński satelita radarowy w\u00a0paśmie L, następca satelity ALOS-2.',
    nisar: 'Dwupasmowy satelita radarowy, który mapuje pas obrazowania o\u00a0szerokości 242\u00a0km, by mierzyć ruchy gruntu.',
    superviewNeo2: 'Chiński komercyjny satelita radarowy w\u00a0paśmie X.',
    gaofen3: 'Chiński rządowy satelita radarowy w\u00a0paśmie C.',
    gaofen12: 'Chiński rządowy satelita radarowy; jego parametrów nie opublikowano.',

    // ── Crewed space stations ──
    iss: 'Międzynarodowa Stacja Kosmiczna, nieprzerwanie zamieszkana od listopada 2000\u00a0r.',
    tiangong: 'Chińska stacja kosmiczna zbudowana wokół modułu bazowego Tianhe, wyniesionego na orbitę w\u00a02021\u00a0r.',
  },
}
export default sats
