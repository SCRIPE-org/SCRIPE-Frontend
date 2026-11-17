"use client";

import React from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Eye,
  MapPin,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Progress } from "@core/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { Separator } from "@core/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { cn } from "@core/common/utils";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import {
  ACADEMY_COACH_OPTIONS,
  GUARDIAN_NOTIFICATION_SAMPLES,
} from "../mock-data/academy-scenario.data";
import type {
  ExecutionPhase,
  ProposedActionItem,
  SessionReassignmentRow,
} from "../types";

interface AcademyCoachPlanCardProps {
  sessions: SessionReassignmentRow[];
  expandedSessionId: string | null;
  onToggleExpandSession: (id: string | null) => void;
  isEditingPlan: boolean;
  onToggleEditPlan: () => void;
  onUpdateReplacement: (sessionId: string, replacementId: string) => void;
  proposedActions: ProposedActionItem[];
  onToggleAction: (actionId: ProposedActionItem["id"]) => void;
  executionPhase: ExecutionPhase;
  executionStepIndex: number;
  onApprove: () => void;
  isPlanReviewOpen: boolean;
  onSetPlanReviewOpen: (open: boolean) => void;
}

export function AcademyCoachPlanCard({
  sessions,
  expandedSessionId,
  onToggleExpandSession,
  isEditingPlan,
  onToggleEditPlan,
  onUpdateReplacement,
  proposedActions,
  onToggleAction,
  executionPhase,
  executionStepIndex,
  onApprove,
  isPlanReviewOpen,
  onSetPlanReviewOpen,
}: AcademyCoachPlanCardProps) {
  const { tc, language, direction } = useCopilotI18n();
  const isAr = language === "ar";

  const coachById = new Map(ACADEMY_COACH_OPTIONS.map((c) => [c.id, c]));
  const hasEnabledAction = proposedActions.some((a) => a.enabled);
  const reassignedCount = sessions.filter((s) => s.status === "available").length;
  const unresolvedCount = sessions.filter((s) => s.status === "conflict").length;
  const notifyCount = sessions
    .filter((s) => s.status === "available")
    .reduce((sum, s) => sum + s.guardiansCount, 0);

  const executionProgressValue =
    executionPhase === "completed"
      ? 100
      : executionStepIndex === 1
        ? 34
        : executionStepIndex === 2
          ? 68
          : executionStepIndex >= 3
            ? 92
            : 0;

  const executionStepLabel =
    executionStepIndex <= 1
      ? tc("academy.execStep1")
      : executionStepIndex === 2
        ? tc("academy.execStep2")
        : tc("academy.execStep3");

  return (
    <div className="space-y-3" dir={direction} data-testid="academy-coach-plan-card">
      {/* Stage 3: Impacted Sessions Interactive Table */}
      <Card className="border-nx-line bg-nx-surface">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-nx-line px-3.5 py-2.5">
          <CardTitle className="text-xs font-semibold text-nx-ink">
            {tc("academy.tableTitle")}
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {sessions.length}
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-nx-line bg-nx-raised hover:bg-nx-raised">
                <TableHead className="h-9 px-3 text-[11px] font-semibold text-nx-ink-3">
                  {tc("academy.colSession")}
                </TableHead>
                <TableHead className="h-9 px-2 text-[11px] font-semibold text-nx-ink-3">
                  {tc("academy.colCurrentCoach")}
                </TableHead>
                <TableHead className="h-9 px-2 text-[11px] font-semibold text-nx-ink-3">
                  {tc("academy.colReplacement")}
                </TableHead>
                <TableHead className="h-9 px-3 text-end text-[11px] font-semibold text-nx-ink-3">
                  {tc("academy.colStatus")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((row) => {
                const isExpanded = expandedSessionId === row.id;
                const replacementCoach = coachById.get(row.selectedReplacementId);
                const replacementLabel = replacementCoach
                  ? isAr
                    ? replacementCoach.nameAr
                    : replacementCoach.nameEn
                  : tc("academy.needsReview");

                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      clickable
                      selected={isExpanded}
                      onClick={() => onToggleExpandSession(isExpanded ? null : row.id)}
                      data-testid={`academy-session-row-${row.id}`}
                      className="border-b border-nx-line text-xs"
                    >
                      <TableCell className="px-3 py-2.5 font-medium text-nx-ink">
                        <div className="flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" />
                          )}
                          <span>{tc(row.sessionTitleKey)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-2.5 text-nx-ink-2">
                        {isAr ? row.currentCoachAr : row.currentCoachEn}
                      </TableCell>
                      <TableCell
                        className="px-2 py-2.5"
                        onClick={(e) => {
                          if (isEditingPlan) e.stopPropagation();
                        }}
                      >
                        {isEditingPlan && executionPhase !== "completed" ? (
                          <Select
                            value={row.selectedReplacementId}
                            onValueChange={(val) => onUpdateReplacement(row.id, val)}
                          >
                            <SelectTrigger
                              aria-label={tc(row.sessionTitleKey)}
                              className="h-7 min-w-[118px] px-2 text-[11px]"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ACADEMY_COACH_OPTIONS.map((coach) => (
                                <SelectItem key={coach.id} value={coach.id} className="text-xs">
                                  {isAr ? coach.nameAr : coach.nameEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className={cn(
                              "font-medium",
                              row.status === "conflict" ? "text-nx-warning-strong" : "text-nx-ink"
                            )}
                          >
                            {replacementLabel}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-end">
                        <Badge
                          variant={row.status === "available" ? "success" : "warning"}
                          className="text-[10px]"
                        >
                          {row.status === "available"
                            ? tc("academy.statusAvailable")
                            : tc("academy.statusConflict")}
                        </Badge>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="border-b border-nx-line bg-nx-raised/60 hover:bg-nx-raised/60">
                        <TableCell colSpan={4} className="px-3.5 py-2.5">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-nx-ink-2">
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Clock className="h-3 w-3 text-nx-ink-3" aria-hidden="true" />
                              {row.timeRange}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-nx-ink-3" aria-hidden="true" />
                              {tc("academy.pitchLabel")}: {isAr ? row.pitchAr : row.pitchEn}
                            </span>
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Users className="h-3 w-3 text-nx-ink-3" aria-hidden="true" />
                              {row.athletesCount} {tc("academy.athletesLabel")} •{" "}
                              {row.guardiansCount} {tc("academy.guardiansLabel")}
                            </span>
                          </div>
                          {row.status === "conflict" && row.conflictReasonKey && (
                            <p className="mt-2 flex items-start gap-1.5 rounded-nx-sm border border-warning-strong/30 bg-warning/10 px-2.5 py-1.5 text-[11px] text-nx-ink">
                              <AlertTriangle
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nx-warning-strong"
                                aria-hidden="true"
                              />
                              <span>{tc(row.conflictReasonKey)}</span>
                            </p>
                          )}
                          {row.id === "sess-u16" && row.status === "available" && (
                            <p className="mt-2 text-[11px] font-medium text-success">
                              {tc("academy.resolvedNote")}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stage 4: Action Preview & Human Approval Gate */}
      <Card className="border-nx-line bg-nx-surface">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-nx-line px-3.5 py-2.5">
          <CardTitle className="text-xs font-semibold text-nx-ink">
            {tc("academy.proposedActionsTitle")}
          </CardTitle>
          <Badge variant="outline" className="gap-1 text-[10px] text-nx-ink-2">
            <ShieldAlert className="h-3 w-3 text-nx-warning-strong" aria-hidden="true" />
            <span>{tc("academy.requiresApprovalBadge")}</span>
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3 p-3.5">
          <div className="space-y-2">
            {proposedActions.map((action) => {
              const checkboxId = `copilot-action-${action.id}`;
              return (
                <div
                  key={action.id}
                  className={cn(
                    "flex items-start gap-2.5 rounded-nx-md border p-2.5 transition-colors duration-nx-micro",
                    action.enabled
                      ? "border-nx-line-hi bg-nx-raised"
                      : "border-nx-line bg-nx-ground opacity-80",
                    executionPhase !== "idle" && "pointer-events-none opacity-85"
                  )}
                >
                  <Checkbox
                    id={checkboxId}
                    checked={action.enabled}
                    disabled={executionPhase !== "idle"}
                    onCheckedChange={() => onToggleAction(action.id)}
                    className="mt-0.5"
                  />
                  <Label htmlFor={checkboxId} className="min-w-0 flex-1 cursor-pointer">
                    <span className="block text-xs font-medium text-nx-ink">
                      {tc(action.labelKey)}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-normal leading-relaxed text-nx-ink-3">
                      {tc(action.descriptionKey)}
                    </span>
                  </Label>
                </div>
              );
            })}
          </div>

          {executionPhase === "executing" && (
            <div className="space-y-1.5 rounded-nx-md border border-nx-line bg-nx-raised p-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-nx-ink">
                <span>{executionStepLabel}</span>
                <span className="tabular-nums text-nx-ink-3">{executionProgressValue}%</span>
              </div>
              <Progress value={executionProgressValue} />
            </div>
          )}

          {executionPhase === "completed" ? (
            <Alert variant="success" data-testid="academy-completed-alert">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">
                {tc("academy.completedBannerTitle")}
              </AlertTitle>
              <AlertDescription className="mt-1 space-y-1.5 text-[11px] text-nx-ink-2">
                <p>
                  {tc("academy.completedBannerDesc", {
                    reassignedCount,
                    notifyCount,
                  })}
                </p>
                {unresolvedCount > 0 && (
                  <p className="font-medium text-nx-warning-strong">
                    • {tc("academy.actionEscalateTitle")}
                  </p>
                )}
                <p className="border-t border-success/20 pt-1.5 text-[10px] text-nx-ink-3">
                  {tc("academy.completedDisclaimer")}
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {!hasEnabledAction && (
                <p className="text-[11px] text-nx-warning-strong">
                  {tc("academy.noActionsSelected")}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={executionPhase === "executing"}
                  onClick={() => onSetPlanReviewOpen(true)}
                  data-testid="academy-review-plan-btn"
                  className="h-8 cursor-pointer gap-1.5 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{tc("academy.reviewPlanBtn")}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={executionPhase === "executing"}
                  onClick={onToggleEditPlan}
                  data-testid="academy-edit-plan-btn"
                  className="h-8 cursor-pointer gap-1.5 text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {isEditingPlan ? tc("academy.doneEditingBtn") : tc("academy.editPlanBtn")}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={!hasEnabledAction || executionPhase === "executing"}
                  loading={executionPhase === "executing"}
                  onClick={onApprove}
                  data-testid="academy-approve-actions-btn"
                  className="ms-auto h-8 cursor-pointer gap-1.5 text-xs font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {executionPhase === "executing"
                      ? tc("academy.approvingBtn")
                      : tc("academy.approveBtn")}
                  </span>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Plan Review & Simulated Guardian Notifications Dialog */}
      <Dialog open={isPlanReviewOpen} onOpenChange={onSetPlanReviewOpen}>
        <DialogContent className="max-w-xl border-nx-line bg-nx-surface text-nx-ink">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {tc("academy.reviewModalTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {tc("academy.reviewModalDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-nx-ink">
                <Bell className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
                <span>{tc("academy.reviewModalNoticesTitle")}</span>
              </h4>
              <Badge variant="info" className="text-[10px]">
                {tc("header.previewBadge")}
              </Badge>
            </div>

            <div className="space-y-2.5">
              {GUARDIAN_NOTIFICATION_SAMPLES.map((sample) => (
                <div
                  key={sample.id}
                  className="rounded-nx-md border border-nx-line bg-nx-raised p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-nx-ink">
                      {isAr ? sample.sampleGuardianAr : sample.sampleGuardianEn}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {sample.channel}
                    </Badge>
                  </div>
                  <Separator className="my-2 bg-nx-line" />
                  <p className="leading-relaxed text-nx-ink-2">
                    {isAr ? sample.messageAr : sample.messageEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSetPlanReviewOpen(false)}
              className="cursor-pointer"
            >
              {tc("academy.closeLabel")}
            </Button>
            {executionPhase === "idle" && (
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={!hasEnabledAction}
                onClick={onApprove}
                className="cursor-pointer font-semibold"
              >
                {tc("academy.reviewModalConfirm")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
