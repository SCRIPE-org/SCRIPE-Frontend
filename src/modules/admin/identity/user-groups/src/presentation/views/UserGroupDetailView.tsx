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
import { formatUtc } from "@core/common/utils";
import { AddMembersDialog } from "../components/AddMembersDialog";
import { SetRolesDialog } from "../components/SetRolesDialog";
import { SetRestrictionsDialog } from "../components/SetRestrictionsDialog";

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

  const name = language === "ar" ? group.nameAr : group.nameEn;
  const description =
    language === "ar"
      ? group.descriptionAr || group.descriptionEn
      : group.descriptionEn || group.descriptionAr;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label={t("common.back")}
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </Button>
          <div>
            <h1 className="text-balance text-xl font-bold leading-tight tracking-tight text-nx-ink">
              {name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm text-nx-ink-2">{group.code}</span>
              <Badge variant={group.isActive ? "default" : "secondary"}>
                {group.isActive ? t("common.active") : t("common.inactive")}
              </Badge>
            </div>
            {description && <p className="mt-2 max-w-xl text-sm text-nx-ink-2">{description}</p>}
          </div>
        </div>
        <div className="text-xs text-nx-ink-3">
          {t("common.createdAt")}: {formatUtc(group.createdAt, "PPp")}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("userGroups.membersTab.title")}</CardTitle>
                <CardDescription>{t("userGroups.membersTab.description")}</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setShowAddMembers(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("userGroups.membersTab.addMembers")}
              </Button>
            </CardHeader>
            <CardContent>
              {group.members.length === 0 ? (
                <EmptyState
                  bare
                  size="sm"
                  icon={Users}
                  title={t("userGroups.noMembers")}
                  action={
                    <Button size="sm" className="gap-2" onClick={() => setShowAddMembers(true)}>
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      {t("userGroups.membersTab.addMembers")}
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div
                      key={member.adminId}
                      className="flex items-center justify-between rounded-nx-md border border-nx-line p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-nx-accent-wash">
                          <Users className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-nx-ink-2">{member.username}</p>
                        </div>
                        <Badge
                          variant={member.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {member.isActive ? t("common.active") : t("common.inactive")}
                        </Badge>
                      </div>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("userGroups.rolesTab.title")}</CardTitle>
                <CardDescription>{t("userGroups.rolesTab.description")}</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setShowSetRoles(true)}>
                <Settings className="h-4 w-4" aria-hidden="true" />
                {t("userGroups.rolesTab.manageRoles")}
              </Button>
            </CardHeader>
            <CardContent>
              {group.roles.length === 0 ? (
                <EmptyState
                  bare
                  size="sm"
                  icon={Shield}
                  title={t("userGroups.noRoles")}
                  action={
                    <Button size="sm" className="gap-2" onClick={() => setShowSetRoles(true)}>
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      {t("userGroups.rolesTab.manageRoles")}
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {group.roles.map((role) => (
                    <div
                      key={role.roleId}
                      className="flex items-center justify-between rounded-nx-md border border-nx-line p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-nx-accent" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-medium">
                            {language === "ar" ? role.nameAr : role.nameEn}
                          </p>
                          <p className="font-mono text-xs text-nx-ink-2">{role.code}</p>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("userGroups.restrictionsTab.title")}</CardTitle>
                <CardDescription>{t("userGroups.restrictionsTab.description")}</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setShowSetRestrictions(true)}>
                <Settings className="h-4 w-4" aria-hidden="true" />
                {t("userGroups.restrictionsTab.manageRestrictions")}
              </Button>
            </CardHeader>
            <CardContent>
              {group.restrictions.length === 0 ? (
                <EmptyState
                  bare
                  size="sm"
                  icon={Lock}
                  title={t("userGroups.noRestrictions")}
                  action={
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowSetRestrictions(true)}
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      {t("userGroups.restrictionsTab.manageRestrictions")}
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {group.restrictions.map((restriction, idx) => (
                    <div
                      key={`${restriction.permissionCode}-${idx}`}
                      className="flex items-start justify-between rounded-nx-md border border-nx-line p-3"
                    >
                      <div>
                        <p className="font-mono text-sm font-medium">
                          {restriction.permissionCode}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {restriction.restrictedFields.map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
