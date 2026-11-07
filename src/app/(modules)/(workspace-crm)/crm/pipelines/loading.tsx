import { LoadingSpinner } from "@core/ui/loading-spinner";

export default function CrmPipelinesLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
