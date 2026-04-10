"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@core/ui/table";
import {
  ShieldCheck, Database, UserCheck, FileCheck, ScrollText, Key,
  Plus, Download, CheckCircle2, RefreshCw, Loader2,
} from "lucide-react";
import { useComplianceViewModel } from "../viewmodels/useComplianceViewModel";

interface ComplianceViewProps {
  defaultTab?: string;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "success" | "secondary" | "destructive" | "outline" | "default"> = {
    Pending: "outline", Approved: "success", Rejected: "destructive", Processing: "secondary",
    Completed: "success", Granted: "success", Withdrawn: "destructive", Expired: "secondary",
    Draft: "outline", PendingAcceptance: "outline", Accepted: "success",
  };
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
}

function TabLoading() {
  return <div className="space-y-2 py-8">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>;
}

function TabError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="text-sm text-destructive mb-3">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2"><RefreshCw className="h-3.5 w-3.5" />Retry</Button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4"><Icon className="h-8 w-8 text-muted-foreground/50" /></div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}

export function ComplianceView({ defaultTab }: ComplianceViewProps) {
  useModuleLocales(() => import("../../../locales"), "compliance");
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState(defaultTab || "retention");
  const vm = useComplianceViewModel();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("compliance.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("compliance.description")}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="retention" className="gap-2"><Database className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("compliance.tabs.retention")}</span></TabsTrigger>
          <TabsTrigger value="dsr" className="gap-2"><UserCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("compliance.tabs.dsr")}</span></TabsTrigger>
          <TabsTrigger value="consent" className="gap-2"><ScrollText className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("compliance.tabs.consent")}</span></TabsTrigger>
          <TabsTrigger value="evidence" className="gap-2"><FileCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("compliance.tabs.evidence")}</span></TabsTrigger>
          <TabsTrigger value="dpa" className="gap-2"><Key className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("compliance.tabs.dpa")}</span></TabsTrigger>
        </TabsList>

        {/* ───── Retention Policies ───── */}
        <TabsContent value="retention">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-blue-500" />{t("compliance.retention.title")}</CardTitle>
                <CardDescription>{t("compliance.retention.description")}</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => toast.info(t("common.comingSoon") || "Coming soon")}><Plus className="h-4 w-4" />{t("compliance.retention.addPolicy")}</Button>
            </CardHeader>
            <CardContent>
              {vm.retention.isLoading ? <TabLoading /> : vm.retention.error ? <TabError message={t("common.errorLoading")} onRetry={() => vm.retention.refetch()} /> : vm.retention.items.length === 0 ? <EmptyState icon={Database} title={t("compliance.retention.empty")} description={t("compliance.retention.emptyDesc")} /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>{t("compliance.retention.entityType")}</TableHead><TableHead>{t("compliance.retention.retentionDays")}</TableHead><TableHead>{t("compliance.retention.scope")}</TableHead><TableHead>{t("compliance.retention.lastPurge")}</TableHead><TableHead>{t("compliance.retention.nextPurge")}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {vm.retention.items.map((p: any, i: number) => (
                      <TableRow key={p.id ?? i}>
                        <TableCell className="font-medium">{p.entity ?? p.entityType}</TableCell>
                        <TableCell><Badge variant="outline">{p.days ?? p.retentionDays} days</Badge></TableCell>
                        <TableCell><Badge variant={p.scope === "Platform" ? "secondary" : "default"}>{p.scope === "Platform" ? t("compliance.retention.scopePlatform") : t("compliance.retention.scopeTenant")}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{p.lastPurge ?? p.lastPurgeDate ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{p.nextPurge ?? p.nextPurgeDate ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── DSR ───── */}
        <TabsContent value="dsr">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-violet-500" />{t("compliance.dsr.title")}</CardTitle>
                <CardDescription>{t("compliance.dsr.description")}</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => toast.info(t("common.comingSoon") || "Coming soon")}><Plus className="h-4 w-4" />{t("compliance.dsr.submitDsr")}</Button>
            </CardHeader>
            <CardContent>
              {vm.dsr.isLoading ? <TabLoading /> : vm.dsr.error ? <TabError message={t("common.errorLoading")} onRetry={() => vm.dsr.refetch()} /> : vm.dsr.items.length === 0 ? <EmptyState icon={UserCheck} title={t("compliance.dsr.empty")} description={t("compliance.dsr.emptyDesc")} /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>#</TableHead><TableHead>{t("compliance.dsr.requestType")}</TableHead><TableHead>{t("compliance.dsr.subjectEmail")}</TableHead><TableHead>{t("compliance.dsr.submittedAt")}</TableHead><TableHead>{t("compliance.dsr.deadline")}</TableHead><TableHead>{t("compliance.dsr.status")}</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {vm.dsr.items.map((dsr: any) => (
                      <TableRow key={dsr.id}>
                        <TableCell className="font-mono text-xs">{dsr.id}</TableCell>
                        <TableCell className="font-medium">{dsr.type ?? dsr.requestType}</TableCell>
                        <TableCell className="text-muted-foreground">{dsr.email ?? dsr.subjectEmail}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{dsr.submitted ?? dsr.submittedAt}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{dsr.deadline}</TableCell>
                        <TableCell><StatusBadge status={dsr.status} /></TableCell>
                        <TableCell><Button variant="ghost" size="sm" onClick={() => toast.info(t("common.comingSoon") || "Coming soon")}>{t("compliance.dsr.reviewAction")}</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── Consent ───── */}
        <TabsContent value="consent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-amber-500" />{t("compliance.consent.title")}</CardTitle>
              <CardDescription>{t("compliance.consent.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {vm.consent.isLoading ? <TabLoading /> : vm.consent.error ? <TabError message={t("common.errorLoading")} onRetry={() => vm.consent.refetch()} /> : vm.consent.items.length === 0 ? <EmptyState icon={ScrollText} title={t("compliance.consent.empty")} description={t("compliance.consent.emptyDesc")} /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>{t("compliance.consent.userId")}</TableHead><TableHead>{t("compliance.consent.purpose")}</TableHead><TableHead>{t("compliance.consent.grantedAt")}</TableHead><TableHead>{t("compliance.consent.currentStatus")}</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {vm.consent.items.map((c: any, i: number) => (
                      <TableRow key={c.id ?? i}>
                        <TableCell className="font-medium">{c.user ?? c.userId ?? c.email}</TableCell>
                        <TableCell>{c.purpose}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.granted ?? c.grantedAt}</TableCell>
                        <TableCell><StatusBadge status={c.status} /></TableCell>
                        <TableCell><Button variant="ghost" size="sm" onClick={() => toast.info(t("common.comingSoon") || "Coming soon")}>{t("compliance.consent.viewHistory")}</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── Evidence ───── */}
        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-teal-500" />{t("compliance.evidence.title")}</CardTitle>
              <CardDescription>{t("compliance.evidence.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {vm.evidence.isLoading ? <TabLoading /> : vm.evidence.error ? <TabError message={t("common.errorLoading")} onRetry={() => {}} /> : (
                <div className="grid gap-4 md:grid-cols-3">
                  {(Array.isArray(vm.evidence.frameworks) ? vm.evidence.frameworks : [
                    { key: "SOC2", icon: "🔒" }, { key: "ISO27001", icon: "🏛️" }, { key: "GDPR", icon: "🇪🇺" },
                    { key: "HIPAA", icon: "🏥" }, { key: "PCIDSS", icon: "💳" }, { key: "SOX", icon: "📊" },
                  ]).map((fw: any) => (
                    <Card key={fw.key ?? fw.name} className="relative overflow-hidden border-dashed hover:border-primary/50 transition-colors cursor-pointer group">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{fw.icon ?? "📋"}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold">{fw.key ?? fw.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{fw.sections ?? t("compliance.evidence.sections")}: {fw.sectionCount ?? "12-18"}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-4 gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={() => vm.generateEvidence({ framework: fw.key ?? fw.name })}>
                          {vm.isGeneratingEvidence ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                          {t("compliance.evidence.generate")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── DPA ───── */}
        <TabsContent value="dpa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-orange-500" />{t("compliance.dpa.title")}</CardTitle>
              <CardDescription>{t("compliance.dpa.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {vm.dpa.isLoading ? <TabLoading /> : vm.dpa.error ? <TabError message={t("common.errorLoading")} onRetry={() => vm.dpa.refetch()} /> : vm.dpa.items.length === 0 ? <EmptyState icon={Key} title={t("compliance.dpa.empty")} description={t("compliance.dpa.emptyDesc")} /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>{t("compliance.dpa.partyName")}</TableHead><TableHead>{t("compliance.dpa.agreementDate")}</TableHead><TableHead>{t("compliance.dpa.expiryDate")}</TableHead><TableHead>{t("compliance.dpa.status")}</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {vm.dpa.items.map((dpa: any, i: number) => (
                      <TableRow key={dpa.id ?? i}>
                        <TableCell className="font-medium">{dpa.party ?? dpa.partyName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{dpa.agreed ?? dpa.agreementDate}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{dpa.expiry ?? dpa.expiryDate}</TableCell>
                        <TableCell><StatusBadge status={dpa.status} /></TableCell>
                        <TableCell>
                          {dpa.status === "PendingAcceptance" ? (
                            <Button size="sm" variant="default" className="gap-1" onClick={() => vm.acceptDpa(dpa.id)}><CheckCircle2 className="h-3.5 w-3.5" />{t("compliance.dpa.acceptAction")}</Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => toast.info(t("common.comingSoon") || "Coming soon")}>{t("compliance.dpa.viewDetails")}</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
