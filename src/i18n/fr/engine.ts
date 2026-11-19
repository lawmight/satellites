/**
 * French copy the report engine emits: the computing readout's progress lines and the report's footnotes about
 * degraded data (see src/i18n/en/engine.ts for where each shows; docs/i18n/fr.md is the authority on every word).
 *
 * Why it reads this way:
 *  - Progress rows are mono, one line of about 40 characters on a 390 px phone, cut with an ellipsis: nouns, no
 *    articles where French can spare them (*Propagation des orbites · 120 / 400*), written in sentence case and
 *    uppercased by CSS so the accents stay (*CONTRÔLE*, *SCÈNES*, fr.md §6.5). A count and its noun never part
 *    (U+00A0), and `many` (exact millions) takes *de* / *d’* (§5.3).
 *  - Footnotes say what failed and what it means for the numbers above. Real failures say *Impossible de…* (§1.1);
 *    the terse log lines keep their shape (*Archives Landsat injoignables*, then what may be missing). Verdicts are
 *    quoted in the results' words: a pass that *compte comme observé*, passes *affichés comme probablement observés*
 *    (§3.6).
 *  - NASA GIBS is named as About names it, *le service GIBS de la NASA*, so a sentence has a subject with a known gender;
 *    "VIIRS images the whole globe" is the verb *imager* (*VIIRS image la Terre entière*, §6.2).
 *  - U+202F before `;`, U+00A0 before `:`; one colon per sentence (§2.2, §6.1).
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('fr')

/** "16 912 objets", "1 passage", "1 000 000 de scènes": a grouped count and its noun, never parted */
const count = (n: number, one: string, other: string, many: string) => `${f.int(n)}\u00a0${f.plural(n, { one, many, other })}`
const passes = (n: number) => count(n, 'passage', 'passages', 'de passages')
const images = (n: number) => count(n, 'image', 'images', 'd’images')

/** "3 images de satellites météo sur 35"; `missing` can be 1: "1 image de satellite météo sur 35" (one satellite) */
const missingImages = (missing: number, total: number) =>
  `${count(missing, 'image de satellite météo', 'images de satellites météo', 'd’images de satellites météo')} sur ${f.int(total)}`

/** "ce passage est affiché comme probablement observé." / "ces passages sont affichés…": the Likely watched verdict */
const shownAsLikely = (missing: number) =>
  f.plural(missing, {
    one: 'ce passage est affiché comme probablement observé.',
    many: 'ces passages sont affichés comme probablement observés.',
    other: 'ces passages sont affichés comme probablement observés.',
  })

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Chargement du catalogue d’orbites',
    catalog: ({ objects }: { objects: number }) => `Catalogue · ${count(objects, 'objet', 'objets', 'd’objets')}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) =>
      `Propagation de ${count(orbits, 'orbite', 'orbites', 'd’orbites')} · ${count(days, 'jour', 'jours', 'de jours')}`,
    propagating: ({ done, total }: { done: number; total: number }) => `Propagation des orbites · ${f.int(done)} / ${f.int(total)}`,
    // 39 characters: *images* says what is looked for; the row's own label already says *archives*.
    searchingArchives: 'Recherche d’images Sentinel-2 + Landsat',
    // Phrase · counters, like the rows around it: *Association de 24 scènes à 1 234 passages* ran to 41. The row's own
    // labels say what is matched to what; a comma, because ' / ' reads "x of y" in the other rows.
    matching: ({ scenes, passes: p }: { scenes: number; passes: number }) =>
      `Association · ${count(scenes, 'scène', 'scènes', 'de scènes')}, ${passes(p)}`,
    verifyingWeatherStart: 'Contrôle des mosaïques météo de la NASA',
    // With its counter the start line would pass 40 characters: NASA goes, as in the results header's *Contrôle des
    // mosaïques météo*.
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `Contrôle des mosaïques météo · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes: p, images: k }: { passes: number; images: number }) => `${passes(p)} · ${images(k)}`,
  },

  note: {
    archiveSlow:
      'Les archives Sentinel-2 et Landsat ont mis trop de temps à répondre\u202f; les passages sont affichés d’après la seule géométrie orbitale.',
    archiveDown:
      'Impossible de joindre les archives Sentinel-2 et Landsat\u202f; les passages sont affichés d’après la seule géométrie orbitale.',
    sentinel2Thumbnails:
      'Scènes Sentinel-2 listées via Earth Search\u202f; certaines montrent une vignette de la scène entière, pas un recadrage.',
    sentinel2EarthSearch: 'Scènes Sentinel-2 listées via Earth Search (recherche du Planetary Computer indisponible).',
    sentinel2Down: 'Archives Sentinel-2 injoignables\u202f; des images Sentinel-2 peuvent manquer.',
    landsatDown: 'Archives Landsat injoignables\u202f; des images Landsat peuvent manquer.',
    openOcean: 'Cet endroit est hors du plan d’acquisition de Sentinel-2 (pleine mer).',
    elementsOld: ({ days }: { days: number }) =>
      `Les éléments orbitaux datent de ${count(days, 'jour', 'jours', 'de jours')}\u00a0: les heures de passage peuvent être décalées de quelques minutes.`,
    elementsNewer:
      'Ces passages sont reconstitués d’après des éléments orbitaux plus récents\u00a0: leurs heures peuvent être décalées de quelques minutes.',
    // Two sentences, one fact each; the colon carries English's "so" (fr.md §2.2). `n` counts down to 1, never 0.
    gibsUnconfirmed: ({ n }: { n: number }) =>
      f.plural(n, {
        one: 'Le service GIBS de la NASA a tardé à confirmer une image VIIRS. VIIRS image la Terre entière chaque jour\u00a0: ce passage compte comme observé.',
        many: `Le service GIBS de la NASA a tardé à confirmer ${images(n)} VIIRS. VIIRS image la Terre entière chaque jour\u00a0: ces passages comptent comme observés.`,
        other: `Le service GIBS de la NASA a tardé à confirmer ${images(n)} VIIRS. VIIRS image la Terre entière chaque jour\u00a0: ces passages comptent comme observés.`,
      }),
    gibsSlowAll: 'Le service GIBS de la NASA n’a pas répondu à temps\u00a0: les images des satellites météo ne sont pas affichées.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `Le service GIBS de la NASA n’a pas renvoyé à temps ${missingImages(missing, total)}\u202f; ${shownAsLikely(missing)}`,
    gibsDownAll: 'Impossible de joindre le service GIBS de la NASA\u00a0: les images des satellites météo ne sont pas affichées.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `Le service GIBS de la NASA n’a pas pu renvoyer ${missingImages(missing, total)}\u202f; ${shownAsLikely(missing)}`,
  },
}
export default engine
