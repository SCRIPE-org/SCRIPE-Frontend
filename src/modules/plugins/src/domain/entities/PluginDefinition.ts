export interface PluginDefinitionModel {
  id: string;
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  tier: 1 | 2;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  scope: number;
  iconUrl?: string;
  colorHue?: number;
  colorChroma?: number;
  workspaceKey?: string;
  manifestJson: string;
  baseUrl?: string;
  frontendUrl?: string;
  createdAt: string;
}

export class PluginDefinition {
  constructor(private readonly data: PluginDefinitionModel) {}

  get id() { return this.data.id; }
  get key() { return this.data.key; }
  get name() { return this.data.name; }
  get nameAr() { return this.data.nameAr; }
  get description() { return this.data.description; }
  get descriptionAr() { return this.data.descriptionAr; }
  get tier() { return this.data.tier; }
  get status() { return this.data.status; }
  get iconUrl() { return this.data.iconUrl ?? null; }
  get colorHue() { return this.data.colorHue ?? null; }
  get colorChroma() { return this.data.colorChroma ?? null; }
  get workspaceKey() { return this.data.workspaceKey ?? null; }
  get baseUrl() { return this.data.baseUrl ?? null; }
  get frontendUrl() { return this.data.frontendUrl ?? null; }
  get isTier1() { return this.data.tier === 1; }
  get isTier2() { return this.data.tier === 2; }
  get isPublished() { return this.data.status === 4; }
  get createdAt() { return new Date(this.data.createdAt); }

  toModel() { return this.data; }
}
