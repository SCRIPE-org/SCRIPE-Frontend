import type { Metadata } from "next";
import { QrApprovePageView } from "@modules/auth/signin/src/presentation/views/QrApprovePageView";

export const metadata: Metadata = {
  title: "Approve Sign-in — SCRIPE",
  description: "Approve or reject a QR code sign-in request on your account.",
  robots: { index: false, follow: false },
};

/**
 * /qr-approve — QR Code Sign-in Approval Page (mobile side)
 *
 * Public page — no auth required.
 * Loaded when user scans a QR code on the login screen of another device.
 * URL params: ?session=<sessionId>&device=<deviceInfo>&loc=<location>
 */
export default function QrApprovePage() {
  return <QrApprovePageView />;
}
