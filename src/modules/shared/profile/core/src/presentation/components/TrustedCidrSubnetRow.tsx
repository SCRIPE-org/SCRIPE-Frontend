"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Trash2, Copy, Check, Network } from "lucide-react";
import type { SubnetEntry } from "../utils/cidr-allowlist.utils";

/** Props for {@link TrustedCidrSubnetRow}. */
export interface TrustedCidrSubnetRowProps {
  /** Parsed CIDR block and optional operator label. */
  subnet: SubnetEntry;
  /** Zero-based row index used for stable copy/remove test IDs. */
  index: number;
  /** Whether this row's CIDR was just copied to clipboard. */
  isCopied: boolean;
  /** Copies the subnet CIDR string to clipboard. */
  onCopy: (cidr: string, index: number) => void;
  /** Removes this subnet entry from the pending allowlist. */
  onRemove: (index: number) => void;
}

/**
 * Single CIDR allowlist entry row displaying IPv4/IPv6 family, allowed badge,
 * optional label, clipboard copy button, and delete action.
 */
export function TrustedCidrSubnetRow({
  subnet,
  index,
  isCopied,
  onCopy,
  onRemove,
}: TrustedCidrSubnetRowProps) {
  const { t } = useI18n();
  const isIpv6 = subnet.cidr.includes(":");

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-nx-line bg-nx-ground hover:border-nx-line-hi transition-colors gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-nx-raised border border-nx-line flex items-center justify-center text-nx-ink-2 shrink-0">
          <Network className="h-4 w-4 text-nx-accent" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-nx-ink select-all">
              {subnet.cidr}
            </span>
            <Badge
              variant="outline"
              className={`font-mono text-[9px] py-0 px-1.5 ${
                isIpv6
                  ? "border-info/30 bg-info/10 text-info font-semibold"
                  : "border-nx-line text-nx-ink-3"
              }`}
            >
              {isIpv6 ? "IPv6" : "IPv4"}
            </Badge>
            <Badge className="bg-success/15 text-success border border-success/30 text-[9px] font-semibold py-0 px-1.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span>{t("profile.security.cidrAllowedStatus")}</span>
            </Badge>
          </div>
          {subnet.label && (
            <p className="text-[11px] text-nx-ink-2 truncate mt-0.5">{subnet.label}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid={`copy-cidr-btn-${index}`}
          onClick={() => onCopy(subnet.cidr, index)}
          className="h-8 w-8 p-0 text-nx-ink-3 hover:text-nx-ink"
          title={t("profile.common.copy")}
        >
          {isCopied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid={`remove-cidr-btn-${index}`}
          onClick={() => onRemove(index)}
          className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          title={t("profile.common.delete")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
