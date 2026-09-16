import type { FieldConfig } from "@core/ui/forms/generic-form";

export interface CustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  isViewMode?: boolean;
  invalid?: boolean;
  describedBy?: string;
}
