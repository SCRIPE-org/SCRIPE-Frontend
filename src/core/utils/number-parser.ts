/**
 * Safely parses localized number strings into valid JS numbers.
 * Handles:
 * - Arabic/Eastern Arabic numerals (١٢٣٤٥ -> 12345)
 * - European decimal formats (20.000,50 -> 20000.50)
 * - English formats (20,000.50 -> 20000.50)
 */
export function parseLocalizedNumber(value: string | number | undefined | null): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    
    // Convert Arabic/Eastern Arabic numerals to Western digits (0-9)
    let sanitized = String(value)
        // Arabic-Indic
        .replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1632))
        // Eastern Arabic-Indic (Persian/Urdu)
        .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1776));
    
    // Remove all whitespace
    sanitized = sanitized.replace(/\s+/g, '');
    
    // Determine decimal separator
    const lastPeriod = sanitized.lastIndexOf('.');
    const lastComma = sanitized.lastIndexOf(',');
    
    if (lastComma > lastPeriod && lastPeriod !== -1) {
        // e.g. "20.000,50" -> comma is decimal
        sanitized = sanitized.replace(/\./g, '').replace(',', '.');
    } else if (lastPeriod > lastComma && lastComma !== -1) {
        // e.g. "20,000.50" -> period is decimal
        sanitized = sanitized.replace(/,/g, '');
    } else if (lastComma !== -1 && lastPeriod === -1) {
        // Only commas.
        // If it matches exactly 3 digits at the end (e.g. "20,000"), assume thousand separator
        if (sanitized.match(/,\d{3}$/)) {
            // Check if there are multiple commas (e.g., "1,000,000"), which confirms thousands
            const hasMultipleCommas = (sanitized.match(/,/g) || []).length > 1;
            if (hasMultipleCommas || sanitized.length <= 7) { 
                sanitized = sanitized.replace(/,/g, ''); 
            } else {
                sanitized = sanitized.replace(/,/g, '.'); // Fallback decimal
            }
        } else {
            // e.g. "20,5" -> comma is decimal
            sanitized = sanitized.replace(/,/g, '.');
        }
    }
    
    // Final strip of anything not a digit, period, or minus sign
    sanitized = sanitized.replace(/[^0-9.-]/g, '');
    
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? undefined : parsed;
}
