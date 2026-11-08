/**
 * Profile & Enterprise Account Module Core Exports
 *
 * Public barrel export for the 9 Clean B2B Enterprise Account Console (/account/*)
 * presentation views, viewmodels, components, and hooks.
 */

// Presentation Views (9 B2B Enterprise Account Views + ForceChangePasswordView)
export { ForceChangePasswordView } from "./src/presentation/views/ForceChangePasswordView";
export { AccountDossierView } from "./src/presentation/views/AccountDossierView";
export { AccountSecurityView } from "./src/presentation/views/AccountSecurityView";
export { AccountSessionsView } from "./src/presentation/views/AccountSessionsView";
export { AccountGovernanceView } from "./src/presentation/views/AccountGovernanceView";
export { AccountActivityView } from "./src/presentation/views/AccountActivityView";
export { AccountPreferencesView } from "./src/presentation/views/AccountPreferencesView";
export { AccountNotificationsView } from "./src/presentation/views/AccountNotificationsView";
export { AccountPlanView } from "./src/presentation/views/AccountPlanView";
export { AccountIntegrationsView } from "./src/presentation/views/AccountIntegrationsView";

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
export * from "./src/presentation/viewmodels/useSovereignAccountSlicesViewModel";

// Components
export { ProfileTelemetryHud } from "./src/presentation/components/ProfileTelemetryHud";
export { ProfileRailLayout } from "./src/presentation/components/ProfileRailLayout";
export { SovereignCommandBar } from "./src/presentation/components/SovereignCommandBar";
export { SovereignSudoGate } from "./src/presentation/components/SovereignSudoGate";
export { SovereignSessionRadar } from "./src/presentation/components/SovereignSessionRadar";
export { PermissionProvenanceGraph } from "./src/presentation/components/PermissionProvenanceGraph";
export { ErgonomicsLiveStage } from "./src/presentation/components/ErgonomicsLiveStage";
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

