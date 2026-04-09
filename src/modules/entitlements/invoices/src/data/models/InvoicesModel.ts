export interface InvoicesModel {
  id: string;
  number: string;
  tenantName: string;
  amount: string;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string;
  createdAt: string;
}

export interface InvoicesListModel {
  id: string;
  number: string;
  tenantName: string;
  amount: string;
  currency: string;
  status: string;
  dueDate: string;
  createdAt: string;
}
