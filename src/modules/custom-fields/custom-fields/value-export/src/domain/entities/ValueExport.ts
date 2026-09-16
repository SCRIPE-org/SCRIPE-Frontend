/**
 * ValueExport Entity
 *
 * Domain entity for one custom-field VALUE export (Wave 6 row 6.4's completion) — the `.xlsx`
 * workbook `GET /v1/custom-fields/values/{entityTypeKey}/export` produces, ready to be written to
 * the admin's disk.
 *
 * VALUES, NOT DEFINITIONS. This is the data-shaped sibling of `DefinitionExport`: one row per
 * (owner record, field), long format, for records this caller could already browse in a picker for
 * the same entity type. `DefinitionExport` describes what fields exist; this describes what was
 * actually recorded against real records — see the handler's own doc comment for why the two never
 * merge into one export with a format switch.
 *
 * ALWAYS SCOPED, UNLIKE THE DEFINITIONS EXPORT. `entityTypeKey` is a required route segment on this
 * endpoint, not an optional query parameter — a values export enumerates ACTUAL RECORDS through the
 * entity-lookup registry, which is keyed to a single registered entity type per call. There is no
 * "every type at once" shape to ask for, so unlike `DefinitionExport` there is no unscoped state and
 * no `isScoped` getter: it would always read `true` and would be dead weight, not information.
 *
 * READ-ONLY BY NATURE. There is no write path: the endpoint is a query and nothing imports a
 * workbook of stored values. So this entity has no mutators and the repository exposes no save.
 *
 * IT DOES NOT PARSE THE WORKBOOK, AND SHOULD NOT LEARN TO. The ten columns, their order and their
 * contents are the server's contract with a spreadsheet application, not with this client.
 * Everything here is about whether the bytes are worth handing to the browser.
 */
/**
 * The openxml spreadsheet content type produced on export.
 */
export const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Maximum export rows allowed.
 */
export const MAX_EXPORT_ROWS = 10_000;

/** An export as the read path produces it. */
export interface ValueExportData {
  /** The entity type this export was scoped to. Always present — see this file's header. */
  entityTypeKey: string;
  /** The download name. Mirrors the server's own rule — see `buildValueExportFileName`. */
  fileName: string;
  /** The response's `Content-Type`, as the blob preserved it. May be empty if a proxy stripped it. */
  contentType: string;
  byteSize: number;
  /** The workbook bytes, exactly as received. */
  blob: Blob;
}

/**
 * ValueExport entity class.
 */
export class ValueExport {
  constructor(public readonly data: ValueExportData) {}

  copyWith(updates: Partial<ValueExportData>): ValueExport {
    return new ValueExport({
      ...this.data,
      ...updates,
    });
  }

  get entityTypeKey(): string {
    return this.data.entityTypeKey;
  }

  get fileName(): string {
    return this.data.fileName;
  }

  get contentType(): string {
    return this.data.contentType;
  }

  get byteSize(): number {
    return this.data.byteSize;
  }

  get blob(): Blob {
    return this.data.blob;
  }

  /**
   * True when the response announced a content type this route never produces.
   *
   * An EMPTY type is NOT treated as wrong — some proxies strip `Content-Type` on a binary body, and
   * refusing a good workbook because a header went missing would be a false alarm nobody could act
   * on. What this catches is a body that announces itself as something else — an HTML sign-in page
   * or a JSON error served with a 200 — which saved as `.xlsx` produces a file a spreadsheet refuses
   * to open with no explanation of why. Same reasoning as `DefinitionExport.isUnexpectedContentType`.
   *
   * `startsWith`, not equality: `...sheet; charset=utf-8` is the same content type.
   */
  get isUnexpectedContentType(): boolean {
    return this.data.contentType.length > 0 && !this.data.contentType.startsWith(XLSX_CONTENT_TYPE);
  }

  /**
   * True for a zero-byte body.
   *
   * UNLIKE the definitions export, this is NOT automatically a sign something went wrong: the
   * handler's own "no visible fields" short-circuit still writes a header row through
   * `ICustomFieldValueExportService.BuildWorkbook`, so even that branch produces a small non-empty
   * workbook. A genuinely empty body therefore still means the same thing it does for the
   * definitions export — something other than the handler answered — so this stays a usability gate
   * rather than being reinterpreted as "no rows".
   */
  get isEmpty(): boolean {
    return this.data.byteSize === 0;
  }

  /**
   * Whether these bytes should be handed to the browser at all.
   *
   * The single gate the view model checks before downloading. Both failure modes it covers produce
   * a file that looks like an export and is not one, and a file on disk is the hardest kind of wrong
   * answer to retract.
   */
  get isUsable(): boolean {
    return !this.isEmpty && !this.isUnexpectedContentType;
  }

  /**
   * The size, for the line that reports what was downloaded.
   *
   * KiB/MiB with one decimal, formatted here so the dialog and any future caller cannot disagree
   * about it. Plain ASCII units, because these are unit symbols rather than words and are not
   * translated in either language this product ships. Identical rule to `DefinitionExport`'s own.
   */
  formattedSize(): string {
    const kib = this.data.byteSize / 1024;
    if (kib < 1) return `${this.data.byteSize} B`;
    if (kib < 1024) return `${kib.toFixed(1)} KB`;
    return `${(kib / 1024).toFixed(1)} MB`;
  }
}
