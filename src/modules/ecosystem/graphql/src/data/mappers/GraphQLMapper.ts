import { GraphQLResponse, type GraphQLResponseData } from "../../domain/entities/GraphQLResponse";

export class GraphQLMapper {
  static toResponse(raw: unknown): GraphQLResponse {
    const obj = raw as Record<string, unknown>;
    // ApiService.unwrap() strips the top-level { data: T } wrapper.
    // For GraphQL, this means:
    //   - If unwrap removed the outer `data`, we get `{ __schema: ... }` directly → wrap it back
    //   - If the response has `data` with GraphQL content, use it directly
    //   - If the response has `errors`, keep them
    const hasGraphQLData = obj?.data !== undefined;
    const hasGraphQLMeta = obj?.__schema !== undefined || obj?.__type !== undefined;

    return new GraphQLResponse({
      data: hasGraphQLData ? obj.data : hasGraphQLMeta ? obj : obj ?? null,
      errors: (obj?.errors as GraphQLResponseData["errors"]) ?? [],
    });
  }
}

