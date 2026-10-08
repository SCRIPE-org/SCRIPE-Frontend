"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@core/ui/table";
import { ShieldCheck, KeyRound, Cpu, Layers, Server, CheckCircle2 } from "lucide-react";
import type { TenantKeyStatus } from "../../domain/entities/TenantKeyStatus";
import type { MigrationSession } from "../../domain/entities/MigrationSession";
import { ClusterRewrapCard } from "./ClusterRewrapCard";

interface PlatformKeyringCardProps {
  status: TenantKeyStatus | null;
  activeSession?: MigrationSession | null;
  onStartClusterRewrap?: () => void;
  isStartingRewrap?: boolean;
  onCancelRewrap?: (sessionId: string) => void;
  isCancellingRewrap?: boolean;
}

/**
 * Documentation for PlatformKeyringCard
 */
export function PlatformKeyringCard({
  status,
  activeSession,
  onStartClusterRewrap,
  isStartingRewrap,
  onCancelRewrap,
  isCancellingRewrap,
}: PlatformKeyringCardProps) {
  const { t } = useI18n();

  const activeKeyId =
    status?.activeVersion && status.activeVersion > 0
      ? status.activeVersion
      : status?.currentPlatformKeyId && status.currentPlatformKeyId > 0
        ? status.currentPlatformKeyId
        : 1;
  const cipherSuite = status?.algorithm ?? "AES-256-GCM + HKDF-SHA256";
  const providerType = status?.providerType ?? "Environment Keyring (Local)";
  const minVersion = status?.minDecryptionVersion ?? 1;

  const catalogItems =
    status?.distribution && status.distribution.length > 0
      ? status.distribution
      : [{ platformKeyId: activeKeyId, tenantKeyVersion: 1, recordCount: 0, percentage: 100 }];

  return (
    <div className="space-y-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">
                  {t("customFieldsSecurity.platformKeyringTitle")}
                </CardTitle>
                <Badge
                  variant="default"
                  className="gap-1 bg-emerald-600 text-xs hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {t("customFieldsSecurity.operational")}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {t("customFieldsSecurity.platformKeyringDesc")}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="hidden font-mono text-xs sm:flex">
            {providerType}
          </Badge>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4 border-t border-border/50 pt-3 text-sm sm:grid-cols-4">
          <div className="rounded-lg border border-border/40 bg-muted/40 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>{t("customFieldsSecurity.masterKeyStatus")}</span>
            </div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {t("customFieldsSecurity.activeStatus")}
            </span>
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/40 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <KeyRound className="h-3.5 w-3.5 text-primary" />
              <span>{t("customFieldsSecurity.activeKeyId")}</span>
            </div>
            <span className="font-mono text-base font-semibold">#{activeKeyId}</span>
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/40 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              <span>{t("customFieldsSecurity.cipherSuite")}</span>
            </div>
            <span className="font-mono text-xs font-semibold">{cipherSuite}</span>
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/40 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>{t("customFieldsSecurity.isolationModel")}</span>
            </div>
            <span className="text-xs font-semibold">{t("customFieldsSecurity.dualEnvelope")}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-4 w-4 text-primary" />
                {t("customFieldsSecurity.keyCatalogTitle")}
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {t("customFieldsSecurity.keyCatalogDesc")}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-[11px]">
              {catalogItems.length} {catalogItems.length === 1 ? "Slot" : "Slots"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60 bg-muted/40">
                  <TableHead className="text-xs">{t("customFieldsSecurity.colKeyId")}</TableHead>
                  <TableHead className="text-xs">{t("customFieldsSecurity.colCipher")}</TableHead>
                  <TableHead className="text-xs">
                    {t("customFieldsSecurity.colMinVersion")}
                  </TableHead>
                  <TableHead className="text-xs">{t("customFieldsSecurity.colSource")}</TableHead>
                  <TableHead className="text-end text-xs">
                    {t("customFieldsSecurity.colStatus")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalogItems.map((item) => {
                  const isActive = item.platformKeyId === activeKeyId;
                  return (
                    <TableRow
                      key={item.platformKeyId}
                      className="transition-colors hover:bg-muted/15"
                    >
                      <TableCell className="px-4 py-3 font-mono text-xs font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-primary" />#{item.platformKeyId}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        AES-256-GCM
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        v{minVersion}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                        {providerType}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end">
                        {isActive ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-medium text-emerald-600"
                          >
                            {t("customFieldsSecurity.activeStatus")}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-border/60 text-[10px] text-muted-foreground"
                          >
                            {t("customFieldsSecurity.standbyStatus")}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {onStartClusterRewrap && (
        <ClusterRewrapCard
          activeSession={activeSession ?? null}
          onStartClusterRewrap={onStartClusterRewrap}
          isStartingRewrap={Boolean(isStartingRewrap)}
          onCancelRewrap={onCancelRewrap ?? (() => {})}
          isCancellingRewrap={Boolean(isCancellingRewrap)}
        />
      )}

      <div className="space-y-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2 font-medium">
          <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{t("customFieldsSecurity.architectureNoteTitle")}</span>
        </div>
        <p className="leading-relaxed text-muted-foreground dark:text-blue-200/80">
          {t("customFieldsSecurity.architectureNoteBody")}
        </p>
      </div>
    </div>
  );
}
