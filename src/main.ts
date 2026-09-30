import "./styles.css";
import { GameAudio, scoreToSound } from "./audio/synth";
import { displayAriaLabel, renderDisplayHtml } from "./game/display";
import {
  MAX_ROUND_SECONDS,
  calculateScore,
  formatSignedError,
  getAccuracyPosition,
  getTimingText,
  getVerdict,
} from "./game/scoring";

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
const roundBadge = getElement<HTMLElement>("round-badge");
const resultBody = getElement<HTMLElement>("result-body");
const bestEl = getElement<HTMLElement>("best");
const averageEl = getElement<HTMLElement>("average");
const countEl = getElement<HTMLElement>("count");
const soundToggle = getElement<HTMLButtonElement>("sound-toggle");
const soundLabel = getElement<HTMLElement>("sound-label");

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
let rounds = 0;
let best = 0;
let totalError = 0;

function renderDisplay(seconds: number, hidden = false): void {
  dialNumber.innerHTML = renderDisplayHtml(seconds, hidden);
  dialNumber.setAttribute("aria-label", displayAriaLabel(seconds, hidden));
}

function setRunningUI(active: boolean): void {
  for (const button of targets) button.disabled = active;
  dial.classList.toggle("running", active);
  actionButton.classList.toggle("running", active);
  actionLabel.textContent = active ? "停止计时" : rounds ? "再挑战一次" : "开始挑战";
  actionGlyph.textContent = active ? "STOP" : "GO";
  statusEl.textContent = active ? "计时进行中" : "准备就绪";
  dialLabel.textContent = active ? `目标 ${target} 秒` : "目标时间";
  renderDisplay(target, active);
  dialCaption.textContent = active ? "在心里读秒，到点按停止。" : "准备好了，就开始吧。";
}

function start(): void {
  running = true;
  startedAt = performance.now();
  noticeEl.textContent = "";
  roundBadge.textContent = `ROUND ${String(rounds + 1).padStart(2, "0")}`;
  setRunningUI(true);
  audio.play("start");
  timeoutId = window.setTimeout(
    () => cancel("本轮已超过 60 秒。准备好后，再挑战一次。"),
    MAX_ROUND_SECONDS * 1000,
  );
}

function stop(): void {
  const elapsed = (performance.now() - startedAt) / 1000;
  running = false;
  window.clearTimeout(timeoutId);
  const signedError = elapsed - target;
  const error = Math.abs(signedError);
  const score = calculateScore(error, target);
  audio.play(scoreToSound(score));
  rounds += 1;
  best = Math.max(best, score);
  totalError += error;
  setRunningUI(false);
  statusEl.textContent = "挑战完成";
  dialLabel.textContent = "实际用时";
  dialCaption.textContent = "差了多少？看看你的成绩。";
  renderDisplay(elapsed);
  const position = getAccuracyPosition(signedError, target);
  resultBody.innerHTML = `<div class="score-row"><div class="score">${score}<span>分</span></div><div class="verdict"><h3>${getVerdict(score)}</h3><p>${getTimingText(signedError)}</p></div></div><div class="result-details"><span>实际用时 <strong>${elapsed.toFixed(3)} s</strong></span><span>误差 <strong>${formatSignedError(signedError)}</strong></span></div><div class="accuracy-track" aria-hidden="true"><span class="accuracy-target"></span><span class="accuracy-point" style="left:${position}%"></span></div><div class="track-labels"><span>提前</span><span>目标 ${target} 秒</span><span>超时</span></div><p class="result-note">得分按相对误差计算，越接近目标，分数越高。</p>`;
  bestEl.innerHTML = `${best}<span> 分</span>`;
  averageEl.innerHTML = `${(totalError / rounds).toFixed(2)}<span> s</span>`;
  countEl.innerHTML = `${rounds}<span> 次</span>`;
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
    cancel("页面切换已暂停本轮，成绩不计入统计。回来后可以重新挑战。");
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
