export function toCentiseconds(seconds: number): number {
  const value = Math.max(0, seconds) * 100;
  // Keep decimal half-centisecond boundaries stable despite floating-point noise.
  return Math.round(value + Number.EPSILON * Math.max(1, value));
}

export function diffCentiseconds(target: number, actual: number): number {
  return toCentiseconds(actual) - toCentiseconds(target);
}

export function formatSeconds(seconds: number): string {
  return (toCentiseconds(seconds) / 100).toFixed(2);
}
