/**
 * SetupAccountView — Public Account Activation Page
 *
 * Token-based password setup for new tenant admins.
 * Flow: Validate token → Show form → Set password → Redirect to login
 *
 * Security:
 * - Token is single-use (consumed on activation)
 * - 24-hour expiry
 * - Rate-limited on backend
 * - No auth required (public page)
 *
 * @module auth/account-setup
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import {
  Shield, CheckCircle2, XCircle, Loader2, Eye, EyeOff,
  KeyRound, Building2, AlertTriangle,
} from "lucide-react";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import {
  AccountSetupService,
  type ValidateTokenResponse,
} from "../../data/services/AccountSetupService";

type PageState = "loading" | "valid" | "invalid" | "activating" | "success" | "error";

export function SetupAccountView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [pageState, setPageState] = useState<PageState>(!token ? "invalid" : "loading");
  const [tokenData, setTokenData] = useState<ValidateTokenResponse | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>(!token ? "No setup token provided. Please use the link from your email." : "");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Password strength validation
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    matches: password === confirmPassword && confirmPassword.length > 0,
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  // Validate token on mount
  useEffect(() => {
    if (!token) return;

    const validate = async () => {
      try {
        const result = await AccountSetupService.validateToken(token);
        if (result.isValid) {
          setTokenData(result);
          setPageState("valid");
        } else {
          setPageState("invalid");
          setErrorMessage(result.error || "This setup link is invalid or has expired.");
        }
      } catch (err: any) {
        setPageState("invalid");
        const msg = err?.response?.data?.error
          || err?.response?.data?.message
          || "Failed to validate setup token. The link may have expired.";
        setErrorMessage(msg);
      }
    };

    validate();
  }, [token]);

  // Handle form submission
  const handleActivate = useCallback(async () => {
    setValidationErrors([]);

    if (!isPasswordValid) {
      const errors: string[] = [];
      if (!passwordChecks.minLength) errors.push("Password must be at least 8 characters");
      if (!passwordChecks.hasUpper) errors.push("Must include an uppercase letter");
      if (!passwordChecks.hasLower) errors.push("Must include a lowercase letter");
      if (!passwordChecks.hasNumber) errors.push("Must include a number");
      if (!passwordChecks.hasSpecial) errors.push("Must include a special character");
      if (!passwordChecks.matches) errors.push("Passwords do not match");
      setValidationErrors(errors);
      return;
    }

    setPageState("activating");
    try {
      const result = await AccountSetupService.activateAccount({
        token,
        password,
        confirmPassword,
      });

      if (result.success) {
        setPageState("success");
      } else {
        setPageState("error");
        setErrorMessage(result.error || "Account activation failed.");
      }
    } catch (err: any) {
      setPageState("error");
      const msg = err?.response?.data?.error
        || err?.response?.data?.message
        || "An unexpected error occurred during activation.";
      setErrorMessage(msg);
    }
  }, [token, password, confirmPassword, isPasswordValid, passwordChecks]);

  // ── Loading state ──
  if (pageState === "loading") {
    return (
      <PageWrapper>
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Validating your setup link...</p>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  // ── Invalid / expired token ──
  if (pageState === "invalid") {
    return (
      <PageWrapper>
        <Card className="w-full max-w-md border-destructive/30 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="rounded-full bg-destructive/10 p-4">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Invalid Setup Link</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {errorMessage}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  // ── Success state ──
  if (pageState === "success") {
    return (
      <PageWrapper>
        <Card className="w-full max-w-md border-green-500/30 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Account Activated!</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Your password has been set successfully. You can now sign in with your credentials.
            </p>
            <div className="mt-2 rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{tokenData?.adminUsername}</span>
            </div>
            <Button className="mt-4 w-full max-w-[200px]" onClick={() => router.push("/login")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  // ── Error state (after failed activation) ──
  if (pageState === "error") {
    return (
      <PageWrapper>
        <Card className="w-full max-w-md border-destructive/30 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Activation Failed</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {errorMessage}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setPageState("valid")}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  // ── Main form (valid token) ──
  return (
    <PageWrapper>
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 rounded-full bg-primary/10 p-3">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Set Your Password</CardTitle>
          <CardDescription>
            Complete your account setup for{" "}
            <span className="font-medium text-foreground">{tokenData?.tenantName}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Account info */}
          <div className="rounded-lg bg-muted/30 border border-border/50 p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Organization:</span>
              <span className="font-medium text-foreground">{tokenData?.tenantName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Username:</span>
              <span className="font-medium text-foreground">{tokenData?.adminUsername}</span>
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="setup-password">Password</Label>
            <div className="relative">
              <Input
                id="setup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="pe-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password strength indicators */}
          {password.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <PasswordCheck label="8+ characters" ok={passwordChecks.minLength} />
              <PasswordCheck label="Uppercase" ok={passwordChecks.hasUpper} />
              <PasswordCheck label="Lowercase" ok={passwordChecks.hasLower} />
              <PasswordCheck label="Number" ok={passwordChecks.hasNumber} />
              <PasswordCheck label="Special char" ok={passwordChecks.hasSpecial} />
            </div>
          )}

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="setup-confirm">Confirm Password</Label>
            <div className="relative">
              <Input
                id="setup-confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="pe-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <PasswordCheck label="Passwords match" ok={passwordChecks.matches} />
            )}
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 space-y-1">
              {validationErrors.map((err, i) => (
                <p key={i} className="text-xs text-destructive flex items-center gap-1.5">
                  <XCircle className="h-3 w-3 shrink-0" />
                  {err}
                </p>
              ))}
            </div>
          )}

          {/* Submit button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!isPasswordValid}
            loading={pageState === "activating"}
            onClick={handleActivate}
          >
            {pageState !== "activating" && <Shield className="h-4 w-4 me-2" />}
            {pageState === "activating" ? "Activating..." : "Activate Account"}
          </Button>

          {/* Expiry note */}
          {tokenData?.expiresAt && (
            <p className="text-xs text-muted-foreground text-center">
              This link expires on{" "}
              {new Date(tokenData.expiresAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

// ── Helper components ──

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
      {/* Top actions */}
      <div className="absolute right-6 top-6 flex items-center gap-1 z-20">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-background border border-border shadow-sm">
          <img
            src="/app-logo.png"
            alt={`${BRAND.name} Logo`}
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </div>

      {children}

      {/* Footer */}
      <p className="mt-8 text-[11px] font-medium text-muted-foreground/50">
        © {new Date().getFullYear()} {BRAND.name}
      </p>
    </div>
  );
}

function PasswordCheck({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
      {ok ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
      )}
      {label}
    </div>
  );
}
