import { describe, expect, it } from "vitest";
import {
  addHistoryEntry,
  diffKind,
  formatActualText,
  formatDiffText,
  MAX_HISTORY,
} from "../../src/game/history";

describe("addHistoryEntry", () => {
  it("prepends newest entries first", () => {
    const list = addHistoryEntry([{ target: 5, actual: 4.87 }], { target: 3, actual: 3.06 });
    expect(list).toEqual([
      { target: 3, actual: 3.06 },
      { target: 5, actual: 4.87 },
    ]);
  });

  it("keeps at most five entries", () => {
    let list: { target: number; actual: number }[] = [];
    for (let i = 0; i < 7; i += 1) {
      list = addHistoryEntry(list, { target: 5, actual: 5 + i * 0.01 });
    }
    expect(list).toHaveLength(MAX_HISTORY);
    expect(list[0]).toEqual({ target: 5, actual: 5.06 });
  });
});

describe("formatDiffText", () => {
  it("describes early, late, and exact results", () => {
    expect(formatDiffText(5, 4.87)).toBe("提前 0.13 秒");
    expect(formatDiffText(3, 3.06)).toBe("超出 0.06 秒");
    expect(formatDiffText(5, 5.0)).toBe("刚刚好");
  });

  it("agrees with the rounded display, including small early misses", () => {
    expect(formatDiffText(5, 4.999)).toBe("刚刚好");
    expect(formatDiffText(5, 5.004)).toBe("刚刚好");
    expect(formatDiffText(5, 4.99)).toBe("提前 0.01 秒");
    expect(formatDiffText(5, 5.01)).toBe("超出 0.01 秒");
    expect(formatDiffText(5, 4.98)).toBe("提前 0.02 秒");
    expect(formatDiffText(5, 5.015)).toBe("超出 0.02 秒");
  });
});

describe("formatActualText", () => {
  it("formats the same rounded time as the display", () => {
    expect(formatActualText(4.999)).toBe("5.00 秒");
    expect(formatActualText(5.015)).toBe("5.02 秒");
  });
});

describe("diffKind", () => {
  it("returns early, late, or exact", () => {
    expect(diffKind(5, 4.87)).toBe("early");
    expect(diffKind(3, 3.06)).toBe("late");
    expect(diffKind(5, 5.0)).toBe("exact");
    expect(diffKind(5, 4.999)).toBe("exact");
    expect(diffKind(5, 5.004)).toBe("exact");
    expect(diffKind(5, 4.99)).toBe("early");
  });
});
