/**
 * Spanish copy for the language switcher (see docs/i18n/es.md). The languages keep their own names
 * (LOCALE_INFO.native): a reader looks for the word they can read, so nothing here names a language. The trigger ends
 * on an infinitive, as every Spanish action does (§1), so it addresses no one.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'Idioma',
  trigger: (current: string) => `Idioma: ${current}. Cambiar`,
}
export default switcher
