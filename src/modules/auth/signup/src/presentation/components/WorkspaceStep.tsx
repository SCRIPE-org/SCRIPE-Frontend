"use client";

import { useCallback } from "react";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { ArrowLeft, ArrowRight, Globe, Loader2, Check, X } from "lucide-react";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";

interface WorkspaceStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
}

export function WorkspaceStep({ vm }: WorkspaceStepProps) {
  const { subdomainResult, isCheckingSubdomain } = vm;

  // Auto-generate subdomain from workspace name
  const handleNameChange = useCallback(
    (name: string) => {
      vm.updateField("workspaceName", name);
      // Auto-derive subdomain: lowercase, replace spaces with hyphens, strip special chars
      const auto = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 63);
      if (auto) {
        vm.checkSubdomain(auto);
      }
    },
    [vm]
  );

  const subdomainStatus = (() => {
    if (isCheckingSubdomain) return "checking";
    if (!subdomainResult) return "idle";
    if (subdomainResult.available) return "available";
    return "unavailable";
  })();

  const subdomainStatusIcon = {
    idle: null,
    checking: <Loader2 className="h-4 w-4 animate-spin" style={{ color: "rgba(245,242,255,0.4)" }} />,
    available: <Check className="h-4 w-4" style={{ color: "#10B981" }} />,
    unavailable: <X className="h-4 w-4" style={{ color: "#ef4444" }} />,
  }[subdomainStatus];

  return (
    <div style={{ animation: "sxScreenIn 0.4s ease-out" }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(168,85,247,0.15) 0%, rgba(99,102,241,0.1) 100%)",
            border: "1px solid rgba(168,85,247,0.2)",
            animation: "sxPop 0.5s ease-out 0.15s both",
          }}
        >
          <Globe className="h-6 w-6" style={{ color: "#C4B5FD" }} />
        </div>

        <h1
          className="text-xl font-bold"
          style={{
            background: "linear-gradient(180deg, #F5F2FF 0%, #C7B8F0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Set up your workspace
        </h1>
        <p className="mt-2 text-sm" style={{ color: "rgba(245,242,255,0.62)" }}>
          Your team&apos;s home on Scripe
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          vm.submitWorkspace();
        }}
        className="space-y-4"
      >
        {/* Workspace Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signup-workspace"
            className="text-xs font-medium"
            style={{ color: "rgba(245,242,255,0.62)" }}
          >
            Organization name
          </Label>
          <Input
            id="signup-workspace"
            type="text"
            placeholder="Acme Inc."
            value={vm.wizardData.workspaceName}
            onChange={(e) => handleNameChange(e.target.value)}
            autoFocus
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
              color: "#F5F2FF",
            }}
          />
        </div>

        {/* Subdomain */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signup-subdomain"
            className="text-xs font-medium"
            style={{ color: "rgba(245,242,255,0.62)" }}
          >
            Workspace URL
          </Label>
          <div className="flex items-center gap-0">
            <div className="relative flex-1">
              <Input
                id="signup-subdomain"
                type="text"
                placeholder="acme"
                value={vm.wizardData.subdomain}
                onChange={(e) => vm.checkSubdomain(e.target.value.toLowerCase())}
                className="h-11 rounded-r-none pr-9"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: subdomainStatus === "available"
                    ? "rgba(16,185,129,0.4)"
                    : subdomainStatus === "unavailable"
                      ? "rgba(239,68,68,0.4)"
                      : "rgba(255,255,255,0.08)",
                  color: "#F5F2FF",
                  transition: "border-color 0.2s",
                }}
              />
              {/* Status icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {subdomainStatusIcon}
              </div>
            </div>
            <div
              className="flex h-11 items-center rounded-r-lg border border-l-0 px-3 text-xs font-medium"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "rgba(245,242,255,0.4)",
              }}
            >
              .scripe.app
            </div>
          </div>

          {/* Subdomain status message */}
          {subdomainResult && !subdomainResult.available && (
            <p
              className="text-[11px] font-medium"
              style={{ color: "#fca5a5", animation: "sxRise 0.2s ease-out" }}
            >
              {subdomainResult.reason === "taken"
                ? "This subdomain is already taken."
                : subdomainResult.reason === "reserved"
                  ? "This subdomain is reserved."
                  : "Invalid format. Use lowercase letters, numbers, and hyphens."}
              {subdomainResult.suggestion && (
                <Button
                  variant="link"
                  type="button"
                  onClick={() => vm.checkSubdomain(subdomainResult.suggestion!)}
                  className="ml-1 h-auto p-0 underline hover:no-underline"
                  style={{ color: "#C4B5FD" }}
                >
                  Try &quot;{subdomainResult.suggestion}&quot;?
                </Button>
              )}
            </p>
          )}
          {subdomainStatus === "available" && vm.wizardData.subdomain && (
            <p
              className="text-[11px] font-medium"
              style={{ color: "#10B981", animation: "sxRise 0.2s ease-out" }}
            >
              ✓ {vm.wizardData.subdomain}.scripe.app is available!
            </p>
          )}
        </div>

        {/* Error */}
        {vm.error && (
          <div
            className="rounded-lg px-3 py-2 text-xs font-medium"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#fca5a5",
              animation: "sxRise 0.3s ease-out",
            }}
          >
            {vm.error}
          </div>
        )}

        {/* Actions */}
        <Button
          type="submit"
          disabled={
            vm.isLoading ||
            !vm.wizardData.workspaceName.trim() ||
            vm.wizardData.subdomain.length < 3 ||
            (subdomainResult !== null && !subdomainResult.available)
          }
          className="relative h-12 w-full overflow-hidden rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60"
          style={{
            background: "linear-gradient(180deg, #A855F7 0%, #7C3AED 40%, #4F46E5 75%, #3B82F6 100%)",
            boxShadow: "0 4px 15px -3px rgba(124,58,237,0.4)",
          }}
        >
          {vm.isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              Create workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            type="button"
            onClick={vm.goBack}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: "rgba(245,242,255,0.55)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
        </div>
      </form>
    </div>
  );
}
