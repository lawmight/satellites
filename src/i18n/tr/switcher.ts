/**
 * Turkish copy for the language switcher (src/ui/hud/LanguageSwitcher.tsx; see docs/i18n/tr.md §3.10). The languages
 * themselves keep their own names (LOCALE_INFO.native): a reader looks for the word they can read, so nothing here
 * names a language.
 *
 * Why these forms: the menu's title is a bare noun, as every mono label is (§1.1). The trigger's accessible name says
 * the setting and its value after a colon, then the button's action as a bare stem (§1.3): `Dil: Türkçe. Değiştir`,
 * the same verb as the results header's `Değiştir`. The language name follows a colon, so it takes no suffix (§5.1).
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'Dil',
  trigger: (current: string) => `Dil: ${current}. Değiştir`,
}
export default switcher
