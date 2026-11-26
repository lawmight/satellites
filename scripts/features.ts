/**
 * Which GeoNames features the offline place list carries, and how it ranks them (scripts/build-places.ts), shared with
 * scripts/build-exonyms.ts, which names the same features in the visitors' languages: the two must pick the same rows,
 * or a name would be written for a feature the list does not have.
 */

/**
 * Named features and buildings people look for from orbit (GeoNames feature codes), kept only if they have an
 * English Wikipedia article: a mountain, lake or dam with one is one people have heard of; the thousands without
 * one would bury the real answers.
 */
export const FEATURES = new Set(
  [
    ...['MT', 'MTS', 'PK', 'PKS', 'VLC', 'ISL', 'ISLS', 'ATOL', 'CNYN', 'DSRT', 'PEN', 'CAPE', 'CRTR', 'MESA', 'GRGE', 'DLTA'],
    ...['LK', 'LKS', 'LKN', 'BAY', 'BAYS', 'GLCR', 'STRT', 'LGN', 'RSV', 'FLLS', 'RF', 'GULF', 'FJD', 'SD', 'SEA', 'CNL', 'GYSR'],
    ...['PRK', 'RESN', 'RESF', 'RESW'],
    ...['AIRP', 'STDM', 'DAM', 'MNMT', 'CSTL', 'UNIV', 'PAL', 'TMPL', 'MUS', 'BDG', 'TOWR', 'PYR', 'PYRS', 'RUIN', 'ANS'],
    ...['OBS', 'ZOO', 'HSTS', 'CTRS', 'SQR', 'OPRA', 'WALL', 'GDN', 'FT', 'MN'],
  ],
)

/**
 * A feature has no population to rank by. How many names it has (languages, spellings) says how widely it is known:
 * ranked as a place of 10^(2 + 1.5·log10(names + 1)) people, e.g. ~3,000 for a lake with 9 names, ~1 million for a
 * mountain with 50, capped at 10 million.
 */
export const featurePop = (names: number) => Math.min(1e7, 10 ** (2 + 1.5 * Math.log10(names + 1)))
