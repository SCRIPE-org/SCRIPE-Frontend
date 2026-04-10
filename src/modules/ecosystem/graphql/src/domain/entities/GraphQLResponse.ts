export interface GraphQLResponseData {
  data: unknown;
  errors?: Array<{ message: string; locations?: Array<{ line: number; column: number }>; path?: string[] }>;
}

export class GraphQLResponse {
  constructor(private readonly raw: GraphQLResponseData) {}

  get data() { return this.raw.data; }
  get errors() { return this.raw.errors ?? []; }
  get hasErrors() { return this.errors.length > 0; }

  toJSON(): string {
    return JSON.stringify(this.raw, null, 2);
  }
}
