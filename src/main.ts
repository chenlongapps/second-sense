import "./styles.css";
import { GameAudio, type SoundName } from "./audio/synth";
import { displayAriaLabel, renderDisplayHtml } from "./game/display";
import {
  addHistoryEntry,
  diffKind,
  formatActualText,
  formatDiffText,
  type HistoryEntry,
} from "./game/history";
import { getEasterEgg, type EasterEgg, type EasterEggKind } from "./game/result";

const MAX_ROUND_SECONDS = 60;
const VICTORY_OVERLAY_MS = 2000;
const CONFETTI_COUNT = 40;
const CONFETTI_COLORS = ["#ffcf66", "#f3333d", "#fff0c6", "#ff8f70", "#8fd3ff", "#ffffff"];
const RESULT_SOUNDS: Record<EasterEggKind, SoundName> = {
  perfect: "victory",
  "near-one": "near-one",
  "near-two": "near-two",
  "too-early": "tease",
  "too-late": "tease",
  wild: "tease",
};

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const targets = [...document.querySelectorAll<HTMLButtonElement>(".target")];
const actionButton = getElement<HTMLButtonElement>("action");
const actionGlyph = getElement<HTMLElement>("action-glyph");
const actionLabel = getElement<HTMLElement>("action-label");
const dial = getElement<HTMLElement>("dial");
const dialNumber = getElement<HTMLElement>("dial-number");
const dialLabel = getElement<HTMLElement>("dial-label");
const dialCaption = getElement<HTMLElement>("dial-caption");
const statusEl = getElement<HTMLElement>("status");
const noticeEl = getElement<HTMLElement>("notice");
const soundToggle = getElement<HTMLButtonElement>("sound-toggle");
const soundLabel = getElement<HTMLElement>("sound-label");
const historyList = getElement<HTMLOListElement>("history-list");
const historyEmpty = getElement<HTMLElement>("history-empty");
const easterEggEl = getElement<HTMLElement>("easter-egg");
const easterEggTitle = getElement<HTMLElement>("easter-egg-title");
const easterEggMessage = getElement<HTMLElement>("easter-egg-message");
const easterEggDiff = getElement<HTMLElement>("easter-egg-diff");
const pixelSparks = getElement<HTMLElement>("pixel-sparks");
const victoryOverlay = getElement<HTMLDivElement>("victory-overlay");
const victoryTitle = getElement<HTMLElement>("victory-title");
const victoryTime = getElement<HTMLElement>("victory-time");
const victoryMessage = getElement<HTMLElement>("victory-message");
const victoryConfetti = getElement<HTMLElement>("victory-confetti");

const AudioContextClass =
  window.AudioContext ??
  (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

const audio = new GameAudio(AudioContextClass, GameAudio.loadPreference(unsafeStorage()));

function unsafeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

let target = 5;
let running = false;
let startedAt = 0;
let timeoutId: number | undefined;
let overlayTimerId: number | undefined;
let overlayReturnFocus: HTMLElement | null = null;
let hasPlayed = false;
let history: HistoryEntry[] = [];

function renderDisplay(seconds: number, hidden = false): void {
  dialNumber.innerHTML = renderDisplayHtml(seconds, hidden);
  dialNumber.setAttribute("aria-label", displayAriaLabel(seconds, hidden));
}

function renderHistory(): void {
  historyList.textContent = "";
  historyEmpty.hidden = history.length > 0;
  for (const entry of history) {
    const item = document.createElement("li");
    item.className = "history-item";

    const targetEl = document.createElement("span");
    targetEl.className = "history-target";
    targetEl.textContent = `目标 ${entry.target} 秒`;

    const actualEl = document.createElement("span");
    actualEl.className = "history-actual";
    actualEl.textContent = `实际 ${formatActualText(entry.actual)}`;

    const diffEl = document.createElement("span");
    const kind = diffKind(entry.target, entry.actual);
    diffEl.className = `history-diff ${kind}`;
    diffEl.textContent = formatDiffText(entry.target, entry.actual);

    item.append(targetEl, actualEl, diffEl);
    historyList.append(item);
  }
}

function clearEasterEgg(): void {
  easterEggEl.hidden = true;
  easterEggTitle.textContent = "";
  easterEggMessage.textContent = "";
  easterEggDiff.textContent = "";
  delete easterEggEl.dataset.kind;
  delete dial.dataset.result;
  pixelSparks.replaceChildren();
  dialCaption.hidden = false;
  clearVictoryOverlay();
}

function revealEasterEgg(egg: EasterEgg, elapsed: number): void {
  easterEggTitle.textContent = egg.title;
  easterEggMessage.textContent = egg.message;
  easterEggDiff.textContent = formatDiffText(target, elapsed);
  easterEggEl.dataset.kind = egg.kind;
  dial.dataset.result = egg.kind;
  dialCaption.hidden = true;
  easterEggEl.hidden = false;

  const sparkCount = egg.kind === "perfect" ? 24 : egg.kind === "near-one" ? 8 : 0;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < sparkCount; i += 1) {
    const spark = document.createElement("i");
    spark.className = "pixel-spark";
    spark.style.left = `${8 + ((i * 37) % 84)}%`;
    spark.style.top = `${20 + ((i * 13) % 40)}%`;
    spark.style.setProperty("--drift", `${((i * 19) % 80) - 40}px`);
    spark.style.setProperty("--delay", `${(i % 6) * 45}ms`);
    fragment.append(spark);
  }
  pixelSparks.append(fragment);
}

function clearVictoryOverlay(): void {
  window.clearTimeout(overlayTimerId);
  overlayTimerId = undefined;
  victoryOverlay.hidden = true;
  document.body.classList.remove("celebrating");
  victoryConfetti.replaceChildren();
  if (overlayReturnFocus) {
    overlayReturnFocus.focus();
    overlayReturnFocus = null;
  }
}

function confettiPiece(index: number): HTMLElement {
  const piece = document.createElement("i");
  piece.className = "victory-bit";
  piece.style.left = `${(index * 29) % 100}%`;
  piece.style.setProperty("--fall", `${60 + ((index * 17) % 40)}vh`);
  piece.style.setProperty("--drift", `${((index * 31) % 61) - 30}px`);
  piece.style.setProperty("--spin", `${((index * 53) % 14) + 6}deg`);
  piece.style.setProperty("--delay", `${(index % 8) * 90}ms`);
  piece.style.setProperty("--color", CONFETTI_COLORS[index % CONFETTI_COLORS.length]!);
  return piece;
}

function showVictoryOverlay(egg: EasterEgg, elapsed: number): void {
  victoryTitle.textContent = egg.title;
  victoryTime.textContent = formatActualText(elapsed);
  victoryMessage.textContent = egg.message;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < CONFETTI_COUNT; i += 1) fragment.append(confettiPiece(i));
  victoryConfetti.replaceChildren(fragment);
  victoryOverlay.hidden = false;
  document.body.classList.add("celebrating");
  overlayReturnFocus =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  victoryOverlay.focus();
  window.clearTimeout(overlayTimerId);
  overlayTimerId = window.setTimeout(clearVictoryOverlay, VICTORY_OVERLAY_MS);
}

function dismissVictoryOverlay(): void {
  if (victoryOverlay.hidden) return;
  audio.silence();
  clearVictoryOverlay();
}

function setRunningUI(active: boolean): void {
  clearEasterEgg();
  for (const button of targets) button.disabled = active;
  document.body.classList.toggle("is-running", active);
  dial.classList.toggle("running", active);
  actionButton.classList.toggle("running", active);
  actionLabel.textContent = active ? "停止计时" : hasPlayed ? "再挑战一次" : "开始挑战";
  actionGlyph.textContent = active ? "STOP" : "GO";
  statusEl.textContent = active ? "计时进行中" : "准备就绪";
  dialLabel.textContent = active ? `目标 ${target} 秒` : "目标时间";
  renderDisplay(target, active);
  dialCaption.textContent = active ? "计时中 · 凭感觉停止。" : "点击开始。";
}

function start(): void {
  running = true;
  startedAt = performance.now();
  noticeEl.textContent = "";
  setRunningUI(true);
  audio.play("start");
  timeoutId = window.setTimeout(() => cancel("已超过 60 秒。"), MAX_ROUND_SECONDS * 1000);
}

function stop(): void {
  const elapsed = (performance.now() - startedAt) / 1000;
  running = false;
  window.clearTimeout(timeoutId);
  hasPlayed = true;
  history = addHistoryEntry(history, { target, actual: elapsed });
  setRunningUI(false);
  statusEl.textContent = "挑战完成";
  dialLabel.textContent = "实际用时";
  dialCaption.textContent = "本轮结束。";
  renderDisplay(elapsed);
  renderHistory();
  const egg = getEasterEgg(target, elapsed);
  if (egg) revealEasterEgg(egg, elapsed);
  audio.play(egg ? RESULT_SOUNDS[egg.kind] : "stop");
  if (egg?.kind === "perfect") showVictoryOverlay(egg, elapsed);
}

function cancel(message: string): void {
  if (!running) return;
  audio.silence();
  running = false;
  window.clearTimeout(timeoutId);
  setRunningUI(false);
  noticeEl.textContent = message;
}

function act(): void {
  if (running) stop();
  else start();
}

for (const button of targets) {
  button.addEventListener("click", () => {
    if (running) return;
    audio.play("select");
    target = Number(button.dataset.seconds);
    for (const option of targets) {
      const selected = option === button;
      option.classList.toggle("active", selected);
      option.setAttribute("aria-pressed", String(selected));
    }
    noticeEl.textContent = "";
    setRunningUI(false);
  });
}

actionButton.addEventListener("click", act);
victoryOverlay.addEventListener("click", dismissVictoryOverlay);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !victoryOverlay.hidden) {
    dismissVictoryOverlay();
    return;
  }
  if ((event.target as HTMLElement | null)?.closest?.("#sound-toggle")) return;
  if (event.code !== "Space" || event.altKey || event.ctrlKey || event.metaKey) return;
  const t = event.target as HTMLElement | null;
  if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
  event.preventDefault();
  if (!victoryOverlay.hidden) {
    dismissVictoryOverlay();
    return;
  }
  if (!event.repeat) act();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    audio.silence();
    cancel("页面切换，本轮不计。");
    clearVictoryOverlay();
  }
});

soundToggle.addEventListener("click", () => {
  audio.enabled = !audio.enabled;
  GameAudio.savePreference(unsafeStorage(), audio.enabled);
  audio.updateToggle({ toggle: soundToggle, label: soundLabel });
  if (audio.enabled) audio.play("select");
  else audio.silence();
});

audio.updateToggle({ toggle: soundToggle, label: soundLabel });
renderDisplay(target);
renderHistory();
