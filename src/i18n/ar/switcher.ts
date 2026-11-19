/**
 * Arabic copy for the language switcher (see docs/i18n/ar.md §3.7, decision M8). The languages themselves keep their
 * own names (LOCALE_INFO.native): a reader looks for the word they can read, so nothing here names a language.
 *
 * Why a masdar: «تغيير» ("change") addresses no one, where an imperative would have to pick the reader's gender
 * (ar.md §1.2). The trigger's label opens with an Arabic word, so its accessible name reads right to left whatever
 * language name follows.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'اللغة',
  trigger: (current: string) => `اللغة: ${current}. تغيير`,
}
export default switcher
