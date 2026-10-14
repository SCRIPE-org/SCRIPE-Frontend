"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePartyProfileViewModel, type PartyProfileTab } from "../viewmodels/usePartyProfileViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";

import { useBreadcrumbOverride } from "@core/hooks/use-breadcrumb-override";

// Design System Primitives (@core/ui/*)
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@core/ui/tabs";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@core/ui/tooltip";

// Dialogs
import { EditPartyDialog } from "../components/dialogs/EditPartyDialog";
import { DeletePartyDialog } from "../components/dialogs/DeletePartyDialog";
import { AddContactDialog } from "../components/dialogs/AddContactDialog";
import { EditContactDialog } from "../components/dialogs/EditContactDialog";
import { AddRoleDialog } from "../components/dialogs/AddRoleDialog";
import { AddRelationshipDialog } from "../components/dialogs/AddRelationshipDialog";

// Icons
import {
  ArrowLeft,
  User,
  Calendar,
  Lock,
  Phone,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  Users,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Pencil,
  Copy,
  Check,
  Building,
  Info,
} from "lucide-react";

interface PartyProfileViewProps {
  partyId: string;
}

/**
 * Comprehensive 360-degree party profile workspace view.
 */
export const PartyProfileView = React.memo(function PartyProfileView({
  partyId,
}: PartyProfileViewProps) {
  useModuleLocales(() => import("../../../locales"), "party-kernel.party");
  const router = useRouter();
  const { t, language } = useI18n();
  const intlLocale = resolveIntlLocale(language);

  const [copiedId, setCopiedId] = React.useState(false);
  const [isAddRepresentativeOpen, setIsAddRepresentativeOpen] = React.useState(false);

  const vm = usePartyProfileViewModel(partyId);
  const profile = vm.profile;

  // Unify customer-facing breadcrumbs to Contacts and use authorized display name for terminal segment
  useBreadcrumbOverride(
    profile?.displayName || t("party.profile.title") || "Contact Profile"
  );

  const completeness = React.useMemo(() => {
    if (!profile) return { score: 0, checks: [] };
    if (profile.isPerson) {
      const checks = [
        { label: "Full Name", passed: !!profile.fullName },
        { label: "Telephone", passed: !!profile.primaryPhone },
        { label: "Email", passed: !!profile.primaryEmail },
        { label: "Active Roles", passed: (profile.roles?.length ?? 0) > 0 },
      ];
      const passedCount = checks.filter((c) => c.passed).length;
      return { score: passedCount * 25, checks };
    } else {
      const checks = [
        { label: "Legal Name", passed: !!profile.legalName },
        { label: "Commercial Name", passed: !!profile.displayName },
        { label: "Corporate Contact", passed: !!(profile.primaryPhone || profile.primaryEmail) },
        {
          label: "Authorized Representative (Contract Pending)",
          passed: false,
          pendingContract: true,
        },
      ];
      const passedCount = checks.filter((c) => c.passed).length;
      return { score: passedCount * 25, checks };
    }
  }, [profile]);

  const representativesList = React.useMemo(() => {
    if (!profile?.isOrganization) return [];
    return profile.relationships.filter(
      (rel) =>
        /representative|authorizedsignatory|director|manager|liaison|signatory/i.test(
          rel.relationshipType
        ) || rel.relationshipType.toLowerCase().includes("rep")
    );
  }, [profile]);

  const handleCopyId = () => {
    if (!profile?.id) return;
    navigator.clipboard.writeText(profile.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      return new Intl.DateTimeFormat(intlLocale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const getContactIcon = (type?: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("phone") || t.includes("mobile")) return <Phone className="h-4 w-4" />;
    if (t.includes("email")) return <Mail className="h-4 w-4" />;
    if (t.includes("address")) return <MapPin className="h-4 w-4" />;
    if (t.includes("web")) return <Globe className="h-4 w-4" />;
    return <Phone className="h-4 w-4" />;
  };

  if (vm.isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (vm.isError || !profile) {
    return (
      <div className="p-8">
        <EmptyState
          icon={AlertTriangle}
          title="Party Profile Not Found"
          description={vm.error?.message || "The requested party profile could not be loaded."}
          action={
            <Button
              variant="outline"
              onClick={() => router.push("/party-kernel/parties")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("party.profile.backToDirectory")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* ── Back Navigation ────────────────────────────────────────── */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/party-kernel/parties")}
          className="gap-1.5 text-xs text-nx-ink-2 hover:text-nx-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("party.profile.backToDirectory")}</span>
        </Button>
      </div>

      {/* ── Identity Hero Card ──────────────────────────────────────── */}
      <Card className="border-nx-border overflow-hidden bg-nx-surface shadow-xs">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-nx-accent/10 text-xl font-bold text-nx-accent">
                {profile.initials}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-nx-ink tracking-tight truncate">
                    {profile.displayName}
                  </h1>
                  <Badge variant={profile.isPerson ? "info" : "success"}>
                    {profile.isPerson
                      ? t("party.types.Person")
                      : t("party.types.Organization")}
                  </Badge>
                </div>

                {profile.isOrganization && profile.legalName && (
                  <p className="text-sm text-nx-ink-2 font-medium">
                    {profile.legalName}
                  </p>
                )}

                {/* Canonical Reference & Type Immutability Banner */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-nx-ink-3">
                  <div className="flex items-center gap-1.5 bg-nx-surface-2/80 px-2 py-0.5 rounded-md border border-nx-border/70 text-[11px] font-mono">
                    <span className="opacity-60">Ref:</span>
                    <span className="truncate max-w-[140px]" title={profile.id}>
                      {profile.id.length > 18 ? `${profile.id.slice(0, 12)}…` : profile.id}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyId}
                      className="h-4 w-4 text-nx-ink-3 hover:text-nx-ink transition-colors ml-0.5 p-0"
                      title={t("party.profile.copyCanonicalId") || "Copy Canonical ID"}
                      aria-label={t("party.profile.copyCanonicalId") || "Copy Canonical ID"}
                    >
                      {copiedId ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {t("party.profile.createdOn")}: {formatDate(profile.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Lock className="h-3.5 w-3.5" />
                    <span>{t("party.profile.immutableType")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Completeness & Quick Actions */}
            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              {/* Truthful Data Summary */}
              <div className="flex flex-col gap-1.5 w-full sm:w-[220px] p-2.5 rounded-xl bg-nx-surface-2/60 border border-nx-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-nx-ink-2 font-medium">
                    {t("party.profile.completenessScore")}
                  </span>
                  <span className="text-xs font-mono text-nx-ink-3">
                    {completeness.checks.filter((c) => c.passed).length}/{completeness.checks.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-nx-ink-3 flex-wrap pt-0.5">
                  {completeness.checks.map((chk) => (
                    <span
                      key={chk.label}
                      className={
                        chk.passed
                          ? "text-emerald-500 font-medium inline-flex items-center gap-0.5"
                          : "text-nx-ink-3 inline-flex items-center gap-0.5"
                      }
                    >
                      {chk.passed ? "✓" : "○"} {chk.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {vm.permissions.canEditParty && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => vm.setIsEditNameOpen(true)}
                    className="gap-1.5 text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>{t("party.profile.editName")}</span>
                  </Button>
                )}

                {vm.permissions.canDeleteParty && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => vm.setIsDeleteConfirmOpen(true)}
                    className="gap-1.5 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t("party.profile.deleteParty")}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Duplicate Alert Banner (if engine flagged match) ────────── */}
      {profile.mergeCandidates.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">
                {t("party.profile.duplicateAlert")}
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                {t("party.profile.duplicateAlertDesc")}{" "}
                {profile.mergeCandidates.map((m) => m.reason).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Workspace Tabs ─────────────────────────────────── */}
      <Tabs
        value={vm.activeTab}
        onValueChange={(val) => vm.setActiveTab(val as PartyProfileTab)}
        className="space-y-6"
      >
        <TabsList className="bg-nx-surface border border-nx-border p-1 rounded-xl">
          <TabsTrigger value="overview" className="gap-2">
            <User className="h-4 w-4" />
            <span>{t("party.profile.tabOverview")}</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2">
            <Phone className="h-4 w-4" />
            <span>{t("party.profile.tabContacts")}</span>
            <span className="text-xs rounded-full bg-nx-surface-2 px-1.5 py-0.5">
              {profile.contactPoints.length}
            </span>
          </TabsTrigger>
          {profile.isOrganization && (
            <TabsTrigger value="representatives" className="gap-2">
              <Building className="h-4 w-4" />
              <span>{t("party.profile.tabRepresentatives")}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-400">
                Pending Contract
              </Badge>
            </TabsTrigger>
          )}
          <TabsTrigger value="relationships" className="gap-2">
            <Users className="h-4 w-4" />
            <span>{t("party.profile.tabRelationships")}</span>
            <span className="text-xs rounded-full bg-nx-surface-2 px-1.5 py-0.5">
              {profile.relationships.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span>{t("party.profile.tabRoles")}</span>
            <span className="text-xs rounded-full bg-nx-surface-2 px-1.5 py-0.5">
              {profile.roles.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>{t("party.profile.tabAudit")}</span>
            {profile.mergeCandidates.length > 0 && (
              <span className="text-xs rounded-full bg-amber-500/20 text-amber-700 px-1.5 py-0.5 font-bold">
                {profile.mergeCandidates.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Overview ────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Specific Type Details */}
            <Card className="border-nx-border bg-nx-surface shadow-xs">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {profile.isPerson ? (
                    <User className="h-4 w-4 text-nx-accent" />
                  ) : (
                    <Building className="h-4 w-4 text-emerald-600" />
                  )}
                  <span>
                    {profile.isPerson
                      ? t("party.profile.personDetails")
                      : t("party.profile.orgDetails")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {profile.isPerson ? (
                  <>
                    <div className="flex justify-between py-2 border-b border-nx-border">
                      <span className="text-nx-ink-3">Full Name</span>
                      <span className="font-medium text-nx-ink">
                        {profile.fullName}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-nx-border">
                      <span className="text-nx-ink-3">
                        {t("party.profile.isMinor")}
                      </span>
                      <Badge
                        variant={
                          profile.person?.isMinor ? "secondary" : "outline"
                        }
                      >
                        {profile.person?.isMinor
                          ? t("party.profile.minorYes")
                          : t("party.profile.minorNo")}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-nx-ink-3">
                        {t("party.profile.dob")}
                      </span>
                      <span className="text-xs text-nx-ink-3 italic">
                        {t("party.profile.dobRestricted")}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-2 border-b border-nx-border">
                      <span className="text-nx-ink-3">
                        {t("party.profile.legalName")}
                      </span>
                      <span className="font-medium text-nx-ink">
                        {profile.legalName || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-nx-border">
                      <span className="text-nx-ink-3">
                        {t("party.profile.commercialName")}
                      </span>
                      <span className="font-medium text-nx-ink">
                        {profile.displayName}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-nx-border">
                      <span className="text-nx-ink-3">
                        {t("party.profile.taxId")}
                      </span>
                      <span className="font-mono text-xs text-nx-ink">
                        {profile.taxId || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-nx-ink-3">
                        Authorized Representatives
                      </span>
                      <span className="font-semibold text-xs flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-400">
                          Contract Pending (V1)
                        </Badge>
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Primary Contact Overview */}
            <Card className="border-nx-border bg-nx-surface shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-nx-accent" />
                  <span>{t("party.directory.quickContact")}</span>
                </CardTitle>
                {vm.permissions.canManageContacts && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => vm.setIsAddContactOpen(true)}
                    className="h-8 gap-1 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t("party.profile.addContact")}</span>
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-nx-border">
                  <span className="text-nx-ink-3">Primary Telephone</span>
                  <span className="font-medium text-nx-ink">
                    {profile.primaryPhone || t("party.directory.noContactRegistered")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-nx-border">
                  <span className="text-nx-ink-3">Primary Email</span>
                  <span className="font-medium text-nx-ink">
                    {profile.primaryEmail || t("party.directory.noContactRegistered")}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-nx-ink-3">Total Methods</span>
                  <span className="font-semibold text-nx-ink">
                    {profile.contactPoints.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Addresses Section for Person */}
            {profile.isPerson && (
              <Card className="border-nx-border bg-nx-surface shadow-xs md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-nx-accent" />
                    <span>{t("party.profile.addressesTitle")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="rounded-lg bg-nx-surface-2/60 border border-nx-border p-3.5 flex items-start gap-3">
                    <Info className="h-4 w-4 text-nx-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-nx-ink-2 leading-relaxed">
                      {t("party.profile.addressesPendingDesc")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ── Tab 2: Contact Methods ─────────────────────────────────── */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-nx-ink">
              {t("party.profile.tabContacts")}
            </h3>
            {vm.permissions.canManageContacts && (
              <Button
                size="sm"
                onClick={() => vm.setIsAddContactOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("party.profile.addContact")}</span>
              </Button>
            )}
          </div>

          {profile.contactPoints.length === 0 ? (
            <EmptyState
              icon={Phone}
              title={t("party.profile.noContacts")}
              description="Register telephone, email, WhatsApp, or address details for this party."
              action={
                vm.permissions.canManageContacts ? (
                  <Button
                    variant="outline"
                    onClick={() => vm.setIsAddContactOpen(true)}
                  >
                    {t("party.profile.addContact")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.contactPoints.map((contact) => (
                <Card
                  key={contact.id}
                  className="border-nx-border bg-nx-surface p-4 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nx-accent/10 text-nx-accent">
                      {getContactIcon(contact.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-nx-ink-3">
                          {contact.type}
                        </span>
                        {contact.isPrimary && (
                          <Badge variant="outline" className="text-[10px] py-0">
                            {t("party.profile.primaryContact")}
                          </Badge>
                        )}
                      </div>
                      <div className="font-medium text-sm text-nx-ink truncate">
                        {contact.value}
                      </div>
                    </div>
                  </div>

                  {vm.permissions.canManageContacts && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-nx-ink-3 hover:text-nx-ink"
                        onClick={() => {
                          vm.setEditingContact(contact);
                          vm.setIsEditContactOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-nx-ink-3 hover:text-destructive"
                        onClick={() => vm.handleRemoveContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Tab: Representatives & Contacts (Organization Only) ──── */}
        {profile.isOrganization && (
          <TabsContent value="representatives" className="space-y-4">
            {/* Informative Contract Pending Banner */}
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/60 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      {t("party.profile.representativesContractPending") ||
                        "Pending Backend Contract (V1 Deferred)"}
                    </h4>
                    <Badge variant="outline" className="text-[10px] border-amber-600/50 dark:border-amber-400/60 text-amber-700 dark:text-amber-300 bg-amber-500/10">
                      RFC-PARTY-AFFILIATIONS
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed font-medium">
                    {t("party.profile.representativesContractPendingBanner") ||
                      "Corporate representative and signatory affiliation contracts are deferred in PartyKernel V1 (backend supports Guardian and EmergencyContact only). Corporate signatory links will activate upon contract finalization."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-nx-ink">
                  {t("party.profile.representativesTitle")}
                </h3>
                <p className="text-xs text-nx-ink-3">
                  {t("party.profile.representativesDesc")}
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="inline-block">
                      <Button
                        size="sm"
                        disabled
                        className="gap-1.5 text-xs self-start sm:self-auto opacity-50 cursor-not-allowed pointer-events-none"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{t("party.profile.addRepresentative")}</span>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {t("party.profile.addRepresentativeDisabledTooltip") ||
                        "Representative affiliation contract is pending in V1 backend"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {representativesList.length === 0 ? (
              <EmptyState
                icon={Building}
                title={t("party.profile.noRepresentatives") || "No Representatives Linked"}
                description={
                  t("party.profile.noRepresentativesDesc") ||
                  "No corporate representatives linked. Corporate signatory affiliation is deferred in PartyKernel V1."
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {representativesList.map((rep) => (
                  <Card
                    key={rep.id}
                    className="border-nx-border bg-nx-surface p-4 flex flex-col justify-between shadow-xs hover:border-nx-accent/30 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="success">{rep.relationshipType}</Badge>
                        {vm.permissions.canManageRelationships && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-nx-ink-3 hover:text-destructive"
                            onClick={() => vm.handleRemoveRelationship(rep.id)}
                            title="Remove Representative"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-nx-ink-3">Canonical ID:</div>
                        <div
                          className="font-mono text-xs text-nx-ink truncate"
                          title={rep.targetPartyId}
                        >
                          {rep.targetPartyId}
                        </div>
                      </div>
                      <div className="text-[11px] text-nx-ink-3">
                        {t("party.profile.createdOn")}: {formatDate(rep.createdAt)}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-nx-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/party-kernel/parties/${rep.targetPartyId}`)
                        }
                        className="w-full text-xs text-nx-accent hover:text-nx-accent justify-between h-8"
                      >
                        <span>View Person Profile</span>
                        <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* ── Tab: Relationships ───────────────────────────────────── */}
        <TabsContent value="relationships" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-nx-ink">
              {t("party.profile.tabRelationships")}
            </h3>
            {vm.permissions.canManageRelationships && (
              <Button
                size="sm"
                onClick={() => vm.setIsAddRelationshipOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("party.profile.addRelationship")}</span>
              </Button>
            )}
          </div>

          {profile.relationships.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("party.profile.noRelationships")}
              description="Establish connections such as parent/guardian, club member, employee, or partner."
              action={
                vm.permissions.canManageRelationships ? (
                  <Button
                    variant="outline"
                    onClick={() => vm.setIsAddRelationshipOpen(true)}
                  >
                    {t("party.profile.addRelationship")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.relationships.map((rel) => (
                <Card
                  key={rel.id}
                  className="border-nx-border bg-nx-surface p-4 flex items-center justify-between shadow-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <Badge variant="secondary">{rel.relationshipType}</Badge>
                    <div className="text-xs font-mono text-nx-ink-3 truncate">
                      Target: {rel.targetPartyId}
                    </div>
                  </div>

                  {vm.permissions.canManageRelationships && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-nx-ink-3 hover:text-destructive"
                      onClick={() => vm.handleRemoveRelationship(rel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 4: Roles & Associations ────────────────────────────── */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-nx-ink">
              {t("party.profile.tabRoles")}
            </h3>
            {vm.permissions.canManageRoles && (
              <Button
                size="sm"
                onClick={() => vm.setIsAddRoleOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("party.profile.addRole")}</span>
              </Button>
            )}
          </div>

          {profile.roles.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t("party.profile.noRoles")}
              description="Assign operational roles such as Customer, Coach, Player, Vendor, or Sponsor."
              action={
                vm.permissions.canManageRoles ? (
                  <Button
                    variant="outline"
                    onClick={() => vm.setIsAddRoleOpen(true)}
                  >
                    {t("party.profile.addRole")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.roles.map((role) => (
                <Card
                  key={role.id}
                  className="border-nx-border bg-nx-surface p-4 flex items-center justify-between shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-nx-ink">
                      {role.roleType}
                    </div>
                    <div className="text-xs text-nx-ink-3">
                      Assigned: {formatDate(role.createdAt)}
                    </div>
                  </div>

                  {vm.permissions.canManageRoles && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-nx-ink-3 hover:text-destructive"
                      onClick={() => vm.handleRemoveRole(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 5: Entity Audit Metadata & Duplicates ───────────────── */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-nx-ink">
              {t("party.profile.tabAuditTitle")}
            </h3>
            <p className="text-xs text-nx-ink-3">
              {t("party.profile.auditDisclaimer")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entity Audit Metadata Card */}
            <Card className="border-nx-border bg-nx-surface shadow-xs">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-nx-accent" />
                  <span>{t("party.profile.tabAudit")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-nx-border">
                  <span className="text-nx-ink-3">Canonical Party ID</span>
                  <span className="font-mono text-xs text-nx-ink truncate max-w-[200px]" title={profile.id}>
                    {profile.id}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-nx-border">
                  <span className="text-nx-ink-3">Party Type</span>
                  <Badge variant={profile.isPerson ? "default" : "secondary"}>
                    {profile.type}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-nx-border">
                  <span className="text-nx-ink-3">Created At</span>
                  <span className="font-medium text-nx-ink">
                    {formatDate(profile.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-nx-border">
                  <span className="text-nx-ink-3">Last Modified</span>
                  <span className="font-medium text-nx-ink">
                    {formatDate(profile.modifiedAt)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-nx-ink-3">{t("party.profile.recordStatus")}</span>
                  <Badge variant="outline">
                    {t("party.profile.statusActive")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Deduplication & Merge Candidates */}
            <Card className="border-nx-border bg-nx-surface shadow-xs">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Identity Merge Candidates</span>
                  </span>
                  <span className="text-xs rounded-full bg-nx-surface-2 px-2 py-0.5 text-nx-ink-3">
                    {profile.mergeCandidates.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.mergeCandidates.length === 0 ? (
                  <EmptyState
                    icon={ShieldCheck}
                    title={t("party.profile.noDuplicates")}
                    description="Zero merge candidates or duplicate identity conflicts detected for this party."
                  />
                ) : (
                  <div className="space-y-3">
                    {profile.mergeCandidates.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="warning">{m.status}</Badge>
                            <span className="font-semibold text-nx-ink">
                              {t("party.profile.matchScore")}:{" "}
                              {Math.round((m.matchScore ?? 0) * 100)}%
                            </span>
                          </div>
                          <div className="text-nx-ink-2">
                            Reason: <span className="font-medium">{m.reason}</span>
                          </div>
                          <div className="font-mono text-nx-ink-3 truncate max-w-[220px]">
                            Duplicate: {m.duplicatePartyId}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1 self-start sm:self-auto"
                          onClick={() => router.push(`/party-kernel/parties/${m.duplicatePartyId}`)}
                        >
                          <span>{t("party.profile.reviewMerge")}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ────────────────────────────────────────────────── */}
      <EditPartyDialog
        party={profile.party}
        initialFullName={profile.fullName}
        open={vm.isEditNameOpen}
        onOpenChange={vm.setIsEditNameOpen}
        onSubmit={async (_id, displayName, options) => {
          await vm.handleUpdateName({
            displayName,
            fullName: options?.fullName,
          });
        }}
      />

      <DeletePartyDialog
        party={profile.party}
        open={vm.isDeleteConfirmOpen}
        onOpenChange={vm.setIsDeleteConfirmOpen}
        onConfirm={vm.handleDeleteParty}
        onSuccess={() => router.push("/party-kernel/parties")}
      />

      <AddContactDialog
        open={vm.isAddContactOpen}
        onOpenChange={vm.setIsAddContactOpen}
        onSubmit={vm.handleAddContact}
      />

      <EditContactDialog
        contact={vm.editingContact}
        open={vm.isEditContactOpen}
        onOpenChange={vm.setIsEditContactOpen}
        onSubmit={vm.handleUpdateContact}
      />

      <AddRoleDialog
        open={vm.isAddRoleOpen}
        onOpenChange={vm.setIsAddRoleOpen}
        onSubmit={vm.handleAddRole}
      />

      <AddRelationshipDialog
        open={vm.isAddRelationshipOpen}
        onOpenChange={vm.setIsAddRelationshipOpen}
        onSubmit={vm.handleAddRelationship}
        currentPartyId={partyId}
      />

      <AddRelationshipDialog
        open={isAddRepresentativeOpen}
        onOpenChange={setIsAddRepresentativeOpen}
        onSubmit={vm.handleAddRelationship}
        currentPartyId={partyId}
        defaultRelationshipType="Representative"
        title={t("party.dialog.addRepresentativeTitle")}
      />
    </div>
  );
});
