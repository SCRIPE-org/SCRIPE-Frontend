import type { Metadata } from "next";
import { CommercialPageConnector } from "@modules/docs/src/presentation/views/CommercialPageConnector";
import { docsContainer } from "@modules/docs/di";
import { allDocsEn } from "@modules/docs/src/locales/docs-registry";

interface Props {
  params: Promise<{ slug: string[] }>;
}

// Same dot-path key resolution DocsI18nProvider's t() uses at runtime, minus the
// language switch — generateMetadata runs server-side before any client i18n
// context mounts, so the English copy is what tab titles / OG tags get. The
// commercial and technical catch-alls share one DocsRepository + locale
// registry (commercial pages register under the "commercial/..." slug prefix),
// so this mirrors (docs)/docs/[...slug]/page.tsx's resolver rather than
// inventing a second lookup.
function resolveDocsKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let value: unknown = allDocsEn;
  for (const part of key.split(".")) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof value === "string" ? value : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = `commercial/${slug.join("/")}`;
  const page = docsContainer.docsRepository.getPage(fullSlug);

  const title = resolveDocsKey(page?.titleKey);
  const description = resolveDocsKey(page?.descriptionKey);

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  };
}

export default async function CommercialSlugPage({ params }: Props) {
  const { slug } = await params;
  const fullSlug = `commercial/${slug.join("/")}`;

  return <CommercialPageConnector slug={fullSlug} />;
}
