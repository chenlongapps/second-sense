import type { EasterEggKind } from "../game/result";

/** 支持的界面语言代码。 */
export const LOCALES = ["zh-CN", "zh-TW", "en", "ja", "ko", "es"] as const;

export type Locale = (typeof LOCALES)[number];

/** 未匹配到浏览器语言时使用的语言。 */
export const FALLBACK_LOCALE: Locale = "en";

/** 彩蛋文案；messages 的顺序即轮换顺序，各语言条数保持一致。 */
export type EasterEggCopy = Record<EasterEggKind, { title: string; messages: string[] }>;

/**
 * 一门语言需要提供的全部文案。
 * 占位符写成 `{name}`，`translate` 会用传入的参数替换。
 */
export interface Messages {
  meta: { title: string; description: string };
  brand: { label: string };
  locale: { current: string; menu: string };
  sound: {
    labelOn: string;
    labelOff: string;
    labelUnavailable: string;
    ariaOn: string;
    ariaOff: string;
    ariaUnavailable: string;
  };
  intro: { heading: string };
  target: { label: string; groupLabel: string; option: string };
  status: { ready: string; running: string; done: string; cheating: string };
  display: {
    labelTarget: string;
    labelTargetSeconds: string;
    labelActual: string;
    seconds: string;
    ariaHidden: string;
  };
  caption: { idle: string; running: string; finished: string; cheat: string };
  action: {
    glyphGo: string;
    glyphStop: string;
    labelIdle: string;
    labelStop: string;
    labelAgain: string;
  };
  keyboard: { hint: string };
  history: {
    title: string;
    empty: string;
    target: string;
    actual: string;
    diffExact: string;
    diffEarly: string;
    diffLate: string;
  };
  notice: { tooLong: string; hidden: string };
  victory: { hint: string };
  machine: { label: string };
  easterEggs: EasterEggCopy;
}

/** 递归取出一条文案的完整键名，例如 `status.ready`。 */
type LeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends readonly unknown[]
      ? never
      : `${K}.${LeafPaths<T[K]>}`;
}[keyof T & string];

export type MessageKey = LeafPaths<Messages>;

/** 文案里可替换的占位符参数。 */
export type MessageParams = Record<string, string | number>;
