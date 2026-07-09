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
    plainKeyWarning: "Keep this key secret. Anyone with access can invoke the APIs with its permissions.",
    close: "Close",

    // Status mapping
    status: {
      active: "Active",
      revoked: "Revoked",
      expired: "Expired",
    },
  },
};
