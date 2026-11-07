import { Metadata } from "next";
import { ProfileSecurityView } from "@modules/profile/core/src/presentation/views/ProfileSecurityView";

export const metadata: Metadata = {
  title: "Security & Passkey Vault • SCRIPE Profile",
  description: "FIDO2 WebAuthn Passkeys, TOTP 2FA, and Biometric Sudo Mode",
};

export default function ProfileSecurityPage() {
  return <ProfileSecurityView />;
}
