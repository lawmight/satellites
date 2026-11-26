/**
 * Persian copy for the language switcher (see docs/i18n/fa.md §1.2). The languages keep their own names
 * (LOCALE_INFO.native): a reader looks for the word they can read, so nothing here names a language.
 *
 * Why «تغییر»: a button says what it does as a noun, as every Persian interface does; the label opens with a Persian
 * word, so its accessible name reads right to left whatever language name follows.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'زبان',
  trigger: (current: string) => `زبان: ${current}. تغییر`,
}
export default switcher
