import { ReportDetailView } from "@modules/compliance/reports";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ComplianceReportDetailPage({ params }: Props) {
  const { id } = await params;
  return <ReportDetailView id={id} />;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Compliance Report · ${id} — NEXORA`,
    description: "View compliance report details and download generated reports.",
  };
}
