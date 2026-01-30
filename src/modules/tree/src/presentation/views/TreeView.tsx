"use client";

import { GenericTreeView } from "@core/ui/generic-tree-view";
import { useTreeViewModel } from "@core/hooks/use-tree-view-model";
import { TreeNode as TreeNodeEntity } from "../../domain/entities/TreeNode";

export function TreeNodeView() {
  const vm = useTreeViewModel<TreeNodeEntity>(null, {
    staticData: [
      new TreeNodeEntity({ id: "1", name: "Root Node", children: [] })
    ] as TreeNodeEntity[], // Provide dummy data or proper service
    getItemDisplayName: (item) => item.name
  });

  return (
    <GenericTreeView<TreeNodeEntity, any, any>
      viewModel={vm}
      title="Tree View"
      subtitle="Manage hierarchical data"
      getId={(n) => n.id}
      getLabel={(n) => n.name}
      getChildren={(n) => n.children}
      renderFormFields={() => []} // Empty config array
      expandOnCardClick={true}
      showAddRoot={true}
    />
  );
}
