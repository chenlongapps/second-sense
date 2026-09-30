import { describe, expect, it } from "vitest";
import { GameAudio, scoreToSound } from "../../src/audio/synth";

describe("scoreToSound", () => {
  it("maps scores to legacy cues", () => {
    expect(scoreToSound(100)).toBe("perfect");
    expect(scoreToSound(85)).toBe("good");
    expect(scoreToSound(40)).toBe("result");
  });
});

describe("GameAudio preference", () => {
  it("defaults to on and round-trips off", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
    expect(GameAudio.loadPreference(storage)).toBe(true);
    GameAudio.savePreference(storage, false);
    expect(GameAudio.loadPreference(storage)).toBe(false);
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
    expect(GameAudio.loadPreference(broken)).toBe(true);
    expect(() => GameAudio.savePreference(broken, false)).not.toThrow();
  });
});
