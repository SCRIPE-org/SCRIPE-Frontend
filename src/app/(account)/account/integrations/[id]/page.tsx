import { PatDetailPageView } from "@modules/profile/core/src/presentation/views/PatDetailPageView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PersonalAccessTokenDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PatDetailPageView tokenId={id} />;
}
