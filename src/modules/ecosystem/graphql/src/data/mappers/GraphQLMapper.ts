import { GraphQLResponse, type GraphQLResponseData } from "../../domain/entities/GraphQLResponse";

export class GraphQLMapper {
  static toResponse(raw: unknown): GraphQLResponse {
    const data = raw as GraphQLResponseData;
    return new GraphQLResponse({
      data: data?.data ?? null,
      errors: data?.errors ?? [],
    });
  }
}
