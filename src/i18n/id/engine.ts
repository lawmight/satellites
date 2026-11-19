/**
 * Indonesian copy the report engine emits: the computing readout's progress rows and the report's footnotes about
 * degraded data (see src/i18n/en/engine.ts; docs/i18n/id.md §3.8 gives the rows).
 *
 * Why it reads this way: the rows are mono labels, so they are stored in sentence case and uppercased by CSS, and they
 * must stay on one line of about 40 characters. "Propagate" is *menghitung*, never *propagasi* (an engineer's loan a
 * reader does not know), and "scenes" are *citra* (never *adegan*). Every count takes one noun form (*1 lintasan*,
 * *31 lintasan*, id.md §5.3), so the one plural category, `other`, serves every number. The footnotes quote the
 * verdict words exactly as the results show them (*diawasi*, *kemungkinan besar diawasi*, from ./verdicts.ts), and
 * "those passes" is *lintasan terkait*, which reads the same for one pass or many.
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('id')

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Memuat katalog orbit',
    catalog: ({ objects }: { objects: number }) => `Katalog · ${f.int(objects)} objek`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) => `Menghitung ${f.int(orbits)} orbit · ${f.int(days)} hari`,
    propagating: ({ done, total }: { done: number; total: number }) => `Menghitung orbit · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'Menelusuri arsip Sentinel-2 + Landsat',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) =>
      `Mencocokkan ${f.int(scenes)} citra dengan ${f.int(passes)} lintasan`,
    verifyingWeatherStart: 'Memeriksa mosaik cuaca NASA',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `Memeriksa mosaik cuaca NASA · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) => `${f.int(passes)} lintasan · ${f.int(images)} citra`,
  },

  note: {
    archiveSlow: 'Arsip Sentinel-2 dan Landsat terlalu lambat merespons; lintasan ditampilkan dari geometri orbit saja.',
    archiveDown: 'Arsip Sentinel-2 dan Landsat tidak bisa dihubungi; lintasan ditampilkan dari geometri orbit saja.',
    /** *utuh* belongs to the scene: it shows whole, as a thumbnail, not cropped */
    sentinel2Thumbnails: 'Daftar citra Sentinel-2 diambil dari Earth Search; sebagian citra tampil utuh sebagai miniatur, bukan potongan.',
    sentinel2EarthSearch: 'Daftar citra Sentinel-2 diambil dari Earth Search (pencarian Planetary Computer tidak tersedia).',
    /**
     * The archive's search failed outright, so none of its images is in the report: "may be missing" is *mungkin ada
     * citra … yang tidak ditampilkan*, never *mungkin tidak lengkap* (which says some are shown)
     */
    sentinel2Down: 'Arsip Sentinel-2 tidak bisa dihubungi; mungkin ada citra Sentinel-2 yang tidak ditampilkan.',
    landsatDown: 'Arsip Landsat tidak bisa dihubungi; mungkin ada citra Landsat yang tidak ditampilkan.',
    openOcean: 'Titik ini berada di luar rencana perekaman Sentinel-2 (laut lepas).',
    elementsOld: ({ days }: { days: number }) =>
      `Elemen orbit sudah berumur ${f.int(days)} hari, jadi waktu lintasan bisa meleset beberapa menit.`,
    elementsNewer: 'Lintasan ini dihitung ulang dari elemen orbit yang lebih baru, jadi waktunya bisa meleset beberapa menit.',
    /** "VIIRS images the whole globe" is a verb: *merekam* (records) */
    gibsUnconfirmed: ({ n }: { n: number }) =>
      f.plural(n, {
        other: `NASA GIBS lambat memastikan ${f.int(n)} citra VIIRS. VIIRS merekam seluruh Bumi setiap hari, jadi lintasan terkait tetap dihitung sebagai diawasi.`,
      }),
    gibsSlowAll: 'NASA GIBS tidak merespons tepat waktu, jadi citra satelit cuaca tidak ditampilkan.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS tidak mengirim ${f.int(missing)} dari ${f.int(total)} citra satelit cuaca tepat waktu; lintasan terkait ditampilkan sebagai kemungkinan besar diawasi.`,
    gibsDownAll: 'NASA GIBS tidak bisa dihubungi, jadi citra satelit cuaca tidak ditampilkan.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS gagal mengirim ${f.int(missing)} dari ${f.int(total)} citra satelit cuaca; lintasan terkait ditampilkan sebagai kemungkinan besar diawasi.`,
  },
}
export default engine
