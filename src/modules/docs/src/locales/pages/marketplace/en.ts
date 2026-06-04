export const en = {
  commercial: {
    marketplace: {
      financials: {
        description: "Monetize third-party developer integrations with flexible pricing models.",
        intro:
          "The marketplace monetizes third-party integrations with commissions, flexible developer pricing, and automated payout batching.",
        revenueIntro: "Choose the commercial terms that fit your ecosystem strategy.",
        revenueTitle: "Monetization Models",
        revOneItem1: "Configure a percentage commission on all paid listings.",
        revOneItem2: "Apply flat billing fees per purchase transaction.",
        revOneItem3: "Collect commissions automatically during client checkout.",
        revOneTitle: "Commission Splits",
        revTwoItem1: "Supports free, flat-rate monthly, or usage-based pricing.",
        revTwoItem2: "Supports multi-currency billing out of the box.",
        revTwoItem3: "Fully managed checkout sessions and automatic invoicing.",
        revTwoTitle: "Pricing Flexibility",
        splitIntro:
          "By leveraging Stripe Connect, transaction revenue is split instantly. Platform commission is sent directly to your corporate account, and the remainder is deposited into the developer's balance, eliminating manual accounting.",
        splitTitle: "Split Payments & Clearing",
        title: "Financials & Monetization",
      },
      overview: {
        description: "Grow your platform ecosystem with an integrated extensions store.",
        intro:
          "The SCRIPE App Marketplace enables you to launch an integrated extensions store. Customers can discover, install, and purchase third-party integrations, expanding platform utility.",
        title: "App Marketplace",
        val1: "Ecosystem Expansion",
        val1Desc:
          "Allow third-party developers to build integrations, increasing your platform's utility.",
        val2: "New Revenue Stream",
        val2Desc: "Monetize the developer ecosystem by taking platform commissions on paid apps.",
        val3: "Customer Retention",
        val3Desc:
          "Higher platform stickiness as clients integrate deep tools into their workflows.",
        val4: "Onboarding Automation",
        val4Desc: "Self-service developer onboarding and sandbox reviews reduce admin overhead.",
        valueIntro: "Launching an app marketplace provides substantial commercial benefits.",
        valueTitle: "Key Business Advantages",
      },
    },
  },
  marketplace: {
    catalog: {
      apiCategories: "List active categories for catalog filtering",
      apiDetails: "Retrieve full metadata, pricing, screenshots, and reviews for a listing",
      apiInstall: "Trigger application installation and entitlement update",
      apiList: "Retrieve active catalog with pagination, search, and category filters",
      apiReviewCreate: "Add rating and review for a specific app listing",
      apiReviewReply: "Allow developers to reply to user reviews",
      apiUninstall: "Trigger application uninstallation and dependency cleanup",
      controllerIntro:
        "Catalog endpoints are managed by AppCatalogController, AppCategoryController, and AppReviewController.",
      controllerTitle: "Catalog Endpoints",
      description: "App catalog browsing, categories, installation, and user ratings.",
      installationIntro: "Application installation follows a multi-step verification sequence.",
      installationTitle: "Installation Workflow",
      intro:
        "The catalog subsystem displays active app listings. It supports category grouping, text search, install/uninstall tasks, and user reviews.",
      step1Content:
        "The system checks tenant subscription editions to verify if custom integrations are allowed and quotas are not exceeded.",
      step1Title: "Entitlement Guard",
      step2Content:
        "If the application is paid, the system verifies an active license or redirects to checkout before marking the app as purchased.",
      step2Title: "Billing Validation",
      step3Content:
        "The app is flagged as active for the tenant, triggering webhook event handlers to configure environment variables.",
      step3Title: "Tenant Activation",
      title: "App Catalog",
    },
    financials: {
      apiEarnings: "Retrieve developer balance, total earnings, and unpaid balance",
      apiPayoutProcess: "Admin endpoint to run batch payout processing",
      apiPayoutRequest: "Trigger a manual payout request for unpaid earnings",
      apiPayouts: "List payout history for the logged developer",
      controllerIntro:
        "Marketplace financials are handled by AppFinancialsController and automated background tasks.",
      controllerTitle: "Financial Endpoints",
      description: "Marketplace purchase processing, balance calculation, and developer payouts.",
      intro:
        "The financial subsystem tracks listing purchases, manages developer balances, collects platform commission, and schedules payouts.",
      payoutIntro: "Payout processing clears earnings and payouts securely.",
      payoutTitle: "Payout Processing Workflow",
      step1Content:
        "When a tenant purchases an app, a purchase ledger record is created. Platform commission is split, and the remainder is credited to the developer's balance.",
      step1Title: "Transaction Recording",
      step2Content:
        "The PayoutBatchJob runs on schedule to collect all approved payout requests and aggregate them into a settlement batch.",
      step2Title: "Payout Batching",
      step3Content:
        "Payments are processed via Stripe Connect, transferring settled balances to the developer's bank account, and resetting the unpaid balance.",
      step3Title: "Settlement Clearing",
      title: "Marketplace Financials",
    },
    overview: {
      backendIntro: "Marketplace functionality is supported by a dedicated DbContext and entities.",
      backendTitle: "Backend Architecture",
      conn1: "Publishes approved apps",
      conn2: "Clears payments",
      conn3: "Rates listed apps",
      conn4: "Checks quotas",
      cqrsCatalogQuery: "Retrieves paginated and filtered catalog listings",
      cqrsDesc: "Operation Description",
      cqrsDetailsQuery: "Gets detailed listing metadata and reviews",
      cqrsDevProfile: "Registers a developer profile with company details",
      cqrsEarningsQuery: "Computes developer unpaid balances and history",
      cqrsExample: "AstraFlow Request",
      cqrsIntro: "The module uses standard commands and queries for all actions.",
      cqrsPurchase: "Initiates checkout for paid integrations",
      cqrsReview: "Submits rating and comment for an app",
      cqrsSubmitListing: "Submits an app listing for sandbox review",
      cqrsTitle: "CQRS Commands & Queries",
      cqrsType: "Type",
      descCatalog: "Manages global app details, tags, and category structures.",
      descEnt: "Entitlements Gate",
      descEntDesc: "Validates tenant edition limits and licensing during installations.",
      descFinancials: "Calculates platform commission, developer balances, and payouts.",
      descReviews: "Handles user reviews, abuse reports, and developer responses.",
      description: "Overview of the SCRIPE extensions and applications marketplace system.",
      descSubmissions: "Orchestrates sandbox reviews, versioning, and status transitions.",
      featureCatalog: "App Catalog",
      featureCatalogDesc: "Search, browse, and filter globally listed integrations.",
      featureFinancials: "Earnings & Payouts",
      featureFinancialsDesc: "Pricing definitions, checkout sessions, and payout batching.",
      featureReviews: "Reviews & Ratings",
      featureReviewsDesc: "Tenant feedback, star ratings, and developer review replies.",
      featureSubmissions: "Listing Submissions",
      featureSubmissionsDesc: "Developer onboarding, profile creation, and listings lifecycle.",
      infoContent:
        "While the marketplace catalog is shared globally, installs, configuration states, and purchases are strictly isolated at the tenant context level.",
      infoTitle: "Multi-Tenant Isolation",
      intro:
        "The Marketplace module allows tenants to discover, install, and purchase third-party integrations and extensions. It also provides a developer portal for profile setup, listing submissions, review cycles, and payout processing.",
      sub1: "App Listings & Catalog",
      sub2: "Submission Lifecycle",
      sub3: "Financial Clearing",
      sub4: "Reviews & Ratings",
      subModulesIntro:
        "The Marketplace module consists of several sub-modules communicating with each other and Entitlements.",
      subModulesTitle: "Sub-Modules Architecture",
      title: "Marketplace Overview",
      whatIsIntro:
        "The marketplace engine orchestrates catalog browsing, developer onboarding, reviews, and payout batching.",
      whatIsTitle: "Key Capabilities",
    },
    submissions: {
      apiApprove: "Admin endpoint to approve submission and publish to catalog",
      apiCreateProfile: "Create or update developer account details",
      apiCreateSubmission: "Create a new app submission record and upload assets",
      apiListSubmissions: "Get active submissions history for the logged developer",
      apiReject: "Admin endpoint to reject submission with feedback comments",
      controllerIntro:
        "Developer onboarding and submissions are managed by DeveloperProfileController and AppSubmissionController.",
      controllerTitle: "Submission Endpoints",
      description: "Developer profile setup, listing creation, and review workflow.",
      intro:
        "Third-party developers can onboard, register profiles, and submit application listings for sandbox verification.",
      step1Content:
        "Developer registers a profile, sets up payout terms, and configures sandbox environments.",
      step1Title: "Profile Onboarding",
      step2Content:
        "Developer defines application name, description, tags, pricing, screenshots, and security details.",
      step2Title: "Listing Scaffolding",
      step3Content:
        "SCRIPE administrators test the integration inside a secure tenant sandbox to verify security compliance.",
      step3Title: "Sandbox Verification",
      step4Content:
        "Upon approval, the system generates the listing, sets up pricing references, and publishes to the global catalog.",
      step4Title: "Public Catalog Publish",
      title: "App Submissions",
      workflowIntro: "All listing submissions progress through a gated review pipeline.",
      workflowTitle: "Submission Lifecycle",
    },
  },
};
