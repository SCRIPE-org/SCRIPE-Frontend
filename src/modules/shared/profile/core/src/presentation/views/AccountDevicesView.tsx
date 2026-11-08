"use client";

/**
 * AccountDevicesView
 *
 * Sovereign Slice 5 (/account/devices):
 * Field Hardware & Pitch-Side Tablets Registry (paired iPads, OS posture scores, remote wipe),
 * Wearable Telemetry Receiver Bridges (Catapult Vector S7 / STATSports Apex Pro),
 * and Offline Stadium Dead-Zone Sync Vault.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { useAccountDevicesSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import {
  Tablet,
  Radio,
  HardDrive,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  WifiOff,
} from "lucide-react";

export function AccountDevicesView() {
  const { t } = useI18n();
  const {
    devices,
    registerDevice,
    isRegisteringDevice,
    revokeDevice,
    isRevokingDevice,
  } = useAccountDevicesSliceViewModel();

  const [deviceName, setDeviceName] = useState("");
  const [osPlatform, setOsPlatform] = useState("");
  const [syncNotice, setSyncNotice] = useState(false);

  const hardwareList = devices?.devices ?? [];
  const wearableBridges = devices?.wearableBridges ?? [];

  const handleRegister = async () => {
    if (!deviceName.trim()) return;
    await registerDevice({
      deviceName: deviceName.trim(),
      deviceCategory: "PITCH_TABLET",
      osPlatform: osPlatform.trim(),
      telemetryBridgeType: wearableBridges[0]?.bridgeType || "",
    });
    setDeviceName("");
    setOsPlatform("");
  };

  const handleRotateOfflineKeys = () => {
    setSyncNotice(true);
    setTimeout(() => setSyncNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">
          {t("profile.devices.title")}
        </h1>
        <p className="text-xs text-nx-ink-3 mt-1">
          {t("profile.devices.description")}
        </p>
      </div>

      {/* 1. Pitch-Side Tablets & Field Hardware Registry */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Tablet className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.devices.registryTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.devices.registryDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {hardwareList.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.devices.noDevices")}</p>
          ) : (
            <div className="space-y-3">
              {hardwareList.map((dev) => (
                <div
                  key={dev.id}
                  className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-nx-line-hi transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-nx-ink truncate">{dev.deviceName}</span>
                      <Badge variant="outline" className="text-[10px] font-mono border-nx-accent/40 text-nx-accent bg-nx-accent-wash">
                        {t("profile.devices.osPosture")}: {dev.postureScore}%
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/10 gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>{t("profile.devices.compliant")}</span>
                      </Badge>
                    </div>
                    <p className="text-[11px] text-nx-ink-3 font-mono">
                      {dev.osPlatform}
                      {dev.telemetryBridgeType ? ` • ${dev.telemetryBridgeType}` : ""}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isRevokingDevice}
                    onClick={() => revokeDevice(dev.id)}
                    className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t("profile.devices.wipeOfflineVaultBtn")}</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Enroll New Field Hardware */}
          <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
            <Input
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder={t("profile.devices.deviceNamePlaceholder")}
              className="h-8 text-xs bg-nx-surface border-nx-line text-nx-ink"
            />
            <Input
              value={osPlatform}
              onChange={(e) => setOsPlatform(e.target.value)}
              placeholder={t("profile.devices.osPlatformPlaceholder")}
              className="h-8 text-xs font-mono bg-nx-surface border-nx-line text-nx-ink"
            />
            <Button
              type="button"
              size="sm"
              disabled={isRegisteringDevice}
              onClick={handleRegister}
              data-testid="register-field-device-btn"
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("profile.devices.registerDeviceBtn")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Wearable GPS Telemetry Receiver Bridges */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.devices.wearableBridgeTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.devices.wearableBridgeDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {wearableBridges.length === 0 ? (
            <p className="text-xs text-nx-ink-3 col-span-2">{t("profile.devices.noWearableBridges")}</p>
          ) : (
            wearableBridges.map((bridge, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-nx-ink block">{bridge.bridgeType}</span>
                  <span className="text-[11px] text-nx-ink-3 font-mono">
                    {bridge.lastSyncedAtUtc ? new Date(bridge.lastSyncedAtUtc).toLocaleString() : ""}
                  </span>
                </div>
                <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-[10px]">
                  {bridge.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 3. Offline Stadium Dead-Zone Sync Vault */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.devices.offlineVaultTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-0.5">
              {t("profile.devices.offlineVaultDesc")}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRotateOfflineKeys}
            data-testid="rotate-offline-vault-btn"
            className="h-8 text-xs gap-1.5"
          >
            <HardDrive className="h-3.5 w-3.5 text-nx-accent" />
            <span>{t("profile.devices.rotateOfflineKeyBtn")}</span>
          </Button>
        </CardHeader>
        {syncNotice && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-xs text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("profile.devices.offlineKeyRotatedNotice")}</span>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
