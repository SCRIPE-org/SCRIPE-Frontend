import { DocsPageView } from '@modules/docs/src/presentation/views/DocsPageView';

interface Props {
      params: Promise<{ slug: string[] }>;
}

export default async function DocsSlugPage({ params }: Props) {
      const { slug } = await params;
      const fullSlug = slug.join('/');

      return <DocsPageView slug={fullSlug} />;
}
