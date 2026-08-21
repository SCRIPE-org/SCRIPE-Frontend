/**
 * DefinitionExport Entity
 *
 * Domain entity for one custom-field DEFINITION export (Wave 6 row 6.4) — the `.xlsx` workbook
 * `GET /v1/custom-fields/export` produces, ready to be written to the admin's disk.
 *
 * DEFINITIONS, NOT VALUES. The workbook describes what fields exist, of what type, with what
 * configuration. It never contains anybody's stored data — the values export is blocked on the
 * per-record read-authorization prerequisite — so this entity carries no notion of a record, an
 * owner or a subject.
 *
 * READ-ONLY BY NATURE. There is no write path: the endpoint is a query and nothing imports a
 * workbook. So this entity has no mutators and the repository exposes no save.
 *
 * IT DOES NOT PARSE THE WORKBOOK, AND SHOULD NOT LEARN TO. The eighteen columns, their order and
 * their contents are the server's contract with a spreadsheet application, not with this client.
 * Everything here is about whether the bytes are worth handing to the browser — which is a question
 * a client CAN answer, and the only one it has any business answering.
 */
import { XLSX_CONTENT_TYPE } from "../../data/models/DefinitionExportModel";

/** An export as the read path produces it. */
export interface DefinitionExportData {
  /** The requested scope. Null when the export covers every entity type the caller can see. */
  entityTypeKey: string | null;
  /** The download name. Mirrors the server's own rule — see `buildDefinitionExportFileName`. */
  fileName: string;
  /** The response's `Content-Type`, as the blob preserved it. May be empty if a proxy stripped it. */
  contentType: string;
  byteSize: number;
  /** The workbook bytes, exactly as received. */
  blob: Blob;
}

/**
 * DefinitionExport entity class.
 */
export class DefinitionExport {
  constructor(public readonly data: DefinitionExportData) {}

  get entityTypeKey(): string | null {
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

  /** True when the export was scoped to one entity type rather than covering all of them. */
  get isScoped(): boolean {
    return this.data.entityTypeKey !== null;
  }

  /**
   * True when the response announced a content type this route never produces.
   *
   * An EMPTY type is NOT treated as wrong. Some proxies strip `Content-Type` on a binary body, and
   * refusing a good workbook because a header went missing would be a false alarm that no admin
   * could act on. What this catches is the opposite and much more useful case: a body that announces
   * itself as something else — an HTML sign-in page or a JSON error served with a 200 by something
   * between this client and the API. Saved as `.xlsx`, that produces a file a spreadsheet refuses to
   * open with no explanation of why, which is exactly the silent-corruption outcome worth spending a
   * branch on.
   *
   * `startsWith`, not equality: `...sheet; charset=utf-8` is the same content type.
   */
  get isUnexpectedContentType(): boolean {
    return this.data.contentType.length > 0 && !this.data.contentType.startsWith(XLSX_CONTENT_TYPE);
  }

  /**
   * True for a zero-byte body.
   *
   * Never a legitimate answer from this route: the handler writes a header row before it writes
   * anything else, so even an export with no definitions at all is a valid workbook of several
   * kilobytes. An empty scope is therefore NOT this — which is why, unlike the schema export, there
   * is no "nothing to export" state here.
   */
  get isEmpty(): boolean {
    return this.data.byteSize === 0;
  }

  /**
   * Whether these bytes should be handed to the browser at all.
   *
   * The single gate the view model checks before downloading. Both failure modes it covers produce a
   * file that looks like an export and is not one, and a file on disk is the hardest kind of wrong
   * answer to retract.
   */
  get isUsable(): boolean {
    return !this.isEmpty && !this.isUnexpectedContentType;
  }

  /**
   * The size, for the line that reports what was downloaded.
   *
   * KiB/MiB with one decimal, formatted here rather than in the component so the dialog and any
   * future caller cannot disagree about it. Plain ASCII units, because these are unit symbols rather
   * than words and are not translated in either language this product ships.
   */
  formattedSize(): string {
    const kib = this.data.byteSize / 1024;
    if (kib < 1) return `${this.data.byteSize} B`;
    if (kib < 1024) return `${kib.toFixed(1)} KB`;
    return `${(kib / 1024).toFixed(1)} MB`;
  }
}
