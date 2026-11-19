/**
 * Indonesian verdict vocabulary: the ONE set of words for a pass's verdict (see src/i18n/en/verdicts.ts; docs/i18n/id.md
 * §3.7 is the authority).
 *
 * Why these words: the ladder must read image > covered > maybe > passed in titles and lanes alike. *Diawasi* keeps the
 * product's one verb ("watched", *mengawasi*) identical everywhere; *Kemungkinan besar* sits clearly above the could
 * verdict's *mungkin*, so the two never share a root in the lanes (`TERCAKUP` against `MUNGKIN`). The imaged lane is
 * `CITRA`, never `FOTO`: it holds radar images, mosaics and geostationary frames, not only photographs. Lanes are 8
 * characters or fewer (the Timeline's lane column, measured in §3.7). Every verdict counts passes, and Indonesian has
 * one noun form for any count: *1 lintasan*, *31 lintasan*, never reduplicated. Titles and lanes are sentence case;
 * mono labels uppercase them with CSS.
 */
import type en from '../en/verdicts'

/** "1 lintasan", "31 lintasan": the same form for every count (id.md §5.3) */
const passes = (_n: number) => 'lintasan'

const verdicts: typeof en = {
  imaged: {
    title: 'Diawasi',
    short: 'Citra',
    unit: passes,
    definition: 'Citra asli tempat ini tersimpan di arsip publik.',
    verb: 'mengawasi',
  },
  likely: {
    title: 'Kemungkinan besar diawasi',
    short: 'Tercakup',
    unit: passes,
    definition: 'Sapuan kamera yang arahnya tetap mencakup tempat ini. Tidak ada citra tempat ini yang dipublikasikan.',
    verb: 'memindai',
  },
  could: {
    // The no-break space keeps *ke sini* together where the tile wraps (phones: never *SINI* alone on a line).
    title: 'Mungkin mengarah ke\u00a0sini',
    short: 'Mungkin',
    unit: passes,
    definition:
      'Kamera yang bisa diarahkan atau milik swasta berada dalam jangkauan. Operatornya tidak menyebutkan apakah kamera itu melihat ke sini.',
    verb: 'melintas dalam jangkauan',
  },
  overhead: {
    title: 'Melintas di atas',
    short: 'Melintas',
    unit: passes,
    definition: 'Melintasi langitmu. Stasiun antariksa dan semua yang lain.',
    verb: 'melintas di atas',
  },
}
export default verdicts
