/**
 * French copy for the About page («Comment ça marche», src/ui/pages/AboutPage.tsx; see src/i18n/en/about.ts, and
 * docs/i18n/fr.md §3.7, which gives the title, lede, sections, short answers, the tilting row and the privacy opening
 * word for word, and §3.6 for the verdicts' longer word).
 *
 * Why it reads this way: About is *vous*, plain and conversational but declarative; the visitor's own questions use
 * *on* or the first person (*Peut-on me voir ?*), and the product's *we* is *nous* for what it does, keeps or cannot
 * see (§1.1). Nothing agrees with *vous* or a satellite name (§1.3): Sentinel-1's sentence goes through *son radar …
 * il*, the weather row through *quelques-uns* (the term's *satellites*). The searched spot is *l’endroit choisi*,
 * echoing the lede's *Choisissez un endroit*. *image* is the umbrella word wherever the item can be radar, a mosaic or
 * a full-disc frame; *photo* only for Sentinel-2 and Landsat pictures (§3.9). *Fauchée* is glossed once, in the
 * straight-down row (§2.1). Counts are digits even in prose (*toutes les 6 heures*, *les 7 derniers jours*, §2.2),
 * the loaded count arrives as a mono part grouped by fmt('fr') with every plural form, and the fetch stamp stays as it
 * is. The privacy rows say exactly what the English says. Key caps are *Entrée*, *Espace*, *Échap*; OpenStreetMap's
 * attribution is its French form. Typography: U+00A0 before a colon and between a number and its unit or noun,
 * U+202F before ; ? and inside « », one colon per sentence.
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('fr')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

/** "1 objet, récupéré", "16 893 objets, récupérés", "1 000 000 d’objets, récupérés": the form follows the number shown. */
const objects = (count: number) =>
  f.plural(Math.round(count), {
    one: '\u00a0objet, récupéré le ',
    many: '\u00a0d’objets, récupérés le ',
    other: '\u00a0objets, récupérés le ',
  })

const about: typeof en = {
  bar: 'À propos',
  close: 'Fermer',
  sectionsLabel: 'Sections',
  /** «Comment ça / *marche*.» (§3.7): the accent on the verb, the full stop outside it */
  title: [['Comment ça'], [accent('marche'), '.']] as Rich[],
  lede: 'Choisissez un endroit sur Terre. Nous calculons quels satellites l’ont survolé la semaine écoulée, puis nous allons chercher les images qu’ils ont prises. Tout se passe dans votre navigateur, avec des données publiques.',

  sections: {
    short: 'L’essentiel',
    method: 'Comment nous trouvons les passages',
    words: 'Ce que veulent dire les libellés',
    accuracy: 'Ce que nous ne voyons pas',
    privacy: 'Confidentialité',
    credits: 'Crédits',
    keys: 'Clavier',
  },

  short: {
    live: {
      term: 'C’est en direct\u202f?',
      text: 'Pas tout à fait. Les images arrivent dans les archives de quelques heures à deux jours après la prise de vue\u00a0: les passages les plus récents n’en ont peut-être pas encore.',
    },
    seeMe: {
      term: 'Peut-on me voir\u202f?',
      text: 'Non. Au mieux, un pixel couvre ici 10\u00a0m de côté. Une voiture tient dans un pixel. On ne vous y voit pas.',
    },
    every: {
      term: 'Est-ce que ce sont tous les satellites\u202f?',
      text: 'Non. Les satellites militaires et de renseignement figurent rarement dans les catalogues publics, et les entreprises ne disent pas où elles pointent leurs caméras.',
    },
  },

  method: {
    /** The link stays on CelesTrak's name; *l’US Space Force* takes its article in prose (§4.1) */
    orbits: [
      'Pour chaque objet en orbite, un jeu de nombres public décrit sa trajectoire. ',
      link('CelesTrak'),
      ' les publie d’après le suivi de l’US Space Force, et nous en récupérons une copie à jour toutes les 6\u00a0heures.',
    ] as AboutPart[],
    /** «Cette page a chargé 16 893 objets, récupérés le 2026-11-08 03:34Z.» (*récupérés* agrees with *objets*) */
    loaded: (count: number, stamp: string): AboutPart[] => [
      'Cette page a chargé ',
      num(f.int(count)),
      objects(count),
      num(stamp),
      '.',
    ],
    sgp4: 'Avec SGP4, le modèle orbital standard, nous calculons la trajectoire de chaque satellite sur les 7\u00a0derniers jours. Nous notons chaque fois que l’endroit choisi se trouvait dans le champ de vue du satellite.',
    facts: {
      /** Glosses *fauchée* once, for the rest of the product (§2.1); never *bande* (§4.1) */
      straightDown: {
        term: 'À la verticale',
        text: 'Sentinel-2 et Landsat pointent droit vers le sol et couvrent un couloir appelé fauchée\u00a0: environ 290\u00a0km de large pour Sentinel-2, 185\u00a0km pour Landsat. Vous devez vous trouver dans ce couloir.',
      },
      /** Quotes the could verdict's title as the results show it, in « » (§3.7) */
      tilting: {
        term: 'Caméras orientables',
        text: 'De nombreux satellites commerciaux peuvent s’incliner de 30 à 45\u00a0degrés. Si vous étiez à portée, nous classons le passage «\u202fAurait pu viser ici\u202f».',
      },
      daylight: {
        term: 'Lumière du jour',
        text: 'Une caméra ordinaire a besoin du soleil. Un passage dans le noir ne compte jamais comme une photo.',
      },
      /** Radar is never *photo*; one colon per sentence (§2.2) */
      radar: {
        term: 'Radar',
        text: 'Sentinel-1 n’a pas besoin du soleil. Son radar émet des micro-ondes et enregistre leur écho\u00a0: il voit à travers les nuages et la nuit, en pointant vers un côté de sa trace au sol. Ses images sont publiques, elles aussi\u00a0: nous les montrons en gris. Les sols rugueux et les bâtiments y sont clairs, l’eau calme y est sombre.',
      },
      weather: {
        term: 'Satellites météo',
        text: 'Quelques-uns restent au-dessus de l’équateur et observent la moitié de la planète toutes les 10\u00a0minutes. Si vous êtes de leur côté de la Terre, vous figurez sur chacune de leurs images.',
      },
    },
    archives:
      'Ensuite, nous interrogeons les archives d’images (le Planetary Computer de Microsoft, Element 84 et la NASA) et rattachons chaque image au passage pendant lequel elle a été prise. Chaque image que vous voyez est l’image réelle, recadrée autour de l’endroit choisi.',
    photoFacts: {
      touchUps: {
        term: 'Retouches',
        text: 'Nous équilibrons les couleurs des photos Sentinel-2 et Landsat pour votre écran, nous les lissons et accentuons un peu leur netteté, de la même façon sur toute l’image. Rien n’est ajouté ni retiré.',
      },
      /** The photo viewer's north arrow is labelled N in French too; "straight up" is the image's top, not *la verticale* (nadir) */
      whichWayUp: {
        term: 'Où est le nord',
        text: 'Les photos Sentinel-2 et Landsat gardent la grille cartographique que les archives utilisent à l’endroit choisi\u00a0: le nord peut s’écarter de quelques degrés du haut de l’image. Quand vous ouvrez une photo, sa flèche N l’indique exactement.',
      },
    },
  },

  /** The next sentence after each verdict's definition (§3.6); *la*, *l’image*, *elle* refer back to it */
  verdictMore: {
    imaged: 'Si nous la montrons, c’est l’image réelle.',
    likely: 'L’image n’est pas encore publique, ou elle a été écartée à cause des nuages.',
    could: 'Rien ne permet de savoir si elle l’a vraiment fait.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: 'Positions exactes',
      text: 'Les données orbitales publiques ont une précision d’environ un kilomètre, qui se dégrade un peu chaque jour. Les heures peuvent avoir quelques secondes d’écart.',
    },
    secret: {
      term: 'Satellites secrets',
      text: 'Certaines des meilleures caméras en orbite appartiennent à des armées. Elles n’apparaissent pas ici.',
    },
    clouds: {
      term: 'Nuages',
      text: 'Beaucoup de photos ne montrent que des nuages. Quand les archives l’indiquent, nous vérifions le pixel exact de l’endroit choisi et vous disons s’il est sous les nuages.',
    },
    delays: { term: 'Délais', text: 'Les photos peuvent mettre un jour ou deux à apparaître.' },
  },

  /** Exactly the English, no more and no less (§3.7, §8) */
  privacy: {
    where: { term: 'Où tout se calcule', text: 'Les calculs d’orbite se font dans votre navigateur.' },
    kept: {
      term: 'Ce que nous conservons',
      text: 'Nous comptons les recherches par ville et par zone d’environ 10\u00a0km, jamais votre position exacte, et nous tenons le compte de ce qui est ouvert et partagé. Aucune adresse IP, aucun cookie déposé par nous, rien qui relie une visite à la suivante.',
    },
    others: {
      term: 'Qui d’autre y a accès',
      text: 'La plupart des noms de lieux viennent d’une liste intégrée au site. Les autres recherches sont envoyées à Open-Meteo, Photon ou Nominatim. Les images se chargent directement depuis les archives. Notre hébergeur compte les pages vues et mesure la vitesse, sans cookie, et peut déposer un cookie de sécurité pour distinguer les humains des robots. Nous ne le lisons jamais.',
    },
    links: {
      term: 'Liens de partage',
      text: 'Un lien n’est créé que lorsque vous partagez quelque chose. Toute personne qui a le lien voit le nom du lieu, une position arrondie à environ 1\u00a0km et le passage que vous avez choisi.',
    },
  },

  /** Product, agency, licence and people's names as they are; OpenStreetMap's French attribution */
  credits: {
    madeBy: { who: 'Créé par', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' sur X'] },
    gibs: 'Images du service GIBS de la NASA, qui fait partie d’EOSDIS. GOES via la NOAA et le CIRA, Himawari via la JMA.',
    archives: {
      who: 'Archives',
      text: 'Microsoft Planetary Computer et Element 84 Earth Search\u202f; la bande à 15\u00a0m de Landsat vient du Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Orbites', text: 'Éléments orbitaux de CelesTrak. SGP4 par satellite.js.' },
    placeNames: {
      who: 'Noms de lieux',
      text: 'Photon par komoot. Données cartographiques © les contributeurs d’OpenStreetMap (ODbL).',
    },
    textures: { who: 'Textures de la Terre', text: 'Solar System Scope (CC BY 4.0), d’après NASA Blue Marble et Black Marble.' },
    type: { who: 'Polices', text: 'Instrument Sans et Serif par Instrument, Martian Mono par Evil Martians (SIL OFL).' },
  },

  /** Infinitives for actions (§1.1); the viewer's words (*Image précédente*, *Agrandir l’image*, *Reconstitution*) */
  keys: {
    search: 'Rechercher un lieu',
    suggestions: 'Parcourir les suggestions',
    choose: 'Choisir',
    passes: 'Parcourir les passages',
    photos: 'Image précédente / suivante',
    expand: 'Agrandir l’image',
    zoom: 'Zoom (image agrandie)',
    play: 'Lancer ou mettre en pause la reconstitution',
    back: 'Revenir en arrière ou fermer',
    help: 'Cette page',
  },
  /** The names printed on French keyboards' caps (§3.7) */
  keyNames: { enter: 'Entrée', space: 'Espace', esc: 'Échap' },

  builtBy: (handle: string): AboutPart[] => ['Créé par ', link(handle)],
  footerNote: 'Tout vient de données publiques. Nous n’avons pris aucune de ces images.',
}

export default about
