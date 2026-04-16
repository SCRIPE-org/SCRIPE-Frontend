export const en = {
  webhooks: {
    title: "Webhooks",
    description: "Manage webhook subscriptions and monitor event deliveries",

    // ─── List Columns ────────────────────────────────────────
    url: "Endpoint URL",
    urlPlaceholder: "https://your-server.com/webhook",
    includeChildren: "Include Children",
    includeChildrenPlaceholder: "Include Children",
    includeChildrenDesc:
      "Receive events from this tenant and all descendant tenants (hierarchy scope)",
    description_field: "Description",
    descriptionPlaceholder: "e.g. Production order notifications",
    events: "Events",
    eventsRequired: "Select at least one event",
    selectEvents: "Select events to subscribe to",
    selected: "selected",
    selectAll: "Select all",
    deselectAll: "Deselect all",
    statusLabel: "Status",
    lastDelivery: "Last Delivery",
    untitled: "Untitled Webhook",
    eventCount: "{{count}} event",
    eventCountPlural: "{{count}} events",

    // ─── Scope ───────────────────────────────────────────────
    scope: {
      label: "Scope",
      system: "System",
      hierarchy: "Hierarchy",
      tenant: "Tenant",
    },

    // ─── URL Validation ──────────────────────────────────────
    urlHttpsRequired:
      "URL must use HTTPS (http://localhost allowed for dev)",

    // ─── Status ──────────────────────────────────────────────
    status: {
      active: "Active",
      inactive: "Inactive",
      autoDisabled: "Auto-disabled",
      success: "Success",
      failed: "Failed",
    },

    // ─── Actions ─────────────────────────────────────────────
    create: "Create Webhook",
    createDesc:
      "Subscribe to events and receive real-time HTTP notifications.",
    edit: "Edit Webhook",
    editDesc: "Update the webhook subscription settings.",
    toggleStatus: "Toggle Status",
    deactivate: "Deactivate",
    activate: "Activate",
    testPing: "Test Ping",
    testing: "Testing...",

    // ─── Success Messages ────────────────────────────────────
    created: "Webhook Created",
    createdDesc: "Webhook subscription created successfully.",
    updated: "Webhook Updated",
    updatedDesc: "Webhook subscription updated successfully.",
    deleted: "Webhook Deleted",
    deletedDesc: "Webhook subscription deleted.",
    toggled: "Webhook Toggled",
    toggledDesc: "Webhook status updated.",

    // ─── Delete Confirmation ─────────────────────────────────
    deleteConfirmTitle: "Delete Webhook",
    deleteConfirmDesc:
      "This will permanently delete this webhook subscription and all its delivery logs. This action cannot be undone.",

    // ─── Not Found ───────────────────────────────────────────
    notFound: "Webhook Not Found",
    notFoundDesc: "The requested webhook could not be found.",

    // ─── Secret ──────────────────────────────────────────────
    secret: "Signing Secret",
    secretDescription:
      "Used to sign webhook payloads with HMAC-SHA256. Keep this secret safe.",
    rotateSecret: "Rotate Secret",
    rotateSecretTitle: "Rotate Signing Secret",
    rotateSecretDesc:
      "A new secret will be generated. The old secret will remain valid for 24 hours to allow time for updating your integration.",
    rotateSecretConfirm: "Rotate Secret",
    secretRotated: "Secret Rotated",
    secretRotatedDesc: "Secret rotated. Old secret valid for 24 hours.",
    previousSecretActive: "Previous secret is still valid until",
    gracePeriod: "Grace Period",
    secretMaskedNote:
      "For security, the full secret is only shown when first created or after rotation. Use 'Rotate Secret' to generate and reveal a new secret.",

    // ─── Test ────────────────────────────────────────────────
    testSuccess: "Test Delivered Successfully",
    testFailed: "Test Delivery Failed",

    // ─── Stats ───────────────────────────────────────────────
    stats: {
      total: "Total Deliveries",
      successful: "Successful",
      failed: "Failed",
      successRate: "Success Rate",
    },

    // ─── Configuration ───────────────────────────────────────
    configuration: "Configuration",
    maxRetries: "Max Retries",
    maxRetriesDesc: "Number of retry attempts on failure (0-10)",
    maxConsecutiveFailures: "Auto-disable Threshold",
    maxFailuresDesc:
      "Auto-disable after this many consecutive failures",
    consecutiveFailuresLabel: "failures",
    currentFailures: "Current Failures",
    lastStatus: "Last Status",
    advancedSettings: "Advanced Settings",

    // ─── Auto-Disabled ───────────────────────────────────────
    autoDisabledTitle: "Webhook Auto-Disabled",
    autoDisabledDesc:
      "This webhook was automatically disabled after {{count}} consecutive failures. Click 'Activate' to re-enable.",
    autoDisabledGeneric:
      "This webhook was automatically disabled due to consecutive delivery failures. Click 'Activate' to re-enable.",

    // ─── Tabs ────────────────────────────────────────────────
    overview: "Overview",
    deliveryLog: "Delivery Log",
    subscribedEvents: "Subscribed Events",
    subscribedEventsDesc: "Events that trigger this webhook",

    // ─── Delivery Log ────────────────────────────────────────
    eventType: "Event",
    httpCode: "HTTP",
    attempt: "Attempt",
    latency: "Latency",
    timestamp: "Timestamp",
    noDeliveries: "No deliveries yet",
    noDeliveriesDesc:
      "Delivery attempts will appear here when events are triggered.",
    errorMessage: "Error",
    requestUrl: "Request URL",
    payload: "Payload",
    responseBody: "Response Body",
    responseOrError: "Response / Error",

    // ─── Health Dashboard ────────────────────────────────────
    health: {
      title: "System Health",
      endpoints: "Endpoints",
      successRate: "Success Rate",
      system: "System-wide",
      last24h: "Last 24h",
      deadLettered: "Dead Letters",
      needsAttention: "Needs attention",
      allClear: "All clear",
      retrying: "Retrying",
      idle: "Idle",
      endpointAutoDisabled:
        "endpoint was auto-disabled due to consecutive failures",
      endpointsAutoDisabled:
        "endpoints were auto-disabled due to consecutive failures",
    },

    // ─── Analytics ───────────────────────────────────────────
    analytics: {
      tab: "Analytics",
      deliveryTrend: "Delivery Trend",
      successRate: "Success Rate",
      avgLatency: "Avg Latency",
      p95Latency: "P95 Latency",
      deadLettered: "Dead Lettered",
      totalDeliveries: "Total Deliveries",
      successfulDeliveries: "Successful",
      failedDeliveries: "Failed",
      noData: "No analytics data available yet",
      noDataDesc:
        "Analytics will populate once webhook deliveries start occurring.",
      last30days: "Daily delivery breakdown — last 30 days",
    },

    // ─── Dead Letters ────────────────────────────────────────
    deadLetters: {
      tab: "Dead Letters",
      title: "Dead Letter Queue",
      description:
        "Failed deliveries that have exhausted all retry attempts. You can replay them individually or in bulk.",
      empty: "No dead letters",
      emptyDesc:
        "All webhook deliveries are being processed successfully.",
      replay: "Replay",
      replayAll: "Replay All",
      replaying: "Replaying...",
      replayAllTitle: "Replay All Dead Letters",
      replayAllDesc:
        "This will retry all {{count}} failed deliveries. Are you sure?",
      confirmReplayAll: "Replay All",
      replaySuccess: "Delivery replayed successfully",
      replayAllSuccess: "All dead letters have been queued for replay",
      replayed: "Replayed",
      replayedDesc: "Delivery has been re-queued for retry.",
      allReplayed: "All Replayed",
      allReplayedDesc: "All dead letters have been re-queued for retry.",
    },

    // ─── Form Sections ───────────────────────────────────────
    form: {
      endpointSection: "Endpoint",
      endpointSectionDesc: "Where webhook events will be delivered",
      eventsSection: "Event Subscriptions",
      eventsSectionDesc:
        "Choose which events you want to be notified about",
      optionsSection: "Options",
      optionsSectionDesc: "Additional delivery and retry settings",
      searchEvents: "Search events...",
      noEventsFound: "No events match your search",
    },

    // ─── Localized Event Names ───────────────────────────────
    // NOTE: Nested objects — NOT dot-string keys.
    // t('webhooks.eventNames.admin.created') resolves admin → created correctly.
    eventNames: {
      admin: {
        created: "Admin Created",
        updated: "Admin Updated",
        deleted: "Admin Deleted",
        blocked: "Admin Blocked",
        unblocked: "Admin Unblocked",
      },
      role: {
        created: "Role Created",
        updated: "Role Updated",
        deleted: "Role Deleted",
      },
      tenant: {
        created: "Tenant Created",
        updated: "Tenant Updated",
        suspended: "Tenant Suspended",
      },
      user: {
        created: "User Registered",
        updated: "User Updated",
        deleted: "User Deleted",
      },
      notification: {
        sent: "Notification Sent",
      },
      email: {
        sent: "Email Delivered",
        failed: "Email Failed",
      },
      security: {
        login_failed: "Login Failed",
        account_locked: "Account Locked",
        "2fa_enabled": "2FA Enabled",
      },
      audit: {
        action: "Audit Action",
      },
      webhook: {
        test: "Test Ping",
      },
      subscription: {
        created: "Subscription Created",
        activated: "Subscription Activated",
        cancelled: "Subscription Cancelled",
        expired: "Subscription Expired",
        renewed: "Subscription Renewed",
        upgraded: "Plan Upgraded",
        downgraded: "Plan Downgraded",
        trial_ending: "Trial Ending Soon",
      },
      invoice: {
        created: "Invoice Generated",
        paid: "Invoice Paid",
        overdue: "Invoice Overdue",
        voided: "Invoice Voided",
      },
      payment: {
        succeeded: "Payment Succeeded",
        failed: "Payment Failed",
      },
      refund: {
        created: "Refund Initiated",
      },
    },
  },
};
