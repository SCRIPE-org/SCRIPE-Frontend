import type { IGraphQLRepository } from "../../domain/interfaces/IGraphQLRepository";
import type { IGraphQLService } from "../../domain/interfaces/IGraphQLService";
import { GraphQLResponse } from "../../domain/entities/GraphQLResponse";
import { GraphQLMapper } from "../mappers/GraphQLMapper";

export class GraphQLRepository implements IGraphQLRepository {
  constructor(private readonly service: IGraphQLService) {}

  async executeQuery(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse> {
    const raw = await this.service.executeQuery(query, variables);
    return GraphQLMapper.toResponse(raw);
  }

  async introspect(): Promise<GraphQLResponse> {
    const raw = await this.service.introspect();
    return GraphQLMapper.toResponse(raw);
  }
}
