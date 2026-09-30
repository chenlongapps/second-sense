import "./styles.css";
import { GameAudio, type SoundName } from "./audio/synth";
import {
  advanceCheatStreak,
  emptyCheatStreak,
  isCheatTriggered,
  type CheatStreak,
} from "./game/cheat";
import { displayAriaLabel, renderDisplayHtml } from "./game/display";
import {
  addHistoryEntry,
  diffKind,
  formatActualText,
  formatDiffText,
  type HistoryEntry,
} from "./game/history";
import { getEasterEgg, localizeEasterEgg, type EasterEgg, type EasterEggKind } from "./game/result";
import {
  applyDocumentTranslations,
  applyStaticTranslations,
  detectLocale,
  getLocale,
  loadLocalePreference,
  LOCALE_LABELS,
  LOCALES,
  saveLocalePreference,
  setLocale,
  t,
  type Locale,
} from "./i18n";

const MAX_ROUND_SECONDS = 60;
const VICTORY_OVERLAY_MS = 2000;
const CHEAT_TICK_MS = 1000 / 60;
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

/** 取消回合时给出的原因。 */
type NoticeReason = "notice.tooLong" | "notice.hidden";

/** 界面阶段，决定按钮、状态和提示语的文案。 */
type Phase = "idle" | "running" | "finished";

/** 已经亮起来的彩蛋，切换语言时按同一档重新翻译。 */
interface EasterEggView {
  egg: EasterEgg;
  elapsed: number;
  locale: Locale;
}

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
const localePicker = getElement<HTMLElement>("locale-picker");
const localeToggle = getElement<HTMLButtonElement>("locale-toggle");
const localeCurrent = getElement<HTMLElement>("locale-current");
const localeMenu = getElement<HTMLUListElement>("locale-menu");
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

function unsafeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

let target = 5;
let running = false;
let phase: Phase = "idle";
let startedAt = 0;
let timeoutId: number | undefined;
let overlayTimerId: number | undefined;
let overlayReturnFocus: HTMLElement | null = null;
let hasPlayed = false;
let history: HistoryEntry[] = [];
let cheatStreak: CheatStreak = emptyCheatStreak();
let cheatRunning = false;
let cheatTickId: number | undefined;
let cheatStopId: number | undefined;
let displayState: { seconds: number; hidden: boolean } = { seconds: target, hidden: false };
let easterEggView: EasterEggView | undefined;
let victoryView: EasterEggView | undefined;

function startCheatTracking(): void {
  stopCheatTracking();
  cheatRunning = true;
  applyRoundText();
  cheatStopId = window.setTimeout(
    stop,
    Math.max(0, target * 1000 - (performance.now() - startedAt)),
  );
  const tick = (): void => {
    if (!cheatRunning) return;
    renderDisplay((performance.now() - startedAt) / 1000);
    cheatTickId = window.setTimeout(tick, CHEAT_TICK_MS);
  };
  tick();
}

function stopCheatTracking(): void {
  cheatRunning = false;
  window.clearTimeout(cheatTickId);
  window.clearTimeout(cheatStopId);
  cheatTickId = undefined;
  cheatStopId = undefined;
}

function renderDisplay(seconds: number, hidden = false): void {
  displayState = { seconds, hidden };
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
    targetEl.textContent = t("history.target", { n: entry.target });

    const actualEl = document.createElement("span");
    actualEl.className = "history-actual";
    actualEl.textContent = t("history.actual", { value: formatActualText(entry.actual) });

    const diffEl = document.createElement("span");
    const kind = diffKind(entry.target, entry.actual);
    diffEl.className = `history-diff ${kind}`;
    diffEl.textContent = formatDiffText(entry.target, entry.actual);

    item.append(targetEl, actualEl, diffEl);
    historyList.append(item);
  }
}

function clearEasterEgg(): void {
  easterEggView = undefined;
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

function applyEasterEggText(): void {
  if (!easterEggView) return;
  easterEggTitle.textContent = easterEggView.egg.title;
  easterEggMessage.textContent = easterEggView.egg.message;
  easterEggDiff.textContent = formatDiffText(target, easterEggView.elapsed);
}

function revealEasterEgg(egg: EasterEgg, elapsed: number): void {
  easterEggView = { egg, elapsed, locale: getLocale() };
  applyEasterEggText();
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
  victoryView = undefined;
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

function applyVictoryText(): void {
  if (!victoryView) return;
  victoryTitle.textContent = victoryView.egg.title;
  victoryTime.textContent = formatActualText(victoryView.elapsed);
  victoryMessage.textContent = victoryView.egg.message;
}

function showVictoryOverlay(egg: EasterEgg, elapsed: number): void {
  victoryView = { egg, elapsed, locale: getLocale() };
  applyVictoryText();
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

/** 按钮、状态和提示语只依赖 target / phase / cheatRunning，切换语言时也走这里。 */
function applyRoundText(): void {
  if (phase === "running") {
    actionLabel.textContent = t("action.labelStop");
    actionGlyph.textContent = t("action.glyphStop");
    statusEl.textContent = cheatRunning ? t("status.cheating") : t("status.running");
    dialLabel.textContent = t("display.labelTargetSeconds", { n: target });
    dialCaption.textContent = cheatRunning ? t("caption.cheat") : t("caption.running");
    return;
  }
  actionLabel.textContent = hasPlayed ? t("action.labelAgain") : t("action.labelIdle");
  actionGlyph.textContent = t("action.glyphGo");
  if (phase === "finished") {
    statusEl.textContent = t("status.done");
    dialLabel.textContent = t("display.labelActual");
    dialCaption.textContent = t("caption.finished");
    return;
  }
  statusEl.textContent = t("status.ready");
  dialLabel.textContent = t("display.labelTarget");
  dialCaption.textContent = t("caption.idle");
}

function setRunningUI(active: boolean): void {
  clearEasterEgg();
  for (const button of targets) button.disabled = active;
  document.body.classList.toggle("is-running", active);
  dial.classList.toggle("running", active);
  actionButton.classList.toggle("running", active);
  phase = active ? "running" : "idle";
  applyRoundText();
  renderDisplay(target, active);
}

function start(): void {
  running = true;
  const cheat = isCheatTriggered(cheatStreak);
  cheatStreak = emptyCheatStreak();
  startedAt = performance.now();
  noticeEl.textContent = "";
  setRunningUI(true);
  audio.play("start");
  timeoutId = window.setTimeout(() => cancel("notice.tooLong"), MAX_ROUND_SECONDS * 1000);
  if (cheat) startCheatTracking();
}

function stop(): void {
  const elapsed = (performance.now() - startedAt) / 1000;
  running = false;
  window.clearTimeout(timeoutId);
  stopCheatTracking();
  hasPlayed = true;
  history = addHistoryEntry(history, { target, actual: elapsed });
  setRunningUI(false);
  phase = "finished";
  applyRoundText();
  renderDisplay(elapsed);
  renderHistory();
  const egg = getEasterEgg(target, elapsed);
  if (egg) revealEasterEgg(egg, elapsed);
  audio.play(egg ? RESULT_SOUNDS[egg.kind] : "stop");
  if (egg?.kind === "perfect") showVictoryOverlay(egg, elapsed);
}

function cancel(reason: NoticeReason): void {
  if (!running) return;
  audio.silence();
  running = false;
  window.clearTimeout(timeoutId);
  stopCheatTracking();
  setRunningUI(false);
  noticeEl.textContent = t(reason);
}

function act(): void {
  if (running) stop();
  else start();
}

/** 语言偏好只保存在当前浏览器；没有记录时跟随浏览器语言。 */
function initialLocale(): Locale {
  const stored = loadLocalePreference(unsafeStorage());
  return stored ?? detectLocale(navigator.languages);
}

function localeOptions(): HTMLLIElement[] {
  return [...localeMenu.querySelectorAll<HTMLLIElement>(".locale-option")];
}

function buildLocaleMenu(): void {
  const fragment = document.createDocumentFragment();
  for (const locale of LOCALES) {
    const option = document.createElement("li");
    option.className = "locale-option";
    option.id = `locale-option-${locale}`;
    option.dataset.locale = locale;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(locale === getLocale()));
    option.textContent = LOCALE_LABELS[locale];
    option.addEventListener("click", () => chooseLocale(locale));
    fragment.append(option);
  }
  localeMenu.replaceChildren(fragment);
}

/** 按钮上的当前语言、无障碍名称，以及菜单里的选中态。 */
function syncLocaleUI(): void {
  const locale = getLocale();
  const name = LOCALE_LABELS[locale];
  localeCurrent.textContent = name;
  localeToggle.setAttribute("aria-label", t("locale.current", { name }));
  for (const option of localeOptions()) {
    option.setAttribute("aria-selected", String(option.dataset.locale === locale));
  }
}

let localeActiveIndex = 0;

function highlightLocaleOption(index: number): void {
  const options = localeOptions();
  if (options.length === 0) return;
  localeActiveIndex = (index + options.length) % options.length;
  const active = options[localeActiveIndex];
  for (const option of options) option.classList.toggle("is-active", option === active);
  active.scrollIntoView({ block: "nearest" });
  localeMenu.setAttribute("aria-activedescendant", active.id);
}

function setLocaleMenuOpen(open: boolean): void {
  localeToggle.setAttribute("aria-expanded", String(open));
  localeMenu.hidden = !open;
  if (!open) return;
  highlightLocaleOption(LOCALES.indexOf(getLocale()));
  localeMenu.focus();
}

/** 选中即切换、收起并把焦点还给按钮，reload 后仍记住这份偏好。 */
function chooseLocale(locale: Locale): void {
  setLocaleMenuOpen(false);
  localeToggle.focus();
  if (locale === getLocale()) return;
  setLocale(locale);
  saveLocalePreference(unsafeStorage(), locale);
  refreshTranslations();
}

localeToggle.addEventListener("click", () => {
  setLocaleMenuOpen(localeMenu.hidden);
});

localeToggle.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  setLocaleMenuOpen(true);
});

localeMenu.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      highlightLocaleOption(localeActiveIndex + 1);
      return;
    case "ArrowUp":
      event.preventDefault();
      highlightLocaleOption(localeActiveIndex - 1);
      return;
    case "Home":
      event.preventDefault();
      highlightLocaleOption(0);
      return;
    case "End":
      event.preventDefault();
      highlightLocaleOption(localeOptions().length - 1);
      return;
    case "Enter":
    case " ":
      event.preventDefault();
      chooseLocale(LOCALES[localeActiveIndex]);
      return;
    case "Escape":
      event.preventDefault();
      setLocaleMenuOpen(false);
      localeToggle.focus();
      return;
    case "Tab":
      setLocaleMenuOpen(false);
      return;
    default:
      return;
  }
});

// 点菜单外面、或者焦点被 Tab 带出页头控件，都直接收起。
document.addEventListener("pointerdown", (event) => {
  if (localeMenu.hidden) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest?.("#locale-picker")) return;
  setLocaleMenuOpen(false);
});

localePicker.addEventListener("focusout", (event) => {
  if (localeMenu.hidden) return;
  const next = event.relatedTarget as Node | null;
  if (next && localePicker.contains(next)) return;
  setLocaleMenuOpen(false);
});

/** 重新铺一遍文案，保留当前回合、彩蛋和历史记录。 */
function refreshTranslations(): void {
  applyStaticTranslations();
  applyDocumentTranslations();
  syncLocaleUI();
  audio.updateToggle({ toggle: soundToggle, label: soundLabel });
  applyRoundText();
  renderHistory();
  if (easterEggView && easterEggView.locale !== getLocale()) {
    easterEggView = {
      ...easterEggView,
      egg: localizeEasterEgg(easterEggView.egg, getLocale()),
      locale: getLocale(),
    };
    applyEasterEggText();
  }
  if (victoryView && victoryView.locale !== getLocale()) {
    victoryView = {
      ...victoryView,
      egg: localizeEasterEgg(victoryView.egg, getLocale()),
      locale: getLocale(),
    };
    applyVictoryText();
  }
  renderDisplay(displayState.seconds, displayState.hidden);
}

for (const button of targets) {
  button.addEventListener("click", () => {
    if (running) return;
    audio.play("select");
    const seconds = Number(button.dataset.seconds);
    cheatStreak = advanceCheatStreak(cheatStreak, seconds, performance.now());
    const cheat = isCheatTriggered(cheatStreak);
    target = seconds;
    for (const option of targets) {
      const selected = option === button;
      option.classList.toggle("active", selected);
      option.setAttribute("aria-pressed", String(selected));
    }
    setRunningUI(false);
    if (cheat) start();
    else noticeEl.textContent = "";
  });
}

actionButton.addEventListener("click", act);
victoryOverlay.addEventListener("click", dismissVictoryOverlay);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !victoryOverlay.hidden) {
    dismissVictoryOverlay();
    return;
  }
  if (event.key === "Escape" && !localeMenu.hidden) {
    setLocaleMenuOpen(false);
    localeToggle.focus();
    return;
  }
  if ((event.target as HTMLElement | null)?.closest?.("#locale-picker")) return;
  if (event.code !== "Space" || event.altKey || event.ctrlKey || event.metaKey) return;
  const focus = event.target as HTMLElement | null;
  if (focus && (/^(INPUT|TEXTAREA|SELECT)$/.test(focus.tagName) || focus.isContentEditable)) return;
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
    cancel("notice.hidden");
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

const audio = new GameAudio(AudioContextClass, GameAudio.loadPreference(unsafeStorage()));

buildLocaleMenu();
syncLocaleUI();
setLocale(initialLocale());
refreshTranslations();
