"use client";

import React from "react";
import { ClipboardCheck, Copy, KeyRound } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataExchangeGeneratedCredential } from "../../../domain/types";

export interface StudioEphemeralCredentialsCardProps {
  credentials: DataExchangeGeneratedCredential[];
  onCopyCredentials: () => void;
  onDismissCredentials: () => void;
}

/**
 * Sensitive one-time auto-generated credentials vault displayed upon User/Admin onboarding import.
 */
export function StudioEphemeralCredentialsCard({
  credentials,
  onCopyCredentials,
  onDismissCredentials,
}: StudioEphemeralCredentialsCardProps) {
  const { t } = useI18n();

  return (
    <Card className="space-y-3 border-destructive/35 bg-destructive/10 p-5 text-nx-ink">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-nx-danger shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-nx-ink">
              {t("dataExchange.results.credentialsWarningTitle")}
            </h4>
            <p className="text-xs text-nx-ink-2 mt-0.5">
              {t("dataExchange.results.credentialsWarningDesc")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCopyCredentials}
            className="h-8 text-xs border border-nx-line bg-nx-raised hover:bg-nx-raised-2"
          >
            <Copy className="me-1.5 h-3.5 w-3.5" />
            <span>{t("dataExchange.actions.copyCredentials")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDismissCredentials}
            className="h-8 text-xs border-nx-line"
          >
            <ClipboardCheck className="me-1.5 h-3.5 w-3.5" />
            <span>{t("dataExchange.actions.dismissCredentials")}</span>
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("dataExchange.dryRun.rowCol")}</TableHead>
            <TableHead>{t("dataExchange.results.credentialsEmail")}</TableHead>
            <TableHead>{t("dataExchange.results.credentialsUsername")}</TableHead>
            <TableHead>{t("dataExchange.results.credentialsPassword")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {credentials.map((cred) => (
            <TableRow key={`${cred.rowNumber}-${cred.email}`}>
              <TableCell className="font-mono tabular-nums text-xs">{cred.rowNumber}</TableCell>
              <TableCell dir="ltr" className="font-mono text-xs">{cred.email}</TableCell>
              <TableCell dir="ltr" className="font-mono text-xs">{cred.username}</TableCell>
              <TableCell dir="ltr" className="font-mono text-xs text-nx-danger font-semibold">
                {cred.oneTimePassword}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
