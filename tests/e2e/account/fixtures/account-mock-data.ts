/**
 * Deterministic Fixtures for SCRIPE Sovereign Account World v3.0 E2E Tests.
 * Strictly aligned with Backend AccountController DTOs and SovereignAccountRepository mappers.
 */

export const MOCK_ACCOUNT_DOSSIER = {
  id: "00000000-0000-0000-0000-000000000001",
  username: "superadmin",
  email: "admin@scripe.com",
  firstName: "Alex",
  lastName: "Morgan",
  phoneNumber: "+201001234567",
  staffCode: "#SCR-SOV-001",
  clubAffiliation: "Al-Ahly SC",
  editionName: "Enterprise Ultra",
  activeBranchName: "Gezira Central Campus (HQ)",
  isAvailableForOperations: true,
  securityScore: 96,
  isTwoFactorEnabled: true,
  profileImageUrl: null as string | null,
  roles: ["Platform Administrator", "Director of Football"],
  academies: [
    { id: "acad-01", name: "Gezira Central Campus (HQ)", isPrimary: true },
    { id: "acad-02", name: "Nasr City Elite Training Ground", isPrimary: false },
    { id: "acad-03", name: "Sheikh Zayed Development Center", isPrimary: false },
  ],
  bio: "UEFA Pro Licensed Technical Director overseeing First-Team Tactical Periodization, Youth Elite Transition, and Multi-Campus Sports Science.",
  tacticalIdentityJson: JSON.stringify({
    formation: "4-3-3",
    pressingHeight: 78,
    buildUpStyle: "Possession Press",
    preferredFoot: "Right",
    mentality: "High-Octane Vertical",
  }),
  clubMemberships: [
    {
      tenantId: "00000000-0000-0000-0000-000000000101",
      clubName: "Al-Ahly SC",
      branchName: "Gezira Central Campus (HQ)",
      roleTitle: "Director of Football",
      status: "Active",
      isPrimary: true,
    },
    {
      tenantId: "00000000-0000-0000-0000-000000000102",
      clubName: "Right to Dream International",
      branchName: "Cairo West Campus",
      roleTitle: "Visiting Technical Advisor",
      status: "Active",
      isPrimary: false,
    },
  ],
  linkedAthletes: [
    {
      athleteId: "ath-u16-09",
      fullName: "Youssef Morgan",
      squadName: "U-16 Elite Academy",
      shirtNumber: "10",
      relationship: "Parent / Legal Guardian",
      medicalClearanceStatus: "Cleared for Full Match Load",
    },
  ],
};

export const MOCK_CREDENTIALS_SLICE = {
  passSerialNumber: "SCR-PASS-2026-0001",
  federationId: "FIFA-UEFA-PRO-994821",
  federationBadgeCode: "FIFA-UEFA-PRO-994821",
  bloodType: "O+",
  stadiumZoneClearances: ["Pitch-Side", "Technical Area", "Tactical Box", "Medical Room"],
  passQrPayload: "SCRIPE-PASS-V3-SOV-001-ALAHLY-2026",
  qrVerificationToken: "SCRIPE-PASS-V3-SOV-001-ALAHLY-2026",
  digitalSealSvg: "SCRIPE-SEAL-#SCR-SOV-001",
  hasDigitalSignatureSeal: true,
  hasSigningPin: true,
  credentials: [
    {
      id: "cred-uefa-pro-01",
      category: "CoachingLicense",
      issuingBody: "UEFA",
      credentialTitle: "UEFA Pro Coaching License",
      certificateNumber: "UEFA-PRO-994821",
      issuedAtUtc: "2024-06-01T00:00:00Z",
      expiresAtUtc: "2027-06-01T00:00:00Z",
      verificationStatus: "Verified",
      stadiumZones: ["Pitch-Side", "Technical Area", "Tactical Box", "Medical Room"],
    },
    {
      id: "cred-safesport-02",
      category: "SafeSport",
      issuingBody: "FIFA / SafeSport",
      credentialTitle: "FIFA Child-Safeguarding & DBS Enhanced Clearance",
      certificateNumber: "DBS-SAFE-441092",
      issuedAtUtc: "2025-03-15T00:00:00Z",
      expiresAtUtc: "2027-03-15T00:00:00Z",
      verificationStatus: "Verified",
      stadiumZones: ["Academy Pitch", "Medical Room"],
    },
  ],
};

export const MOCK_SECURITY_SLICE = {
  securityScore: 96,
  isTwoFactorEnabled: true,
  backupCodesRemaining: 10,
  passkeysCount: 2,
  hardwareKeyCount: 1,
  travelShieldEnabled: false,
  allowedCidrs: ["196.219.0.0/16", "10.20.0.0/24"],
  hasDuressPin: true,
  sudoActive: true,
  sudoActiveUntilUtc: "2026-11-09T00:00:00Z",
  hardeningChecklist: [
    {
      key: "passkey",
      labelKey: "FIDO2 WebAuthn Passkey Enrolled",
      completed: true,
      weight: 35,
      targetRoute: "/account/security",
    },
    {
      key: "2fa",
      labelKey: "TOTP Two-Factor & Backup Codes Active",
      completed: true,
      weight: 25,
      targetRoute: "/account/security",
    },
  ],
  passkeys: [
    {
      id: "passkey-01",
      deviceName: "Executive MacBook Pro M4 (Touch ID)",
      deviceType: "apple",
      aaguid: "adce0002-35ac-4a43-a094-012444265000",
      maskedCredentialId: "cred_8f3a••••••••99b2",
      createdAt: "2026-10-15T09:30:00Z",
      lastUsedAt: "2026-11-08T09:22:10Z",
      signatureCounter: 142,
      isDiscoverable: true,
    },
    {
      id: "passkey-02",
      deviceName: "YubiKey 5C NFC FIPS (Hardware Vault Key)",
      deviceType: "hardware",
      aaguid: "2fc0579f-8113-47ea-b116-bb5a8db9202a",
      maskedCredentialId: "cred_12c4••••••••aa01",
      createdAt: "2026-09-01T11:00:00Z",
      lastUsedAt: "2026-11-06T18:45:00Z",
      signatureCounter: 64,
      isDiscoverable: true,
    },
  ],
};

export const MOCK_SESSIONS_SLICE = {
  impossibleTravelDetected: false,
  coachAppPairingToken: "SCRIPE-COACH-PAIR-8841-GEZIRA",
  coachAppPairingQrToken: "SCRIPE-COACH-PAIR-8841-GEZIRA",
  pairingTokenExpiresAtUtc: "2026-11-09T00:00:00Z",
  sessions: [
    {
      sessionId: "sess-current",
      tokenId: "sess-current",
      isCurrent: true,
      isCurrentSession: true,
      isImpersonated: false,
      deviceLabel: "Executive Workstation (Chrome 131 on Windows 11)",
      deviceName: "Executive Workstation (Chrome 131 on Windows 11)",
      deviceInfo: "Executive Workstation (Chrome 131 on Windows 11)",
      browserOs: "Chrome 131.0 • Windows 11 Enterprise",
      browser: "Chrome 131.0",
      operatingSystem: "Windows 11 Enterprise",
      ipAddress: "197.38.14.88",
      city: "Cairo",
      country: "Egypt",
      cityCountry: "Cairo, Egypt",
      ispAsn: "AS8452 TE-Data Enterprise Fiber",
      latitude: 30.0444,
      longitude: 31.2357,
      latencyMs: 14,
      createdAt: "2026-11-08T08:00:00Z",
      createdAtUtc: "2026-11-08T08:00:00Z",
      lastActiveAt: "2026-11-08T10:00:00Z",
      lastActiveAtUtc: "2026-11-08T10:00:00Z",
      expiresAt: "2026-11-09T08:00:00Z",
    },
    {
      sessionId: "sess-mobile-01",
      tokenId: "sess-mobile-01",
      isCurrent: false,
      isCurrentSession: false,
      isImpersonated: false,
      deviceLabel: "Pitch-Side iPad Pro M4 (Safari 18 on iPadOS)",
      deviceName: "Pitch-Side iPad Pro M4 (Safari 18 on iPadOS)",
      deviceInfo: "Pitch-Side iPad Pro M4 (Safari 18 on iPadOS)",
      browserOs: "Mobile Safari 18.1 • iPadOS 18.3",
      browser: "Mobile Safari 18.1",
      operatingSystem: "iPadOS 18.3",
      ipAddress: "197.38.15.102",
      city: "Giza",
      country: "Egypt",
      cityCountry: "Giza, Egypt",
      ispAsn: "AS36992 Vodafone Egypt 5G",
      latitude: 30.0131,
      longitude: 31.2089,
      latencyMs: 22,
      createdAt: "2026-11-07T14:15:00Z",
      createdAtUtc: "2026-11-07T14:15:00Z",
      lastActiveAt: "2026-11-08T09:30:00Z",
      lastActiveAtUtc: "2026-11-08T09:30:00Z",
      expiresAt: "2026-11-08T20:00:00Z",
    },
  ],
};

export const MOCK_DEVICES_SLICE = {
  devices: [
    {
      id: "dev-ipad-01",
      deviceName: 'Pitch-Side iPad Pro 13" M4 (Technical Area #1)',
      deviceCategory: "PitchTablet",
      platformOs: "iPadOS 18.3 Sovereign MDM",
      hardwareFingerprint: "M4PRO-00000001",
      postureScore: 98,
      isTrusted: true,
      lastOfflineSyncAtUtc: "2026-11-08T09:45:00Z",
      offlinePackages: ["SquadRosters", "MedicalCards", "TacticalBoards"],
    },
    {
      id: "dev-catapult-02",
      deviceName: "Catapult Vector S7 Ultra-Wideband Receiver",
      deviceCategory: "WearableBridge",
      platformOs: "Catapult Telemetry OS 6.4",
      hardwareFingerprint: "CAT-VEC-00000001",
      postureScore: 95,
      isTrusted: true,
      lastOfflineSyncAtUtc: "2026-11-08T09:55:00Z",
      offlinePackages: ["LiveGpsBiometrics", "SprintThresholds"],
    },
  ],
};

export const MOCK_GOVERNANCE_SLICE = {
  effectivePermissions: [
    "football.tactics.manage",
    "academy.evaluations.approve",
    "identity.security.lockdown",
  ],
  provenanceLineage: [
    {
      permissionCode: "football.tactics.manage",
      domainCategory: "Football Intelligence",
      sourceEdition: "Enterprise Ultra",
      sourceBranch: "Gezira Central Campus (HQ)",
      sourceRole: "Director of Football",
      delegatedFromAdmin: null,
      isFieldRestricted: false,
    },
    {
      permissionCode: "academy.evaluations.approve",
      domainCategory: "Academy Operations",
      sourceEdition: "Enterprise Ultra",
      sourceBranch: "All Academy Branches",
      sourceRole: "Director of Football",
      delegatedFromAdmin: null,
      isFieldRestricted: false,
    },
  ],
  availablePersonas: [
    {
      personaCode: "DIRECTOR_OF_FOOTBALL",
      title: "Director of Football (Actual)",
      branchScope: "All Campuses",
      simulatedPermissions: ["football.tactics.manage", "academy.evaluations.approve"],
    },
    {
      personaCode: "FIRST_TEAM_HEAD_COACH",
      title: "First-Team Head Coach",
      branchScope: "Gezira Central Campus (HQ)",
      simulatedPermissions: ["football.tactics.manage"],
    },
  ],
  delegations: [
    {
      id: "del-01",
      principalAdminId: "00000000-0000-0000-0000-000000000001",
      delegateAdminId: "00000000-0000-0000-0000-000000000002",
      delegateDisplayName: "Platform Operations (@opsadmin)",
      delegationType: "VacationActingAs",
      grantedScopes: ["football.tactics.view", "academy.rosters.manage"],
      justification: "CAF Inter-Club Pre-Season Tactical Camp Coverage",
      startsAtUtc: "2026-11-06T00:00:00Z",
      expiresAtUtc: "2026-11-13T00:00:00Z",
      revokedAtUtc: null,
      status: "ACTIVE",
    },
  ],
  successionCustodianAdminId: "00000000-0000-0000-0000-000000000002",
  successionCustodianName: "Platform Operations (@opsadmin)",
};

export const MOCK_ACTIVITY_SLICE = {
  chainIntegrityVerified: true,
  latestMerkleRootHash: "9f8a4b2c1d0e7f6a5b4c3d2e1f0a9b8c",
  entries: [
    {
      id: "audit-01",
      eventType: "LoginSuccess",
      severity: "INFO",
      timestampUtc: "2026-11-08T09:22:10Z",
      ipAddress: "197.38.14.88",
      correlationId: "corr-9981",
      previousHash: "000000000000",
      chainHash: "9f8a4b2c1d0e",
      payloadJson: JSON.stringify({
        authenticator: "Apple Touch ID",
        credentialId: "cred_8f3a••••••••99b2",
      }),
    },
    {
      id: "audit-02",
      eventType: "SudoStepUpVerified",
      severity: "HIGH",
      timestampUtc: "2026-11-08T09:35:00Z",
      ipAddress: "197.38.14.88",
      correlationId: "corr-9982",
      previousHash: "9f8a4b2c1d0e",
      chainHash: "4a3b2c1d0e9f",
      payloadJson: JSON.stringify({
        ttlSeconds: 900,
        method: "Passkey",
      }),
    },
  ],
  items: [
    {
      id: "audit-01",
      eventType: "LoginSuccess",
      eventDescription: "Biometric Passkey Authentication Verified",
      isSuccess: true,
      timestamp: "2026-11-08T09:22:10Z",
      ipAddress: "197.38.14.88",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
      details: "Passkey cred_8f3a••••••••99b2 verified via FIDO2 ES256 assertion.",
      rawPayload: {
        authenticator: "Apple Touch ID",
        credentialId: "cred_8f3a••••••••99b2",
        signatureCounter: 142,
      },
    },
    {
      id: "audit-02",
      eventType: "SudoStepUpVerified",
      eventDescription: "Zero-Trust Biometric Sudo Elevation Granted (15m TTL)",
      isSuccess: true,
      timestamp: "2026-11-08T09:35:00Z",
      ipAddress: "197.38.14.88",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
      details: "Elevated session for UEFA Pro Digital Seal & CIDR Geo-Fence mutation.",
      rawPayload: {
        ttlSeconds: 900,
        method: "Passkey",
      },
    },
  ],
  totalCount: 2,
  page: 1,
  pageSize: 50,
};

export const MOCK_PRIVACY_SLICE = {
  encryptedVaultCiphertext: "AES256GCM:v1:9f8a4b2c1d0e7f6a5b4c3d2e1f0a9b8c7d6e5f4a==",
  aiTelemetryConsentEnabled: true,
  anonymizedBenchmarkConsent: true,
  lastGdprExportAtUtc: "2026-11-01T12:00:00Z",
  recoveryKitKeyFingerprint: "SCR-REC-2026-9948-ALAHLY",
};

export const MOCK_PREFERENCES_SLICE = {
  schemaVersion: 3,
  themeMode: "dark",
  accentHue: "signal-lime",
  interfaceDensity: "comfortable",
  privacyBlurEnabled: false,
  launchpadHotkeysJson: JSON.stringify({
    commandBar: "Mod+K",
    privacyBlur: "Alt+P",
    saveChanges: "Mod+S",
    tacticalBoard: "G then T",
    medicalRoom: "G then M",
  }),
  savedPresetsJson: JSON.stringify([
    {
      id: "preset-1",
      name: "First-Team High-Load Matchday",
      module: "Football",
      updatedAtUtc: "2026-11-01T09:00:00Z",
    },
  ]),
};

export const MOCK_ACCESSIBILITY_SLICE = {
  sunlightModeEnabled: false,
  colorBlindMode: "NONE",
  reducedMotionEnabled: false,
  ariaVerbosity: "TACTICAL",
  typographyScale: 100,
  operatingTimezone: "Africa/Cairo",
  languageCode: "en",
  numeralSystem: "WESTERN",
  calendarSystem: "GREGORIAN_HIJRI",
  firstDayOfWeek: "SATURDAY",
  telemetryUnitSystem: "METRIC",
};

export const MOCK_AI_COPILOT_SLICE = {
  aiTelemetryConsentEnabled: true,
  aiCopilotPersonaJson: JSON.stringify({
    persona: "TACTICAL_ANALYST",
    vocabularyStyle: "UEFA_PRO",
    morningBriefingHourUtc: 6,
    morningBriefingEnabled: true,
    scoutingWeights: {
      xg: 90,
      ppda: 85,
      sprintLoad: 80,
      medicalRisk: 95,
    },
    memoryDirectives: [
      "Prioritize high-intensity sprint load (>25.2 km/h) hamstring risk alerts 48h prior to kickoff.",
      "Benchmark U-19 Academy midfielders against First-Team PPDA.",
    ],
  }),
  pinnedMemoryDirectives: [
    "Prioritize high-intensity sprint load (>25.2 km/h) hamstring risk alerts 48h prior to kickoff.",
    "Benchmark U-19 Academy midfielders against First-Team PPDA.",
  ],
};

export const MOCK_NOTIFICATIONS_SLICE = {
  notificationMatrixJson: JSON.stringify({
    channels: {
      security: ["email", "inApp", "push"],
      tactical: ["inApp", "push"],
      medical: ["email", "inApp", "whatsapp", "push"],
      commercial: ["email", "inApp"],
    },
    quietHoursEnabled: true,
    quietHoursStartUtc: "22:00",
    quietHoursEndUtc: "06:00",
    matchDayFocusModeAuto: true,
    vipOverrideRoles: ["CLUB_PRESIDENT", "CHIEF_MEDICAL_OFFICER"],
  }),
};

export const MOCK_PLAN_SLICE = {
  editionCode: "sports-ultra",
  editionName: "Enterprise Ultra",
  contractStatus: "Active",
  billingCadence: "Annual Enterprise Agreement",
  contractStartsAtUtc: "2026-01-01T00:00:00Z",
  contractExpiresAtUtc: "2027-07-01T00:00:00Z",
  daysRemaining: 235,
  seatLicenseType: "Executive & Technical Director Seat",
  supportSlaTier: "24/7 Matchday Priority (<15m Response)",
  supportVerificationPin: "849201",
  featuresMatrix: [
    {
      featureCode: "Football.TacticalPitchEngine",
      featureName: "3D & SVG Tactical Periodization & Pressing Engine",
      modulePillar: "SCRIPE Football Intelligence",
      state: "AllowedActive",
      requiredEdition: "Enterprise Ultra",
    },
    {
      featureCode: "Identity.ZeroTrustPasskeyVault",
      featureName: "FIDO2 WebAuthn L3 Hardware Passkeys & Biometric Sudo",
      modulePillar: "SCRIPE Sovereign Identity",
      state: "AllowedActive",
      requiredEdition: "Enterprise Ultra",
    },
    {
      featureCode: "Venue.AutomatedFloodlightIoT",
      featureName: "Automated Stadium Floodlight & Turnstile IoT Telemetry",
      modulePillar: "SCRIPE Venue",
      state: "ClubOwnsRequestRole",
      requiredRolePermission: "venue.iot.manage",
    },
  ],
  quotas: [
    {
      quotaCode: "Football.MaxSquadPlayers",
      label: "Registered First-Team & Academy Athletes",
      currentUsage: 420,
      limitValue: -1,
      isUnlimited: true,
      unit: "Athletes",
    },
    {
      quotaCode: "Venue.MaxFacilities",
      label: "Connected Training Campuses & Stadiums",
      currentUsage: 3,
      limitValue: 10,
      isUnlimited: false,
      unit: "Campuses",
    },
    {
      quotaCode: "Identity.MaxStaffSeats",
      label: "Technical, Medical & Executive Staff Seats",
      currentUsage: 48,
      limitValue: 100,
      isUnlimited: false,
      unit: "Seats",
    },
  ],
};

export const MOCK_BILLING_SLICE = {
  corporateCardLast4: "8842",
  monthlySpentUsd: 1850,
  monthlyLimitUsd: 15000,
  facilityCreditBalanceUsd: 2450,
  expenses: [
    {
      id: "exp-901",
      category: "International Scouting",
      description: "CAF Champions League Tactical Scouting Delegation",
      amountUsd: 1850.0,
      currency: "USD",
      status: "Approved & Reimbursed",
      occurredAtUtc: "2026-10-20T10:00:00Z",
      receiptCode: "RCP-CAF-901",
    },
  ],
  invoices: [
    {
      id: "inv-401",
      receiptNumber: "INV-2026-401",
      category: "Academy Term Tuition",
      description: "U-19 Elite Academy Spring Term Membership",
      amountUsd: 1200.0,
      currency: "USD",
      status: "Paid",
      occurredAtUtc: "2026-09-15T10:00:00Z",
    },
  ],
};

export const MOCK_INTEGRATIONS_SLICE = {
  connectedSsoProviders: ["Google Workspace"],
  externalLogins: [
    {
      id: "ext-01",
      providerName: "google",
      providerDisplayName: "Google Workspace",
      providerEmail: "alex.morgan@al-ahly.club",
      email: "alex.morgan@al-ahly.club",
      linkedAt: "2026-08-10T12:00:00Z",
    },
  ],
  personalAccessTokens: [
    {
      id: "pat-1",
      name: "Catapult GPS & Wyscout Tactical Sync CLI",
      prefix: "scr_pat_live_8f3a",
      tokenPrefix: "scr_pat_live_8f3a",
      maskedToken: "scr_pat_live_8f3a••••••••",
      scopes: ["tactics:read", "pitch:write", "evaluations:read"],
      createdAt: "2026-10-24T10:00:00Z",
      createdAtUtc: "2026-10-24T10:00:00Z",
      expiresAt: "2027-04-24T10:00:00Z",
      expiresAtUtc: "2027-04-24T10:00:00Z",
      lastUsedAt: "2026-11-08T09:12:00Z",
      lastUsedAtUtc: "2026-11-08T09:12:00Z",
    },
  ],
  sshKeys: [
    {
      id: "ssh-01",
      title: "MacBook Pro M4 Max — Tactical Data-Science Notebook Key",
      keyType: "ssh-ed25519",
      fingerprintSha256: "SHA256:9f8a000000000001e41c",
      createdAtUtc: "2026-10-08T10:00:00Z",
      lastUsedAtUtc: "2026-11-08T06:00:00Z",
    },
  ],
  webhooks: [
    {
      id: "wh-01",
      name: "Tactical Analyst Room — Live Matchday Alert Bridge",
      targetUrl: "https://hooks.scripe.org/tactical/matchday-bridge",
      subscribedEvents: ["tactics.formation.updated", "medical.clearance.alert", "security.sudo.elevated"],
      lastDeliveryAtUtc: "2026-11-08T09:42:00Z",
      lastDeliveryStatusCode: 200,
    },
  ],
  calDavFeedUrl: "https://api.scripe.org/api/v1/account/calendar/scr_ical_sov_001.ics",
};
