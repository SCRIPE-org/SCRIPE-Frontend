/**
 * ValueExport Mapper
 *
 * Converts between the value-export DTOs and the domain: `ValueExportFileModel` -> `ValueExport`,
 * and `ValueExportFailureModel` -> `ValueExportError`.
 *
 * THE ERROR DIRECTION IS THE ONE THAT CAN HURT
 * -------------------------------------------
 * Same reasoning as `DefinitionExportMapper`: a property dropped on the file direction costs a
 * wrong size or name in one sentence. A property dropped on the ERROR direction costs the
 * `errorCode`, and without it the row-cap refusal, the unknown-entity-type refusal and the
 * forbidden-view-permission refusal all collapse into "something broke" — which sends an admin
 * hunting a fault that does not exist while their real (and actionable) situation goes unnamed.
 *
 * WHY EVERY MAPPING IS WRITTEN OUT INSTEAD OF SPREAD
 * ---------------------------------------------------
 * Same rule as every other mapper in this module: adding a member without mapping it is then a
 * compile error rather than a silently absent field. `CustomFieldMapper` shipped exactly that
 * defect once with `optionsAr`.
 */
import {
  ValueExportFailureModel,
  ValueExportFileModel,
  type ValueExportFailureJson,
  type ValueExportFileJson,
} from "../models/ValueExportModel";
import { ValueExport, type ValueExportData } from "../../domain/entities/ValueExport";
import { ValueExportError } from "../../domain/entities/ValueExportError";

export class ValueExportMapper {
  /** Convert a `ValueExportFileModel` to a `ValueExport` entity. */
  static toEntity(model: ValueExportFileModel): ValueExport {
    const data: ValueExportData = {
      entityTypeKey: model.entityTypeKey,
      fileName: model.fileName,
      contentType: model.contentType,
      byteSize: model.byteSize,
      // The same Blob instance, not a copy -- re-wrapping would double peak memory for a
      // multi-megabyte workbook and could only ever produce a slightly different set of the same
      // bytes.
      blob: model.blob,
    };
    return new ValueExport(data);
  }

  /** Convert a `ValueExport` entity back to a `ValueExportFileModel`. */
  static toModel(entity: ValueExport): ValueExportFileModel {
    return new ValueExportFileModel({
      entityTypeKey: entity.entityTypeKey,
      fileName: entity.fileName,
      contentType: entity.contentType,
      byteSize: entity.byteSize,
      blob: entity.blob,
    });
  }

  /** Convert a raw success descriptor plus its bytes straight to an entity. */
  static fromJsonToEntity(json: ValueExportFileJson, blob: Blob): ValueExport {
    return ValueExportMapper.toEntity(ValueExportFileModel.fromJson(json, blob));
  }

  /**
   * Convert a `ValueExportFailureModel` to the domain error.
   *
   * `errorCode` is carried through unchanged and never defaulted: a code this client does not
   * recognise must stay unrecognised rather than be coerced into one that happens to have a branch.
   */
  static toError(model: ValueExportFailureModel): ValueExportError {
    return new ValueExportError({
      statusCode: model.statusCode,
      errorCode: model.errorCode,
      message: model.message,
      details: model.errors,
    });
  }

  /** Convert a raw `ErrorResponse` body straight to the domain error. */
  static fromJsonToError(json: ValueExportFailureJson): ValueExportError {
    return ValueExportMapper.toError(ValueExportFailureModel.fromJson(json));
  }
}
