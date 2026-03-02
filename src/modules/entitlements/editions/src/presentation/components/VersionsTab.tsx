/**
 * Edition Versions Tab — Version history with create/publish/cancel actions
 * Pure UI matching SOLID ViewModel architecture rules
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { DatePicker } from "@core/ui/date-picker";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
import {
      Loader2, Plus, Rocket, XCircle, Clock, CheckCircle2, AlertCircle,
      GitBranch, Calendar, Percent
} from "lucide-react";
import { useVersionsViewModel } from "../viewmodels/useVersionsViewModel";

interface VersionsTabProps {
      editionId: string;
}

// Status badge color mapping
const STATUS_COLORS: Record<string, string> = {
      Draft: "bg-slate-500/10 text-slate-600 border-slate-500/30",
      Pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      Rolling: "bg-blue-500/10 text-blue-600 border-blue-500/30",
      Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      Canceled: "bg-red-500/10 text-red-600 border-red-500/30",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
      Draft: <AlertCircle className="h-3.5 w-3.5" />,
      Pending: <Clock className="h-3.5 w-3.5" />,
      Rolling: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      Completed: <CheckCircle2 className="h-3.5 w-3.5" />,
      Canceled: <XCircle className="h-3.5 w-3.5" />,
};

export function VersionsTab({ editionId }: VersionsTabProps) {
      const { t } = useI18n();
      const vm = useVersionsViewModel(editionId);

      if (vm.isLoading) {
            return (
                  <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
            );
      }

      return (
            <div className="space-y-4">
                  {/* ── Header ── */}
                  <div className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">{t("entitlements.editions.versions.title")}</h2>
                        <Badge variant="secondary" className="text-xs">
                              {vm.versions.length}
                        </Badge>
                  </div>

                  {/* ── Version List ── */}
                  {vm.versions.length === 0 ? (
                        <Card>
                              <CardContent className="py-8 text-center text-muted-foreground">
                                    <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p>{t("entitlements.editions.versions.empty") || "No versions yet. Create one to start tracking edition changes."}</p>
                              </CardContent>
                        </Card>
                  ) : (
                        <div className="space-y-2">
                              {vm.versions.map((v) => (
                                    <Card key={v.id} className="overflow-hidden">
                                          <CardContent className="py-3 px-4 space-y-2">
                                                {/* ── Version Row ── */}
                                                <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-3">
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                  v{v.versionNumber}
                                                            </Badge>
                                                            <Badge variant="outline" className={STATUS_COLORS[v.status] || ""}>
                                                                  <span className="flex items-center gap-1">
                                                                        {STATUS_ICONS[v.status]}
                                                                        {t(`entitlements.editions.versions.statuses.${v.status}`) || v.status}
                                                                  </span>
                                                            </Badge>
                                                            <Badge variant="secondary" className="text-xs">
                                                                  {t(`entitlements.editions.versions.strategies.${v.rolloutStrategy}`) || v.rolloutStrategy}
                                                            </Badge>
                                                            {v.changeNotes && (
                                                                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                                        {v.changeNotes}
                                                                  </span>
                                                            )}
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                  {new Date(v.createdAt).toLocaleDateString()}
                                                            </span>

                                                            {/* Publish button (Draft only) */}
                                                            {v.status === "Draft" && vm.publishVersionId !== v.id && (
                                                                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => vm.setPublishVersionId(v.id)}>
                                                                        <Rocket className="h-3 w-3" />
                                                                        {t("entitlements.editions.versions.publish") || "Publish"}
                                                                  </Button>
                                                            )}

                                                            {/* Cancel button (Pending/Rolling only) */}
                                                            {(v.status === "Pending" || v.status === "Rolling") && (
                                                                  <Button size="sm" variant="destructive" className="h-8 text-xs gap-1" onClick={() => vm.cancelMutation.mutate(v.id)} disabled={vm.cancelMutation.isPending}>
                                                                        {vm.cancelMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                                                        {t("common.cancel") || "Cancel"}
                                                                  </Button>
                                                            )}
                                                      </div>
                                                </div>

                                                {/* ── Publish Form (expanded for Draft versions) ── */}
                                                {v.status === "Draft" && vm.publishVersionId === v.id && (
                                                      <div className="border-t pt-3 mt-1 space-y-3">
                                                            {/* Strategy Selector */}
                                                            <div className="flex items-center gap-3">
                                                                  <Label className="text-xs font-medium min-w-[80px]">
                                                                        {t("entitlements.editions.versions.strategy") || "Strategy"}
                                                                  </Label>
                                                                  <Select value={vm.rolloutStrategy} onValueChange={vm.setRolloutStrategy}>
                                                                        <SelectTrigger className="w-[200px] h-8 text-xs">
                                                                              <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                              {["Immediate", "AtRenewal", "Scheduled", "Staged"].map(s => (
                                                                                    <SelectItem key={s} value={s}>
                                                                                          {t(`entitlements.editions.versions.strategies.${s}`) || s}
                                                                                    </SelectItem>
                                                                              ))}
                                                                        </SelectContent>
                                                                  </Select>
                                                            </div>

                                                            {/* Scheduled: DatePicker (Custom UI Component) */}
                                                            {vm.rolloutStrategy === "Scheduled" && (
                                                                  <div className="flex items-center gap-3">
                                                                        <Label className="text-xs font-medium min-w-[80px] flex items-center gap-1">
                                                                              <Calendar className="h-3.5 w-3.5" />
                                                                              {t("entitlements.editions.versions.scheduledAt") || "Schedule At"}
                                                                        </Label>
                                                                        <DatePicker
                                                                              id="version-scheduled-at"
                                                                              type="datetime-local"
                                                                              value={vm.scheduledAt}
                                                                              onChange={(val) => vm.setScheduledAt(val)}
                                                                              placeholder={t("entitlements.editions.versions.scheduledAt") || "Select Date & Time"}
                                                                              className="w-[280px]"
                                                                        />
                                                                  </div>
                                                            )}

                                                            {/* Staged: Canary percentage */}
                                                            {vm.rolloutStrategy === "Staged" && (
                                                                  <div className="flex items-center gap-3">
                                                                        <Label className="text-xs font-medium min-w-[80px] flex items-center gap-1">
                                                                              <Percent className="h-3.5 w-3.5" />
                                                                              {t("entitlements.editions.versions.canaryPercent") || "Canary %"}
                                                                        </Label>
                                                                        <Input
                                                                              type="number"
                                                                              className="w-[100px] h-8 text-xs"
                                                                              value={vm.canaryPercentage}
                                                                              onChange={(e) => vm.setCanaryPercentage(Number(e.target.value))}
                                                                              min={1}
                                                                              max={99}
                                                                        />
                                                                        <span className="text-xs text-muted-foreground">
                                                                              {t("entitlements.editions.versions.canaryHint") || "(1-99% of tenants)"}
                                                                        </span>
                                                                  </div>
                                                            )}

                                                            {/* Strategy description */}
                                                            <p className="text-xs text-muted-foreground italic">
                                                                  {vm.rolloutStrategy === "Immediate" && (t("entitlements.editions.versions.strategyHints.Immediate") || "Apply feature changes to all tenants immediately.")}
                                                                  {vm.rolloutStrategy === "AtRenewal" && (t("entitlements.editions.versions.strategyHints.AtRenewal") || "Apply when each tenant's subscription renews.")}
                                                                  {vm.rolloutStrategy === "Scheduled" && (t("entitlements.editions.versions.strategyHints.Scheduled") || "Apply at the scheduled date and time.")}
                                                                  {vm.rolloutStrategy === "Staged" && (t("entitlements.editions.versions.strategyHints.Staged") || "Gradually roll out to a percentage of tenants first.")}
                                                            </p>

                                                            {/* Action buttons */}
                                                            <div className="flex gap-2">
                                                                  <Button
                                                                        size="sm"
                                                                        className="h-8 text-xs gap-1 opacity-90 hover:opacity-100 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                        onClick={() => vm.publishMutation.mutate(v.id)}
                                                                        disabled={vm.publishMutation.isPending || !vm.canPublish}
                                                                  >
                                                                        {vm.publishMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3" />}
                                                                        {t("entitlements.editions.versions.publishNow") || "Publish Version"}
                                                                  </Button>
                                                                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => {
                                                                        vm.setPublishVersionId(null);
                                                                        vm.setRolloutStrategy("Immediate");
                                                                        vm.setScheduledAt("");
                                                                        vm.setCanaryPercentage(10);
                                                                  }}>
                                                                        {t("common.cancel") || "Cancel"}
                                                                  </Button>
                                                            </div>
                                                      </div>
                                                )}
                                          </CardContent>
                                    </Card>
                              ))}
                        </div>
                  )}
            </div>
      );
}
