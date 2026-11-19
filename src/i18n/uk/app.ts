/**
 * Ukrainian copy for the app's own words (see docs/i18n/uk.md §1.3, §3.8): the fault notice, the controller's
 * progress lines and the browser tab's title.
 *
 * Why these forms: a fault is stated as an impersonal fact, then advice in the ти-imperative («Не вдалося завантажити
 * каталог орбіт. Перевір з’єднання й спробуй ще раз.»), never an apology. The buttons are infinitives or plain nouns
 * («Повторити», «Назад») and short enough for half a phone card; the busy state narrates the product's work in the
 * ми-present («Пробуємо…»). The usage stats never read this file: they log the English sentence of the same ref.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · Цього тижня щось дивилося на тебе',

  notice: {
    label: 'Збій',
    fallback: 'Щось пішло не так.',
    tryAgain: 'Повторити',
    trying: 'Пробуємо…',
    back: 'Назад',
  },

  faults: {
    catalog: 'Не вдалося завантажити каталог орбіт. Перевір з’єднання й спробуй ще раз.',
    compute: 'Під час обчислення прольотів над цим місцем щось пішло не так. Спробуй ще раз трохи згодом.',
  },

  progress: {
    catalog: 'Завантаження елементів орбіт',
    done: 'Звіт готовий',
  },
}
export default app
