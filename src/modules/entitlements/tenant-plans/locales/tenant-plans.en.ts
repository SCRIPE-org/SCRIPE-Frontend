export const en = {
  entitlements: {
    tenantPlans: {
      // ── Page ──
      title: "Tenant Plans",
      description: "Create and manage pricing plans for your end-users.",
      planName: "Plan Name",
      namePlaceholder: "e.g. Gold, Premium, Enterprise",
      descriptionPlaceholder: "Brief description of this plan...",

      // ── Pricing & Billing ──
      pricing: "Starting Price",
      billingCycles: "Billing Cycles",
      monthly: "Monthly",
      yearly: "Yearly",
      lifetime: "Lifetime",
      allowMonthly: "Allow Monthly Billing",
      allowYearly: "Allow Yearly Billing",
      allowLifetime: "Allow Lifetime Purchase",
      allowTrial: "Allow Trial",

      // ── Display ──
      displayNameEn: "Display Name (EN)",
      displayNameEnPlaceholder: "Customer-facing name in English",
      displayNameAr: "Display Name (AR)",
      displayNameArPlaceholder: "اسم العرض بالعربية",
      tagline: "Tagline",
      taglinePlaceholder: "Short marketing tagline",
      isPublic: "Publicly Visible",
      isPublicDesc: "If enabled, users can see and select this plan.",
      tier: "Tier Level",

      // ── Limits & Trial ──
      trialDays: "Trial Days",
      trialDaysDesc: "Number of free trial days (0 = no trial).",
      maxUsers: "Max Users",
      maxUsersDesc: "-1 means unlimited users can subscribe.",
      maxSubscribers: "Max Subscribers",
      sortOrder: "Sort Order",
      subscribers: "Subscribers",
      gracePeriodDays: "Grace Period Days",

      // ── Settings ──
      selfServiceEnabled: "Self-Service Enabled",
      contactSalesOnly: "Contact Sales Only",

      // ── Lifecycle ──
      publish: "Publish",
      publishDesc: "Make this plan live for subscriptions.",
      published: "Plan Published",
      publishedDesc: "Plan is now live and available for subscriptions.",
      publishFailed: "Failed to publish plan.",
      archive: "Archive",
      archiveDesc: "Archive this plan. Existing subscriptions are maintained.",
      archived: "Plan Archived",
      archivedDesc: "Plan has been archived. No new subscriptions allowed.",
      archiveFailed: "Failed to archive plan.",
      statusDraft: "Draft",
      statusPublished: "Published",
      statusArchived: "Archived",

      // ── Tabs ──
      tabFeatures: "Features",
      tabPricing: "Pricing",
      tabVersions: "Versions",
      tabPromotions: "Promotions",

      // ── Features Tab ──
      noFeatures: "No features assigned to this plan yet.",
      noFeaturesHint: "Add features from the Feature Catalog to define what this plan includes.",

      // ── Pricing Tab ──
      noPricing: "No pricing configured for this plan yet.",
      noPricingHint: "Add pricing entries for different currencies and billing cycles.",
      priceCount: "price",
      priceCountPlural: "prices",
      promo: "Promo",

      // ── Versions Tab ──
      noVersions: "No version snapshots yet.",
      noVersionsHint: "Version snapshots are created when a plan is published.",
      versionHistory: "Version History",
      versionHistoryDesc: "Immutable snapshots created on publish. Active subscriptions are pinned to their version.",

      // ── Promotions Tab ──
      promotionsTitle: "Promotions",
      promotionsDesc: "Promo codes and discounts linked to this plan. Manage all promotions from the main Promotions page.",
      promotionsPlaceholder: "Promotions management is available from the dedicated page.",
      viewAllPromotions: "View All Promotions",

      // ── CRUD ──
      create: "Create Plan",
      createDesc: "Define a new pricing plan for your users.",
      edit: "Edit Plan",
      editDesc: "Update plan details.",
      deleteConfirmTitle: "Delete Plan",
      deleteConfirmDesc: "This will soft-delete the plan. You cannot delete plans with active subscribers.",
      created: "Plan Created",
      createdDesc: "New plan created successfully.",
      updated: "Plan Updated",
      updatedDesc: "Plan details updated.",
      deleted: "Plan Deleted",
      deletedDesc: "Plan removed.",

      // ── States ──
      noPlans: "No plans found",
      activeBadge: "Active",
      inactiveBadge: "Inactive",
      publicBadge: "Public",
      privateBadge: "Private",
      unlimitedUsers: "Unlimited",
      unlimited: "∞",
      cannotDeleteActive: "Cannot delete a plan with active subscribers.",
      noTenantContext: "Tenant Plans are only available for tenant-scoped administrators.",
      noTenantContextHint: "Please impersonate a tenant admin to manage plans.",
    },
  },
};
