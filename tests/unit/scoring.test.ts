import { describe, expect, it } from "vitest";
import {
  calculateScore,
  formatSignedError,
  getAccuracyPosition,
  getTimingText,
  getVerdict,
} from "../../src/game/scoring";

describe("calculateScore", () => {
  it("gives 100 for a perfect stop", () => {
    expect(calculateScore(0, 5)).toBe(100);
  });

  it("scales linearly with relative error", () => {
    // 0.1s error on a 5s target: 100 - (0.1/5)*500 = 90
    expect(calculateScore(0.1, 5)).toBe(90);
    expect(calculateScore(0.2, 10)).toBe(90);
  });

  it("floors at zero for large errors", () => {
    expect(calculateScore(5, 5)).toBe(0);
    expect(calculateScore(60, 5)).toBe(0);
  });

  it("rejects invalid input", () => {
    expect(calculateScore(Number.NaN, 5)).toBe(0);
    expect(calculateScore(0.1, 0)).toBe(0);
  });
});

describe("getVerdict", () => {
  it("matches legacy thresholds", () => {
    expect(getVerdict(100)).toBe("时间感满分！");
    expect(getVerdict(96)).toBe("精准得惊人");
    expect(getVerdict(80)).toBe("很有默契");
    expect(getVerdict(50)).toBe("越来越接近");
    expect(getVerdict(49)).toBe("再找找节奏");
  });
});

describe("getTimingText", () => {
  it("treats sub-5ms error as exact", () => {
    expect(getTimingText(0.004)).toBe("刚刚好");
    expect(getTimingText(-0.004)).toBe("刚刚好");
  });

  it("distinguishes early and late stops", () => {
    expect(getTimingText(-0.2)).toBe("停早了一点");
    expect(getTimingText(0.2)).toBe("停晚了一点");
  });
});

describe("getAccuracyPosition", () => {
  it("centers exact stops", () => {
    expect(getAccuracyPosition(0, 5)).toBe(50);
  });

  it("clamps extreme errors", () => {
    expect(getAccuracyPosition(-10, 5)).toBe(0);
    expect(getAccuracyPosition(10, 5)).toBe(100);
  });
});

describe("formatSignedError", () => {
  it("uses ASCII plus and CJK minus like the legacy UI", () => {
    expect(formatSignedError(0.1234)).toBe("+0.123 s");
    expect(formatSignedError(-0.1234)).toBe("−0.123 s");
  });
});
