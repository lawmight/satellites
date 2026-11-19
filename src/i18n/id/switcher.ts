/**
 * Indonesian copy for the language switcher (see docs/i18n/id.md §3.8). The languages are listed by their own names, so
 * only the menu's title and the trigger's accessible name are ours: "Bahasa: Bahasa Indonesia. Ubah".
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'Bahasa',
  trigger: (current: string) => `Bahasa: ${current}. Ubah`,
}
export default switcher
