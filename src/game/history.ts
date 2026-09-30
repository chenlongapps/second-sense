export interface HistoryEntry {
  target: number;
  actual: number;
}

export const MAX_HISTORY = 5;

export function addHistoryEntry(list: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [entry, ...list].slice(0, MAX_HISTORY);
}

export function formatDiffText(target: number, actual: number): string {
  const diff = actual - target;
  if (diff.toFixed(2) === "0.00") return "刚刚好";
  const abs = Math.abs(diff).toFixed(2);
  return diff < 0 ? `提前 ${abs} 秒` : `超出 ${abs} 秒`;
}

export function formatActualText(actual: number): string {
  return `${actual.toFixed(2)} 秒`;
}

export function diffKind(target: number, actual: number): "early" | "late" | "exact" {
  const diff = actual - target;
  if (diff.toFixed(2) === "0.00") return "exact";
  return diff < 0 ? "early" : "late";
}
