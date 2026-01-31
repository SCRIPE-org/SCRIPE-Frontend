/**
 * Admins View
 *
 * Main view component for admin management.
 */
"use client";

import { useState, useCallback } from "react";
import { useAdminsViewModel } from "../viewmodels/useAdminsViewModel";
import { GenericTable, Column } from "@core/crud/components/generic-table";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
} from "@core/ui/dialog";
import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
      DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import { Card, CardContent } from "@core/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
      Form,
      FormControl,
      FormField,
      FormItem,
      FormLabel,
      FormMessage,
} from "@core/ui/form";
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Admin, AdminData } from "../../domain/entities/Admin";
import type { CreateAdminFormData, UpdateAdminFormData } from "../schemas/AdminSchema";
import { createAdminSchema, updateAdminSchema } from "../schemas/AdminSchema";
import {
      Plus,
      MoreHorizontal,
      Pencil,
      Trash2,
      UserCheck,
      UserX,
      RefreshCw,
} from "lucide-react";
import { useDebounce } from "@core/hooks/use-validation";
import { Badge } from "@core/ui/badge";
import { format } from "date-fns";

export function AdminsView() {
      // State
      const [page, setPage] = useState(1);
      const [pageSize, setPageSize] = useState(20);
      const [searchInput, setSearchInput] = useState("");
      // const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
      const [selectedIds, setSelectedIds] = useState<string[]>([]);

      // Dialogs
      const [createDialogOpen, setCreateDialogOpen] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

      // Debounced search
      const debouncedSearch = useDebounce(searchInput, 300);

      // ViewModel
      const {
            admins,
            totalCount,
            totalPages,
            isLoading,
            handleCreate,
            handleUpdate,
            handleDelete,
            handleToggleActive,
            // handleBulkActivate,
            // handleBulkDeactivate,
            // handleBulkDelete,
            refetch,
            isCreating,
            isUpdating,
            isDeleting,
      } = useAdminsViewModel({
            page,
            pageSize,
            search: debouncedSearch || undefined,
            // isActive: statusFilter,
      });

      // Create form
      const createForm = useForm<CreateAdminFormData>({
            resolver: zodResolver(createAdminSchema),
            defaultValues: {
                  username: "",
                  password: "",
                  firstName: "",
                  lastName: "",
                  phoneNumber: "",
                  notes: "",
            },
      });

      // Edit form
      const editForm = useForm<UpdateAdminFormData>({
            resolver: zodResolver(updateAdminSchema),
            defaultValues: {
                  firstName: "",
                  lastName: "",
                  phoneNumber: "",
                  notes: "",
                  isActive: true,
            },
      });

      // Handlers
      const handleOpenCreate = useCallback(() => {
            createForm.reset();
            setCreateDialogOpen(true);
      }, [createForm]);

      const handleOpenEdit = useCallback(
            (admin: Admin) => {
                  setSelectedAdmin(admin);
                  editForm.reset({
                        firstName: admin.firstName || "",
                        lastName: admin.lastName || "",
                        phoneNumber: admin.phoneNumber || "",
                        notes: admin.notes || "",
                        isActive: admin.isActive,
                  });
                  setEditDialogOpen(true);
            },
            [editForm]
      );

      const handleOpenDelete = useCallback((admin: Admin) => {
            setSelectedAdmin(admin);
            setDeleteDialogOpen(true);
      }, []);

      const onCreateSubmit = useCallback(
            async (data: CreateAdminFormData) => {
                  await handleCreate(data);
                  setCreateDialogOpen(false);
                  createForm.reset();
            },
            [handleCreate, createForm]
      );

      const onEditSubmit = useCallback(
            async (data: UpdateAdminFormData) => {
                  if (!selectedAdmin) return;
                  await handleUpdate(selectedAdmin.id, data);
                  setEditDialogOpen(false);
            },
            [handleUpdate, selectedAdmin]
      );

      const onDeleteConfirm = useCallback(async () => {
            if (!selectedAdmin) return;
            await handleDelete(selectedAdmin.id);
            setDeleteDialogOpen(false);
            setSelectedAdmin(null);
      }, [handleDelete, selectedAdmin]);

      // Table columns
      const columns: Column<AdminData>[] = [
            {
                  key: "username",
                  label: "Username",
                  sortable: true,
            },
            {
                  key: "firstName",
                  label: "First Name",
                  sortable: true,
            },
            {
                  key: "lastName",
                  label: "Last Name",
                  sortable: true,
            },
            {
                  key: "isActive",
                  label: "Status",
                  render: (value: boolean) => (
                        <Badge variant={value ? "default" : "secondary"}>
                              {value ? "Active" : "Inactive"}
                        </Badge>
                  ),
            },
            {
                  key: "createdAt",
                  label: "Created",
                  render: (value: string) => value ? format(new Date(value), "MMM d, yyyy") : "-",
            },
      ];

      // Custom action renderer
      const renderActions = (row: AdminData) => {
            const admin = new Admin(row);
            return (
                  <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                              </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                              <PermissionGate permission={SYSTEM_PERMISSIONS.ADMINS_UPDATE}>
                                    <DropdownMenuItem onClick={() => handleOpenEdit(admin)}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                          onClick={() => handleToggleActive(admin.id, !admin.isActive)}
                                    >
                                          {admin.isActive ? (
                                                <>
                                                      <UserX className="mr-2 h-4 w-4" />
                                                      Deactivate
                                                </>
                                          ) : (
                                                <>
                                                      <UserCheck className="mr-2 h-4 w-4" />
                                                      Activate
                                                </>
                                          )}
                                    </DropdownMenuItem>
                              </PermissionGate>
                              <DropdownMenuSeparator />
                              <PermissionGate permission={SYSTEM_PERMISSIONS.ADMINS_DELETE}>
                                    <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => handleOpenDelete(admin)}
                                    >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                    </DropdownMenuItem>
                              </PermissionGate>
                        </DropdownMenuContent>
                  </DropdownMenu>
            );
      };

      return (
            <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                        <div>
                              <h1 className="text-3xl font-bold tracking-tight">Administrators</h1>
                              <p className="text-muted-foreground">
                                    Manage system administrators and their access.
                              </p>
                        </div>
                        <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => refetch()}>
                                    <RefreshCw className="h-4 w-4" />
                              </Button>
                              <PermissionGate permission={SYSTEM_PERMISSIONS.ADMINS_CREATE}>
                                    <Button onClick={handleOpenCreate}>
                                          <Plus className="mr-2 h-4 w-4" />
                                          Create Admin
                                    </Button>
                              </PermissionGate>
                        </div>
                  </div>

                  {/* Table */}
                  <Card>
                        <CardContent className="pt-6">
                              <GenericTable
                                    data={admins.map(admin => admin.data)}
                                    columns={columns}
                                    loading={isLoading}
                                    selectable={true}
                                    selectedItems={selectedIds}
                                    onSelectionChange={setSelectedIds}
                                    searchValue={searchInput}
                                    onSearch={setSearchInput}
                                    searchPlaceholder="Search administrators..."
                                    emptyMessage="No administrators found."
                                    renderActions={renderActions}
                                    pagination={{
                                          itemsCount: totalCount,
                                          pageSize,
                                          currentPage: page,
                                          pagesCount: totalPages,
                                          onPageChange: setPage,
                                          onPageSizeChange: setPageSize,
                                    }}
                              />
                        </CardContent>
                  </Card>

                  {/* Create Dialog */}
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle>Create Administrator</DialogTitle>
                                    <DialogDescription>
                                          Add a new administrator to the system.
                                    </DialogDescription>
                              </DialogHeader>
                              <Form {...createForm}>
                                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                                          <FormField
                                                control={createForm.control}
                                                name="username"
                                                render={({ field }) => (
                                                      <FormItem>
                                                            <FormLabel>Username *</FormLabel>
                                                            <FormControl>
                                                                  <Input placeholder="Enter username" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                      </FormItem>
                                                )}
                                          />
                                          <FormField
                                                control={createForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                      <FormItem>
                                                            <FormLabel>Password *</FormLabel>
                                                            <FormControl>
                                                                  <Input type="password" placeholder="Enter password" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                      </FormItem>
                                                )}
                                          />
                                          <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                      control={createForm.control}
                                                      name="firstName"
                                                      render={({ field }) => (
                                                            <FormItem>
                                                                  <FormLabel>First Name</FormLabel>
                                                                  <FormControl>
                                                                        <Input placeholder="First name" {...field} />
                                                                  </FormControl>
                                                                  <FormMessage />
                                                            </FormItem>
                                                      )}
                                                />
                                                <FormField
                                                      control={createForm.control}
                                                      name="lastName"
                                                      render={({ field }) => (
                                                            <FormItem>
                                                                  <FormLabel>Last Name</FormLabel>
                                                                  <FormControl>
                                                                        <Input placeholder="Last name" {...field} />
                                                                  </FormControl>
                                                                  <FormMessage />
                                                            </FormItem>
                                                      )}
                                                />
                                          </div>
                                          <FormField
                                                control={createForm.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                      <FormItem>
                                                            <FormLabel>Phone Number</FormLabel>
                                                            <FormControl>
                                                                  <Input placeholder="+1 234 567 8900" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                      </FormItem>
                                                )}
                                          />
                                          <FormField
                                                control={createForm.control}
                                                name="notes"
                                                render={({ field }) => (
                                                      <FormItem>
                                                            <FormLabel>Notes</FormLabel>
                                                            <FormControl>
                                                                  <Input placeholder="Optional notes..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                      </FormItem>
                                                )}
                                          />
                                          <div className="flex justify-end gap-2 pt-4">
                                                <Button
                                                      type="button"
                                                      variant="outline"
                                                      onClick={() => setCreateDialogOpen(false)}
                                                >
                                                      Cancel
                                                </Button>
                                                <Button type="submit" disabled={isCreating}>
                                                      {isCreating ? "Creating..." : "Create"}
                                                </Button>
                                          </div>
                                    </form>
                              </Form>
                        </DialogContent>
                  </Dialog>

                  {/* Edit Dialog */}
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle>Edit Administrator</DialogTitle>
                                    <DialogDescription>
                                          Update administrator details for {selectedAdmin?.username}.
                                    </DialogDescription>
                              </DialogHeader>
                              <Form {...editForm}>
                                    <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                      control={editForm.control}
                                                      name="firstName"
                                                      render={({ field }) => (
                                                            <FormItem>
                                                                  <FormLabel>First Name</FormLabel>
                                                                  <FormControl>
                                                                        <Input placeholder="First name" {...field} />
                                                                  </FormControl>
                                                                  <FormMessage />
                                                            </FormItem>
                                                      )}
                                                />
                                                <FormField
                                                      control={editForm.control}
                                                      name="lastName"
                                                      render={({ field }) => (
                                                            <FormItem>
                                                                  <FormLabel>Last Name</FormLabel>
                                                                  <FormControl>
                                                                        <Input placeholder="Last name" {...field} />
                                                                  </FormControl>
                                                                  <FormMessage />
                                                            </FormItem>
                                                      )}
                                                />
                                          </div>
                                          <FormField
                                                control={editForm.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                      <FormItem>
                                                            <FormLabel>Phone Number</FormLabel>
                                                            <FormControl>
                                                                  <Input placeholder="+1 234 567 8900" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                      </FormItem>
                                                )}
                                          />
                                          <FormField
                                                control={editForm.control}
                                                name="notes"
                                                render={({ field }) => (
                                                      <FormItem>
                                                            <FormLabel>Notes</FormLabel>
                                                            <FormControl>
                                                                  <Input placeholder="Optional notes..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                      </FormItem>
                                                )}
                                          />
                                          <div className="flex justify-end gap-2 pt-4">
                                                <Button
                                                      type="button"
                                                      variant="outline"
                                                      onClick={() => setEditDialogOpen(false)}
                                                >
                                                      Cancel
                                                </Button>
                                                <Button type="submit" disabled={isUpdating}>
                                                      {isUpdating ? "Saving..." : "Save Changes"}
                                                </Button>
                                          </div>
                                    </form>
                              </Form>
                        </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog */}
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="max-w-sm">
                              <DialogHeader>
                                    <DialogTitle>Delete Administrator</DialogTitle>
                                    <DialogDescription>
                                          Are you sure you want to delete {selectedAdmin?.username}? This action cannot be undone.
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                          variant="outline"
                                          onClick={() => setDeleteDialogOpen(false)}
                                    >
                                          Cancel
                                    </Button>
                                    <Button
                                          variant="destructive"
                                          onClick={onDeleteConfirm}
                                          disabled={isDeleting}
                                    >
                                          {isDeleting ? "Deleting..." : "Delete"}
                                    </Button>
                              </div>
                        </DialogContent>
                  </Dialog>
            </div>
      );
}
