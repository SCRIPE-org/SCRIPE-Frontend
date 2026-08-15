/**
 * DSR Data Models — Raw DTOs matching backend API response exactly.
 * NEVER used in presentation layer.
 */

export interface DsrModel {
  id: string;
  subjectEmail: string;
  subjectType: string;
  requestType: string;
  status: string;
  regulationCode: string;
  deadline: string;
  daysRemaining: number;
  slaPercent: number;
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
  reviewedBy?: string;
  notes?: string;
  resolution?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for dsr status history model.
 */
export interface DsrStatusHistoryModel {
  fromStatus: string;
  toStatus: string;
  changedByAdminId?: string;
  notes?: string;
  occurredAt: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for dsr module execution model.
 */
export interface DsrModuleExecutionModel {
  moduleName: string;
  isCompleted: boolean;
  processedCount: number;
  errorMessage?: string;
  retryCount: number;
  completedAt?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for dsr detail model.
 */
export interface DsrDetailModel extends DsrModel {
  dsrDeadlineDays: number;
  assignedToAdminId?: string;
  exportFileUrl?: string;
  erasureConfirmed: boolean;
  erasureExecuteAfter?: string;
  requesterNotes?: string;
  statusHistory: DsrStatusHistoryModel[];
  moduleExecutions: DsrModuleExecutionModel[];
}
