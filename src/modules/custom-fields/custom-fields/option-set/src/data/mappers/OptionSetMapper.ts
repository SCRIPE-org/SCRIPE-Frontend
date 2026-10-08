/**
 * OptionSet Mapper
 *
 * Converts between the option-set Models (DTOs) and the domain entities. The repository uses this on
 * the way in; `toModel` exists for symmetry and for tests that need to round-trip a fixture.
 *
 * EVERY CONVERSION SPELLS OUT ITS PROPERTIES INSTEAD OF SPREADING
 * --------------------------------------------------------------
 * Adding a member to one of the `*Data` interfaces without mapping it here is then a COMPILE error
 * rather than a property that silently arrives undefined. This module has already shipped that exact
 * defect once -- `CustomFieldMapper` gained `optionsAr` on the model, the JSON shape and the entity
 * and never here, so it came back undefined after every round trip.
 *
 * THE ONE ASYMMETRY: `itemCount` AND `items` ARE DERIVED DIFFERENTLY PER SOURCE SHAPE
 * ----------------------------------------------------------------------------------
 * The summary shape has a count and no items; the full shape has items and no count. Both feed the
 * same `OptionSetVersion` entity, so:
 *   - `versionSummaryToEntity` sets `items: null` (NOT LOADED) and takes `itemCount` from the wire.
 *   - `versionToEntity` sets `items` from the payload and DERIVES `itemCount` from its length.
 * Writing `items: []` in the summary case would be the destructive mistake: a draft editor cannot
 * distinguish it from a genuinely empty version and would save an empty replace. See
 * `OptionSetVersion`'s header.
 */
import { OptionSet, type OptionSetData, type OptionSetDetail } from "../../domain/entities/OptionSet";
import {
  OptionSetVersion,
  type OptionSetVersionData,
} from "../../domain/entities/OptionSetVersion";
import { OptionSetItem, type OptionSetItemData } from "../../domain/entities/OptionSetItem";
import type { OptionSetBindingOutcome } from "../../domain/interfaces/IOptionSetRepository";
import {
  OptionSetModel,
  OptionSetItemModel,
  type OptionSetJson,
  type OptionSetDetailModel,
  type OptionSetVersionModel,
  type OptionSetVersionSummaryModel,
  type OptionSetBindingResultModel,
} from "../models/OptionSetModel";

/**
 * Documentation for module export
 */
export class OptionSetMapper {
  /** Convert an OptionSetModel to an OptionSet entity. */
  static toEntity(model: OptionSetModel): OptionSet {
    const data: OptionSetData = {
      id: model.id,
      stableKey: model.stableKey,
      labelEn: model.labelEn,
      labelAr: model.labelAr,
      description: model.description,
      isSystemManaged: model.isSystemManaged,
      isPlatformOwned: model.isPlatformOwned,
      versionCount: model.versionCount,
      publishedVersionId: model.publishedVersionId,
      publishedVersionNumber: model.publishedVersionNumber,
    };
    return new OptionSet(data);
  }

  /** Convert an OptionSet entity back to an OptionSetModel. */
  static toModel(entity: OptionSet): OptionSetModel {
    return new OptionSetModel({
      id: entity.id,
      stableKey: entity.stableKey,
      labelEn: entity.labelEn,
      labelAr: entity.labelAr,
      description: entity.description,
      isSystemManaged: entity.isSystemManaged,
      isPlatformOwned: entity.isPlatformOwned,
      versionCount: entity.versionCount,
      publishedVersionId: entity.publishedVersionId,
      publishedVersionNumber: entity.publishedVersionNumber,
    });
  }

  /** Convert raw API JSON straight to an OptionSet entity. */
  static fromJsonToEntity(json: OptionSetJson): OptionSet {
    return OptionSetMapper.toEntity(OptionSetModel.fromJson(json));
  }

  /**
   * Convert a detail model to the `{ set, versions }` pair the repository returns.
   *
   * Order is preserved exactly as received -- newest version number first. Re-sorting here would put
   * the oldest version at the top of every detail screen.
   */
  static detailToEntity(model: OptionSetDetailModel): OptionSetDetail {
    return {
      set: OptionSetMapper.toEntity(model.set),
      versions: model.versions.map((version) => OptionSetMapper.versionSummaryToEntity(version)),
    };
  }

  /**
   * One version SUMMARY (no items) to an entity.
   *
   * `optionSetId` is null because the summary shape does not carry it, and `items` is null to mark
   * the item list as NOT LOADED. Both nulls are meaningful, not placeholders.
   */
  static versionSummaryToEntity(model: OptionSetVersionSummaryModel): OptionSetVersion {
    const data: OptionSetVersionData = {
      id: model.id,
      optionSetId: null,
      versionNumber: model.versionNumber,
      status: model.status,
      publishedAtUtc: model.publishedAtUtc,
      items: null,
      itemCount: model.itemCount,
    };
    return new OptionSetVersion(data);
  }

  /**
   * One FULL version (with items) to an entity.
   *
   * `itemCount` is derived from the mapped list rather than trusted from a separate field, because
   * the full response has no count of its own and a hand-maintained second copy of `items.length`
   * would be a number that can disagree with the list beside it.
   */
  static versionToEntity(model: OptionSetVersionModel): OptionSetVersion {
    const items = model.items.map((item) => OptionSetMapper.itemToEntity(item));
    const data: OptionSetVersionData = {
      id: model.id,
      optionSetId: model.optionSetId,
      versionNumber: model.versionNumber,
      status: model.status,
      publishedAtUtc: model.publishedAtUtc,
      items,
      itemCount: items.length,
    };
    return new OptionSetVersion(data);
  }

  /** One item, model -> entity. */
  static itemToEntity(model: OptionSetItemModel): OptionSetItem {
    const data: OptionSetItemData = {
      id: model.id,
      key: model.key,
      labelEn: model.labelEn,
      labelAr: model.labelAr,
      color: model.color,
      iconKey: model.iconKey,
      sortOrder: model.sortOrder,
      status: model.status,
    };
    return new OptionSetItem(data);
  }

  /** One item, entity -> model. Used by tests that round-trip a fixture. */
  static itemToModel(entity: OptionSetItem): OptionSetItemModel {
    return new OptionSetItemModel({
      id: entity.id,
      key: entity.key,
      labelEn: entity.labelEn,
      labelAr: entity.labelAr,
      color: entity.color,
      iconKey: entity.iconKey,
      sortOrder: entity.sortOrder,
      status: entity.status,
    });
  }

  /**
   * The binding receipt, model -> domain shape.
   *
   * A flat copy rather than a passthrough of the model, so nothing above the data layer holds a
   * reference to a DTO class -- the same rule every other conversion in this file follows, applied
   * even though the two shapes are currently identical.
   */
  static bindingResultToOutcome(model: OptionSetBindingResultModel): OptionSetBindingOutcome {
    return {
      inserted: model.inserted,
      updated: model.updated,
      deactivated: model.deactivated,
      untouched: model.untouched,
      preservedLocalOptions: model.preservedLocalOptions,
    };
  }
}
