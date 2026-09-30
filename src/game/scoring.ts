export const MAX_ROUND_SECONDS = 60;
export const SUPPORTED_TARGETS = [3, 5, 10] as const;
export type SupportedTarget = (typeof SUPPORTED_TARGETS)[number];

export function calculateScore(errorSeconds: number, targetSeconds: number): number {
  if (!Number.isFinite(errorSeconds) || !Number.isFinite(targetSeconds) || targetSeconds <= 0) {
    return 0;
  }
  const error = Math.abs(errorSeconds);
  return Math.max(0, Math.round(100 - (error / targetSeconds) * 500));
}

export function getVerdict(score: number): string {
  if (score === 100) return "时间感满分！";
  if (score >= 95) return "精准得惊人";
  if (score >= 80) return "很有默契";
  if (score >= 50) return "越来越接近";
  return "再找找节奏";
}

export function getTimingText(signedErrorSeconds: number): string {
  const error = Math.abs(signedErrorSeconds);
  if (error < 0.005) return "刚刚好";
  return signedErrorSeconds < 0 ? "停早了一点" : "停晚了一点";
}

export function getAccuracyPosition(signedErrorSeconds: number, targetSeconds: number): number {
  if (
    !Number.isFinite(signedErrorSeconds) ||
    !Number.isFinite(targetSeconds) ||
    targetSeconds <= 0
  ) {
    return 50;
  }
  const position = 50 + (signedErrorSeconds / targetSeconds) * 250;
  return Math.max(0, Math.min(100, position));
}

export function formatSignedError(signedErrorSeconds: number): string {
  const sign = signedErrorSeconds >= 0 ? "+" : "−";
  return `${sign}${Math.abs(signedErrorSeconds).toFixed(3)} s`;
}
