/**
 * German copy for the About page („Wie das funktioniert“, src/ui/pages/AboutPage.tsx; see src/i18n/en/about.ts, and
 * docs/i18n/de.md §3.7, which gives the bar, title, lede, section headings, the short answers, the tilting row, where
 * it runs, what we keep, the credit and the key names word for word, and §3.6 for the verdicts' longer word).
 *
 * Why it reads this way: About keeps the hero's voice, *du* in full plain sentences, never *Sie* (§1.1), and *wir* for
 * what the product does, keeps or cannot see. No sentence opens with a capitalised *Sie* or *Ihr* as a pronoun, which
 * would read as formal address (§1.4): the secret-satellites row says *Hier tauchen sie nicht auf.* No pronoun points
 * back to a bare satellite name (§5.2): Sentinel-1's row goes through *Das Radar an Bord … es*. *Bild* is the umbrella
 * word wherever the item can be radar, a mosaic or a full-disc frame; *Foto* only where English means the optical
 * pictures of Sentinel-2 and Landsat, or a camera's (§4.1, §9.1). Off-nadir's *Senkrechte* is never used for a
 * picture's top: north "off straight up" is *nicht genau nach oben*. The loaded count is a mono part grouped by
 * fmt('de'), with both plural forms and a *keine* for zero (§5.3); the fetch stamp is ISO and stays as it is. The
 * privacy rows say exactly what the English says, no more and no less (§8): *auf etwa 10 km genau*, never *anonym*,
 * and no number compound inside these plain lines (*15 m pro Pixel*, not *15-m-Kanal*, §6.1). Key caps are *Enter*,
 * *Leertaste*, *Esc*; OpenStreetMap's credit is its German form (*OpenStreetMap-Mitwirkende*). Typography: „…“
 * quotes, a no-break space (U+00A0) between a number and its unit or noun, no dashes in prose (§6.1).
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('de')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: 'Info',
  close: 'Schließen',
  sectionsLabel: 'Abschnitte',
  /** `Wie das` / `*funktioniert*.` (§3.7): the accent on the verb, the full stop outside it */
  title: [['Wie das'], [accent('funktioniert'), '.']] as Rich[],
  lede: 'Suche dir einen Ort auf der Erde aus. Wir berechnen, welche Satelliten in der letzten Woche darüber hinweggezogen sind, und suchen dann die Bilder, die sie gemacht haben. Alles läuft in deinem Browser, mit öffentlichen Daten.',

  sections: {
    short: 'Kurz gesagt',
    method: 'Wie wir Überflüge finden',
    words: 'Was die Begriffe bedeuten',
    accuracy: 'Was wir nicht sehen',
    privacy: 'Datenschutz',
    credits: 'Quellen',
    keys: 'Tastatur',
  },

  short: {
    live: {
      term: 'Ist das live?',
      text: 'Nicht ganz. Bilder landen erst einige Stunden bis ein, zwei Tage nach der Aufnahme in den Archiven. Die neuesten Überflüge haben darum vielleicht noch keines.',
    },
    seeMe: {
      term: 'Kann es mich sehen?',
      text: 'Nein. Ein Pixel ist hier bestenfalls 10 m breit. Ein Auto ist ein Pixel. Du bist darin nicht zu sehen.',
    },
    every: {
      term: 'Sind das alle Satelliten?',
      text: 'Nein. Militär- und Spionagesatelliten tauchen in öffentlichen Katalogen meist nicht auf, und Firmen sagen nicht, wohin sie ihre Kameras richten.',
    },
  },

  method: {
    /** The link stays on CelesTrak's name; "tracking" is *Bahnverfolgung*, never *Tracking* (§2.4) */
    orbits: [
      'Zu jedem Objekt im Orbit gibt es öffentliche Zahlen, die seine Bahn beschreiben. ',
      link('CelesTrak'),
      ' veröffentlicht sie auf Basis der Bahnverfolgung durch die US Space Force, und wir holen uns alle sechs Stunden eine frische Kopie.',
    ] as AboutPart[],
    /** „Diese Seite hat 16.893 Objekte geladen, abgerufen am 2026-11-08 03:34Z.“; zero says *keine Objekte* (§5.3) */
    loaded: (count: number, stamp: string): AboutPart[] =>
      count === 0
        ? ['Diese Seite hat keine Objekte geladen, abgerufen am ', num(stamp), '.']
        : [
            'Diese Seite hat ',
            num(f.int(count)),
            ` ${f.plural(count, { one: 'Objekt', other: 'Objekte' })} geladen, abgerufen am `,
            num(stamp),
            '.',
          ],
    sgp4: 'Mit SGP4, dem Standardmodell für Umlaufbahnen, berechnen wir die Bahn jedes Satelliten über die letzten sieben Tage. Wir notieren jedes Mal, wenn dein Ort im Sichtfeld eines Satelliten lag.',
    facts: {
      straightDown: {
        term: 'Senkrecht nach unten',
        text: 'Sentinel-2 und Landsat blicken senkrecht nach unten und sehen einen Streifen der Erdoberfläche: etwa 290 km breit bei Sentinel-2, 185 km bei Landsat. Du musst in diesem Streifen sein.',
      },
      /** Quotes the could verdict's title as the results show it, in „…“ (§3.7) */
      tilting: {
        term: 'Schwenkbare Kameras',
        text: 'Viele kommerzielle Satelliten können sich um 30 bis 45 Grad neigen. Warst du in Reichweite, nennen wir das „Konnte hierher blicken“.',
      },
      /** A camera's picture in the dark: *Foto* is honest here (optical only) */
      daylight: {
        term: 'Tageslicht',
        text: 'Normale Kameras brauchen die Sonne. Ein Überflug im Dunkeln zählt nie als Foto.',
      },
      /**
       * *Das Radar an Bord … es*, never a pronoun after the bare name (§5.2); radar is never *Foto*. *und wir zeigen sie
       * in Graustufen*, not *darum*: the grey is not a consequence of the images being public
       */
      radar: {
        term: 'Radar',
        text: 'Sentinel-1 braucht kein Sonnenlicht. Das Radar an Bord sendet Mikrowellen aus und zeichnet ihr Echo auf. So sieht es durch Wolken und bei Nacht und blickt dabei seitlich neben die Bodenspur. Auch diese Bilder sind öffentlich, und wir zeigen sie in Graustufen: Gebäude und rauer Boden sind hell, ruhiges Wasser ist dunkel.',
      },
      weather: {
        term: 'Wettersatelliten',
        text: 'Ein paar von ihnen stehen über dem Äquator und beobachten alle 10 Minuten den halben Planeten. Wenn du auf ihrer Seite der Erde bist, bist du auf jedem Bild.',
      },
    },
    archives:
      'Dann durchsuchen wir die Bildarchive (Microsoft Planetary Computer, Element 84 und die NASA) und ordnen jedes Bild dem Überflug zu, bei dem es entstand. Jedes Bild, das du siehst, ist echt: ein Ausschnitt rund um deinen Ort.',
    photoFacts: {
      /** *farblich abgestimmt*, the time-lapse note's words for the same toning (§3.8) */
      touchUps: {
        term: 'Nachbearbeitung',
        text: 'Die Fotos von Sentinel-2 und Landsat werden für deinen Bildschirm farblich abgestimmt, geglättet und leicht geschärft, im ganzen Bild auf dieselbe Weise. Nichts wird hinzugefügt oder entfernt.',
      },
      /** "N arrow": the photo viewer's north arrow, labelled N in German too; "straight up" is the picture's top */
      whichWayUp: {
        term: 'Wo oben ist',
        text: 'Die Fotos von Sentinel-2 und Landsat behalten das eigene Kartengitter des Archivs für deinen Ort. Darum zeigt Norden nicht immer genau nach oben, sondern kann um ein paar Grad abweichen. Wenn du ein Foto öffnest, zeigt der N-Pfeil genau, wo Norden liegt.',
      },
    },
  },

  /** The next sentence after each verdict's definition (§3.6); *sie* in `could` is the definition's *Kamera* */
  verdictMore: {
    imaged: 'Was wir zeigen, ist das echte Bild.',
    likely: 'Das Bild ist noch nicht öffentlich, oder es wurde wegen Wolken verworfen.',
    could: 'Ob sie es wirklich getan hat, lässt sich von außen nicht sagen.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: 'Genaue Positionen',
      text: 'Öffentliche Bahndaten sind auf etwa einen Kilometer genau und werden jeden Tag ein wenig ungenauer. Zeiten können um ein paar Sekunden abweichen.',
    },
    /** Never a sentence opening on *Sie* (§1.4) */
    secret: {
      term: 'Geheime Satelliten',
      text: 'Einige der besten Kameras im Orbit gehören dem Militär. Hier tauchen sie nicht auf.',
    },
    clouds: {
      term: 'Wolken',
      text: 'Viele Fotos zeigen nur Wolken. Wenn das Archiv die Wolken markiert, prüfen wir das Pixel genau über deinem Ort und sagen es dazu.',
    },
    delays: { term: 'Verzögerungen', text: 'Bilder können ein, zwei Tage brauchen, bis sie erscheinen.' },
  },

  /**
   * Exactly the English, no more and no less (§3.7, §8). *beides ohne Cookies*: the tail covers the counting and the
   * measuring, never only the page's loading
   */
  privacy: {
    where: { term: 'Wo gerechnet wird', text: 'Die Bahnen berechnet dein Browser.' },
    kept: {
      term: 'Was wir speichern',
      text: 'Wir zählen Suchen nach Ort, auf etwa 10 km genau, nie nach deinem genauen Standort, und führen eine Strichliste darüber, was geöffnet und geteilt wird. Keine IP-Adressen, keine eigenen Cookies, nichts, was einen Besuch mit dem nächsten verbindet.',
    },
    others: {
      term: 'Wer es sonst noch sieht',
      text: 'Die meisten Ortsnamen stammen aus einer Liste, die in die Website eingebaut ist. Andere Suchen gehen an Open-Meteo, Photon oder Nominatim. Bilder laden direkt aus den Archiven. Unser Hosting-Anbieter zählt Seitenaufrufe und misst die Ladezeit, beides ohne Cookies. Er setzt unter Umständen ein Sicherheits-Cookie, um Menschen von Bots zu unterscheiden. Wir lesen es nie.',
    },
    links: {
      term: 'Links zum Teilen',
      text: 'Ein Link entsteht nur, wenn du etwas teilst. Wer den Link hat, sieht den Ortsnamen, eine auf etwa 1 km gerundete Position und den Überflug, den du gewählt hast.',
    },
  },

  /** Product, agency, licence and people's names as they are; agencies take their article (§5.2) */
  credits: {
    madeBy: { who: 'Gemacht von', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' auf X'] },
    support: { who: 'Unterstützen', text: [link('Hilf mit, dass Watched kostenlos bleibt :)')] as AboutPart[] },
    gibs: 'Bilder vom NASA-Dienst GIBS, einem Teil von EOSDIS. GOES über die NOAA und das CIRA, Himawari über die JMA.',
    archives: {
      who: 'Archive',
      text: 'Microsoft Planetary Computer und Element 84 Earth Search; der Landsat-Kanal mit 15 m pro Pixel aus dem Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Bahnen', text: 'Bahnelemente von CelesTrak. SGP4 von satellite.js.' },
    /** OpenStreetMap's German attribution */
    placeNames: { who: 'Ortsnamen', text: 'Photon von komoot. Kartendaten © OpenStreetMap-Mitwirkende (ODbL).' },
    textures: { who: 'Erdtexturen', text: 'Solar System Scope (CC BY 4.0), auf Basis von NASA Blue Marble und Black Marble.' },
    type: { who: 'Schriften', text: 'Instrument Sans und Serif von Instrument, Martian Mono von Evil Martians (SIL OFL).' },
  },

  /** Infinitives for actions (§1.1), in the words the app uses for them (*Bild vergrößern*, *Wiedergabe starten*) */
  keys: {
    search: 'Ort suchen',
    suggestions: 'Durch die Vorschläge gehen',
    choose: 'Auswählen',
    passes: 'Durch die Überflüge gehen',
    photos: 'Voriges / nächstes Bild',
    expand: 'Bild vergrößern',
    zoom: 'Zoomen (im vergrößerten Bild)',
    play: 'Wiedergabe starten oder anhalten',
    back: 'Zurück oder schließen',
    help: 'Diese Seite',
  },
  /** The common names of the keys (§3.7): some German keyboards print *Eingabe* on Enter */
  keyNames: { enter: 'Enter', space: 'Leertaste', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['Von ', link(handle)],
  footerNote: 'Aus öffentlichen Daten gemacht. Keines dieser Bilder haben wir selbst aufgenommen.',
}

export default about
