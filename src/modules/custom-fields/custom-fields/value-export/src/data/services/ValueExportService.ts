/**
 * ValueExport Service
 *
 * The HTTP call for the value-export endpoint (Wave 6 row 6.4's completion). Returns a Model (DTO);
 * the repository maps it to an entity.
 *
 * THE ERROR BODY ARRIVES AS A BLOB, AND THAT IS THE WHOLE PROBLEM THIS FILE SOLVES
 * ------------------------------------------------------------------------------
 * Identical transport quirk to `DefinitionExportService` — see that file's header for the full
 * explanation. `getBlob` sets `responseType: "blob"`, which applies to the FAILURE body too, so a
 * 422 or 403 arrives as a `Blob` sitting unread in `error.details` unless this service reads it back
 * into JSON. Left alone, that turns a row-cap refusal, an unknown entity type, AND a forbidden view
 * permission into the same bare string: `"HTTP 422"` or `"HTTP 403"`.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { DownloadInterceptedError } from "@core/errors/download-intercepted";
import {
  ValueExportFailure,
  ValueExportFailureModel,
  ValueExportFileModel,
  type ValueExportFailureJson,
} from "../models/ValueExportModel";
import type { IValueExportService } from "../../domain/interfaces/IValueExportService";
import { VALUE_EXPORT_ENDPOINTS } from "./value-export.endpoints";

/**
 * Reads a Blob's text.
 *
 * `FileReader` when the promise-based accessor is missing — jsdom's `Blob` does not implement
 * `blob.text()` in the version this suite runs on. Identical fallback to
 * `DefinitionExportService.readBlobText`.
 */
async function readBlobText(blob: Blob): Promise<string> {
  if (typeof blob.text === "function") return blob.text();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the response body."));
    reader.readAsText(blob);
  });
}

/**
 * True for an object shaped like the API's `ErrorResponse`.
 *
 * Checks `errorCode` and `message` specifically, because the code is the only member anything
 * branches on. A body that lacks it is not an `ErrorResponse` this client can use.
 */
function isFailureJson(value: unknown): value is ValueExportFailureJson {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ValueExportFailureJson>;
  return typeof candidate.errorCode === "string" && typeof candidate.message === "string";
}

/**
 * Recovers the server's `ErrorResponse` from whatever the transport threw.
 *
 * Same three-shape recovery as `DefinitionExportService.toFailure`: a `Blob` (the normal case for
 * this route), an already-parsed object (the interceptor's non-blob path), or neither (offline, a
 * 401/403 rewritten to a bare `Error`, a proxy's HTML) — falling back to the transport message with
 * `UNKNOWN_ERROR_CODE` so no branch that means "the server decided something" fires on a request
 * that never reached it.
 */
async function toFailure(error: unknown): Promise<ValueExportFailure> {
  const message = error instanceof Error ? error.message : String(error);
  const details = (error as { details?: unknown } | null)?.details;

  if (details instanceof Blob) {
    try {
      const parsed: unknown = JSON.parse(await readBlobText(details));
      if (isFailureJson(parsed)) {
        return new ValueExportFailure(ValueExportFailureModel.fromJson(parsed));
      }
    } catch {
      // A body that is not JSON at all -- an HTML error page, or a truncated stream. Nothing to
      // recover, so fall through to the message rather than letting a parse error replace the
      // original failure with a less informative one.
    }
  } else if (isFailureJson(details)) {
    return new ValueExportFailure(ValueExportFailureModel.fromJson(details));
  }

  return new ValueExportFailure(ValueExportFailureModel.fromUnknown(message));
}

export class ValueExportService implements IValueExportService {
  constructor(private readonly api: IApiService) {}

  async exportValues(entityTypeKey: string): Promise<ValueExportFileModel> {
    // No query string to build -- unlike the definitions export, `entityTypeKey` is a route
    // segment on this endpoint, not an optional parameter, so there is nothing for `buildUrl` to do.
    const url = VALUE_EXPORT_ENDPOINTS.EXPORT(entityTypeKey);

    // Stamped BEFORE the call, not after -- it names the file, and the server's own stamp is taken
    // when it builds the workbook. Same reasoning as `DefinitionExportService`.
    const requestedAt = new Date();

    let blob: Blob;
    try {
      blob = await this.api.getBlob(url);
    } catch (error) {
      // An external download manager that took the stream means the file WAS captured. Passed
      // through untranslated so the view model can report it as the success it is.
      if (error instanceof DownloadInterceptedError) throw error;
      throw await toFailure(error);
    }

    return ValueExportFileModel.fromResponse(blob, entityTypeKey, requestedAt);
  }
}
