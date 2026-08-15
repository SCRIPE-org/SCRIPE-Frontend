import type { IApiService } from "@core/interfaces/api.interface";
import type { IDefinitionsService } from "../../domain/interfaces/IDefinitionsService";
import type { PluginDefinitionModel } from "@modules/plugins/core";
import { DEFINITIONS_ENDPOINTS } from "./definitions.endpoints";
import type {
  CreateDefinitionRequest,
  UpdateDefinitionRequest,
} from "../../domain/interfaces/IDefinitionsRepository";

/**
 * Http API network service for definitions.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class DefinitionsService implements IDefinitionsService {
  constructor(private readonly api: IApiService) {}

  getAll(): Promise<PluginDefinitionModel[]> {
    return this.api.get<PluginDefinitionModel[]>(DEFINITIONS_ENDPOINTS.DEFINITIONS);
  }

  getById(id: string): Promise<PluginDefinitionModel> {
    return this.api.get<PluginDefinitionModel>(DEFINITIONS_ENDPOINTS.BY_ID(id));
  }

  create(request: CreateDefinitionRequest): Promise<string> {
    return this.api.post<string>(DEFINITIONS_ENDPOINTS.CREATE, request);
  }

  update({ id, ...body }: UpdateDefinitionRequest): Promise<void> {
    return this.api.put<void>(DEFINITIONS_ENDPOINTS.UPDATE(id), body);
  }

  delete(id: string): Promise<void> {
    return this.api.delete<void>(DEFINITIONS_ENDPOINTS.DELETE(id));
  }

  publish(id: string): Promise<void> {
    return this.api.post<void>(DEFINITIONS_ENDPOINTS.PUBLISH(id), {});
  }

  deprecate(id: string): Promise<void> {
    return this.api.post<void>(DEFINITIONS_ENDPOINTS.DEPRECATE(id), {});
  }
}
