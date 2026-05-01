/**
 * Identity Providers module — public API exports
 */

// Domain entities
export type {
  IdentityProvider,
  IdentityProviderListItem,
  TestConnectionResult,
  IdentityProviderListResponse,
  CreateIdentityProviderRequest,
  UpdateIdentityProviderRequest,
} from "./src/domain/entities/IdentityProvider";

// Domain interfaces
export type { IIdentityProviderRepository } from "./src/domain/interfaces/IIdentityProviderRepository";

// Views (for page.tsx connectors)
export { IdentityProvidersView } from "./src/presentation/views/IdentityProvidersView";
export { IdentityProviderDetailView } from "./src/presentation/views/IdentityProviderDetailView";
