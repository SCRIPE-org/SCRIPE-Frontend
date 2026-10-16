import type { Metadata } from "next";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";
import { Booking360View } from "@modules/venue/booking-360/src/presentation/views/Booking360View";

export const metadata: Metadata = {
  title: "Venue Booking",
  description: "Operational reservation detail.",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  const { reservationId } = await params;
  return (
    <ModuleErrorBoundary moduleName="booking360.eyebrow">
      <Booking360View reservationId={reservationId} />
    </ModuleErrorBoundary>
  );
}
