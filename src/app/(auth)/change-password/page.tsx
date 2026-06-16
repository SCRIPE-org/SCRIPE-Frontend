"use client";

/**
 * Force Change Password Page
 *
 * Displayed when an admin's mustChangePassword flag is set.
 * The route guard enforces this redirect — the admin cannot access
 * any other page until they change their password.
 */
import { ForceChangePasswordView } from "@modules/profile/core/src/presentation/views/ForceChangePasswordView";

export default function ChangePasswordPage() {
  return <ForceChangePasswordView />;
}
