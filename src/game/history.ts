import { t } from "../i18n";
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
  if (diff === 0) return t("history.diffExact");
  const abs = (Math.abs(diff) / 100).toFixed(2);
  return diff < 0 ? t("history.diffEarly", { value: abs }) : t("history.diffLate", { value: abs });
}

/** 只带数值和单位的用时，历史记录和庆祝浮层都用它。 */
export function formatActualText(actual: number): string {
  return t("display.seconds", { value: formatSeconds(actual) });
}

export function diffKind(target: number, actual: number): "early" | "late" | "exact" {
  const diff = diffCentiseconds(target, actual);
  if (diff === 0) return "exact";
  return diff < 0 ? "early" : "late";
}
