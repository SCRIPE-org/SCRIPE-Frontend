"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { AlertCircle, RefreshCw, Plus, Search, Eye } from "lucide-react";
import { cn } from "@core/common/utils";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader, CRM_TAB_ROUTES } from "@modules/crm";
import type { CrmTabId, CrmAccount } from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { DataExchangeToolbarActions } from "@core/data-exchange";
import { CreateContactDialog } from "../components/CreateContactDialog";
import { ContactCardGridItem } from "../components/ContactCardGridItem";
import { ContactSplitDetail } from "../components/ContactSplitDetail";
import { useContactsViewModel } from "../viewmodels/useContactsViewModel";
import { useContactsCrudColumns } from "../viewmodels/useContactsCrudColumns";
import type { CrmContact } from "../../domain/entities/ContactEntity";

/**
 * CRM Contacts directory view providing account-scoped filtering, quick search,
 * multi-layout rendering (Table, CardGrid, SplitPane), and contact creation.
 */
export function ContactsView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateContact = usePermission(CRM_PERMISSIONS.CONTACTS_CREATE);
  const viewModel = useContactsViewModel();
  const {
    state,
    search,
    accountId,
    isCreateOpen,
    isSubmitting,
    submitError,
    setIsCreateOpen,
    handleSearchChange,
    handleAccountFilterChange,
    handleCreateContact,
    refresh,
    lookupAccounts,
  } = viewModel;

  const [accountsList, setAccountsList] = useState<CrmAccount[]>([]);

  useEffect(() => {
    lookupAccounts().then((accs) => {
      if (accs) setAccountsList(accs);
    });
  }, [lookupAccounts]);

  const handleTabChange = (tab: CrmTabId) => {
    const route = CRM_TAB_ROUTES[tab];
    if (route) router.push(route);
  };

  const columns = useContactsCrudColumns(language, t);

  const crudConfig: CrudConfig<CrmContact> = {
    titleKey: "crmContacts.header.title",
    subtitleKey: "crmContacts.header.subtitle",
    resource: "crm.contacts",
    entityTypeKey: "crm.contact",
    dataExchange: { entityKey: "crm.contact", hideToolbarActions: true },
    hidePageHeader: true,
    hideActionButtons: true,
    stickyActions: true,
    searchConfig: { enabled: false },
    viewSwitchPosition: "toolbar",
    viewModes: ["Table", "CardGrid", "SplitPane"],
    defaultView: "Table",
    permissions: {
      canView: CRM_PERMISSIONS.CONTACTS_READ,
      canCreate: CRM_PERMISSIONS.CONTACTS_CREATE,
      canUpdate: CRM_PERMISSIONS.CONTACTS_UPDATE,
      canDelete: false,
    },
    toolbarContent: (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1" dir={isRtl ? "rtl" : "ltr"}>
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
          <Input
            type="text"
            placeholder={t("crmContacts.searchPlaceholder")}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 ps-8 pe-3 text-xs bg-nx-surface border-nx-line text-nx-ink"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAccountFilterChange(undefined)}
            className={cn(
              "h-7 px-2.5 text-xs rounded-nx-md shrink-0 transition-all",
              !accountId
                ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
            )}
          >
            {t("crmContacts.filters.allAccounts")}
          </Button>
          {accountsList.slice(0, 5).map((acc) => {
            const isSelected = accountId === acc.id;
            const name = isRtl && acc.partyLegalNameAr ? acc.partyLegalNameAr : acc.partyLegalNameEn;
            return (
              <Button
                key={acc.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAccountFilterChange(isSelected ? undefined : acc.id)}
                className={cn(
                  "h-7 px-2.5 text-xs rounded-nx-md shrink-0 transition-all",
                  isSelected
                    ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                    : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
                )}
              >
                {name}
              </Button>
            );
          })}
        </div>
      </div>
    ),
    columns,
    getActions: (_vm, tFn): CrudAction<CrmContact>[] => [
      {
        label: tFn("crmContacts.actions.viewContext") || "View Context",
        icon: <Eye className="size-3.5" />,
        onClick: (c: CrmContact) => router.push(`/crm/contacts/${c.id}`),
      },
    ],
    renderCardGridItem: (contact: CrmContact, actions: React.ReactNode) => (
      <ContactCardGridItem
        contact={contact}
        actions={actions}
        language={language}
        onViewDetail={(id) => router.push(`/crm/contacts/${id}`)}
        t={t}
      />
    ),
    renderSplitDetail: (contact: CrmContact, actions: React.ReactNode) => (
      <ContactSplitDetail
        contact={contact}
        actions={actions}
        language={language}
        onViewDetail={(id) => router.push(`/crm/contacts/${id}`)}
        onSelectAccount={(accId) => router.push(`/crm/accounts/${accId}`)}
        t={t}
      />
    ),
  };

  return (
    <CrmShell activeTab="contacts" onTabChange={handleTabChange}>
      <div className="space-y-4">
        <CrmSectionHeader
          title={t("crmContacts.header.title")}
          subtitle={t("crmContacts.header.subtitle")}
          actions={
            <div className="flex items-center gap-2">
              <DataExchangeToolbarActions
                entityKey="crm.contact"
                activeSearch={search}
                onImportComplete={refresh}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refresh}
                className="h-8 px-2.5 text-xs border border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink gap-1.5"
              >
                <RefreshCw className="size-3.5 text-nx-ink-3" />
                <span>{t("crmContacts.actions.refresh")}</span>
              </Button>
              {canCreateContact && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-8 px-3 text-xs bg-nx-accent text-nx-on-fill font-medium hover:bg-nx-accent/90 gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>{t("crmContacts.actions.create")}</span>
                </Button>
              )}
            </div>
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-nx-line pb-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              data-testid="customer-dir-companies-tab"
              onClick={() => router.push("/crm/accounts")}
              className="h-7 px-3 rounded-md text-xs font-semibold text-nx-ink-2 hover:text-nx-ink"
            >
              {t("crmContacts.header.companiesTab")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              data-testid="customer-dir-people-tab"
              className="h-7 px-3 rounded-md text-xs font-bold bg-nx-surface text-foreground border border-nx-line-hi"
            >
              {t("crmContacts.header.peopleTab")}
            </Button>
          </div>
          <span className="text-[11px] text-nx-ink-3">
            {t("crmContacts.header.directoryHint")}
          </span>
        </div>

        {state.stage === "failed" ? (
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("crmContacts.actions.error")}</AlertTitle>
            <AlertDescription className="text-xs">{state.error}</AlertDescription>
          </Alert>
        ) : (
          <GenericCrudView<CrmContact>
            config={crudConfig}
            columns={columns}
            viewModel={viewModel}
            pagination={viewModel.pagination}
          />
        )}

        <CreateContactDialog
          open={isCreateOpen}
          isSubmitting={isSubmitting}
          error={submitError}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateContact}
          onLookupPeople={viewModel.lookupCandidatePeople}
          onLookupAccounts={viewModel.lookupAccounts}
        />
      </div>
    </CrmShell>
  );
}
