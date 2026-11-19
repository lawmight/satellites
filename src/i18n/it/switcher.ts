/**
 * Italian copy for the language switcher (see docs/i18n/it.md §1). The languages keep their own names
 * (LOCALE_INFO.native): a reader looks for the word they can read, so nothing here names a language. The trigger ends
 * on a tu imperative (*Cambia*), as every Italian button does, and agrees with no one.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'Lingua',
  trigger: (current: string) => `Lingua: ${current}. Cambia`,
}
export default switcher
