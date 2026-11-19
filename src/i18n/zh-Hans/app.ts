/**
 * Simplified Chinese copy for the app's own words (see docs/i18n/zh-Hans.md §1.1, §2.4, §4.1, Appendix A): the fault
 * notice, the controller's progress lines and the browser tab's title.
 *
 * Why it reads this way: a fault says what happened, then what still works, with no apology and no ！. 请 appears once,
 * in the catalog fault, because checking the connection is something the reader does outside the app; "Try again" is
 * the app's own button (重试), so it takes none. The tab title is the brand, then the hero's plain-text sentence
 * without its 。 (这一周，有东西注视过你). The stats log the ENGLISH fault sentences, never these.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · 这一周，有东西注视过你',

  notice: {
    label: '故障',
    fallback: '出了点问题。',
    tryAgain: '重试',
    trying: '正在重试…',
    back: '返回',
  },

  faults: {
    catalog: '无法加载轨道目录。请检查网络连接后再试一次。',
    compute: '计算这个地方的过境时出了问题。稍后再试一次。',
  },

  progress: {
    catalog: '正在加载轨道根数',
    done: '报告已就绪',
  },
}
export default app
