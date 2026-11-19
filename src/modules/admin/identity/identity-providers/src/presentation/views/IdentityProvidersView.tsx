/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Identity Providers List View
 *
 * Management dashboard for Single Sign-On (SSO) configuration.
 * Offers rich metrics, searchable grid card layout, inline status toggling,
 * connection health checkers, and templates gallery integration.
 */
"use client";

import { useState } from "react";
import { useIdentityProvidersViewModel } from "../viewmodels/useIdentityProvidersViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { IdentityProviderStatsBar } from "../components/IdentityProviderStatsBar";
import { IdentityProviderCard } from "../components/IdentityProviderCard";
import { TestConnectionDiagnosticsBanner } from "../components/TestConnectionDiagnosticsBanner";
import { PageHeader } from "@core/ui/page-header";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Plus, Search, ShieldCheck, Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import type { IdentityProviderListItem } from "../../domain/entities/IdentityProvider";

/**
 * Presentation UI component rendering the identity providers view.
 * Arranges layout boundaries and accessibility targets using the core design library (@core/ui/*).
 */
export function IdentityProvidersView() {
  useModuleLocales(() => import("../../../locales"), "identity-providers");
  const { t } = useI18n();
  const router = useRouter();

  const {
    vm,
    handleTestConnection,
    handleToggleActive,
    isTesting,
    testingId,
    lastTestDiagnostics,
    clearTestDiagnostics,
  } = useIdentityProvidersViewModel();

  // Category filter state: "all" | "active" | "inactive" | "oidc" | "oauth2" | "saml"
  const [filterType, setFilterType] = useState<string>("all");

  const filteredItems = vm.items.filter((item) => {
    if (filterType === "active") return item.isActive;
    if (filterType === "inactive") return !item.isActive;
    if (filterType === "oidc") return item.protocol === "oidc";
    if (filterType === "oauth2") return item.protocol === "oauth2";
    if (filterType === "saml") return item.protocol === "saml";
    return true;
  });

  const handleCreateClick = () => {
    router.push("/settings/identity-providers/create");
  };

  const handleDeleteItem = async (item: IdentityProviderListItem) => {
    await vm.deleteItem(item.id);
  };

  return (
    <div className="space-y-6 pb-12 duration-nx-standard ease-nx-enter animate-in fade-in motion-reduce:transition-none">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <PageHeader
        icon={ShieldCheck}
        title={t("identityProviders.title")}
        description={t("identityProviders.description")}
        actions={
          <Button onClick={handleCreateClick}>
            <Plus className="me-1.5 h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            {t("identityProviders.createButton")}
          </Button>
        }
      />

      {/* ─── Statistics Metrics ────────────────────────────────── */}
      <IdentityProviderStatsBar items={vm.items} />

      {/* ─── Test Connection Diagnostics ────────────────────────── */}
      {lastTestDiagnostics && (
        <TestConnectionDiagnosticsBanner
          providerName={lastTestDiagnostics.providerName}
          result={lastTestDiagnostics.result}
          errorMessage={lastTestDiagnostics.errorMessage}
          onDismiss={clearTestDiagnostics}
        />
      )}

      {/* ─── Controls & Search Section ───────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-nx-line pb-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-nx-ink-3" aria-hidden="true" />
          <Input
            value={vm.searchValue}
            onChange={(e) => vm.handleSearchChange(e.target.value)}
            placeholder={t("identityProviders.searchPlaceholder")}
            className="h-9 ps-9"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-nx-control border border-nx-line bg-nx-raised p-1">
          {[
            { id: "all", label: t("common.all") },
            { id: "active", label: t("common.active") },
            { id: "inactive", label: t("common.inactive") },
            { id: "oidc", label: "OIDC" },
            { id: "oauth2", label: "OAuth 2.0" },
            { id: "saml", label: "SAML 2.0" },
          ].map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={filterType === tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`h-7 rounded-nx-sm px-3 text-xs font-semibold transition-[background-color,color] duration-nx-micro motion-reduce:transition-none ${
                filterType === tab.id
                  ? "bg-nx-surface text-nx-ink border border-nx-line hover:bg-nx-surface"
                  : "text-nx-ink-3 hover:text-nx-ink"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ─── Loading State ─────────────────────────────────────── */}
      {vm.loading ? (
        <LoadingSpinner size="lg" fullHeight />
      ) : (
        <>
          {/* Grid Layout */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <IdentityProviderCard
                  key={item.id}
                  item={item}
                  onEdit={(itm) => router.push(`/settings/identity-providers/${itm.id}`)}
                  onDelete={handleDeleteItem}
                  onToggleActive={handleToggleActive}
                  onTestConnection={(id) => handleTestConnection(id, item.name)}
                  isTesting={isTesting && testingId === item.id}
                />
              ))}
            </div>
          ) : filterType !== "all" || vm.searchValue.trim().length > 0 ? (
            <EmptyState
              variant="filtered"
              size="lg"
              title={t("identityProviders.noMatchingTitle")}
              description={t("identityProviders.noMatchingDesc")}
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFilterType("all");
                    vm.handleSearchChange("");
                  }}
                >
                  {t("identityProviders.clearFilters")}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Fingerprint}
              size="lg"
              title={t("identityProviders.emptyTitle")}
              description={t("identityProviders.emptyDesc")}
              action={
                <Button onClick={handleCreateClick} className="gap-1.5">
                  <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  {t("identityProviders.createButton")}
                </Button>
              }
            />
          )}
        </>
      )}
    </div>
  );
}
