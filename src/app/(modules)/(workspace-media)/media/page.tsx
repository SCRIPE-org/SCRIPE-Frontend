import { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

export const metadata: Metadata = {
  title: "Media Library | SCRIPE",
  description: "Browse and manage media assets and folders",
};

export default function MediaPage() {
  return (
    <main className="p-6">
      <ModuleErrorBoundary moduleName="Media Library">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground text-sm">
            Welcome to your Media Library. Here you can upload files, create folders, and organize assets.
          </p>
          <div className="border-dashed border-2 rounded-xl p-12 flex flex-col items-center justify-center text-center gap-2 mt-4 bg-muted/20">
            <span className="text-4xl">📁</span>
            <h3 className="font-semibold text-lg mt-2">No Files Found</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Your media database and chunked file storage backend is fully configured. Start uploading assets to see them here!
            </p>
          </div>
        </div>
      </ModuleErrorBoundary>
    </main>
  );
}
