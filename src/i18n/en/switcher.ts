/**
 * English copy for the language switcher (src/ui/hud/LanguageSwitcher.tsx). The languages themselves are listed by
 * their own names (LOCALE_INFO.native), never translated: a reader looks for the word they can read.
 */
import { ns } from '../ns'

export default ns('switcher', {
  /** The menu's title (mono caps) */
  title: 'Language',
  /** The trigger's accessible name, with the current language's own name */
  trigger: (current: string) => `Language: ${current}. Change`,
})
