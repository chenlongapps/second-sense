import { beforeEach, describe, expect, it } from "vitest";
import {
  detectLocale,
  FALLBACK_LOCALE,
  getLocale,
  isLocale,
  loadLocalePreference,
  LOCALES,
  LOCALE_LABELS,
  MESSAGES,
  resolveLocale,
  saveLocalePreference,
  setLocale,
  t,
} from "../../src/i18n";
import { getEasterEgg, localizeEasterEgg, type EasterEggKind } from "../../src/game/result";

function leaves(value: unknown, prefix = ""): Array<[string, string]> {
  if (typeof value === "string") return [[prefix, value]];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => leaves(item, `${prefix}[${index}]`));
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

const KINDS: EasterEggKind[] = ["perfect", "near-one", "near-two", "too-early", "too-late", "wild"];

beforeEach(() => {
  setLocale("zh-CN");
});

describe("setLocale / t", () => {
  it("starts on the fallback language and follows setLocale", () => {
    expect(FALLBACK_LOCALE).toBe("en");
    setLocale("zh-CN");
    expect(getLocale()).toBe("zh-CN");
    expect(t("status.ready")).toBe("准备就绪");
    setLocale("en");
    expect(t("status.ready")).toBe("Ready");
    expect(t("caption.running")).toBe("Timing… stop by feel.");
  });

  it("replaces named placeholders and keeps unknown ones visible", () => {
    expect(t("history.target", { n: 10 })).toBe("目标 10 秒");
    expect(t("history.actual", { value: "5.00 秒" })).toBe("实际 5.00 秒");
    expect(t("history.target", {})).toBe("目标 {n} 秒");
    setLocale("en");
    expect(t("history.diffEarly", { value: "0.01" })).toBe("0.01s early");
  });
});

describe("resolveLocale", () => {
  it.each([
    ["zh-CN", "zh-CN"],
    ["zh-TW", "zh-TW"],
    ["zh", "zh-CN"],
    ["zh-Hans", "zh-CN"],
    ["zh-Hant", "zh-TW"],
    ["zh-HK", "zh-TW"],
    ["ZH-Hant-TW", "zh-TW"],
    ["zh_Hant_TW", "zh-TW"],
    ["en", "en"],
    ["en-US", "en"],
    ["EN", "en"],
    ["ja-JP", "ja"],
    ["ko-KR", "ko"],
    ["es-419", "es"],
    ["es", "es"],
    ["zh-Hans-CN-x", "zh-CN"],
    ["zh-x", "zh-CN"],
  ])("maps %s to %s", (preference, expected) => {
    expect(resolveLocale(preference)).toBe(expected);
  });

  it.each([undefined, "", "  ", "fr-FR", "de"])("rejects %s", (preference) => {
    expect(resolveLocale(preference)).toBeUndefined();
  });
});

describe("detectLocale", () => {
  it("takes the first supported preference", () => {
    expect(detectLocale(["fr-FR", "ja-JP", "en-GB"])).toBe("ja");
    expect(detectLocale(["ko", "zh-CN"])).toBe("ko");
    expect(detectLocale(["zh-TW"])).toBe("zh-TW");
  });

  it("falls back to English when nothing matches", () => {
    expect(detectLocale(["fr-FR", "de-AT"])).toBe("en");
    expect(detectLocale([])).toBe("en");
    expect(detectLocale(undefined)).toBe("en");
  });
});

describe("locale preference storage", () => {
  function createStorage(initial?: string) {
    const store = new Map<string, string>();
    if (initial !== undefined) store.set("second-sense-locale", initial);
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    };
  }

  it("round-trips a saved language", () => {
    const storage = createStorage();
    expect(loadLocalePreference(storage)).toBeUndefined();
    saveLocalePreference(storage, "ko");
    expect(loadLocalePreference(storage)).toBe("ko");
  });

  it("ignores unsupported or missing values", () => {
    expect(loadLocalePreference(createStorage("fr"))).toBeUndefined();
    expect(loadLocalePreference(createStorage(""))).toBeUndefined();
    expect(loadLocalePreference(undefined)).toBeUndefined();
  });

  it("never throws on broken storage", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadLocalePreference(broken)).toBeUndefined();
    expect(() => saveLocalePreference(broken, "zh-CN")).not.toThrow();
  });
});

describe("locale packs", () => {
  it("covers every supported language", () => {
    expect(LOCALES).toEqual(["zh-CN", "zh-TW", "en", "ja", "ko", "es"]);
    for (const locale of LOCALES) {
      expect(isLocale(locale)).toBe(true);
      expect(LOCALE_LABELS[locale]).not.toBe("");
    }
    expect(isLocale("fr")).toBe(false);
  });

  it("ships the same filled-in keys and placeholders everywhere", () => {
    const reference = new Map(leaves(MESSAGES["zh-CN"]));
    expect(reference.size).toBeGreaterThan(50);
    for (const locale of LOCALES) {
      const found = new Map(leaves(MESSAGES[locale]));
      expect([...found.keys()].sort(), locale).toEqual([...reference.keys()].sort());
      for (const [key, message] of found) {
        expect(message.trim(), `${locale} ${key}`).not.toBe("");
        expect(placeholders(message), `${locale} ${key}`).toEqual(
          placeholders(reference.get(key)!),
        );
      }
    }
  });

  it("keeps the same easter egg line-up in every language", () => {
    const reference = MESSAGES["zh-CN"].easterEggs;
    for (const locale of LOCALES) {
      const copy = MESSAGES[locale].easterEggs;
      expect(Object.keys(copy).sort(), locale).toEqual(Object.keys(reference).sort());
      for (const kind of KINDS) {
        expect(copy[kind].messages.length, `${locale} ${kind}`).toBe(
          reference[kind].messages.length,
        );
        expect(new Set(copy[kind].messages).size, `${locale} ${kind}`).toBe(
          copy[kind].messages.length,
        );
      }
    }
  });
});

describe("localizeEasterEgg", () => {
  it("keeps the same line while changing language", () => {
    const zh = getEasterEgg(5, 5, () => 0)!;
    expect(zh).toEqual({
      kind: "perfect",
      title: "时间掌控者",
      message: "你是不是偷偷看表了？",
    });
    expect(localizeEasterEgg(zh, "en")).toEqual({
      kind: "perfect",
      title: "Time Master",
      message: "Did you sneak a peek at the clock?",
    });
    const spanish = localizeEasterEgg(zh, "es");
    expect(spanish.title).toBe("Dueño del tiempo");
    expect(localizeEasterEgg(spanish, "zh-CN").message).toBe(zh.message);
  });

  it("falls back to the first line for a rotating tier", () => {
    const zh = getEasterEgg(5, 2.5, () => 0)!;
    expect(zh.kind).toBe("wild");
    const english = localizeEasterEgg(zh, "en");
    expect(english.message).toBe(MESSAGES.en.easterEggs.wild.messages[0]);
  });
});
