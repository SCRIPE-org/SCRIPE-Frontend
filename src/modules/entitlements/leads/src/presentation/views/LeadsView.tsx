"use client";

import { useState } from "react";
import { useLeadsViewModel } from "../viewmodels/useLeadsViewModel";
import type { LeadStatus } from "../../domain/entities/PlatformLead";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@core/ui/dialog";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";

const STATUS_COLORS: Record<LeadStatus, string> = {
  New: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Contacted: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Qualified: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Converted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Closed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Converted", "Closed"];

export function LeadsView() {
  const vm = useLeadsViewModel();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<LeadStatus>("Contacted");
  const [pendingNotes, setPendingNotes] = useState("");

  const openUpdateDialog = (leadId: string, currentStatus: LeadStatus) => {
    vm.handleSelectLead(leadId);
    setPendingStatus(currentStatus);
    setPendingNotes("");
    setUpdateDialogOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!vm.selectedLeadId) return;
    await vm.handleUpdateStatus(vm.selectedLeadId, pendingStatus, pendingNotes || undefined);
    setUpdateDialogOpen(false);
    vm.handleSelectLead(null);
  };

  const totalPages = Math.ceil(vm.totalCount / vm.pageSize);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Sales Leads</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Platform contact-sales inquiries — {vm.totalCount} total
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          id="leads-search"
          placeholder="Search by company, email, or contact…"
          value={vm.search}
          onChange={(e) => vm.handleSearchChange(e.target.value)}
          className="w-72 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
        />
        <Select
          value={vm.statusFilter ?? "all"}
          onValueChange={(v) =>
            vm.handleStatusFilterChange(v === "all" ? undefined : (v as LeadStatus))
          }
        >
          <SelectTrigger
            id="leads-status-filter"
            className="w-44 bg-zinc-900 border-zinc-700 text-white"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Company</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Contact</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Edition</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {vm.isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-500">
                  Loading leads…
                </td>
              </tr>
            ) : vm.leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-500">
                  No leads found.
                </td>
              </tr>
            ) : (
              vm.leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">{lead.companyName}</td>
                  <td className="px-4 py-3 text-zinc-300">{lead.contactName}</td>
                  <td className="px-4 py-3 text-zinc-400">{lead.email}</td>
                  <td className="px-4 py-3 text-zinc-400">{lead.editionKey ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[lead.status]}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      id={`lead-update-status-${lead.id}`}
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-white hover:bg-zinc-700"
                      onClick={() => openUpdateDialog(lead.id, lead.status)}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>
            Page {vm.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              id="leads-prev-page"
              variant="outline"
              size="sm"
              disabled={vm.page <= 1}
              onClick={() => vm.handlePageChange(vm.page - 1)}
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              Previous
            </Button>
            <Button
              id="leads-next-page"
              variant="outline"
              size="sm"
              disabled={vm.page >= totalPages}
              onClick={() => vm.handlePageChange(vm.page + 1)}
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ── Update Status Dialog ── */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-new-status">New Status</Label>
              <Select
                value={pendingStatus}
                onValueChange={(v) => setPendingStatus(v as LeadStatus)}
              >
                <SelectTrigger
                  id="lead-new-status"
                  className="bg-zinc-800 border-zinc-700 text-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-notes">Internal Notes (optional)</Label>
              <Textarea
                id="lead-notes"
                value={pendingNotes}
                onChange={(e) => setPendingNotes(e.target.value)}
                placeholder="Add any notes about this lead…"
                rows={3}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              id="lead-cancel-update"
              variant="ghost"
              onClick={() => setUpdateDialogOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              id="lead-confirm-update"
              onClick={handleConfirmUpdate}
              disabled={vm.isUpdatingStatus}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {vm.isUpdatingStatus ? "Updating…" : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
