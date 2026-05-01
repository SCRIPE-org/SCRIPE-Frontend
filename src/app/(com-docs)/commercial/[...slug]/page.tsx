import { CommercialPageConnector } from "@/modules/docs/src/presentation/views/CommercialPageConnector";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function CommercialSlugPage({ params }: Props) {
  const { slug } = await params;
  const fullSlug = `commercial/${slug.join("/")}`;

  return <CommercialPageConnector slug={fullSlug} />;
}
