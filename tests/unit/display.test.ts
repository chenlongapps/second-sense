import { describe, expect, it } from "vitest";
import {
  displayAriaLabel,
  renderDigit,
  renderDisplayHtml,
  splitDisplayValues,
} from "../../src/game/display";

describe("splitDisplayValues", () => {
  it("splits seconds into MM / SS / CC", () => {
    expect(splitDisplayValues(5)).toEqual(["00", "05", "00"]);
    expect(splitDisplayValues(65.23)).toEqual(["01", "05", "23"]);
  });

  it("hides values while running", () => {
    expect(splitDisplayValues(5, true)).toEqual(["--", "--", "--"]);
  });

  it("floors to centiseconds like the legacy renderer", () => {
    expect(splitDisplayValues(5.999)).toEqual(["00", "05", "99"]);
  });
});

describe("renderDigit", () => {
  it("lights the correct seven segments for 2", () => {
    const html = renderDigit("2");
    for (const seg of ["a", "b", "d", "e", "g"]) {
      expect(html).toContain(`seg ${seg} on`);
    }
    expect(html).not.toContain("seg c on");
    expect(html).not.toContain("seg f on");
  });
});

describe("renderDisplayHtml", () => {
  it("renders six digits and two colons", () => {
    const html = renderDisplayHtml(3);
    expect(html.match(/class="digit"/g)).toHaveLength(6);
    expect(html.match(/display-colon/g)).toHaveLength(2);
  });
});

describe("displayAriaLabel", () => {
  it("announces hidden time while running", () => {
    expect(displayAriaLabel(5, true)).toBe("计时中，时间已隐藏");
    expect(displayAriaLabel(5.234)).toBe("5.23 秒");
  });
});
