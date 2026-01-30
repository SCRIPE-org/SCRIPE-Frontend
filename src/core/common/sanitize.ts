/**
 * Input Sanitization Utilities
 *
 * Security utilities for sanitizing user input to prevent XSS and injection attacks.
 *
 * @example
 * ```typescript
 * import { sanitizeHtml, escapeForRegex, validateEmail } from '@core/common/sanitize';
 *
 * const cleanHtml = sanitizeHtml(userInput);
 * const safePattern = escapeForRegex(searchTerm);
 * const isValid = validateEmail(email);
 * ```
 */

/**
 * Sanitize HTML by escaping dangerous characters
 * Prevents XSS attacks by converting special characters to HTML entities
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";

  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Escape special regex characters in a string
 * Use when incorporating user input into regex patterns
 */
export function escapeForRegex(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validate email format
 * Uses a comprehensive regex pattern for email validation
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number format (basic international format)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  // Accepts: +1234567890, 123-456-7890, (123) 456-7890, etc.
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Sanitize a string for use in URLs (create slug)
 */
export function slugify(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars (except space and hyphen)
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Strip all HTML tags from a string
 */
export function stripHtmlTags(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Validate that a string contains only alphanumeric characters
 */
export function isAlphanumeric(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return /^[a-zA-Z0-9]+$/.test(input);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize filename by removing dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") return "";
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_") // Replace dangerous chars
    .replace(/\.{2,}/g, ".") // Remove consecutive dots
    .trim();
}
