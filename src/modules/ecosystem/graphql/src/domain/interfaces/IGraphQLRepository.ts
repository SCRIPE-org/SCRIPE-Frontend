import { GraphQLResponse } from "../entities/GraphQLResponse";

export interface IGraphQLRepository {
  executeQuery(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse>;
  introspect(): Promise<GraphQLResponse>;
}
