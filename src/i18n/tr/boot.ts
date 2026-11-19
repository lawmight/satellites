/**
 * The three Turkish strings on screen before the app's script runs (src/i18n/bootText.ts inlines them next to the
 * loading screen; see docs/i18n/tr.md §3.1 and §3.10 "bootText").
 *
 * Why these forms: the loading screen's accessible name is a status line, the passive present continuous every running
 * step uses (*Katalog yükleniyor*, §1.1), with the brand as its bare subject: *Watched yükleniyor*. The brand is never
 * translated and never takes a suffix (§6.1), which is why it is the subject rather than an object (*Watched’ı
 * yüklüyor* would need an ending code cannot choose). The slow line is one short centred mono line under the wordmark:
 * two plain clauses with a comma, *Bağlantı yavaş, hâlâ yükleniyor*, keeping the English "still" (*hâlâ*, with the
 * circumflex: *hala* is "aunt", §6.1), and uppercased by CSS with Turkish rules (*BAĞLANTI YAVAŞ, HÂLÂ YÜKLENİYOR*).
 * The tab title is the hero in plain text, exactly as app.documentTitle sets it once the app runs, so the tab never
 * changes its words: the brand, a middle dot, then *Bu hafta bir şey seni izledi* in the hero's own order and without
 * the full stop (a tab title takes none), so a tab cut short still reads *Watched · Bu hafta bir şey…*.
 *
 * vite.config.ts loads boot files through bootText.ts, so the import names its extension, as Vite's native config
 * loader needs.
 */
import type { BootText } from '../bootText.ts'

const loading = 'Watched yükleniyor'
const slow = 'Bağlantı yavaş, hâlâ yükleniyor'
const title = 'Watched · Bu hafta bir şey seni izledi'

export default { loading, slow, title } satisfies BootText
