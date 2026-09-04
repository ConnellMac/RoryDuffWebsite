export class InvalidInput extends Error {}

export function assertExactKeys(value: Record<string, unknown>, allowed: readonly string[]) {
  const allowedKeys = new Set(allowed);
  const unexpected = Object.keys(value).filter((key) => !allowedKeys.has(key));
  if (unexpected.length > 0) throw new InvalidInput(`Unexpected field: ${unexpected[0]}.`);
}

export function boundedString(value: unknown, name: string, maximum: number, required = true) {
  if (typeof value !== "string") throw new InvalidInput(`${name} must be text.`);
  const normalized = value.trim();
  if ((required && normalized.length === 0) || normalized.length > maximum)
    throw new InvalidInput(`${name} is invalid.`);
  return normalized;
}

export function finiteNumber(value: unknown, name: string, minimum: number, maximum: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum)
    throw new InvalidInput(`${name} must be between ${minimum} and ${maximum}.`);
  return value;
}

export function ianaTimezone(value: unknown) {
  const timezone = boundedString(value, "Timezone", 100);
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
  } catch {
    throw new InvalidInput("Timezone must be a valid IANA timezone.");
  }
  return timezone;
}

export function isoInstant(value: unknown, name: string) {
  const text = boundedString(value, name, 40);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(text))
    throw new InvalidInput(`${name} must be an ISO 8601 instant with a timezone offset.`);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) throw new InvalidInput(`${name} is invalid.`);
  return date;
}

export function calendarDate(value: unknown, name: string) {
  const text = boundedString(value, name, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new InvalidInput(`${name} is invalid.`);
  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    throw new InvalidInput(`${name} is invalid.`);
  return text;
}

export function documentId(value: unknown, name: string) {
  const id = boundedString(value, name, 128);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new InvalidInput(`${name} is invalid.`);
  return id;
}
