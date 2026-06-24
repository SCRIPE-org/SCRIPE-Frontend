/**
 * Definitions sub-module domain interfaces.
 *
 * NOTE: The `PluginDefinition` entity is owned by the catalog sub-module
 * (it is the primary sub-module that owns the cross-cutting definition entity).
 * This sub-module RE-USES it — no duplication.
 */
import type { PluginDefinition, PluginTierValue, PluginScopeValue } from "@modules/plugins/core";

export interface CreateDefinitionRequest {
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  tier: PluginTierValue;
  scope: PluginScopeValue;
  manifestJson: string;
  iconUrl?: string;
  colorHue?: number;
  colorChroma?: number;
  workspaceKey?: string;
  baseUrl?: string;
  frontendUrl?: string;
}

export interface UpdateDefinitionRequest extends Partial<CreateDefinitionRequest> {
  id: string;
}

export interface IDefinitionsRepository {
  getAll(): Promise<PluginDefinition[]>;
  getById(id: string): Promise<PluginDefinition>;
  create(request: CreateDefinitionRequest): Promise<string>;
  update(request: UpdateDefinitionRequest): Promise<void>;
  delete(id: string): Promise<void>;
  publish(id: string): Promise<void>;
  deprecate(id: string): Promise<void>;
}
