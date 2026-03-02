import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "modules.entitlements.intro" },

      // ─ Feature Model
      {
            type: "heading", level: 2,
            titleKey: "modules.entitlements.featureModelTitle", id: "feature-model",
      },
      { type: "paragraph", contentKey: "modules.entitlements.featureModelDesc" },
      {
            type: "table",
            headers: ["Layer", "Type", "Examples"],
            rows: [
                  ["Module Access", "Boolean", "Identity.Enabled, Chat.Enabled, ERP.Enabled"],
                  ["Feature Toggles", "Boolean/String", "ERP.Invoicing, ERP.AdvancedReporting"],
                  ["Quotas & Limits", "Numeric", "Identity.MaxAdminsPerTenant, Storage.MaxFileSizeMB"],
            ],
      },

      // ─ Editions
      {
            type: "heading", level: 2,
            titleKey: "modules.entitlements.editionsTitle", id: "editions",
      },
      { type: "paragraph", contentKey: "modules.entitlements.editionsDesc" },
      {
            type: "table",
            headers: ["Feature", "Description"],
            rows: [
                  ["Edition Scoping", "System editions + tenant-created retail editions"],
                  ["Iron Law", "Child edition features ≤ parent edition features"],
                  ["Overflow Policies", "Block, GracefulFreeze, SoftDeactivate"],
                  ["Versioning", "Draft → Pending → Rolling → Completed lifecycle"],
                  ["Rollout Strategies", "Immediate, AtRenewal, Scheduled, Staged"],
            ],
      },

      // ─ Subscriptions
      {
            type: "heading", level: 2,
            titleKey: "modules.entitlements.subscriptionsTitle", id: "subscriptions",
      },
      { type: "paragraph", contentKey: "modules.entitlements.subscriptionsDesc" },
      {
            type: "table",
            headers: ["Handler", "Purpose"],
            rows: [
                  ["AssignEdition", "Create new tenant subscription"],
                  ["ChangeEdition", "Switch editions (with downgrade validation)"],
                  ["RenewSubscription", "Extend subscription period"],
                  ["ConvertTrial", "Convert trial to paid"],
                  ["SuspendSubscription", "Temporarily suspend (cascades to children)"],
                  ["ResumeSubscription", "Reactivate (with auto-restore)"],
                  ["CancelSubscription", "Cancel (cascades to children)"],
                  ["RevokeSubscription", "Force-revoke by system admin"],
            ],
      },

      // ─ Trials
      {
            type: "heading", level: 2,
            titleKey: "modules.entitlements.trialsTitle", id: "trials",
      },
      { type: "paragraph", contentKey: "modules.entitlements.trialsDesc" },
      {
            type: "table",
            headers: ["Feature", "Description"],
            rows: [
                  ["TrialSnapshot", "Pre-trial resource count snapshot"],
                  ["Abuse Prevention", "Trial-once-per-edition, cooldown, payment required"],
                  ["Notification Timeline", "6-stage pipeline: Welcome → ReEngagement"],
                  ["Auto-Restore", "Resources restored when tenant subscribes after trial"],
            ],
      },

      // ─ Quotas
      {
            type: "heading", level: 2,
            titleKey: "modules.entitlements.quotasTitle", id: "quotas",
      },
      { type: "paragraph", contentKey: "modules.entitlements.quotasDesc" },
      {
            type: "table",
            headers: ["Quota Type", "Scope", "Example"],
            rows: [
                  ["Per-Tenant", "Individual tenant", "MaxAdminsPerTenant = 25"],
                  ["Pooled", "Entire tenant tree", "TotalAdminPool = 20,000"],
                  ["Configuration", "Per-tenant setting", "AuditRetentionDays = 90"],
            ],
      },
      {
            type: "info",
            variant: "note",
            contentKey: "modules.entitlements.quotaNote",
      },
];

registerPage({
      slug: "modules/entitlements",
      titleKey: "modules.entitlements.title",
      descriptionKey: "modules.entitlements.description",
      category: "modules",
      order: 2,
      sections,
      relatedSlugs: ["modules/identity", "features/multi-tenancy"],
      lastUpdated: "2026-03-02",
});
