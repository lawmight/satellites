/**
 * ui-results: progress readout, results panel, timeline, pass list + detail, pushbroom reveal.
 * Contract (docs/ARCHITECTURE.md): <ResultsView/> for phase 'computing' AND 'results' (one persistent panel,
 * decision #10). <ComputingReadout/> remains as a thin wrapper for compositions that still mount it.
 */
export { ComputingReadout } from './ComputingReadout'
export { ResultsView, type ResultsViewProps } from './ResultsView'
export { PushbroomReveal } from './PushbroomReveal'
export { Timeline } from './Timeline'
export { PassPlan } from './PassPlan'
export { focusPass, clearPass, startReplay, togglePlay } from './actions'
export { pickBestLook, bestLookImageUrl, isClouded, type BestLook } from './bestLook'
/** R2R7: build the results model of a report in idle time before the handoff (core calls it; a cache hit at render). */
export { prewarmResultsModel } from './model'
/** Start the panel's first thumbnails and the gallery's next photos before the first paint (core calls it). */
export { warmFirstPhotos } from './warm'
export { orderPhotos, type Photo, type PhotoFilter } from './lib/photos'
/**
 * The one verdict vocabulary (DESIGN §7), in the active language: verdictWords(v) at call time (React:
 * useMsgs(enVerdicts) from src/i18n/en/verdicts.ts). VERDICT_META's entries read the active language when used.
 */
export { VERDICT_META, VERDICTS, verdictUnit, verdictWords, type Verdict, type VerdictWords } from './lib/meta'
