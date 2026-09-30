export type SoundName = "select" | "start" | "stop";

type Cue = [frequency: number, offsetSeconds: number, durationSeconds: number, volume: number];

const CUES: Record<SoundName, Cue[]> = {
  select: [[720, 0, 0.045, 0.035]],
  start: [
    [392, 0, 0.055, 0.045],
    [784, 0.06, 0.075, 0.045],
  ],
  stop: [[220, 0, 0.045, 0.04]],
};

const STORAGE_KEY = "second-sense-sound";

export interface SoundToggleElements {
  toggle: HTMLButtonElement;
  label: HTMLElement;
}

export class GameAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private generation = 0;
  private voices = new Set<OscillatorNode>();
  enabled: boolean;

  constructor(
    private readonly AudioContextClass: typeof AudioContext | undefined,
    initialEnabled: boolean,
  ) {
    this.enabled = initialEnabled;
  }

  static loadPreference(storage: Pick<Storage, "getItem"> | undefined): boolean {
    try {
      return storage?.getItem(STORAGE_KEY) !== "off";
    } catch {
      return true;
    }
  }

  static savePreference(storage: Pick<Storage, "setItem"> | undefined, enabled: boolean): void {
    try {
      storage?.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      // Sound preference must never interrupt the game.
    }
  }

  updateToggle({ toggle, label }: SoundToggleElements): void {
    const on = this.enabled && !!this.AudioContextClass;
    toggle.setAttribute("aria-pressed", String(on));
    toggle.setAttribute(
      "aria-label",
      !this.AudioContextClass
        ? "当前浏览器不支持音效"
        : on
          ? "音效已开启，点击静音"
          : "音效已关闭，点击开启",
    );
    label.textContent = !this.AudioContextClass ? "音效不可用" : on ? "音效 开" : "音效 关";
    toggle.classList.toggle("muted", !on);
    toggle.disabled = !this.AudioContextClass;
  }

  silence(): void {
    this.generation += 1;
    for (const oscillator of this.voices) {
      try {
        oscillator.stop();
      } catch {
        // Already stopped.
      }
    }
    this.voices.clear();
  }

  play(name: SoundName): void {
    this.silence();
    if (!this.enabled || !this.AudioContextClass) return;
    try {
      if (!this.context) {
        this.context = new this.AudioContextClass();
        this.master = this.context.createGain();
        this.master.gain.value = 0.65;
        this.master.connect(this.context.destination);
      }
      const currentGeneration = this.generation;
      const context = this.context;
      const master = this.master;
      if (!context || !master) return;
      const schedule = () => {
        if (!this.enabled || currentGeneration !== this.generation || context.state !== "running") {
          return;
        }
        const notes = CUES[name];
        if (!notes) return;
        const now = context.currentTime;
        for (const [frequency, offset, duration, volume] of notes) {
          const oscillator = context.createOscillator();
          const envelope = context.createGain();
          const start = now + offset;
          oscillator.type = "square";
          oscillator.frequency.value = frequency;
          envelope.gain.setValueAtTime(0, start);
          envelope.gain.linearRampToValueAtTime(volume, start + 0.004);
          envelope.gain.setValueAtTime(volume, start + duration * 0.65);
          envelope.gain.linearRampToValueAtTime(0, start + duration);
          oscillator.connect(envelope);
          envelope.connect(master);
          this.voices.add(oscillator);
          oscillator.onended = () => {
            this.voices.delete(oscillator);
            oscillator.disconnect();
            envelope.disconnect();
          };
          oscillator.start(start);
          oscillator.stop(start + duration + 0.01);
        }
      };
      if (context.state === "running") schedule();
      else
        context
          .resume()
          .then(schedule)
          .catch(() => {});
    } catch {
      // Audio availability must never interrupt the game.
    }
  }
}
