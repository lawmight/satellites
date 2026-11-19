/**
 * Turkish copy for the HUD, the instrument chrome in the four corners (src/ui/hud; see docs/i18n/tr.md §3.10, §4,
 * §6.3, §6.8, §7).
 *
 * Why these forms: every corner line is a mono readout, uppercased by CSS under `lang="tr"` (*i* becomes *İ*), on one
 * nowrap line, and on a 375 px phone the top corners nearly touch: the About link is `Nasıl çalışır` (13 characters
 * against the English 14) and the sun line `Güneş` before the coordinates, which stay exactly as they arrive
 * (`GÜNEŞ 16.2°S 063.0°E`, international notation, §6.3). The replay's clock is `Tekrar`, never *Sahne*, which reads
 * "stage" (§9.1). The fetch line is `İndirildi`, because *Alındı* is the globe's word for a picture taken (§3.10).
 * Labels are sentence-case nouns without a verb (§1.1). The catalog's age is built by hand from the unit symbols *dk,
 * sa* (no full stop, never Intl's *sa.*), *gün* spelled out, then *önce*, which is a separate word and never harmonises
 * with the number (`<1 dk önce`, `42 dk önce`, `5 sa önce`, `3 gün önce`, §6.4, §6.8); stale puts `Eski, ` first. A
 * noun after a numeral stays singular (`16.893 nesne`, §5.3), grouped by fmt('tr'); zero has its own words, `Nesne
 * yok`, never *0 nesne* (§5.3). A number never parts from its unit (U+00A0). GMST, ISO stamps and the brand stay as
 * they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('tr')

/** The catalog's compact age before *önce*: "<1 dk", "42 dk", "5 sa", "3 gün" (the unit never takes a suffix). */
function ageTr(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1 dk'
  if (unit === 'minute') return `${f.int(n)} dk`
  if (unit === 'hour') return `${f.int(n)} sa`
  return `${f.int(n)} gün`
}

const hud: typeof en = {
  about: 'Nasıl çalışır',
  home: 'Watched, ana sayfa',
  regionTime: 'Zaman',
  regionCatalog: 'Yörünge kataloğu',
  regionSun: 'Güneş',

  scene: 'Tekrar',
  sun: (lat: string, lon: string) => `Güneş ${lat} ${lon}`,
  subsolar: 'Güneş altı noktası',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) =>
    n === 0 ? 'Nesne yok' : f.plural(n, { one: `${f.int(n)} nesne`, other: `${f.int(n)} nesne` }),
  objectsPending: (count: string): Rich => [num(count), ' Nesne'],
  catalog: 'Katalog',
  fetched: (stamp: string) => `İndirildi ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Eski, ' : ''}${ageTr(unit, n)} önce`,
  catalogUnavailable: 'Katalog yüklenemedi',
  catalogLoading: 'Katalog yükleniyor',
}
export default hud
