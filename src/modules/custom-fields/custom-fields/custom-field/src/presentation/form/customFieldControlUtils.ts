/**
 * Custom Field Control Utilities
 */
export function toFieldInputValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}
