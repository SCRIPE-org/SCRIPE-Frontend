import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { MediaLibraryView } from "@modules/media/src/presentation/views/MediaLibraryView";

export const metadata: Metadata = {
  title: "Media Library | SCRIPE",
  description: "Browse and manage media assets and folders",
};

export default function MediaPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Media Library">
        <MediaLibraryView />
      </ModuleErrorBoundary>
    </main>
  );
}
