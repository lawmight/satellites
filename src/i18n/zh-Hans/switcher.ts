/**
 * Simplified Chinese copy for the language switcher (see docs/i18n/zh-Hans.md §1.1, §6.1). The languages themselves
 * keep their own names (LOCALE_INFO.native), so `current` arrives as "English", "简体中文" or "日本語" and sits after the
 * full-width colon with no space. 切换 is the verb Chinese software uses for changing a language; the label is a bare
 * noun with no 请, like every control.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: '语言',
  trigger: (current: string) => `语言：${current}。切换语言`,
}
export default switcher
