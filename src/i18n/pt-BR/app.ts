/**
 * Brazilian Portuguese copy for the app's own words (see docs/i18n/pt-BR.md §1.1, §3.1, §3.7): the fault notice, the
 * controller's progress lines and the browser tab's title.
 *
 * Why these forms: an instrument reports a fault, it does not apologise. The label is *Falha*; what failed is said in
 * the impersonal *Não foi possível…* (or *Houve um erro ao…*), then what to do in the imperative of *você* (*Verifique
 * a conexão e tente de novo.*), with no *Desculpe*, no *Ops!* and no *por favor*. The fallback is *Ocorreu um erro.*,
 * never *Algo deu errado*, which would echo the hero's *Algo* on the screen where the product failed. Buttons are
 * infinitives (*Tentar de novo*, *Voltar*) and the running state a gerund with an ellipsis (*Tentando…*), short enough
 * for half a phone card. The tab title is the hero in plain text, brand first. The usage stats never read this file:
 * they log the English sentence of the same ref.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · Algo observou você esta semana',

  notice: {
    label: 'Falha',
    fallback: 'Ocorreu um erro.',
    tryAgain: 'Tentar de novo',
    trying: 'Tentando…',
    back: 'Voltar',
  },

  faults: {
    catalog: 'Não foi possível carregar o catálogo de órbitas. Verifique a conexão e tente de novo.',
    compute: 'Houve um erro ao calcular as passagens deste lugar. Tente de novo em instantes.',
  },

  progress: {
    catalog: 'Carregando elementos orbitais',
    done: 'Relatório pronto',
  },
}
export default app
