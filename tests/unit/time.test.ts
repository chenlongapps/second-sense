import { describe, expect, it } from "vitest";
import { diffCentiseconds, formatSeconds, toCentiseconds } from "../../src/game/time";

describe("toCentiseconds", () => {
  it.each([
    [4.994, 499],
    [4.995, 500],
    [4.999, 500],
    [5.004, 500],
    [5.005, 501],
    [5.014, 501],
    [5.015, 502],
    [5.024, 502],
    [5.025, 503],
    [59.999, 6000],
  ])("rounds %f seconds to %i centiseconds", (seconds, expected) => {
    expect(toCentiseconds(seconds)).toBe(expected);
  });

  it("clamps negative time to zero", () => {
    expect(toCentiseconds(-1)).toBe(0);
    expect(toCentiseconds(0)).toBe(0);
  });
});

describe("diffCentiseconds", () => {
  it("compares the displayed times without negative zero", () => {
    expect(diffCentiseconds(5, 4.999)).toBe(0);
    expect(diffCentiseconds(5, 4.99)).toBe(-1);
    expect(diffCentiseconds(5, 5.01)).toBe(1);
    expect(diffCentiseconds(5, 5.015)).toBe(2);
  });
});

describe("formatSeconds", () => {
  it("formats the same rounded value as the display and result classifier", () => {
    expect(formatSeconds(4.999)).toBe("5.00");
    expect(formatSeconds(5.015)).toBe("5.02");
    expect(formatSeconds(-1)).toBe("0.00");
  });
});
