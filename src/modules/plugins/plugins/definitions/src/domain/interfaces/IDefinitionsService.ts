import type { PluginDefinitionModel } from "@modules/plugins/core";
import type { CreateDefinitionRequest, UpdateDefinitionRequest } from "./IDefinitionsRepository";

/**
 * Http API network service for i definitions.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IDefinitionsService {
  getAll(): Promise<PluginDefinitionModel[]>;
  getById(id: string): Promise<PluginDefinitionModel>;
  create(request: CreateDefinitionRequest): Promise<string>;
  update(request: UpdateDefinitionRequest): Promise<void>;
  delete(id: string): Promise<void>;
  publish(id: string): Promise<void>;
  deprecate(id: string): Promise<void>;
}
