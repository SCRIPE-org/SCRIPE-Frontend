/**
 * Profile Module Core Exports
 *
 * Public barrel export for all presentation views, viewmodels, components, and hooks.
 */

// Presentation Views
export { ForceChangePasswordView } from "./src/presentation/views/ForceChangePasswordView";
export { ProfileDossierView } from "./src/presentation/views/ProfileDossierView";
export { ProfileSecurityView } from "./src/presentation/views/ProfileSecurityView";
export { ProfileSessionsView } from "./src/presentation/views/ProfileSessionsView";
export { ProfileActivityView } from "./src/presentation/views/ProfileActivityView";
export { ProfilePreferencesView } from "./src/presentation/views/ProfilePreferencesView";
export { ProfileIntegrationsView } from "./src/presentation/views/ProfileIntegrationsView";

// ViewModels
export { useProfileDossierViewModel } from "./src/presentation/viewmodels/useProfileDossierViewModel";
export { useSecurityVaultViewModel } from "./src/presentation/viewmodels/useSecurityVaultViewModel";
export { useSessionsFleetViewModel } from "./src/presentation/viewmodels/useSessionsFleetViewModel";
export { useComplianceAuditViewModel } from "./src/presentation/viewmodels/useComplianceAuditViewModel";
export { useWorkstationPreferencesViewModel } from "./src/presentation/viewmodels/useWorkstationPreferencesViewModel";
export { useIntegrationsFederationViewModel } from "./src/presentation/viewmodels/useIntegrationsFederationViewModel";
export { useProfilePageViewModel } from "./src/presentation/viewmodels/useProfilePageViewModel";
export { useAvatarViewModel } from "./src/presentation/viewmodels/useAvatarViewModel";
export { useForceChangePasswordViewModel } from "./src/presentation/viewmodels/useForceChangePasswordViewModel";

// Components
export { ProfileTelemetryHud } from "./src/presentation/components/ProfileTelemetryHud";
export { ProfileRailLayout } from "./src/presentation/components/ProfileRailLayout";
export { EnrollPasskeyModal } from "./src/presentation/components/EnrollPasskeyModal";
export { TwoFactorWizardModal } from "./src/presentation/components/TwoFactorWizardModal";
export { ForensicPayloadDrawer } from "./src/presentation/components/ForensicPayloadDrawer";
export { SessionCard } from "./src/presentation/components/SessionCard";
export { EmergencyLockdownDialog } from "./src/presentation/components/EmergencyLockdownDialog";
export { BiometricSudoModal } from "./src/presentation/components/BiometricSudoModal";
export { PersonalAccessTokenDialog } from "./src/presentation/components/PersonalAccessTokenDialog";
export { AvatarUpload } from "./src/presentation/components/AvatarUpload";
export { ProfileInfoForm } from "./src/presentation/components/ProfileInfoForm";
export { PasswordChangeForm } from "./src/presentation/components/PasswordChangeForm";
export { ActivityTimeline } from "./src/presentation/components/ActivityTimeline";
export { ExternalLoginsSection } from "./src/presentation/components/ExternalLoginsSection";
export { TwoFactorStatus } from "./src/presentation/components/TwoFactorStatus";
