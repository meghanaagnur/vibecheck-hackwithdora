// types.js — JSDoc typedefs mirroring docs/SCHEMA.md, kept in sync by hand.
// Import these in components for editor autocomplete; not enforced at build time.

/**
 * @typedef {Object} DiffCheck
 * @property {string} field
 * @property {*} expected
 * @property {*} actual
 * @property {boolean} pass
 * @property {number} [deltaPx]
 */

/**
 * @typedef {Object} DiffResult
 * @property {string} elementId
 * @property {string|null} matchedExtractionId
 * @property {"match"|"position_mismatch"|"style_mismatch"|"missing"} verdict
 * @property {DiffCheck[]} checks
 * @property {{x:number,y:number,width:number,height:number}|null} boundingBox
 * @property {string} note
 */

/**
 * @typedef {Object} DiffJSON
 * @property {string} diffVersion
 * @property {{totalChecked:number, mismatches:number, status:"match"|"mismatch"}} summary
 * @property {DiffResult[]} results
 * @property {{attempted:boolean, previousDiffSummary:Object, resultAfterRetry:Object}} [retry]
 */

export {};
