import { AppSubmission } from "../../domain/entities/AppSubmission";
import type { AppSubmissionData } from "../../domain/entities/AppSubmission";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

/**
 * API response shape for a submission record.
 *
 * Maps to backend AppSubmissionResponse:
 *   - reviewFeedback (not reviewerNotes)
 *   - pluginVersionId (GUID, not version string)
 *   - No developerName in backend response (resolved client-side or added later)
 *
 * Fields marked with '?' are either optional or not present in the
 * current backend response and will be safely defaulted by the mapper.
 */
export interface SubmissionDto {
  id: string;
  appListingId: string;
  appName?: string;
  /** Backend field: PluginVersionId (GUID) — displayed as version reference */
  pluginVersionId?: string;
  /** Backend field: Status (SubmissionStatus enum serialized as string) */
  status?: string;
  /** Backend field: ReviewFeedback (not reviewerNotes) */
  reviewFeedback?: string | null;
  /** Backend field: SubmittedAt (DateTime) */
  submittedAt?: string;
  /** Backend field: ReviewedAt (DateTime?) */
  reviewedAt?: string | null;
  createdAt?: string;
}

const SubmissionDtoSchema = z.object({
  id: uuidField(),
  appListingId: uuidField(),
  appName: optionalString(),
  pluginVersionId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  reviewFeedback: z.string().optional().nullable(),
  submittedAt: z.string().optional().nullable(),
  reviewedAt: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
});

/** Valid submission status values matching the frontend domain entity union. */
const VALID_STATUSES: ReadonlyArray<AppSubmissionData["status"]> = [
  "Pending",
  "UnderReview",
  "Approved",
  "Rejected",
  "RevisionsRequested",
];

/**
 * Backend SubmissionStatus enum → Frontend status union mapping.
 * The backend uses "Submitted", "InAutomatedScan", "InManualReview",
 * while the frontend uses "Pending", "UnderReview" respectively.
 */
const STATUS_MAP: Record<string, AppSubmissionData["status"]> = {
  Submitted: "Pending",
  InAutomatedScan: "UnderReview",
  InManualReview: "UnderReview",
  Approved: "Approved",
  Rejected: "Rejected",
  RevisionsRequested: "RevisionsRequested",
};

/**
 * Standalone mapper for AppSubmission DTO ↔ Entity conversions.
 * Handles backend-to-frontend status enum translation, field name
 * bridging (reviewFeedback → reviewerNotes), and null-coalescing.
 */
export class SubmissionMapper {
  /**
   * Maps a backend AppSubmissionResponse to a domain AppSubmission entity.
   * Bridges field name differences:
   *   - reviewFeedback → reviewerNotes
   *   - pluginVersionId → submittedVersion (GUID shown as reference)
   *   - developerName is not in the backend response (defaults to empty)
   */
  static toEntity(d: SubmissionDto): AppSubmission {
    const validated = safeParseApiResponse(SubmissionDtoSchema, d, "AppSubmission");

    return new AppSubmission({
      id: validated.id,
      appListingId: validated.appListingId,
      appName: validated.appName ?? "",
      developerName: "", // Not in backend AppSubmissionResponse — resolve via app listing
      submittedVersion: validated.pluginVersionId ?? "", // Backend sends GUID, displayed as reference
      status: SubmissionMapper.toStatus(validated.status ?? undefined),
      reviewerNotes: validated.reviewFeedback ?? null, // Bridge: reviewFeedback → reviewerNotes
      submittedAt: validated.submittedAt ?? validated.createdAt ?? new Date().toISOString(),
      reviewedAt: validated.reviewedAt ?? null,
    });
  }

  /**
   * Narrows a raw API status string to the frontend union type.
   * Supports both frontend union values (direct match) and
   * backend enum names (translated via STATUS_MAP).
   */
  private static toStatus(raw?: string): AppSubmissionData["status"] {
    if (!raw) return "Pending";
    // Try direct match first (frontend union values)
    if (VALID_STATUSES.includes(raw as AppSubmissionData["status"])) {
      return raw as AppSubmissionData["status"];
    }
    // Translate backend enum names to frontend union values
    return STATUS_MAP[raw] ?? "Pending";
  }
}
