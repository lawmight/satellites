/**
 * Dutch copy for the language switcher (see docs/i18n/nl.md §3.7). The languages themselves keep their own names
 * (LOCALE_INFO.native): a reader looks for the word they can read, so nothing here names a language.
 *
 * Why these forms: the menu's title is a bare noun, as a mono label is (§1); the trigger's accessible name is the
 * guide's line `Taal: Nederlands. Wijzigen`, the button's action in the infinitive, as every Dutch button is.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'Taal',
  trigger: (current: string) => `Taal: ${current}. Wijzigen`,
}
export default switcher
