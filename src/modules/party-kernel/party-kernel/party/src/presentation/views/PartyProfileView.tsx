"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  usePartyProfileViewModel,
  type PartyProfileTab,
} from "../viewmodels/usePartyProfileViewModel";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";

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
  ArrowRight,
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
  useBreadcrumbOverride(profile?.displayName || t("party.profile.title") || "Contact Profile");

  const representativesList = React.useMemo(() => {
    if (!profile?.isOrganization) return [];
    return profile.relationships.filter(
      (rel) =>
        /representative|authorizedsignatory|director|manager|liaison|signatory/i.test(
          rel.relationshipType
        ) || rel.relationshipType.toLowerCase().includes("rep")
    );
  }, [profile]);

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
          label: "Authorized Representative",
          passed: representativesList.length > 0,
        },
      ];
      const passedCount = checks.filter((c) => c.passed).length;
      return { score: passedCount * 25, checks };
    }
  }, [profile, representativesList]);

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
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("party.profile.backToDirectory")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ── Back Navigation ────────────────────────────────────────── */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/party-kernel/parties")}
          className="gap-1.5 text-xs text-nx-ink-2 hover:text-nx-ink"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span>{t("party.profile.backToDirectory")}</span>
        </Button>
      </div>

      {/* ── Identity Hero Card ──────────────────────────────────────── */}
      <Card className="border-nx-line overflow-hidden bg-nx-surface">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <div className="bg-nx-accent/10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-nx-accent">
                {profile.initials}
              </div>

              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-nx-ink">
                    {profile.displayName}
                  </h1>
                  <Badge variant={profile.isPerson ? "info" : "success"}>
                    {profile.isPerson ? t("party.types.Person") : t("party.types.Organization")}
                  </Badge>
                </div>

                {profile.isOrganization && profile.legalName && (
                  <p className="text-sm font-medium text-nx-ink-2">{profile.legalName}</p>
                )}

                {/* Canonical Reference & Type Immutability Banner */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-nx-ink-3">
                  <div className="bg-nx-raised border-nx-line flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px]">
                    <span className="opacity-60">Ref:</span>
                    <span className="max-w-[140px] truncate" title={profile.id}>
                      {profile.id.length > 18 ? `${profile.id.slice(0, 12)}…` : profile.id}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyId}
                      className="ml-0.5 h-4 w-4 p-0 text-nx-ink-3 transition-colors hover:text-nx-ink"
                      title={t("party.profile.copyCanonicalId") || "Copy Canonical ID"}
                      aria-label={t("party.profile.copyCanonicalId") || "Copy Canonical ID"}
                    >
                      {copiedId ? (
                        <Check className="h-3 w-3 text-success" />
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

                  <div className="flex items-center gap-1 text-nx-ink-2">
                    <Lock className="h-3.5 w-3.5 text-nx-ink-3" />
                    <span>{t("party.profile.immutableType")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Completeness & Quick Actions */}
            <div className="flex shrink-0 flex-col gap-3 sm:items-end">
              {/* Truthful Data Summary */}
              <div className="bg-nx-raised/40 border-nx-line flex w-full flex-col gap-1.5 rounded-xl border p-2.5 sm:w-[220px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-nx-ink-2">
                    {t("party.profile.completenessScore")}
                  </span>
                  <span className="font-mono text-xs text-nx-ink-3">
                    {completeness.checks.filter((c) => c.passed).length}/
                    {completeness.checks.length}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] text-nx-ink-3">
                  {completeness.checks.map((chk) => (
                    <span
                      key={chk.label}
                      className={
                        chk.passed
                          ? "inline-flex items-center gap-0.5 font-medium text-success"
                          : "inline-flex items-center gap-0.5 text-nx-ink-3"
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
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{t("party.profile.duplicateAlert")}</h4>
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
        <TabsList className="border-nx-line rounded-xl border bg-nx-surface p-1">
          <TabsTrigger value="overview" className="gap-2">
            <User className="h-4 w-4" />
            <span>{t("party.profile.tabOverview")}</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2">
            <Phone className="h-4 w-4" />
            <span>{t("party.profile.tabContacts")}</span>
            <span className="bg-nx-raised rounded-full px-1.5 py-0.5 text-xs text-nx-ink-3">
              {profile.contactPoints.length}
            </span>
          </TabsTrigger>
          {profile.isOrganization && (
            <TabsTrigger value="representatives" className="gap-2">
              <Building className="h-4 w-4" />
              <span>{t("party.profile.tabRepresentatives")}</span>
              <span className="bg-nx-raised rounded-full px-1.5 py-0.5 text-xs text-nx-ink-3">
                {representativesList.length}
              </span>
            </TabsTrigger>
          )}
          <TabsTrigger value="relationships" className="gap-2">
            <Users className="h-4 w-4" />
            <span>{t("party.profile.tabRelationships")}</span>
            <span className="bg-nx-raised rounded-full px-1.5 py-0.5 text-xs text-nx-ink-3">
              {profile.relationships.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span>{t("party.profile.tabRoles")}</span>
            <span className="bg-nx-raised rounded-full px-1.5 py-0.5 text-xs text-nx-ink-3">
              {profile.roles.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>{t("party.profile.tabAudit")}</span>
            {profile.mergeCandidates.length > 0 && (
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold text-amber-700">
                {profile.mergeCandidates.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Overview ────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Specific Type Details */}
            <Card className="border-nx-line bg-nx-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
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
                    <div className="border-nx-line flex justify-between border-b py-2">
                      <span className="text-nx-ink-3">{t("party.profile.fullName")}</span>
                      <span className="font-medium text-nx-ink">{profile.fullName}</span>
                    </div>
                    {profile.person?.givenName && (
                      <div className="border-nx-line flex justify-between border-b py-2">
                        <span className="text-nx-ink-3">{t("party.profile.givenName")}</span>
                        <span className="font-medium text-nx-ink">{profile.person.givenName}</span>
                      </div>
                    )}
                    {profile.person?.middleNames && (
                      <div className="border-nx-line flex justify-between border-b py-2">
                        <span className="text-nx-ink-3">{t("party.profile.middleNames")}</span>
                        <span className="font-medium text-nx-ink">
                          {profile.person.middleNames}
                        </span>
                      </div>
                    )}
                    {profile.person?.familyName && (
                      <div className="border-nx-line flex justify-between border-b py-2">
                        <span className="text-nx-ink-3">{t("party.profile.familyName")}</span>
                        <span className="font-medium text-nx-ink">{profile.person.familyName}</span>
                      </div>
                    )}
                    <div className="border-nx-line flex justify-between border-b py-2">
                      <span className="text-nx-ink-3">{t("party.profile.isMinor")}</span>
                      <Badge variant={profile.person?.isMinor ? "secondary" : "outline"}>
                        {profile.person?.isMinor
                          ? t("party.profile.minorYes")
                          : t("party.profile.minorNo")}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-nx-ink-3">{t("party.profile.dob")}</span>
                      {profile.person?.dateOfBirth ? (
                        <span className="font-medium text-nx-ink">
                          {formatDate(profile.person.dateOfBirth)}
                        </span>
                      ) : profile.person !== null ? (
                        <span className="text-nx-ink-3">—</span>
                      ) : (
                        <span className="text-xs italic text-nx-ink-3">
                          {t("party.profile.dobRestricted")}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-nx-line flex justify-between border-b py-2">
                      <span className="text-nx-ink-3">{t("party.profile.legalName")}</span>
                      <span className="font-medium text-nx-ink">{profile.legalName || "—"}</span>
                    </div>
                    <div className="border-nx-line flex justify-between border-b py-2">
                      <span className="text-nx-ink-3">{t("party.profile.commercialName")}</span>
                      <span className="font-medium text-nx-ink">{profile.displayName}</span>
                    </div>
                    <div className="border-nx-line flex justify-between border-b py-2">
                      <span className="text-nx-ink-3">{t("party.profile.taxId")}</span>
                      <span className="font-mono text-xs text-nx-ink">{profile.taxId || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-nx-ink-3">Authorized Representatives</span>
                      <span className="flex items-center gap-1 text-xs font-semibold">
                        {representativesList.length > 0 ? (
                          <Badge
                            variant="outline"
                            className="h-4 border-success/30 px-1.5 py-0 text-[10px] text-success"
                          >
                            {representativesList.length} Registered
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="h-4 border-nx-line px-1.5 py-0 text-[10px] text-nx-ink-3"
                          >
                            None Assigned
                          </Badge>
                        )}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Primary Contact Overview */}
            <Card className="border-nx-line bg-nx-surface">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
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
                <div className="border-nx-line flex justify-between border-b py-2">
                  <span className="text-nx-ink-3">{t("party.profile.primaryTelephone")}</span>
                  <span className="font-medium text-nx-ink">
                    {profile.primaryPhone || t("party.directory.noContactRegistered")}
                  </span>
                </div>
                <div className="border-nx-line flex justify-between border-b py-2">
                  <span className="text-nx-ink-3">{t("party.profile.primaryEmail")}</span>
                  <span className="font-medium text-nx-ink">
                    {profile.primaryEmail || t("party.directory.noContactRegistered")}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-nx-ink-3">{t("party.profile.totalMethods")}</span>
                  <span className="font-semibold text-nx-ink">{profile.contactPoints.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Addresses Section for Person */}
            {profile.isPerson && (
              <Card className="border-nx-line bg-nx-surface md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-nx-accent" />
                    <span>{t("party.profile.addressesTitle")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="bg-nx-raised/40 border-nx-line flex items-start gap-3 rounded-lg border p-3.5">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-nx-accent" />
                    <p className="text-xs leading-relaxed text-nx-ink-2">
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
                  <Button variant="outline" onClick={() => vm.setIsAddContactOpen(true)}>
                    {t("party.profile.addContact")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.contactPoints.map((contact) => (
                <Card
                  key={contact.id}
                  className="border-nx-line flex items-center justify-between bg-nx-surface p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-nx-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-nx-accent">
                      {getContactIcon(contact.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-nx-ink-3">{contact.type}</span>
                        {contact.isPrimary && (
                          <Badge variant="outline" className="py-0 text-[10px]">
                            {t("party.profile.primaryContact")}
                          </Badge>
                        )}
                      </div>
                      <div className="truncate text-sm font-medium text-nx-ink">
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
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-nx-ink">
                      {t("party.profile.representativesContractPending") ||
                        "Corporate Affiliations"}
                    </h4>
                    <Badge
                      variant="warning"
                      className="text-[10px]"
                    >
                      {t("party.profile.planned") || "Upcoming"}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-nx-ink-2">
                    {t("party.profile.representativesContractPendingBanner") ||
                      "Corporate representative and signatory affiliation features are coming soon."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-semibold text-nx-ink">
                  {t("party.profile.representativesTitle")}
                </h3>
                <p className="text-xs text-nx-ink-3">{t("party.profile.representativesDesc")}</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="inline-block">
                      <Button
                        size="sm"
                        disabled
                        className="pointer-events-none cursor-not-allowed gap-1.5 self-start text-xs opacity-50 sm:self-auto"
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {representativesList.map((rep) => (
                  <Card
                    key={rep.id}
                    className="border-nx-line hover:border-nx-line-hi flex flex-col justify-between bg-nx-surface p-4 transition-colors"
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
                          className="truncate font-mono text-xs text-nx-ink"
                          title={rep.targetPartyId}
                        >
                          {rep.targetPartyId}
                        </div>
                      </div>
                      <div className="text-[11px] text-nx-ink-3">
                        {t("party.profile.createdOn")}: {formatDate(rep.createdAt)}
                      </div>
                    </div>

                    <div className="border-nx-line mt-3 border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/party-kernel/parties/${rep.targetPartyId}`)}
                        className="h-8 w-full justify-between text-xs text-nx-accent hover:text-nx-accent"
                      >
                        <span>View Person Profile</span>
                        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
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
                  <Button variant="outline" onClick={() => vm.setIsAddRelationshipOpen(true)}>
                    {t("party.profile.addRelationship")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile.relationships.map((rel) => {
                const isOutbound = rel.sourcePartyId === partyId;
                const otherPartyId = isOutbound ? rel.targetPartyId : rel.sourcePartyId;
                const relatedInfo = otherPartyId ? vm.relatedPartiesMap[otherPartyId] : undefined;
                const canNavigate = Boolean(otherPartyId && otherPartyId !== partyId);

                return (
                  <Card
                    key={rel.id}
                    className="border-nx-line flex items-center justify-between gap-4 bg-nx-surface p-4"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{rel.relationshipType}</Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          data-testid="relationship-direction-badge"
                        >
                          {isOutbound
                            ? t("party.profile.outboundRelation")
                            : t("party.profile.inboundRelation")}
                        </Badge>
                      </div>
                      <div className="truncate text-sm font-medium text-nx-ink">
                        {relatedInfo?.displayName || otherPartyId}
                      </div>
                      <div className="truncate font-mono text-xs text-nx-ink-3">
                        {t("party.profile.relatedContact")}: {otherPartyId}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {canNavigate && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          data-testid="relationship-navigate-btn"
                          onClick={() => router.push(`/party-kernel/parties/${otherPartyId}`)}
                        >
                          <span>{t("party.profile.openRelatedProfile")}</span>
                          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                        </Button>
                      )}
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
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 4: Roles & Associations ────────────────────────────── */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-nx-ink">{t("party.profile.tabRoles")}</h3>
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
                  <Button variant="outline" onClick={() => vm.setIsAddRoleOpen(true)}>
                    {t("party.profile.addRole")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.roles.map((role) => (
                <Card
                  key={role.id}
                  className="border-nx-line flex items-center justify-between bg-nx-surface p-4"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-nx-ink">{role.roleType}</div>
                    <div className="text-xs text-nx-ink-3">
                      {t("party.profile.assignedOn")}: {formatDate(role.createdAt)}
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
            <p className="text-xs text-nx-ink-3">{t("party.profile.auditDisclaimer")}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Entity Audit Metadata Card */}
            <Card className="border-nx-line bg-nx-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-nx-accent" />
                  <span>{t("party.profile.tabAudit")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="border-nx-line flex justify-between border-b py-2">
                  <span className="text-nx-ink-3">{t("party.profile.canonicalPartyId")}</span>
                  <span
                    className="max-w-[200px] truncate font-mono text-xs text-nx-ink"
                    title={profile.id}
                  >
                    {profile.id}
                  </span>
                </div>
                <div className="border-nx-line flex justify-between border-b py-2">
                  <span className="text-nx-ink-3">{t("party.profile.partyType")}</span>
                  <Badge variant={profile.isPerson ? "default" : "secondary"}>{profile.type}</Badge>
                </div>
                <div className="border-nx-line flex justify-between border-b py-2">
                  <span className="text-nx-ink-3">{t("party.profile.createdAtLabel")}</span>
                  <span className="font-medium text-nx-ink">{formatDate(profile.createdAt)}</span>
                </div>
                <div className="border-nx-line flex justify-between border-b py-2">
                  <span className="text-nx-ink-3">{t("party.profile.lastModifiedLabel")}</span>
                  <span className="font-medium text-nx-ink">{formatDate(profile.modifiedAt)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-nx-ink-3">{t("party.profile.recordStatus")}</span>
                  <Badge variant="outline">{t("party.profile.statusActive")}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Deduplication & Merge Candidates */}
            <Card className="border-nx-line bg-nx-surface">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span>{t("party.profile.mergeCandidatesTitle")}</span>
                  </span>
                  <span className="bg-nx-raised rounded-full px-2 py-0.5 text-xs text-nx-ink-3">
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
                    {profile.mergeCandidates.map((m) => {
                      const otherDuplicateId =
                        m.primaryPartyId === partyId ? m.duplicatePartyId : m.primaryPartyId;
                      const dupInfo = otherDuplicateId
                        ? vm.relatedPartiesMap[otherDuplicateId]
                        : undefined;
                      const canNavigateDup = Boolean(
                        otherDuplicateId && otherDuplicateId !== partyId
                      );

                      return (
                        <div
                          key={m.id}
                          className="flex flex-col justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs sm:flex-row sm:items-center"
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
                              {t("party.profile.reason")}:{" "}
                              <span className="font-medium">{m.reason}</span>
                            </div>
                            {dupInfo?.displayName && (
                              <div className="max-w-[220px] truncate font-medium text-nx-ink">
                                {dupInfo.displayName}
                              </div>
                            )}
                            <div className="max-w-[220px] truncate font-mono text-nx-ink-3">
                              {t("party.profile.duplicateContact")}: {otherDuplicateId}
                            </div>
                          </div>

                          {canNavigateDup && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 self-start text-xs sm:self-auto"
                              onClick={() =>
                                router.push(`/party-kernel/parties/${otherDuplicateId}`)
                              }
                            >
                              <span>{t("party.profile.reviewMerge")}</span>
                            </Button>
                          )}
                        </div>
                      );
                    })}
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
        profile={profile}
        initialFullName={profile.fullName}
        open={vm.isEditNameOpen}
        onOpenChange={vm.setIsEditNameOpen}
        onSubmit={async (_id, displayName, options) => {
          await vm.handleUpdateName({
            displayName,
            fullName: options?.fullName,
            givenName: options?.givenName,
            middleNames: options?.middleNames,
            familyName: options?.familyName,
            dateOfBirth: options?.dateOfBirth,
            isMinor: options?.isMinor,
            legalName: options?.legalName,
            taxId: options?.taxId,
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
        sourcePartyType={profile.type}
      />

      <AddRelationshipDialog
        open={isAddRepresentativeOpen}
        onOpenChange={setIsAddRepresentativeOpen}
        onSubmit={vm.handleAddRelationship}
        currentPartyId={partyId}
        sourcePartyType={profile.type}
        defaultRelationshipType="Representative"
        title={t("party.dialog.addRepresentativeTitle")}
      />
    </div>
  );
});
