/**
 * Russian copy for the app's own words (see docs/i18n/ru.md §1.3, §3.8): the fault notice, the controller's progress
 * lines and the browser tab's title.
 *
 * Why these forms: a fault is stated as an impersonal fact, then advice in the ты-imperative («Не удалось загрузить
 * каталог орбит. Проверь соединение и попробуй ещё раз.»), never an apology. The buttons are an infinitive and a noun
 * («Повторить», «Назад»), short enough for half a phone card; the busy state narrates the product's work in the
 * мы-present («Пробуем…»). The usage stats never read this file: they log the English sentence of the same ref.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · На этой неделе что-то смотрело на тебя',

  notice: {
    label: 'Сбой',
    fallback: 'Что-то пошло не так.',
    tryAgain: 'Повторить',
    trying: 'Пробуем…',
    back: 'Назад',
  },

  faults: {
    catalog: 'Не удалось загрузить каталог орбит. Проверь соединение и попробуй ещё раз.',
    compute: 'При расчёте пролётов над этим местом что-то пошло не так. Попробуй ещё раз чуть позже.',
  },

  progress: {
    catalog: 'Загрузка элементов орбит',
    done: 'Отчёт готов',
  },
}
export default app
