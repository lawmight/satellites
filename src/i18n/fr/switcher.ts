/**
 * French copy for the language switcher (see docs/i18n/fr.md §3.9). The languages themselves keep their own names
 * (LOCALE_INFO.native): a reader looks for the word they can read, so nothing here names a language.
 *
 * Why these forms: the menu's title is a bare noun, as a mono label is (§1.1); the trigger's accessible name follows
 * the guide's line «Langue : Français. Changer», with the no-break space French puts before a colon and the button's
 * action in the infinitive, as every French button is.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'Langue',
  trigger: (current: string) => `Langue\u00a0: ${current}. Changer`,
}
export default switcher
