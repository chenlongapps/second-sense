import { easterEggCopy, MESSAGES, type Locale } from "../i18n";
import { toCentiseconds } from "./time";

export type EasterEggKind = "perfect" | "near-one" | "near-two" | "too-early" | "too-late" | "wild";

export interface EasterEgg {
  kind: EasterEggKind;
  title: string;
  message: string;
}

/** 误差达到目标的这个百分比就开始调侃；精准和近失依旧优先。 */
export const TEASE_DEVIATION_PERCENT = 10;

/** 只有这三档会轮换文案，避免连续玩的时候重复同一句。 */
const ROTATING_KINDS: ReadonlySet<EasterEggKind> = new Set<EasterEggKind>([
  "too-early",
  "too-late",
  "wild",
]);

/** 每次刷新页面重新开始轮换；测试用它回到全新状态。 */
const rotationCursor: Partial<Record<EasterEggKind, number>> = {};

export function resetTeaseRotation(): void {
  delete rotationCursor["too-early"];
  delete rotationCursor["too-late"];
  delete rotationCursor.wild;
}

function pickMessage(kind: EasterEggKind, messages: string[], random: () => number): string {
  if (messages.length === 0) return "";
  if (!ROTATING_KINDS.has(kind)) {
    return messages[Math.floor(random() * messages.length) % messages.length]!;
  }
  const last = rotationCursor[kind];
  const index =
    last === undefined
      ? Math.floor(random() * messages.length) % messages.length
      : (last + 1) % messages.length;
  rotationCursor[kind] = index;
  return messages[index]!;
}

export function classifyResult(target: number, actual: number): EasterEggKind | undefined {
  const targetCs = toCentiseconds(target);
  const actualCs = toCentiseconds(actual);
  const difference = Math.abs(actualCs - targetCs);

  if (difference === 0) return "perfect";
  if (difference === 1) return "near-one";
  if (difference === 2) return "near-two";
  if (actualCs * 5 < targetCs) return "too-early";
  if (actualCs >= targetCs * 2) return "too-late";
  if (difference * 100 >= targetCs * TEASE_DEVIATION_PERCENT) return "wild";
  return undefined;
}

export function getEasterEgg(
  target: number,
  actual: number,
  random: () => number = Math.random,
): EasterEgg | undefined {
  const kind = classifyResult(target, actual);
  if (!kind) return undefined;
  const { title, messages } = easterEggCopy(kind);
  return { kind, title, message: pickMessage(kind, messages, random) };
}

/**
 * 切换语言时保留同一句彩蛋：按当前语言里的下标换一套文案。
 * 各语言的候选条数一致，下标永远存在。
 */
export function localizeEasterEgg(egg: EasterEgg, locale: Locale): EasterEgg {
  const from = easterEggCopy(egg.kind);
  const to = MESSAGES[locale].easterEggs[egg.kind];
  const index = from.messages.indexOf(egg.message);
  const safeIndex = index < 0 ? 0 : Math.min(index, to.messages.length - 1);
  return { kind: egg.kind, title: to.title, message: to.messages[safeIndex]! };
}
