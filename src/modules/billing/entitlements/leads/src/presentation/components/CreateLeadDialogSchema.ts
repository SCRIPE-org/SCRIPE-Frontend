/**
 * CreateLeadDialogSchema — Validation schema and form data contracts for creating platform sales leads.
 */

import { z } from "zod";
import { isValidPhoneNumber } from "@core/ui/phone-input";

/**
 * Domain payload sent to the backend when creating a sales lead.
 */
export interface CreateLeadFormData {
  /** Legal or trading business entity name */
  companyName: string;
  /** Primary representative contact full name */
  contactName: string;
  /** Business electronic mail address */
  email: string;
  /** International phone number */
  phone?: string;
  /** Requested commercial edition identifier */
  editionKey?: string;
  /** Inbound inquiry or discovery message */
  message?: string;
  /** Internal operational qualification notes */
  notes?: string;
}

/**
 * Internal React Hook Form state representation.
 */
export interface CreateLeadFormValues {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  editionKey: string;
  message: string;
  notes: string;
}

/**
 * Default empty values for the lead creation form fields.
 */
export const EMPTY_VALUES: CreateLeadFormValues = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  editionKey: "",
  message: "",
  notes: "",
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Builds a localized Zod validation schema for the lead creation dialog.
 *
 * @param t Localization translation function.
 * @returns Zod schema validating company name, contact, email, and international phone.
 */
export function buildSchema(t: (key: string) => string) {
  return z.object({
    companyName: z.string().trim().min(1, t("leads.createDialog.errors.companyRequired")),
    contactName: z.string().trim().min(1, t("leads.createDialog.errors.contactRequired")),
    email: z.string().trim().regex(EMAIL_PATTERN, t("leads.createDialog.errors.emailInvalid")),
    phone: z.string().refine((value) => !value.trim() || isValidPhoneNumber(value), {
      message: t("leads.createDialog.errors.phoneInvalid"),
    }),
    editionKey: z.string(),
    message: z.string(),
    notes: z.string(),
  });
}
