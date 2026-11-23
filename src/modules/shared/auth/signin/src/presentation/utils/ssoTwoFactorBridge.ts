import { resolvePostAuthTargetForOrigin } from "@core/common/origin-routing";
import type { AdminRole, PermissionCode } from "@core/common/types/permissions";
import type { IAuthRepository } from "@modules/auth/core/domain/interfaces/IAuthRepository";
import type { User } from "@modules/auth/core/domain/entities/User";
import { buildPostAuthEntryUrl } from "./redirect-safety";
import {
  buildVerifiedCrossOriginCallbackUrl,
  emitSsoLoginBroadcast,
  type SsoTwoFactorPendingData,
} from "./ssoHandoffDispatch";

/** Parameters required to execute hybrid-2FA SSO verification and post-MFA routing. */
export interface SsoTwoFactorExecutionParams {
  authRepository: IAuthRepository;
  twoFactorPending: SsoTwoFactorPendingData;
  twoFactorCode: string;
  handoffContext: { returnOrigin?: string | null; returnPath?: string | null };
  queryRedirect?: string | null;
  setAuth: (user: User, permissions: PermissionCode[], roles: AdminRole[], isFreshLogin?: boolean) => void;
  setSubscriptionInfo: (status: string | null, grace: string | null, edition: string | null) => void;
  setMustChangePassword: (mustChange: boolean) => void;
  setRequireMfaEnrollment?: (require: boolean) => void;
  setDefaultRedirectPath: (path: string) => void;
  invalidateQueries: () => void;
  operationSuccess: (msg: string) => void;
  setState: (state: "success") => void;
  setTwoFactorError: (msg: string) => void;
  navigateToTarget: (targetUrl: string) => void;
  t: (key: string) => string;
}

/**
 * Verifies hybrid-2FA for an SSO login (`Verify2FACommand` or `VerifyUser2FACommand`),
 * either bridging the minted single-use post-MFA handoff back to a verified custom domain
 * or establishing a same-site session on `auth.scripe.org` / target subdomain.
 */
export async function executeSsoTwoFactorVerification(
  params: SsoTwoFactorExecutionParams
): Promise<void> {
  const { twoFactorPending, handoffContext, queryRedirect } = params;
  const resolvedOrigin = twoFactorPending.returnOrigin ?? handoffContext.returnOrigin ?? null;
  const resolvedPath = twoFactorPending.returnPath ?? handoffContext.returnPath ?? queryRedirect ?? null;
  const isCrossOriginReturn =
    Boolean(resolvedOrigin) &&
    typeof window !== "undefined" &&
    resolvedOrigin !== window.location.origin;

  const verifyOptions =
    isCrossOriginReturn || twoFactorPending.principalType === "user"
      ? {
          returnOrigin: isCrossOriginReturn ? resolvedOrigin : null,
          returnPath: isCrossOriginReturn ? resolvedPath : null,
          principalType: twoFactorPending.principalType ?? "admin",
        }
      : undefined;

  const result = verifyOptions
    ? await params.authRepository.verify2FA(
        "",
        null,
        params.twoFactorCode.trim(),
        undefined,
        twoFactorPending.token,
        twoFactorPending.staySignedIn,
        verifyOptions
      )
    : await params.authRepository.verify2FA(
        "",
        null,
        params.twoFactorCode.trim(),
        undefined,
        twoFactorPending.token,
        twoFactorPending.staySignedIn
      );

  if (result.handoff?.code && result.handoff?.state && result.handoff?.returnOrigin) {
    const crossOrigin = buildVerifiedCrossOriginCallbackUrl(
      result.handoff.returnOrigin,
      result.handoff.code,
      result.handoff.state,
      result.handoff.returnPath ?? resolvedPath,
      [result.handoff.returnOrigin]
    );
    if (!crossOrigin) {
      params.setTwoFactorError(params.t("auth.sso.callbackErrorGeneric"));
      return;
    }
    params.setState("success");
    setTimeout(() => params.navigateToTarget(crossOrigin), 150);
    return;
  }

  const { user } = result;
  params.setAuth(user, (user.permissions || []) as PermissionCode[], (user.roles || []) as AdminRole[], true);
  emitSsoLoginBroadcast(user, twoFactorPending.principalType ?? "admin");
  params.setSubscriptionInfo(result.subscriptionStatus, result.gracePhase, result.editionName);
  const mustChange = Boolean(result.mustChangePassword);
  const requireMfa = Boolean(result.requireMfaEnrollment);
  params.setMustChangePassword(mustChange);
  params.setRequireMfaEnrollment?.(requireMfa);
  params.setDefaultRedirectPath("/");
  if (!mustChange && !requireMfa && result.subscriptionStatus !== "PendingPayment") {
    params.invalidateQueries();
  }
  const targetPath = resolvePostAuthTargetForOrigin(
    buildPostAuthEntryUrl({
      mustChangePassword: mustChange,
      requireMfaEnrollment: requireMfa,
      subscriptionStatus: result.subscriptionStatus,
      redirect: resolvedPath,
      allowedOrigins: resolvedOrigin ? [resolvedOrigin] : undefined,
    }),
    resolvedOrigin
  );
  params.operationSuccess(params.t("auth.welcomeBack"));
  params.setState("success");
  setTimeout(() => params.navigateToTarget(targetPath), 200);
}
