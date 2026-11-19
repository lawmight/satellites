/**
 * Polish copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the words drawn
 * into the MP4 (see docs/i18n/pl.md §3.8, §5.3, §5.5, §8).
 *
 * Why it is built this way:
 *  - The feature is «Rok po roku», native and indeclinable: the loanword «timelapse» would need cases the code cannot
 *    give. The place is inserted only where the nominative is grammatical: after a colon («Rok po roku: Warszawa») or as
 *    the subject of a verbless phrase («Warszawa rok po roku»).
 *  - Dates come from Intl at UTC (the frames' days arrive as UTC midnights): the short month for the readout and the
 *    lists («22 paź 2019», CLDR's undotted abbreviation), the genitive month for what a screen reader hears («22
 *    października 2019»). The video uppercases them itself («22 PAŹ 2019»). Years are never grouped.
 *  - A frame is a «klatka»; a clear look is a «bezchmurne ujęcie» (1 bezchmurne ujęcie · 2 bezchmurne ujęcia · 12
 *    bezchmurnych ujęć · 1,5 bezchmurnego ujęcia), and «jedno» agrees with it («jedno na rok»).
 *  - The single-season loop (war zones, glaciers) names its season as a whole phrase chosen here («jedno z każdej
 *    jesieni»), «pora roku», never «sezon», and says nothing more about why: the season line stays a season (§8).
 *  - The waiting steps are imperfective verbal nouns («Przeglądanie archiwum», «Wywoływanie klatek»: the darkroom word
 *    for "developing").
 */
import type en from '../en/timelapse'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'
import type { SeasonName } from '@/imagery/seasonRegions'

const f = fmt('pl')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** A whole count, or a fraction kept (its plural form is `other`) */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))

/** «22 paź» */
const dayMonth = (ms: number) => formatDate('pl', ms, 'UTC', { day: 'numeric', month: 'short' })
/** «22 paź 2019» */
const day = (ms: number) => formatDate('pl', ms, 'UTC', { day: 'numeric', month: 'short', year: 'numeric' })
/** «22 października 2019» (spoken) */
const daySpoken = (ms: number) => formatDate('pl', ms, 'UTC', { day: 'numeric', month: 'long', year: 'numeric' })
/** «1 bezchmurne ujęcie», «2 bezchmurne ujęcia», «12 bezchmurnych ujęć», «1,5 bezchmurnego ujęcia» */
const looks = (n: number) =>
  `${count(n)}\u00a0${f.plural(n, { one: 'bezchmurne ujęcie', few: 'bezchmurne ujęcia', many: 'bezchmurnych ujęć', other: 'bezchmurnego ujęcia' })}`
/** «jedno» is the clear look (neuter); each season in the genitive after «z każdej / każdego» */
const EACH: Record<SeasonName, string> = {
  winter: 'jedno z\u00a0każdej zimy',
  spring: 'jedno z\u00a0każdej wiosny',
  summer: 'jedno z\u00a0każdego lata',
  autumn: 'jedno z\u00a0każdej jesieni',
}
/** «Każda klatka to ten sam kwadrat o boku 10 km…» */
const square = (km: number) =>
  `Każda klatka to ten sam kwadrat o\u00a0boku ${f.int(km)}\u00a0km z\u00a0satelity Sentinel-2, z\u00a0taką samą obróbką barw jak każde zdjęcie tutaj.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `Rok po roku: ${place}`,
  title: 'Rok po roku',
  close: 'Zamknij',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Odtwórz',
  pause: 'Wstrzymaj',
  slider: 'Klatka',
  frameList: 'Klatki',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Klatka ${f.int(index)} z ${f.int(total)}: ${daySpoken(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (n: number) => `${looks(n)} · jedno na rok`,
  captionSeason: (n: number, season: SeasonName) => `${looks(n)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Jedno bezchmurne ujęcie na rok · od\u00a0${since}`,
  captionShort: 'Za mało bezchmurnych ujęć',
  captionError: 'Archiwum nie odpowiedziało',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  // «szukamy»: the loop aims for the next season and falls back to any clear date, so «inna pora roku» would overclaim.
  note: (km: number) => `${square(km)} Co roku szukamy innej pory roku; rok bez bezchmurnego ujęcia pomijamy.`,
  noteOneSeason: (km: number) =>
    `${square(km)} Każdy rok pokazuje tę samą porę roku; rok bez bezchmurnego ujęcia w\u00a0tej porze pomijamy.`,
  source: 'Copernicus Sentinel-2, via Planetary Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'Przeglądanie archiwum',
  choosing: 'Wybór bezchmurnych ujęć',
  developing: 'Wywoływanie klatek',
  choosingProgress: (done: number, total: number) => `Wybór bezchmurnych ujęć, ${f.int(done)} z ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `Wywoływanie klatek, ${f.int(done)} z ${f.int(total)}`,
  tooCloudy: 'Za dużo tu chmur.',
  tooFew: (n: number, since: number, needed: number) =>
    `${n <= 0 ? 'Brak bezchmurnych ujęć' : looks(n)} od\u00a0${since} · potrzeba ${f.int(needed)}`,
  noAnswer: 'Archiwum nie odpowiedziało.',
  unreachable: 'Nie udało się połączyć z\u00a0Planetary Computer',
  retry: 'Ponów',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Udostępnij',
  linkCopied: 'Skopiowano link',
  // The nominative and an adverbial phrase: grammatical for any name.
  shareTitle: (place: string) => `${place} rok po roku`,
  video: 'Wideo',
  // «Tworzenie 42%» is as wide as «Rendering 42%» in the fixed 132 px button; «Renderowanie 42%» is not (§3.8).
  rendering: (pct: number) => `Tworzenie ${pad2(pct)}%`,
  videoFailed: 'Błąd wideo',
  saveVideo: 'Zapisz wideo',
  // Browser names behind their classifier «przeglądarki», never declined («w Firefoksie» ✗).
  noH264: 'Ta przeglądarka nie ma kodera H.264: plik odtworzą przeglądarki Chrome i\u00a0Firefox',
  // Lowercase ASCII a–z only: the file name's stand-in for a place with no Latin name.
  fileNamePlace: 'miejsce',
}
export default timelapse
