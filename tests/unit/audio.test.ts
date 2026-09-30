import { describe, expect, it, vi } from "vitest";
import { GameAudio, type SoundName } from "../../src/audio/synth";

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

function createAudioHarness(enabled = true) {
  const createOscillator = () => ({
    frequency: { value: 0 },
    type: "",
    onended: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  });
  const voices: ReturnType<typeof createOscillator>[] = [];
  const context = {
    state: "running",
    currentTime: 0,
    destination: {},
    createGain: () => ({
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
    createOscillator: () => {
      const voice = createOscillator();
      voices.push(voice);
      return voice;
    },
  };
  const AudioContextClass = vi.fn(function () {
    return context;
  });
  const audio = new GameAudio(AudioContextClass as unknown as typeof AudioContext, enabled);
  return { audio, voices, AudioContextClass };
}

describe("GameAudio result cues", () => {
  const cues: [SoundName, number[]][] = [
    ["victory", [523, 659, 784, 1047, 988, 1047, 1319, 1047]],
    ["near-one", [784, 1047]],
    ["near-two", [659]],
    ["tease", [294, 220, 147]],
  ];

  it.each(cues)("plays the %s cue", (name, frequencies) => {
    const { audio, voices } = createAudioHarness();
    audio.play(name);
    expect(voices.map((voice) => voice.frequency.value)).toEqual(frequencies);
    for (const voice of voices) {
      expect(voice.type).toBe("square");
      expect(voice.start).toHaveBeenCalledOnce();
      expect(voice.stop).toHaveBeenCalledOnce();
    }
  });

  it.each(cues)("does not play the %s cue while muted", (name) => {
    const { audio, voices, AudioContextClass } = createAudioHarness(false);
    audio.play(name);
    expect(voices).toHaveLength(0);
    expect(AudioContextClass).not.toHaveBeenCalled();
  });

  it("interrupts celebration audio when a new round starts", () => {
    const { audio, voices } = createAudioHarness();
    audio.play("victory");
    const celebrationVoices = [...voices];
    audio.play("start");
    for (const voice of celebrationVoices) {
      expect(voice.stop).toHaveBeenCalledTimes(2);
    }
    expect(voices).toHaveLength(10);
  });

  it("silences active celebration audio when muted", () => {
    const { audio, voices } = createAudioHarness();
    audio.play("victory");
    expect(voices).toHaveLength(8);
    audio.enabled = false;
    audio.silence();
    audio.play("near-one");
    expect(voices).toHaveLength(8);
    for (const voice of voices) {
      expect(voice.stop).toHaveBeenCalledTimes(2);
    }
  });

  it("keeps feedback usable without Web Audio support", () => {
    const audio = new GameAudio(undefined, true);
    for (const [name] of cues) {
      expect(() => audio.play(name)).not.toThrow();
    }
  });
});
