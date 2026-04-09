export interface PluginsEntityData {
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

export class PluginsEntity {
  constructor(private readonly data: PluginsEntityData) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get version() { return this.data.version; }
  get author() { return this.data.author; }
  get description() { return this.data.description; }
  get isEnabled() { return this.data.isEnabled; }
  get isInstalled() { return this.data.isInstalled; }
  get icon() { return this.data.icon; }
  get createdAt() { return this.data.createdAt; }

  copyWith(updates: Partial<PluginsEntityData>): PluginsEntity {
    return new PluginsEntity({ ...this.data, ...updates });
  }
}
