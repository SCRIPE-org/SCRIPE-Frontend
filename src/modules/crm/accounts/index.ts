/**
 * CRM Accounts Sub-Module Public Exports
 */

export * from "./src/domain/models/crm-account.types";
export * from "./src/domain/interfaces/ICrmAccountService";
export * from "./src/domain/interfaces/ICrmAccountRepository";
export * from "./src/data/services/CrmAccountService";
export * from "./src/data/repositories/CrmAccountRepository";
export * from "./src/presentation/views/AccountsView";
export * from "./src/presentation/views/AccountDetailView";
export * from "./src/presentation/components/AccountsTable";
export * from "./src/presentation/components/CreateAccountDialog";
export * from "./src/presentation/components/AccountStatusBadge";
export * from "./src/presentation/viewmodels/useAccountsViewModel";
export * from "./src/presentation/viewmodels/useAccountDetailViewModel";
