export interface ReportsModel {
  id: string;
  name: string;
  dataSource: string;
  status: string;
  format: string;
  generatedAt: string;
  downloadUrl: string;
}

export interface ReportsListModel {
  id: string;
  name: string;
  dataSource: string;
  status: string;
  format: string;
  generatedAt: string;
}
