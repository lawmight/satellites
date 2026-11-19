/**
 * The places where every year of the time-lapse is the same season, and the season: the war zones people search
 * for, and glaciers (below, by GLACIER_SEASONS: a glacier's loop that turns through the seasons shows snow coming
 * and going, not the ice going).
 *
 * Why (owner, 2026-11-16): elsewhere the years turn through the seasons (timelapse.ts). In a war zone that hides the
 * war or invents some: Gaza turns brown every summer, war or no war, so a summer frame after a winter one shows the
 * season as damage, and a winter frame after the war softens it (the rain greens cleared land). With one season for
 * every year, a change the loop shows happened on the ground.
 *
 *  - The season is the one in which the war's change stands out most above the place's own year-to-year variation:
 *    per pixel, the median look after the damage against the median before, less the change between two halves of
 *    the years before (Sentinel-2, the app's ±45-day window). SEASON_REGIONS gives the numbers.
 *  - The zones are the wars among the places people search for most (all-time search rollup, 2026-11-16):
 *    the Palestinian territories (Gaza, ~1,300 searches), Ukraine (Kyiv, Kharkiv, Bakhmut, Donetsk, Odesa, …) and
 *    Lebanon (Beirut). Gaza and the West Bank differ in season, so they are two zones. A war older than the archive
 *    (Syria, Yemen) has no before to show; Sudan's places are not among the searched ones.
 *  - A year's frame comes from that year's season, never across New Year: wrapped round, a January aim took Gaza's
 *    26 December 2023 for "2023", eleven weeks into the war. So `day` keeps its whole window inside the year.
 *  - A year with no clear look in the season is a gap on the time line, never another season.
 *  - Outlines: Natural Earth 10m admin-0 v5.1.2 (public domain), the outer ring simplified (Douglas–Peucker,
 *    0.002° for Gaza to 0.04° for Crimea) and rounded to 0.001°, as [lon, lat, lon, lat, …]. Crimea, which Natural
 *    Earth draws by who holds it, is part of Ukraine here. A place within NEAR_KM of an outline counts: Natural
 *    Earth's coast runs a kilometre or two off (Kherson, Henichesk and Ochakiv read as sea), and a village on the
 *    border sees the zone in its square anyway.
 */
import type { LatLon } from '@/types'
import { GLACIER_CELL, GLACIER_ROWS } from './glaciers'

/** A season's id, never shown as it is: the time-lapse's copy says it in each language (src/i18n/en/timelapse.ts). */
export type SeasonName = 'winter' | 'spring' | 'summer' | 'autumn'

export interface SeasonRegion {
  /** For people reading this file; never shown */
  name: string
  /** The season every year keeps, which the caption names ("one each autumn") */
  season: SeasonName
  /** The middle day of the season (days since 1 January), its window SEASON_HALF_DAYS either side */
  day: number
  /** Outer rings, [lon, lat, lon, lat, …] */
  rings: readonly (readonly number[])[]
}

/** A place this close to an outline is in it. */
export const NEAR_KM = 2.5

const KM_PER_DEG = 111.32

// ── Outlines (Natural Earth 10m admin-0 v5.1.2, simplified) ─────────────────────────────────

const GAZA = [
  34.481, 31.583, 34.556, 31.54, 34.48, 31.486, 34.367, 31.393, 34.346, 31.358, 34.346, 31.341, 34.354, 31.306,
  34.351, 31.289, 34.316, 31.257, 34.248, 31.211, 34.225, 31.276, 34.2, 31.314, 34.223, 31.327, 34.237, 31.342,
  34.281, 31.377, 34.302, 31.408, 34.348, 31.438, 34.368, 31.468, 34.443, 31.535
]
const WEST_BANK = [
  34.987, 31.967, 34.998, 31.979, 34.997, 32.011, 35.007, 32.021, 34.984, 32.09, 34.987, 32.124, 34.958, 32.186,
  34.961, 32.202, 35.008, 32.244, 35.009, 32.268, 34.99, 32.278, 34.997, 32.323, 35.001, 32.336, 35.022, 32.345,
  35.045, 32.434, 35.064, 32.463, 35.152, 32.508, 35.191, 32.542, 35.209, 32.543, 35.27, 32.51, 35.363, 32.51,
  35.393, 32.494, 35.407, 32.415, 35.561, 32.385, 35.566, 32.368, 35.559, 32.375, 35.552, 32.368, 35.566, 32.313,
  35.561, 32.283, 35.573, 32.252, 35.559, 32.238, 35.573, 32.238, 35.555, 32.174, 35.559, 32.155, 35.547, 32.147,
  35.552, 32.135, 35.535, 32.111, 35.545, 32.087, 35.528, 32.075, 35.523, 32.058, 35.525, 32.012, 35.546, 31.945,
  35.525, 31.919, 35.549, 31.839, 35.538, 31.819, 35.559, 31.765, 35.528, 31.735, 35.48, 31.641, 35.459, 31.492,
  35.39, 31.487, 35.332, 31.459, 35.223, 31.381, 35.165, 31.362, 35.04, 31.363, 34.927, 31.345, 34.879, 31.363,
  34.867, 31.396, 34.927, 31.494, 34.937, 31.582, 34.974, 31.63, 35.059, 31.677, 35.126, 31.733, 35.149, 31.737,
  35.179, 31.72, 35.205, 31.723, 35.238, 31.709, 35.263, 31.749, 35.253, 31.77, 35.265, 31.826, 35.252, 31.831,
  35.257, 31.839, 35.25, 31.844, 35.233, 31.843, 35.222, 31.879, 35.205, 31.877, 35.216, 31.82, 35.184, 31.825,
  35.186, 31.809, 35.112, 31.824, 35.076, 31.854, 35.056, 31.853, 35.013, 31.829, 34.977, 31.833, 34.999, 31.854,
  35.034, 31.861, 35.039, 31.909, 35.03, 31.924, 35.005, 31.934, 35.008, 31.945
]
const LEBANON = [
  35.105, 33.089, 35.106, 33.112, 35.148, 33.14, 35.162, 33.177, 35.175, 33.17, 35.205, 33.225, 35.209, 33.255,
  35.188, 33.28, 35.225, 33.312, 35.271, 33.458, 35.349, 33.514, 35.394, 33.65, 35.438, 33.711, 35.481, 33.824,
  35.47, 33.902, 35.572, 33.91, 35.614, 33.993, 35.641, 33.999, 35.627, 34.044, 35.648, 34.119, 35.627, 34.201,
  35.648, 34.222, 35.665, 34.311, 35.689, 34.328, 35.706, 34.317, 35.751, 34.39, 35.806, 34.415, 35.824, 34.435,
  35.805, 34.465, 35.903, 34.478, 35.983, 34.539, 35.99, 34.6, 35.97, 34.65, 36.038, 34.628, 36.262, 34.627,
  36.309, 34.688, 36.368, 34.629, 36.44, 34.629, 36.436, 34.598, 36.389, 34.596, 36.384, 34.554, 36.32, 34.514,
  36.335, 34.493, 36.433, 34.494, 36.45, 34.465, 36.525, 34.423, 36.519, 34.354, 36.582, 34.3, 36.563, 34.263,
  36.604, 34.199, 36.488, 34.089, 36.475, 34.054, 36.391, 34.045, 36.289, 33.947, 36.275, 33.897, 36.368, 33.858,
  36.37, 33.837, 36.338, 33.821, 36.232, 33.853, 36.166, 33.83, 36.138, 33.851, 36.05, 33.816, 35.948, 33.709,
  35.922, 33.64, 36.03, 33.598, 36.035, 33.568, 35.933, 33.528, 35.919, 33.462, 35.821, 33.407, 35.769, 33.343,
  35.699, 33.323, 35.652, 33.277, 35.62, 33.27, 35.604, 33.24, 35.549, 33.281, 35.48, 33.087, 35.345, 33.056,
  35.284, 33.101
]
const UKRAINE = [
  31.764, 52.101, 31.859, 52.1, 31.91, 52.029, 32.233, 52.081, 32.367, 52.247, 32.354, 52.322, 32.394, 52.327,
  32.909, 52.241, 33.183, 52.367, 33.481, 52.358, 33.51, 52.288, 33.688, 52.356, 33.804, 52.355, 34.065, 52.159,
  34.096, 51.952, 34.295, 51.874, 34.413, 51.778, 34.376, 51.709, 34.089, 51.667, 34.224, 51.515, 34.186, 51.394,
  34.3, 51.368, 34.309, 51.335, 34.186, 51.249, 34.608, 51.234, 34.675, 51.168, 35.079, 51.208, 35.144, 51.058,
  35.355, 51.026, 35.278, 50.993, 35.285, 50.944, 35.342, 50.916, 35.469, 50.669, 35.378, 50.622, 35.425, 50.5,
  35.541, 50.45, 35.611, 50.352, 35.697, 50.345, 35.837, 50.423, 36.106, 50.421, 36.269, 50.281, 36.41, 50.305,
  36.536, 50.268, 36.535, 50.22, 36.594, 50.204, 36.849, 50.324, 37.197, 50.362, 37.415, 50.432, 37.48, 50.34,
  37.599, 50.291, 37.597, 50.197, 37.728, 50.079, 37.916, 50.003, 38, 49.9, 38.166, 49.941, 38.174, 50.06, 38.3,
  50.061, 38.356, 49.981, 38.498, 49.948, 38.665, 49.965, 38.687, 49.914, 38.937, 49.803, 39.049, 49.811, 39.156,
  49.874, 39.261, 49.745, 39.558, 49.724, 39.623, 49.613, 39.802, 49.542, 39.998, 49.608, 40.131, 49.58, 40.035,
  49.487, 40.16, 49.334, 40.142, 49.246, 39.952, 49.125, 39.919, 49.048, 39.681, 49.02, 39.674, 48.97, 39.759,
  48.895, 39.95, 48.853, 40.009, 48.888, 40.054, 48.869, 39.975, 48.79, 39.779, 48.808, 39.703, 48.747, 39.632,
  48.587, 39.835, 48.573, 39.87, 48.51, 39.845, 48.484, 39.924, 48.376, 39.816, 48.308, 39.993, 48.273, 39.843,
  48.12, 39.843, 48.036, 39.76, 48.015, 39.796, 47.961, 39.759, 47.833, 38.831, 47.848, 38.735, 47.677, 38.353,
  47.607, 38.293, 47.563, 38.258, 47.393, 38.189, 47.301, 38.292, 47.287, 38.298, 47.256, 38.203, 47.192, 38.217,
  47.103, 38.142, 47.038, 38.108, 47.026, 38.13, 47.075, 38.072, 47.1, 37.546, 47.082, 37.335, 46.882, 37.227,
  46.937, 36.854, 46.8, 36.769, 46.637, 36.744, 46.65, 36.772, 46.643, 36.803, 46.725, 36.696, 46.78, 36.4,
  46.724, 36.278, 46.607, 36.189, 46.669, 35.902, 46.653, 35.491, 46.448, 35.185, 46.145, 35, 46.074, 35.044,
  46.142, 35.2, 46.183, 35.342, 46.336, 35.346, 46.361, 35.268, 46.351, 35.285, 46.437, 35.188, 46.512, 35.209,
  46.396, 35.108, 46.298, 35.031, 46.252, 34.894, 46.252, 34.812, 46.177, 34.874, 45.926, 35.002, 45.729, 34.976,
  45.717, 34.789, 45.804, 34.784, 45.899, 34.689, 45.974, 34.465, 45.955, 34.334, 46.07, 34.068, 46.105, 33.846,
  46.196, 33.67, 46.218, 33.66, 46.148, 33.55, 46.136, 33.558, 46.087, 33.496, 46.068, 33.516, 46.046, 33.29,
  46.095, 33.316, 46.131, 33.215, 46.128, 33.235, 46.224, 33.123, 46.136, 33.023, 46.17, 33.018, 46.128, 32.766,
  46.136, 32.503, 46.076, 32.262, 46.128, 32.269, 46.205, 32.129, 46.21, 31.886, 46.32, 31.882, 46.279, 31.801,
  46.285, 31.767, 46.318, 31.8, 46.342, 31.968, 46.351, 32.054, 46.406, 32.008, 46.449, 31.749, 46.5, 31.69,
  46.479, 31.687, 46.43, 31.508, 46.588, 31.582, 46.545, 31.756, 46.554, 32.318, 46.464, 32.4, 46.478, 32.436,
  46.543, 32.646, 46.65, 32.336, 46.562, 32.248, 46.607, 32.146, 46.56, 32.118, 46.607, 32.023, 46.629, 31.94,
  46.759, 32.007, 46.915, 31.936, 46.955, 31.977, 47.009, 31.865, 47.026, 31.897, 47.093, 31.742, 47.259, 31.727,
  47.221, 31.806, 47.193, 31.816, 47.123, 31.874, 47.094, 31.837, 47.008, 31.947, 46.999, 31.899, 46.944, 31.968,
  46.937, 31.945, 46.86, 31.865, 46.807, 31.907, 46.738, 31.899, 46.65, 31.493, 46.629, 31.618, 46.813, 31.508,
  46.745, 31.441, 46.8, 31.506, 46.72, 31.416, 46.629, 31.338, 46.601, 31.16, 46.629, 30.791, 46.553, 30.755,
  46.516, 30.798, 46.446, 30.772, 46.396, 30.652, 46.345, 30.682, 46.3, 30.494, 46.08, 30.138, 45.82, 30.127,
  45.891, 30.095, 45.815, 29.991, 45.847, 29.953, 45.772, 29.926, 45.814, 29.932, 45.724, 29.888, 45.765, 29.802,
  45.737, 29.86, 45.669, 29.734, 45.614, 29.683, 45.697, 29.694, 45.781, 29.638, 45.826, 29.59, 45.559, 29.707,
  45.573, 29.606, 45.478, 29.641, 45.442, 29.672, 45.477, 29.755, 45.447, 29.728, 45.416, 29.755, 45.313, 29.709,
  45.223, 29.659, 45.216, 29.65, 45.346, 29.57, 45.395, 29.322, 45.444, 28.93, 45.279, 28.79, 45.321, 28.779,
  45.231, 28.577, 45.248, 28.33, 45.323, 28.286, 45.422, 28.202, 45.469, 28.271, 45.522, 28.502, 45.509, 28.498,
  45.559, 28.537, 45.58, 28.474, 45.658, 28.577, 45.762, 28.67, 45.777, 28.67, 45.812, 28.738, 45.838, 28.74,
  45.953, 28.957, 46.001, 28.939, 46.089, 29.015, 46.183, 28.934, 46.259, 28.946, 46.455, 29.184, 46.538, 29.201,
  46.357, 29.283, 46.397, 29.307, 46.472, 29.375, 46.416, 29.458, 46.485, 29.481, 46.425, 29.616, 46.362, 29.714,
  46.471, 29.828, 46.339, 30.081, 46.374, 30.132, 46.423, 29.902, 46.531, 29.95, 46.579, 29.928, 46.81, 29.559,
  46.946, 29.602, 47.061, 29.57, 47.091, 29.52, 47.06, 29.478, 47.112, 29.545, 47.136, 29.544, 47.234, 29.58,
  47.26, 29.557, 47.324, 29.481, 47.338, 29.41, 47.28, 29.233, 47.446, 29.156, 47.45, 29.117, 47.533, 29.239,
  47.756, 29.178, 47.79, 29.236, 47.871, 29.173, 47.891, 29.124, 47.976, 28.95, 47.935, 28.833, 48.025, 28.799,
  48.112, 28.574, 48.155, 28.519, 48.149, 28.48, 48.065, 28.412, 48.171, 28.317, 48.135, 28.358, 48.239, 28.217,
  48.208, 28.179, 48.259, 28.093, 48.237, 28.076, 48.315, 27.926, 48.339, 27.785, 48.442, 27.583, 48.486, 27.403,
  48.411, 27.342, 48.436, 27.209, 48.361, 27.037, 48.4, 27.033, 48.36, 26.943, 48.351, 26.832, 48.391, 26.778,
  48.366, 26.774, 48.287, 26.68, 48.33, 26.587, 48.249, 26.303, 48.212, 26.271, 48.094, 26.173, 47.993, 25.262,
  47.899, 25.08, 47.743, 24.897, 47.71, 24.542, 47.944, 24.409, 47.952, 24.231, 47.897, 24.009, 47.961, 23.855,
  47.934, 23.78, 47.988, 23.563, 48.006, 23.461, 47.971, 23.139, 48.098, 23.063, 48.007, 22.924, 48.005, 22.878,
  47.947, 22.832, 47.979, 22.855, 48.047, 22.801, 48.091, 22.605, 48.097, 22.481, 48.243, 22.357, 48.243, 22.299,
  48.349, 22.257, 48.357, 22.272, 48.403, 22.133, 48.405, 22.139, 48.57, 22.31, 48.682, 22.369, 48.856, 22.449,
  48.971, 22.521, 48.993, 22.54, 49.072, 22.867, 49.01, 22.841, 49.095, 22.682, 49.161, 22.738, 49.275, 22.641,
  49.529, 22.666, 49.567, 23.101, 49.957, 23.682, 50.368, 23.981, 50.405, 24.011, 50.493, 24.108, 50.541, 24.081,
  50.713, 23.958, 50.808, 24.143, 50.856, 23.979, 50.938, 23.912, 51.007, 23.864, 51.148, 23.635, 51.305, 23.698,
  51.404, 23.608, 51.511, 23.617, 51.625, 23.75, 51.644, 23.981, 51.586, 24.244, 51.718, 24.391, 51.88, 24.722,
  51.882, 25.138, 51.949, 25.768, 51.929, 26.408, 51.851, 26.446, 51.806, 26.666, 51.801, 26.855, 51.749, 27.151,
  51.757, 27.189, 51.664, 27.277, 51.651, 27.267, 51.587, 27.477, 51.624, 27.693, 51.589, 27.664, 51.493, 27.714,
  51.464, 27.793, 51.517, 27.831, 51.613, 28.071, 51.558, 28.21, 51.652, 28.334, 51.528, 28.461, 51.572, 28.604,
  51.554, 28.637, 51.45, 28.729, 51.401, 28.8, 51.533, 28.981, 51.569, 29.063, 51.631, 29.16, 51.603, 29.227,
  51.519, 29.228, 51.456, 29.32, 51.366, 29.466, 51.385, 29.638, 51.491, 29.829, 51.43, 30.149, 51.484, 30.32,
  51.402, 30.355, 51.305, 30.54, 51.235, 30.646, 51.367, 30.588, 51.427, 30.618, 51.467, 30.563, 51.522, 30.584,
  51.542, 30.523, 51.563, 30.515, 51.604, 30.742, 51.898, 30.941, 51.994, 30.919, 52.059, 31.096, 52.08, 31.229,
  52.038, 31.383, 52.117
]
const CRIMEA = [
  33.629, 46.125, 33.67, 46.218, 33.802, 46.203, 34.334, 46.07, 34.465, 45.955, 34.689, 45.974, 34.784, 45.899,
  34.81, 45.785, 35.002, 45.729, 35.332, 45.371, 35.481, 45.298, 35.716, 45.341, 35.833, 45.471, 35.986, 45.363,
  36.118, 45.457, 36.284, 45.477, 36.583, 45.427, 36.638, 45.351, 36.502, 45.347, 36.437, 45.272, 36.44, 45.067,
  35.848, 44.992, 35.706, 45.095, 35.506, 45.114, 35.408, 45.062, 35.435, 45.005, 35.367, 44.943, 35.256, 44.959,
  35.081, 44.794, 34.986, 44.84, 34.721, 44.811, 34.469, 44.73, 34.331, 44.545, 34.103, 44.425, 33.721, 44.4,
  33.372, 44.576, 33.572, 44.621, 33.516, 44.634, 33.516, 44.785, 33.62, 44.931, 33.537, 45.117, 33.396, 45.19,
  33.26, 45.156, 32.899, 45.354, 32.591, 45.32, 32.482, 45.409, 33.169, 45.784, 33.265, 45.754, 33.482, 45.854,
  33.692, 45.861, 33.694, 45.914, 33.777, 45.93, 33.62, 45.951
]

// ── Zones ──────────────────────────────────────────────────────────────────────────────────

/**
 * Each zone's season, by its score (reflectance, mean over the 10 km square: the change after the damage, less the
 * change between the two halves of the years before), windows a fortnight apart, 2026-11-16:
 *
 *  - Gaza Strip, mid-November: Gaza City 0.021 (the next window 0.018), Khan Younis 0.024 (early March 0.020),
 *    Rafah 0.013 (early March 0.014); the three together 0.058 against early March's 0.047. The first rains green
 *    the orchards and fields before the war; after it the land stays bare.
 *  - West Bank, late February: Jenin 0.016 and Tulkarm 0.014, autumn at most 0.014 and 0.011. Little shows at this
 *    scale (Jenin's camp is a few hundred metres across, in a 10 km square), but the loop compares like with like.
 *  - Lebanon, late October: Beirut 0.0096 and Bint Jbeil 0.0091, 0.019 together (mid-November 0.016, Bint Jbeil's
 *    best, mid-April, 0.0095 but Beirut's 0.0005).
 *  - Ukraine, late July: the score is flat (Bakhmut 0.001–0.008, Mariupol 0.003–0.010 through the year), and
 *    spring's slight lead comes from its window running from bare March fields to green June ones. By eye (Bakhmut
 *    rendered in spring, summer and autumn): in summer the harvested patchwork before the war becomes one fallow
 *    brown, the change at its plainest.
 */
export const SEASON_REGIONS: readonly SeasonRegion[] = [
  { name: 'Gaza Strip', season: 'autumn', day: 315, rings: [GAZA] },
  { name: 'West Bank', season: 'winter', day: 52, rings: [WEST_BANK] },
  { name: 'Ukraine', season: 'summer', day: 205, rings: [UKRAINE, CRIMEA] },
  { name: 'Lebanon', season: 'autumn', day: 300, rings: [LEBANON] },
]

/** Is the point inside the ring (even–odd rule)? */
function inRing(lon: number, lat: number, r: readonly number[]): boolean {
  let inside = false
  for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
    const x1 = r[i]
    const y1 = r[i + 1]
    const x2 = r[j]
    const y2 = r[j + 1]
    if (y1 > lat !== y2 > lat && lon < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1) inside = !inside
  }
  return inside
}

/** Distance from the point to the ring's edge, km (flat at the point's latitude: right to a few metres at this range). */
function kmToRing(lon: number, lat: number, r: readonly number[]): number {
  const k = Math.cos((lat * Math.PI) / 180)
  const px = lon * k
  let best = Infinity
  for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
    const ax = r[j] * k
    const ay = r[j + 1]
    const dx = r[i] * k - ax
    const dy = r[i + 1] - ay
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (lat - ay) * dy) / (dx * dx + dy * dy || 1)))
    best = Math.min(best, Math.hypot(px - ax - t * dx, lat - ay - t * dy))
  }
  return best * KM_PER_DEG
}

/** The war zone a place is in (or within NEAR_KM of), if any. */
function warZoneAt(place: LatLon): SeasonRegion | undefined {
  const { lon, lat } = place
  return (
    SEASON_REGIONS.find((z) => z.rings.some((r) => inRing(lon, lat, r))) ??
    SEASON_REGIONS.find((z) => z.rings.some((r) => kmToRing(lon, lat, r) <= NEAR_KM))
  )
}

// ── Glaciers ───────────────────────────────────────────────────────────────────────────────

/**
 * The glaciers' season, by hemisphere: the window in which seasonal snow hides the least of the ice, so a year's
 * frame shows where the ice itself ends (owner, 2026-11-16: "the same time of year where you can see the ice melt
 * over the years the most"). The score is the tile's snow-and-ice share (the archive's `s2:snow_ice_percentage`)
 * on each year's least cloudy scene in the window, the scene this app would take, averaged over the years
 * (Sentinel-2, 2015–2026, windows a fortnight apart, 2026-11-16). The glacier itself is in every tile, so what moves
 * the score is the snow round it:
 *
 *  - North, mid-August: ten glaciers (Columbia, Alsek, Yakutat, Mendenhall, Breiðamerkurjökull, Aletsch,
 *    Jakobshavn, Athabasca, Nathorstbreen, Khumbu) 27.4 %, a flat floor from mid-August (27.4) to late September
 *    (27.6) against 61 % in spring; every glacier has a frame in all 11 years. Mid-August keeps late September's
 *    first snows, and the lakes' first ice, at the window's far edge.
 *  - South, mid-February: five (Perito Moreno, Upsala, San Quintín, Grey, Tasman) 13.0 %, rising every fortnight
 *    after (14.1 in early March, 30.5 in late August). The window may not cross New Year, so it can begin no earlier.
 *  - Between the tropics the seasons are wet and dry, not snow and thaw, and the turning seasons stay.
 */
export const GLACIER_SEASONS: { readonly north: SeasonRegion; readonly south: SeasonRegion } = {
  north: { name: 'Glaciers, north', season: 'summer', day: 227, rings: [] },
  south: { name: 'Glaciers, south', season: 'summer', day: 45, rings: [] },
}

/** Glaciers this close to the Equator keep the turning seasons. */
export const TROPIC_LAT = 23.44
/** Everything south of this is Antarctica's ice, which Natural Earth's glaciers leave out. */
export const ANTARCTIC_LAT = -60

let glacierRows: Map<number, Int32Array> | undefined

/** Row → [start, end, start, end, …] of its set cells (glaciers.ts), decoded on first use. */
function glacierGrid(): Map<number, Int32Array> {
  if (glacierRows) return glacierRows
  glacierRows = new Map()
  let row = 0
  for (const line of GLACIER_ROWS.split(';')) {
    const n = line.split(',').map((t) => parseInt(t, 36))
    row += n[0]
    const runs = new Int32Array(n.length - 1)
    for (let i = 1, end = 0; i < n.length; i += 2) {
      runs[i - 1] = end + n[i]
      end = runs[i] = runs[i - 1] + n[i + 1]
    }
    glacierRows.set(row, runs)
  }
  return glacierRows
}

/** Does the place's 10 km square hold glacier ice (to the grid's 0.1°)? */
export function hasGlacier(place: LatLon): boolean {
  if (place.lat <= ANTARCTIC_LAT) return true
  const row = Math.floor((90 - place.lat) / GLACIER_CELL)
  const col = Math.floor(((((place.lon + 180) % 360) + 360) % 360) / GLACIER_CELL)
  const runs = glacierGrid().get(row)
  if (!runs) return false
  for (let i = 0; i < runs.length; i += 2) if (col >= runs[i] && col < runs[i + 1]) return true
  return false
}

/** The glaciers' season for a place with ice in its square, outside the tropics. */
function glacierSeasonAt(place: LatLon): SeasonRegion | undefined {
  if (Math.abs(place.lat) < TROPIC_LAT || !hasGlacier(place)) return undefined
  return place.lat > 0 ? GLACIER_SEASONS.north : GLACIER_SEASONS.south
}

/** The one season every year of a place's time-lapse keeps: its war zone's, else its glaciers', else none. */
export function seasonRegionAt(place: LatLon): SeasonRegion | undefined {
  return warZoneAt(place) ?? glacierSeasonAt(place)
}
