/**
 * Arabic copy for the app's own words (see docs/i18n/ar.md §1.1, §3.1, §3.7 "`app` and `bootText`"): the fault
 * notice, the controller's progress lines and the browser tab's title.
 *
 * Why these forms: a fault states what failed impersonally («تعذّر …», «حدث خطأ …»), then the one recovery step as
 * «يمكنك» + masdar, which speaks to one reader without a gendered imperative and without an apology. Buttons are
 * masdars («إعادة المحاولة», «رجوع»); the busy state is «جارٍ» + masdar. The tab title keeps the brand first (tabs cut
 * after ~25–30 characters) and the hero line without its full stop. The usage stats never read this file: they log the
 * English sentence of the same ref.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · ثمّة شيء رصدك أنت هذا الأسبوع',

  notice: {
    label: 'عطل',
    fallback: 'حدث خطأ.',
    tryAgain: 'إعادة المحاولة',
    trying: 'جارٍ المحاولة…',
    back: 'رجوع',
  },

  faults: {
    catalog: 'تعذّر تحميل كتالوج المدارات. يمكنك التحقق من اتصالك ثم المحاولة مجددًا.',
    compute: 'حدث خطأ أثناء حساب مرات المرور فوق هذا المكان. يمكنك المحاولة مجددًا بعد قليل.',
  },

  progress: {
    catalog: 'جارٍ تحميل العناصر المدارية',
    done: 'التقرير جاهز',
  },
}
export default app
