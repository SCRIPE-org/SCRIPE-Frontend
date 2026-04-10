export interface IGraphQLService {
  executeQuery(query: string, variables?: Record<string, unknown>): Promise<unknown>;
  introspect(): Promise<unknown>;
}
