/**
 * The only words on screen before the app's script runs: the loading screen's accessible name, its "slow connection"
 * line and the tab title. index.html is static and English; vite.config.ts inlines this table next to the loading
 * screen, so the boot script's choice of language reaches these three strings in the same parse, before first paint.
 *
 * Keep each entry short (the slow line is one centred mono line under the wordmark, uppercase where the script has
 * case). The tab title holds until the app sets its own (Main.tsx useDocumentTitle keeps it in step afterwards).
 * A locale missing here keeps the English of index.html.
 */
import type { Locale } from '../../api/_lib/i18n/locales.ts'
import es from './es/boot.ts'
import fr from './fr/boot.ts'
import de from './de/boot.ts'
import ptBR from './pt-BR/boot.ts'
import it from './it/boot.ts'
import nl from './nl/boot.ts'
import pl from './pl/boot.ts'
import tr from './tr/boot.ts'
import id from './id/boot.ts'
import uk from './uk/boot.ts'
import ja from './ja/boot.ts'
import ko from './ko/boot.ts'
import zhHans from './zh-Hans/boot.ts'
import zhHant from './zh-Hant/boot.ts'
import ar from './ar/boot.ts'

export interface BootText {
  /** aria-label of the loading screen: "Loading Watched" */
  loading: string
  /** the line that appears after 6 s: "Slow connection, still loading" */
  slow: string
  /** the tab title: "Watched · Something watched you this week" */
  title: string
}

export const BOOT_TEXT: Partial<Record<Locale, BootText>> = {
  en: { loading: 'Loading Watched', slow: 'Slow connection, still loading', title: 'Watched · Something watched you this week' },
  es,
  fr,
  de,
  'pt-BR': ptBR,
  it,
  nl,
  pl,
  tr,
  id,
  uk,
  ja,
  ko,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ar,
}
