export const en = {
  apikeys: {
    title: "API Keys",
    description: "Generate and manage secure API keys for programmatically accessing the SCRIPE APIs.",

    // List Columns
    name: "Key Name",
    namePlaceholder: "e.g. CI/CD integration key",
    prefix: "Key Prefix",
    scopes: "Permissions / Scopes",
    scopesPlaceholder: "Select scopes for this key",
    selectScopes: "Select Scopes",
    statusLabel: "Status",
    createdAt: "Created At",
    expiresAt: "Expires At",
    revokedAt: "Revoked At",
    neverExpires: "Never Expires",
    untitled: "Untitled API Key",
    backToList: "API Keys",
    lastUsed: "Last used",
    rotateKey: "Rotate Key",

    // Expiry Options
    expiration: "Expiration",
    expirationPlaceholder: "Select expiration period",
    expirations: {
      never: "Never (No Expiration)",
      days30: "30 Days",
      days90: "90 Days",
      days365: "1 Year",
      custom: "Custom Days",
    },
    customDays: "Custom Expiry (Days)",
    customDaysPlaceholder: "Number of days",

    // Scopes configuration
    availableScopes: "Available Permissions",
    allScopes: "All Scopes",
    noScopesSelected: "Please select at least one permission scope",

    // Actions & Buttons
    create: "Generate API Key",
    generate: "Generate",
    revoke: "Revoke Key",
    revoking: "Revoking...",
    copyKey: "Copy Key",
    copied: "Copied!",

    // Success Messages
    created: "API Key Generated Successfully",
    createdDesc: "API Key has been created. Please copy the plain-text token below and store it securely. For security reasons, you will NOT be able to view this token again.",
    revoked: "API Key Revoked",
    revokedDesc: "The API key was successfully revoked.",

    // Confirmation dialogs
    revokeConfirmTitle: "Revoke API Key?",
    revokeConfirmDesc: "This will permanently invalidate the API key. Any external scripts or integrations using it will instantly fail with 401 Unauthorized. This action cannot be undone.",

    // Modals
    plainKeyLabel: "Your New API Key Token",
    plainKeyWarning: "Keep this key secret.",
    plainKeyDesc: "Anyone with access can invoke the APIs with its permissions.",
    close: "Close",

    // Status mapping
    status: {
      active: "Active",
      revoked: "Revoked",
      expired: "Expired",
    },

    // --- Stats ---
    stats: {
      totalHits: "Total Hits",
      thisMinute: "this minute",
      successRate: "Success Rate",
      successful: "successful",
      failed: "failed",
      monthlyQuota: "Monthly Quota",
      noLimit: "No monthly limit set",
      avgResponse: "Avg Response",
      rateLimit: "Rate limit",
      perMin: "/min",
    },

    // --- Chart ---
    chart: {
      title: "Request Activity",
      view: {
        volume: "Volume",
        errors: "Errors",
        response: "Response Time",
      },
      noData: "No data for this period",
    },

    // --- Danger Zone ---
    dangerZone: {
      title: "Danger Zone",
      revokeTitle: "Revoke this key",
      revokeDesc: "Immediately invalidates this key. All requests using it will return 401. This can be undone by contacting support.",
      deleteTitle: "Permanently delete this key",
      deleteDesc: "Deletes the key and ALL associated usage logs and stats. This CANNOT be undone.",
      deleteBtn: "Delete",
      deleteConfirmTitle: "Permanently Delete API Key?",
      deleteConfirmDesc: "This will delete the key and all its logs permanently. Type the key name to confirm.",
      typeToConfirm: "Type key name to confirm",
    },

    // --- Rotate Dialog ---
    rotate: {
      successTitle: "API Key Rotated Successfully",
      successDesc: "Please copy your new secret key now. It won't be shown again!",
    },

    // --- Settings Panel ---
    settings: {
      title: "Configuration Settings",
      name: "Key Name",
      rateLimit: "Rate Limit (hits/min)",
      desc: "Description",
      descPlaceholder: "Explain what this integration key is used for...",
      quota: "Monthly Quota (total hits)",
      resetDay: "Quota Reset Day (1-28)",
      alert: "Alert Threshold (%)",
      whitelist: "IP Whitelist (comma-separated)",
    },

    // --- Scopes Panel ---
    scopesPanel: {
      title: "API Scopes / Permissions",
      selectAll: "Select All",
      deselectAll: "Clear All",
      searchPlaceholder: "Search permissions...",
      noPermissions: "No permissions found",
    },

    // --- Activity Log ---
    activity: {
      title: "Real-time Access Logs",
      searchPlaceholder: "Filter by endpoint...",
      statusPlaceholder: "Status Code",
      method: "Method",
      endpoint: "Endpoint",
      status: "Status",
      duration: "Latency",
      ip: "IP Address",
      time: "Time (UTC)",
      noLogs: "No requests logged for this key yet",
      showing: "Total records",
    },

    // --- Error Views ---
    error: {
      notFound: "API Key not found or access denied.",
    },

    // --- Toast Alerts ---
    revokeToast: {
      successMsg: "API key successfully revoked.",
      errorMsg: "Failed to revoke API key.",
    },
    deleteToast: {
      successMsg: "API key permanently deleted.",
      errorMsg: "Failed to permanently delete API key.",
    },
    updateToast: {
      successScopes: "API key scopes updated successfully.",
      successSettings: "API key settings updated successfully.",
    },
  },
};
