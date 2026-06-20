"use client";

import { useState, useCallback } from "react";
import { Sheet, SheetContent } from "@core/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@core/ui/tabs";
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
import { UserPlus, Info, Activity, Send } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  PlatformLead,
  LeadStatus,
  LeadActivity,
  LeadCommunicationLog,
} from "../../domain/entities/PlatformLead";
import { SendLeadEmailDialog } from "./SendLeadEmailDialog";
import { DrawerTabInfo } from "./drawer/DrawerTabInfo";
import { DrawerTabActivity } from "./drawer/DrawerTabActivity";
import { DrawerTabComms } from "./drawer/DrawerTabComms";
import { DrawerActionBar } from "./drawer/DrawerActionBar";
import { SkeletonPanel, STATUS_STYLES } from "./drawer/DrawerShared";

// ── Props ─────────────────────────────────────────────────────────────────────

interface LeadDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  lead: PlatformLead | null | undefined;
  isLoading: boolean;
  onUpdateStatus: (id: string, status: LeadStatus, notes?: string) => Promise<void>;
  isUpdatingStatus: boolean;
  onConvert?: (id: string) => void;
  onAssign?: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
  isDeletingLead?: boolean;
  activity?: LeadActivity[];
  isLoadingActivity?: boolean;
  onAddNote?: (id: string, note: string) => Promise<void>;
  isAddingNote?: boolean;
  onSendEmail?: (params: { leadId: string; subject: string; bodyHtml: string; templateKey?: string }) => Promise<void>;
  isSendingEmail?: boolean;
  communicationLogs?: LeadCommunicationLog[];
  isLoadingComms?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LeadDetailDrawer({
  open,
  onClose,
  lead,
  isLoading,
  onUpdateStatus,
  isUpdatingStatus,
  onConvert,
  onAssign,
  onDelete,
  isDeletingLead,
  activity,
  isLoadingActivity,
  onAddNote,
  isAddingNote,
  onSendEmail,
  isSendingEmail,
  communicationLogs,
  isLoadingComms,
}: LeadDetailDrawerProps) {
  const { t } = useI18n();

  const [activeTab, setActiveTab]             = useState<"info" | "activity" | "comms">("info");
  const [pendingStatus, setPendingStatus]     = useState<LeadStatus | null>(null);
  const [statusNote, setStatusNote]           = useState("");
  const [statusNoteSaved, setStatusNoteSaved] = useState(false);
  const [quickNote, setQuickNote]             = useState("");
  const [quickNoteSaved, setQuickNoteSaved]   = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [showStatusNote, setShowStatusNote]   = useState(false);

  const currentStatus = pendingStatus ?? lead?.status ?? "New";

  const resolvedEditionName = lead?.editionKey
    ? lead.editionKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const handleSaveStatus = useCallback(async () => {
    if (!lead) return;
    await onUpdateStatus(lead.id, currentStatus, statusNote.trim() || undefined);
    setStatusNote("");
    setStatusNoteSaved(true);
    setPendingStatus(null);
    setShowStatusNote(false);
    setTimeout(() => setStatusNoteSaved(false), 2500);
  }, [lead, currentStatus, statusNote, onUpdateStatus]);

  const handleQuickNote = useCallback(async () => {
    if (!lead || !quickNote.trim() || !onAddNote) return;
    await onAddNote(lead.id, quickNote.trim());
    setQuickNote("");
    setQuickNoteSaved(true);
    setTimeout(() => setQuickNoteSaved(false), 2500);
  }, [lead, quickNote, onAddNote]);

  const handleClose = useCallback(() => {
    setPendingStatus(null);
    setStatusNote("");
    setShowStatusNote(false);
    onClose();
  }, [onClose]);

  const handleStatusClick = useCallback((s: LeadStatus) => {
    setPendingStatus(s === lead?.status && !pendingStatus ? null : s);
    setShowStatusNote(true);
  }, [lead?.status, pendingStatus]);

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <SheetContent
          side="right"
          className="flex w-full max-w-[650px] flex-col overflow-hidden border-s border-zinc-800 bg-zinc-950 p-0"
        >
          {/* ── Sticky header ── */}
          <div className="shrink-0 border-b border-zinc-800/60 bg-zinc-950/95 px-6 py-5 backdrop-blur-sm">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-5 w-48 rounded-full bg-zinc-800" />
                <div className="h-3.5 w-32 rounded-full bg-zinc-800" />
              </div>
            ) : lead ? (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="truncate text-[17px] font-semibold text-white leading-tight">
                      {lead.companyName}
                    </h2>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[lead.status].badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[lead.status].dot}`} />
                      {t(`leads.status.${lead.status}`)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-400">{lead.contactName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {resolvedEditionName && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
                        🎯 {resolvedEditionName} {t("leads.panel.editionSuffix")}
                      </span>
                    )}
                    {lead.assignedAdminName && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-0.5 text-[11px] text-zinc-400">
                        <UserPlus className="h-3 w-3" />
                        {lead.assignedAdminName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Tabs ── */}
          {!isLoading && lead && (
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "info" | "activity" | "comms")}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <TabsList className="shrink-0 rounded-none border-b border-zinc-800 bg-zinc-950 px-6 h-10 justify-start gap-0 p-0">
                <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-semibold text-zinc-400 data-[state=active]:border-indigo-500 data-[state=active]:text-white data-[state=active]:bg-transparent">
                  <Info className="mr-1.5 h-3.5 w-3.5" />
                  {t("leads.panel.tabs.info")}
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-semibold text-zinc-400 data-[state=active]:border-indigo-500 data-[state=active]:text-white data-[state=active]:bg-transparent">
                  <Activity className="mr-1.5 h-3.5 w-3.5" />
                  {t("leads.panel.tabs.activity")}
                  {activity && activity.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{activity.length}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="comms" className="rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-semibold text-zinc-400 data-[state=active]:border-indigo-500 data-[state=active]:text-white data-[state=active]:bg-transparent">
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  {t("leads.panel.tabs.communications")}
                  {communicationLogs && communicationLogs.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-violet-900/60 px-1.5 py-0.5 text-[10px] text-violet-300">{communicationLogs.length}</span>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="info" className="mt-0 h-full">
                  <DrawerTabInfo
                    lead={lead}
                    currentStatus={currentStatus as LeadStatus}
                    pendingStatus={pendingStatus}
                    statusNote={statusNote}
                    showStatusNote={showStatusNote}
                    isUpdatingStatus={isUpdatingStatus}
                    statusNoteSaved={statusNoteSaved}
                    onStatusClick={handleStatusClick}
                    onStatusNoteChange={setStatusNote}
                    onSaveStatus={handleSaveStatus}
                  />
                </TabsContent>
                <TabsContent value="activity" className="mt-0 h-full">
                  <DrawerTabActivity
                    activity={activity}
                    isLoadingActivity={isLoadingActivity}
                    onAddNote={onAddNote ? handleQuickNote : undefined}
                    quickNote={quickNote}
                    onQuickNoteChange={setQuickNote}
                    isAddingNote={isAddingNote}
                    quickNoteSaved={quickNoteSaved}
                  />
                </TabsContent>
                <TabsContent value="comms" className="mt-0 h-full">
                  <DrawerTabComms
                    communicationLogs={communicationLogs}
                    isLoadingComms={isLoadingComms}
                    canSendEmail={!!onSendEmail}
                    onOpenEmailDialog={() => setEmailDialogOpen(true)}
                  />
                </TabsContent>
              </div>

              <DrawerActionBar
                lead={lead}
                onConvert={onConvert}
                onAssign={onAssign}
                onSendEmail={onSendEmail ? () => { setActiveTab("comms"); setEmailDialogOpen(true); } : undefined}
                onCloseConfirm={onDelete ? () => setCloseConfirmOpen(true) : undefined}
                isDeletingLead={isDeletingLead}
              />
            </Tabs>
          )}

          {isLoading && <SkeletonPanel />}

          {!isLoading && !lead && (
            <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
              {t("leads.drawer.notFound")}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Close lead confirmation ── */}
      <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t("leads.actions.closeConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">{t("leads.actions.closeConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800">
              {t("leads.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (lead) { setCloseConfirmOpen(false); await onDelete!(lead.id); }
              }}
              className="bg-red-700 text-white hover:bg-red-600"
            >
              {t("leads.actions.closeConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Send Email Dialog ── */}
      {onSendEmail && lead && (
        <SendLeadEmailDialog
          open={emailDialogOpen}
          lead={lead}
          isSending={isSendingEmail ?? false}
          onClose={() => setEmailDialogOpen(false)}
          onSend={onSendEmail}
        />
      )}
    </>
  );
}
