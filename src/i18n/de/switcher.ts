/**
 * German copy for the language switcher (src/ui/hud/LanguageSwitcher.tsx; see docs/i18n/de.md). The languages
 * themselves keep their own names (LOCALE_INFO.native): a reader looks for the word they can read, so nothing here
 * names a language.
 *
 * Why these forms: the menu's title is a bare noun, as every mono label is (§1.1, §6.5). The trigger's accessible name
 * names the setting and its value, then the button's action in the infinitive, which addresses no one, as German UI
 * buttons do (§1.1): `Sprache: Deutsch. Ändern`, the same verb as the results header's `Ändern`.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'Sprache',
  trigger: (current: string) => `Sprache: ${current}. Ändern`,
}
export default switcher
