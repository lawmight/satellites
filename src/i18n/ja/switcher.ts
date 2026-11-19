/**
 * Japanese copy for the language switcher (see docs/i18n/ja.md §3.7). The languages themselves keep their own names
 * (LOCALE_INFO.native), so `current` arrives as "English", "简体中文" or "日本語" and follows the full-width colon with
 * no space. The trigger is a label, not a request: the bare noun 変更 ("change"), never 変更してください.
 */
import type en from '../en/switcher'

const switcher: typeof en = {
  title: '言語',
  trigger: (current: string) => `言語：${current}。変更`,
}
export default switcher
