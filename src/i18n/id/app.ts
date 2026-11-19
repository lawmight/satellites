/**
 * Indonesian copy for the app's own words (see docs/i18n/id.md §3.8): the fault notice, the controller's progress
 * lines and the tab title. Faults say what failed, then what to do, with no *Maaf* and no *Silakan* (§1.1): the
 * English never apologises. The usage stats keep logging the ENGLISH sentence of each fault, whatever is shown here.
 */
import type en from '../en/app'

const app: typeof en = {
  /** The brand first, then the hero as one sentence without its full stop (§3.1) */
  documentTitle: 'Watched · Sesuatu mengawasi kamu minggu ini',

  notice: {
    label: 'Gangguan',
    fallback: 'Ada yang salah.',
    tryAgain: 'Coba lagi',
    trying: 'Mencoba…',
    back: 'Kembali',
  },

  faults: {
    catalog: 'Katalog orbit tidak bisa dimuat. Periksa koneksimu, lalu coba lagi.',
    compute: 'Ada yang salah saat menghitung lintasan untuk tempat ini. Coba lagi sebentar lagi.',
  },

  progress: {
    catalog: 'Memuat elemen orbit',
    done: 'Laporan siap',
  },
}
export default app
