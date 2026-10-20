"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useContactsOverviewViewModel } from "../viewmodels/useContactsOverviewViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";
import { useBreadcrumbOverride } from "@core/hooks/use-breadcrumb-override";

// Design System Primitives (@core/ui/*)
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";

// Dialogs
import { CreatePersonDialog } from "../components/dialogs/CreatePersonDialog";
import { CreateOrganizationDialog } from "../components/dialogs/CreateOrganizationDialog";

// Icons
import {
  Users,
  User,
  Building,
  AlertTriangle,
  UserPlus,
  Building2,
  ArrowRight,
  Phone,
  Mail,
  ShieldCheck,
  FolderOpen,
} from "lucide-react";

/**
 * Contacts Overview workspace view (/party-kernel).
 * Provides live operational KPIs, recent contacts, duplicate alerts, and quick creation actions.
 */
export const ContactsOverviewView = React.memo(function ContactsOverviewView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.party");
  const router = useRouter();
  const { t, language } = useI18n();
  const intlLocale = resolveIntlLocale(language);

  useBreadcrumbOverride(t("party.overview.title") || "Contacts Overview");

  const vm = useContactsOverviewViewModel();

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

  if (vm.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ── Page Header & Quick Actions ─────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-nx-ink">
            {t("party.overview.title")}
          </h1>
          <p className="text-sm text-nx-ink-3">{t("party.overview.subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {vm.permissions.canCreatePerson && (
            <Button
              variant="default"
              size="sm"
              onClick={() => vm.setIsCreatePersonOpen(true)}
              className="gap-1.5 text-xs"
            >
              <UserPlus className="h-4 w-4" />
              <span>{t("party.directory.addPerson")}</span>
            </Button>
          )}

          {vm.permissions.canCreateOrganization && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.setIsCreateOrgOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Building2 className="h-4 w-4" />
              <span>{t("party.directory.addOrganization")}</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/party-kernel/parties")}
            className="gap-1.5 text-xs"
          >
            <FolderOpen className="h-4 w-4" />
            <span>{t("party.overview.openDirectory")}</span>
          </Button>
        </div>
      </div>

      {/* ── KPI Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="border-nx-border shadow-xs hover:border-nx-accent/40 cursor-pointer bg-nx-surface transition-colors"
          onClick={() => router.push("/party-kernel/parties")}
        >
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-nx-ink-3">
                {t("party.overview.totalContacts")}
              </p>
              <p className="text-2xl font-bold text-nx-ink" data-testid="kpi-total-contacts">
                {vm.totalContacts}
              </p>
            </div>
            <div className="bg-nx-accent/10 flex h-11 w-11 items-center justify-center rounded-xl text-nx-accent">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-nx-border shadow-xs cursor-pointer bg-nx-surface transition-colors hover:border-blue-500/40"
          onClick={() => router.push("/party-kernel/parties?partyType=Person")}
        >
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-nx-ink-3">{t("party.overview.peopleCount")}</p>
              <p className="text-2xl font-bold text-nx-ink" data-testid="kpi-people-count">
                {vm.peopleCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <User className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-nx-border shadow-xs cursor-pointer bg-nx-surface transition-colors hover:border-emerald-500/40"
          onClick={() => router.push("/party-kernel/parties?partyType=Organization")}
        >
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-nx-ink-3">
                {t("party.overview.organizationsCount")}
              </p>
              <p className="text-2xl font-bold text-nx-ink" data-testid="kpi-organizations-count">
                {vm.organizationsCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-nx-border shadow-xs bg-nx-surface">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-xs font-medium text-nx-ink-3">
                {t("party.overview.duplicateAlerts")}
              </p>
              <p className="text-2xl font-bold text-nx-ink" data-testid="kpi-duplicate-alerts">
                {vm.duplicateAlertsCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Content Grid: Recent Contacts & Duplicate Alerts ───── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Contacts */}
        <Card
          className="border-nx-border shadow-xs bg-nx-surface lg:col-span-2"
          data-testid="recent-contacts-card"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-nx-ink">
                {t("party.overview.recentContacts")}
              </CardTitle>
              <p className="mt-0.5 text-xs text-nx-ink-3">
                {t("party.overview.recentContactsDesc")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/party-kernel/parties")}
              className="gap-1 text-xs text-nx-accent"
            >
              <span>{t("party.overview.viewAllDirectory")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {vm.recentContacts.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t("party.overview.noRecentContacts")}
                description={t("party.directory.emptySubtitle")}
              />
            ) : (
              <div className="divide-nx-border divide-y">
                {vm.recentContacts.map((party) => (
                  <div
                    key={party.id}
                    className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-nx-accent/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-nx-accent">
                        {party.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-nx-ink">
                            {party.displayName}
                          </span>
                          <Badge
                            variant={party.isPerson ? "info" : "success"}
                            className="py-0 text-[10px]"
                          >
                            {party.isPerson
                              ? t("party.types.Person")
                              : t("party.types.Organization")}
                          </Badge>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-nx-ink-3">
                          {party.primaryPhone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {party.primaryPhone}
                            </span>
                          )}
                          {party.primaryEmail && (
                            <span className="inline-flex max-w-[200px] items-center gap-1 truncate">
                              <Mail className="h-3 w-3" />
                              {party.primaryEmail}
                            </span>
                          )}
                          <span>{formatDate(party.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/party-kernel/parties/${party.id}`)}
                      className="gap-1 self-start text-xs sm:self-auto"
                    >
                      <span>{t("party.directory.openProfile")}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Duplicate Alerts & Quick Actions */}
        <div className="space-y-6">
          <Card className="border-nx-border shadow-xs bg-nx-surface" data-testid="attention-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-semibold text-nx-ink">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>{t("party.overview.duplicateAlerts")}</span>
                </span>
                <Badge variant="outline" className="text-xs">
                  {vm.duplicateAlertsCount}
                </Badge>
              </CardTitle>
              <p className="text-xs text-nx-ink-3">{t("party.overview.duplicateAlertsDesc")}</p>
            </CardHeader>
            <CardContent>
              {vm.mergeCandidates.length === 0 ? (
                <div className="border-nx-border bg-nx-surface-2/40 flex items-center gap-3 rounded-lg border p-4">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                  <p className="text-xs text-nx-ink-2">{t("party.overview.noDuplicates")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vm.mergeCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="warning">{candidate.status}</Badge>
                        <span className="font-semibold text-nx-ink">
                          {Math.round((candidate.matchScore ?? 0) * 100)}%
                        </span>
                      </div>
                      <p className="text-nx-ink-2">{candidate.reason}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-full text-xs"
                        onClick={() =>
                          router.push(`/party-kernel/parties/${candidate.primaryPartyId}`)
                        }
                      >
                        {t("party.profile.reviewMerge")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-nx-border shadow-xs bg-nx-surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-nx-ink">
                {t("party.overview.quickActions")}
              </CardTitle>
              <p className="text-xs text-nx-ink-3">{t("party.overview.quickActionsDesc")}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {vm.permissions.canCreatePerson && (
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs"
                  onClick={() => vm.setIsCreatePersonOpen(true)}
                >
                  <span className="inline-flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-nx-accent" />
                    <span>{t("party.directory.addPerson")}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}

              {vm.permissions.canCreateOrganization && (
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs"
                  onClick={() => vm.setIsCreateOrgOpen(true)}
                >
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <span>{t("party.directory.addOrganization")}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-between text-xs"
                onClick={() => router.push("/party-kernel/parties")}
              >
                <span className="inline-flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-nx-ink-2" />
                  <span>{t("party.overview.openDirectory")}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Creation Dialogs ───────────────────────────────────────── */}
      <CreatePersonDialog
        open={vm.isCreatePersonOpen}
        onOpenChange={vm.setIsCreatePersonOpen}
        onSubmit={async (input) => {
          const newId = await vm.handleCreatePerson(input);
          if (newId) {
            router.push(`/party-kernel/parties/${newId}`);
          }
          return newId;
        }}
      />

      <CreateOrganizationDialog
        open={vm.isCreateOrgOpen}
        onOpenChange={vm.setIsCreateOrgOpen}
        onSubmit={async (input) => {
          const newId = await vm.handleCreateOrganization(input);
          if (newId) {
            router.push(`/party-kernel/parties/${newId}`);
          }
          return newId;
        }}
      />
    </div>
  );
});
