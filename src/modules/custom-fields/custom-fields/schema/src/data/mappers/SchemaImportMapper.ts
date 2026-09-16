/**
 * SchemaImport Mapper
 *
 * Converts `ImportSchemaBundleResultModel` -> `SchemaImportResult`, and
 * `ImportSchemaBundleFailureModel` -> `SchemaImportError`. One direction each: unlike
 * `SchemaBundleMapper`, nothing here needs a reverse `toModel` -- the result entity is never
 * re-serialised into a file, and the outbound payload never passes through this mapper at all (see
 * `SchemaImportModel`'s header for why).
 */
import {
  ImportSchemaBundleFailureModel,
  ImportSchemaBundleResultModel,
} from "../models/SchemaImportModel";
import {
  SchemaImportResult,
  type SchemaImportGroupResultData,
} from "../../domain/entities/SchemaImportResult";
import { SchemaImportError } from "../../domain/entities/SchemaImportError";

export class SchemaImportMapper {
  /** Convert an `ImportSchemaBundleResultModel` to a `SchemaImportResult` entity. */
  static toEntity(model: ImportSchemaBundleResultModel): SchemaImportResult {
    const groups: SchemaImportGroupResultData[] = model.groups.map((group) => ({
      entityTypeKey: group.entityTypeKey,
      stableKey: group.stableKey,
      outcome: group.outcome,
      reason: group.reason,
      fieldsCreated: group.fieldsCreated,
    }));
    return new SchemaImportResult(groups);
  }

  /**
   * Convert an `ImportSchemaBundleFailureModel` to the domain error. `errorCode` is carried through
   * unchanged and never defaulted -- a code this client does not recognise must stay unrecognised.
   */
  static toError(model: ImportSchemaBundleFailureModel): SchemaImportError {
    return new SchemaImportError({
      statusCode: model.statusCode,
      errorCode: model.errorCode,
      message: model.message,
      details: model.errors,
    });
  }
}
