export interface IntegrationsModel {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  lastSyncAt: string;
  config: string;
  createdAt: string;
}

export interface IntegrationsListModel {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  lastSyncAt: string;
}
