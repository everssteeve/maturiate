/**
 * Returns Tailwind CSS classes for background and text based on a maturity score.
 * Level 1 (< 1.75): red/orange
 * Level 2 (>= 1.75, < 2.5): amber/yellow
 * Level 3 (>= 2.5, < 3.25): emerald/green
 * Level 4 (>= 3.25): green dark
 */
export function getLevelColor(score: number): { bg: string; text: string } {
  if (score >= 3.25) {
    return { bg: "bg-emerald-600", text: "text-white" };
  }
  if (score >= 2.5) {
    return { bg: "bg-emerald-100", text: "text-emerald-800" };
  }
  if (score >= 1.75) {
    return { bg: "bg-amber-100", text: "text-amber-800" };
  }
  return { bg: "bg-red-100", text: "text-red-800" };
}
