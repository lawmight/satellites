/**
 * Spanish copy for the app's own words (see docs/i18n/es.md §1, §3.1, §4): the fault notice, the controller's progress
 * lines and the browser tab's title.
 *
 * Why these forms: a fault says what failed in the impersonal *se* (or *Algo salió mal* when nothing more is known),
 * then the way out in the tú imperative (*Revisa la conexión y vuelve a intentarlo.*), with no apology and no *por
 * favor*. The label is *Error*, the one word every region reads the same way (*fallo* and *falla* split them). Buttons
 * are infinitives (*Reintentar*, *Volver*), short enough for half a phone card. The tab title is the hero in plain text,
 * without the emphatic *a ti* that only the serif needs. The usage stats never read this file: they log the English
 * sentence of the same ref.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · Algo te observó esta semana',

  notice: {
    label: 'Error',
    fallback: 'Algo salió mal.',
    tryAgain: 'Reintentar',
    trying: 'Reintentando…',
    back: 'Volver',
  },

  faults: {
    catalog: 'No se pudo cargar el catálogo de órbitas. Revisa la conexión y vuelve a intentarlo.',
    compute: 'Algo salió mal al calcular las pasadas sobre este lugar. Vuelve a intentarlo en un momento.',
  },

  progress: {
    catalog: 'Cargando elementos orbitales',
    done: 'Resultados listos',
  },
}
export default app
