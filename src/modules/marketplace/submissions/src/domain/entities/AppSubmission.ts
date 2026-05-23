
export interface AppSubmissionData {
  id: string;
  appListingId: string;
  appName: string;
  developerName: string;
  submittedVersion: string;
  status: "Pending" | "UnderReview" | "Approved" | "Rejected" | "RevisionsRequested";
  reviewerNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export class AppSubmission {
  constructor(private readonly data: AppSubmissionData) {}
  get id() { return this.data.id; }
  get appListingId() { return this.data.appListingId; }
  get appName() { return this.data.appName; }
  get developerName() { return this.data.developerName; }
  get submittedVersion() { return this.data.submittedVersion; }
  get status() { return this.data.status; }
  get reviewerNotes() { return this.data.reviewerNotes; }
  get submittedAt() { return this.data.submittedAt; }
  get reviewedAt() { return this.data.reviewedAt; }

  get isPending() { return this.data.status === "Pending"; }
  get isUnderReview() { return this.data.status === "UnderReview"; }
  get isApproved() { return this.data.status === "Approved"; }
  get isRejected() { return this.data.status === "Rejected"; }
  get needsRevisions() { return this.data.status === "RevisionsRequested"; }

  get statusVariant(): "default" | "secondary" | "destructive" | "outline" {
    if (this.isApproved) return "default";
    if (this.isRejected) return "destructive";
    if (this.needsRevisions) return "secondary";
    return "outline";
  }

  copyWith(updates: Partial<AppSubmissionData>): AppSubmission {
    return new AppSubmission({ ...this.data, ...updates });
  }
}
