/**
 * SetupCustomField — Domain Entity representing an enterprise custom attribute
 * applicable to the administrator profile during account activation.
 *
 * @module auth/account-setup/domain/entities
 */

import {
  parseSetupCustomFieldOptions,
  type SetupFieldOption,
} from "./setupCustomFieldOptions";

export type { SetupFieldOption };

export interface SetupCustomFieldData {
  key: string;
  labelEn: string;
  labelAr?: string;
  placeholderEn?: string;
  placeholderAr?: string;
  valueType: string;
  isRequired: boolean;
  sensitivity: number;
  options?: string | null;
  optionsAr?: string | null;
  sortOrder: number;
  currentValue?: unknown;
}

export class SetupCustomField {
  constructor(private readonly data: SetupCustomFieldData) {}

  get key(): string { return this.data.key ?? ""; }
  get labelEn(): string { return this.data.labelEn ?? ""; }
  get labelAr(): string | undefined { return this.data.labelAr; }
  get placeholderEn(): string | undefined { return this.data.placeholderEn; }
  get placeholderAr(): string | undefined { return this.data.placeholderAr; }
  get valueType(): string { return (this.data.valueType ?? "text").toLowerCase(); }
  get isRequired(): boolean { return this.data.isRequired ?? false; }
  get sensitivity(): number { return this.data.sensitivity ?? 0; }
  get sortOrder(): number { return this.data.sortOrder ?? 0; }
  get currentValue(): unknown { return this.data.currentValue; }

  get isSensitive(): boolean { return this.sensitivity >= 2; }
  get isEncrypted(): boolean { return this.isSensitive; }

  label(isRtl?: boolean): string {
    return isRtl && this.data.labelAr ? this.data.labelAr : this.labelEn;
  }

  placeholder(isRtl?: boolean): string {
    return isRtl && this.data.placeholderAr ? this.data.placeholderAr : (this.placeholderEn ?? "");
  }

  getOptions(isRtl?: boolean): SetupFieldOption[] {
    return parseSetupCustomFieldOptions(this.data.options, this.data.optionsAr, isRtl);
  }

  get parsedOptions(): string[] {
    return this.getOptions().map((o) => o.label);
  }

  get isSelect(): boolean {
    const t = this.valueType;
    return t === "select" || t === "dropdown" || t === "optionset" || t === "option_set";
  }

  get isMultiSelect(): boolean {
    const t = this.valueType;
    return (
      t === "multiselect" || t === "multi_select" || t === "multi-select" ||
      t === "tags" || t === "checkboxgroup" || t === "checkbox_group"
    );
  }

  get isBoolean(): boolean {
    const t = this.valueType;
    return t === "boolean" || t === "bool" || t === "switch" || t === "checkbox";
  }

  get isNumber(): boolean {
    const t = this.valueType;
    return (
      t === "number" || t === "integer" || t === "decimal" ||
      t === "currency" || t === "percent" || t === "rating"
    );
  }

  get isDate(): boolean { return this.valueType === "date"; }
  get isDateTime(): boolean { return this.valueType === "datetime"; }
  get isTextarea(): boolean {
    const t = this.valueType;
    return t === "textarea" || t === "multiline" || t === "longtext";
  }
  get isEmail(): boolean { return this.valueType === "email"; }
  get isUrl(): boolean { return this.valueType === "url"; }
  get isPhone(): boolean {
    const t = this.valueType;
    return t === "phone" || t === "tel";
  }

  copyWith(updates: Partial<SetupCustomFieldData>): SetupCustomField {
    return new SetupCustomField({ ...this.data, ...updates });
  }
}
