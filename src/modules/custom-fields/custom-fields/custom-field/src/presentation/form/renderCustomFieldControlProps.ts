import type { FieldConfig } from "@core/ui/forms/generic-form";

/**
 * Documentation for module export
 */
export interface CustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  isViewMode?: boolean;
  invalid?: boolean;
  describedBy?: string;
  error?: string;
}

