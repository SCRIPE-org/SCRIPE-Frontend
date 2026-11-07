"use client";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Card } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { AlertCircle, RefreshCw, Plus, Search, User, Building2, Mail, Phone, Eye, Calendar, ArrowUpRight, } from "lucide-react";
import { cn } from "@core/common/utils";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader } from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudColumn } from "@core/crud/components/generic-crud-view";
import { CreateContactDialog } from "../components/CreateContactDialog";
import { useContactsViewModel } from "../viewmodels/useContactsViewModel";
import type { CrmContact } from "../../domain/entities/ContactEntity";
export function ContactsView() { const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateContact = usePermission(CRM_PERMISSIONS.CONTACTS_CREATE);
  const viewModel = useContactsViewModel();
  const { state,
    search, isCreateOpen,
    isSubmitting, submitError,
    setIsCreateOpen, handleSearchChange,
    handleCreateContact, refresh,
  } = viewModel;
  const columns: CrudColumn<CrmContact>[] = [
      { key: "personLegalNameEn",
        label: t("crmContacts.table.contact") || "Contact Name", sortable: true,
        render: (_val, contact: CrmContact) => ( <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => router.push(`/crm/contacts/${contact.id}`)}
          >
            <div className="size-7 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
              <User className="size-3.5 text-nx-accent" />
            </div>
            <div>
              <span className="font-semibold text-nx-ink block hover:text-nx-accent transition-colors">
                {language === "ar" && contact.personLegalNameAr
                  ? contact.personLegalNameAr
                  : contact.personLegalNameEn}
              </span>
              {language !== "ar" && contact.personLegalNameAr && ( <span className="text-[11px] text-nx-ink-3 block font-arabic">
                  {contact.personLegalNameAr}
                </span> )}
              {contact.commercialNotes && ( <span className="text-[11px] text-nx-ink-3 line-clamp-1 mt-0.5 max-w-xs">
                  {contact.commercialNotes}
                </span> )}
            </div>
          </div> ),
      }, {
        key: "primaryAccountNameEn", label: t("crmContacts.table.account") || "Primary Account",
        render: (_val, contact: CrmContact) =>
          contact.primaryAccountId ? ( <div
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-nx-sm bg-nx-raised border border-nx-line hover:border-nx-accent transition-colors text-nx-ink cursor-pointer"
              onClick={() => router.push(`/crm/accounts/${contact.primaryAccountId}`)}
            >
              <Building2 className="size-3 text-nx-accent" />
              <span className="font-medium text-xs">
                {language === "ar" && contact.primaryAccountNameAr
                  ? contact.primaryAccountNameAr
                  : contact.primaryAccountNameEn || t("crmContacts.detail.defaultAccountLabel")}
              </span>
              <ArrowUpRight className="size-2.5 text-nx-ink-3" />
            </div> ) : (
            <span className="text-nx-ink-3 text-[11px] italic">
              {t("crmContacts.table.noAccount")}
            </span> ),
      }, {
        key: "jobTitleSnapshot", label: t("crmContacts.table.role"),
        render: (_val, contact: CrmContact) => ( <div>
            <span className="font-medium text-nx-ink block">
              {contact.jobTitleSnapshot || "—"}
            </span>
            {contact.departmentName && ( <span className="text-[11px] text-nx-ink-3 block">{contact.departmentName}</span>
            )}
          </div> ),
      }, {
        key: "email", label: t("crmContacts.table.communication"),
        render: (_val, contact: CrmContact) => ( <div className="text-[11px] text-nx-ink-2 space-y-0.5">
            {contact.email && ( <div className="flex items-center gap-1.5">
                <Mail className="size-3 text-nx-ink-3" />
                <span>{contact.email}</span>
              </div> )}
            {contact.phone && ( <div className="flex items-center gap-1.5 font-mono text-nx-ink-3">
                <Phone className="size-3" />
                <span>{contact.phone}</span>
              </div> )}
            {!contact.email && !contact.phone && <span className="text-nx-ink-3">—</span>}
          </div> ),
      }, {
        key: "createdAt", label: t("crmContacts.table.createdAt"),
        sortable: true, render: (_val, contact: CrmContact) => {
          const formattedDate = contact.createdAt
            ? new Date(contact.createdAt).toLocaleDateString( language === "ar" ? "ar-SA" : "en-US",
                { month: "short",
                  day: "numeric", year: "numeric",
                } )
            : "—";
          return ( <div className="flex items-center gap-1 text-nx-ink-3 text-[11px]">
              <Calendar className="size-3 text-nx-ink-3" />
              {formattedDate}
            </div> );
        }, },
    ];
  const crudConfig: CrudConfig<CrmContact> = ({ titleKey: "crmContacts.header.title",
      subtitleKey: "crmContacts.header.subtitle", resource: "crm.contacts",
      entityTypeKey: "crm.contact",
      hidePageHeader: true, hideActionButtons: true,
      stickyActions: true, searchConfig: { enabled: false },
      viewSwitchPosition: "toolbar", viewModes: ["Table", "CardGrid", "SplitPane"],
      defaultView: "Table", permissions: {
        canView: CRM_PERMISSIONS.CONTACTS_READ, canCreate: CRM_PERMISSIONS.CONTACTS_CREATE,
        canUpdate: CRM_PERMISSIONS.CONTACTS_UPDATE, canDelete: false,
      }, toolbarContent: (
        <div className="flex items-center gap-3 flex-1" dir={isRtl ? "rtl" : "ltr"}>
          <div className="relative w-full sm:w-80">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
            <Input type="text"
              placeholder={t("crmContacts.searchPlaceholder")}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8 ps-8 pe-3 text-xs bg-nx-surface border-nx-line text-nx-ink" />
          </div>
        </div> ),
      columns, renderActions: (contact: CrmContact) => (
        <Button type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/crm/contacts/${contact.id}`)}
          className="h-7 px-2.5 text-xs gap-1 border border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink"
        >
          <Eye className="size-3 text-nx-accent" />
          <span>{t("crmContacts.actions.viewContext")}</span>
        </Button> ),
      renderCardGridItem: (contact: CrmContact, actions: React.ReactNode) => (
        <Card className="flex flex-col justify-between gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-all">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-sm text-nx-ink hover:text-nx-accent cursor-pointer line-clamp-1"
                onClick={() => router.push(`/crm/contacts/${contact.id}`)}
              >
                {language === "ar" && contact.personLegalNameAr
                  ? contact.personLegalNameAr
                  : contact.personLegalNameEn}
              </span>
              <span className="text-xs text-nx-ink-2">{contact.jobTitleSnapshot || "—"}</span>
            </div>
            {contact.email && ( <div className="text-xs text-nx-ink-3 flex items-center gap-1.5">
                <Mail className="size-3" />
                <span>{contact.email}</span>
              </div> )}
          </div>
          <div className="border-t border-nx-line pt-3 flex items-center justify-between">
            <span className="text-xs text-nx-ink-2">
              {(language === "ar" && contact.primaryAccountNameAr ? contact.primaryAccountNameAr : contact.primaryAccountNameEn) || t("crmContacts.table.noAccount")}
            </span>
            {actions}
          </div>
        </Card> ),
      renderSplitDetail: (contact: CrmContact, actions: React.ReactNode) => (
        <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4">
          <div className="flex items-start justify-between border-b border-nx-line pb-4 gap-3">
            <div>
              <h3 className="text-base font-bold text-nx-ink">
                {language === "ar" && contact.personLegalNameAr
                  ? contact.personLegalNameAr
                  : contact.personLegalNameEn}
              </h3>
              <p className="text-xs text-nx-ink-3 mt-1">
                {[contact.jobTitleSnapshot, contact.departmentName].filter(Boolean).join(" • ") ||
                  "—"}
              </p>
            </div>
            {actions}
          </div>
          {contact.commercialNotes && ( <p className="text-xs text-nx-ink-2">{contact.commercialNotes}</p>
          )}
        </Card> ),
      customTableProps: { onSearch: undefined,
        emptyMessage: ( <EmptyState
            title={t("crmContacts.table.emptyTitle") || "No Contacts Found"}
            description={ t("crmContacts.table.emptyDescription") ||
              "No commercial contacts match the current filter or search criteria." }
          /> ),
      }, onCreateClick: () => setIsCreateOpen(true),
    });
  return ( <CrmShell activeTab="contacts" onTabChange={() => {}}>
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"}>
        {/* Section Header */}
        <CrmSectionHeader title={t("crmContacts.header.title") || "Commercial Contacts & Context"}
          subtitle={ t("crmContacts.header.subtitle") ||
            "Unified directory of external decision makers, account stakeholders, and commercial relationships." }
          badge={`${state.totalCount} ${t("crmContacts.header.contactsBadge") || "Contacts"}`}
          actions={ <div className="flex items-center gap-2">
              <Button type="button"
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={state.stage === "loading"}
                className="h-8 text-xs border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
              >
                <RefreshCw className={cn("size-3.5", state.stage === "loading" && "animate-spin")}
                />
                <span className="hidden sm:inline">{t("common.refresh") || "Refresh"}</span>
              </Button>
              {canCreateContact && ( <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-8 text-xs gap-1.5 font-bold"
                >
                  <Plus className="size-3.5" />
                  <span>{t("crmContacts.actions.newContact") || "New Contact"}</span>
                </Button> )}
            </div> }
        />

        {/* Unified Customer 360 Directory Switcher: Companies (Accounts) <-> People (Contacts) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-nx-line bg-nx-surface px-3.5 py-2.5">
          <div className="inline-flex items-center rounded-lg border border-nx-line bg-nx-ground p-0.5 gap-1">
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
        {/* Content Area */}
        {state.stage === "failed" ? ( <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("common.error") || "Error"}</AlertTitle>
            <AlertDescription className="text-xs">{state.error}</AlertDescription>
          </Alert> ) : (
          <GenericCrudView<CrmContact>
            config={crudConfig}
            columns={columns}
            viewModel={viewModel}
            pagination={viewModel.pagination} />
        )}
        {/* Create Dialog */}
        <CreateContactDialog open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateContact}
          onLookupPeople={viewModel.lookupCandidatePeople}
          onLookupAccounts={viewModel.lookupAccounts}
          isSubmitting={isSubmitting}
          error={submitError} />
      </div>
    </CrmShell> );
}
