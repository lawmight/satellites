/**
 * Indonesian copy for the HUD's corner lines (see docs/i18n/id.md §3.8, §7). Mono, uppercased by CSS, one nowrap line
 * each, so everything is stored in sentence case. The About link is *Cara kerja* (not *Cara kerjanya*): on a 375 px
 * phone it shares the top edge with the sun's line, and the longer form would make the two corners touch.
 *
 * The catalog's age uses the sanctioned mono abbreviations *mnt*, *jam*, *hari* (§5.5, §6), never an `h` (which an
 * Indonesian reads as *hari*) and never Intl's short relative style (it prints "3 h lalu" for days). One noun form for
 * every count (§5.3).
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('id')

/** "<1 mnt", "42 mnt", "5 jam", "3 hari" (uppercased by CSS: "<1 MNT", "5 JAM", "3 HARI"). */
function ageId(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1 mnt'
  if (unit === 'minute') return `${f.int(n)} mnt`
  if (unit === 'hour') return `${f.int(n)} jam`
  return `${f.int(n)} hari`
}

const hud: typeof en = {
  about: 'Cara kerja',
  sourceLink: 'Sumber terbuka',
  sourceLinkLabel: 'Sumber terbuka: kodenya di GitHub',
  home: 'Watched, beranda',
  regionTime: 'Waktu',
  regionCatalog: 'Katalog orbit',
  regionSun: 'Matahari',

  /** The replay's clock: "SAAT ITU MIN, 1 NOV 11:21:13 WIB" (§3.8) */
  scene: 'Saat itu',
  /** "MATAHARI 16.2°S 063.0°E": the coordinates stay international notation (§6) */
  sun: (lat: string, lon: string) => `Matahari ${lat} ${lon}`,
  subsolar: 'Titik subsolar',
  gmst: (time: string) => `GMST ${time}`,

  /** "16.893 OBJEK · CELESTRAK GP" */
  objects: (n: number) => f.plural(n, { other: `${f.int(n)} objek` }),
  objectsPending: (count: string): Rich => [num(count), ' objek'],
  catalog: 'Katalog',
  fetched: (stamp: string) => `Diambil ${stamp}`,
  /** "Diambil 2026-11-08 03:34Z · 4 jam lalu"; stale: "Usang, 3 hari lalu" */
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Usang, ' : ''}${ageId(unit, n)} lalu`,
  catalogUnavailable: 'Katalog tidak tersedia',
  catalogLoading: 'Memuat katalog',
}
export default hud
