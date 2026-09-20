/**
 * SetupCustomField — Domain Entity representing an enterprise custom attribute
 * applicable to the administrator profile during account activation.
 *
 * @module auth/account-setup/domain/entities
 */

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

export interface SetupFieldOption {
  value: string;
  label: string;
}

export class SetupCustomField {
  constructor(private readonly data: SetupCustomFieldData) {}

  get key(): string {
    return this.data.key ?? "";
  }

  get labelEn(): string {
    return this.data.labelEn ?? "";
  }

  get labelAr(): string | undefined {
    return this.data.labelAr;
  }

  get placeholderEn(): string | undefined {
    return this.data.placeholderEn;
  }

  get placeholderAr(): string | undefined {
    return this.data.placeholderAr;
  }

  get valueType(): string {
    return (this.data.valueType ?? "text").toLowerCase();
  }

  get isRequired(): boolean {
    return this.data.isRequired ?? false;
  }

  get sensitivity(): number {
    return this.data.sensitivity ?? 0;
  }

  get sortOrder(): number {
    return this.data.sortOrder ?? 0;
  }

  get currentValue(): unknown {
    return this.data.currentValue;
  }

  /**
   * Computed check if field is marked sensitive or encrypted.
   */
  get isSensitive(): boolean {
    return this.sensitivity >= 2;
  }

  get isEncrypted(): boolean {
    return this.isSensitive;
  }

  /**
   * Localized field label based on RTL/LTR context.
   */
  label(isRtl?: boolean): string {
    return isRtl && this.data.labelAr ? this.data.labelAr : this.labelEn;
  }

  /**
   * Localized field placeholder based on RTL/LTR context.
   */
  placeholder(isRtl?: boolean): string {
    return isRtl && this.data.placeholderAr ? this.data.placeholderAr : (this.placeholderEn ?? "");
  }

  /**
   * Localized and structured options list for select/dropdown/multiselect fields.
   */
  getOptions(isRtl?: boolean): SetupFieldOption[] {
    if (!this.data.options) return [];

    let enList: SetupFieldOption[] = [];
    try {
      const parsed = JSON.parse(this.data.options);
      if (Array.isArray(parsed)) {
        enList = parsed.map((item) => {
          if (typeof item === "object" && item !== null) {
            const val = item.value ?? item.label ?? item.labelEn ?? "";
            const lab = item.label ?? item.labelEn ?? item.value ?? "";
            return { value: String(val), label: String(lab) };
          }
          return { value: String(item), label: String(item) };
        });
      }
    } catch {
      enList = this.data.options
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ value: s, label: s }));
    }

    if (!isRtl || !this.data.optionsAr) {
      return enList;
    }

    let arLabels: string[] = [];
    try {
      const parsedAr = JSON.parse(this.data.optionsAr);
      if (Array.isArray(parsedAr)) {
        arLabels = parsedAr.map((item) => {
          if (typeof item === "object" && item !== null) {
            return String(item.labelAr ?? item.label ?? item.value ?? "");
          }
          return String(item);
        });
      }
    } catch {
      arLabels = this.data.optionsAr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (arLabels.length === 0) return enList;

    return enList.map((opt, idx) => ({
      value: opt.value,
      label: arLabels[idx] || opt.label,
    }));
  }

  /**
   * Parsed options list for select/dropdown fields (backward compatibility).
   */
  get parsedOptions(): string[] {
    return this.getOptions().map((o) => o.label);
  }

  /**
   * Computed check if field requires option selection UI (select / dropdown).
   */
  get isSelect(): boolean {
    const t = this.valueType;
    return t === "select" || t === "dropdown" || t === "optionset" || t === "option_set";
  }

  /**
   * Computed check if field requires multi-selection UI.
   */
  get isMultiSelect(): boolean {
    const t = this.valueType;
    return (
      t === "multiselect" ||
      t === "multi_select" ||
      t === "multi-select" ||
      t === "tags" ||
      t === "checkboxgroup" ||
      t === "checkbox_group"
    );
  }

  /**
   * Computed check if field is boolean / switch.
   */
  get isBoolean(): boolean {
    const t = this.valueType;
    return t === "boolean" || t === "bool" || t === "switch" || t === "checkbox";
  }

  /**
   * Computed check if field is numeric.
   */
  get isNumber(): boolean {
    const t = this.valueType;
    return (
      t === "number" ||
      t === "integer" ||
      t === "decimal" ||
      t === "currency" ||
      t === "percent" ||
      t === "rating"
    );
  }

  /**
   * Computed check if field is date.
   */
  get isDate(): boolean {
    return this.valueType === "date";
  }

  /**
   * Computed check if field is datetime.
   */
  get isDateTime(): boolean {
    return this.valueType === "datetime";
  }

  /**
   * Computed check if field is multi-line textarea.
   */
  get isTextarea(): boolean {
    const t = this.valueType;
    return t === "textarea" || t === "multiline" || t === "longtext";
  }

  /**
   * Computed check if field is email.
   */
  get isEmail(): boolean {
    return this.valueType === "email";
  }

  /**
   * Computed check if field is url.
   */
  get isUrl(): boolean {
    return this.valueType === "url";
  }

  /**
   * Computed check if field is phone.
   */
  get isPhone(): boolean {
    const t = this.valueType;
    return t === "phone" || t === "tel";
  }

  copyWith(updates: Partial<SetupCustomFieldData>): SetupCustomField {
    return new SetupCustomField({ ...this.data, ...updates });
  }
}
