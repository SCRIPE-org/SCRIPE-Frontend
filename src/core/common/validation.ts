/**
 * Validation Utilities
 * 
 * Centralized validation functions for consistent validation across the application.
 * Provides reusable validation logic for forms, inputs, and data validation.
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  errorCode?: string;
}

/**
 * Common validation error codes
 */
export const VALIDATION_ERROR_CODES = {
  REQUIRED_FIELD: "VALIDATION_REQUIRED_FIELD",
  INVALID_FORMAT: "VALIDATION_INVALID_FORMAT",
  CONSTRAINT_VIOLATION: "VALIDATION_CONSTRAINT_VIOLATION",
  PASSWORD_TOO_SHORT: "VALIDATION_PASSWORD_TOO_SHORT",
  PASSWORD_MISSING_LOWERCASE: "VALIDATION_PASSWORD_MISSING_LOWERCASE",
  PASSWORD_MISSING_UPPERCASE: "VALIDATION_PASSWORD_MISSING_UPPERCASE",
  PASSWORD_MISSING_NUMBER: "VALIDATION_PASSWORD_MISSING_NUMBER",
  PASSWORD_MISSING_SPECIAL: "VALIDATION_PASSWORD_MISSING_SPECIAL",
  PASSWORDS_DO_NOT_MATCH: "VALIDATION_PASSWORDS_DO_NOT_MATCH",
  INVALID_EMAIL: "VALIDATION_INVALID_EMAIL",
  INVALID_PHONE: "VALIDATION_INVALID_PHONE",
  INVALID_USERNAME: "VALIDATION_INVALID_USERNAME",
  INVALID_URL: "VALIDATION_INVALID_URL",
  TEXT_TOO_SHORT: "VALIDATION_TEXT_TOO_SHORT",
  TEXT_TOO_LONG: "VALIDATION_TEXT_TOO_LONG",
  INVALID_NUMBER: "VALIDATION_INVALID_NUMBER",
  NUMBER_TOO_SMALL: "VALIDATION_NUMBER_TOO_SMALL",
  NUMBER_TOO_LARGE: "VALIDATION_NUMBER_TOO_LARGE",
} as const;

/**
 * Common regex patterns for validation
 */
export const VALIDATION_PATTERNS = {
  // Email validation (RFC 5322 compliant)
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Phone number validation (international format)
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  
  // Username validation (alphanumeric, underscore, hyphen, 3-30 characters)
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  
  // URL validation
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Password strength patterns
  PASSWORD_LOWERCASE: /(?=.*[a-z])/,
  PASSWORD_UPPERCASE: /(?=.*[A-Z])/,
  PASSWORD_NUMBER: /(?=.*\d)/,
  PASSWORD_SPECIAL: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
  
  // Name validation (letters, spaces, hyphens, apostrophes)
  NAME: /^[a-zA-Z\s\-']+$/,
  
  // Alphanumeric with spaces
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,
  
  // Numbers only
  NUMBERS_ONLY: /^\d+$/,
  
  // Decimal numbers
  DECIMAL: /^\d+(\.\d+)?$/,
  
  // Strong password (at least 8 chars, uppercase, lowercase, number, special char)
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
  
  // Credit card patterns
  CREDIT_CARD: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
  CVV: /^\d{3,4}$/,
  EXPIRY_DATE: /^(0[1-9]|1[0-2])\/\d{2}$/,
  
  // Address patterns
  ZIP_CODE_US: /^\d{5}(-\d{4})?$/,
  ZIP_CODE_CA: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
  POSTAL_CODE: /^[A-Za-z0-9\s-]{3,10}$/,
  
  // Business patterns
  SKU: /^[A-Z0-9-]+$/,
  ISBN: /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
  UPC: /^\d{12}$/,
  EAN: /^\d{13}$/,
  
  // Social patterns
  TWITTER_HANDLE: /^@?[A-Za-z0-9_]{1,15}$/,
  INSTAGRAM_HANDLE: /^@?[A-Za-z0-9._]{1,30}$/,
  LINKEDIN_URL: /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]+\/?$/,
  
  // Technical patterns
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  RGB_COLOR: /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
  HSL_COLOR: /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/,
  
  // File patterns
  IMAGE_EXTENSIONS: /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i,
  DOCUMENT_EXTENSIONS: /\.(pdf|doc|docx|txt|rtf)$/i,
  VIDEO_EXTENSIONS: /\.(mp4|avi|mov|wmv|flv|webm)$/i,
  AUDIO_EXTENSIONS: /\.(mp3|wav|flac|aac|ogg)$/i,
  
  // Network patterns
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  PORT_NUMBER: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
  
  // Currency patterns
  CURRENCY_USD: /^\$?(\d{1,3}(,\d{3})*|(\d+))(\.\d{2})?$/,
  CURRENCY_EUR: /^€?(\d{1,3}(\.\d{3})*|(\d+))(,\d{2})?$/,
  
  // Time patterns
  TIME_12H: /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
  TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  
  // Coordinate patterns
  LATITUDE: /^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/,
  LONGITUDE: /^-?((1[0-7][0-9])|([1-9]?[0-9]))(\.[0-9]+)?$/,
  
  // Version patterns
  SEMANTIC_VERSION: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z][-0-9a-zA-Z]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z][-0-9a-zA-Z]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
  
  // ERP Business Patterns
  // Financial patterns
  ACCOUNT_NUMBER: /^[0-9]{4,20}$/,
  ROUTING_NUMBER: /^[0-9]{9}$/,
  SWIFT_CODE: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  IBAN: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/,
  TAX_ID_US: /^\d{2}-?\d{7}$/,
  TAX_ID_EU: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/,
  VAT_NUMBER: /^[A-Z]{2}[0-9A-Z]{2,12}$/,
  CURRENCY_CODE: /^[A-Z]{3}$/,
  BANK_ACCOUNT: /^[0-9]{8,20}$/,
  
  // Inventory patterns
  PART_NUMBER: /^[A-Z0-9-]{3,20}$/,
  SERIAL_NUMBER: /^[A-Z0-9-]{5,30}$/,
  LOT_NUMBER: /^[A-Z0-9-]{3,15}$/,
  BATCH_NUMBER: /^[A-Z0-9-]{3,15}$/,
  WAREHOUSE_CODE: /^[A-Z0-9]{2,10}$/,
  LOCATION_CODE: /^[A-Z0-9-]{3,15}$/,
  BIN_LOCATION: /^[A-Z0-9-]{2,10}$/,
  
  // HR patterns
  EMPLOYEE_ID: /^[A-Z0-9]{3,15}$/,
  DEPARTMENT_CODE: /^[A-Z0-9]{2,10}$/,
  POSITION_CODE: /^[A-Z0-9]{2,10}$/,
  PAYROLL_ID: /^[A-Z0-9]{3,15}$/,
  SSN_US: /^\d{3}-?\d{2}-?\d{4}$/,
  NATIONAL_ID: /^[A-Z0-9]{5,20}$/,
  
  // CRM patterns
  CUSTOMER_ID: /^[A-Z0-9]{3,15}$/,
  LEAD_ID: /^[A-Z0-9]{3,15}$/,
  OPPORTUNITY_ID: /^[A-Z0-9]{3,15}$/,
  CASE_NUMBER: /^[A-Z0-9]{3,15}$/,
  TICKET_NUMBER: /^[A-Z0-9]{3,15}$/,
  
  // Project Management patterns
  PROJECT_CODE: /^[A-Z0-9-]{3,15}$/,
  TASK_ID: /^[A-Z0-9-]{3,15}$/,
  MILESTONE_CODE: /^[A-Z0-9-]{3,15}$/,
  RESOURCE_ID: /^[A-Z0-9]{3,15}$/,
  
  // Manufacturing patterns
  WORK_ORDER: /^[A-Z0-9-]{3,15}$/,
  PRODUCTION_LINE: /^[A-Z0-9]{2,10}$/,
  EQUIPMENT_ID: /^[A-Z0-9-]{3,15}$/,
  QUALITY_LOT: /^[A-Z0-9-]{3,15}$/,
  
  // Compliance patterns
  LICENSE_NUMBER: /^[A-Z0-9-]{3,20}$/,
  PERMIT_NUMBER: /^[A-Z0-9-]{3,20}$/,
  CERTIFICATE_NUMBER: /^[A-Z0-9-]{3,20}$/,
  AUDIT_ID: /^[A-Z0-9-]{3,15}$/,
  
  // API patterns
  API_KEY: /^[A-Za-z0-9]{20,100}$/,
  SECRET_KEY: /^[A-Za-z0-9]{20,100}$/,
  TOKEN: /^[A-Za-z0-9._-]{20,100}$/,
  WEBHOOK_URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Database patterns
  TABLE_NAME: /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/,
  COLUMN_NAME: /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/,
  INDEX_NAME: /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/,
  
  // Configuration patterns
  ENVIRONMENT: /^(development|staging|production|test)$/,
  FEATURE_FLAG: /^[a-zA-Z_][a-zA-Z0-9_]{0,50}$/,
  CONFIG_KEY: /^[a-zA-Z_][a-zA-Z0-9_]{0,50}$/,
  
  // Security patterns
  PASSWORD_HASH: /^\$2[aby]\$\d{2}\$[./0-9A-Za-z]{53}$/,
  JWT_TOKEN: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Performance patterns
  MEMORY_SIZE: /^\d+(\.\d+)?\s*(KB|MB|GB|TB)$/i,
  CPU_CORES: /^[1-9]\d*$/,
  DISK_SIZE: /^\d+(\.\d+)?\s*(KB|MB|GB|TB)$/i,
  
  // Monitoring patterns
  METRIC_NAME: /^[a-zA-Z_][a-zA-Z0-9_]{0,50}$/,
  ALERT_NAME: /^[a-zA-Z_][a-zA-Z0-9_]{0,50}$/,
  LOG_LEVEL: /^(DEBUG|INFO|WARN|ERROR|FATAL)$/,
} as const;

/**
 * Generic validation function
 */
export function validate(value: any, rules: ValidationRule[]): ValidationResult {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
}

/**
 * Validation rule type
 */
export type ValidationRule = (value: any) => ValidationResult;

/**
 * Required field validation
 */
export function required(message: string = "This field is required"): ValidationRule {
  return (value: any): ValidationResult => {
    if (value === null || value === undefined || value === "" || (typeof value === "string" && value.trim() === "")) {
      return {
        isValid: false,
        message,
        errorCode: VALIDATION_ERROR_CODES.REQUIRED_FIELD,
      };
    }
    return { isValid: true };
  };
}

/**
 * Minimum length validation
 */
export function minLength(min: number, message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (typeof value === "string" && value.length < min) {
      return {
        isValid: false,
        message: message || `Must be at least ${min} characters long`,
        errorCode: VALIDATION_ERROR_CODES.TEXT_TOO_SHORT,
      };
    }
    return { isValid: true };
  };
}

/**
 * Maximum length validation
 */
export function maxLength(max: number, message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (typeof value === "string" && value.length > max) {
      return {
        isValid: false,
        message: message || `Must be no more than ${max} characters long`,
        errorCode: VALIDATION_ERROR_CODES.TEXT_TOO_LONG,
      };
    }
    return { isValid: true };
  };
}

/**
 * Pattern validation using regex
 */
export function pattern(regex: RegExp, message: string, errorCode?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (typeof value === "string" && !regex.test(value)) {
      return {
        isValid: false,
        message,
        errorCode: errorCode || VALIDATION_ERROR_CODES.INVALID_FORMAT,
      };
    }
    return { isValid: true };
  };
}

/**
 * Email validation
 */
export function email(message: string = "Please enter a valid email address"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.EMAIL, message, VALIDATION_ERROR_CODES.INVALID_EMAIL);
}

/**
 * Phone number validation
 */
export function phone(message: string = "Please enter a valid phone number"): ValidationRule {
  return (value: any): ValidationResult => {
    if (typeof value === "string") {
      const cleanPhone = value.replace(/\s/g, '');
      if (!VALIDATION_PATTERNS.PHONE.test(cleanPhone)) {
        return {
          isValid: false,
          message,
          errorCode: VALIDATION_ERROR_CODES.INVALID_PHONE,
        };
      }
    }
    return { isValid: true };
  };
}

/**
 * Username validation
 */
export function username(message: string = "Username must be 3-30 characters long and contain only letters, numbers, underscores, and hyphens"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.USERNAME, message, VALIDATION_ERROR_CODES.INVALID_USERNAME);
}

/**
 * URL validation
 */
export function url(message: string = "Please enter a valid URL"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.URL, message, VALIDATION_ERROR_CODES.INVALID_URL);
}

/**
 * Name validation (for first name, last name, etc.)
 */
export function name(message: string = "Name can only contain letters, spaces, hyphens, and apostrophes"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.NAME, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Number validation
 */
export function number(message: string = "Please enter a valid number"): ValidationRule {
  return (value: any): ValidationResult => {
    if (value !== null && value !== undefined && value !== "" && isNaN(Number(value))) {
      return {
        isValid: false,
        message,
        errorCode: VALIDATION_ERROR_CODES.INVALID_NUMBER,
      };
    }
    return { isValid: true };
  };
}

/**
 * Minimum number validation
 */
export function minNumber(min: number, message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    const num = Number(value);
    if (!isNaN(num) && num < min) {
      return {
        isValid: false,
        message: message || `Must be at least ${min}`,
        errorCode: VALIDATION_ERROR_CODES.NUMBER_TOO_SMALL,
      };
    }
    return { isValid: true };
  };
}

/**
 * Maximum number validation
 */
export function maxNumber(max: number, message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    const num = Number(value);
    if (!isNaN(num) && num > max) {
      return {
        isValid: false,
        message: message || `Must be no more than ${max}`,
        errorCode: VALIDATION_ERROR_CODES.NUMBER_TOO_LARGE,
      };
    }
    return { isValid: true };
  };
}

/**
 * Password strength validation
 */
export function passwordStrength(options: {
  minLength?: number;
  requireLowercase?: boolean;
  requireUppercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
  customMessage?: string;
} = {}): ValidationRule {
  const {
    minLength: minLen = 6,
    requireLowercase = true,
    requireUppercase = true,
    requireNumber = true,
    requireSpecial = false,
    customMessage,
  } = options;

  return (value: any): ValidationResult => {
    if (typeof value !== "string") {
      return {
        isValid: false,
        message: customMessage || "Password must be a string",
        errorCode: VALIDATION_ERROR_CODES.INVALID_FORMAT,
      };
    }

    // Check minimum length
    if (value.length < minLen) {
      return {
        isValid: false,
        message: customMessage || `Password must be at least ${minLen} characters long`,
        errorCode: VALIDATION_ERROR_CODES.PASSWORD_TOO_SHORT,
      };
    }

    // Check lowercase requirement
    if (requireLowercase && !VALIDATION_PATTERNS.PASSWORD_LOWERCASE.test(value)) {
      return {
        isValid: false,
        message: customMessage || "Password must contain at least one lowercase letter",
        errorCode: VALIDATION_ERROR_CODES.PASSWORD_MISSING_LOWERCASE,
      };
    }

    // Check uppercase requirement
    if (requireUppercase && !VALIDATION_PATTERNS.PASSWORD_UPPERCASE.test(value)) {
      return {
        isValid: false,
        message: customMessage || "Password must contain at least one uppercase letter",
        errorCode: VALIDATION_ERROR_CODES.PASSWORD_MISSING_UPPERCASE,
      };
    }

    // Check number requirement
    if (requireNumber && !VALIDATION_PATTERNS.PASSWORD_NUMBER.test(value)) {
      return {
        isValid: false,
        message: customMessage || "Password must contain at least one number",
        errorCode: VALIDATION_ERROR_CODES.PASSWORD_MISSING_NUMBER,
      };
    }

    // Check special character requirement
    if (requireSpecial && !VALIDATION_PATTERNS.PASSWORD_SPECIAL.test(value)) {
      return {
        isValid: false,
        message: customMessage || "Password must contain at least one special character",
        errorCode: VALIDATION_ERROR_CODES.PASSWORD_MISSING_SPECIAL,
      };
    }

    return { isValid: true };
  };
}

/**
 * Password confirmation validation
 */
export function passwordConfirmation(password: string, message: string = "Passwords do not match"): ValidationRule {
  return (value: any): ValidationResult => {
    if (typeof value === "string" && value !== password) {
      return {
        isValid: false,
        message,
        errorCode: VALIDATION_ERROR_CODES.PASSWORDS_DO_NOT_MATCH,
      };
    }
    return { isValid: true };
  };
}

/**
 * Custom validation function
 */
export function custom(validator: (value: any) => boolean, message: string, errorCode?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (!validator(value)) {
      return {
        isValid: false,
        message,
        errorCode: errorCode || VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

/**
 * Credit card validation
 */
export function creditCard(message: string = "Please enter a valid credit card number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.CREDIT_CARD, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * CVV validation
 */
export function cvv(message: string = "Please enter a valid CVV"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.CVV, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Expiry date validation
 */
export function expiryDate(message: string = "Please enter a valid expiry date (MM/YY)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.EXPIRY_DATE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * ZIP code validation (US format)
 */
export function zipCodeUS(message: string = "Please enter a valid US ZIP code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.ZIP_CODE_US, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * ZIP code validation (Canadian format)
 */
export function zipCodeCA(message: string = "Please enter a valid Canadian postal code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.ZIP_CODE_CA, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * SKU validation
 */
export function sku(message: string = "SKU must contain only uppercase letters, numbers, and hyphens"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.SKU, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * ISBN validation
 */
export function isbn(message: string = "Please enter a valid ISBN"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.ISBN, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * UPC validation
 */
export function upc(message: string = "Please enter a valid UPC code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.UPC, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * EAN validation
 */
export function ean(message: string = "Please enter a valid EAN code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.EAN, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Twitter handle validation
 */
export function twitterHandle(message: string = "Please enter a valid Twitter handle"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.TWITTER_HANDLE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Instagram handle validation
 */
export function instagramHandle(message: string = "Please enter a valid Instagram handle"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.INSTAGRAM_HANDLE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * LinkedIn URL validation
 */
export function linkedinUrl(message: string = "Please enter a valid LinkedIn profile URL"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.LINKEDIN_URL, message, VALIDATION_ERROR_CODES.INVALID_URL);
}

/**
 * Hex color validation
 */
export function hexColor(message: string = "Please enter a valid hex color code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.HEX_COLOR, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * RGB color validation
 */
export function rgbColor(message: string = "Please enter a valid RGB color value"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.RGB_COLOR, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * HSL color validation
 */
export function hslColor(message: string = "Please enter a valid HSL color value"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.HSL_COLOR, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * IP address validation
 */
export function ipAddress(message: string = "Please enter a valid IP address"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.IP_ADDRESS, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * MAC address validation
 */
export function macAddress(message: string = "Please enter a valid MAC address"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.MAC_ADDRESS, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Port number validation
 */
export function portNumber(message: string = "Please enter a valid port number (1-65535)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.PORT_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Currency validation (USD format)
 */
export function currencyUSD(message: string = "Please enter a valid USD amount"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.CURRENCY_USD, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Currency validation (EUR format)
 */
export function currencyEUR(message: string = "Please enter a valid EUR amount"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.CURRENCY_EUR, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Time validation (12-hour format)
 */
export function time12H(message: string = "Please enter a valid time in 12-hour format (HH:MM AM/PM)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.TIME_12H, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Time validation (24-hour format)
 */
export function time24H(message: string = "Please enter a valid time in 24-hour format (HH:MM)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.TIME_24H, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Latitude validation
 */
export function latitude(message: string = "Please enter a valid latitude (-90 to 90)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.LATITUDE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Longitude validation
 */
export function longitude(message: string = "Please enter a valid longitude (-180 to 180)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.LONGITUDE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Semantic version validation
 */
export function semanticVersion(message: string = "Please enter a valid semantic version (e.g., 1.0.0)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.SEMANTIC_VERSION, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * File type validation
 */
export function fileType(allowedTypes: string[], message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (value instanceof File) {
      if (!allowedTypes.includes(value.type)) {
        return {
          isValid: false,
          message: message || `File type must be one of: ${allowedTypes.join(', ')}`,
          errorCode: VALIDATION_ERROR_CODES.INVALID_FORMAT,
        };
      }
    }
    return { isValid: true };
  };
}

/**
 * File size validation
 */
export function fileSize(maxSizeInMB: number, message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (value instanceof File) {
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (value.size > maxSizeInBytes) {
        return {
          isValid: false,
          message: message || `File size must be less than ${maxSizeInMB}MB`,
          errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
        };
      }
    }
    return { isValid: true };
  };
}

/**
 * Image file validation
 */
export function imageFile(message: string = "Please select an image file"): ValidationRule {
  return fileType(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml'], message);
}

/**
 * Document file validation
 */
export function documentFile(message: string = "Please select a document file"): ValidationRule {
  return fileType(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'], message);
}

/**
 * Date validation
 */
export function date(message: string = "Please enter a valid date"): ValidationRule {
  return (value: any): ValidationResult => {
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return { isValid: true };
    }
    return {
      isValid: false,
      message,
      errorCode: VALIDATION_ERROR_CODES.INVALID_FORMAT,
    };
  };
}

/**
 * Future date validation
 */
export function futureDate(message: string = "Date must be in the future"): ValidationRule {
  return (value: any): ValidationResult => {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime()) && date > new Date()) {
        return { isValid: true };
      }
    }
    return {
      isValid: false,
      message,
      errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
    };
  };
}

/**
 * Past date validation
 */
export function pastDate(message: string = "Date must be in the past"): ValidationRule {
  return (value: any): ValidationResult => {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime()) && date < new Date()) {
        return { isValid: true };
      }
    }
    return {
      isValid: false,
      message,
      errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
    };
  };
}

/**
 * Age validation
 */
export function age(minAge: number, maxAge: number = 120, message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (typeof value === 'string') {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
      
      if (actualAge >= minAge && actualAge <= maxAge) {
        return { isValid: true };
      }
    }
    return {
      isValid: false,
      message: message || `Age must be between ${minAge} and ${maxAge} years`,
      errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
    };
  };
}

// ==================== ERP ENTERPRISE VALIDATIONS ====================

/**
 * Financial Validations
 */
export function accountNumber(message: string = "Please enter a valid account number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.ACCOUNT_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function routingNumber(message: string = "Please enter a valid routing number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.ROUTING_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function swiftCode(message: string = "Please enter a valid SWIFT code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.SWIFT_CODE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function iban(message: string = "Please enter a valid IBAN"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.IBAN, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function taxIdUS(message: string = "Please enter a valid US Tax ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.TAX_ID_US, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function vatNumber(message: string = "Please enter a valid VAT number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.VAT_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function currencyCode(message: string = "Please enter a valid currency code (e.g., USD, EUR)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.CURRENCY_CODE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function bankAccount(message: string = "Please enter a valid bank account number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.BANK_ACCOUNT, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Inventory Validations
 */
export function partNumber(message: string = "Please enter a valid part number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.PART_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function serialNumber(message: string = "Please enter a valid serial number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.SERIAL_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function lotNumber(message: string = "Please enter a valid lot number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.LOT_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function batchNumber(message: string = "Please enter a valid batch number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.BATCH_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function warehouseCode(message: string = "Please enter a valid warehouse code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.WAREHOUSE_CODE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function locationCode(message: string = "Please enter a valid location code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.LOCATION_CODE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function binLocation(message: string = "Please enter a valid bin location"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.BIN_LOCATION, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * HR Validations
 */
export function employeeId(message: string = "Please enter a valid employee ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.EMPLOYEE_ID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function departmentCode(message: string = "Please enter a valid department code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.DEPARTMENT_CODE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function positionCode(message: string = "Please enter a valid position code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.POSITION_CODE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function payrollId(message: string = "Please enter a valid payroll ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.PAYROLL_ID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function ssnUS(message: string = "Please enter a valid US Social Security Number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.SSN_US, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function nationalId(message: string = "Please enter a valid national ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.NATIONAL_ID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * CRM Validations
 */
export function customerId(message: string = "Please enter a valid customer ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.CUSTOMER_ID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function leadId(message: string = "Please enter a valid lead ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.LEAD_ID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function opportunityId(message: string = "Please enter a valid opportunity ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.OPPORTUNITY_ID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function caseNumber(message: string = "Please enter a valid case number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.CASE_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function ticketNumber(message: string = "Please enter a valid ticket number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.TICKET_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Project Management Validations
 */
export function projectCode(message: string = "Please enter a valid project code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.PROJECT_CODE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function taskId(message: string = "Please enter a valid task ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.TASK_ID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function milestoneCode(message: string = "Please enter a valid milestone code"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.MILESTONE_CODE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function resourceId(message: string = "Please enter a valid resource ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.RESOURCE_ID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Manufacturing Validations
 */
export function workOrder(message: string = "Please enter a valid work order"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.WORK_ORDER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function productionLine(message: string = "Please enter a valid production line"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.PRODUCTION_LINE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function equipmentId(message: string = "Please enter a valid equipment ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.EQUIPMENT_ID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function qualityLot(message: string = "Please enter a valid quality lot"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.QUALITY_LOT, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Compliance Validations
 */
export function licenseNumber(message: string = "Please enter a valid license number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.LICENSE_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function permitNumber(message: string = "Please enter a valid permit number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.PERMIT_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function certificateNumber(message: string = "Please enter a valid certificate number"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.CERTIFICATE_NUMBER, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function auditId(message: string = "Please enter a valid audit ID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.AUDIT_ID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * API & Integration Validations
 */
export function apiKey(message: string = "Please enter a valid API key"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.API_KEY, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function secretKey(message: string = "Please enter a valid secret key"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.SECRET_KEY, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function token(message: string = "Please enter a valid token"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.TOKEN, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function webhookUrl(message: string = "Please enter a valid webhook URL"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.WEBHOOK_URL, message, VALIDATION_ERROR_CODES.INVALID_URL);
}

/**
 * Database Validations
 */
export function tableName(message: string = "Please enter a valid table name"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.TABLE_NAME, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function columnName(message: string = "Please enter a valid column name"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.COLUMN_NAME, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function indexName(message: string = "Please enter a valid index name"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.INDEX_NAME, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Configuration Validations
 */
export function environment(message: string = "Please enter a valid environment (development, staging, production, test)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.ENVIRONMENT, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function featureFlag(message: string = "Please enter a valid feature flag name"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.FEATURE_FLAG, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function configKey(message: string = "Please enter a valid configuration key"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.CONFIG_KEY, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Security Validations
 */
export function passwordHash(message: string = "Please enter a valid password hash"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.PASSWORD_HASH, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function jwtToken(message: string = "Please enter a valid JWT token"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.JWT_TOKEN, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function uuid(message: string = "Please enter a valid UUID"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.UUID, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Performance Validations
 */
export function memorySize(message: string = "Please enter a valid memory size (e.g., 512MB, 2GB)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.MEMORY_SIZE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function cpuCores(message: string = "Please enter a valid number of CPU cores"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.CPU_CORES, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function diskSize(message: string = "Please enter a valid disk size (e.g., 100GB, 1TB)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.DISK_SIZE, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Monitoring Validations
 */
export function metricName(message: string = "Please enter a valid metric name"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.METRIC_NAME, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function alertName(message: string = "Please enter a valid alert name"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.ALERT_NAME, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

export function logLevel(message: string = "Please enter a valid log level (DEBUG, INFO, WARN, ERROR, FATAL)"): ValidationRule {
  return pattern(VALIDATION_PATTERNS.LOG_LEVEL, message, VALIDATION_ERROR_CODES.INVALID_FORMAT);
}

/**
 * Business Logic Validations
 */
export function businessRule(rule: (value: any, context?: any) => boolean, message: string, errorCode?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (!rule(value)) {
      return {
        isValid: false,
        message,
        errorCode: errorCode || VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

export function inventoryLevel(minLevel: number, maxLevel: number, message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < minLevel || numValue > maxLevel) {
      return {
        isValid: false,
        message: message || `Inventory level must be between ${minLevel} and ${maxLevel}`,
        errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

export function priceRange(minPrice: number, maxPrice: number, message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < minPrice || numValue > maxPrice) {
      return {
        isValid: false,
        message: message || `Price must be between $${minPrice} and $${maxPrice}`,
        errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

export function percentage(message: string = "Please enter a valid percentage (0-100)"): ValidationRule {
  return (value: any): ValidationResult => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      return {
        isValid: false,
        message,
        errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

export function discountRate(message: string = "Please enter a valid discount rate (0-100%)"): ValidationRule {
  return percentage(message);
}

export function taxRate(message: string = "Please enter a valid tax rate (0-100%)"): ValidationRule {
  return percentage(message);
}

export function commissionRate(message: string = "Please enter a valid commission rate (0-100%)"): ValidationRule {
  return percentage(message);
}

/**
 * Workflow Validations
 */
export function workflowStatus(allowedStatuses: string[], message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (!allowedStatuses.includes(value)) {
      return {
        isValid: false,
        message: message || `Status must be one of: ${allowedStatuses.join(', ')}`,
        errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

export function priority(allowedPriorities: string[], message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (!allowedPriorities.includes(value)) {
      return {
        isValid: false,
        message: message || `Priority must be one of: ${allowedPriorities.join(', ')}`,
        errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

export function category(allowedCategories: string[], message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (!allowedCategories.includes(value)) {
      return {
        isValid: false,
        message: message || `Category must be one of: ${allowedCategories.join(', ')}`,
        errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

/**
 * Data Integrity Validations
 */
export function uniqueInList(list: any[], message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    const count = list.filter(item => item === value).length;
    if (count > 1) {
      return {
        isValid: false,
        message: message || "This value must be unique",
        errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

export function existsInList(list: any[], message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (!list.includes(value)) {
      return {
        isValid: false,
        message: message || "This value must exist in the allowed list",
        errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

export function notExistsInList(list: any[], message?: string): ValidationRule {
  return (value: any): ValidationResult => {
    if (list.includes(value)) {
      return {
        isValid: false,
        message: message || "This value already exists",
        errorCode: VALIDATION_ERROR_CODES.CONSTRAINT_VIOLATION,
      };
    }
    return { isValid: true };
  };
}

/**
 * Conditional validation - only validate if condition is true
 */
export function conditional(condition: (value: any) => boolean, rule: ValidationRule): ValidationRule {
  return (value: any): ValidationResult => {
    if (condition(value)) {
      return rule(value);
    }
    return { isValid: true };
  };
}

/**
 * Array validation - validate each item in an array
 */
export function arrayOf(rules: ValidationRule[], message: string = "One or more items in the array are invalid"): ValidationRule {
  return (value: any): ValidationResult => {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const result = validate(value[i], rules);
        if (!result.isValid) {
          return {
            isValid: false,
            message: `${message} (item ${i + 1})`,
            errorCode: result.errorCode,
          };
        }
      }
    }
    return { isValid: true };
  };
}

/**
 * Object validation - validate properties of an object
 */
export function objectOf(validators: Record<string, ValidationRule[]>, message: string = "One or more object properties are invalid"): ValidationRule {
  return (value: any): ValidationResult => {
    if (typeof value === "object" && value !== null) {
      for (const [key, rules] of Object.entries(validators)) {
        const result = validate(value[key], rules);
        if (!result.isValid) {
          return {
            isValid: false,
            message: `${message} (${key})`,
            errorCode: result.errorCode,
          };
        }
      }
    }
    return { isValid: true };
  };
}

/**
 * Predefined validation sets for common use cases
 */
export const VALIDATION_SETS = {
  // Login form validation
  LOGIN_FORM: {
    username: [required(), username()],
    password: [required()],
  },

  // Registration form validation
  REGISTRATION_FORM: {
    firstName: [required(), name(), minLength(2), maxLength(50)],
    lastName: [required(), name(), minLength(2), maxLength(50)],
    email: [required(), email()],
    username: [required(), username()],
    password: [required(), passwordStrength({ minLength: 8 })],
    confirmPassword: [required()],
    phoneNumber: [required(), phone()],
    termsAccepted: [required(), custom((value: boolean) => value === true, "You must accept the terms")],
  },

  // Profile form validation
  PROFILE_FORM: {
    firstName: [required(), name(), minLength(2), maxLength(50)],
    lastName: [required(), name(), minLength(2), maxLength(50)],
    phoneNumber: [required(), phone()],
    email: [required(), email()],
  },

  // Password change form validation
  PASSWORD_CHANGE_FORM: {
    currentPassword: [required()],
    newPassword: [required(), passwordStrength()],
    confirmPassword: [required()],
  },

  // Contact form validation
  CONTACT_FORM: {
    name: [required(), name(), minLength(2), maxLength(100)],
    email: [required(), email()],
    phone: [phone()], // Optional
    subject: [required(), minLength(5), maxLength(200)],
    message: [required(), minLength(10), maxLength(2000)],
  },

  // Settings form validation
  SETTINGS_FORM: {
    appName: [required(), minLength(2), maxLength(100)],
    appUrl: [required(), url()],
    adminEmail: [required(), email()],
    supportEmail: [email()], // Optional
    phoneNumber: [phone()], // Optional
    maxFileSize: [required(), number(), minNumber(1), maxNumber(100)],
    allowedFileTypes: [required(), minLength(1)],
  },

  // Search form validation
  SEARCH_FORM: {
    query: [required(), minLength(2), maxLength(100)],
    category: [required()],
    minPrice: [number(), minNumber(0)],
    maxPrice: [number(), minNumber(0)],
  },

  // File upload validation
  FILE_UPLOAD_FORM: {
    file: [required(), custom((value: File) => value instanceof File, "Please select a file")],
    description: [minLength(0), maxLength(500)],
    tags: [arrayOf([minLength(2), maxLength(20)], "All tags must be 2-20 characters")],
  },

  // Address form validation
  ADDRESS_FORM: {
    street: [required(), minLength(5), maxLength(200)],
    city: [required(), name(), minLength(2), maxLength(100)],
    state: [required(), name(), minLength(2), maxLength(100)],
    zipCode: [required(), pattern(/^\d{5}(-\d{4})?$/, "Please enter a valid zip code")],
    country: [required(), name(), minLength(2), maxLength(100)],
  },

  // Payment form validation
  PAYMENT_FORM: {
    cardNumber: [required(), pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, "Please enter a valid card number")],
    expiryDate: [required(), pattern(/^(0[1-9]|1[0-2])\/\d{2}$/, "Please enter a valid expiry date (MM/YY)")],
    cvv: [required(), pattern(/^\d{3,4}$/, "Please enter a valid CVV")],
    cardholderName: [required(), name(), minLength(2), maxLength(100)],
    billingAddress: [required(), minLength(10), maxLength(200)],
  },

  // User management form validation
  USER_MANAGEMENT_FORM: {
    firstName: [required(), name(), minLength(2), maxLength(50)],
    lastName: [required(), name(), minLength(2), maxLength(50)],
    email: [required(), email()],
    username: [required(), username()],
    role: [required()],
    department: [required(), minLength(2), maxLength(100)],
    phoneNumber: [phone()], // Optional
    isActive: [required(), custom((value: boolean) => typeof value === 'boolean', "Please select a status")],
  },


  // Generic form validation sets
  EMAIL_FIELD: [required(), email()],
  USERNAME_FIELD: [required(), username()],
  PHONE_FIELD: [required(), phone()],
  NAME_FIELD: [required(), name(), minLength(2), maxLength(50)],
  URL_FIELD: [required(), url()],
  NUMBER_FIELD: [required(), number()],
  PASSWORD_FIELD: [required(), passwordStrength()],
  TEXT_FIELD: [required(), minLength(1), maxLength(255)],
  LONG_TEXT_FIELD: [required(), minLength(10), maxLength(2000)],
  SHORT_TEXT_FIELD: [required(), minLength(1), maxLength(50)],

  // Optional field validation sets
  OPTIONAL_EMAIL: [email()],
  OPTIONAL_PHONE: [phone()],
  OPTIONAL_NAME: [name(), minLength(2), maxLength(50)],
  OPTIONAL_URL: [url()],
  OPTIONAL_NUMBER: [number()],
  OPTIONAL_TEXT: [minLength(0), maxLength(255)],

  // Date validation sets
  DATE_FIELD: [required(), custom((value: string) => !isNaN(Date.parse(value)), "Please enter a valid date")],
  FUTURE_DATE_FIELD: [required(), custom((value: string) => new Date(value) > new Date(), "Date must be in the future")],
  PAST_DATE_FIELD: [required(), custom((value: string) => new Date(value) < new Date(), "Date must be in the past")],

  // File validation sets
  IMAGE_FILE: [required(), custom((value: File) => value.type.startsWith('image/'), "Please select an image file")],
  DOCUMENT_FILE: [required(), custom((value: File) => value.type.includes('pdf') || value.type.includes('document'), "Please select a document file")],
  ANY_FILE: [required(), custom((value: File) => value instanceof File, "Please select a file")],

  // Array validation sets
  TAGS_FIELD: [arrayOf([minLength(2), maxLength(20)], "All tags must be 2-20 characters")],
  MULTIPLE_SELECT_FIELD: [required(), custom((value: any[]) => Array.isArray(value) && value.length > 0, "Please select at least one option")],

  // Boolean validation sets
  CHECKBOX_FIELD: [required(), custom((value: boolean) => value === true, "This field must be checked")],
  OPTIONAL_CHECKBOX_FIELD: [custom((value: boolean) => typeof value === 'boolean', "Please select a valid option")],

  // ==================== ERP ENTERPRISE VALIDATION SETS ====================

  // Financial Management Forms
  BANK_ACCOUNT_FORM: {
    accountNumber: [required(), accountNumber()],
    routingNumber: [required(), routingNumber()],
    accountType: [required(), workflowStatus(['checking', 'savings', 'business'], "Please select a valid account type")],
    bankName: [required(), minLength(2), maxLength(100)],
    accountHolderName: [required(), name(), minLength(2), maxLength(100)],
  },

  PAYMENT_METHOD_FORM: {
    cardNumber: [required(), creditCard()],
    expiryDate: [required(), expiryDate()],
    cvv: [required(), cvv()],
    cardholderName: [required(), name(), minLength(2), maxLength(100)],
    billingAddress: [required(), minLength(10), maxLength(200)],
    zipCode: [required(), zipCodeUS()],
  },

  INVOICE_FORM: {
    invoiceNumber: [required(), pattern(/^INV-\d{6,10}$/, "Invoice number must be in format INV-XXXXXX")],
    customerId: [required(), customerId()],
    issueDate: [required(), date()],
    dueDate: [required(), date(), futureDate()],
    amount: [required(), number(), minNumber(0.01)],
    taxRate: [required(), taxRate()],
    currency: [required(), currencyCode()],
  },

  EXPENSE_FORM: {
    expenseId: [required(), pattern(/^EXP-\d{6,10}$/, "Expense ID must be in format EXP-XXXXXX")],
    employeeId: [required(), employeeId()],
    amount: [required(), number(), minNumber(0.01)],
    category: [required(), category(['travel', 'meals', 'office', 'transportation', 'other'])],
    description: [required(), minLength(10), maxLength(500)],
    receiptFile: [required(), imageFile()],
    expenseDate: [required(), date()],
  },

  // Inventory Management Forms
  PRODUCT_FORM: {
    partNumber: [required(), partNumber()],
    name: [required(), minLength(2), maxLength(200)],
    description: [required(), minLength(10), maxLength(2000)],
    category: [required(), category(['electronics', 'clothing', 'books', 'home', 'automotive'])],
    price: [required(), number(), minNumber(0.01)],
    cost: [required(), number(), minNumber(0)],
    sku: [required(), sku()],
    stock: [required(), number(), minNumber(0)],
    minStock: [required(), number(), minNumber(0)],
    maxStock: [required(), number(), minNumber(0)],
    warehouseCode: [required(), warehouseCode()],
    locationCode: [required(), locationCode()],
    binLocation: [binLocation()],
  },

  INVENTORY_ADJUSTMENT_FORM: {
    adjustmentId: [required(), pattern(/^ADJ-\d{6,10}$/, "Adjustment ID must be in format ADJ-XXXXXX")],
    partNumber: [required(), partNumber()],
    adjustmentType: [required(), workflowStatus(['increase', 'decrease', 'transfer'], "Please select adjustment type")],
    quantity: [required(), number(), minNumber(1)],
    reason: [required(), minLength(10), maxLength(500)],
    employeeId: [required(), employeeId()],
    adjustmentDate: [required(), date()],
  },

  WAREHOUSE_FORM: {
    warehouseCode: [required(), warehouseCode()],
    name: [required(), minLength(2), maxLength(100)],
    address: [required(), minLength(10), maxLength(200)],
    city: [required(), name(), minLength(2), maxLength(100)],
    state: [required(), name(), minLength(2), maxLength(100)],
    zipCode: [required(), zipCodeUS()],
    country: [required(), name(), minLength(2), maxLength(100)],
    managerId: [required(), employeeId()],
    capacity: [required(), number(), minNumber(1)],
  },

  // HR Management Forms
  EMPLOYEE_FORM: {
    employeeId: [required(), employeeId()],
    firstName: [required(), name(), minLength(2), maxLength(50)],
    lastName: [required(), name(), minLength(2), maxLength(50)],
    email: [required(), email()],
    phone: [required(), phone()],
    departmentCode: [required(), departmentCode()],
    positionCode: [required(), positionCode()],
    hireDate: [required(), date()],
    salary: [required(), number(), minNumber(0)],
    ssn: [required(), ssnUS()],
    address: [required(), minLength(10), maxLength(200)],
  },

  PAYROLL_FORM: {
    payrollId: [required(), payrollId()],
    employeeId: [required(), employeeId()],
    payPeriod: [required(), workflowStatus(['weekly', 'bi-weekly', 'monthly'], "Please select pay period")],
    grossPay: [required(), number(), minNumber(0)],
    deductions: [required(), number(), minNumber(0)],
    netPay: [required(), number(), minNumber(0)],
    payDate: [required(), date()],
  },

  TIMESHEET_FORM: {
    employeeId: [required(), employeeId()],
    projectCode: [required(), projectCode()],
    taskId: [required(), taskId()],
    hoursWorked: [required(), number(), minNumber(0.1), maxNumber(24)],
    workDate: [required(), date()],
    description: [required(), minLength(10), maxLength(500)],
  },

  // CRM Forms
  CUSTOMER_FORM: {
    customerId: [required(), customerId()],
    companyName: [required(), minLength(2), maxLength(200)],
    contactName: [required(), name(), minLength(2), maxLength(100)],
    email: [required(), email()],
    phone: [required(), phone()],
    address: [required(), minLength(10), maxLength(200)],
    city: [required(), name(), minLength(2), maxLength(100)],
    state: [required(), name(), minLength(2), maxLength(100)],
    zipCode: [required(), zipCodeUS()],
    country: [required(), name(), minLength(2), maxLength(100)],
    industry: [required(), category(['technology', 'manufacturing', 'retail', 'healthcare', 'finance'])],
  },

  LEAD_FORM: {
    leadId: [required(), leadId()],
    firstName: [required(), name(), minLength(2), maxLength(50)],
    lastName: [required(), name(), minLength(2), maxLength(50)],
    email: [required(), email()],
    phone: [phone()],
    company: [minLength(2), maxLength(200)],
    source: [required(), category(['website', 'referral', 'cold-call', 'email', 'social'])],
    status: [required(), workflowStatus(['new', 'contacted', 'qualified', 'proposal', 'closed'])],
    priority: [required(), priority(['low', 'medium', 'high', 'urgent'])],
  },

  OPPORTUNITY_FORM: {
    opportunityId: [required(), opportunityId()],
    customerId: [required(), customerId()],
    leadId: [leadId()],
    name: [required(), minLength(2), maxLength(200)],
    value: [required(), number(), minNumber(0.01)],
    probability: [required(), percentage()],
    stage: [required(), workflowStatus(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'])],
    expectedCloseDate: [required(), date(), futureDate()],
    description: [required(), minLength(10), maxLength(1000)],
  },

  // Project Management Forms
  PROJECT_FORM: {
    projectCode: [required(), projectCode()],
    name: [required(), minLength(2), maxLength(200)],
    description: [required(), minLength(10), maxLength(2000)],
    startDate: [required(), date()],
    endDate: [required(), date(), futureDate()],
    budget: [required(), number(), minNumber(0)],
    status: [required(), workflowStatus(['planning', 'active', 'on-hold', 'completed', 'cancelled'])],
    priority: [required(), priority(['low', 'medium', 'high', 'critical'])],
    managerId: [required(), employeeId()],
    customerId: [customerId()],
  },

  TASK_FORM: {
    taskId: [required(), taskId()],
    projectCode: [required(), projectCode()],
    name: [required(), minLength(2), maxLength(200)],
    description: [required(), minLength(10), maxLength(1000)],
    assignedTo: [required(), employeeId()],
    startDate: [required(), date()],
    dueDate: [required(), date(), futureDate()],
    estimatedHours: [required(), number(), minNumber(0.1)],
    actualHours: [number(), minNumber(0)],
    status: [required(), workflowStatus(['not-started', 'in-progress', 'completed', 'blocked'])],
    priority: [required(), priority(['low', 'medium', 'high', 'urgent'])],
  },

  // Manufacturing Forms
  WORK_ORDER_FORM: {
    workOrder: [required(), workOrder()],
    partNumber: [required(), partNumber()],
    quantity: [required(), number(), minNumber(1)],
    productionLine: [required(), productionLine()],
    startDate: [required(), date()],
    endDate: [required(), date(), futureDate()],
    status: [required(), workflowStatus(['planned', 'in-progress', 'completed', 'cancelled'])],
    priority: [required(), priority(['low', 'medium', 'high', 'urgent'])],
    supervisorId: [required(), employeeId()],
  },

  QUALITY_CONTROL_FORM: {
    qualityLot: [required(), qualityLot()],
    partNumber: [required(), partNumber()],
    batchNumber: [required(), batchNumber()],
    inspectorId: [required(), employeeId()],
    inspectionDate: [required(), date()],
    result: [required(), workflowStatus(['pass', 'fail', 'conditional'])],
    defects: [number(), minNumber(0)],
    notes: [minLength(0), maxLength(1000)],
  },

  // Compliance Forms
  AUDIT_FORM: {
    auditId: [required(), auditId()],
    auditType: [required(), category(['financial', 'operational', 'compliance', 'security'])],
    auditorId: [required(), employeeId()],
    auditDate: [required(), date()],
    findings: [required(), minLength(10), maxLength(2000)],
    recommendations: [required(), minLength(10), maxLength(2000)],
    status: [required(), workflowStatus(['planned', 'in-progress', 'completed', 'follow-up'])],
  },

  LICENSE_FORM: {
    licenseNumber: [required(), licenseNumber()],
    licenseType: [required(), category(['business', 'professional', 'operating', 'permits'])],
    issuedBy: [required(), minLength(2), maxLength(100)],
    issueDate: [required(), date()],
    expiryDate: [required(), date(), futureDate()],
    status: [required(), workflowStatus(['active', 'expired', 'suspended', 'revoked'])],
  },

  // API & Integration Forms
  API_INTEGRATION_FORM: {
    name: [required(), minLength(2), maxLength(100)],
    apiKey: [required(), apiKey()],
    secretKey: [required(), secretKey()],
    baseUrl: [required(), url()],
    webhookUrl: [webhookUrl()],
    environment: [required(), environment()],
    rateLimit: [required(), number(), minNumber(1)],
    timeout: [required(), number(), minNumber(1000)],
  },

  WEBHOOK_FORM: {
    name: [required(), minLength(2), maxLength(100)],
    url: [required(), webhookUrl()],
    events: [required(), arrayOf([minLength(2), maxLength(50)], "All events must be 2-50 characters")],
    secret: [required(), secretKey()],
    isActive: [required(), custom((value: boolean) => typeof value === 'boolean', "Please select a status")],
  },

  // Configuration Forms
  SYSTEM_CONFIG_FORM: {
    configKey: [required(), configKey()],
    configValue: [required(), minLength(1), maxLength(1000)],
    environment: [required(), environment()],
    description: [required(), minLength(10), maxLength(500)],
    isEncrypted: [required(), custom((value: boolean) => typeof value === 'boolean', "Please select encryption status")],
  },

  FEATURE_FLAG_FORM: {
    featureFlag: [required(), featureFlag()],
    isEnabled: [required(), custom((value: boolean) => typeof value === 'boolean', "Please select enable status")],
    environment: [required(), environment()],
    description: [required(), minLength(10), maxLength(500)],
    rolloutPercentage: [required(), percentage()],
  },

  // Security Forms
  USER_ROLE_FORM: {
    roleName: [required(), minLength(2), maxLength(50)],
    description: [required(), minLength(10), maxLength(500)],
    permissions: [required(), arrayOf([minLength(2), maxLength(50)], "All permissions must be 2-50 characters")],
    isActive: [required(), custom((value: boolean) => typeof value === 'boolean', "Please select a status")],
  },

  SECURITY_AUDIT_FORM: {
    auditId: [required(), auditId()],
    auditType: [required(), category(['login', 'permission', 'data-access', 'system'])],
    userId: [required(), employeeId()],
    ipAddress: [required(), ipAddress()],
    timestamp: [required(), date()],
    action: [required(), minLength(2), maxLength(100)],
    result: [required(), workflowStatus(['success', 'failure', 'blocked'])],
  },

  // Monitoring Forms
  ALERT_FORM: {
    alertName: [required(), alertName()],
    metricName: [required(), metricName()],
    threshold: [required(), number()],
    operator: [required(), workflowStatus(['greater-than', 'less-than', 'equals', 'not-equals'])],
    severity: [required(), priority(['low', 'medium', 'high', 'critical'])],
    isActive: [required(), custom((value: boolean) => typeof value === 'boolean', "Please select a status")],
  },

  LOG_CONFIG_FORM: {
    loggerName: [required(), minLength(2), maxLength(100)],
    logLevel: [required(), logLevel()],
    environment: [required(), environment()],
    retentionDays: [required(), number(), minNumber(1), maxNumber(365)],
    isActive: [required(), custom((value: boolean) => typeof value === 'boolean', "Please select a status")],
  },
};

/**
 * Validate a form using predefined validation sets
 */
export function validateForm(formData: Record<string, any>, validationSet: Record<string, ValidationRule[]>): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  
  for (const [fieldName, rules] of Object.entries(validationSet)) {
    results[fieldName] = validate(formData[fieldName], rules);
  }
  
  return results;
}

/**
 * Check if a form is valid
 */
export function isFormValid(validationResults: Record<string, ValidationResult>): boolean {
  return Object.values(validationResults).every(result => result.isValid);
}

/**
 * Get all validation errors from a form
 */
export function getFormErrors(validationResults: Record<string, ValidationResult>): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const [fieldName, result] of Object.entries(validationResults)) {
    if (!result.isValid && result.message) {
      errors[fieldName] = result.message;
    }
  }
  
  return errors;
}

/**
 * Get the first validation error from a form
 */
export function getFirstFormError(validationResults: Record<string, ValidationResult>): string | null {
  for (const result of Object.values(validationResults)) {
    if (!result.isValid && result.message) {
      return result.message;
    }
  }
  return null;
}
