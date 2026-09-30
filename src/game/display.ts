import { formatSeconds, toCentiseconds } from "./time";

export const SEGMENTS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abdeg",
  "3": "abcdg",
  "4": "bcfg",
  "5": "acdfg",
  "6": "acdefg",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
  "-": "g",
};

const SEGMENT_ORDER = ["a", "b", "c", "d", "e", "f", "g"] as const;

export function splitDisplayValues(seconds: number, hidden = false): [string, string, string] {
  if (hidden) return ["--", "--", "--"];
  const centiseconds = toCentiseconds(seconds);
  const minutes = String(Math.floor(centiseconds / 6000)).padStart(2, "0");
  const secs = String(Math.floor(centiseconds / 100) % 60).padStart(2, "0");
  const cs = String(centiseconds % 100).padStart(2, "0");
  return [minutes, secs, cs];
}

export function renderDigit(digit: string): string {
  const active = SEGMENTS[digit] ?? "";
  const segs = SEGMENT_ORDER.map(
    (seg) => `<i class="seg ${seg}${active.includes(seg) ? " on" : ""}"></i>`,
  ).join("");
  return `<span class="digit">${segs}</span>`;
}

export function renderDisplayHtml(seconds: number, hidden = false): string {
  return splitDisplayValues(seconds, hidden)
    .map((value) => `<span class="digit-group">${[...value].map(renderDigit).join("")}</span>`)
    .join('<span class="display-colon"><i></i><i></i></span>');
}

export function displayAriaLabel(seconds: number, hidden = false): string {
  if (hidden) return "计时中，时间已隐藏";
  return `${formatSeconds(seconds)} 秒`;
}
