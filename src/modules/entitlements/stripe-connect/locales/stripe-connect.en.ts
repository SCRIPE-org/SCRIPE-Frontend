export const en = {
  entitlements: {
    stripeConnect: {
      title: "Stripe Connect",
      description: "Manage Stripe Express accounts and onboarding for platform tenants.",
      account: "Connect Account",
      accounts: "Connect Accounts",
      accountsDesc: "Manage connected Stripe Express accounts for all tenants.",
      noAccounts: "No Connect accounts found.",
      createAccount: "Create Account",
      createAccountDesc: "Create a Stripe Express account for this tenant and start onboarding.",
      created: "Account Created",
      createdDesc: "Stripe Express account created. Opening onboarding link...",
      createFailed: "Failed to create account",
      refreshLink: "Refresh Onboarding Link",
      completeOnboarding: "Complete Onboarding",
      openStripeDashboard: "Open Stripe Dashboard",
      completeOnboardingDesc: "Complete onboarding for this tenant.",
      refreshLinkDesc: "Generate a new onboarding link for this tenant.",
      refreshed: "Link Refreshed",
      refreshedDesc: "A new onboarding link has been generated.",
      refreshFailed: "Failed to refresh link",
      dashboardLink: "Open Stripe Dashboard",
      dashboardLinkFailed: "Failed to get dashboard link",
      viewDashboard: "View Stripe Dashboard",
      onboarding: "Onboarding",
      onboardingStatus: "Onboarding Status",
      onboardingPending: "Pending — tenant has not completed onboarding.",
      onboardingComplete: "Complete — tenant is fully onboarded.",
      onboardingRestricted: "Restricted — payout or charges disabled.",
      openOnboarding: "Open Onboarding",
      stripeAccountId: "Stripe Account ID",
      accountType: "Account Type",
      chargesEnabled: "Charges Enabled",
      payoutsEnabled: "Payouts Enabled",
      capabilities: "Capabilities",
      openDashboard: "Open Dashboard",
      disabledReason: "Disabled Reason",
      currency: "Currency",
      country: "Country",
      payoutDelay: "Payout Delay",
      payoutDelayDays: "{{days}} day(s)",
      lastPayout: "Last Payout",
      totalPayouts: "Total Payouts",
      totalPayoutsAmount: "Total Payout Amount",
      commissionRate: "Commission Rate",
      commissionRateOverride: "Override Rate",
      commissionRateDesc: "Set a per-tenant commission override. Leave empty to use the edition or global rate.",
      commissionRateUpdated: "Commission Rate Updated",
      commissionRateUpdatedDesc: "The commission rate override has been saved.",
      commissionRateCleared: "Commission Rate Cleared",
      commissionRateClearedDesc: "The override was removed. The tenant now uses the default rate.",
      commissionRateFailed: "Failed to update commission rate",
      effectiveRate: "Effective Rate",
      effectiveRateDesc: "Resolved from: Tenant Override → Edition Rate → Global Default",
      rateLevel: {
        tenantOverride: "Tenant Override",
        editionRate: "Edition Rate",
        globalDefault: "Global Default",
      },

      // Status badges
      statusLabel: "Status",
      status: {
        Pending: "Pending",
        Complete: "Complete",
        Restricted: "Restricted",
      },
      statusColor: {
        Pending: "warning",
        Complete: "success",
        Restricted: "destructive",
      },
      enterTenantId: "Enter the Tenant ID to create a Stripe Connect account for:",

      // Table columns
      columns: {
        tenant: "Tenant",
        status: "Status",
        charges: "Charges",
        payouts: "Payouts",
        rate: "Commission",
        lastPayout: "Last Payout",
        totalAmount: "Total Amount",
        actions: "Actions",
      },
    },

    commissions: {
      title: "Commission Dashboard",
      description: "Platform-wide commission revenue analytics and per-tenant breakdown.",
      noData: "No commission data available yet.",

      // KPI cards
      totalCommission: "Total Commission",
      totalCommissionDesc: "Gross platform commission revenue collected",
      totalRefunded: "Refunded",
      totalRefundedDesc: "Total amount refunded to tenants",
      netCommission: "Net Commission",
      netCommissionDesc: "Commission after refunds",
      totalTransactions: "Transactions",
      totalTransactionsDesc: "Total commission transactions processed",
      activeTenants: "Active Tenants",
      activeTenantsDesc: "Tenants with active Stripe Connect accounts",
      globalRate: "Global Rate",
      globalRateDesc: "Platform-wide default commission rate",

      // Trends chart
      trendTitle: "Commission Trend",
      trendDesc: "Daily commission revenue over the selected period",
      trendDays: "Days",
      trendAmount: "Amount",
      trendCount: "Transactions",

      // Top tenants
      topTenantsTitle: "Top Revenue Tenants",
      topTenantsDesc: "Tenants generating the most commission for the platform",
      topTenantId: "Tenant",
      topTenantTotal: "Commission",
      topTenantCount: "Transactions",

      // Filters
      filterDays: "Period",
      filter30: "Last 30 days",
      filter90: "Last 90 days",
      filter365: "Last 365 days",
      filterCustom: "Custom range",
      fromDate: "From",
      toDate: "To",
    },

    tenantConnect: {
      // Page
      pageTitle: "Payment Account",
      pageDesc: "Set up and manage your Stripe Connect Express account to receive automated payouts from your sales.",
      verified: "Verified",

      // Hero (Not Onboarded)
      heroTitle: "Start Receiving Payments",
      heroDesc: "Connect your bank account through Stripe to securely receive automated payouts from your sales. Setup takes just a few minutes.",
      getStartedBtn: "Get Started",

      // Steps
      step1Title: "Create Account",
      step1Desc: "We'll create a secure Stripe Express account for you.",
      step2Title: "Verify Identity",
      step2Desc: "Stripe will verify your identity for compliance.",
      step3Title: "Add Bank Account",
      step3Desc: "Link your bank account to receive payouts.",
      step4Title: "Start Earning",
      step4Desc: "You're all set — payments flow automatically.",

      // Security
      securityNote: "Your information is securely processed by Stripe. NEXORA never sees or stores your bank account details.",

      // In-Progress
      setupInProgress: "Account Setup In Progress",
      setupInProgressDesc: "Complete the remaining steps to start accepting payments.",
      setupProgress: "Setup Progress",
      restrictedDesc: "Stripe requires additional information to verify your identity. Please complete the verification to continue.",

      // Completed
      accountReady: "Your Account is Ready",
      accountReadyDesc: "Payments and payouts are fully enabled.",
      totalPayouts: "Total Payouts",
      transactions: "transactions",
      commissionRate: "Platform Fee",
      perTransaction: "per transaction",
      payoutSchedule: "Payout Schedule",
      instant: "Instant",
      days: "days",
      afterPayment: "after payment",
      lastPayout: "Last Payout",
      noPayout: "No payouts yet",
      accountDetails: "Account Details",
      currency: "Currency",
      country: "Country",
      verifiedAt: "Verified At",

      // Error state
      errorTitle: "Unable to Load Account",
      errorDesc: "We couldn't load your payment account information. You may not have permission to access this page, or there was a network issue.",

      // Sync
      syncBtn: "Sync Data",
      syncSuccess: "Account Synced",
      syncSuccessDesc: "Your account data has been refreshed from Stripe.",
      syncFailed: "Sync failed. Please try again later.",

      // Transactions
      txn: {
        title: "Recent Transactions",
        desc: "Payments received, platform fees, and refunds",
        grossRevenue: "Gross Revenue",
        platformFees: "Platform Fees",
        netRevenue: "Net Revenue",
        refunded: "Total Refunded",
        deducted: "deducted by platform",
        yourEarnings: "your earnings",
        refunds: "refunds",
        empty: "No transactions found.",
        showing: "Showing",
        of: "of",
        col: {
          date: "Date",
          type: "Type",
          gross: "Gross",
          fee: "Fee",
          net: "Net",
          status: "Status",
          refund: "Refund",
        },
      },
    },
  },
};
