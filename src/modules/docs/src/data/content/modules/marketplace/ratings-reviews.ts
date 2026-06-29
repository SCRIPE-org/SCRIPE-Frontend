import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Introduction ────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.marketplaceReviews.intro" },

  // ─── AppReview Entity ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceReviews.reviewTitle",
    id: "app-review",
  },
  { type: "paragraph", contentKey: "modules.marketplaceReviews.reviewIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["AppListingId", "Guid", "FK to the app listing being reviewed"],
      ["TenantId", "Guid", "Tenant that the reviewing user belongs to"],
      ["UserId", "Guid", "User who authored this review"],
      ["Rating", "int", "Star rating from 1 (worst) to 5 (best)"],
      ["Title", "string", "Headline / title of the review (e.g. \"Great plugin!\")"],
      ["Content", "string", "Detailed review text body"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.marketplaceReviews.reviewNote",
  },

  // ─── AppReviewReply Entity ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceReviews.replyTitle",
    id: "app-review-reply",
  },
  { type: "paragraph", contentKey: "modules.marketplaceReviews.replyIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["AppReviewId", "Guid", "FK to the review being replied to"],
      ["Content", "string", "Text content of the developer's response"],
    ],
  },

  // ─── AppReviewTask Entity ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceReviews.taskTitle",
    id: "app-review-task",
  },
  { type: "paragraph", contentKey: "modules.marketplaceReviews.taskIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["AppSubmissionId", "Guid", "FK to the submission being reviewed"],
      ["AssignedToUserId", "Guid?", "Admin user ID assigned to review this submission (null = unassigned)"],
      ["Status", "ReviewTaskStatus", "Current status (Pending, InProgress, Approved, Rejected, Escalated)"],
      ["Feedback", "string", "Reviewer's feedback message sent to the developer"],
    ],
  },

  // ─── Moderation Flowchart ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceReviews.moderationTitle",
    id: "review-moderation",
  },
  { type: "paragraph", contentKey: "modules.marketplaceReviews.moderationIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "submitted", label: "Submission Created", type: "default" },
      { id: "auto", label: "Automated Scan", type: "info" },
      { id: "task", label: "Review Task Assigned", type: "warning" },
      { id: "inprog", label: "In Progress", type: "warning" },
      { id: "approved", label: "Approved → Published", type: "success" },
      { id: "rejected", label: "Rejected → Feedback", type: "danger" },
      { id: "escalated", label: "Escalated", type: "danger" },
    ],
    connections: [
      { from: "submitted", to: "auto", label: "automated scan" },
      { from: "auto", to: "task", label: "passes scan" },
      { from: "task", to: "inprog", label: "admin assigned" },
      { from: "inprog", to: "approved", label: "all checks pass" },
      { from: "inprog", to: "rejected", label: "issues found" },
      { from: "inprog", to: "escalated", label: "needs senior review" },
    ],
  },
];

registerPage({
  slug: "modules/marketplace/ratings-reviews",
  titleKey: "modules.marketplaceReviews.title",
  descriptionKey: "modules.marketplaceReviews.description",
  category: "modules",
  order: 74,
  sections,
  relatedSlugs: [
    "modules/marketplace/app-listings",
    "modules/marketplace/developer-portal",
    "modules/marketplace/marketplace-overview",
  ],
  lastUpdated: "2026-06-29",
});
