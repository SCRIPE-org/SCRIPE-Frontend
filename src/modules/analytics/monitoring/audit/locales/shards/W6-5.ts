/**
 * W6-5 — audit filter panel, log table and dialogs.
 *
 * Adds the event/entity type label dictionaries the filter panel and export
 * dialog derive their SelectItem/summary labels from (the enum member itself
 * stays the API `eventType`/`entityType` payload value — only the on-screen
 * label comes from here), the group headings above the grouped event-type
 * list, and the small badge/aria strings the table and dialogs render.
 */
export const en = {
  audit: {
    badges: {
      admin: "Admin",
    },
    filters: {
      groups: {
        crud: "CRUD",
        authentication: "Authentication",
        security: "Security",
        rolePermission: "Role & Permission",
        adminActions: "Admin Actions",
        tenant: "Tenant",
        system: "System",
        other: "Other",
      },
    },
    eventTypes: {
      Create: "Create",
      Update: "Update",
      Delete: "Delete",
      Request: "Request",
      Login: "Login",
      Logout: "Logout",
      TokenRefreshed: "Token Refreshed",
      ExternalLogin: "External Login",
      AccessDenied: "Access Denied",
      AccountLocked: "Account Locked",
      AccountUnlocked: "Account Unlocked",
      PasswordChanged: "Password Changed",
      PasswordReset: "Password Reset",
      SessionRevoked: "Session Revoked",
      TwoFactorEnabled: "Two-Factor Enabled",
      TwoFactorDisabled: "Two-Factor Disabled",
      TwoFactorVerified: "Two-Factor Verified",
      RoleAssigned: "Role Assigned",
      RoleUnassigned: "Role Unassigned",
      PermissionGranted: "Permission Granted",
      PermissionRevoked: "Permission Revoked",
      AdminStatusChanged: "Admin Status Changed",
      BulkAdminDelete: "Bulk Admin Delete",
      BulkAdminStatusUpdate: "Bulk Admin Status Update",
      Impersonation: "Impersonation",
      AdminTransfer: "Admin Transfer",
      TenantPermissionsUpdated: "Tenant Permissions Updated",
      BulkTenantCascadeDelete: "Bulk Tenant Cascade Delete",
      Error: "Error",
      DataExport: "Data Export",
    },
    entityTypes: {
      Admin: "Admin",
      Role: "Role",
      Tenant: "Tenant",
      Menu: "Menu",
      User: "User",
      Permission: "Permission",
      Auth: "Auth",
      AuditLog: "Audit Log",
    },
    export: {
      formatLabel: "Export format",
    },
  },
};

export const ar = {
  audit: {
    badges: {
      admin: "مسؤول",
    },
    filters: {
      groups: {
        crud: "العمليات الأساسية",
        authentication: "المصادقة",
        security: "الأمان",
        rolePermission: "الأدوار والصلاحيات",
        adminActions: "إجراءات المسؤول",
        tenant: "المستأجر",
        system: "النظام",
        other: "أخرى",
      },
    },
    eventTypes: {
      Create: "إنشاء",
      Update: "تحديث",
      Delete: "حذف",
      Request: "طلب",
      Login: "تسجيل الدخول",
      Logout: "تسجيل الخروج",
      TokenRefreshed: "تحديث الرمز المميز",
      ExternalLogin: "تسجيل دخول خارجي",
      AccessDenied: "الوصول مرفوض",
      AccountLocked: "الحساب مقفل",
      AccountUnlocked: "إلغاء قفل الحساب",
      PasswordChanged: "تغيير كلمة المرور",
      PasswordReset: "إعادة تعيين كلمة المرور",
      SessionRevoked: "إلغاء الجلسة",
      TwoFactorEnabled: "تفعيل التحقق بخطوتين",
      TwoFactorDisabled: "تعطيل التحقق بخطوتين",
      TwoFactorVerified: "تم التحقق بخطوتين",
      RoleAssigned: "تعيين دور",
      RoleUnassigned: "إلغاء تعيين دور",
      PermissionGranted: "منح صلاحية",
      PermissionRevoked: "سحب صلاحية",
      AdminStatusChanged: "تغيير حالة المسؤول",
      BulkAdminDelete: "حذف جماعي للمسؤولين",
      BulkAdminStatusUpdate: "تحديث جماعي لحالة المسؤولين",
      Impersonation: "انتحال الهوية",
      AdminTransfer: "نقل صلاحيات المسؤول",
      TenantPermissionsUpdated: "تحديث صلاحيات المستأجر",
      BulkTenantCascadeDelete: "حذف تسلسلي جماعي للمستأجرين",
      Error: "خطأ",
      DataExport: "تصدير البيانات",
    },
    entityTypes: {
      Admin: "مسؤول",
      Role: "دور",
      Tenant: "مستأجر",
      Menu: "قائمة",
      User: "مستخدم",
      Permission: "صلاحية",
      Auth: "المصادقة",
      AuditLog: "سجل التدقيق",
    },
    export: {
      formatLabel: "صيغة التصدير",
    },
  },
};
