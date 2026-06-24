"use client";

import { useSubmissionsViewModel } from "../viewmodels/useSubmissionsViewModel";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

/**
 * React presentation component representing the submissions view UI element.
 */
export function SubmissionsView() {
  const vm = useSubmissionsViewModel();
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">App Submissions</h2>
          <p className="text-sm text-muted-foreground">
            {vm.pagination.totalCount} total submissions
          </p>
        </div>
        <div className="flex gap-2">
          {(["Pending", "UnderReview", "Approved", "Rejected"] as const).map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => vm.setStatusFilter(s)}>
              {s}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => vm.setStatusFilter(undefined)}>
            All
          </Button>
        </div>
      </div>

      {vm.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : vm.submissions.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-muted-foreground">
          <p className="text-lg font-medium">No submissions</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vm.submissions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{sub.appName}</span>
                    <Badge variant="outline" className="text-xs">
                      v{sub.submittedVersion}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">by {sub.developerName}</p>
                </div>
                <Badge variant={sub.statusVariant}>{sub.status}</Badge>
              </CardHeader>
              {sub.isPending && (
                <CardContent className="flex gap-2 pt-0">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => vm.approve(sub.id)}
                    disabled={vm.isApproving}
                  >
                    <CheckCircle className="size-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1.5"
                    onClick={() =>
                      vm.reject({ id: sub.id, notes: "Does not meet quality standards." })
                    }
                    disabled={vm.isRejecting}
                  >
                    <XCircle className="size-3.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() =>
                      vm.requestRevisions({
                        id: sub.id,
                        notes: "Please address the review feedback.",
                      })
                    }
                  >
                    <RefreshCw className="size-3.5" /> Revisions
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
