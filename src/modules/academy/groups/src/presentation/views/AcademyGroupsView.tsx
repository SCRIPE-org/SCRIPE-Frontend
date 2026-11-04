"use client";

import { useState } from "react";
import { TrainingGroupsListView } from "./TrainingGroupsListView";
import { TrainingGroupDetailView } from "./TrainingGroupDetailView";
import type { TrainingGroup } from "../../domain/entities/TrainingGroup";

interface AcademyGroupsViewProps {
  initialGroupId?: string;
  initialOfferingId?: string;
}

export function AcademyGroupsView({ initialGroupId, initialOfferingId }: AcademyGroupsViewProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialGroupId || null);

  if (selectedGroupId) {
    return (
      <TrainingGroupDetailView
        groupId={selectedGroupId}
        onBack={() => setSelectedGroupId(null)}
      />
    );
  }

  return (
    <TrainingGroupsListView
      offeringId={initialOfferingId}
      onSelectGroup={(group: TrainingGroup) => setSelectedGroupId(group.id)}
    />
  );
}
