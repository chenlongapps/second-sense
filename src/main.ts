import "./styles.css";
import { GameAudio } from "./audio/synth";
import { displayAriaLabel, renderDisplayHtml } from "./game/display";
import {
  addHistoryEntry,
  diffKind,
  formatActualText,
  formatDiffText,
  type HistoryEntry,
} from "./game/history";

const MAX_ROUND_SECONDS = 60;

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

function setRunningUI(active: boolean): void {
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
  audio.play("stop");
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

document.addEventListener("keydown", (event) => {
  if ((event.target as HTMLElement | null)?.closest?.("#sound-toggle")) return;
  if (event.code !== "Space" || event.altKey || event.ctrlKey || event.metaKey) return;
  const t = event.target as HTMLElement | null;
  if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
  event.preventDefault();
  if (!event.repeat) act();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    audio.silence();
    cancel("页面切换，本轮不计。");
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
