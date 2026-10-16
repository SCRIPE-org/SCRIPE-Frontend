/**
 * OptionSet Data Models
 *
 * Domain model wrappers for shared option sets, versions, items, and binding receipts.
 * Provides serialization and deserialization between API JSON payloads and domain entities.
 */

import type {
  FieldVersionStatus,
  FieldOptionStatus,
  OptionSetItemWritableStatus,
  OptionSetJson,
  OptionSetVersionSummaryJson,
  OptionSetDetailJson,
  OptionSetItemJson,
  OptionSetVersionJson,
  OptionSetBindingResultJson,
  CreateOptionSetRequestJson,
  UpdateOptionSetRequestJson,
  OptionSetItemRequestJson,
  OptionSetVersionItemsRequestJson,
  BindOptionSetRequestJson,
} from "./OptionSetDto";

/**
 * Documentation for module export
 */
export type {
  FieldVersionStatus,
  FieldOptionStatus,
  OptionSetItemWritableStatus,
  OptionSetJson,
  OptionSetVersionSummaryJson,
  OptionSetDetailJson,
  OptionSetItemJson,
  OptionSetVersionJson,
  OptionSetBindingResultJson,
  CreateOptionSetRequestJson,
  UpdateOptionSetRequestJson,
  OptionSetItemRequestJson,
  OptionSetVersionItemsRequestJson,
  BindOptionSetRequestJson,
};

/**
 * Model representing an option set with its configuration and published version reference.
 */
export class OptionSetModel {
  readonly id: string;
  readonly stableKey: string;
  readonly labelEn: string;
  readonly labelAr: string | null;
  readonly description: string | null;
  readonly isSystemManaged: boolean;
  readonly isPlatformOwned: boolean;
  readonly versionCount: number;
  readonly publishedVersionId: string | null;
  readonly publishedVersionNumber: number | null;

  constructor(fields: OptionSetJson) {
    this.id = fields.id;
    this.stableKey = fields.stableKey;
    this.labelEn = fields.labelEn;
    this.labelAr = fields.labelAr ?? null;
    this.description = fields.description ?? null;
    this.isSystemManaged = fields.isSystemManaged ?? false;
    this.isPlatformOwned = fields.isPlatformOwned ?? false;
    this.versionCount = fields.versionCount ?? 0;
    this.publishedVersionId = fields.publishedVersionId ?? null;
    this.publishedVersionNumber = fields.publishedVersionNumber ?? null;
  }

  static fromJson(json: OptionSetJson): OptionSetModel {
    return new OptionSetModel(json);
  }

  toJson(): OptionSetJson {
    return {
      id: this.id,
      stableKey: this.stableKey,
      labelEn: this.labelEn,
      labelAr: this.labelAr,
      description: this.description,
      isSystemManaged: this.isSystemManaged,
      isPlatformOwned: this.isPlatformOwned,
      versionCount: this.versionCount,
      publishedVersionId: this.publishedVersionId,
      publishedVersionNumber: this.publishedVersionNumber,
    };
  }
}

/**
 * Summary model representing a version without child item records.
 */
export class OptionSetVersionSummaryModel {
  readonly id: string;
  readonly versionNumber: number;
  readonly status: FieldVersionStatus;
  readonly publishedAtUtc: string | null;
  readonly itemCount: number;

  constructor(fields: OptionSetVersionSummaryJson) {
    this.id = fields.id;
    this.versionNumber = fields.versionNumber;
    this.status = fields.status;
    this.publishedAtUtc = fields.publishedAtUtc ?? null;
    this.itemCount = fields.itemCount ?? 0;
  }

  static fromJson(json: OptionSetVersionSummaryJson): OptionSetVersionSummaryModel {
    return new OptionSetVersionSummaryModel(json);
  }

  toJson(): OptionSetVersionSummaryJson {
    return {
      id: this.id,
      versionNumber: this.versionNumber,
      status: this.status,
      publishedAtUtc: this.publishedAtUtc,
      itemCount: this.itemCount,
    };
  }
}

/**
 * Detail model for an option set combined with its version chain.
 */
export class OptionSetDetailModel {
  readonly set: OptionSetModel;
  readonly versions: OptionSetVersionSummaryModel[];

  constructor(fields: { set: OptionSetModel; versions: OptionSetVersionSummaryModel[] }) {
    this.set = fields.set;
    this.versions = fields.versions;
  }

  static fromJson(json: OptionSetDetailJson): OptionSetDetailModel {
    return new OptionSetDetailModel({
      set: OptionSetModel.fromJson(json.set),
      versions: (json.versions ?? []).map((version) =>
        OptionSetVersionSummaryModel.fromJson(version)
      ),
    });
  }

  toJson(): OptionSetDetailJson {
    return {
      set: this.set.toJson(),
      versions: this.versions.map((version) => version.toJson()),
    };
  }
}

/**
 * Model representing an individual option item inside an option set version.
 */
export class OptionSetItemModel {
  readonly id: string;
  readonly key: string;
  readonly labelEn: string;
  readonly labelAr: string | null;
  readonly color: string | null;
  readonly iconKey: string | null;
  readonly sortOrder: number;
  readonly status: FieldOptionStatus;

  constructor(fields: OptionSetItemJson) {
    this.id = fields.id;
    this.key = fields.key;
    this.labelEn = fields.labelEn;
    this.labelAr = fields.labelAr ?? null;
    this.color = fields.color ?? null;
    this.iconKey = fields.iconKey ?? null;
    this.sortOrder = fields.sortOrder;
    this.status = fields.status ?? "Active";
  }

  static fromJson(json: OptionSetItemJson): OptionSetItemModel {
    return new OptionSetItemModel(json);
  }

  toJson(): OptionSetItemJson {
    return {
      id: this.id,
      key: this.key,
      labelEn: this.labelEn,
      labelAr: this.labelAr,
      color: this.color,
      iconKey: this.iconKey,
      sortOrder: this.sortOrder,
      status: this.status,
    };
  }
}

/**
 * Model representing an option set version with its full list of items.
 */
export class OptionSetVersionModel {
  readonly id: string;
  readonly optionSetId: string;
  readonly versionNumber: number;
  readonly status: FieldVersionStatus;
  readonly publishedAtUtc: string | null;
  readonly items: OptionSetItemModel[];

  constructor(fields: {
    id: string;
    optionSetId: string;
    versionNumber: number;
    status: FieldVersionStatus;
    publishedAtUtc: string | null;
    items: OptionSetItemModel[];
  }) {
    this.id = fields.id;
    this.optionSetId = fields.optionSetId;
    this.versionNumber = fields.versionNumber;
    this.status = fields.status;
    this.publishedAtUtc = fields.publishedAtUtc ?? null;
    this.items = fields.items;
  }

  static fromJson(json: OptionSetVersionJson): OptionSetVersionModel {
    return new OptionSetVersionModel({
      id: json.id,
      optionSetId: json.optionSetId,
      versionNumber: json.versionNumber,
      status: json.status,
      publishedAtUtc: json.publishedAtUtc ?? null,
      items: (json.items ?? []).map((item) => OptionSetItemModel.fromJson(item)),
    });
  }

  toJson(): OptionSetVersionJson {
    return {
      id: this.id,
      optionSetId: this.optionSetId,
      versionNumber: this.versionNumber,
      status: this.status,
      publishedAtUtc: this.publishedAtUtc,
      items: this.items.map((item) => item.toJson()),
    };
  }
}

/**
 * Model representing the outcome metrics of an option set binding operation.
 */
export class OptionSetBindingResultModel {
  readonly inserted: number;
  readonly updated: number;
  readonly deactivated: number;
  readonly untouched: number;
  readonly preservedLocalOptions: number;

  constructor(fields: OptionSetBindingResultJson) {
    this.inserted = fields.inserted;
    this.updated = fields.updated;
    this.deactivated = fields.deactivated;
    this.untouched = fields.untouched;
    this.preservedLocalOptions = fields.preservedLocalOptions;
  }

  static fromJson(json: OptionSetBindingResultJson): OptionSetBindingResultModel {
    return new OptionSetBindingResultModel(json);
  }

  toJson(): OptionSetBindingResultJson {
    return {
      inserted: this.inserted,
      updated: this.updated,
      deactivated: this.deactivated,
      untouched: this.untouched,
      preservedLocalOptions: this.preservedLocalOptions,
    };
  }
}
