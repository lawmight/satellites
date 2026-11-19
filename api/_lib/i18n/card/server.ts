/**
 * Every language's card copy, for the server: the Open Graph card and the share page print the language a link names
 * (`l=<locale>`). Imported by server code only (api/_lib/share.ts), never by the app, which takes its own language's
 * card from its bundle: a visitor never downloads fifteen languages' cards.
 */
import { provideServerCards } from './index.js'
import es from './es.js'
import fr from './fr.js'
import de from './de.js'
import ptBR from './pt-BR.js'
import it from './it.js'
import nl from './nl.js'
import pl from './pl.js'
import tr from './tr.js'
import id from './id.js'
import uk from './uk.js'
import ja from './ja.js'
import ko from './ko.js'
import zhHans from './zh-Hans.js'
import zhHant from './zh-Hant.js'
import ar from './ar.js'

provideServerCards({ es, fr, de, 'pt-BR': ptBR, it, nl, pl, tr, id, uk, ja, ko, 'zh-Hans': zhHans, 'zh-Hant': zhHant, ar })
