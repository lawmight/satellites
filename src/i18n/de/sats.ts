/**
 * German copy about the satellites themselves: the one-sentence blurb under a pass's sentence in the pass view (see
 * src/i18n/en/sats.ts; docs/i18n/de.md is the authority on words, §4.1 for the glossary, §5.2 for the names).
 *
 * Why it reads this way: a blurb sits under a satellite's bare name, whose gender German cannot know (*die ISS*, *der
 * Satellit*), so no blurb points back to the name with *er/sie/es* or *sein/ihr* (§5.2). Each one is headed by a noun
 * we choose and whose gender we know (*Radarsatellit*, *Kamera*, *Wettersatellit*), or names the instrument as the
 * guide's noun: English "Its VIIRS imager" is *Der VIIRS-Sensor an Bord*, "Its OLCI instrument" *Das OLCI-Instrument an
 * Bord*; a relative pronoun or a later *seine* then refers to that noun, never to the name. English's subjectless
 * "images the full disk every 10 minutes" becomes the noun phrase *alle 10 Minuten ein Vollscheibenbild*, the German
 * meteorological term (§4.1). The glossary holds: imager *Sensor* (weather) or *Kamera* (the high-resolution cameras,
 * as the verdicts call them), swath *Aufnahmestreifen*, short *Streifen*, spectral band *Kanal*, radar frequency band
 * *das X-Band* (Latin letter kept, set as *im X-Band*, never a chain like *X-Band-Radarsatellit* that can break after
 * the lone letter), the product verb
 * *beobachten*, crewed *mit Menschen an Bord* (never *Besatzung* or *bemannt*), "operational" *im Regelbetrieb*. Pixel
 * sizes are said the house way, *10 m pro Pixel*, never a number compound like *10-m-Pixel* that would break at its
 * hyphen in this wrapping body text (§6.1); a panchromatic size is *im panchromatischen Kanal*, said last, after any
 * other band (*mit 16 Spektralkanälen und 31 cm pro Pixel im panchromatischen Kanal*), so the dative of a band
 * listed after it can't be read as one more place the pixel size holds. Numbers are grouped and
 * punctuated as fmt('de') prints them (*3.040 km*, *1,1 km*), years never grouped, a no-break space (U+00A0) between a
 * number and its unit or noun. Every name (satellite, instrument, mission, agency, company: *Planet* too, written
 * without an article so it reads as the company) stays as it is. Each blurb stays ONE sentence with a full stop.
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──
    sentinel2: 'Multispektralkamera von Copernicus: 13 Kanäle, 10 m pro Pixel, ein 290 km breiter Aufnahmestreifen.',
    landsat8:
      'Operational Land Imager: 30 m pro Pixel in Farbe, 15 m im panchromatischen Kanal, ein 185 km breiter Aufnahmestreifen.',
    landsat9:
      'Operational Land Imager 2: 30 m pro Pixel in Farbe, 15 m im panchromatischen Kanal, ein 185 km breiter Aufnahmestreifen.',

    // ── Weather satellites in polar orbit ──
    noaaViirs: 'Der VIIRS-Sensor an Bord erfasst einen 3.040 km breiten Streifen und deckt so zweimal täglich den ganzen Planeten ab.',
    suomiNpp: 'Der erste VIIRS-Sensor im Orbit, der seit 2011 einen 3.040 km breiten Streifen erfasst.',
    terra: 'Der MODIS-Sensor an Bord beobachtet seit 1999 den ganzen Planeten, in 2.330 km breiten Streifen.',
    aqua: 'Der MODIS-Sensor an Bord beobachtet seit 2002 den ganzen Planeten, in 2.330 km breiten Streifen.',
    metop:
      'Europäischer Wettersatellit auf polarer Bahn; der AVHRR-Sensor an Bord erfasst einen 2.900 km breiten Streifen mit 1,1 km pro Pixel.',
    sentinel3:
      'Das OLCI-Instrument an Bord erfasst die Farbe von Land und Meer in 21 Kanälen, über einen 1.270 km breiten Streifen.',
    fengyun3: 'Chinesischer Wettersatellit auf polarer Bahn; der MERSI-Sensor an Bord erfasst einen 2.900 km breiten Streifen.',
    fengyun3e: 'Chinesischer Wettersatellit auf einer Dämmerungsbahn, mit einem MERSI-Sensor für schwaches Licht.',

    // ── Geostationary weather satellites (each sits over the equator and images the whole disc below it) ──
    goesEast: 'GOES-East: alle 10 Minuten ein Vollscheibenbild mit Nord- und Südamerika.',
    goesWest: 'GOES-West: alle 10 Minuten ein Vollscheibenbild mit dem Pazifik, Nord- und Südamerika.',
    goes16: 'Früher GOES-East, heute als Reserve im Orbit gehalten.',
    goes17: 'Früher GOES-West, heute als Reserve im Orbit gehalten.',
    himawari9: 'Japans Wettersatellit: alle 10 Minuten ein Vollscheibenbild mit Asien und dem Pazifik.',
    himawari8: 'Reservesatellit für Himawari-9.',
    meteosat12: 'Der erste Meteosat der dritten Generation (MTG-I1): alle 10 Minuten ein Vollscheibenbild mit Europa und Afrika.',
    meteosat9: 'Zuständig für die Region des Indischen Ozeans: alle 15 Minuten ein Vollscheibenbild.',
    /** "not counted here": the app does not list it among the place's watchers; *seine* refers to *Meteosat der zweiten Generation* */
    meteosatSecondGen: 'Meteosat der zweiten Generation; seine Vollscheibenbilder zählen wir für diesen Ort nicht.',
    mtgI2: 'Der zweite bildgebende Meteosat der dritten Generation; noch nicht im Regelbetrieb.',
    geoKompsat2a: 'Südkoreas Wettersatellit: alle 10 Minuten ein Vollscheibenbild.',
    fengyun4b: 'Chinas geostationärer Wettersatellit im Regelbetrieb: alle 15 Minuten ein Vollscheibenbild.',
    fengyun4a: 'Älterer geostationärer Wettersatellit Chinas, den wir nicht als Hauptsatelliten zählen.',
    fengyun4c: 'Neuester geostationärer Wettersatellit Chinas; noch nicht im Regelbetrieb.',
    insat: 'Indischer Wettersatellit: alle 30 Minuten ein Vollscheibenbild.',
    insat3d: 'Älterer indischer Wettersatellit, den wir nicht als Bildquelle im Regelbetrieb zählen.',
    elektroL: 'Russischer geostationärer Wettersatellit: alle 30 Minuten ein Vollscheibenbild.',
    elektroL2: 'Älterer russischer geostationärer Wettersatellit, den wir nicht als Bildquelle im Regelbetrieb zählen.',
    elektroL5: 'Neuester russischer geostationärer Wettersatellit, den wir noch nicht als Bildquelle im Regelbetrieb zählen.',

    // ── Commercial and government high-resolution cameras ──
    worldview1: 'Panchromatische Kamera mit 50 cm pro Pixel, die weit seitlich der Bodenspur aufnehmen kann.',
    worldview2: 'Kamera mit acht Farbkanälen und 46 cm pro Pixel im panchromatischen Kanal.',
    worldview3: 'Kamera mit 16 Spektralkanälen und 31 cm pro Pixel im panchromatischen Kanal.',
    geoeye1: 'Kamera mit 41 cm pro Pixel im panchromatischen Kanal, seit 2008 im Orbit.',
    worldviewLegion: 'Einer der WorldView-Legion-Satelliten von Maxar, mit etwa 30 cm pro Pixel.',
    skysat: 'Wendige Kamera von Planet mit etwa 50 cm pro Pixel, die auf Auftrag bestimmte Ziele aufnimmt.',
    pelican: 'Neuere wendige, hochauflösende Kamera von Planet.',
    superDove:
      'Ein SuperDove-Cubesat von Planet; die Flotte nimmt jeden Tag den größten Teil der Landfläche der Erde auf, mit etwa 3 m pro Pixel.',
    blacksky: 'Kamera von BlackSky für schnelle Wiederholaufnahmen, mit etwa 1 m pro Pixel oder besser.',
    pleiades: 'Wendige Kamera, die panchromatische Produkte mit 50 cm pro Pixel liefert.',
    pleiadesNeo: 'Wendige Kamera, die nativ 30 cm pro Pixel erreicht.',
    spot6: 'Kamera für große Flächen, mit 1,5 m pro Pixel im panchromatischen Kanal und einem 60 km breiten Aufnahmestreifen.',
    spot7: 'Zwilling von SPOT 6, den Aserbaidschan als Azersky betreibt.',
    kompsat3: 'Südkoreanische Kamera mit 70 cm pro Pixel im panchromatischen Kanal.',
    kompsat3a: 'Südkoreanische Kamera mit einem Infrarotkanal und 55 cm pro Pixel im panchromatischen Kanal.',
    jilin1: 'Teil der kommerziellen chinesischen Satellitenkonstellation Jilin-1, mit Kameras für weniger als 1 m pro Pixel.',
    superview: 'Kommerzielle chinesische Kamera mit etwa 50 cm pro Pixel oder besser.',
    gaofenWideField:
      'Staatlicher chinesischer Satellit mit panchromatischen Kameras für 2 m pro Pixel und Weitwinkelkameras für 16 m.',
    gaofen2: 'Staatliche chinesische Kamera mit 80 cm pro Pixel im panchromatischen Kanal.',
    gaofen7: 'Staatliche chinesische Stereokamera zur Kartierung, mit weniger als 1 m pro Pixel.',
    gaofenOptical: 'Staatlicher chinesischer optischer Satellit mit hoher Auflösung; die technischen Daten sind nicht veröffentlicht.',

    // ── Radar satellites (they see through cloud and at night) ──
    sentinel1:
      'Radar von Copernicus im C-Band, dessen Bilder alle öffentlich sind: ein 250 km breiter Streifen seitlich der Bodenspur, 20 m pro Pixel, durch Wolken, bei Tag und Nacht.',
    iceye: 'Kleiner Radarsatellit im X-Band, der auf Auftrag durch Wolken hindurch aufnehmen kann, bei Tag und Nacht.',
    capella: 'Radarsatellit im X-Band; im Spotlight-Modus etwa 50 cm pro Pixel, bei Tag und Nacht.',
    umbra: 'Radarsatellit im X-Band; im Spotlight-Modus bis auf etwa 25 cm pro Pixel.',
    japaneseSmallRadar: 'Kleiner japanischer Radarsatellit im X-Band.',
    kompsat5: 'Südkoreanischer Radarsatellit im X-Band; im Spotlight-Modus 1 m pro Pixel.',
    terrasarX: 'Deutscher Radarsatellit im X-Band, der seit 2007 Bilder aufnimmt.',
    tandemX: 'Radarsatellit, der in enger Formation mit TerraSAR-X fliegt und die Topografie der Erde vermisst.',
    cosmoSkymed: 'Italienischer Radarsatellit im X-Band, Teil des Systems COSMO-SkyMed.',
    paz: 'Spanischer Radarsatellit im X-Band.',
    radarsat2: 'Kanadischer Radarsatellit im C-Band, der seit 2007 Bilder aufnimmt.',
    rcm: 'Einer von drei Satelliten der kanadischen RADARSAT Constellation Mission.',
    saocom: 'Argentinischer Radarsatellit im L-Band, der auch die Bodenfeuchte misst.',
    alos2: 'Japanischer Radarsatellit im L-Band, der seit 2014 Bilder aufnimmt.',
    alos4: 'Japanischer Radarsatellit im L-Band, Nachfolger von ALOS-2.',
    nisar: 'Radar mit zwei Frequenzbändern, das einen 242 km breiten Streifen kartiert, um Bodenbewegungen zu messen.',
    superviewNeo2: 'Kommerzieller chinesischer Radarsatellit im X-Band.',
    gaofen3: 'Staatlicher chinesischer Radarsatellit im C-Band.',
    gaofen12: 'Staatlicher chinesischer Radarsatellit; die technischen Daten sind nicht veröffentlicht.',

    // ── Crewed space stations ──
    iss: 'Die Internationale Raumstation, seit November 2000 durchgehend mit Menschen an Bord.',
    tiangong: 'Die chinesische Raumstation, aufgebaut um das 2021 gestartete Kernmodul Tianhe.',
  },
}
export default sats
