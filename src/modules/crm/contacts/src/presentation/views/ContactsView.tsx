"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { AlertCircle, RefreshCw, Plus, Search, User } from "lucide-react";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader } from "@modules/crm";
import { ContactsTable } from "../components/ContactsTable";
import { CreateContactDialog } from "../components/CreateContactDialog";
import { useContactsViewModel } from "../viewmodels/useContactsViewModel";

export function ContactsView() {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateContact = usePermission(CRM_PERMISSIONS.CONTACTS_CREATE);

  const viewModel = useContactsViewModel();
  const {
    state,
    search,
    isCreateOpen,
    isSubmitting,
    submitError,
    setIsCreateOpen,
    handleSearchChange,
    handleCreateContact,
    refresh,
  } = viewModel;

  return (
    <CrmShell activeTab="contacts" onTabChange={() => {}}>
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
        {/* Section Header */}
        <CrmSectionHeader
          title={t("crmContacts.header.title") || "Commercial Contacts & Context"}
          subtitle={
            t("crmContacts.header.subtitle") ||
            "Unified directory of external decision makers, account stakeholders, and commercial relationships."
          }
          badge={`${state.totalCount} ${t("crmContacts.header.contactsBadge") || "Contacts"}`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={state.stage === "loading"}
                className="h-8 text-xs border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-surfaceSubtle"
              >
                <RefreshCw
                  className={`size-3.5 ${state.stage === "loading" ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">{t("common.refresh") || "Refresh"}</span>
              </Button>

              {canCreateContact && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-8 text-xs gap-1.5 bg-nx-accent-fill text-nx-on-fill font-bold hover:brightness-105"
                >
                  <Plus className="size-3.5" />
                  <span>{t("crmContacts.actions.newContact") || "New Contact"}</span>
                </Button>
              )}
            </div>
          }
        />

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-3 bg-nx-surface p-3 rounded-nx-lg border border-nx-line">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3" />
            <Input
              type="text"
              placeholder={t("crmContacts.searchPlaceholder") || "Search contacts by name, title, or department..."}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs bg-nx-ground border-nx-line text-nx-ink"
            />
          </div>
        </div>

        {/* Content Area */}
        {state.stage === "loading" && state.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" className="text-nx-accent" />
            <p className="mt-3 text-xs text-nx-ink-3">
              {t("crmContacts.loading") || "Loading commercial contacts..."}
            </p>
          </div>
        ) : state.stage === "failed" ? (
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("common.error") || "Error"}</AlertTitle>
            <AlertDescription className="text-xs">{state.error}</AlertDescription>
          </Alert>
        ) : (
          <ContactsTable contacts={state.items} />
        )}

        {/* Create Dialog */}
        <CreateContactDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateContact}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      </div>
    </CrmShell>
  );
}
