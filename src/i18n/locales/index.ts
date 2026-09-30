import { en } from "./en";
import { es } from "./es";
import { ja } from "./ja";
import { ko } from "./ko";
import { zhCN } from "./zh-CN";
import { zhTW } from "./zh-TW";
import { LOCALES, type Locale, type Messages } from "../types";

/** 各语言的完整文案，键名与 `LOCALES` 一一对应。 */
export const MESSAGES: Record<Locale, Messages> = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  en,
  ja,
  ko,
  es,
};

/** 语言选择器用各语言的自称展示，短到能塞进页头。 */
export const LOCALE_LABELS: Record<Locale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
