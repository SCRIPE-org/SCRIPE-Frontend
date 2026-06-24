/**
 * Identity Providers List View
 *
 * Premium management dashboard for Single Sign-On (SSO) configuration.
 * Offers rich metrics, searchable grid card layout, inline status toggling,
 * connection health checkers, and templates gallery integration.
 */
"use client";

import { useState, useMemo } from "react";
import { useIdentityProvidersViewModel } from "../viewmodels/useIdentityProvidersViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { IdentityProviderStatsBar } from "../components/IdentityProviderStatsBar";
import { IdentityProviderEmptyState } from "../components/IdentityProviderEmptyState";
import { IdentityProviderCard } from "../components/IdentityProviderCard";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Plus, Search, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * React presentation component representing the identity providers view UI element.
 */
export function IdentityProvidersView() {
  useModuleLocales(() => import("../../../locales"), "identity-providers");
  const { t } = useI18n();
  const router = useRouter();

  const { vm, handleTestConnection, isTesting, testingId } = useIdentityProvidersViewModel();

  // Category filter state: "all" | "active" | "inactive" | "oidc" | "oauth2" | "saml"
  const [filterType, setFilterType] = useState<string>("all");

  // Apply filters client-side to keep interface extremely fast and fluid
  const filteredItems = useMemo(() => {
    return vm.items.filter((item) => {
      // 1. Text search (handled via vm.searchValue or filter client-side if needed, but VM handles server search)
      // 2. Category filter
      if (filterType === "active") return item.isActive;
      if (filterType === "inactive") return !item.isActive;
      if (filterType === "oidc") return item.protocol === "oidc";
      if (filterType === "oauth2") return item.protocol === "oauth2";
      if (filterType === "saml") return item.protocol === "saml";
      return true;
    });
  }, [vm.items, filterType]);

  const handleCreateClick = () => {
    router.push("/settings/identity-providers/create");
  };

  const handleToggleActive = async (item: any) => {
    // Call vm.updateItem to toggle status
    await vm.updateItem(item.id, { isActive: !item.isActive });
  };

  const handleDeleteItem = async (item: any) => {
    await vm.deleteItem(item.id);
  };

  return (
    <div className="space-y-6 pb-12 duration-300 animate-in fade-in">
      {/* ─── Premium Header Card ────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card/45 p-6 shadow-sm backdrop-blur-md">
        {/* Glow backdrop decoration */}
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-purple-500/10 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-[80px]" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              <ShieldCheck className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              {t("identityProviders.title") || "SSO Identity Providers"}
            </h1>
            <p className="max-w-xl text-xs text-muted-foreground">
              {t("identityProviders.description") ||
                "Configure external Identity Providers (IdPs) to enable secure Single Sign-On (SSO) login capabilities for users and admins."}
            </p>
          </div>

          <Button
            onClick={handleCreateClick}
            className="self-start border-0 bg-gradient-to-r from-[#A855F7] to-[#7C3AED] font-semibold text-white shadow-md transition-all duration-200 hover:opacity-95 hover:shadow-lg active:scale-95 sm:self-center"
          >
            <Plus className="me-1.5 h-4 w-4" strokeWidth={2.5} />
            {t("identityProviders.createButton") || "Add Provider"}
          </Button>
        </div>
      </div>

      {/* ─── Statistics Metrics ────────────────────────────────── */}
      <IdentityProviderStatsBar items={vm.items} />

      {/* ─── Controls & Search Section ───────────────────────────── */}
      <div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={vm.searchValue}
            onChange={(e) => vm.handleSearchChange(e.target.value)}
            placeholder={t("identityProviders.searchPlaceholder") || "Search identity providers..."}
            className="h-9 pl-9"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/40 p-1">
          {[
            { id: "all", label: t("common.all") || "All" },
            { id: "active", label: t("common.active") || "Active" },
            { id: "inactive", label: t("common.inactive") || "Inactive" },
            { id: "oidc", label: "OIDC" },
            { id: "oauth2", label: "OAuth 2.0" },
            { id: "saml", label: "SAML 2.0" },
          ].map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilterType(tab.id)}
              className={`h-7 rounded-md px-3 text-xs font-semibold transition-all duration-150 ${
                filterType === tab.id
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ─── Loading State ─────────────────────────────────────── */}
      {vm.loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("common.loading") || "Loading SSO settings..."}
          </p>
        </div>
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
                  onTestConnection={handleTestConnection}
                  isTesting={isTesting && testingId === item.id}
                />
              ))}
            </div>
          ) : (
            <IdentityProviderEmptyState onCreateClick={handleCreateClick} />
          )}
        </>
      )}
    </div>
  );
}
