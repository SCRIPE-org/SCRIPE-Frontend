"use client";

import { useLoginBrandingTokens } from "@modules/auth/signin/src/presentation/viewmodels/useLoginBrandingTokens";
import { LoginBranding } from "@modules/auth/signin/src/presentation/components/LoginBranding";
import { SlotRenderer } from "@modules/auth/signin/src/presentation/components/SlotRenderer";
import { SignupShell } from "@modules/auth/signup/src/presentation/components/common/SignupShell";

/**
 * Core-level bridge to the auth module's PRESENTATIONAL surfaces.
 *
 * The customization studio previews the login screen, and workspace activation reuses the signup
 * chrome — both need auth's visual components without any of its behaviour. These re-exports keep
 * the dependency direction legal (core -> module, never module -> module) and, unlike the runtime
 * component registry they replace, always resolve: the registry was only populated by importing
 * the `@modules/auth` barrel, which no route does, so the branding preview rendered `null` chrome
 * and workspace activation fell back to a bare `<div>` instead of the branded shell.
 *
 * Deliberately separate from `@core/hooks/use-auth-bridge`: every hook in that module pulls the
 * auth DI container, and a page that only needs a shell should not pay for an HTTP client. Nothing
 * re-exported here touches the container.
 *
 * Nothing in `src/modules/shared/auth` is modified by this file; it only reads from it.
 */

/** Resolves branding tokens, layout and slot configuration for a login screen preview. */
export { useLoginBrandingTokens as useCoreLoginBrandingTokens };

/** The real login branding surface, for use inside branding previews. */
export { LoginBranding as CoreLoginBranding };

/** The real login slot renderer, for use inside branding previews. */
export { SlotRenderer as CoreSlotRenderer };

/** The signup chrome, reused by workspace activation so it matches signup exactly. */
export { SignupShell as CoreSignupShell };
