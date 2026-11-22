type TimeError = "invalidTime" | "invalidZone" | "nonexistentTime" | "ambiguousTime";
type TimeResult = { utc: string } | { error: TimeError };

function wallClockFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    calendar: "gregory",
    numberingSystem: "latn",
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
}

function wallClock(formatter: Intl.DateTimeFormat, instant: number) {
  const parts = Object.fromEntries(formatter.formatToParts(instant).map(({ type, value }) => [type, value]));
  return parts.year + "-" + parts.month + "-" + parts.day + "T" + parts.hour + ":" + parts.minute + ":" + parts.second;
}

/** Add minutes to a timezone-free wall time without consulting the browser timezone. */
export function addWallClockMinutes(local: string, minutes: number): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local) || !Number.isFinite(minutes)) return null;
  const nominal = new Date(local + ":00Z");
  if (!Number.isFinite(nominal.valueOf()) || nominal.toISOString().slice(0, 16) !== local) return null;
  return new Date(nominal.valueOf() + minutes * 60_000).toISOString().slice(0, 16);
}

/** Resolve a local wall time without depending on the browser's timezone or picking an ambiguous DST fold. */
export function localSessionTimeToUtc(local: string, timeZone: string): TimeResult {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return { error: "invalidTime" };
  const wallTime = local + ":00";
  const nominal = new Date(wallTime + "Z");
  if (!Number.isFinite(nominal.valueOf()) || nominal.toISOString().slice(0, 16) !== local) {
    return { error: "invalidTime" };
  }

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = wallClockFormatter(timeZone);
  } catch {
    return { error: "invalidZone" };
  }

  const day = 24 * 60 * 60 * 1000;
  const epoch = nominal.valueOf();
  const offsets = new Set([-day, 0, day].map((distance) => {
    const probe = epoch + distance;
    return Date.parse(wallClock(formatter, probe) + "Z") - probe;
  }));
  const matches = [...offsets]
    .map((offset) => epoch - offset)
    .filter((candidate) => wallClock(formatter, candidate) === wallTime);

  if (matches.length === 0) return { error: "nonexistentTime" };
  if (matches.length > 1) return { error: "ambiguousTime" };
  return { utc: new Date(matches[0]).toISOString() };
}

export function utcToSessionInput(utc: string, timeZone: string): string {
  return wallClock(wallClockFormatter(timeZone), Date.parse(utc)).slice(0, 16);
}

export function formatSessionTime(utc: string, timeZone: string, language: "ar" | "en") {
  return new Intl.DateTimeFormat(language, {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(utc));
}

export function sessionDateKey(utc: string, timeZone: string): string {
  const instant = new Date(utc);
  if (!Number.isFinite(instant.valueOf())) return "";

  try {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      calendar: "gregory",
      numberingSystem: "latn",
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(instant).map(({ type, value }) => [type, value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  } catch {
    return "";
  }
}

export function localDateKey(date: Date): string {
  if (!Number.isFinite(date.valueOf())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function localDateFromKey(key: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return new Date(Number.NaN);
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return localDateKey(date) === key ? date : new Date(Number.NaN);
}
