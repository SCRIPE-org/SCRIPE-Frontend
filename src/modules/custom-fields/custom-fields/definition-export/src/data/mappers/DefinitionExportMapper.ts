/**
 * DefinitionExport Mapper
 *
 * Converts between the definition-export DTOs and the domain: `DefinitionExportFileModel` ->
 * `DefinitionExport`, and `DefinitionExportFailureModel` -> `DefinitionExportError`.
 *
 * THE ERROR DIRECTION IS THE ONE THAT CAN HURT
 * -------------------------------------------
 * A property dropped on the file direction costs a wrong size or a wrong name in one sentence of the
 * dialog. A property dropped on the ERROR direction costs the `errorCode`, and without the code the
 * row-cap REFUSAL becomes indistinguishable from "something broke" — which sends an admin hunting a
 * fault that does not exist while their real problem (too many definitions in one export) goes
 * unnamed. So `toError` is spelled out property by property, and the test pins it.
 *
 * WHY EVERY MAPPING IS WRITTEN OUT INSTEAD OF SPREAD
 * -------------------------------------------------
 * Same rule as `SchemaBundleMapper`: adding a member to the entity or the model without mapping it
 * is then a compile error rather than a silently absent field. That is not theoretical in this
 * module — `CustomFieldMapper` shipped exactly that defect with `optionsAr`, which was present on the
 * model, the JSON shape and the entity, never mapped, and came back undefined after every round
 * trip.
 */
import {
  DefinitionExportFailureModel,
  DefinitionExportFileModel,
  type DefinitionExportFailureJson,
  type DefinitionExportFileJson,
} from "../models/DefinitionExportModel";
import {
  DefinitionExport,
  type DefinitionExportData,
} from "../../domain/entities/DefinitionExport";
import { DefinitionExportError } from "../../domain/entities/DefinitionExportError";

export class DefinitionExportMapper {
  /** Convert a `DefinitionExportFileModel` to a `DefinitionExport` entity. */
  static toEntity(model: DefinitionExportFileModel): DefinitionExport {
    const data: DefinitionExportData = {
      entityTypeKey: model.entityTypeKey,
      fileName: model.fileName,
      contentType: model.contentType,
      byteSize: model.byteSize,
      // The same Blob instance, not a copy. Re-wrapping the bytes would double peak memory for a
      // multi-megabyte workbook and could only ever produce a slightly different set of the same
      // bytes.
      blob: model.blob,
    };
    return new DefinitionExport(data);
  }

  /** Convert a `DefinitionExport` entity back to a `DefinitionExportFileModel`. */
  static toModel(entity: DefinitionExport): DefinitionExportFileModel {
    return new DefinitionExportFileModel({
      entityTypeKey: entity.entityTypeKey,
      fileName: entity.fileName,
      contentType: entity.contentType,
      byteSize: entity.byteSize,
      blob: entity.blob,
    });
  }

  /** Convert a raw success descriptor plus its bytes straight to an entity. */
  static fromJsonToEntity(json: DefinitionExportFileJson, blob: Blob): DefinitionExport {
    return DefinitionExportMapper.toEntity(DefinitionExportFileModel.fromJson(json, blob));
  }

  /**
   * Convert a `DefinitionExportFailureModel` to the domain error.
   *
   * `errorCode` is carried through unchanged and never defaulted: a code this client does not
   * recognise must stay unrecognised rather than be coerced into one that happens to have a branch.
   */
  static toError(model: DefinitionExportFailureModel): DefinitionExportError {
    return new DefinitionExportError({
      statusCode: model.statusCode,
      errorCode: model.errorCode,
      message: model.message,
      details: model.errors,
    });
  }

  /** Convert a raw `ErrorResponse` body straight to the domain error. */
  static fromJsonToError(json: DefinitionExportFailureJson): DefinitionExportError {
    return DefinitionExportMapper.toError(DefinitionExportFailureModel.fromJson(json));
  }
}
