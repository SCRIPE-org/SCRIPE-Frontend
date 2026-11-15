// FILE-EXCEPTION: file length
/**
 * SovereignAccountRepository
 *
 * Concrete implementation of ISovereignAccountRepository for the Clean 9-Page
 * B2B Enterprise Account Console (v4.0).
 * Communicates strictly with /api/v1/account/* endpoints via IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PROFILE_ENDPOINTS } from "../services/profile.endpoints";
import type { ISovereignAccountRepository } from "../../domain/interfaces/ISovereignAccountRepository";
import type {
  SovereignAccountContext,
  SovereignDossierSlice,
  SovereignSecuritySlice,
  SovereignSessionsSlice,
  SovereignGovernanceSlice,
  AdminDelegationItem,
  SovereignActivitySlice,
  SovereignPreferencesSlice,
  SovereignNotificationsSlice,
  NotificationCategoryRuleItem,
  SovereignPlanSlice,
  SovereignIntegrationsSlice,
} from "../../domain/entities/SovereignAccountEntities";

export class SovereignAccountRepository implements ISovereignAccountRepository {
  constructor(private readonly api: IApiService) {}

  async getContext(): Promise<SovereignAccountContext> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.CONTEXT);
    const p = raw.admin ?? raw.profile ?? {};
    const hud = raw.telemetryHud ?? raw;
    return {
      adminId: String(p.id ?? raw.adminId ?? ""),
      tenantId: p.tenantId ?? raw.tenantId ?? null,
      username: p.username ?? raw.username ?? "",
      fullName:
        raw.fullName ??
        (`${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.username || ""),
      email: p.email ?? raw.email ?? null,
      staffCode: p.staffCode ?? raw.staffCode ?? "",
      clubAffiliation: p.clubAffiliation ?? raw.clubAffiliation ?? "",
      activeBranchName:
        hud.activeBranchName ?? p.activeBranchName ?? raw.activeBranchName ?? "",
      editionName:
        hud.activeEditionName ?? raw.editionName ?? p.editionName ?? "",
      isAvailableForOperations:
        hud.isAvailableForOperations ??
        p.isAvailableForOperations ??
        raw.isAvailableForOperations ??
        true,
      securityPostureScore: Number(
        hud.securityScore ?? raw.securityScore ?? raw.securityPostureScore ?? 0
      ),
      postureChecklist: (raw.hardeningChecklist ?? raw.postureChecklist ?? []).map(
        (c: any) => ({
          key: c.key,
          labelKey: c.labelKey ?? c.label ?? c.key,
          completed: Boolean(c.completed),
          weight: Number(c.weight ?? 0),
          targetRoute: c.targetRoute ?? "/account/security",
        })
      ),
      activeSessionsCount: Number(
        hud.activeSessionsCount ?? raw.activeSessionsCount ?? 1
      ),
      sudoActive: Boolean(hud.isSudoElevated ?? raw.sudoActive),
      sudoExpiresAtUtc: hud.sudoExpiresAtUtc ?? raw.sudoExpiresAtUtc ?? null,
      supportVerificationPin:
        hud.supportVerificationPin ?? raw.supportVerificationPin ?? "",
    };
  }

  async getDossier(): Promise<SovereignDossierSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.DOSSIER);
    return {
      id: String(raw.adminId ?? raw.id ?? ""),
      username: raw.username ?? "",
      firstName: raw.firstName ?? "",
      lastName: raw.lastName ?? "",
      email: raw.email ?? null,
      isEmailVerified: Boolean(raw.isEmailVerified ?? true),
      phoneNumber: raw.phoneNumber ?? null,
      profileImageUrl: raw.profileImageUrl ?? null,
      staffCode: raw.staffCode ?? null,
      bio: raw.bio ?? null,
      clubAffiliation: raw.clubAffiliation ?? null,
      activeBranchName: raw.activeBranchName ?? null,
      editionName: raw.editionName ?? null,
      isAvailableForOperations: Boolean(raw.isAvailableForOperations ?? true),
      securityScore: Number(raw.securityScore ?? 85),
      clubMemberships: (raw.clubMemberships ?? []).map((m: any) => ({
        tenantId: String(m.tenantId ?? ""),
        clubName: m.tenantName ?? m.clubName ?? "",
        branchName: m.editionName ?? m.branchName ?? "HQ",
        roleTitle: m.roleTitle ?? m.roleName ?? "",
        status: m.status ?? "Active",
        isPrimary: Boolean(m.isPrimary),
      })),
      customFields: (raw.customFields ?? []).map((cf: any) => ({
        key: cf.key ?? "",
        labelEn: cf.labelEn ?? cf.key ?? "",
        labelAr: cf.labelAr ?? null,
        placeholderEn: cf.placeholderEn ?? null,
        placeholderAr: cf.placeholderAr ?? null,
        valueType: cf.valueType ?? cf.fieldType ?? "text",
        isRequired: Boolean(cf.isRequired),
        sensitivity: Number(cf.sensitivity ?? 0),
        options: cf.options ?? null,
        optionsAr: cf.optionsAr ?? null,
        sortOrder: Number(cf.sortOrder ?? 0),
        currentValue: cf.currentValue ?? null,
      })),
      rowVersion: raw.rowVersion ?? undefined,
    };
  }

  async sendEmailVerification(): Promise<{
    message?: string;
    expiresInSeconds?: number;
  }> {
    return this.api.post(PROFILE_ENDPOINTS.ACCOUNT.SEND_EMAIL_VERIFICATION, {});
  }

  async exportAccountData(): Promise<Record<string, unknown>> {
    return this.api.post<Record<string, unknown>>(
      PROFILE_ENDPOINTS.ACCOUNT.EXPORT_DOSSIER,
      {}
    );
  }

  async deactivateAccount(): Promise<{ deactivated?: boolean; message?: string }> {
    return this.api.post<{ deactivated?: boolean; message?: string }>(
      PROFILE_ENDPOINTS.ACCOUNT.DEACTIVATE_ACCOUNT,
      {}
    );
  }

  async getSecurity(): Promise<SovereignSecuritySlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.SECURITY);
    const passkeysCount = Array.isArray(raw.passkeys)
      ? raw.passkeys.length
      : Number(raw.passkeysCount ?? raw.passkeyCount ?? 0);
    return {
      isTwoFactorEnabled: Boolean(raw.isTwoFactorEnabled),
      backupCodesRemaining: Number(raw.backupCodesRemaining ?? 0),
      passkeyCount: passkeysCount,
      hardwareKeyCount: Number(raw.hardwareKeyCount ?? passkeysCount),
      securityPostureScore: Number(
        raw.securityScore ?? raw.securityPostureScore ?? 0
      ),
      postureChecklist: (raw.hardeningChecklist ?? raw.postureChecklist ?? []).map(
        (c: any) => ({
          key: c.key,
          labelKey: c.labelKey ?? c.label ?? c.key,
          completed: Boolean(c.completed),
          weight: Number(c.weight ?? 0),
          targetRoute: c.targetRoute ?? "/account/security",
        })
      ),
      trustedCidrs: raw.allowedCidrs ?? raw.trustedCidrs ?? [],
      sudoActive: Boolean(
        raw.isSudoElevated ?? raw.sudoActiveUntilUtc ?? raw.sudoActive
      ),
      sudoExpiresAtUtc:
        raw.sudoExpiresAtUtc ?? raw.sudoActiveUntilUtc ?? null,
      currentClientIp: raw.clientIpAddress ?? raw.currentClientIp ?? null,
      isCurrentIpAllowed: Boolean(
        raw.isClientIpAllowed ?? raw.isCurrentIpAllowed ?? true
      ),
      rowVersion: raw.rowVersion ?? undefined,
    };
  }

  async updateSecurityPosture(
    data: Parameters<ISovereignAccountRepository["updateSecurityPosture"]>[0]
  ): Promise<void> {
    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.SECURITY, {
      allowedCidrs: data.trustedCidrs,
      elevateSudo: Boolean(data.verifySudoPinOrPasskeyToken),
      stepUpVerificationCode: data.verifySudoPinOrPasskeyToken,
      triggerEmergencyLockdown: Boolean(data.lockdownConfirmation),
      lockdownConfirmationPhrase: data.lockdownConfirmation,
      ...(data.rowVersion !== undefined ? { rowVersion: data.rowVersion } : {}),
    });
  }

  async getSessions(): Promise<SovereignSessionsSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.SESSIONS);
    const sessions = (raw.sessions ?? []).map((s: any) => ({
      sessionId: String(s.sessionId ?? s.id ?? ""),
      deviceLabel: s.deviceLabel ?? "",
      browserOs:
        s.browserOs ??
        (`${s.browserFamily ?? ""} • ${s.osFamily ?? ""}`.replace(/^ • | • $/g, "") ||
          "Workstation"),
      ipAddress: s.ipAddress ?? "",
      geoLocation: s.geoLocationLabel ?? s.cityCountry ?? s.geoLocation ?? "",
      asnIsp: s.ispAsn ?? s.asnIsp ?? s.geoCountryCode ?? "",
      latitude: Number(s.latitude ?? 0),
      longitude: Number(s.longitude ?? 0),
      isCurrent: Boolean(s.isCurrentSession ?? s.isCurrent),
      isImpossibleTravelFlagged: Boolean(
        s.riskLevel === "High" ||
          s.isImpossibleTravelAnomaly ||
          s.isImpossibleTravelFlagged
      ),
      latencyMs: Number(s.latencyMs ?? 12),
      createdAtUtc: s.createdAtUtc ?? "",
      lastActiveAtUtc: s.lastActiveAtUtc ?? s.createdAtUtc ?? "",
    }));
    return {
      sessions,
      impossibleTravelDetected:
        Boolean(raw.impossibleTravelDetected) ||
        sessions.some((s: any) => s.isImpossibleTravelFlagged),
    };
  }

  async pingSession(
    sessionId: string
  ): Promise<{ sessionId: string; rttMilliseconds: number; status: string }> {
    return this.api.post(PROFILE_ENDPOINTS.ACCOUNT.PING_SESSION(sessionId), {});
  }

  async getGovernance(): Promise<SovereignGovernanceSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.GOVERNANCE);
    const rawPermissions = raw.effectivePermissions ?? [];
    const effectivePermissionStrings: string[] = rawPermissions.map((p: any) =>
      typeof p === "string" ? p : String(p.code ?? p.permissionCode ?? "")
    );
    const provenanceFromPermissions = rawPermissions
      .filter((p: any) => typeof p === "object" && p !== null)
      .map((p: any) => ({
        permissionCode: p.code ?? p.permissionCode ?? "",
        domain: p.module ?? p.domainCategory ?? p.domain ?? "Core",
        editionSource: raw.activeTenantName ?? p.sourceEdition ?? "Enterprise",
        branchScope: p.scopeBadge ?? raw.activeBranchName ?? "Organization-Wide",
        grantingRole: p.grantedByRole ?? p.sourceRole ?? "Administrator",
        delegationSource: p.delegationSource ?? null,
        isFieldRestricted: false,
      }));
    const provenanceGraph =
      (raw.provenanceLineage ?? raw.provenanceGraph)?.map((p: any) => ({
        permissionCode: p.permissionCode ?? "",
        domain: p.domainCategory ?? p.domain ?? "",
        editionSource: p.sourceEdition ?? p.editionSource ?? "",
        branchScope: p.sourceBranch ?? p.branchScope ?? "",
        grantingRole: p.sourceRole ?? p.grantingRole ?? "",
        delegationSource: p.delegatedFromAdmin ?? p.delegationSource ?? null,
        isFieldRestricted: Boolean(p.isFieldRestricted),
      })) ?? provenanceFromPermissions;

    return {
      isSuperAdmin: Boolean(raw.isSuperAdmin),
      isProtected: Boolean(raw.isProtected),
      isDelegationFeatureEnabled: Boolean(
        raw.isVacationDelegationEnabled ?? raw.isDelegationFeatureEnabled ?? false
      ),
      activeTenantName: raw.activeTenantName ?? null,
      activeBranchName: raw.activeBranchName ?? null,
      allowedBranches: raw.allowedBranches ?? [],
      assignedRoles: (raw.assignedRoles ?? []).map((r: any) => ({
        id: String(r.id ?? r.roleId ?? ""),
        name: r.name ?? r.roleName ?? r.roleCode ?? "",
        description: r.description ?? null,
        isSystemRole: Boolean(r.isSystem ?? r.isSystemRole),
      })),
      effectivePermissions: effectivePermissionStrings,
      provenanceGraph,
      delegations: (raw.delegations ?? []).map((d: any) => ({
        id: String(d.id),
        principalAdminId: String(d.grantorAdminId ?? d.principalAdminId ?? ""),
        delegateAdminId: String(d.delegateAdminId ?? ""),
        delegateDisplayName: d.delegateName ?? d.delegateDisplayName ?? "",
        delegationType: d.delegationType ?? "ACTING_AS",
        grantedScopes: d.delegatedPermissions ?? d.grantedScopes ?? [],
        justification: d.justification ?? "",
        startsAtUtc: d.startsAtUtc ?? "",
        expiresAtUtc: d.endsAtUtc ?? d.expiresAtUtc ?? "",
        revokedAtUtc: d.revokedAtUtc ?? null,
        status: d.status ?? "Active",
      })),
      successionCustodianAdminId: raw.successionCustodianAdminId
        ? String(raw.successionCustodianAdminId)
        : null,
      successionCustodianName: raw.successionCustodianName ?? null,
      simulatorPersonas: (
        raw.simulatablePersonas ??
        raw.availablePersonas ??
        raw.simulatorPersonas ??
        []
      ).map((p: any) => ({
        personaId: String(p.roleId ?? p.personaCode ?? p.personaId ?? ""),
        roleTitle: p.roleName ?? p.title ?? p.roleTitle ?? "",
        branchScope: p.branchScope ?? raw.activeBranchName ?? "All Branches",
        effectivePermissions:
          p.samplePermissions ?? p.simulatedPermissions ?? p.effectivePermissions ?? [],
      })),
    };
  }

  async createDelegation(
    data: Parameters<ISovereignAccountRepository["createDelegation"]>[0]
  ): Promise<AdminDelegationItem> {
    const res = await this.api.post<any>(PROFILE_ENDPOINTS.ACCOUNT.DELEGATIONS, {
      actionType: data.delegationType === "BreakGlassJitElevation" ? "BreakGlassJitElevation" : "CreateDelegation",
      targetDelegateEmailOrId: data.delegateDisplayName || data.delegateAdminId,
      permissions: data.grantedScopes,
      startsAtUtc: data.startsAtUtc,
      endsAtUtc: data.expiresAtUtc,
      justification: data.justification,
    });
    return {
      id: String(res?.id ?? ""),
      principalAdminId: String(res?.grantorAdminId ?? ""),
      delegateAdminId: String(res?.delegateAdminId ?? data.delegateAdminId),
      delegateDisplayName: res?.delegateName ?? data.delegateDisplayName,
      delegationType: data.delegationType,
      grantedScopes: res?.delegatedPermissions ?? data.grantedScopes,
      justification: res?.justification ?? data.justification,
      startsAtUtc: res?.startsAtUtc ?? data.startsAtUtc,
      expiresAtUtc: res?.endsAtUtc ?? data.expiresAtUtc,
      revokedAtUtc: null,
      status: res?.status ?? "Active",
    };
  }

  async revokeDelegation(id: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.ACCOUNT.REVOKE_DELEGATION(id));
  }

  async getActivity(count: number = 30): Promise<SovereignActivitySlice> {
    const url = buildUrl(PROFILE_ENDPOINTS.ACCOUNT.ACTIVITY, { pageSize: count });
    const raw = await this.api.get<any>(url);
    const entries = (raw.entries ?? []).map((e: any, index: number) => ({
      id: String(e.id),
      eventType: e.eventType ?? "",
      category: e.category ?? "Security",
      outcome: e.outcome ?? "Success",
      severity:
        e.severity ??
        (e.outcome === "Blocked" || e.outcome === "Failure"
          ? "CRITICAL"
          : e.category === "Security"
          ? "HIGH"
          : "INFO"),
      timestampUtc: e.timestampUtc ?? "",
      ipAddress: e.ipAddress ?? "",
      correlationId: e.correlationId ?? "",
      previousHashShort:
        e.previousHash ??
        e.previousHashShort ??
        (index > 0 ? String(raw.entries[index - 1]?.integrityHash ?? "").slice(0, 12) : "GENESIS"),
      entryHashShort:
        e.integrityHash ?? e.chainHash ?? e.entryHashShort ?? "",
      payloadJson: e.detailsJson ?? e.payloadJson ?? "{}",
    }));
    return {
      entries,
      totalEntries: Number(raw.totalEntries ?? entries.length),
      chainIntegrityStatus: raw.chainIntegrityVerified
        ? `SHA-256 Root ${raw.latestMerkleRootHash ?? ""}`
        : entries[0]?.entryHashShort
        ? `SHA-256 Root ${entries[0].entryHashShort}`
        : raw.chainIntegrityStatus ?? "SHA-256 Verified",
    };
  }

  async getPreferences(): Promise<SovereignPreferencesSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.PREFERENCES);
    const hotkeysObj: Record<string, string> = {};
    if (Array.isArray(raw.hotkeys)) {
      for (const hk of raw.hotkeys) {
        if (hk?.actionId && hk?.keyCombo) {
          hotkeysObj[hk.actionId] = hk.keyCombo;
        }
      }
    }
    return {
      themeMode: raw.themeMode ?? "dark",
      clubAccentHue: raw.accentHue ?? raw.clubAccentHue ?? "signal-lime",
      density: raw.interfaceDensity ?? raw.density ?? "comfortable",
      defaultLandingRoute: raw.defaultLandingRoute ?? "/overview",
      sidebarCollapsedByDefault: Boolean(raw.sidebarCollapsedByDefault),
      broadcastPrivacyBlurDefault: Boolean(
        raw.privacyBlurEnabled ?? raw.broadcastPrivacyBlurDefault
      ),
      reducedMotionEnabled: Boolean(raw.reducedMotionEnabled),
      typographyScale: Number(raw.typographyScale ?? 100),
      languageCode: raw.languageCode ?? "en",
      operatingTimezone: raw.operatingTimezone ?? "UTC",
      numeralSystem: raw.numeralSystem ?? "latn",
      calendarSystem: raw.calendarSystem ?? "gregory",
      firstDayOfWeek: raw.firstDayOfWeek ?? "monday",
      toastPosition: raw.toastPosition ?? "top-right",
      customHotkeysJson:
        raw.launchpadHotkeysJson ??
        raw.customHotkeysJson ??
        (Object.keys(hotkeysObj).length > 0 ? JSON.stringify(hotkeysObj) : "{}"),
      savedFilterPresetsJson:
        raw.savedPresetsJson ??
        raw.savedFilterPresetsJson ??
        (Array.isArray(raw.savedPresets) ? JSON.stringify(raw.savedPresets) : "[]"),
      rowVersion: raw.rowVersion ?? undefined,
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
      reducedMotionEnabled: data.reducedMotionEnabled,
      typographyScale: data.typographyScale,
      languageCode: data.languageCode,
      operatingTimezone: data.operatingTimezone,
      numeralSystem: data.numeralSystem,
      calendarSystem: data.calendarSystem,
      firstDayOfWeek: data.firstDayOfWeek,
      toastPosition: data.toastPosition,
      ...(data.rowVersion !== undefined ? { rowVersion: data.rowVersion } : {}),
    });
    return this.getPreferences();
  }

  async getNotifications(): Promise<SovereignNotificationsSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS);
    const categoryRules: NotificationCategoryRuleItem[] = Array.isArray(
      raw.categoryRules
    )
      ? raw.categoryRules.map((r: any) => ({
          category: r.category ?? "General",
          displayName: r.displayName ?? r.category ?? "General",
          description: r.description ?? "",
          inAppEnabled: Boolean(r.inAppEnabled ?? true),
          emailEnabled: Boolean(r.emailEnabled ?? true),
          smsEnabled: Boolean(r.smsEnabled ?? false),
          pushEnabled: Boolean(r.pushEnabled ?? false),
          isCriticalLocked: Boolean(
            r.isCriticalLocked ?? r.category === "Security"
          ),
        }))
      : [];

    let routingMatrixObj: Record<
      string,
      { inApp: boolean; email: boolean; push: boolean; sms: boolean }
    > = {};
    if (categoryRules.length > 0) {
      for (const rule of categoryRules) {
        routingMatrixObj[rule.category] = {
          inApp: rule.inAppEnabled,
          email: rule.emailEnabled,
          push: rule.pushEnabled,
          sms: rule.smsEnabled,
        };
      }
    } else if (typeof raw.notificationMatrixJson === "string") {
      try {
        const parsed = JSON.parse(raw.notificationMatrixJson);
        routingMatrixObj = parsed.channels ?? parsed;
      } catch {
        routingMatrixObj = {};
      }
    }

    return {
      categoryRules,
      routingMatrixJson: JSON.stringify(routingMatrixObj),
      quietHoursEnabled: Boolean(raw.quietHoursEnabled ?? true),
      quietHoursStartUtc: raw.quietHoursStart ?? raw.quietHoursStartUtc ?? "22:00",
      quietHoursEndUtc: raw.quietHoursEnd ?? raw.quietHoursEndUtc ?? "06:00",
      securityAlertsBypassQuietHours: Boolean(
        raw.securityAlertsBypassQuietHours ?? true
      ),
      unreadNotificationsCount: Number(raw.unreadNotificationsCount ?? 0),
      recentNotifications: (raw.recentNotifications ?? []).map((n: any) => ({
        id: String(n.id ?? ""),
        title: n.title ?? "",
        message: n.message ?? "",
        category: n.category ?? "Security",
        createdAt: n.createdAt ?? new Date().toISOString(),
        isRead: Boolean(n.isRead),
      })),
      rowVersion: raw.rowVersion ?? undefined,
    };
  }

  async updateNotifications(
    data: Partial<SovereignNotificationsSlice>
  ): Promise<SovereignNotificationsSlice> {
    const current = await this.getNotifications();
    const resolvedRowVersion = data.rowVersion ?? current.rowVersion;
    const merged = { ...current, ...data };
    let updatedRules = merged.categoryRules;

    if (data.routingMatrixJson) {
      try {
        const channels = JSON.parse(data.routingMatrixJson);
        updatedRules = Object.entries(channels).map(([cat, ch]: [string, any]) => {
          const existing = current.categoryRules.find((r) => r.category === cat);
          const isSec = cat === "Security";
          return {
            category: cat,
            displayName: existing?.displayName ?? cat,
            description: existing?.description ?? "",
            inAppEnabled: isSec ? true : Boolean(ch?.inApp ?? true),
            emailEnabled: isSec ? true : Boolean(ch?.email ?? true),
            smsEnabled: Boolean(ch?.sms ?? false),
            pushEnabled: Boolean(ch?.push ?? false),
            isCriticalLocked: isSec,
          };
        });
      } catch {
        // Keep existing categoryRules if JSON parsing fails
      }
    }

    await this.api.put(PROFILE_ENDPOINTS.ACCOUNT.NOTIFICATIONS, {
      categoryRules: updatedRules,
      quietHoursStart: merged.quietHoursStartUtc,
      quietHoursEnd: merged.quietHoursEndUtc,
      quietHoursEnabled: merged.quietHoursEnabled,
      ...(resolvedRowVersion !== undefined ? { rowVersion: resolvedRowVersion } : {}),
    });
    return this.getNotifications();
  }

  async sendTestNotification(
    category: string = "Security"
  ): Promise<SovereignNotificationsSlice> {
    await this.api.post(PROFILE_ENDPOINTS.ACCOUNT.SEND_TEST_NOTIFICATION, {
      category,
    });
    return this.getNotifications();
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.api.patch(PROFILE_ENDPOINTS.ACCOUNT.MARK_NOTIFICATION_READ(id), {});
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.patch(PROFILE_ENDPOINTS.ACCOUNT.MARK_ALL_NOTIFICATIONS_READ, {});
  }

  async deleteNotification(id: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.ACCOUNT.DELETE_NOTIFICATION(id));
  }

  async getPlan(): Promise<SovereignPlanSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.PLAN);
    return {
      isPlatformSovereign: Boolean(raw.isPlatformSovereign),
      editionCode: raw.editionId ?? raw.editionCode ?? "",
      editionName: raw.editionDisplayName ?? raw.editionName ?? "",
      tierTagline: raw.tierTagline ?? "",
      subscriptionStatus: raw.contractStatus ?? raw.subscriptionStatus ?? "Active",
      billingCadence: raw.billingCadence ?? "Annual Enterprise Agreement",
      contractStartedAtUtc:
        raw.contractStartsAtUtc ?? raw.contractStartedAtUtc ?? "",
      contractExpiresAtUtc:
        raw.contractRenewsAtUtc ?? raw.contractExpiresAtUtc ?? "",
      daysRemaining: Number(
        raw.daysRemainingInTerm ?? raw.daysRemaining ?? 365
      ),
      assignedSeatRole:
        raw.assignedSeatType ?? raw.seatLicenseType ?? raw.assignedSeatRole ?? "",
      supportSlaTier: raw.slaTierLabel ?? raw.supportSlaTier ?? "",
      rotatingSupportPin:
        raw.supportVerificationPin ?? raw.rotatingSupportPin ?? "",
      supportPinSecondsRemaining: 900,
      features: (
        raw.capabilities ??
        raw.featuresMatrix ??
        raw.features ??
        []
      ).map((f: any) => ({
        featureCode: f.capabilityCode ?? f.featureCode ?? "",
        featureName: f.displayName ?? f.featureName ?? "",
        category: f.moduleName ?? f.modulePillar ?? f.category ?? "",
        state:
          f.accessState === "AllowedAndActive" ||
          f.state === "AllowedActive" ||
          f.state === "allowed"
            ? "allowed"
            : f.accessState === "OrgOwnsRequestRole" ||
              f.state === "ClubOwnsRequestRole" ||
              f.state === "club_owned_request_role"
            ? "club_owned_request_role"
            : "locked_upgrade",
        description:
          f.requiredPermissionCode ??
          f.requiredEditionName ??
          f.requiredRolePermission ??
          f.requiredEdition ??
          f.description ??
          "",
      })),
      quotas: (raw.quotas ?? []).map((q: any) => ({
        quotaCode: q.quotaCode ?? "",
        label: q.displayName ?? q.label ?? "",
        used: Number(q.currentUsage ?? q.used ?? 0),
        limit: Number(q.limit ?? q.limitValue ?? 0),
        isUnlimited: Boolean(q.isUnlimited || q.limit === -1),
        unit: q.unitLabel ?? q.unit ?? "",
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
      targetCode,
      notes,
    });
  }

  async getIntegrations(): Promise<SovereignIntegrationsSlice> {
    const raw = await this.api.get<any>(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATIONS);
    return {
      externalIdpLinks: (raw.externalIdpLinks ?? raw.connectedSsoProviders ?? []).map(
        (item: any, idx: number) =>
          typeof item === "string"
            ? {
                id: `sso-${idx}`,
                providerName: item,
                protocolType: "OIDC",
                isConnected: true,
                externalEmail: "",
                linkedAtUtc: "",
              }
            : {
                id: String(item.id ?? item.providerId ?? `sso-${idx}`),
                providerName: item.providerName ?? "",
                protocolType: item.protocolType ?? "OIDC",
                isConnected: Boolean(item.isConnected),
                externalEmail: item.externalEmail ?? "",
                linkedAtUtc: item.linkedAtUtc ?? item.connectedAtUtc ?? "",
              }
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
      availableScopes: raw.availableScopes ?? [
        "crm:read",
        "crm:write",
        "hrms:read",
        "venue:read",
        "academy:read",
        "identity:read",
        "audit:read",
      ],
    };
  }

  async createIntegrationItem(
    data: Parameters<ISovereignAccountRepository["createIntegrationItem"]>[0]
  ) {
    const isSso = data.itemKind === "sso";
    const res = await this.api.post<any>(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATIONS, {
      itemType: isSso ? "SSO" : "PAT",
      name: data.name,
      scopes: data.scopesOrEvents,
      expiresInDays: data.expiresInDays ?? 90,
    });
    return {
      id: String(res?.id ?? ""),
      itemKind: data.itemKind,
      plainTextSecretOnce: res?.oneTimePlaintextSecret ?? null,
      fingerprintOrPrefix: res?.previewOrFingerprint ?? "",
    };
  }

  async deleteIntegrationItem(itemKind: string, id: string): Promise<void> {
    await this.api.delete(PROFILE_ENDPOINTS.ACCOUNT.INTEGRATION_BY_ID(itemKind, id));
  }
}

