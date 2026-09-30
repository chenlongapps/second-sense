import { LOCALE_LABELS, MESSAGES, isLocale } from "./locales";
import {
  FALLBACK_LOCALE,
  type EasterEggCopy,
  type Locale,
  type MessageKey,
  type MessageParams,
  type Messages,
} from "./types";
import type { EasterEggKind } from "../game/result";

export { FALLBACK_LOCALE, isLocale, LOCALE_LABELS, MESSAGES };
export { LOCALES } from "./types";
export type { EasterEggCopy, Locale, MessageKey, MessageParams, Messages } from "./types";

/** 语言偏好只存在当前浏览器，和音效开关一样不随账号同步。 */
export const LOCALE_STORAGE_KEY = "second-sense-locale";

let currentLocale: Locale = FALLBACK_LOCALE;

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}

function readMessage(messages: Messages, key: MessageKey): string | undefined {
  let node: unknown = messages;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** 取当前语言的文案，并用 `{name}` 占位符替换参数。 */
export function t(key: MessageKey, params?: MessageParams): string {
  const message = readMessage(MESSAGES[currentLocale], key);
  if (message === undefined) return key;
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name];
    return value === undefined ? placeholder : String(value);
  });
}

/** 当前语言下某一档彩蛋的标题和候选文案。 */
export function easterEggCopy(kind: EasterEggKind): EasterEggCopy[EasterEggKind] {
  return MESSAGES[currentLocale].easterEggs[kind];
}

/** 把 `zh-Hant-TW`、`en_US` 之类的偏好归一成受支持的语言。 */
export function resolveLocale(preference: string | undefined): Locale | undefined {
  if (!preference) return undefined;
  const normalized = preference.trim().toLowerCase().replace(/_/g, "-");
  if (isLocale(normalized)) return normalized;
  const [primary, ...rest] = normalized.split("-");
  switch (primary) {
    case "zh":
      // 繁体（Hant、港澳台）走繁體中文，其余按简体处理。
      if (rest.some((part) => ["hant", "tw", "hk", "mo"].includes(part))) return "zh-TW";
      return "zh-CN";
    case "en":
      return "en";
    case "ja":
      return "ja";
    case "ko":
      return "ko";
    case "es":
      return "es";
    default:
      return undefined;
  }
}

/** 按浏览器语言排序挑第一个支持的语言，全都不支持就回退到英语。 */
export function detectLocale(languages: readonly string[] | undefined): Locale {
  for (const language of languages ?? []) {
    const resolved = resolveLocale(language);
    if (resolved) return resolved;
  }
  return FALLBACK_LOCALE;
}

export function loadLocalePreference(
  storage: Pick<Storage, "getItem"> | undefined,
): Locale | undefined {
  try {
    const value = storage?.getItem(LOCALE_STORAGE_KEY);
    return value && isLocale(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function saveLocalePreference(
  storage: Pick<Storage, "setItem"> | undefined,
  locale: Locale,
): void {
  try {
    storage?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Language preference must never interrupt the game.
  }
}

const TEXT_ATTRIBUTE = "data-i18n";
const ATTRIBUTE_ATTRIBUTE = "data-i18n-attr";
const PARAMS_ATTRIBUTE = "data-i18n-params";

function readParams(element: HTMLElement): MessageParams | undefined {
  const raw = element.getAttribute(PARAMS_ATTRIBUTE);
  if (!raw) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as MessageParams) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * 把静态 HTML 里的中文兜底文案换成当前语言。
 * `data-i18n="status.ready"` 替换文本，`data-i18n-attr="aria-label:status.ready"` 替换属性，
 * `data-i18n-params` 提供占位符参数。
 */
export function applyStaticTranslations(root: ParentNode = document): void {
  for (const element of root.querySelectorAll<HTMLElement>(`[${TEXT_ATTRIBUTE}]`)) {
    const key = element.getAttribute(TEXT_ATTRIBUTE);
    if (!key) continue;
    element.textContent = t(key as MessageKey, readParams(element));
  }
  for (const element of root.querySelectorAll<HTMLElement>(`[${ATTRIBUTE_ATTRIBUTE}]`)) {
    const attribute = element.getAttribute(ATTRIBUTE_ATTRIBUTE);
    if (!attribute) continue;
    for (const pair of attribute.split(",")) {
      const separator = pair.indexOf(":");
      if (separator < 0) continue;
      const name = pair.slice(0, separator).trim();
      const key = pair.slice(separator + 1).trim() as MessageKey;
      if (!name || !key) continue;
      element.setAttribute(name, t(key, readParams(element)));
    }
  }
}

export function applyDocumentTranslations(): void {
  if (typeof document === "undefined") return;
  document.title = t("meta.title");
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", t("meta.description"));
}
