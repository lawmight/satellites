/**
 * Russian copy for the language switcher (see docs/i18n/ru.md). The languages themselves keep their own names
 * (LOCALE_INFO.native): a reader looks for the word they can read, so nothing here names a language.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'Язык',
  trigger: (current: string) => `Язык: ${current}. Изменить`,
}
export default switcher
