"use client";

import { GenericTreeView } from "@core/ui/generic-tree-view";
import { useTreeNodeViewModel } from "../viewmodels";

export function TreeNodeView() {
  const { vm, renderFormFields, title, subtitle } = useTreeNodeViewModel();

  return (
    <GenericTreeView 
      viewModel={vm}
      title={title}
      subtitle={subtitle}
      getId={(n) => n.id}
      getLabel={(n) => n.name}
      getChildren={(n) => n.children ?? []}
      renderFormFields={renderFormFields}
      expandOnCardClick={true} // Enable card click expansion
      showAddRoot={true} // Show "Add Root" button in toolbar
    />
  );
}
