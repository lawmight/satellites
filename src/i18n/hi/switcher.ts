/**
 * Hindi copy for the language switcher (see docs/i18n/hi.md). The languages keep their own names (LOCALE_INFO.native):
 * a reader looks for the word they can read, so nothing here names a language. The trigger ends on the polite
 * imperative «बदलें», which addresses no gender.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'भाषा',
  trigger: (current: string) => `भाषा: ${current}। बदलें`,
}
export default switcher
