/** @type {{UNKNOWN: 'unknown', SAME: 'same', HIGHER: 'higher', LOWER: 'lower'}} */
export const VersionCompare = Object.freeze({
  UNKNOWN: 'unknown',
  SAME: 'same',
  HIGHER: 'higher',
  LOWER: 'lower',
})

/**
 *
 * @param {SemVer} baseVersion the base version
 * @param {SemVer} compareVersion the version to compare the base to
 *
 * @returns {keyof VersionCompare}
 */
export function compare(baseVersion, compareVersion) {
  // TODO
  // Can return 'unknown', 'same', 'higher', 'lower'
}
