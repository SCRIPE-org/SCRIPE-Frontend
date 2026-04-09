export interface BulkOperationsModel {
  id: string;
  type: string;
  status: string;
  totalRecords: string;
  processedRecords: string;
  failedRecords: string;
  startedAt: string;
  completedAt: string;
}

export interface BulkOperationsListModel {
  id: string;
  type: string;
  status: string;
  totalRecords: string;
  processedRecords: string;
  startedAt: string;
}
