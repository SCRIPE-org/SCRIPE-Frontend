import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IGraphQLService } from "../../domain/interfaces/IGraphQLService";

export class GraphQLService implements IGraphQLService {
  constructor(private readonly api: IApiService) {}

  async executeQuery(query: string, variables?: Record<string, unknown>): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.GRAPHQL.ENDPOINT, { query, variables: variables ?? {} });
  }

  async introspect(): Promise<unknown> {
    const introspectionQuery = `{
      __schema {
        types { name kind fields { name } }
      }
    }`;
    return this.api.post(API_ENDPOINTS.GRAPHQL.ENDPOINT, { query: introspectionQuery });
  }
}
