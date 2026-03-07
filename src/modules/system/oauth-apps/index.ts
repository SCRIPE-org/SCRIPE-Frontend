/**
 * OAuth Applications module — public API exports
 */

// Domain entities
export type {
      OAuthApp,
      OAuthAppListItem,
      RegenerateSecretResult,
      OAuthAppListResponse,
      CreateOAuthAppRequest,
      UpdateOAuthAppRequest,
} from "./src/domain/entities/OAuthApp";

// Domain interfaces
export type { IOAuthAppRepository } from "./src/domain/interfaces/IOAuthAppRepository";

// Views (for page.tsx connectors)
export { OAuthAppsView } from "./src/presentation/views/OAuthAppsView";
