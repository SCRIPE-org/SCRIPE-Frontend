"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const ApiKeyDetailView = dynamic(() =>
  import("@modules/integrations/apikeys").then((m) => ({ default: m.ApiKeyDetailView }))
);

interface ApiKeyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ApiKeyDetailPage({ params }: ApiKeyDetailPageProps) {
  use(params); // resolve params asynchronously for Next.js 16/15 standards
  return (
    <div className="flex h-full w-full flex-col">
      <ApiKeyDetailView />
    </div>
  );
}
