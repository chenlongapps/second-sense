import type { Messages } from "../types";

export const en: Messages = {
  meta: {
    title: "Second Sense · Pixel Stopwatch Challenge",
    description:
      "Red digital tubes, pixel buttons. Trust your feel for 3, 5 or 10 seconds and stop at the exact moment.",
  },
  brand: { label: "Second Sense home" },
  locale: {
    current: "Current language: {name}, click to switch",
    menu: "Language list",
  },
  sound: {
    labelOn: "Sound on",
    labelOff: "Sound off",
    labelUnavailable: "Sound unavailable",
    ariaOn: "Sound on, click to mute",
    ariaOff: "Sound off, click to enable",
    ariaUnavailable: "This browser does not support sound",
  },
  intro: { heading: "Stop at that one second — by feel." },
  target: { label: "Pick a target", groupLabel: "Pick a target duration", option: "{n}s" },
  status: {
    ready: "Ready",
    running: "Timing",
    done: "Round complete",
    cheating: "Auto-play timing",
  },
  display: {
    labelTarget: "Target time",
    labelTargetSeconds: "Target {n}s",
    labelActual: "Actual time",
    seconds: "{value}s",
    ariaHidden: "Timing — the time is hidden",
  },
  caption: {
    idle: "Click to start.",
    running: "Timing… stop by feel.",
    finished: "Round complete.",
    cheat: "Auto-play: the display runs live and stops on target.",
  },
  action: {
    glyphGo: "GO",
    glyphStop: "STOP",
    labelIdle: "Start the challenge",
    labelStop: "Stop timing",
    labelAgain: "Play again",
  },
  keyboard: { hint: "Space to start / stop" },
  history: {
    title: "Last 5 rounds",
    empty: "No rounds yet",
    target: "Target {n}s",
    actual: "Actual {value}",
    diffExact: "Exact",
    diffEarly: "{value}s early",
    diffLate: "{value}s late",
  },
  notice: { tooLong: "Over 60 seconds.", hidden: "Page switch — this round doesn't count." },
  victory: { hint: "Tap the screen / Space / Esc to skip" },
  machine: { label: "Stopwatch game" },
  easterEggs: {
    perfect: {
      title: "Time Master",
      messages: [
        "Did you sneak a peek at the clock?",
        "This one second, the whole universe obeys you.",
        "A human shell with an atomic clock inside.",
      ],
    },
    "near-one": {
      title: "A Hair Off",
      messages: [
        "The whole second is right at your fingertip.",
        "0.01 seconds off — even the stopwatch broke a sweat.",
        "So close that time itself wanted to let you win.",
      ],
    },
    "near-two": {
      title: "Just Missed It",
      messages: [
        "One more try and it is yours.",
        "0.02 seconds off — you already touched the whole second.",
        "The perfect second slipped through your fingers.",
      ],
    },
    "too-early": {
      title: "Lightspeed Clock-Out",
      messages: [
        "Started and finished at once — are you here to punch the clock?",
        "The start button had not reacted yet and you were already off duty.",
        "What you skipped was not the time, it was the whole game.",
        "This round, your hand clocked out before your brain.",
        "The second hand had not warmed up and you already crossed the line.",
        "The target was still charging and you cut the lights first.",
        "The stopwatch needs a moment to prepare itself.",
        "The starting line smells too good — no wonder you rushed.",
      ],
    },
    "too-late": {
      title: "Marathon Standby",
      messages: [
        "You are not reading seconds, you are waiting for takeout.",
        "The stopwatch clocked out and you are still on duty.",
        "The target passed twice and you are still waiting for the credits?",
        "You really are competing with the stopwatch on patience.",
        "You quietly stretched time out a little.",
        "The second hand did a full lap and you are still brewing.",
        "Drag it on and the next round will start yawning.",
        "The target arrived long ago — you are waiting for a ceremony.",
      ],
    },
    wild: {
      title: "Second Sense Offline",
      messages: [
        "Second sense? You are going with the flow.",
        "Between you and the target there is a whole time zone.",
        "Your second sense should be restored to factory settings.",
        "You and the target are a full beat apart.",
        "That press — your second sense really went on holiday.",
        "What you pressed looks a lot like another target.",
        "How elastic time is in your hands.",
        "By feel? This time the feeling drifted a little.",
      ],
    },
  },
};
