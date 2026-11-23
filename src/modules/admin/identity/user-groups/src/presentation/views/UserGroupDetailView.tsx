// FILE-EXCEPTION: file length
/**
 * User Group Detail View
 *
 * Shows full group detail with tabs for Members, Roles, and Restrictions.
 * Pure UI — all logic lives in useUserGroupDetailViewModel.
 * Each tab has action buttons for adding/managing items.
 */
"use client";

import { useState } from "react";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { usePermission } from "@core/hooks/use-permission";
import { useUserGroupDetailViewModel } from "../viewmodels/useUserGroupDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import { Users, Shield, Lock, ArrowLeft, Trash2, Plus, Settings, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatUtc, resolveBilingualLabel } from "@core/common/utils";
import { AddMembersDialog } from "../components/AddMembersDialog";
import { SetRolesDialog } from "../components/SetRolesDialog";
import { SetRestrictionsDialog } from "../components/SetRestrictionsDialog";
import {
  formatRestrictableResourceLabel,
  resolveRestrictableResource,
} from "../components/restriction-resource-label";

interface Props {
  groupId: string;
}

/**
 * Presentation UI component rendering the user group detail view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function UserGroupDetailView({ groupId }: Props) {
  const { t, language } = useI18n();
  const router = useRouter();
  const canUpdateGroup = usePermission(SYSTEM_PERMISSIONS.USER_GROUPS_UPDATE);
  const {
    group,
    isLoading,
    error,
    refetch,
    addMembers,
    removeMember,
    isAddingMembers,
    isRemovingMember,
    setRoles,
    isSettingRoles,
    setRestrictions,
    isSettingRestrictions,
  } = useUserGroupDetailViewModel(groupId);

  // Dialog states
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showSetRoles, setShowSetRoles] = useState(false);
  const [showSetRestrictions, setShowSetRestrictions] = useState(false);

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return <ErrorMessage message={t("common.error")} onRetry={refetch} />;
  }

  if (!group) {
    return (
      <EmptyState
        icon={Inbox}
        title={t("userGroups.notFound")}
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t("userGroups.backToList")}
          </Button>
        }
      />
    );
  }

  const name = resolveBilingualLabel(group.nameEn, group.nameAr, language);
  const description = resolveBilingualLabel(
    group.descriptionEn || group.descriptionAr || "",
    group.descriptionAr || group.descriptionEn || "",
    language
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label={t("common.back")}
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-balance text-xl font-bold leading-tight tracking-tight text-nx-ink">
              {name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <bdi dir="ltr" className="font-mono text-sm text-nx-ink-2">
                {group.code}
              </bdi>
              <Badge variant={group.isActive ? "default" : "secondary"}>
                {group.isActive ? t("common.active") : t("common.inactive")}
              </Badge>
            </div>
            {description && <p className="mt-2 max-w-xl text-sm text-nx-ink-2">{description}</p>}
          </div>
        </div>
        <div className="shrink-0 text-xs text-nx-ink-3">
          {t("common.createdAt")}: <bdi dir="ltr">{formatUtc(group.createdAt, "PPp")}</bdi>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" aria-hidden="true" />
            {t("userGroups.members")} ({group.members.length})
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" aria-hidden="true" />
            {t("userGroups.roles")} ({group.roles.length})
          </TabsTrigger>
          <TabsTrigger value="restrictions" className="gap-2">
            <Lock className="h-4 w-4" aria-hidden="true" />
            {t("userGroups.restrictions")} ({group.restrictions.length})
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t("userGroups.membersTab.title")}</CardTitle>
                <CardDescription>{t("userGroups.membersTab.description")}</CardDescription>
              </div>
              {canUpdateGroup && (
                <Button size="sm" className="gap-2 self-start sm:self-auto" onClick={() => setShowAddMembers(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t("userGroups.membersTab.addMembers")}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {group.members.length === 0 ? (
                <EmptyState
                  bare
                  size="sm"
                  icon={Users}
                  title={t("userGroups.noMembers")}
                  action={
                    canUpdateGroup ? (
                      <Button size="sm" className="gap-2" onClick={() => setShowAddMembers(true)}>
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        {t("userGroups.membersTab.addMembers")}
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div
                      key={member.adminId}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-nx-md border border-nx-line p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nx-accent-wash">
                          <Users className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="truncate text-xs text-nx-ink-2">
                            <bdi dir="ltr">{member.username}</bdi>
                          </p>
                        </div>
                        <Badge
                          variant={member.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {member.isActive ? t("common.active") : t("common.inactive")}
                        </Badge>
                      </div>
                      {canUpdateGroup && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/90"
                          disabled={isRemovingMember}
                          onClick={() => removeMember(member.adminId)}
                          aria-label={`${t("userGroups.membersTab.removeMember")}: ${member.firstName} ${member.lastName}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t("userGroups.rolesTab.title")}</CardTitle>
                <CardDescription>{t("userGroups.rolesTab.description")}</CardDescription>
              </div>
              {canUpdateGroup && (
                <Button size="sm" className="gap-2 self-start sm:self-auto" onClick={() => setShowSetRoles(true)}>
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  {t("userGroups.rolesTab.manageRoles")}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {group.roles.length === 0 ? (
                <EmptyState
                  bare
                  size="sm"
                  icon={Shield}
                  title={t("userGroups.noRoles")}
                  action={
                    canUpdateGroup ? (
                      <Button size="sm" className="gap-2" onClick={() => setShowSetRoles(true)}>
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        {t("userGroups.rolesTab.manageRoles")}
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="space-y-2">
                  {group.roles.map((role) => (
                    <div
                      key={role.roleId}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-nx-md border border-nx-line p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Shield className="h-5 w-5 shrink-0 text-nx-accent" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {resolveBilingualLabel(role.nameEn, role.nameAr, language)}
                          </p>
                          <p className="font-mono text-xs text-nx-ink-2">
                            <bdi dir="ltr">{role.code}</bdi>
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {role.permissionCount} {t("userGroups.rolesTab.permissions")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restrictions Tab */}
        <TabsContent value="restrictions">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t("userGroups.restrictionsTab.title")}</CardTitle>
                <CardDescription>{t("userGroups.restrictionsTab.description")}</CardDescription>
              </div>
              {canUpdateGroup && (
                <Button
                  size="sm"
                  className="gap-2 self-start sm:self-auto"
                  onClick={() => setShowSetRestrictions(true)}
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  {t("userGroups.restrictionsTab.manageRestrictions")}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {group.restrictions.length === 0 ? (
                <EmptyState
                  bare
                  size="sm"
                  icon={Lock}
                  title={t("userGroups.noRestrictions")}
                  action={
                    canUpdateGroup ? (
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setShowSetRestrictions(true)}
                      >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        {t("userGroups.restrictionsTab.manageRestrictions")}
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="space-y-2">
                  {group.restrictions.map((restriction, idx) => {
                    const canonicalResource = resolveRestrictableResource(restriction.permissionCode);
                    const resourceLabel = formatRestrictableResourceLabel(restriction.permissionCode, t);
                    return (
                      <div
                        key={`${restriction.permissionCode}-${idx}`}
                        className="flex items-start justify-between gap-3 rounded-nx-md border border-nx-line p-3"
                      >
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-nx-ink">{resourceLabel}</span>
                            <bdi
                              dir="ltr"
                              className="rounded-nx-xs bg-nx-raised px-1.5 py-0.5 font-mono text-xs text-nx-ink-2"
                            >
                              {canonicalResource || restriction.permissionCode}
                            </bdi>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {restriction.restrictedFields.map((field) => (
                              <Badge key={field} variant="outline" className="text-xs">
                                <bdi dir="ltr">{field}</bdi>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddMembersDialog
        open={showAddMembers}
        onOpenChange={setShowAddMembers}
        groupId={groupId}
        existingMemberIds={group.members.map((m) => m.adminId)}
        onSubmit={(ids) => {
          addMembers(ids);
          setShowAddMembers(false);
        }}
        isSubmitting={isAddingMembers}
        tenantId={group.tenantId || undefined}
      />
      <SetRolesDialog
        open={showSetRoles}
        onOpenChange={setShowSetRoles}
        currentRoles={group.roles}
        onSubmit={(ids) => {
          setRoles(ids);
          setShowSetRoles(false);
        }}
        isSubmitting={isSettingRoles}
        tenantId={group.tenantId || undefined}
      />
      <SetRestrictionsDialog
        open={showSetRestrictions}
        onOpenChange={setShowSetRestrictions}
        currentRestrictions={group.restrictions}
        onSubmit={(restrictions) => {
          setRestrictions(restrictions);
          setShowSetRestrictions(false);
        }}
        isSubmitting={isSettingRestrictions}
        tenantId={group.tenantId || undefined}
      />
    </div>
  );
}
