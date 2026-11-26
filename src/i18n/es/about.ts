/**
 * Spanish copy for the About page ("Cómo funciona", src/ui/pages/AboutPage.tsx; see src/i18n/en/about.ts, and
 * docs/i18n/es.md, which is the authority on every word here and gives the title, the section names, the verdict lines,
 * the privacy terms and the credit prose word for word).
 *
 * Why it reads this way: the page talks to one reader in tú, plainly, with an implied *nosotros* in the verbs
 * (*calculamos*, *no podemos ver*), never the pronoun (es.md §1). The questions name their subject (*¿Puede verme un
 * satélite?*), because a bare third-person verb reads as usted. *foto* only in a sentence that names Sentinel-2, Landsat
 * or daylight cameras; anything that can be radar, a mosaic or a geostationary frame is *imagen* (§4). The searched
 * place is *el lugar que elegiste* or *el punto exacto*, never *tu punto* (§9). The privacy rows say exactly what the
 * English says and promise nothing more (*una zona aproximada de 10 km*, *ninguna cookie propia*, *nunca* only where
 * the English has "never", §8). Numbers typed into the text keep a no-break space before their unit (*10 m*); the
 * loaded count and the fetch stamp arrive as mono parts, the count grouped by fmt('es'), the stamp kept as it is.
 * The licence attribution lines stay English in the page itself; only the credit prose is translated (§8).
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('es')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: 'Acerca de',
  close: 'Cerrar',
  sectionsLabel: 'Secciones',
  /** "Cómo / *funciona*." (es.md, decisions log 39): the accent on the word that means "works", the full stop outside it */
  title: [['Cómo'], [accent('funciona'), '.']] as Rich[],
  lede: 'Elige un punto de la Tierra. Calculamos qué satélites lo sobrevolaron en la última semana y luego buscamos las imágenes que tomaron. Todo ocurre en tu navegador, con datos públicos.',

  /** es.md, decisions log 39 */
  sections: {
    short: 'En resumen',
    method: 'Cómo encontramos las pasadas',
    words: 'Qué significan las etiquetas',
    accuracy: 'Lo que no podemos ver',
    privacy: 'Privacidad',
    credits: 'Créditos',
    keys: 'Teclado',
  },

  short: {
    live: {
      term: '¿Es en tiempo real?',
      text: 'No del todo. Las imágenes tardan de unas horas a un par de días en llegar a los archivos. Puede que las pasadas más recientes aún no tengan ninguna.',
    },
    /** es.md §2 (before and after): the subject named, *auto* for every region, the quietly uncanny ending */
    seeMe: {
      term: '¿Puede verme un satélite?',
      text: 'No. En el mejor de los casos, aquí un píxel mide 10 m de lado. Un auto ocupa un píxel. A ti no\u00a0se\u00a0te\u00a0ve.',
    },
    every: {
      term: '¿Aparecen todos los satélites?',
      text: 'No. La mayoría de los satélites militares y espía no aparecen en los catálogos públicos, y las empresas no dicen hacia dónde apuntan sus cámaras.',
    },
  },

  method: {
    /** The link stays on CelesTrak's name; US Space Force is a name and stays */
    orbits: [
      'Cada objeto en órbita tiene un conjunto público de números que describe su trayectoria. ',
      link('CelesTrak'),
      ' los publica a partir de los datos de seguimiento de la US Space Force. Cada seis horas descargamos una copia nueva.',
    ] as AboutPart[],
    /** "Esta página cargó 16 893 objetos, descargados el 2026-11-08 03:34Z." The participle agrees with the count */
    loaded: (count: number, stamp: string): AboutPart[] => [
      'Esta página cargó ',
      num(f.int(count)),
      ` ${f.plural(count, { one: 'objeto, descargado', many: 'objetos, descargados', other: 'objetos, descargados' })} el `,
      num(stamp),
      '.',
    ],
    sgp4: 'Con SGP4, el modelo orbital estándar, calculamos dónde estuvo cada satélite en los últimos siete días. Luego anotamos cada vez que el lugar que elegiste quedaba dentro de lo que el satélite podía ver.',
    facts: {
      straightDown: {
        term: 'Directamente hacia abajo',
        text: 'Sentinel-2 y Landsat miran directamente hacia abajo, a una franja de terreno. La de Sentinel-2 mide unos 290 km de ancho; la de Landsat, 185 km. Tienes que estar dentro de la franja.',
      },
      /** Quotes the could verdict's title as the results show it, in “ ” (es.md §3.5) */
      tilting: {
        term: 'Cámaras orientables',
        text: 'Muchos satélites comerciales pueden inclinarse entre 30 y 45 grados. Si estabas a su alcance, lo llamamos “pudo haber apuntado aquí”.',
      },
      /** The second sentence is es.md §4's (photo) */
      daylight: {
        term: 'Luz del día',
        text: 'Las cámaras normales necesitan la luz del sol. Una pasada de noche nunca cuenta como foto.',
      },
      /** Radar is never *foto* (es.md §4) */
      radar: {
        term: 'Radar',
        text: 'Sentinel-1 no necesita la luz del sol. Emite microondas y registra el eco, así que ve a través de las nubes y de noche. Mira hacia un lado de su traza. Sus imágenes también son públicas y las mostramos en gris: lo claro es terreno rugoso y edificios; lo oscuro, agua en calma.',
      },
      /** "frame" is *imagen* (es.md §4) */
      weather: {
        term: 'Satélites meteorológicos',
        text: 'Algunos se mantienen sobre el ecuador y observan medio planeta cada 10 minutos. Si estás en la mitad de la Tierra que tienen debajo, apareces en todas sus imágenes.',
      },
    },
    archives:
      'Después buscamos en los archivos de imágenes (Microsoft Planetary Computer, Element 84 y la NASA) y emparejamos cada imagen con la pasada que la tomó. Cada imagen que ves es la real, recortada en torno al lugar que elegiste.',
    photoFacts: {
      touchUps: {
        term: 'Retoques',
        text: 'Equilibramos el color de las fotos de Sentinel-2 y Landsat, las suavizamos y les damos algo de nitidez para tu pantalla, igual en toda la imagen. No ponemos ni quitamos nada.',
      },
      /** The photo viewer's north arrow is labelled N (*norte*), as in English */
      whichWayUp: {
        term: 'Dónde está el norte',
        text: 'Las fotos de Sentinel-2 y Landsat conservan la cuadrícula cartográfica del propio archivo para cada lugar, así que el norte puede no quedar justo arriba, sino girado unos grados. Al abrir una foto, la flecha N indica exactamente dónde está.',
      },
    },
  },

  /** After each verdict's definition, as the next sentence (es.md §3.5, "About, one more line") */
  verdictMore: {
    imaged: 'Si la mostramos, es la imagen real.',
    likely: 'La imagen aún no es pública o se descartó por las nubes.',
    could: 'No hay forma de saber si lo hizo.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: 'Posiciones exactas',
      text: 'Los datos orbitales públicos tienen un margen de error de alrededor de un kilómetro, que crece un poco cada día. Las horas pueden desviarse unos segundos.',
    },
    secret: { term: 'Satélites secretos', text: 'Algunas de las mejores cámaras en órbita son militares. No aparecen en Watched.' },
    clouds: {
      term: 'Nubes',
      text: 'Muchas imágenes son solo nubes. Cuando el archivo lo indica, revisamos el píxel del punto exacto y te lo decimos.',
    },
    delays: { term: 'Retrasos', text: 'Las imágenes pueden tardar uno o dos días en aparecer.' },
  },

  /** Exactly the English, no more and no less (es.md §8) */
  privacy: {
    where: { term: 'Dónde se calcula', text: 'Los cálculos orbitales se hacen en tu navegador.' },
    kept: {
      term: 'Qué guardamos',
      text: 'Contamos las búsquedas por localidad y por una zona aproximada de 10 km, nunca por el punto exacto, y llevamos la cuenta de lo que se abre y se comparte. Ninguna dirección IP, ninguna cookie propia, nada que relacione una visita con la siguiente.',
    },
    others: {
      term: 'Quién más lo ve',
      text: 'La mayoría de los nombres de lugares vienen de una lista incluida en el sitio. Las demás búsquedas van a Open-Meteo, Photon o Nominatim. Las imágenes se cargan directamente desde los archivos. Nuestro proveedor de alojamiento cuenta las visitas a las páginas y mide su velocidad, sin cookies. Puede instalar una cookie de seguridad para distinguir a las personas de los bots. Nunca la leemos.',
    },
    links: {
      term: 'Enlaces para compartir',
      text: 'Solo se crean cuando compartes algo. Quien tenga el enlace ve el nombre del lugar, un punto redondeado a 1 km aproximadamente y la pasada que elegiste.',
    },
  },

  /** Product, agency, licence and people's names as they are; the prose is es.md §8's, OpenStreetMap's own Spanish wording */
  credits: {
    madeBy: { who: 'Hecho por', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' en X'] },
    support: { who: 'Apoyo', text: [link('Ayuda a que Watched siga siendo gratis :)')] as AboutPart[] },
    gibs: 'Imágenes de GIBS de la NASA, parte de EOSDIS. GOES a través de la NOAA y CIRA; Himawari, de la JMA.',
    archives: {
      who: 'Archivos',
      text: 'Microsoft Planetary Computer y Element 84 Earth Search; la banda de 15 m de Landsat, del Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Órbitas', text: 'Elementos orbitales de CelesTrak. SGP4, de satellite.js.' },
    placeNames: { who: 'Nombres de lugares', text: 'Photon, de komoot. Datos del mapa © colaboradores de OpenStreetMap (ODbL).' },
    textures: { who: 'Texturas de la Tierra', text: 'Solar System Scope (CC BY 4.0), a partir de Blue Marble y Black Marble, de la NASA.' },
    type: { who: 'Tipografía', text: 'Instrument Sans y Serif, de Instrument; Martian Mono, de Evil Martians (SIL OFL).' },
  },

  /** Infinitives, no address (es.md §1); *imagen* and *Ampliar* as the viewer says them (§4) */
  keys: {
    search: 'Buscar un lugar',
    suggestions: 'Moverse por las sugerencias',
    choose: 'Elegir',
    passes: 'Recorrer las pasadas',
    photos: 'Imagen anterior / siguiente',
    expand: 'Ampliar la imagen',
    zoom: 'Acercar o alejar la imagen ampliada',
    play: 'Reproducir o pausar la repetición',
    back: 'Volver o cerrar',
    help: 'Esta página',
  },
  /** The names printed on Spanish keyboards' caps (es.md §4: *Enter*, *Espacio*, *Esc*; never *Intro*) */
  keyNames: { enter: 'Enter', space: 'Espacio', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['Creado por ', link(handle)],
  footerNote: 'Hecho con datos públicos. No tomamos ninguna de estas imágenes.',
}

export default about
