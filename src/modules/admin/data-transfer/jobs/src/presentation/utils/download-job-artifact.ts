import type {
  DataTransferArtifactKind,
  DataTransferJob,
} from "../../domain/entities/DataTransferJob";

/**
 * Triggers a browser download for a job artifact workbook Blob and releases the object URL.
 */
export function triggerJobArtifactDownload(
  blob: Blob,
  job: DataTransferJob,
  kind: DataTransferArtifactKind
): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const normalizedFormat = job.fileFormat?.toLowerCase();
  const ext =
    kind === "rejected"
      ? "xlsx"
      : normalizedFormat === "csv" || normalizedFormat === "tsv"
        ? normalizedFormat
        : "xlsx";
  anchor.download = `${job.entityKey}-${job.kind.toLowerCase()}-${kind.toLowerCase()}-${job.jobId.slice(0, 8)}.${ext}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
