/**
 * Turkish copy for the app's own words (src/app; see docs/i18n/tr.md §3.1, §3.10, §1.1): the fault notice, the
 * progress lines the controller writes, and the browser tab's title.
 *
 * Why these forms: the tab title is the brand, a middle dot, then the hero sentence without its full stop (§3.1), in
 * the hero's own order, so a tab cut after ~25 characters still reads *Watched · Bu hafta bir şey…*. The notice's
 * label is `Arıza`, an instrument's word for a failure, never *Hata!* (§4). Its messages say what failed in the past or
 * the passive, then the one action as a sen imperative, with no *lütfen* and no apology (§1.1); the fallback is *Bir
 * sorun oluştu.*, never *Bir şeyler ters gitti*, which is chatty and echoes the hero's *bir şey* (§2.3). Buttons are
 * bare stems (`Yeniden dene`, `Geri`); the busy one is the passive present with an ellipsis, as every status line is
 * (`Deneniyor…`, §1.1, §6.1). The progress line is a passive status (`Yörünge elemanları yükleniyor`). The usage stats
 * keep logging the ENGLISH sentence of each fault, read from the English namespace, so nothing here changes what they
 * record.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · Bu hafta bir şey seni izledi',

  notice: {
    label: 'Arıza',
    fallback: 'Bir sorun oluştu.',
    tryAgain: 'Yeniden dene',
    trying: 'Deneniyor…',
    back: 'Geri',
  },

  faults: {
    catalog: 'Yörünge kataloğu yüklenemedi. Bağlantını kontrol edip yeniden dene.',
    compute: 'Bu yerin geçişleri hesaplanırken bir sorun oluştu. Birazdan yeniden dene.',
  },

  progress: {
    catalog: 'Yörünge elemanları yükleniyor',
    done: 'Rapor hazır',
  },
}
export default app
