import type { DataExchangeArtifactKind } from "@core/data-exchange/domain/types";
import type { DataTransferJob } from "../../domain/entities/DataTransferJob";

/**
 * Triggers a browser download for a job artifact workbook Blob and releases the object URL.
 */
export function triggerJobArtifactDownload(
  blob: Blob,
  job: DataTransferJob,
  kind: DataExchangeArtifactKind
): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const ext = job.fileFormat?.toLowerCase() === "csv" ? "csv" : "xlsx";
  anchor.download = `${job.entityKey}-${job.kind.toLowerCase()}-${kind.toLowerCase()}-${job.jobId.slice(0, 8)}.${ext}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
