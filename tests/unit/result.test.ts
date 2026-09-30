import { describe, expect, it, vi } from "vitest";
import {
  classifyResult,
  getEasterEgg,
  resetTeaseRotation,
  TEASE_DEVIATION_PERCENT,
} from "../../src/game/result";

describe.each([3, 5, 10])("results for a %i second target", (target) => {
  it("celebrates the selected target, not an arbitrary whole second", () => {
    expect(classifyResult(target, target)).toBe("perfect");
    expect(classifyResult(target, target - 1)).not.toBe("perfect");
    expect(classifyResult(target, target + 1)).not.toBe("perfect");
  });

  it.each([-1, 1])("recognizes near misses in direction %i", (direction) => {
    expect(classifyResult(target, target + direction * 0.01)).toBe("near-one");
    expect(classifyResult(target, target + direction * 0.02)).toBe("near-two");
    expect(classifyResult(target, target + direction * 0.03)).toBeUndefined();
  });

  it("uses the displayed centisecond precision at rounding boundaries", () => {
    expect(classifyResult(target, target - 0.005)).toBe("perfect");
    expect(classifyResult(target, target + 0.004)).toBe("perfect");
    expect(classifyResult(target, target + 0.005)).toBe("near-one");
    expect(classifyResult(target, target + 0.015)).toBe("near-two");
    expect(classifyResult(target, target + 0.025)).toBeUndefined();
  });

  it("reserves extreme early feedback for less than 20 percent of the target", () => {
    expect(classifyResult(target, 0)).toBe("too-early");
    expect(classifyResult(target, target / 5 - 0.01)).toBe("too-early");
    expect(classifyResult(target, target / 5)).toBe("wild");
  });

  it("reserves extreme late feedback for at least twice the target", () => {
    expect(classifyResult(target, target * 2 - 0.01)).toBe("wild");
    expect(classifyResult(target, target * 2)).toBe("too-late");
    expect(classifyResult(target, target * 3)).toBe("too-late");
  });

  it(`starts general teasing at a ${TEASE_DEVIATION_PERCENT} percent deviation in either direction`, () => {
    // 误差再小一点仍然是普通结果：精准与近失档优先，10% 以内不开嘲讽。
    const insideEarly = target - target * (TEASE_DEVIATION_PERCENT / 100) + 0.01;
    expect(classifyResult(target, insideEarly)).toBeUndefined();
    expect(classifyResult(target, insideEarly - 0.01)).toBe("wild");

    const insideLate = target + target * (TEASE_DEVIATION_PERCENT / 100) - 0.01;
    expect(classifyResult(target, insideLate)).toBeUndefined();
    expect(classifyResult(target, insideLate + 0.01)).toBe("wild");
  });

  it("keeps teasing within the wild tier up to the extreme edges", () => {
    expect(classifyResult(target, target * 0.35)).toBe("wild");
    expect(classifyResult(target, target * 1.95)).toBe("wild");
  });
});

describe("getEasterEgg", () => {
  it("returns a title and randomly selected message within the matching tier", () => {
    const first = getEasterEgg(5, 5, () => 0);
    const middle = getEasterEgg(5, 5, () => 0.5);
    const last = getEasterEgg(5, 5, () => 0.999);
    expect(first).toEqual({
      kind: "perfect",
      title: "时间掌控者",
      message: "你是不是偷偷看表了？",
    });
    expect(middle?.title).toBe(first?.title);
    expect(last?.kind).toBe(first?.kind);
    expect(new Set([first?.message, middle?.message, last?.message]).size).toBe(3);
  });

  it.each([
    [4.99, "near-one", "只差一丝"],
    [5.02, "near-two", "擦肩而过"],
    [0.5, "too-early", "光速下班"],
    [10, "too-late", "超长待机"],
    [2.5, "wild", "秒感已离线"],
  ])("returns matching feedback for %f seconds", (actual, kind, title) => {
    resetTeaseRotation();
    expect(getEasterEgg(5, Number(actual), () => 0)).toMatchObject({ kind, title });
  });

  it("does not select a message for an ordinary result", () => {
    const random = vi.fn(() => 0);
    expect(getEasterEgg(5, 4.6, random)).toBeUndefined();
    expect(random).not.toHaveBeenCalled();
  });
});

describe("teasing rotation", () => {
  const teasing = [
    [4.2, "wild"],
    [10.4, "too-late"],
    [0.5, "too-early"],
  ] as const;

  it.each(teasing)("cycles through every message before repeating (%s)", (actual, kind) => {
    resetTeaseRotation();
    const messages = new Set<string>();
    for (let round = 0; round < 8; round += 1) {
      messages.add(getEasterEgg(5, actual, () => 0)!.message);
    }
    expect(messages.size).toBe(8);
    resetTeaseRotation();
    for (let round = 0; round < 9; round += 1) {
      expect(getEasterEgg(5, actual, () => 0)!.kind).toBe(kind);
    }
  });

  it("starts from a random message, then advances without repeats", () => {
    resetTeaseRotation();
    const first = getEasterEgg(5, 4.2, () => 0.5)!.message;
    const second = getEasterEgg(5, 4.2, () => 0.999)!.message;
    const third = getEasterEgg(5, 4.2, () => 0)!.message;
    expect(new Set([first, second, third]).size).toBe(3);
  });

  it("keeps the praise tiers random instead of rotating", () => {
    const messages = new Set<string>();
    for (let i = 0; i < 12; i += 1) messages.add(getEasterEgg(5, 5, () => i / 12)!.message);
    expect(messages.size).toBe(3);
  });
});
