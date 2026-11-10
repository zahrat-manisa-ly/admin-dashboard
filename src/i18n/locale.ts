export const LOCALE_COOKIE = "dashboard_locale";
export const PATHNAME_HEADER = "x-pathname";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export type Direction = "ltr" | "rtl";
export type PhysicalSide = "left" | "right";

export const translatedPaths = new Set([
  "default",
  "finance",
  "bookings",
  "flights",
  "ticketing",
  "cancellations",
  "refunds",
  "customers",
  "support",
  "transactions",
  "wallets",
  "wallet-operations",
  "users",
  "roles-permissions",
  "profile",
  "notifications",
]);

export function parseLocale(value: string | undefined): Locale {
  return value === "ar" ? "ar" : "en";
}

export function isTranslatedPath(pathname: string) {
  return translatedPaths.has(pathname.split("/")[2] ?? "");
}

export function resolveLocale(cookieLocale: Locale, pathname: string): Locale {
  return isTranslatedPath(pathname) ? cookieLocale : "en";
}

export function directionFor(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

export function inlineStartSide(direction: Direction): PhysicalSide {
  return direction === "rtl" ? "right" : "left";
}

export function inlineEndSide(direction: Direction): PhysicalSide {
  return direction === "rtl" ? "left" : "right";
}

export function getTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
