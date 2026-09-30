import { describe, expect, it } from "vitest";
import {
  advanceCheatStreak,
  CHEAT_CLICKS,
  CHEAT_WINDOW_MS,
  emptyCheatStreak,
  isCheatTriggered,
  type CheatStreak,
} from "../../src/game/cheat";

function clickTimes(start: CheatStreak, seconds: number, count: number, gapMs = 100): CheatStreak {
  let now = 1000;
  let current = start;
  for (let i = 0; i < count; i += 1) {
    current = advanceCheatStreak(current, seconds, now);
    now += gapMs;
  }
  return current;
}

describe("advanceCheatStreak", () => {
  it("counts clicks on the same target inside the window", () => {
    const streak = clickTimes(emptyCheatStreak(), 5, CHEAT_CLICKS - 1);
    expect(streak.count).toBe(CHEAT_CLICKS - 1);
    expect(streak.seconds).toBe(5);
    expect(isCheatTriggered(streak)).toBe(false);
  });

  it("triggers on the fifth consecutive click", () => {
    const streak = clickTimes(emptyCheatStreak(), 5, CHEAT_CLICKS);
    expect(streak.count).toBe(CHEAT_CLICKS);
    expect(isCheatTriggered(streak)).toBe(true);
  });

  it("restarts the count when the target changes", () => {
    let streak = clickTimes(emptyCheatStreak(), 5, CHEAT_CLICKS - 1);
    streak = advanceCheatStreak(streak, 10, streak.lastAt + 100);
    expect(streak.seconds).toBe(10);
    expect(streak.count).toBe(1);
  });

  it("restarts the count after the window expires", () => {
    let streak = clickTimes(emptyCheatStreak(), 5, CHEAT_CLICKS - 1);
    streak = advanceCheatStreak(streak, 5, streak.lastAt + CHEAT_WINDOW_MS + 1);
    expect(streak.count).toBe(1);
  });

  it("keeps counting exactly on the window edge", () => {
    let streak = clickTimes(emptyCheatStreak(), 5, 2);
    streak = advanceCheatStreak(streak, 5, streak.lastAt + CHEAT_WINDOW_MS);
    expect(streak.count).toBe(3);
  });

  it("resets back to an empty streak", () => {
    const streak = clickTimes(emptyCheatStreak(), 5, CHEAT_CLICKS);
    expect(emptyCheatStreak().count).toBe(0);
    expect(isCheatTriggered(emptyCheatStreak())).toBe(false);
    expect(streak.count).toBe(CHEAT_CLICKS);
  });
});
