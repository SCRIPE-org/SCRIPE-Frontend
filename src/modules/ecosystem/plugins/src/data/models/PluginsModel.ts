export interface PluginsModel {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  isEnabled: string;
  isInstalled: string;
  icon: string;
  createdAt: string;
}

export interface PluginsListModel {
  id: string;
  name: string;
  version: string;
  author: string;
  isEnabled: string;
  createdAt: string;
}
