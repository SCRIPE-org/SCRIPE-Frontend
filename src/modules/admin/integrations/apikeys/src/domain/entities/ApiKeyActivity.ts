/**
 * Documentation for module export
 */
export interface ApiKeyActivityEntry {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress: string | null;
  requestedAt: string;
}

/**
 * Documentation for module export
 */
export function getStatusCodeGroup(statusCode: number): "2xx" | "3xx" | "4xx" | "5xx" | "other" {
  if (statusCode >= 200 && statusCode < 300) return "2xx";
  if (statusCode >= 300 && statusCode < 400) return "3xx";
  if (statusCode >= 400 && statusCode < 500) return "4xx";
  if (statusCode >= 500) return "5xx";
  return "other";
}

/**
 * Documentation for module export
 */
export function getStatusCodeColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return "text-success bg-success/10";
  if (statusCode >= 300 && statusCode < 400) return "text-warning bg-warning/10";
  if (statusCode >= 400 && statusCode < 500) return "text-warning-strong bg-warning-strong/10";
  return "text-destructive bg-destructive/10";
}
