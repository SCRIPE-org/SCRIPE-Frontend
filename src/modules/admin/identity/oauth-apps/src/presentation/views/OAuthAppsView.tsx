/**
 * OAuth Applications List View
 *
 * Premium management dashboard for third-party registered applications (OIDC Server).
 * Custom-styled card list layout with inline Client ID copying, status tags, and action alerts.
 */
"use client";

import { useState } from "react";
import { useOAuthAppsViewModel } from "../viewmodels/useOAuthAppsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { AppWindow, Search, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Card, CardContent } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@core/ui/pagination";
import { cn } from "@core/common/utils";
import { useRouter } from "next/navigation";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { OAuthAppCard, OAuthAppItem } from "../components/OAuthAppCard";
import { NewSecretDialog } from "../components/NewSecretDialog";

/**
 * Presentation UI component rendering the o auth apps view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function OAuthAppsView() {
  useModuleLocales(() => import("../../../locales"), "oauth-apps");

  const { t } = useI18n();
  const router = useRouter();
  const { vm, config, handleRegenerateSecret, generatedSecret, clearGeneratedSecret } =
    useOAuthAppsViewModel();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreate = () => {
    if (config.onCreateClick) {
      config.onCreateClick();
    } else {
      router.push("/settings/oauth-apps/create");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/settings/oauth-apps/${id}`);
  };

  return (
    <div className="space-y-6 pb-12 duration-300 animate-in fade-in">
      {/* ─── Dashboard Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t("oauthApps.title") || "OAuth Applications"}
            </h1>
            <Badge
              variant="outline"
              className="gap-1 border-primary/20 bg-primary/5 font-semibold text-primary"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              OIDC Server
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("oauthApps.description") ||
              "Configure third-party client applications that authorize against your SCRIPE user directory."}
          </p>
        </div>

        <Button
          onClick={handleCreate}
          className="self-start bg-gradient-to-r from-primary to-info font-semibold text-primary-foreground shadow hover:opacity-95 sm:self-center"
        >
          <Plus className="me-1.5 h-4 w-4" />
          {t("oauthApps.createTitle") || "Register Application"}
        </Button>
      </div>

      {/* ─── Search and Filter Toolbar ─── */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search") || "Search applications..."}
            value={vm.searchValue}
            onChange={(e) => vm.handleSearchChange(e.target.value)}
            className="rounded-lg border-border/80 bg-muted/20 ps-9"
          />
        </div>
      </div>

      {/* ─── Main Content Grid/States ─── */}
      {vm.loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="motion-safe:animate-pulse border border-border/40 bg-card/10">
              <CardContent className="h-24 p-6" />
            </Card>
          ))}
        </div>
      ) : vm.error ? (
        <Card className="border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive">
            {t("common.error") || "Error"}: {vm.error}
          </p>
        </Card>
      ) : vm.items.length === 0 ? (
        <EmptyState
          icon={AppWindow}
          size="lg"
          title={t("oauthApps.emptyTitle") || "No OAuth applications found"}
          description={
            t("oauthApps.emptyDesc") ||
            "Get started by registering a new application to enable secure third-party login via SCRIPE identity services."
          }
          action={
            <Button onClick={handleCreate}>
              <Plus className="me-1.5 h-4 w-4" />
              {t("oauthApps.createTitle") || "Register Application"}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {vm.items.map((item) => (
            <OAuthAppCard
              key={item.id}
              item={item as OAuthAppItem}
              copiedField={copiedField}
              copyToClipboard={copyToClipboard}
              onEdit={handleEdit}
              onRegenerateSecret={handleRegenerateSecret}
              onDelete={vm.deleteItem}
            />
          ))}
        </div>
      )}

      {/* ─── Pagination Controls — composed from the core pagination
          primitives, which already flip their chevrons for RTL ─── */}
      {!vm.loading && vm.pagination.pagesCount > 1 && (
        <Pagination className="mx-0 w-auto justify-end pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={vm.page === 1 || undefined}
                tabIndex={vm.page === 1 ? -1 : undefined}
                className={cn("h-8", vm.page === 1 && "pointer-events-none opacity-50")}
                onClick={(e) => {
                  e.preventDefault();
                  vm.changePage(vm.page - 1);
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-xs tabular-nums text-muted-foreground">
                {vm.page} / {vm.pagination.pagesCount}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={vm.page === vm.pagination.pagesCount || undefined}
                tabIndex={vm.page === vm.pagination.pagesCount ? -1 : undefined}
                className={cn(
                  "h-8",
                  vm.page === vm.pagination.pagesCount && "pointer-events-none opacity-50"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  vm.changePage(vm.page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* ─── Secret Display Dialog ─── */}
      <NewSecretDialog
        generatedSecret={generatedSecret}
        copiedField={copiedField}
        copyToClipboard={copyToClipboard}
        onClose={() => clearGeneratedSecret()}
      />
    </div>
  );
}
