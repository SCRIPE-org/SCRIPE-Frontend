import type {
  DataExchangeArtifactKind,
  DataExchangeEntitySummaryDto,
} from "@core/data-exchange/domain/types";
import type { DataTransferJob } from "../../domain/entities/DataTransferJob";

/**
 * Finite pagination metadata exposed by the jobs ViewModel.
 */
export interface JobsPaginationState {
  page: number;
  currentPage: number;
  pageNumber: number;
  pageSize: number;
  itemsCount: number;
  totalCount: number;
  pagesCount: number;
  totalPages: number;
}

/**
 * Return contract of the jobs sub-module ViewModel hook.
 */
export interface UseJobsViewModelReturn {
  jobs: DataTransferJob[];
  totalCount: number;
  pagesCount: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isTenantRequired: boolean;
  page: number;
  pageNumber: number;
  pageSize: number;
  search: string;
  statusFilter: string;
  kindFilter: string;
  setPage: (page: number) => void;
  setPageNumber: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  pagination: JobsPaginationState;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setKindFilter: (kind: string) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  refetch: () => Promise<unknown>;
  importableEntities: DataExchangeEntitySummaryDto[];
  isCatalogLoading: boolean;
  isStudioPickerOpen: boolean;
  setIsStudioPickerOpen: (open: boolean) => void;
  activeStudioEntityKey: string | null;
  setActiveStudioEntityKey: (entityKey: string | null) => void;
  openStudioPicker: () => void;
  launchStudioForEntity: (entityKey: string) => void;
  getCatalogEntry: (entityKey: string) => DataExchangeEntitySummaryDto | undefined;
  resolveEntityName: (entityKey: string) => string;
  isStudioOpen: boolean;
  setIsStudioOpen: (open: boolean) => void;
  jobToCancel: DataTransferJob | null;
  isCancelDialogOpen: boolean;
  isCancelling: boolean;
  promptCancelJob: (job: DataTransferJob) => void;
  closeCancelDialog: () => void;
  confirmCancelJob: () => Promise<void>;
  downloadArtifact: (job: DataTransferJob, kind: DataExchangeArtifactKind) => Promise<void>;
  isDownloading: boolean;
  kpis: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
  };
}
