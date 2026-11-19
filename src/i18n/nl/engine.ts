/**
 * Dutch copy the report engine emits (see docs/i18n/nl.md §3.7 "Computing readout and footnotes", §5): the computing
 * readout's progress rows and the report's footnotes about missing or less exact data.
 *
 * Why these forms:
 *  - Progress rows are one mono line of about 40 characters beside the row's number on a 390 px phone, so each is a
 *    noun phrase or an infinitive with its counter after ` · `, written in sentence case and uppercased by CSS. The
 *    longest, `NASA-weermozaïeken controleren · 12 / 35`, is exactly as long as the English.
 *  - `doorrekenen`, never the jargon `propageren`; a scene is an `opname`, a pass an `overvlucht` (§4.1). Counts take
 *    nl's two plural forms, and `keer` and `uur` never change after a number.
 *  - Footnotes say what failed and what that means for the numbers, in plain sentences. Where the English quotes a
 *    verdict, Dutch uses the verdict's participle phrase in lowercase, unquoted: `telt als bekeken`,
 *    `worden getoond als waarschijnlijk bekeken` (§5), with the verb agreeing with the count.
 *  - "VIIRS images the whole globe" is a verb (it takes pictures), so Dutch says `brengt … in beeld`. Names (NASA GIBS,
 *    VIIRS, Sentinel-2, Landsat, Earth Search, Planetary Computer) stay as they are; `VIIRS-beeld` is a sensor
 *    compound, which §5 allows, never a satellite name compounded with a noun.
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('nl')
/** "16.893 objecten", "1 overvlucht", "3 dagen": a grouped count and its noun, never parted */
const count = (n: number, one: string, other: string) => `${f.int(n)} ${f.plural(n, { one, other })}`
/** "die overvlucht wordt" / "die overvluchten worden": the verb agrees with how many passes the note is about */
const shownAsLikely = (n: number) =>
  f.plural(n, {
    one: 'die overvlucht wordt getoond als waarschijnlijk bekeken.',
    other: 'die overvluchten worden getoond als waarschijnlijk bekeken.',
  })

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Baancatalogus laden',
    catalog: ({ objects }: { objects: number }) => `Catalogus · ${count(objects, 'object', 'objecten')}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) =>
      `${count(orbits, 'baan', 'banen')} doorrekenen · ${count(days, 'dag', 'dagen')}`,
    propagating: ({ done, total }: { done: number; total: number }) => `Banen doorrekenen · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'Sentinel-2 + Landsat doorzoeken',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) =>
      `${count(scenes, 'opname', 'opnamen')} koppelen · ${count(passes, 'overvlucht', 'overvluchten')}`,
    verifyingWeatherStart: 'NASA-weermozaïeken controleren',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `NASA-weermozaïeken controleren · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) =>
      `${count(passes, 'overvlucht', 'overvluchten')} · ${count(images, 'beeld', 'beelden')}`,
  },

  note: {
    archiveSlow:
      'De archieven van Sentinel-2 en Landsat reageerden te traag; de overvluchten zijn alleen uit de baangeometrie berekend.',
    archiveDown:
      'De archieven van Sentinel-2 en Landsat waren niet bereikbaar; de overvluchten zijn alleen uit de baangeometrie berekend.',
    sentinel2Thumbnails:
      'Sentinel-2 opgehaald via Earth Search; sommige opnamen tonen een miniatuur van de hele opname, geen uitsnede.',
    sentinel2EarthSearch: 'Sentinel-2 opgehaald via Earth Search (zoeken in Planetary Computer niet beschikbaar).',
    sentinel2Down: 'Archief van Sentinel-2 onbereikbaar; beelden van Sentinel-2 kunnen ontbreken.',
    landsatDown: 'Archief van Landsat onbereikbaar; beelden van Landsat kunnen ontbreken.',
    openOcean: 'Deze plek valt buiten het opnameplan van Sentinel-2 (open zee).',
    elementsOld: ({ days }: { days: number }) =>
      `De baanelementen zijn ${count(days, 'dag', 'dagen')} oud, dus de tijden van de overvluchten kunnen een paar minuten afwijken.`,
    elementsNewer:
      'Deze overvluchten zijn gereconstrueerd uit nieuwere baanelementen, dus hun tijden kunnen een paar minuten afwijken.',
    gibsUnconfirmed: ({ n }: { n: number }) =>
      f.plural(n, {
        one: 'NASA GIBS bevestigde één VIIRS-beeld niet op tijd; VIIRS brengt elke dag de hele aarde in beeld, dus die overvlucht telt als bekeken.',
        other: `NASA GIBS bevestigde ${f.int(n)} VIIRS-beelden niet op tijd; VIIRS brengt elke dag de hele aarde in beeld, dus die overvluchten tellen als bekeken.`,
      }),
    gibsSlowAll: 'NASA GIBS reageerde niet op tijd, dus beelden van weersatellieten worden niet getoond.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS leverde ${f.int(missing)} van de ${f.int(total)} beelden van weersatellieten niet op tijd; ${shownAsLikely(missing)}`,
    gibsDownAll: 'NASA GIBS was niet bereikbaar, dus beelden van weersatellieten worden niet getoond.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS kon ${f.int(missing)} van de ${f.int(total)} beelden van weersatellieten niet leveren; ${shownAsLikely(missing)}`,
  },
}
export default engine
