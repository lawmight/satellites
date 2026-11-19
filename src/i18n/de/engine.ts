/**
 * German copy the report engine emits (see src/i18n/en/engine.ts for where each line shows and its params;
 * docs/i18n/de.md §2.5 and §3.9 are the authority on every line here).
 *
 * Why it reads this way:
 *  - The computing readout is an instrument log, the one place where noun style is correct German (§2.5):
 *    *Bahnberechnung · 412 Bahnen · 7 Tage*, *Abgleich · 31 Szenen mit 412 Überflügen*. It is written in sentence
 *    case (CSS sets the capitals, and turns ß into SS) and fits one line of about 40 characters on a 390 px phone; the
 *    longest row is *Abgleich · 31 Szenen mit 412 Überflügen* (39). A count of nothing says *keine*, never *0 Szenen*
 *    (§5.3).
 *  - The footnotes say what failed and what that means, impersonally, in Perfekt for what just happened (*haben zu
 *    langsam geantwortet*), with *daher* or a semicolon instead of a comma splice. They quote the verdict words exactly:
 *    *zählt als beobachtet*, *werden als vermutlich beobachtet gezeigt* (§3.6).
 *  - Compounds with a name that holds a digit or an acronym are hyphenated throughout, the shared tail with an
 *    Ergänzungsstrich: *Sentinel-2-Archiv*, *VIIRS-Bilder*, *Sentinel-2- und Landsat-Archive* (§6.1).
 *  - Numbers come from fmt('de') (*16.893*); a number and *Tage* never part (U+00A0).
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('de')

/** "7 Tage", "1 Tag" */
const days = (n: number) => f.plural(n, { one: `${f.int(n)} Tag`, other: `${f.int(n)} Tage` })
/** "1 Bild" / "31 Bilder" / "keine Bilder" */
const images = (n: number) => (n <= 0 ? 'keine Bilder' : f.plural(n, { one: `${f.int(n)} Bild`, other: `${f.int(n)} Bilder` }))
/** "1 Überflug" / "412 Überflüge" / "Keine Überflüge" (it opens its line) */
const passes = (n: number) => (n <= 0 ? 'Keine Überflüge' : f.plural(n, { one: `${f.int(n)} Überflug`, other: `${f.int(n)} Überflüge` }))
/** After *mit*, dative: "1 Überflug" / "412 Überflügen" */
const passesDative = (n: number) => f.plural(n, { one: `${f.int(n)} Überflug`, other: `${f.int(n)} Überflügen` })
/** The images NASA GIBS did not deliver: "3 von 35 Bildern", "1 von 1 Bild" (partitive *von*, dative) */
const ofImages = (missing: number, total: number) =>
  `${f.int(missing)} von ${f.int(total)} ${f.plural(total, { one: 'Bild', other: 'Bildern' })} von Wettersatelliten`
/** What happens to the passes of those images: one or many */
const shownAsLikely = (missing: number) =>
  f.plural(missing, {
    one: 'dieser Überflug wird als vermutlich beobachtet gezeigt.',
    other: 'diese Überflüge werden als vermutlich beobachtet gezeigt.',
  })

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Bahnkatalog wird geladen',
    // A count of nothing says *keine*, as the HUD's *Keine Objekte* and the matching row do (§5.3).
    catalog: ({ objects }: { objects: number }) =>
      `Katalog · ${objects <= 0 ? 'keine Objekte' : f.plural(objects, { one: `${f.int(objects)} Objekt`, other: `${f.int(objects)} Objekte` })}`,
    propagateStart: ({ orbits, days: d }: { orbits: number; days: number }) =>
      `Bahnberechnung · ${orbits <= 0 ? 'keine Bahnen' : f.plural(orbits, { one: `${f.int(orbits)} Bahn`, other: `${f.int(orbits)} Bahnen` })} · ${days(d)}`,
    propagating: ({ done, total }: { done: number; total: number }) => `Bahnberechnung · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'Archivsuche · Sentinel-2 + Landsat',
    matching: ({ scenes, passes: p }: { scenes: number; passes: number }) =>
      `Abgleich · ${scenes <= 0 ? 'keine Szenen' : f.plural(scenes, { one: `${f.int(scenes)} Szene`, other: `${f.int(scenes)} Szenen` })} mit ${
        p <= 0 ? 'keinen Überflügen' : passesDative(p)
      }`,
    verifyingWeatherStart: 'NASA-Wettermosaike werden geprüft',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `NASA-Wettermosaike geprüft · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes: p, images: i }: { passes: number; images: number }) => `${passes(p)} · ${images(i)}`,
  },

  note: {
    archiveSlow: 'Die Sentinel-2- und Landsat-Archive haben zu langsam geantwortet; die Überflüge stammen nur aus der Bahngeometrie.',
    archiveDown: 'Die Sentinel-2- und Landsat-Archive waren nicht erreichbar; die Überflüge stammen nur aus der Bahngeometrie.',
    sentinel2Thumbnails:
      'Sentinel-2 über Earth Search gelistet; manche Szenen zeigen ein Vorschaubild der ganzen Szene statt eines Ausschnitts.',
    sentinel2EarthSearch: 'Sentinel-2 über Earth Search gelistet (Suche von Planetary Computer nicht verfügbar).',
    sentinel2Down: 'Sentinel-2-Archiv nicht erreichbar; Sentinel-2-Bilder können fehlen.',
    landsatDown: 'Landsat-Archiv nicht erreichbar; Landsat-Bilder können fehlen.',
    openOcean: 'Dieser Ort liegt außerhalb des Aufnahmeplans von Sentinel-2 (offenes Meer).',
    elementsOld: ({ days: d }: { days: number }) =>
      `Die Bahnelemente sind ${days(d)} alt, daher können die Überflugzeiten um einige Minuten abweichen.`,
    elementsNewer: 'Diese Überflüge sind aus neueren Bahnelementen rekonstruiert, daher können ihre Zeiten um einige Minuten abweichen.',
    // `n` counts down to 1 as late confirmations arrive; *ein* is the word for one, as the English says "one". While the
    // note shows, the images are still unconfirmed (counted by rule), so *nicht rechtzeitig bestätigt*, never *zu spät
    // bestätigt*, which says the confirmation came.
    gibsUnconfirmed: ({ n }: { n: number }) =>
      f.plural(n, {
        one: 'NASA GIBS hat ein VIIRS-Bild nicht rechtzeitig bestätigt; VIIRS nimmt jeden Tag die ganze Erde auf, also zählt dieser Überflug als beobachtet.',
        other: `NASA GIBS hat ${f.int(n)} VIIRS-Bilder nicht rechtzeitig bestätigt; VIIRS nimmt jeden Tag die ganze Erde auf, also zählen diese Überflüge als beobachtet.`,
      }),
    gibsSlowAll: 'NASA GIBS hat nicht rechtzeitig geantwortet, darum werden keine Bilder von Wettersatelliten gezeigt.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS hat ${ofImages(missing, total)} nicht rechtzeitig geliefert; ${shownAsLikely(missing)}`,
    gibsDownAll: 'NASA GIBS war nicht erreichbar, darum werden keine Bilder von Wettersatelliten gezeigt.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS konnte ${ofImages(missing, total)} nicht liefern; ${shownAsLikely(missing)}`,
  },
}

export default engine
