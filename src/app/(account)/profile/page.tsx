import { Metadata } from "next";
import { ProfileDossierView } from "@modules/profile/core/src/presentation/views/ProfileDossierView";

export const metadata: Metadata = {
  title: "Executive Dossier • SCRIPE Profile",
  description: "Personal credentials, bio, and operational availability",
};

export default function ProfileDossierPage() {
  return <ProfileDossierView />;
}
