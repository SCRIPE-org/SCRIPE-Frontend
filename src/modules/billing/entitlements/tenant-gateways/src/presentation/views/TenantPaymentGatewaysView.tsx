// FILE-EXCEPTION: file length
"use client";

import { useState } from "react";
import {
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck,
  Trash2,
  Plus,
  Settings2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { Separator } from "@core/ui/separator";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
import {
  useTenantGatewaysViewModel,
  AVAILABLE_GATEWAYS,
} from "../viewmodels/useTenantGatewaysViewModel";
import type { TenantGateway } from "../../domain/entities/TenantGateway";
import { formatDateTimeUtc } from "@core/common/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  CreditCard,
  Wallet,
  Banknote,
};

function GatewayIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? CreditCard;
  return <Icon className={className} />;
}

/**
 * TenantPaymentGatewaysView — Full-page view for tenant admins
 * to configure, verify, and manage their own payment gateway credentials.
 */
export function TenantPaymentGatewaysView() {
  const { t } = useI18n();
  const vm = useTenantGatewaysViewModel();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (vm.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 p-1">
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("entitlements.tenantGateways.title")}
            </h1>
            <p className="mt-1 text-nx-ink-2">{t("entitlements.tenantGateways.subtitle")}</p>
          </div>
        </div>

        {/* ── Configured Gateways Grid ── */}
        {vm.gateways.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {vm.gateways.map((gw: TenantGateway) => (
              <GatewayCard
                key={gw.id}
                gateway={gw}
                onEdit={() => vm.openConfigureForm(gw.gateway, true)}
                onVerify={() => vm.verifyGateway(gw.gateway)}
                onDelete={() => setDeleteTarget(gw.gateway)}
                isVerifying={vm.isVerifying(gw.gateway)}
              />
            ))}
          </div>
        )}

        {/* ── Add Gateway Section ── */}
        {vm.availableToAdd.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                {t("entitlements.tenantGateways.addNew")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {vm.availableToAdd.map((def) => (
                  <Card
                    key={def.type}
                    className="group cursor-pointer border-dashed transition-[border-color] duration-nx-standard ease-nx-enter hover:border-[color:color-mix(in_srgb,var(--nx-accent)_50%,transparent)] motion-reduce:transition-none"
                    onClick={() => vm.openConfigureForm(def.type)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-nx-raised transition-[background-color] duration-nx-micro ease-nx-enter group-hover:bg-nx-accent-wash motion-reduce:transition-none">
                          <GatewayIcon
                            name={def.icon}
                            className="h-5 w-5 text-nx-ink-3 transition-[color] duration-nx-micro ease-nx-enter group-hover:text-nx-accent motion-reduce:transition-none"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-base">{def.label}</CardTitle>
                          <CardDescription className="text-xs">{def.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 transition-[color,border-color] duration-nx-micro ease-nx-enter group-hover:border-[color:color-mix(in_srgb,var(--nx-accent)_50%,transparent)] group-hover:text-nx-accent motion-reduce:transition-none"
                      >
                        <Plus className="h-4 w-4" />
                        {t("entitlements.tenantGateways.configure")}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Empty State ── */}
        {vm.gateways.length === 0 && vm.availableToAdd.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="mb-4 h-12 w-12 text-[color:color-mix(in_srgb,var(--nx-ink-3)_50%,transparent)]" />
              <h3 className="text-lg font-medium">{t("entitlements.tenantGateways.noGateways")}</h3>
              <p className="mt-1 max-w-sm text-nx-ink-2">
                {t("entitlements.tenantGateways.noGatewaysDesc")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Configure Dialog ── */}
        <ConfigureDialog
          formState={vm.formState}
          onClose={vm.closeForm}
          onSubmit={vm.configureGateway}
          isSubmitting={vm.isConfiguring}
          error={vm.configureError}
        />

        {/* ── Delete Confirmation ── */}
        <AlertDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("entitlements.tenantGateways.removeTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("entitlements.tenantGateways.removeDesc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (deleteTarget) {
                    await vm.removeGateway(deleteTarget);
                    setDeleteTarget(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {vm.isRemoving ? (
                  <LoadingSpinner size="inline" className="me-2" />
                ) : (
                  <Trash2 className="me-2 h-4 w-4" />
                )}
                {t("common.remove")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

/** ── Gateway Card (Configured) ── */
function GatewayCard({
  gateway,
  onEdit,
  onVerify,
  onDelete,
  isVerifying,
}: {
  gateway: TenantGateway;
  onEdit: () => void;
  onVerify: () => void;
  onDelete: () => void;
  isVerifying: boolean;
}) {
  const { t } = useI18n();

  return (
    <Card className="relative overflow-hidden">
      {/* Status stripe */}
      <div
        className={`absolute end-0 start-0 top-0 h-1 ${
          gateway.isVerified && gateway.isEnabled
            ? "bg-success"
            : !gateway.isEnabled
              ? "bg-[color:color-mix(in_srgb,var(--nx-ink-3)_30%,transparent)]"
              : "bg-warning"
        }`}
      />

      <CardHeader className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-nx-raised">
              <GatewayIcon name={gateway.iconName} className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                {gateway.gatewayLabel}
                {gateway.isTestMode && (
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0 font-mono text-[10px] uppercase tracking-wider"
                  >
                    Test
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {gateway.gateway}
                {gateway.merchantId && ` · ${gateway.merchantId}`}
              </CardDescription>
            </div>
          </div>

          <Badge
            variant={
              gateway.isVerified && gateway.isEnabled
                ? "default"
                : !gateway.isEnabled
                  ? "secondary"
                  : "destructive"
            }
            className={`gap-1 ${
              gateway.isVerified && gateway.isEnabled
                ? "border-success/20 bg-success/10 text-success"
                : ""
            }`}
          >
            {gateway.isVerified && gateway.isEnabled ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {t(gateway.statusText)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info row */}
        {gateway.lastVerifiedAt && (
          <p className="text-xs text-nx-ink-3">
            {t("entitlements.tenantGateways.lastVerified")}:{" "}
            {formatDateTimeUtc(gateway.lastVerifiedAt)}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
                <Settings2 className="h-3.5 w-3.5" />
                {t("entitlements.tenantGateways.editCredentials")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("entitlements.tenantGateways.editTooltip")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onVerify}
                disabled={isVerifying}
                className="gap-1.5"
              >
                {isVerifying ? (
                  <LoadingSpinner size="inline" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                {t("entitlements.tenantGateways.verify")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("entitlements.tenantGateways.verifyTooltip")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="gap-1.5 text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("entitlements.tenantGateways.removeTooltip")}</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}

/** ── Configure Dialog ── */
function ConfigureDialog({
  formState,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: {
  formState: { isOpen: boolean; gatewayType: string; isEditing: boolean };
  onClose: () => void;
  onSubmit: (data: {
    gatewayType: string;
    apiKey: string;
    secretKey: string;
    webhookSecret?: string;
    merchantId?: string;
    displayLabel?: string;
    isTestMode?: boolean;
  }) => Promise<unknown>;
  isSubmitting: boolean;
  error: Error | null;
}) {
  const { t } = useI18n();
  const gatewayDef = AVAILABLE_GATEWAYS.find((g) => g.type === formState.gatewayType);

  const [fields, setFields] = useState<Record<string, string>>({});
  const [isTestMode, setIsTestMode] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<number>(1); // 1: Instructions, 2: Credentials, 3: Verify & Save

  const resetForm = () => {
    setFields({});
    setIsTestMode(false);
    setShowSecrets({});
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayDef) return;

    await onSubmit({
      gatewayType: formState.gatewayType,
      apiKey: fields.apiKey ?? "",
      secretKey: fields.secretKey ?? "",
      webhookSecret: fields.webhookSecret || undefined,
      merchantId: fields.merchantId || undefined,
      displayLabel: fields.displayLabel || undefined,
      isTestMode,
    });
    resetForm();
  };

  if (!gatewayDef) return null;

  return (
    <Dialog
      open={formState.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GatewayIcon name={gatewayDef.icon} className="h-5 w-5" />
            {formState.isEditing
              ? t("entitlements.tenantGateways.editTitle", { gateway: gatewayDef.label })
              : t("entitlements.tenantGateways.configureTitle", { gateway: gatewayDef.label })}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && t("entitlements.tenantGateways.wizard.step1Desc")}
            {step === 2 && t("entitlements.tenantGateways.wizard.step2Desc")}
            {step === 3 && t("entitlements.tenantGateways.wizard.step3Desc")}
          </DialogDescription>
        </DialogHeader>

        {/* Wizard Progress */}
        {!formState.isEditing && (
          <div className="mb-4 flex items-center justify-between px-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step === s ? "bg-nx-accent-fill text-nx-on-fill" : step > s ? "bg-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] text-nx-accent" : "bg-nx-raised text-nx-ink-3"}`}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {step === 1 && !formState.isEditing && (
            <div className="space-y-4 rounded-nx-md bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] p-4 text-sm text-nx-ink-2">
              <p>{t("entitlements.tenantGateways.wizard.intro", { gateway: gatewayDef.label })}</p>
              <ol className="list-decimal space-y-2 ps-5">
                <li>
                  {t("entitlements.tenantGateways.wizard.step1", { gateway: gatewayDef.label })}
                </li>
                <li>{t("entitlements.tenantGateways.wizard.step2")}</li>
                <li>{t("entitlements.tenantGateways.wizard.step3")}</li>
                <li>{t("entitlements.tenantGateways.wizard.step4")}</li>
              </ol>
            </div>
          )}

          {(step === 2 || formState.isEditing) && (
            <>
              {/* Display Label */}
              <div className="space-y-2">
                <Label htmlFor="displayLabel">
                  {t("entitlements.tenantGateways.displayLabel")}
                </Label>
                <Input
                  id="displayLabel"
                  placeholder={gatewayDef.label}
                  value={fields.displayLabel ?? ""}
                  onChange={(e) => setFields((f) => ({ ...f, displayLabel: e.target.value }))}
                />
              </div>

              {/* Gateway-specific fields */}
              {gatewayDef.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="flex items-center gap-1">
                    {field.label}
                    {!("optional" in field && field.optional) && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.key}
                      type={
                        "secret" in field && field.secret && !showSecrets[field.key]
                          ? "password"
                          : "text"
                      }
                      placeholder={field.placeholder}
                      value={fields[field.key] ?? ""}
                      onChange={(e) => setFields((f) => ({ ...f, [field.key]: e.target.value }))}
                      required={!("optional" in field && field.optional)}
                      className="pe-10"
                    />
                    {"secret" in field && field.secret && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute end-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowSecrets((s) => ({ ...s, [field.key]: !s[field.key] }))
                        }
                      >
                        {showSecrets[field.key] ? (
                          <EyeOff className="h-4 w-4 text-nx-ink-3" />
                        ) : (
                          <Eye className="h-4 w-4 text-nx-ink-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Test Mode Toggle */}
              <div className="flex items-center justify-between rounded-nx-md border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    {t("entitlements.tenantGateways.testMode")}
                  </Label>
                  <p className="text-xs text-nx-ink-3">
                    {t("entitlements.tenantGateways.testModeDesc")}
                  </p>
                </div>
                <Switch checked={isTestMode} onCheckedChange={setIsTestMode} />
              </div>
            </>
          )}

          {step === 3 && !formState.isEditing && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-nx-accent-wash">
                <ShieldCheck className="h-6 w-6 text-nx-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {t("entitlements.tenantGateways.wizard.readyTitle")}
                </h3>
                <p className="mt-1 max-w-[280px] text-sm text-nx-ink-2">
                  {t("entitlements.tenantGateways.wizard.readyDesc", { gateway: gatewayDef.label })}
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-nx-sm bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error.message}</p>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                resetForm();
              }}
            >
              {t("common.cancel")}
            </Button>

            {!formState.isEditing && step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                {t("common.back")}
              </Button>
            )}

            {!formState.isEditing && step < 3 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                {t("common.next")}
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <LoadingSpinner size="inline" />}
                {formState.isEditing
                  ? t("entitlements.tenantGateways.update")
                  : t("entitlements.tenantGateways.saveAndConnect")}
              </Button>
            )}
          </DialogFooter>
        </form>

        {/* Docs link */}
        <div className="mt-2 border-t pt-3">
          <a
            href={`https://docs.${formState.gatewayType.toLowerCase()}.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-nx-ink-3 transition-[color] duration-nx-micro ease-nx-enter hover:text-nx-accent motion-reduce:transition-none"
          >
            <ExternalLink className="h-3 w-3" />
            {t("entitlements.tenantGateways.docsLink", { gateway: gatewayDef.label })}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
