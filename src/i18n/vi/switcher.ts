/**
 * Vietnamese copy for the language switcher (see docs/i18n/vi.md §3.8). The languages are listed by their own names, so
 * only the menu's title and the trigger's accessible name are ours: "Ngôn ngữ: Tiếng Việt. Đổi".
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: 'Ngôn ngữ',
  trigger: (current: string) => `Ngôn ngữ: ${current}. Đổi`,
}
export default switcher
