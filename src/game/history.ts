import { diffCentiseconds, formatSeconds } from "./time";

export interface HistoryEntry {
  target: number;
  actual: number;
}

export const MAX_HISTORY = 5;

export function addHistoryEntry(list: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [entry, ...list].slice(0, MAX_HISTORY);
}

export function formatDiffText(target: number, actual: number): string {
  const diff = diffCentiseconds(target, actual);
  if (diff === 0) return "刚刚好";
  const abs = (Math.abs(diff) / 100).toFixed(2);
  return diff < 0 ? `提前 ${abs} 秒` : `超出 ${abs} 秒`;
}

export function formatActualText(actual: number): string {
  return `${formatSeconds(actual)} 秒`;
}

export function diffKind(target: number, actual: number): "early" | "late" | "exact" {
  const diff = diffCentiseconds(target, actual);
  if (diff === 0) return "exact";
  return diff < 0 ? "early" : "late";
}
