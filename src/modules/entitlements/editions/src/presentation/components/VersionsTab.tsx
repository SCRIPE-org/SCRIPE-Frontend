/**
 * Edition Versions Tab — Version history with create/publish/cancel actions
 */
"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
import {
      Loader2, Plus, Rocket, XCircle, Clock, CheckCircle2, AlertCircle,
      GitBranch, ChevronDown, ChevronRight
} from "lucide-react";
import type { EditionVersionModel } from "../../data/services/EditionService";

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
      const { success, error: toastError } = useEnhancedToast();
      const queryClient = useQueryClient();
      const { editionService } = entitlementsContainer;

      const [showCreateForm, setShowCreateForm] = useState(false);
      const [changeNotes, setChangeNotes] = useState("");
      const [publishVersionId, setPublishVersionId] = useState<string | null>(null);
      const [rolloutStrategy, setRolloutStrategy] = useState("Immediate");

      // ── Fetch versions ──
      const { data: versions, isLoading } = useQuery({
            queryKey: ["entitlements", "editions", editionId, "versions"],
            queryFn: () => editionService.getVersions(editionId),
            enabled: !!editionId,
      });

      // ── Create version mutation ──
      const createMutation = useMutation({
            mutationFn: () => editionService.createVersion(editionId, changeNotes || undefined),
            onSuccess: () => {
                  success({ title: t("entitlements.editions.versions.created") || "Version Created", description: t("entitlements.editions.versions.createdDesc") || "Feature snapshot saved as a new draft version." });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId, "versions"] });
                  setShowCreateForm(false);
                  setChangeNotes("");
            },
            onError: (err) => toastError({ title: "Error", description: err instanceof Error ? err.message : "Failed to create version" }),
      });

      // ── Publish version mutation ──
      const publishMutation = useMutation({
            mutationFn: (versionId: string) => editionService.publishVersion(editionId, versionId, { rolloutStrategy }),
            onSuccess: () => {
                  success({ title: t("entitlements.editions.versions.published") || "Version Published", description: t("entitlements.editions.versions.publishedDesc") || "Rollout started." });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId, "versions"] });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
                  setPublishVersionId(null);
            },
            onError: (err) => toastError({ title: "Error", description: err instanceof Error ? err.message : "Failed to publish version" }),
      });

      // ── Cancel version mutation ──
      const cancelMutation = useMutation({
            mutationFn: (versionId: string) => editionService.cancelVersion(editionId, versionId),
            onSuccess: () => {
                  success({ title: t("entitlements.editions.versions.canceled") || "Version Canceled" });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId, "versions"] });
            },
            onError: (err) => toastError({ title: "Error", description: err instanceof Error ? err.message : "Failed to cancel version" }),
      });

      if (isLoading) {
            return (
                  <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
            );
      }

      return (
            <div className="space-y-4">
                  {/* ── Header ── */}
                  <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                              <GitBranch className="h-5 w-5 text-primary" />
                              <h2 className="text-lg font-semibold">{t("entitlements.editions.versions.title") || "Version History"}</h2>
                              <Badge variant="secondary" className="text-xs">
                                    {versions?.length ?? 0}
                              </Badge>
                        </div>
                        <Button
                              size="sm"
                              onClick={() => setShowCreateForm(!showCreateForm)}
                              className="gap-1 gradient-primary"
                        >
                              <Plus className="h-4 w-4" />
                              {t("entitlements.editions.versions.create") || "Create Version"}
                        </Button>
                  </div>

                  {/* ── Create Form ── */}
                  {showCreateForm && (
                        <Card className="border-dashed border-primary/40">
                              <CardContent className="pt-4 space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                          {t("entitlements.editions.versions.createDesc") || "Snapshot the current feature values into a new draft version."}
                                    </p>
                                    <Input
                                          placeholder={t("entitlements.editions.versions.changeNotesPlaceholder") || "What changed in this version..."}
                                          value={changeNotes}
                                          onChange={(e) => setChangeNotes(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                          <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="gap-1">
                                                {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                {t("entitlements.editions.versions.snapshot") || "Snapshot Features"}
                                          </Button>
                                          <Button size="sm" variant="ghost" onClick={() => setShowCreateForm(false)}>
                                                {t("common.cancel") || "Cancel"}
                                          </Button>
                                    </div>
                              </CardContent>
                        </Card>
                  )}

                  {/* ── Version List ── */}
                  {(!versions || versions.length === 0) ? (
                        <Card>
                              <CardContent className="py-8 text-center text-muted-foreground">
                                    <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p>{t("entitlements.editions.versions.empty") || "No versions yet. Create one to start tracking edition changes."}</p>
                              </CardContent>
                        </Card>
                  ) : (
                        <div className="space-y-2">
                              {versions.map((v) => (
                                    <Card key={v.id} className="overflow-hidden">
                                          <CardContent className="py-3 px-4">
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
                                                            {v.status === "Draft" && (
                                                                  publishVersionId === v.id ? (
                                                                        <div className="flex items-center gap-2">
                                                                              <Select value={rolloutStrategy} onValueChange={setRolloutStrategy}>
                                                                                    <SelectTrigger className="w-[150px] h-8 text-xs">
                                                                                          <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                          {["Immediate", "AtRenewal", "Scheduled", "Staged"].map(s => (
                                                                                                <SelectItem key={s} value={s}>{t(`entitlements.editions.versions.strategies.${s}`) || s}</SelectItem>
                                                                                          ))}
                                                                                    </SelectContent>
                                                                              </Select>
                                                                              <Button size="sm" variant="default" className="h-8 text-xs gap-1" onClick={() => publishMutation.mutate(v.id)} disabled={publishMutation.isPending}>
                                                                                    {publishMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3" />}
                                                                                    {t("entitlements.editions.versions.publish") || "Go"}
                                                                              </Button>
                                                                              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setPublishVersionId(null)}>
                                                                                    {t("common.cancel") || "Cancel"}
                                                                              </Button>
                                                                        </div>
                                                                  ) : (
                                                                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setPublishVersionId(v.id)}>
                                                                              <Rocket className="h-3 w-3" />
                                                                              {t("entitlements.editions.versions.publish") || "Publish"}
                                                                        </Button>
                                                                  )
                                                            )}

                                                            {/* Cancel button (Pending/Rolling only) */}
                                                            {(v.status === "Pending" || v.status === "Rolling") && (
                                                                  <Button size="sm" variant="destructive" className="h-8 text-xs gap-1" onClick={() => cancelMutation.mutate(v.id)} disabled={cancelMutation.isPending}>
                                                                        {cancelMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                                                        {t("common.cancel") || "Cancel"}
                                                                  </Button>
                                                            )}
                                                      </div>
                                                </div>
                                          </CardContent>
                                    </Card>
                              ))}
                        </div>
                  )}
            </div>
      );
}
