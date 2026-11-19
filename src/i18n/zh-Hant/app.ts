/**
 * Traditional Chinese copy for the app's own words (see docs/i18n/zh-Hant.md §1.1, §2.4, §4.1, Appendix A): the fault
 * notice, the controller's progress lines and the browser tab's title.
 *
 * Why it reads this way: a fault says what happened, then what to do, with no apology and no ！. 請 appears once here,
 * in the catalog fault, because checking the connection is something the reader does outside the app; the compute
 * fault offers the next step as a possibility (可以稍後再試一次). The tab title is the brand, then the hero's plain-text
 * sentence without its 。 (這星期，有東西注視過你), so a tab cut after ~25 characters still shows the whole line. The
 * stats log the ENGLISH fault sentences, never these.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · 這星期，有東西注視過你',

  notice: {
    label: '故障',
    fallback: '出了問題。',
    tryAgain: '再試一次',
    trying: '重試中…',
    back: '返回',
  },

  faults: {
    catalog: '無法載入軌道目錄。請檢查連線後再試一次。',
    compute: '計算這個地點的過境時出了問題。可以稍後再試一次。',
  },

  progress: {
    catalog: '正在載入軌道根數',
    done: '結果已就緒',
  },
}
export default app
