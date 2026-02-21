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
import {
      Users, Shield, Lock,
      ArrowLeft, Trash2, Plus, Settings,
      Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AddMembersDialog } from "../components/AddMembersDialog";
import { SetRolesDialog } from "../components/SetRolesDialog";
import { SetRestrictionsDialog } from "../components/SetRestrictionsDialog";

interface Props {
      groupId: string;
}

export function UserGroupDetailView({ groupId }: Props) {
      const { t, language } = useI18n();
      const router = useRouter();
      const {
            group, isLoading, error,
            addMembers, removeMember, isAddingMembers, isRemovingMember,
            setRoles, isSettingRoles,
            setRestrictions, isSettingRestrictions,
      } = useUserGroupDetailViewModel(groupId);

      // Dialog states
      const [showAddMembers, setShowAddMembers] = useState(false);
      const [showSetRoles, setShowSetRoles] = useState(false);
      const [showSetRestrictions, setShowSetRestrictions] = useState(false);

      if (isLoading) {
            return (
                  <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
            );
      }

      if (error || !group) {
            return (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <p className="text-muted-foreground">
                              {t("userGroups.notFound") || "User group not found"}
                        </p>
                        <Button variant="outline" onClick={() => router.push("/user-groups")}>
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              {t("userGroups.backToList") || "Back to List"}
                        </Button>
                  </div>
            );
      }

      const name = language === "ar" ? group.nameAr : group.nameEn;
      const description = language === "ar"
            ? group.descriptionAr || group.descriptionEn
            : group.descriptionEn || group.descriptionAr;

      return (
            <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                              <Button variant="ghost" size="icon" onClick={() => router.push("/user-groups")}>
                                    <ArrowLeft className="h-5 w-5" />
                              </Button>
                              <div>
                                    <h1 className="text-2xl font-bold">{name}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                          <span className="text-sm text-muted-foreground font-mono">{group.code}</span>
                                          <Badge variant={group.isActive ? "default" : "secondary"}>
                                                {group.isActive
                                                      ? t("common.active") || "Active"
                                                      : t("common.inactive") || "Inactive"}
                                          </Badge>
                                    </div>
                                    {description && (
                                          <p className="text-sm text-muted-foreground mt-2 max-w-xl">{description}</p>
                                    )}
                              </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                              {t("common.createdAt") || "Created"}: {format(new Date(group.createdAt), "PPp")}
                        </div>
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="members" className="w-full">
                        <TabsList>
                              <TabsTrigger value="members" className="gap-2">
                                    <Users className="h-4 w-4" />
                                    {t("userGroups.members") || "Members"} ({group.members.length})
                              </TabsTrigger>
                              <TabsTrigger value="roles" className="gap-2">
                                    <Shield className="h-4 w-4" />
                                    {t("userGroups.roles") || "Roles"} ({group.roles.length})
                              </TabsTrigger>
                              <TabsTrigger value="restrictions" className="gap-2">
                                    <Lock className="h-4 w-4" />
                                    {t("userGroups.restrictions") || "Restrictions"} ({group.restrictions.length})
                              </TabsTrigger>
                        </TabsList>

                        {/* Members Tab */}
                        <TabsContent value="members">
                              <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                          <div>
                                                <CardTitle>{t("userGroups.membersTab.title") || "Group Members"}</CardTitle>
                                                <CardDescription>
                                                      {t("userGroups.membersTab.description") || "Admins who belong to this group inherit its roles and restrictions."}
                                                </CardDescription>
                                          </div>
                                          <Button
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => setShowAddMembers(true)}
                                          >
                                                <Plus className="h-4 w-4" />
                                                {t("userGroups.membersTab.addMembers") || "Add Members"}
                                          </Button>
                                    </CardHeader>
                                    <CardContent>
                                          {group.members.length === 0 ? (
                                                <p className="text-sm text-muted-foreground py-8 text-center">
                                                      {t("userGroups.noMembers") || "No members in this group yet."}
                                                </p>
                                          ) : (
                                                <div className="space-y-2">
                                                      {group.members.map((member) => (
                                                            <div
                                                                  key={member.adminId}
                                                                  className="flex items-center justify-between p-3 rounded-lg border"
                                                            >
                                                                  <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                              <Users className="h-4 w-4 text-primary" />
                                                                        </div>
                                                                        <div>
                                                                              <p className="text-sm font-medium">
                                                                                    {member.firstName} {member.lastName}
                                                                              </p>
                                                                              <p className="text-xs text-muted-foreground">{member.username}</p>
                                                                        </div>
                                                                        <Badge variant={member.isActive ? "default" : "secondary"} className="text-xs">
                                                                              {member.isActive ? t("common.active") || "Active" : t("common.inactive") || "Inactive"}
                                                                        </Badge>
                                                                  </div>
                                                                  <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-red-600 hover:text-red-700"
                                                                        disabled={isRemovingMember}
                                                                        onClick={() => removeMember(member.adminId)}
                                                                  >
                                                                        <Trash2 className="h-4 w-4" />
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
                                                <CardTitle>{t("userGroups.rolesTab.title") || "Assigned Roles"}</CardTitle>
                                                <CardDescription>
                                                      {t("userGroups.rolesTab.description") || "Roles assigned to this group are inherited by all members."}
                                                </CardDescription>
                                          </div>
                                          <Button
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => setShowSetRoles(true)}
                                          >
                                                <Settings className="h-4 w-4" />
                                                {t("userGroups.rolesTab.manageRoles") || "Manage Roles"}
                                          </Button>
                                    </CardHeader>
                                    <CardContent>
                                          {group.roles.length === 0 ? (
                                                <p className="text-sm text-muted-foreground py-8 text-center">
                                                      {t("userGroups.noRoles") || "No roles assigned to this group yet."}
                                                </p>
                                          ) : (
                                                <div className="space-y-2">
                                                      {group.roles.map((role) => (
                                                            <div
                                                                  key={role.roleId}
                                                                  className="flex items-center justify-between p-3 rounded-lg border"
                                                            >
                                                                  <div className="flex items-center gap-3">
                                                                        <Shield className="h-5 w-5 text-purple-500" />
                                                                        <div>
                                                                              <p className="text-sm font-medium">
                                                                                    {language === "ar" ? role.nameAr : role.nameEn}
                                                                              </p>
                                                                              <p className="text-xs text-muted-foreground font-mono">{role.code}</p>
                                                                        </div>
                                                                  </div>
                                                                  <Badge variant="outline" className="text-xs">
                                                                        {role.permissionCount} {t("userGroups.rolesTab.permissions") || "permissions"}
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
                                                <CardTitle>{t("userGroups.restrictionsTab.title") || "Field Restrictions"}</CardTitle>
                                                <CardDescription>
                                                      {t("userGroups.restrictionsTab.description") || "Restricted fields apply additively to all group members."}
                                                </CardDescription>
                                          </div>
                                          <Button
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => setShowSetRestrictions(true)}
                                          >
                                                <Settings className="h-4 w-4" />
                                                {t("userGroups.restrictionsTab.manageRestrictions") || "Manage Restrictions"}
                                          </Button>
                                    </CardHeader>
                                    <CardContent>
                                          {group.restrictions.length === 0 ? (
                                                <p className="text-sm text-muted-foreground py-8 text-center">
                                                      {t("userGroups.noRestrictions") || "No restrictions configured for this group."}
                                                </p>
                                          ) : (
                                                <div className="space-y-2">
                                                      {group.restrictions.map((restriction, idx) => (
                                                            <div
                                                                  key={`${restriction.permissionCode}-${idx}`}
                                                                  className="flex items-start justify-between p-3 rounded-lg border"
                                                            >
                                                                  <div>
                                                                        <p className="text-sm font-medium font-mono">{restriction.permissionCode}</p>
                                                                        <div className="flex flex-wrap gap-1 mt-1">
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
                  />
            </div>
      );
}
