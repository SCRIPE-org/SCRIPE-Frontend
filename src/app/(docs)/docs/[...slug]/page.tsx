import { TechnicalPageConnector } from "@modules/docs/src/presentation/views/TechnicalPageConnector";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsSlugPage({ params }: Props) {
  const { slug } = await params;
  const fullSlug = slug.join("/");

  return <TechnicalPageConnector slug={fullSlug} />;
}
