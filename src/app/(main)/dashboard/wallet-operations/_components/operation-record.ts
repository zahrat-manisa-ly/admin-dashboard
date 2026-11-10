import type { Page } from "@/lib/api/types/users";

/** Loose record until the OpenAPI list/detail contracts are published. */
export type OperationRecord = Record<string, unknown>;

export type OperationPage = Page<OperationRecord>;

//--------parse-page----//
export function parseOperationPage(data: unknown, page: number, size: number): OperationPage {
  if (Array.isArray(data)) {
    const items = data.filter(isRecord);
    return { items, total: items.length, page, size, pages: items.length > 0 ? 1 : 0 };
  }

  if (!isRecord(data)) {
    return { items: [], total: 0, page, size, pages: 0 };
  }

  const rawItems = data.items;
  const items = Array.isArray(rawItems) ? rawItems.filter(isRecord) : [];
  const total = typeof data.total === "number" ? data.total : items.length;
  const resolvedPage = typeof data.page === "number" ? data.page : page;
  const resolvedSize = typeof data.size === "number" ? data.size : size;
  let pages = 0;
  if (typeof data.pages === "number") {
    pages = data.pages;
  } else if (resolvedSize > 0) {
    pages = Math.ceil(total / resolvedSize);
  }

  return { items, total, page: resolvedPage, size: resolvedSize, pages };
}
//-------end-parse-page----//

//--------parse-record----//
export function parseOperationRecord(data: unknown): OperationRecord | null {
  return isRecord(data) ? data : null;
}

export function isRecord(value: unknown): value is OperationRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
//-------end-parse-record----//

//--------field-helpers----//
export function pickString(record: OperationRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

export function recordId(record: OperationRecord, preferredKeys: string[]): string | null {
  return pickString(record, preferredKeys);
}

export function recordEntries(record: OperationRecord): Array<{ key: string; value: string }> {
  return Object.entries(record).map(([key, value]) => ({
    key,
    value: formatRecordValue(value),
  }));
}

function formatRecordValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
//-------end-field-helpers----//
