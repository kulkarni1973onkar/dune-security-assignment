export function pct(part: number, total: number): number {
  if (!total) return 0;
  return (part / total) * 100;
}

export function clamp(n: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, n));
}

export function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

/** Build stacked bar parts [{widthPct, label}] from { optionId,count }[] */
export function stacked(parts: { optionId: string; count: number }[]) {
  const total = parts.reduce((s, p) => s + p.count, 0);
  return parts.map((p) => ({
    optionId: p.optionId,
    count: p.count,
    widthPct: pct(p.count, total),
  }));
}
