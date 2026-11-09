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
