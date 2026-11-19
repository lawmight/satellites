/**
 * Polish copy for the language switcher (see docs/i18n/pl.md §3.9). The languages are listed by their own names
 * (LOCALE_INFO.native), so `current` arrives as "Polski", "English", "Deutsch": it only ever follows a colon, where any
 * name stays in the nominative, and the trigger ends on the imperative a button would say («Zmień»).
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'Język',
  trigger: (current: string) => `Język: ${current}. Zmień`,
}
export default switcher
