/**
 * Traditional Chinese copy for the language switcher (see docs/i18n/zh-Hant.md §1.1, §6.1, Appendix A). The languages
 * keep their own names (LOCALE_INFO.native), so `current` arrives as "English", "繁體中文" or "日本語" and sits after
 * the full-width colon with no space. The trigger ends on 更改, a bare verb like every control: no 請, no 你.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: '語言',
  trigger: (current: string) => `語言：${current}。更改`,
}
export default switcher
