export interface DeveloperModel {
  apiVersion: string;
  totalEndpoints: string;
  activeWebhooks: string;
  sdkLanguages: string;
  healthStatus: string;
}

export interface DeveloperListModel {
  [key: string]: unknown;
}
