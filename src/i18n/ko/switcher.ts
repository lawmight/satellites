/**
 * Korean copy for the language switcher (see docs/i18n/ko.md §3.7). The languages themselves are listed by their own
 * names, never translated, so `current` arrives as 한국어 or Deutsch and is inserted as it is.
 *
 * Why it reads this way: the trigger's name follows the English shape (what it is, the current value, what it does),
 * with the action as a bare noun (변경), as Korean buttons are. Nothing follows the slot but a full stop, so no particle
 * has to agree with a language's name.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: '언어',
  trigger: (current: string) => `언어: ${current}. 변경`,
}
export default switcher
