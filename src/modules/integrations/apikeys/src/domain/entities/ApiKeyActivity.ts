export interface ApiKeyActivityEntry {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress: string | null;
  requestedAt: string;
}

export function getStatusCodeGroup(statusCode: number): "2xx" | "3xx" | "4xx" | "5xx" | "other" {
  if (statusCode >= 200 && statusCode < 300) return "2xx";
  if (statusCode >= 300 && statusCode < 400) return "3xx";
  if (statusCode >= 400 && statusCode < 500) return "4xx";
  if (statusCode >= 500) return "5xx";
  return "other";
}

export function getStatusCodeColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400";
  if (statusCode >= 300 && statusCode < 400) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400";
  if (statusCode >= 400 && statusCode < 500) return "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400";
  return "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400";
}
