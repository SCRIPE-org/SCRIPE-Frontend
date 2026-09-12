import { Badge } from "@core/ui/badge";
import type { Booking360HistoryItem } from "../../domain/entities/Booking360";

interface Props {
  items: Booking360HistoryItem[];
  locale: string;
  timeZoneId: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function formatted(value: string, locale: string, timeZoneId: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium", timeStyle: "short", timeZone: timeZoneId,
  }).format(new Date(value));
}

export function BookingLifecycleTimeline({ items, locale, timeZoneId, t }: Props) {
  // The backend supplies the authoritative CreatedAt/Id ordering. Preserve that ordering for
  // equal timestamps instead of inventing a transition-code tie-breaker in presentation.
  const ordered = items
    .map((item, sourceIndex) => ({ item, sourceIndex }))
    .sort((left, right) =>
      Date.parse(left.item.occurredAtUtc) - Date.parse(right.item.occurredAtUtc) ||
      left.sourceIndex - right.sourceIndex)
    .map(({ item }) => item);
  return (
    <ol className="space-y-0" aria-label={t("booking360.history.title")}>
      {ordered.map((item, index) => (
        <li key={`${item.occurredAtUtc}-${item.transitionCode}-${index}`} className="relative grid grid-cols-[1.25rem_1fr] gap-3 pb-5 last:pb-0">
          {index < ordered.length - 1 && <span className="absolute bottom-0 start-[0.6rem] top-5 w-px bg-nx-line" aria-hidden="true" />}
          <span className="relative z-10 mt-1 size-5 rounded-full border-4 border-nx-surface bg-nx-accent" aria-hidden="true" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-nx-ink">{t(`booking360.transition.${item.transitionCode}`)}</p>
              <Badge variant="outline">{t(`booking360.status.${item.toStatus}`)}</Badge>
            </div>
            <time className="text-sm tabular-nums text-nx-ink-2" dateTime={item.occurredAtUtc}>
              {formatted(item.occurredAtUtc, locale, timeZoneId)}
            </time>
            {item.reason && <p className="mt-1 text-sm text-nx-ink-2">{item.reason}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
