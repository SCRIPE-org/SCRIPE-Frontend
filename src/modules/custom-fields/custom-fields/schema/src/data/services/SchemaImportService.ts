/**
 * SchemaImport Service
 *
 * The HTTP call for the schema-import endpoint (Wave 6 row 6.5's import half). Returns a Model
 * (DTO); the repository maps it to an entity.
 *
 * A PLAIN JSON ROUND TRIP -- NO BLOB, NO DOWNLOAD MANAGER TO WORRY ABOUT
 * -------------------------------------------------------------------------
 * `DefinitionExportService`/`ValueExportService` need a whole `readBlobText`/`toFailure` apparatus
 * because `getBlob` sets `responseType: "blob"`, which turns even the FAILURE body into a `Blob`.
 * This route calls `api.post`, a normal JSON request: on failure, `ApiService`'s interceptor has
 * already parsed the response body into `error.details` as a plain object. So the failure recovery
 * below is the short version of the export siblings' -- no blob reading, no jsdom `.text()`
 * fallback, and nothing to pass through for an intercepted download, because nothing here is one.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import {
  ImportSchemaBundleFailure,
  ImportSchemaBundleFailureModel,
  ImportSchemaBundleResultModel,
  type ImportSchemaBundleFailureJson,
  type ImportSchemaBundleResponseJson,
  type SchemaImportBundlePayload,
} from "../models/SchemaImportModel";
import type { ISchemaImportService } from "../../domain/interfaces/ISchemaImportService";
import { SCHEMA_IMPORT_ENDPOINTS } from "./schema-import.endpoints";

/**
 * True for an object shaped like the API's `ErrorResponse`. Same check every sibling service in
 * this module applies before trusting a failure body.
 */
function isFailureJson(value: unknown): value is ImportSchemaBundleFailureJson {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ImportSchemaBundleFailureJson>;
  return typeof candidate.errorCode === "string" && typeof candidate.message === "string";
}

/**
 * Recovers the server's `ErrorResponse` from whatever the transport threw.
 *
 * Two shapes reach here: `error.details` already parsed as an `ErrorResponse` (the normal case for
 * a JSON POST), or neither -- offline, a 401/403 the interceptor rewrote to a bare `Error`, a
 * proxy's HTML. Falls back to the transport message with `UNKNOWN_ERROR_CODE` so `isTooManyRows`
 * cannot fire on a request that never reached the server.
 */
function toFailure(error: unknown): ImportSchemaBundleFailure {
  const message = error instanceof Error ? error.message : String(error);
  const details = (error as { details?: unknown } | null)?.details;

  if (isFailureJson(details)) {
    return new ImportSchemaBundleFailure(ImportSchemaBundleFailureModel.fromJson(details));
  }

  return new ImportSchemaBundleFailure(ImportSchemaBundleFailureModel.fromUnknown(message));
}

/**
 * Documentation for module export
 */
export class SchemaImportService implements ISchemaImportService {
  constructor(private readonly api: IApiService) {}

  async importSchema(bundle: SchemaImportBundlePayload): Promise<ImportSchemaBundleResultModel> {
    try {
      const response = await this.api.post<ImportSchemaBundleResponseJson>(
        SCHEMA_IMPORT_ENDPOINTS.IMPORT,
        bundle
      );
      return ImportSchemaBundleResultModel.fromJson(response);
    } catch (error) {
      throw toFailure(error);
    }
  }
}
