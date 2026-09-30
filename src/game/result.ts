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

const EASTER_EGGS: Record<EasterEggKind, { title: string; messages: string[] }> = {
  perfect: {
    title: "时间掌控者",
    messages: ["你是不是偷偷看表了？", "这一秒，宇宙都听你的。", "人类的外壳，原子钟的内核。"],
  },
  "near-one": {
    title: "只差一丝",
    messages: [
      "整秒就在指尖。",
      "差 0.01 秒，秒表都替你捏了把汗。",
      "就差这一点点，时间都想给你放水。",
    ],
  },
  "near-two": {
    title: "擦肩而过",
    messages: [
      "再来一次就拿下。",
      "差 0.02 秒，你已经摸到整秒的衣角了。",
      "整秒刚从你指缝里溜走。",
    ],
  },
  "too-early": {
    title: "光速下班",
    messages: [
      "刚开始就结束，你是来打卡的？",
      "开始键还没反应过来，你就下班了。",
      "你省略的不是时间，是整个游戏。",
      "这一局，你的手比脑子先下班了。",
      "秒针还没热身，你就已经冲线。",
      "目标正在蓄力，你先把灯关了。",
      "秒表需要一点心理准备时间。",
      "起跑线太香，怪不得你先冲。",
    ],
  },
  "too-late": {
    title: "超长待机",
    messages: [
      "你不是在读秒，你是在等外卖。",
      "秒表都下班了，你还在坚守岗位。",
      "目标都过了两遍，你还在等片尾彩蛋？",
      "你好像在和秒表比谁更有耐心。",
      "时间被你悄悄地拉长了一点点。",
      "秒针都绕完一圈了，你还在酝酿。",
      "再拖下去，下一局都要打哈欠了。",
      "目标早到了，你在等一个仪式感。",
    ],
  },
  wild: {
    title: "秒感已离线",
    messages: [
      "秒感？你这是随缘。",
      "你和目标之间，隔着一个时区。",
      "你的秒感建议恢复出厂设置。",
      "你和目标之间，差了整整一个节拍。",
      "这一下，秒感确实放假了。",
      "你按下的很像另一个目标。",
      "时间在你手里，弹性真好啊。",
      "凭感觉的话，这次感觉有点飘。",
    ],
  },
};

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
  const { title, messages } = EASTER_EGGS[kind];
  return { kind, title, message: pickMessage(kind, messages, random) };
}
