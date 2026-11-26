/**
 * Hindi copy for the app's own words (see docs/i18n/hi.md §1.3, §3.1): the fault notice, the controller's progress
 * lines and the tab title.
 *
 * Why these words: the notice's label is an instrument's word for a failure, «खराबी» (as in «तकनीकी खराबी»), not an
 * alarm and not the colloquial «गड़बड़ी», which the message body keeps («कुछ गड़बड़ हो गई»). Each message
 * says what failed impersonally («… लोड नहीं हो सकी»: the verb agrees with «सूची», our own noun), then the one step to
 * take in the polite imperative («जाँचें», «कोशिश करें»), with no «कृपया». The retrying state is a noun with «जारी»,
 * so it has no gender either. The tab title is the hero in one line, without the danda (a title takes no full stop).
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · किसी चीज़ ने इस हफ़्ते आपको देखा',

  notice: {
    label: 'खराबी',
    fallback: 'कुछ गड़बड़ हो गई।',
    tryAgain: 'फिर कोशिश करें',
    trying: 'कोशिश जारी…',
    back: 'वापस',
  },

  faults: {
    catalog: 'कक्षाओं की सूची लोड नहीं हो सकी। अपना कनेक्शन जाँचें और फिर कोशिश करें।',
    compute: 'इस जगह की उड़ानों की गणना में कुछ गड़बड़ हो गई। थोड़ी देर में फिर कोशिश करें।',
  },

  progress: {
    catalog: 'कक्षा के आँकड़े लोड हो रहे हैं',
    done: 'रिपोर्ट तैयार',
  },
}
export default app
