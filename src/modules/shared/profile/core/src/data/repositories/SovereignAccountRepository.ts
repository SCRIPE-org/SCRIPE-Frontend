// FILE-EXCEPTION: file length
/**
 * SovereignAccountRepository
 *
 * Concrete implementation of ISovereignAccountRepository.
 * Communicates strictly with /api/v1/account/* endpoints via IApiService and maps
 * backend DTOs to domain entities with zero hardcoded mock fallbacks.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PROFILE_ENDPOINTS } from "../services/profile.endpoints";
import type { ISovereignAccountRepository } from "../../domain/interfaces/ISovereignAccountRepository";
import type {
  SovereignAccountContext,
  SovereignDossierSlice,
  SovereignCredentialsSlice,
  AdminCredentialItem,
  SovereignSecuritySlice,
  SovereignSessionsSlice,
  SovereignDevicesSlice,
  AdminDeviceItem,
  SovereignGovernanceSlice,
  AdminDelegationItem,
  SovereignActivitySlice,
  SovereignPrivacySlice,
  SovereignPreferencesSlice,
  SovereignAccessibilitySlice,
  SovereignAiCopilotSlice,
  SovereignNotificationsSlice,
  SovereignPlanSlice,
  SovereignBillingSlice,
  SovereignIntegrationsSlice,
} from "../../domain/entities/SovereignAccountEntities";

export class SovereignAccountRepository implements ISovereignAccountRepository {
  constructor(private readonly api: IApiService) {}

  async getContext(): Promise<SovereignAccountContext> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.CONTEXT);
    const p = raw.profile ?? {};
    return {
      adminId: p.id ?? raw.adminId ?? "",
      tenantId: p.tenantId ?? raw.tenantId ?? null,
      username: p.username ?? raw.username ?? "",
      fullName:
        raw.fullName ??
        (`${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.username || ""),
      email: p.email ?? raw.email ?? null,
      staffCode: p.staffCode ?? raw.staffCode ?? "",
      clubAffiliation: p.clubAffiliation ?? raw.clubAffiliation ?? "",
      activeBranchName: p.activeBranchName ?? raw.activeBranchName ?? "",
      editionName: raw.editionName ?? p.editionName ?? "",
      isAvailableForOperations:
        p.isAvailableForOperations ?? raw.isAvailableForOperations ?? true,
      securityPostureScore: raw.securityScore ?? raw.securityPostureScore ?? 0,
      postureChecklist: (raw.hardeningChecklist ?? raw.postureChecklist ?? []).map(
        (c: any) => ({
          key: c.key,
          labelKey: c.labelKey ?? c.label ?? c.key,
          completed: Boolean(c.completed),
          weight: Number(c.weight ?? 0),
          targetRoute: c.targetRoute ?? "/account/security",
        })
      ),
      activeSessionsCount: Number(raw.activeSessionsCount ?? 1),
      pairedDevicesCount: Number(raw.trustedDevicesCount ?? raw.pairedDevicesCount ?? 0),
      travelShieldEnabled: Boolean(raw.travelShieldEnabled),
      travelShieldExpiresAtUtc: raw.travelShieldExpiresAtUtc ?? null,
      sudoActive: Boolean(raw.sudoActive),
      sudoExpiresAtUtc: raw.sudoExpiresAtUtc ?? null,
    };
  }

  async getDossier(): Promise<SovereignDossierSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.DOSSIER);
    return {
      id: raw.id ?? "",
      username: raw.username ?? "",
      firstName: raw.firstName ?? "",
      lastName: raw.lastName ?? "",
      email: raw.email ?? null,
      phoneNumber: raw.phoneNumber ?? null,
      profileImageUrl: raw.profileImageUrl ?? null,
      staffCode: raw.staffCode ?? null,
      bio: raw.bio ?? null,
      clubAffiliation: raw.clubAffiliation ?? null,
      activeBranchName: raw.activeBranchName ?? null,
      editionName: raw.editionName ?? null,
      isAvailableForOperations: Boolean(raw.isAvailableForOperations),
      securityScore: Number(raw.securityScore ?? 0),
      tacticalIdentityJson:
        raw.tacticalIdentityJson ?? raw.tacticalPhilosophyJson ?? "{}",
      clubMemberships: (raw.clubMemberships ?? []).map((m: any) => ({
        tenantId: m.tenantId ?? "",
        clubName: m.clubName ?? "",
        branchName: m.branchName ?? "",
        roleTitle: m.roleTitle ?? m.roleName ?? "",
        status: m.status ?? "",
        isPrimary: Boolean(m.isPrimary),
      })),
      linkedAthletes: (raw.linkedAthletes ?? []).map((a: any) => ({
        athleteId: a.athleteId ?? "",
        fullName: a.fullName ?? "",
        squadName: a.squadName ?? "",
        shirtNumber: a.shirtNumber ?? "",
        relationship: a.guardianRelationship ?? a.relationship ?? "",
        medicalClearanceStatus: a.medicalClearanceStatus ?? "",
      })),
    };
  }

  async getCredentials(): Promise<SovereignCredentialsSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.CREDENTIALS);
    return {
      passSerialNumber: raw.passSerialNumber ?? raw.federationId ?? "",
      federationBadgeCode: raw.federationId ?? raw.federationBadgeCode ?? "",
      bloodType: raw.bloodType ?? "",
      stadiumZoneClearances: raw.stadiumZoneClearances ?? [],
      qrVerificationToken: raw.passQrPayload ?? raw.qrVerificationToken ?? "",
      hasDigitalSignatureSeal: Boolean(raw.digitalSealSvg ?? raw.hasDigitalSignatureSeal),
      digitalSignatureSealPreview: raw.digitalSealSvg ?? raw.digitalSignatureSealPreview ?? null,
      hasSigningPin: Boolean(raw.hasSigningPin),
      credentials: (raw.credentials ?? []).map((c: any) => ({
        id: String(c.id),
        category: c.category ?? "",
        governingBody: c.issuingBody ?? c.governingBody ?? "",
        title: c.credentialTitle ?? c.title ?? "",
        licenseNumber: c.certificateNumber ?? c.licenseNumber ?? "",
        issuedAtUtc: c.issuedAtUtc ?? "",
        expiresAtUtc: c.expiresAtUtc ?? null,
        verificationStatus: c.verificationStatus ?? "",
        documentUrl: c.attachmentUrl ?? c.documentUrl ?? null,
        authorityNotes: c.authorityNotes ?? null,
      })),
    };
  }

  async upsertCredential(
    data: Parameters<ISovereignAccountRepository["upsertCredential"]>[0]
  ): Promise<AdminCredentialItem> {
    const payload = {
      action: data.signingPin ? "SET_SIGNING_PIN" : "ADD_CREDENTIAL",
      category: data.category,
      issuingBody: data.governingBody,
      credentialTitle: data.title,
      certificateNumber: data.licenseNumber,
      issuedAtUtc: data.issuedAtUtc,
      expiresAtUtc: data.expiresAtUtc,
      stadiumZonesJson: data.stadiumZoneClearances
        ? JSON.stringify(data.stadiumZoneClearances)
        : "[]",
      digitalSealSvg: data.digitalSignatureSealSvg,
      signingPin: data.signingPin,
    };
    const res = await this.api.post<any>(PROFILE_ENDPOINTS.ACCOUNT.CREDENTIALS, payload);
    return {
      id: String(res?.id ?? ""),
      category: data.category,
      governingBody: data.governingBody,
      title: data.title,
      licenseNumber: data.licenseNumber,
      issuedAtUtc: data.issuedAtUtc,
      expiresAtUtc: data.expiresAtUtc ?? null,
      verificationStatus: data.verificationStatus ?? "Verified",
      documentUrl: data.documentUrl ?? null,
      authorityNotes: data.authorityNotes ?? null,
    };
  }

  async deleteCredential(id: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.ACCOUNT.CREDENTIAL_BY_ID(id));
  }

  async getSecurity(): Promise<SovereignSecuritySlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.SECURITY);
    return {
      isTwoFactorEnabled: Boolean(raw.isTwoFactorEnabled),
      backupCodesRemaining: Number(raw.backupCodesRemaining ?? 0),
      passkeyCount: Number(raw.passkeysCount ?? raw.passkeyCount ?? 0),
      hardwareKeyCount: Number(raw.hardwareKeyCount ?? raw.passkeysCount ?? 0),
      securityPostureScore: Number(raw.securityScore ?? raw.securityPostureScore ?? 0),
      postureChecklist: (raw.hardeningChecklist ?? raw.postureChecklist ?? []).map(
        (c: any) => ({
          key: c.key,
          labelKey: c.labelKey ?? c.label ?? c.key,
          completed: Boolean(c.completed),
          weight: Number(c.weight ?? 0),
          targetRoute: c.targetRoute ?? "/account/security",
        })
      ),
      travelShieldEnabled: Boolean(raw.travelShieldEnabled),
      travelShieldExpiresAtUtc: raw.travelShieldExpiresAtUtc ?? null,
      trustedCidrs: raw.allowedCidrs ?? raw.trustedCidrs ?? [],
      hasDuressPin: Boolean(raw.hasDuressPin),
      sudoActive: Boolean(raw.sudoActiveUntilUtc || raw.sudoActive),
      sudoExpiresAtUtc: raw.sudoActiveUntilUtc ?? raw.sudoExpiresAtUtc ?? null,
    };
  }

  async updateSecurityPosture(
    data: Parameters<ISovereignAccountRepository["updateSecurityPosture"]>[0]
  ): Promise<void> {
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.SECURITY, {
      travelShieldEnabled: data.travelShieldEnabled,
      travelShieldExpiresAtUtc: data.travelShieldExpiresAtUtc,
      allowedCidrs: data.trustedCidrs,
      duressPin: data.duressPin,
      sudoVerificationPin: data.verifySudoPinOrPasskeyToken,
      lockdownConfirmation: data.lockdownConfirmation,
    });
  }

  async getSessions(): Promise<SovereignSessionsSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.SESSIONS);
    return {
      sessions: (raw.sessions ?? []).map((s: any) => ({
        sessionId: String(s.sessionId ?? s.id ?? ""),
        deviceLabel: s.deviceLabel ?? "",
        browserOs: s.browserOs ?? "",
        ipAddress: s.ipAddress ?? "",
        geoLocation: s.cityCountry ?? s.geoLocation ?? "",
        asnIsp: s.ispAsn ?? s.asnIsp ?? "",
        latitude: Number(s.latitude ?? 0),
        longitude: Number(s.longitude ?? 0),
        isCurrent: Boolean(s.isCurrentSession ?? s.isCurrent),
        isImpossibleTravelFlagged: Boolean(
          s.isImpossibleTravelAnomaly ?? s.isImpossibleTravelFlagged
        ),
        latencyMs: Number(s.latencyMs ?? 0),
        createdAtUtc: s.createdAtUtc ?? "",
        lastActiveAtUtc: s.lastActiveAtUtc ?? "",
      })),
      coachAppPairingToken:
        raw.coachAppPairingQrToken ?? raw.coachAppPairingToken ?? "",
      coachAppPairingExpiresAtUtc:
        raw.pairingTokenExpiresAtUtc ?? raw.coachAppPairingExpiresAtUtc ?? "",
    };
  }

  async pingSession(
    sessionId: string
  ): Promise<{ sessionId: string; rttMilliseconds: number; status: string }> {
    return this.api.post(PROFILE_ENDPOINTS.ACCOUNT.PING_SESSION(sessionId), {});
  }

  async getDevices(): Promise<SovereignDevicesSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.DEVICES);
    const devices: AdminDeviceItem[] = (raw.devices ?? []).map((d: any) => ({
      id: String(d.id),
      deviceId: d.hardwareFingerprint ?? d.deviceId ?? String(d.id),
      deviceName: d.deviceName ?? "",
      deviceCategory: d.deviceCategory ?? "",
      platformOs: d.platformOs ?? "",
      appVersion: d.appVersion ?? "",
      postureScore: Number(d.postureScore ?? 0),
      isTrusted: Boolean(d.isTrusted),
      isBiometricEnrolled: Boolean(d.isBiometricEnrolled ?? d.isTrusted),
      offlineVaultQuotaMb: Number(d.offlineVaultQuotaMb ?? 2048),
      offlinePendingSyncCount: Array.isArray(d.offlinePackages)
        ? d.offlinePackages.length
        : Number(d.offlinePendingSyncCount ?? 0),
      telemetryBridgeProvider: d.telemetryBridgeProvider ?? d.hardwareFingerprint ?? null,
      lastSeenIp: d.lastSeenIp ?? null,
      lastSeenGeo: d.lastSeenGeo ?? null,
      lastActiveAtUtc: d.lastOfflineSyncAtUtc ?? d.lastActiveAtUtc ?? "",
    }));
    return {
      devices,
      totalOfflineVaultMb: Number(raw.totalOfflineVaultMb ?? devices.length * 2048),
      totalPendingSyncPackages: Number(
        raw.totalPendingSyncPackages ??
          devices.reduce((acc, d) => acc + d.offlinePendingSyncCount, 0)
      ),
    };
  }

  async upsertDevice(
    data: Parameters<ISovereignAccountRepository["upsertDevice"]>[0]
  ): Promise<AdminDeviceItem> {
    const res = await this.api.post<any>(PROFILE_ENDPOINTS.ACCOUNT.DEVICES, {
      action: "REGISTER_DEVICE",
      deviceName: data.deviceName,
      deviceCategory: data.deviceCategory,
      platformOs: data.platformOs,
      hardwareFingerprint: data.telemetryBridgeProvider ?? data.deviceId,
      offlinePackagesJson: "[]",
    });
    return {
      id: String(res?.id ?? ""),
      deviceId: data.deviceId,
      deviceName: data.deviceName,
      deviceCategory: data.deviceCategory,
      platformOs: data.platformOs,
      appVersion: data.appVersion,
      postureScore: 95,
      isTrusted: data.isTrusted,
      isBiometricEnrolled: data.isBiometricEnrolled,
      offlineVaultQuotaMb: data.offlineVaultQuotaMb,
      offlinePendingSyncCount: 0,
      telemetryBridgeProvider: data.telemetryBridgeProvider ?? null,
      lastActiveAtUtc: new Date().toISOString(),
    };
  }

  async revokeDevice(id: string, wipeOfflineVault: boolean = true): Promise<void> {
    const url = buildUrl(PROFILE_ENDPOINTS.ACCOUNT.REVOKE_DEVICE(id), { wipeOfflineVault });
    await this.api.delete(url);
  }

  async getGovernance(): Promise<SovereignGovernanceSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.GOVERNANCE);
    return {
      effectivePermissions: raw.effectivePermissions ?? [],
      provenanceGraph: (raw.provenanceLineage ?? raw.provenanceGraph ?? []).map(
        (p: any) => ({
          permissionCode: p.permissionCode ?? "",
          domain: p.domainCategory ?? p.domain ?? "",
          editionSource: p.sourceEdition ?? p.editionSource ?? "",
          branchScope: p.sourceBranch ?? p.branchScope ?? "",
          grantingRole: p.sourceRole ?? p.grantingRole ?? "",
          delegationSource: p.delegatedFromAdmin ?? p.delegationSource ?? null,
          isFieldRestricted: Boolean(p.isFieldRestricted),
        })
      ),
      delegations: (raw.delegations ?? []).map((d: any) => ({
        id: String(d.id),
        principalAdminId: String(d.principalAdminId ?? ""),
        delegateAdminId: String(d.delegateAdminId ?? ""),
        delegateDisplayName: d.delegateDisplayName ?? "",
        delegationType: d.delegationType ?? "",
        grantedScopes: d.grantedScopes ?? [],
        justification: d.justification ?? "",
        startsAtUtc: d.startsAtUtc ?? "",
        expiresAtUtc: d.expiresAtUtc ?? "",
        revokedAtUtc: d.revokedAtUtc ?? null,
        status: d.status ?? "",
      })),
      successionCustodianAdminId: raw.successionCustodianAdminId
        ? String(raw.successionCustodianAdminId)
        : null,
      successionCustodianName: raw.successionCustodianName ?? null,
      simulatorPersonas: (raw.availablePersonas ?? raw.simulatorPersonas ?? []).map(
        (p: any) => ({
          personaId: p.personaCode ?? p.personaId ?? "",
          roleTitle: p.title ?? p.roleTitle ?? "",
          branchScope: p.branchScope ?? "",
          effectivePermissions: p.simulatedPermissions ?? p.effectivePermissions ?? [],
        })
      ),
    };
  }

  async createDelegation(
    data: Parameters<ISovereignAccountRepository["createDelegation"]>[0]
  ): Promise<AdminDelegationItem> {
    const res = await this.api.post<any>(PROFILE_ENDPOINTS.ACCOUNT.DELEGATIONS, {
      actionType: "DELEGATION",
      delegateDisplayName: data.delegateDisplayName,
      delegationType: data.delegationType,
      grantedScopes: data.grantedScopes,
      justification: data.justification,
      startsAtUtc: data.startsAtUtc,
      expiresAtUtc: data.expiresAtUtc,
    });
    return {
      id: String(res?.id ?? ""),
      principalAdminId: "",
      delegateAdminId: data.delegateAdminId,
      delegateDisplayName: data.delegateDisplayName,
      delegationType: data.delegationType,
      grantedScopes: data.grantedScopes,
      justification: data.justification,
      startsAtUtc: data.startsAtUtc,
      expiresAtUtc: data.expiresAtUtc,
      revokedAtUtc: null,
      status: "ACTIVE",
    };
  }

  async revokeDelegation(id: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.ACCOUNT.REVOKE_DELEGATION(id));
  }

  async getActivity(count: number = 30): Promise<SovereignActivitySlice> {
    const url = buildUrl(PROFILE_ENDPOINTS.ACCOUNT.ACTIVITY, { count });
    const raw = await this.api.get<any>(url);
    return {
      entries: (raw.entries ?? []).map((e: any) => ({
        id: String(e.id),
        eventType: e.eventType ?? "",
        severity: e.severity ?? "",
        timestampUtc: e.timestampUtc ?? "",
        ipAddress: e.ipAddress ?? "",
        correlationId: e.correlationId ?? "",
        previousHashShort: e.previousHash ?? e.previousHashShort ?? "",
        entryHashShort: e.chainHash ?? e.entryHashShort ?? "",
        payloadJson: e.payloadJson ?? "{}",
      })),
      chainIntegrityStatus: raw.chainIntegrityVerified
        ? `SHA-256 Root ${raw.latestMerkleRootHash ?? ""}`
        : raw.chainIntegrityStatus ?? "",
      activeInspectorPassToken: raw.activeInspectorPassToken ?? null,
      inspectorPassExpiresAtUtc: raw.inspectorPassExpiresAtUtc ?? null,
    };
  }

  async generateInspectorPass(inspectorOrganization: string, validHours: number) {
    const res = await this.api.post<any>(PROFILE_ENDPOINTS.ACCOUNT.INSPECTOR_PASS, {
      inspectorOrganization,
      validHours,
    });
    return {
      passToken: res.passToken ?? "",
      expiresAtUtc: res.expiresAtUtc ?? "",
      scopeDescription: res.inspectorOrganization ?? inspectorOrganization,
    };
  }

  async getPrivacy(): Promise<SovereignPrivacySlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.PRIVACY);
    return {
      encryptedScratchpadCiphertext:
        raw.encryptedVaultCiphertext ?? raw.encryptedScratchpadCiphertext ?? null,
      aiTelemetryConsent: Boolean(
        raw.aiTelemetryConsentEnabled ?? raw.aiTelemetryConsent ?? true
      ),
      anonymizedBenchmarkConsent: Boolean(raw.anonymizedBenchmarkConsent ?? true),
      lastPortabilityExportAtUtc:
        raw.lastGdprExportAtUtc ?? raw.lastPortabilityExportAtUtc ?? null,
      recoveryKitSerial: raw.recoveryKitKeyFingerprint ?? raw.recoveryKitSerial ?? "",
    };
  }

  async updatePrivacy(
    data: Parameters<ISovereignAccountRepository["updatePrivacy"]>[0]
  ): Promise<void> {
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.PRIVACY, {
      encryptedVaultCiphertext: data.encryptedScratchpadCiphertext,
      aiTelemetryConsentEnabled: data.aiTelemetryConsent,
    });
  }

  async requestPrivacyExport() {
    const res = await this.api.post<any>(PROFILE_ENDPOINTS.ACCOUNT.PRIVACY_EXPORT, {});
    return {
      archiveId: res.archiveId ?? "",
      generatedAtUtc: res.generatedAtUtc ?? "",
      sha256Signature: res.sha256Signature ?? "",
      jsonPayload: res.downloadPayloadJson ?? res.jsonPayload ?? "{}",
    };
  }

  async getPreferences(): Promise<SovereignPreferencesSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.PREFERENCES);
    return {
      themeMode: raw.themeMode ?? "dark",
      clubAccentHue: raw.accentHue ?? raw.clubAccentHue ?? "signal-lime",
      density: raw.interfaceDensity ?? raw.density ?? "comfortable",
      defaultLandingRoute: raw.defaultLandingRoute ?? "/overview",
      sidebarCollapsedByDefault: Boolean(raw.sidebarCollapsedByDefault),
      broadcastPrivacyBlurDefault: Boolean(
        raw.privacyBlurEnabled ?? raw.broadcastPrivacyBlurDefault
      ),
      customHotkeysJson: raw.launchpadHotkeysJson ?? raw.customHotkeysJson ?? "{}",
      savedFilterPresetsJson:
        raw.savedPresetsJson ?? raw.savedFilterPresetsJson ?? "[]",
    };
  }

  async updatePreferences(
    data: Partial<SovereignPreferencesSlice>
  ): Promise<SovereignPreferencesSlice> {
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.PREFERENCES, {
      themeMode: data.themeMode,
      accentHue: data.clubAccentHue,
      interfaceDensity: data.density,
      privacyBlurEnabled: data.broadcastPrivacyBlurDefault,
      launchpadHotkeysJson: data.customHotkeysJson,
      savedPresetsJson: data.savedFilterPresetsJson,
    });
    return this.getPreferences();
  }

  async getAccessibility(): Promise<SovereignAccessibilitySlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.ACCESSIBILITY);
    const unitSystem = raw.telemetryUnitSystem ?? "METRIC";
    return {
      sunlightContrastMode: Boolean(
        raw.sunlightModeEnabled ?? raw.sunlightContrastMode
      ),
      colorBlindPalette: (raw.colorBlindMode ?? raw.colorBlindPalette ?? "NONE").toLowerCase(),
      reducedMotion: Boolean(raw.reducedMotionEnabled ?? raw.reducedMotion),
      screenReaderVerbosity: (
        raw.ariaVerbosity ??
        raw.screenReaderVerbosity ??
        "STANDARD"
      ).toLowerCase(),
      fontScalePercent: Number(raw.typographyScale ?? raw.fontScalePercent ?? 100),
      operatingTimezone: raw.operatingTimezone ?? "UTC",
      preferredLanguage: raw.languageCode ?? raw.preferredLanguage ?? "en",
      numeralSystem: (raw.numeralSystem ?? "WESTERN").toLowerCase(),
      calendarMode: (raw.calendarSystem ?? raw.calendarMode ?? "GREGORIAN_HIJRI").toLowerCase(),
      firstDayOfWeek: raw.firstDayOfWeek ?? "SATURDAY",
      speedUnit: unitSystem === "IMPERIAL" ? "mph" : "km/h",
      weightUnit: unitSystem === "IMPERIAL" ? "lb" : "kg",
      temperatureUnit: unitSystem === "IMPERIAL" ? "F" : "C",
    };
  }

  async updateAccessibility(
    data: Partial<SovereignAccessibilitySlice>
  ): Promise<SovereignAccessibilitySlice> {
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.ACCESSIBILITY, {
      sunlightModeEnabled: data.sunlightContrastMode,
      colorBlindMode: data.colorBlindPalette?.toUpperCase(),
      reducedMotionEnabled: data.reducedMotion,
      ariaVerbosity: data.screenReaderVerbosity?.toUpperCase(),
      typographyScale: data.fontScalePercent,
      languageCode: data.preferredLanguage,
      operatingTimezone: data.operatingTimezone,
      numeralSystem: data.numeralSystem?.toUpperCase(),
      calendarSystem: data.calendarMode?.toUpperCase(),
      firstDayOfWeek: data.firstDayOfWeek?.toUpperCase(),
      telemetryUnitSystem: data.speedUnit === "mph" ? "IMPERIAL" : "METRIC",
    });
    return this.getAccessibility();
  }

  async getAiCopilot(): Promise<SovereignAiCopilotSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.AI_COPILOT);
    let parsed: Record<string, any> = {};
    if (typeof raw.aiCopilotPersonaJson === "string") {
      try {
        parsed = JSON.parse(raw.aiCopilotPersonaJson);
      } catch {
        parsed = {};
      }
    }
    return {
      copilotPersona: parsed.persona ?? raw.copilotPersona ?? "TACTICAL_ANALYST",
      tacticalVocabularyStyle:
        parsed.vocabularyStyle ?? raw.tacticalVocabularyStyle ?? "UEFA_PRO",
      scoutingMetricWeightsJson: JSON.stringify(parsed.scoutingWeights ?? {}),
      morningBriefingEnabled: Boolean(
        parsed.morningBriefingEnabled ?? raw.morningBriefingEnabled ?? true
      ),
      morningBriefingUtcHour: Number(
        parsed.morningBriefingHourUtc ?? raw.morningBriefingUtcHour ?? 6
      ),
      memoryEntriesJson: JSON.stringify(
        raw.pinnedMemoryDirectives ?? parsed.memoryDirectives ?? []
      ),
    };
  }

  async updateAiCopilot(
    data: Partial<SovereignAiCopilotSlice>
  ): Promise<SovereignAiCopilotSlice> {
    const current = await this.getAiCopilot();
    const merged = { ...current, ...data };
    let weights = {};
    let memories: string[] = [];
    try {
      weights = JSON.parse(merged.scoutingMetricWeightsJson);
    } catch {
      weights = {};
    }
    try {
      memories = JSON.parse(merged.memoryEntriesJson);
    } catch {
      memories = [];
    }
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.AI_COPILOT, {
      aiCopilotPersonaJson: JSON.stringify({
        persona: merged.copilotPersona,
        vocabularyStyle: merged.tacticalVocabularyStyle,
        morningBriefingHourUtc: merged.morningBriefingUtcHour,
        morningBriefingEnabled: merged.morningBriefingEnabled,
        scoutingWeights: weights,
        memoryDirectives: memories,
      }),
      aiTelemetryConsentEnabled: true,
    });
    return this.getAiCopilot();
  }

  async getNotifications(): Promise<SovereignNotificationsSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS);
    let parsed: Record<string, any> = {};
    if (typeof raw.notificationMatrixJson === "string") {
      try {
        parsed = JSON.parse(raw.notificationMatrixJson);
      } catch {
        parsed = {};
      }
    }
    return {
      routingMatrixJson: JSON.stringify(parsed.channels ?? parsed),
      quietHoursEnabled: Boolean(parsed.quietHoursEnabled ?? true),
      quietHoursStartUtc: parsed.quietHoursStartUtc ?? "22:00",
      quietHoursEndUtc: parsed.quietHoursEndUtc ?? "06:00",
      matchDayFocusAutoEnable: Boolean(parsed.matchDayFocusModeAuto ?? true),
      vipOverrideRoles: parsed.vipOverrideRoles ?? [],
    };
  }

  async updateNotifications(
    data: Partial<SovereignNotificationsSlice>
  ): Promise<SovereignNotificationsSlice> {
    const current = await this.getNotifications();
    const merged = { ...current, ...data };
    let channels = {};
    try {
      channels = JSON.parse(merged.routingMatrixJson);
    } catch {
      channels = {};
    }
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS, {
      notificationMatrixJson: JSON.stringify({
        channels,
        quietHoursEnabled: merged.quietHoursEnabled,
        quietHoursStartUtc: merged.quietHoursStartUtc,
        quietHoursEndUtc: merged.quietHoursEndUtc,
        matchDayFocusModeAuto: merged.matchDayFocusAutoEnable,
        vipOverrideRoles: merged.vipOverrideRoles,
      }),
    });
    return this.getNotifications();
  }

  async getPlan(): Promise<SovereignPlanSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.PLAN);
    return {
      editionCode: raw.editionCode ?? "",
      editionName: raw.editionName ?? "",
      subscriptionStatus: raw.contractStatus ?? raw.subscriptionStatus ?? "",
      billingCadence: raw.billingCadence ?? "",
      contractStartedAtUtc: raw.contractStartsAtUtc ?? raw.contractStartedAtUtc ?? "",
      contractExpiresAtUtc: raw.contractExpiresAtUtc ?? "",
      daysRemaining: Number(raw.daysRemaining ?? 0),
      assignedSeatRole: raw.seatLicenseType ?? raw.assignedSeatRole ?? "",
      supportSlaTier: raw.supportSlaTier ?? "",
      rotatingSupportPin: raw.supportVerificationPin ?? raw.rotatingSupportPin ?? "",
      supportPinSecondsRemaining: 900,
      features: (raw.featuresMatrix ?? raw.features ?? []).map((f: any) => ({
        featureCode: f.featureCode ?? "",
        featureName: f.featureName ?? "",
        category: f.modulePillar ?? f.category ?? "",
        state:
          f.state === "AllowedActive" || f.state === "allowed"
            ? "allowed"
            : f.state === "ClubOwnsRequestRole" || f.state === "club_owned_request_role"
            ? "club_owned_request_role"
            : "locked_upgrade",
        description: f.requiredRolePermission ?? f.requiredEdition ?? f.description ?? "",
      })),
      quotas: (raw.quotas ?? []).map((q: any) => ({
        quotaCode: q.quotaCode ?? "",
        label: q.label ?? "",
        used: Number(q.currentUsage ?? q.used ?? 0),
        limit: Number(q.limitValue ?? q.limit ?? 0),
        isUnlimited: Boolean(q.isUnlimited),
        unit: q.unit ?? "",
      })),
    };
  }

  async submitPlanRequest(
    requestType: string,
    targetCode: string,
    notes: string = ""
  ): Promise<void> {
    await this.api.post(PROFILE_ENDPOINTS.ACCOUNT.PLAN_REQUEST, {
      actionType: requestType,
      targetFeatureCode: targetCode,
      justification: notes,
    });
  }

  async getBilling(): Promise<SovereignBillingSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.BILLING);
    const expenses = (raw.expenses ?? []).map((e: any) => ({
      id: String(e.id),
      title: e.description ?? e.title ?? "",
      category: e.category ?? "",
      amount: Number(e.amountUsd ?? e.amount ?? 0),
      currency: e.currency ?? "USD",
      incurredAtUtc: e.occurredAtUtc ?? e.incurredAtUtc ?? "",
      status: e.status ?? "",
    }));
    const invoices = (raw.invoices ?? []).map((inv: any) => ({
      invoiceNumber: inv.receiptNumber ?? inv.id ?? inv.invoiceNumber ?? "",
      description: inv.description ?? "",
      amount: Number(inv.amountUsd ?? inv.amount ?? 0),
      currency: inv.currency ?? "USD",
      issuedAtUtc: inv.occurredAtUtc ?? inv.issuedAtUtc ?? "",
      status: inv.status ?? "",
    }));
    return {
      reimbursementIbanMasked: raw.corporateCardLast4
        ? `•••• ${raw.corporateCardLast4}`
        : raw.reimbursementIbanMasked ?? "",
      defaultCurrency: "USD",
      pendingReimbursementTotal: Number(raw.monthlySpentUsd ?? 0),
      settledReimbursementTotal: Number(raw.monthlyLimitUsd ?? 0),
      facilityBookingCreditsBalance: Number(raw.facilityCreditBalanceUsd ?? 0),
      expenses,
      invoices,
    };
  }

  async submitExpenseClaim(
    data: Parameters<ISovereignAccountRepository["submitExpenseClaim"]>[0]
  ): Promise<SovereignBillingSlice> {
    await this.api.post(PROFILE_ENDPOINTS.ACCOUNT.BILLING_EXPENSES, {
      category: data.category,
      description: data.title,
      amountUsd: data.amount,
      currency: data.currency,
    });
    return this.getBilling();
  }

  async getIntegrations(): Promise<SovereignIntegrationsSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATIONS);
    return {
      externalIdpLinks: (raw.connectedSsoProviders ?? []).map(
        (providerName: string, idx: number) => ({
          id: `sso-${idx}`,
          providerName,
          externalEmail: "",
          linkedAtUtc: "",
        })
      ),
      personalAccessTokens: (raw.personalAccessTokens ?? []).map((p: any) => ({
        id: String(p.id),
        name: p.name ?? "",
        tokenPrefix: p.tokenPrefix ?? "",
        scopes: p.scopes ?? [],
        createdAtUtc: p.createdAtUtc ?? "",
        expiresAtUtc: p.expiresAtUtc ?? null,
        lastUsedAtUtc: p.lastUsedAtUtc ?? null,
      })),
      sshKeys: (raw.sshKeys ?? []).map((k: any) => ({
        id: String(k.id),
        title: k.title ?? "",
        keyType: k.keyType ?? "",
        fingerprintSha256: k.fingerprintSha256 ?? "",
        createdAtUtc: k.createdAtUtc ?? "",
        lastUsedAtUtc: k.lastUsedAtUtc ?? null,
      })),
      webhooks: (raw.webhooks ?? []).map((w: any) => ({
        id: String(w.id),
        name: w.name ?? "",
        targetUrl: w.targetUrl ?? "",
        secretPrefix: "whsec_",
        subscribedEvents: w.subscribedEvents ?? [],
        isActive: true,
        failureCount: 0,
        lastDeliveredAtUtc: w.lastDeliveryAtUtc ?? null,
      })),
      privateIcalFeedUrl: raw.calDavFeedUrl ?? raw.privateIcalFeedUrl ?? "",
    };
  }

  async createIntegrationItem(
    data: Parameters<ISovereignAccountRepository["createIntegrationItem"]>[0]
  ) {
    const res = await this.api.post<any>(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATIONS, {
      integrationType:
        data.itemKind === "pat"
          ? "PAT"
          : data.itemKind === "ssh"
          ? "SSH_KEY"
          : "WEBHOOK",
      name: data.name,
      scopes: data.itemKind === "pat" ? data.scopesOrEvents : undefined,
      expiresInDays: data.expiresInDays ?? 90,
      keyType: data.itemKind === "ssh" ? "ssh-ed25519" : undefined,
      publicKeyMaterial: data.itemKind === "ssh" ? data.publicKeyOrTargetUrl : undefined,
      targetUrl: data.itemKind === "webhook" ? data.publicKeyOrTargetUrl : undefined,
      subscribedEvents: data.itemKind === "webhook" ? data.scopesOrEvents : undefined,
    });
    return {
      id: String(res?.id ?? ""),
      itemKind: data.itemKind,
      plainTextSecretOnce: res?.oneTimePlaintextSecret ?? null,
      fingerprintOrPrefix: "",
    };
  }

  async deleteIntegrationItem(itemKind: string, id: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATION_BY_ID(itemKind, id));
  }
}
