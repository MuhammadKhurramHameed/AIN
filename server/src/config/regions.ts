export const PAKISTAN_REGIONS = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
] as const;

export type PakistanRegion = (typeof PAKISTAN_REGIONS)[number];

// Rough population-share weighting, used only to make seeded demo data look plausible.
const REGION_WEIGHTS: [PakistanRegion, number][] = [
  ["Punjab", 52],
  ["Sindh", 23],
  ["Khyber Pakhtunkhwa", 12],
  ["Balochistan", 6],
  ["Azad Jammu & Kashmir", 3],
  ["Islamabad Capital Territory", 2],
  ["Gilgit-Baltistan", 2],
];
const TOTAL_WEIGHT = REGION_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);

export function pickWeightedRegion(): PakistanRegion {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const [region, weight] of REGION_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) return region;
  }
  return REGION_WEIGHTS[0][0];
}
