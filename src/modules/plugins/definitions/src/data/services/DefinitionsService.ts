import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IDefinitionsService } from "../../domain/interfaces/IDefinitionsService";
import type { PluginDefinitionModel } from "@modules/plugins/catalog";
import type { CreateDefinitionRequest, UpdateDefinitionRequest } from "../../domain/interfaces/IDefinitionsRepository";

export class DefinitionsService implements IDefinitionsService {
  constructor(private readonly api: IApiService) {}

  getAll(): Promise<PluginDefinitionModel[]> {
    return this.api.get<PluginDefinitionModel[]>(API_ENDPOINTS.PLUGINS.DEFINITIONS);
  }

  getById(id: string): Promise<PluginDefinitionModel> {
    return this.api.get<PluginDefinitionModel>(`${API_ENDPOINTS.PLUGINS.DEFINITIONS}/${id}`);
  }

  create(request: CreateDefinitionRequest): Promise<string> {
    return this.api.post<string>(API_ENDPOINTS.PLUGINS.DEFINITIONS, request);
  }

  update({ id, ...body }: UpdateDefinitionRequest): Promise<void> {
    return this.api.put<void>(`${API_ENDPOINTS.PLUGINS.DEFINITIONS}/${id}`, body);
  }

  delete(id: string): Promise<void> {
    return this.api.delete<void>(`${API_ENDPOINTS.PLUGINS.DEFINITIONS}/${id}`);
  }

  publish(id: string): Promise<void> {
    return this.api.post<void>(`${API_ENDPOINTS.PLUGINS.DEFINITIONS}/${id}/publish`, {});
  }

  deprecate(id: string): Promise<void> {
    return this.api.post<void>(`${API_ENDPOINTS.PLUGINS.DEFINITIONS}/${id}/deprecate`, {});
  }
}
