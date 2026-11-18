import type { DataTransferJobStatus } from "../../domain/entities/DataTransferJob";

/** Semantic Progress bar variants supported by @core/ui/progress. */
export type JobProgressVariant = "default" | "success" | "warning" | "danger";

/**
 * Resolves the canonical @core/ui/progress semantic variant for a job execution status.
 */
export function getJobProgressVariant(status: DataTransferJobStatus | string): JobProgressVariant {
  switch (status) {
    case "Failed":
      return "danger";
    case "CompletedWithErrors":
    case "Cancelled":
    case "Expired":
      return "warning";
    case "Completed":
      return "success";
    case "Running":
    case "Queued":
    case "Pending":
    default:
      return "default";
  }
}

/**
 * Formats an ISO UTC timestamp string into a localized short date-time label.
 */
export function formatJobTimestamp(
  value: string | null | undefined,
  isAr: boolean
): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  const dateLocale = isAr ? "ar-EG" : "en-US";
  return `${date.toLocaleDateString(dateLocale)} ${date.toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
