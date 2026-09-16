/**
 * DefinitionExport Service
 *
 * The HTTP call for the definition-export endpoint (Wave 6 row 6.4). Returns a Model (DTO); the
 * repository maps it to an entity.
 *
 * THE ERROR BODY ARRIVES AS A BLOB, AND THAT IS THE WHOLE PROBLEM THIS FILE SOLVES
 * ------------------------------------------------------------------------------
 * `getBlob` sets `responseType: "blob"`, which applies to the FAILURE body too. So on a 422 axios
 * hands `ApiService`'s interceptor an `error.response.data` that is a `Blob`, the interceptor's
 * `extractErrorMessage` reads `data.message` off it, finds nothing, and rejects with the string
 * `"HTTP 422"`. The server's own sentence and — far more importantly — its `errorCode` are still
 * there, sitting unread inside the blob it attached as `error.details`.
 *
 * Left alone, that turns the row-cap REFUSAL into `HTTP 422`. An admin with more than
 * `MaxExportRows` definitions would be told a number, when what the server actually said was "this
 * export was refused, narrow it to one entity type". That is the difference between an actionable
 * answer and a bug report, so this service reads the blob back into JSON and rebuilds the real
 * `ErrorResponse`.
 *
 * It is a workaround for a transport limitation, not a preference: a `getBlob` that surfaced the
 * failure body as text — or any caller-visible response headers at all — would make it unnecessary.
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import { DownloadInterceptedError } from "@core/errors/download-intercepted";
import {
  DefinitionExportFailure,
  DefinitionExportFailureModel,
  DefinitionExportFileModel,
  type DefinitionExportFailureJson,
} from "../models/DefinitionExportModel";
import type { IDefinitionExportService } from "../../domain/interfaces/IDefinitionExportService";
import { DEFINITION_EXPORT_ENDPOINTS } from "./definition-export.endpoints";

/**
 * Reads a Blob's text.
 *
 * `FileReader` when the promise-based accessor is missing: jsdom's `Blob` does not implement
 * `blob.text()` in the version this suite runs on, so calling it directly would throw "is not a
 * function" on the very path the refusal test exercises — a failure that would look like a defect in
 * the code under test rather than in the environment.
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
 * Checks `errorCode` and `message` specifically rather than "is an object", because the code is the
 * only member anything branches on. A body that lacks it is not an `ErrorResponse` this client can
 * use, no matter what else it contains.
 */
function isFailureJson(value: unknown): value is DefinitionExportFailureJson {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<DefinitionExportFailureJson>;
  return typeof candidate.errorCode === "string" && typeof candidate.message === "string";
}

/**
 * Recovers the server's `ErrorResponse` from whatever the transport threw.
 *
 * Three shapes reach here, in order of usefulness:
 *
 *  1. `error.details` is a `Blob` — the normal case for this route. Read it, parse it, and the real
 *     `errorCode` is back.
 *  2. `error.details` is already an object — the interceptor's non-blob path, and the shape a unit
 *     test can hand over directly.
 *  3. Neither — offline, a 401 or 403 the interceptor rewrote into a bare `Error`, a proxy's HTML.
 *     Falls back to the message with `UNKNOWN` as the code, so no branch that means "the server
 *     decided something" can fire on a request that never reached it.
 */
async function toFailure(error: unknown): Promise<DefinitionExportFailure> {
  const message = error instanceof Error ? error.message : String(error);
  const details = (error as { details?: unknown } | null)?.details;

  if (details instanceof Blob) {
    try {
      const parsed: unknown = JSON.parse(await readBlobText(details));
      if (isFailureJson(parsed)) {
        return new DefinitionExportFailure(DefinitionExportFailureModel.fromJson(parsed));
      }
    } catch {
      // A body that is not JSON at all -- an HTML error page, or a truncated stream. Nothing to
      // recover, so fall through to the message rather than letting a parse error replace the
      // original failure with a less informative one.
    }
  } else if (isFailureJson(details)) {
    return new DefinitionExportFailure(DefinitionExportFailureModel.fromJson(details));
  }

  return new DefinitionExportFailure(DefinitionExportFailureModel.fromUnknown(message));
}

export class DefinitionExportService implements IDefinitionExportService {
  constructor(private readonly api: IApiService) {}

  async exportDefinitions(entityTypeKey?: string | null): Promise<DefinitionExportFileModel> {
    // `buildUrl` drops undefined and null params, so an unscoped export sends NO `entityTypeKey`
    // parameter at all rather than an empty one. The server treats "" the same as absent, but an
    // empty parameter would leave the request looking like a scoped export of nothing in any log or
    // trace.
    const scope = entityTypeKey && entityTypeKey.length > 0 ? entityTypeKey : null;
    const url = buildUrl(DEFINITION_EXPORT_ENDPOINTS.EXPORT, {
      entityTypeKey: scope ?? undefined,
    });

    // Stamped BEFORE the call, not after: it names the file, and the server's own stamp is taken
    // when it builds the workbook. Taking ours at the request is as close as an unreadable
    // `Content-Disposition` allows -- see `buildDefinitionExportFileName`.
    const requestedAt = new Date();

    let blob: Blob;
    try {
      blob = await this.api.getBlob(url);
    } catch (error) {
      // An external download manager that took the stream means the file WAS captured. Passed
      // through untranslated so the view model can report it as the success it is, rather than
      // wrapped in a failure that would tell the admin their export failed while it sat in their
      // downloads folder.
      if (error instanceof DownloadInterceptedError) throw error;
      throw await toFailure(error);
    }

    return DefinitionExportFileModel.fromResponse(blob, scope, requestedAt);
  }
}
