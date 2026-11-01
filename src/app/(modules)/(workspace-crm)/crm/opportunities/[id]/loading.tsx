import { LoadingSpinner } from "@core/ui/loading-spinner";

export default function CrmOpportunityDetailLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
