/** 连续点击同一个目标按钮这么多次就触发外挂局。 */
export const CHEAT_CLICKS = 5;

/** 相邻两次点击超过这个间隔（毫秒）就重新计数。 */
export const CHEAT_WINDOW_MS = 1000;

export interface CheatStreak {
  /** 连点中的目标秒数；未开始时为 NaN。 */
  seconds: number;
  /** 窗口内的连续点击次数。 */
  count: number;
  /** 最近一次点击的时间戳，单位毫秒。 */
  lastAt: number;
}

export function emptyCheatStreak(): CheatStreak {
  return { seconds: Number.NaN, count: 0, lastAt: 0 };
}

/**
 * 记录一次目标按钮点击并返回新的连点状态。
 * 换成其它目标、或者两次点击间隔太久，计数都会从 1 重新开始。
 */
export function advanceCheatStreak(
  streak: CheatStreak,
  seconds: number,
  now: number,
  windowMs: number = CHEAT_WINDOW_MS,
): CheatStreak {
  const sameTarget = streak.seconds === seconds;
  const withinWindow = now - streak.lastAt <= windowMs;
  return {
    seconds,
    count: sameTarget && withinWindow ? streak.count + 1 : 1,
    lastAt: now,
  };
}

/** 连点达到次数即触发外挂局。 */
export function isCheatTriggered(streak: CheatStreak): boolean {
  return streak.count >= CHEAT_CLICKS;
}
