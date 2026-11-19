/**
 * Turkish copy for the share card and the share page (see docs/i18n/tr.md §3.1, §3.2, §3.3, §3.5, §3.6, §4, §5, §6):
 * every word the card prints and every word the server writes around it. Pure TypeScript, no DOM, Node or src/
 * imports: the server reads it through cardMessages('tr'), and the app's tr bundle lists this very module.
 *
 * Why it is built this way:
 *  - Turkish case endings follow how a name is pronounced (`Waterloo’yu`, `Bordeaux’yu`), which code cannot know, so
 *    no inserted name, number, date or clock ever takes a suffix (§5). The place is the bare subject of a passive and
 *    leads the headline in the serif (`*Waterloo,* 7 uydu tarafından izlendi.`); the satellite stands before the
 *    invariant `tarafından`, or is the subject when the place sits before `üzerinden` or as the subject of a second
 *    clause (`WorldView Legion 4 geçerken *Waterloo* görüş alanındaydı.`). A comma follows a name when a number or
 *    another name comes next, never after a place cut short (`…,` reads as a typo).
 *  - A noun after a number stays singular, and so does the verb (`1 uydu`, `256 uydu tarafından izlendi`), so the two
 *    plural forms are the same words; zero is its own sentence (`hiçbir uydu tarafından izlenmedi`, never `0 uydu`).
 *  - After a sentence whose subject is the place, the satellite is named again (`Uydu …`, `uydunun …`), and a cloud
 *    sentence names the picture (`Görüntüde yalnızca bulut var.`): a bare `gördü` would say the place saw it (§5.2).
 *  - A nameless satellite is written as each sentence needs it: `Bir uydu` opening a sentence, `bir uydu` inside one,
 *    with no comma after it; `aSatellite` is only for the chips and the plan callout.
 *  - Dates come from Intl's parts at the place's zone in the Turkish order (`1 Kas 2026 Paz`, `3 Kas`); the share
 *    page's description opens with a dateline (`1 Kas 2026 Paz, 11:21 EST.`), so the clock never needs `’te`. The
 *    week's stamp is Intl's range (`26 Eki – 1 Kas 2026`, `1–7 Kas 2026`), its start six calendar days before the end
 *    at the place: a card opened a month later still names its own week (§3.5). Not the app's house arrow: the card's
 *    fonts have no →, and a fallback face for one glyph would be fetched for every card.
 *  - Mono labels are sentence case; each renderer uppercases them with Turkish rules (`İRTİFA`, `MOZAİK PİKSELİ`).
 *    Percentages put the sign first (`%25`), decimals take a comma (`7,46`), as fmt('tr') writes them.
 */
import { fmt } from '../format.js'
import { dateFormat } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('tr')

// ── Days at the place, from Intl's parts ────────────────────────────────────────────────────────────────────────────

const SHORT_DAY: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
const NUMERIC_DAY: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'numeric', year: 'numeric' }
const RANGE_DAY: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }

/** Intl's fields for a day at a zone, without the trailing full stop some ICU versions put after a short month */
function dayParts(ms: number, timeZone: string) {
  const parts = dateFormat('tr', timeZone, SHORT_DAY).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => (parts.find((p) => p.type === t)?.value ?? '').replace(/\.$/, '')
  return { weekday: get('weekday'), day: get('day'), month: get('month'), year: get('year') }
}
/** "1 Kas 2026 Paz": day, month, year, weekday (the card is the one place a short date carries the year) */
const dayYear = (ms: number, timeZone: string) => {
  const d = dayParts(ms, timeZone)
  return `${d.day} ${d.month} ${d.year} ${d.weekday}`
}
/** "3 Kas" */
const dayMonth = (ms: number, timeZone: string) => {
  const d = dayParts(ms, timeZone)
  return `${d.day} ${d.month}`
}
/**
 * "26 Eki – 1 Kas 2026", "1–7 Kas 2026", "29 Ara 2026 – 4 Oca 2027": the seven days ending on the place's day. The
 * end's calendar day is read at the place and both ends are formatted at UTC, with Intl's own range separator (an en
 * dash, which the card's fonts draw).
 */
function weekRange(ms: number, timeZone: string): string {
  const fields = dateFormat('tr', timeZone, NUMERIC_DAY).formatToParts(ms)
  const n = (t: Intl.DateTimeFormatPartTypes) => Number(fields.find((p) => p.type === t)?.value)
  const [y, m, d] = [n('year'), n('month'), n('day')]
  const end = Date.UTC(y, m - 1, d)
  if (!Number.isFinite(end)) return 'Son 7 gün'
  const parts = dateFormat('tr', 'UTC', RANGE_DAY).formatRangeToParts(Date.UTC(y, m - 1, d - 6), end)
  return parts.map((p) => (p.type === 'month' ? p.value.replace(/\.$/, '') : p.value)).join('')
}

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/**
 * "7 uydu tarafından izlendi." / "takip ettiğimiz hiçbir uydu tarafından izlenmedi." (the results headline's N). The
 * count is held to its noun by a no-break space, as the results headline holds it (§6.7), so the display line breaks
 * before *tarafından*, never between *7* and *uydu*.
 */
const watched = (n: number) =>
  n > 0 ? `${f.int(n)}\u00a0uydu tarafından izlendi.` : 'takip ettiğimiz hiçbir uydu tarafından izlenmedi.'
/** The serif block: the place, and the comma a following number or name needs, unless the place was cut short */
const head = (place: string, cut: boolean, comma = true) => accent(place, ...(comma && !cut ? [','] : []))

/** A nameless satellite opening a sentence or a block, with no comma after it */
const Sat = (s: SatName) => s ?? 'Bir uydu'
/** …inside a sentence ("… bir uydu tarafından izlendi.", "… bir uydu çekti.") */
const sat = (s: SatName) => s ?? 'bir uydu'
/** A satellite as the subject before another name: its name and a comma, or `Bir uydu` alone */
const satSubject = (s: SatName) => (s !== undefined ? `${s},` : 'Bir uydu')

/** Where a satellite was heading, 0 north … 7 northwest, in the dative `doğru` takes: `güneye doğru` (§4) */
const TOWARD = ['kuzeye', 'kuzeydoğuya', 'doğuya', 'güneydoğuya', 'güneye', 'güneybatıya', 'batıya', 'kuzeybatıya']
const toward = (heading?: number) => (heading !== undefined ? TOWARD[heading] : undefined)
/** "1 Kas 2026 Paz, 11:21 EST. ": the description's dateline, its own sentence (§5.5) */
const dateline = (w?: CardWhen) => (w ? `${dayYear(w.ms, w.timeZone)}, ${w.clock} ${w.zone}. ` : '')

const tr: CardMessages = {
  // ── The headline: the place first in the serif, then the condensed lead ───────────────────────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [head(place, cut, satellites > 0), watched(satellites)],
  headlineBy: {
    imaged: (s: SatName, place: string, cut: boolean): Rich => [head(place, cut), `${sat(s)} tarafından izlendi.`],
    likely: (s: SatName, place: string, cut: boolean): Rich => [head(place, cut), `${sat(s)} tarafından tarandı.`],
    // The place is the subject of the second clause: three blocks, so a cut place needs no change.
    could: (s: SatName, place: string, _cut: boolean): Rich => [`${Sat(s)} geçerken`, accent(place), 'görüş alanındaydı.'],
    overhead: (s: SatName, place: string, _cut: boolean): Rich => [satSubject(s), accent(place), 'üzerinden geçti.'],
  },
  // `bu hafta` sits on the place's line; a cut place drops it, as English drops its tail.
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [
    accent(place, ...(cut ? [] : [' bu hafta'])),
    watched(satellites),
  ],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  // `En az` right before the number, so it can fade out and the sentence reads without it (§3.3); *En az*, the number
  // and its noun never part (no-break spaces, §6.7), as on the results panel's second line.
  photos: (count: number, atLeast: boolean) =>
    count <= 0
      ? 'Hiçbir görüntü kamuya açılmadı.'
      : `${atLeast ? 'En\u00a0az\u00a0' : ''}${f.int(count)}\u00a0görüntü kamuya açıldı.`,
  archiveDown: 'Görüntü arşivleri yanıt vermedi; kamuya açık görüntüleri şu an sayamıyoruz.',
  archiveDownShort: 'Görüntü arşivleri yanıt vermedi.',
  cloud: {
    only: {
      // One line in the 466 px panel at 24 px (~407 px; `Görüntüde yalnızca bulut var` made it ~529 px and two lines).
      // An existential sentence: no bare `gördü`, no possessive that could attach to the place.
      sub: (_pct: number) => 'Tamamen bulutlu. Yalnızca bulut var.',
      chip: (pct: number) => `Tamamen bulutlu · %${f.int(pct)}`,
      post: (_pct: number) => 'Görüntüde yalnızca bulut var.',
      desc: (pct: number) => `Görüntüde yalnızca bulut var (%${f.int(pct)}).`,
    },
    mostly: {
      sub: (pct: number) => `Çoğunlukla bulut: sahnede %${f.int(pct)}.`,
      chip: (pct: number) => `Çoğunlukla bulut · %${f.int(pct)}`,
      post: (pct: number) => `Görüntünün çoğu bulut (%${f.int(pct)}).`,
      desc: (pct: number) => `Görüntünün çoğu bulut (%${f.int(pct)}).`,
    },
    spot: {
      sub: 'Noktanın üzeri bulutlu.',
      chip: 'Noktada bulut',
      post: 'Noktanın üzeri bulutluydu.',
      desc: 'Noktanın üzeri bulutluydu.',
    },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock} ${zone}`,
  // Never `Son 7 gün · …`: on a card opened a month later it would read "the last 7 days from now".
  weekTo: (ms: number, timeZone: string) => weekRange(ms, timeZone),
  lastWeek: 'Son 7 gün',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: 'İrtifa',
    elevation: 'Ufuktan açı',
    speed: 'Hız',
    offNadir: 'Bakış açısı',
    pixel: 'Piksel',
    mosaicPixel: 'Mozaik pikseli',
    closest: 'En yakın',
  },
  // The verdicts' lane names (§3.6): `Görüntü`, not `Fotoğraf`, because the lane holds radar images and mosaics too.
  lane: { imaged: 'Görüntü', likely: 'Muhtemel', could: 'Menzilde', overhead: 'Tepeden' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/sn' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`),
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${f.int(km * 1000)} m`),
  // About the English's length (24): the chip shares the drawing's top edge with the scale bar, and «Geçiş geometrisi ·
  // kuzey yukarıda» (33) ended 6 px from it on the share sheet's preview.
  geometry: 'Geometri · kuzey yukarıda',
  note: {
    imageInApp: 'Görüntü sitede açılır',
    imageUnavailable: 'Görüntü şu an alınamıyor',
    commercial: 'Ticari arşiv, kamuya kapalı',
    inSwath: 'Şeritte, henüz kamuya açık görüntü yok',
    groundTrack: 'En yakın anda yer izi',
  },
  acquiring: 'Alınıyor…',
  noPublicPhoto: 'Bu hafta kamuya açık görüntü yok',
  noPhoto: 'Gösterilecek görüntü yok',
  look: {
    // The most detailed clear photo, not the nearest pass: never `En yakın` here.
    closest: 'En net görüntü',
    lastClear: 'Son bulutsuz görüntü',
    clouded: 'Tamamen bulutlu',
    radar: 'Radar',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  aSatellite: 'Bir uydu',
  // QA at 466 px beside WWW.WATCHED.EARTH; the tested fallback is `Seni ne izledi, gör`.
  invite: 'Seni neyin izlediğini gör',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────

  // Unmarked order (time, subject, object, verb): the accent `seni` sits in the focus slot before the verb (§3.1).
  hero: [['Bu hafta'], ['bir şey'], [accent('seni'), ' izledi.']] as Rich[],
  enterAnyPlace: 'Yeryüzünde bir yer seç',
  defaultPlace: 'Palm Jumeirah',
  defaultAlt:
    'Dubai’deki Palm Jumeirah’nın gerçek bir Sentinel-2 uydu fotoğrafı; yanında şu satır: Bu hafta bir şey seni izledi. Yeryüzünde bir yer seç.',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: 'Bu hafta bir şey seni izledi.',
    description:
      'Yeryüzünde herhangi bir yer seç. Son 7 günde üzerinden geçen bütün uyduları ve çektikleri gerçek görüntüleri gör.',
    placeTitle: (place: string) => `${place} bu hafta neler tarafından izlendi`,
    placeDescription: (place: string) =>
      `Son 7 günde ${place} üzerinden geçen bütün uydular ve çektikleri gerçek görüntüler. Bu hafta seni ne izledi?`,
    // The brand stays a bare subject (§6.1).
    opening: [accent('Watched'), ' açılıyor'] as Rich,
  },
  // One verb for all three verdicts (`geçti`); every missing part drops cleanly: no dateline, no altitude, no heading.
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) => {
    const alt = o.altitudeKm !== undefined ? ` ${f.int(o.altitudeKm)} km irtifadan` : ''
    const d = toward(o.heading)
    return `${dateline(o.when)}${satSubject(o.sat)} ${o.place} üzerinden${alt} geçti${d ? `; ${d} doğru ilerliyordu` : ''}.`
  },
  // The heading folds into the satellite's clause (`kuzeye doğru geçerken`), as English's "moving north" does, so
  // `couldHave`'s `Uydu` is the one re-mention after the place-subject sentence (two `Uydu` openings read mechanical).
  withinView: (o: PassFacts) => {
    const d = toward(o.heading)
    return `${dateline(o.when)}${Sat(o.sat)}${d ? ` ${d} doğru` : ''} geçerken ${o.place} görüş alanındaydı.`
  },
  couldHave: 'Uydu kamerasını buraya çevirmiş olabilir; operatörü çevirip çevirmediğini söylemiyor.',
  straightDown: 'Tam aşağıya bakıyordu.',
  // `Dikeyden … eğik`: measured from straight down; never `nadir` or `eğim` (§4).
  offNadir: (deg: number) => `Dikeyden ${f.dec(deg, 1)}° eğik bakıyordu.`,
  cloudCover: (pct: number) => `Bulut örtüsü: %${f.int(pct)}.`,
  inSwath: (place: string) => `${place}, uydunun tarama şeridi içindeydi.`,
  // Subject–verb sentences, the satellite (or `bir uydu`) before the verb, so it takes no suffix.
  bestFrom: {
    closest: (s: SatName) => `En net görüntüyü ${sat(s)} çekti.`,
    lastClear: (s: SatName) => `Son bulutsuz görüntüyü ${sat(s)} çekti.`,
    first: (s: SatName) => `İlk görüntüyü ${sat(s)} çekti.`,
  },
  question: 'Bu hafta seni ne izledi?',
  cardAlt: {
    withPhoto: (s: SatName) => `Paylaşım kartı. Haftanın en net görüntüsünü ${sat(s)} çekti.`,
    plain: 'Paylaşım kartı.',
  },
}

export default tr
