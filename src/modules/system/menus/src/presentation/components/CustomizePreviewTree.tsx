/**
 * Customize Preview Tree
 *
 * Left panel: shows the menu tree as it will appear.
 * Click-to-select an item to edit in the panel.
 * Drag-and-drop to reorder/regroup as customization overrides.
 * Override indicators show colored left borders and badges.
 */
'use client';

import { useCallback, useRef } from 'react';
import { useI18n } from '@core/providers/i18n-provider';
import { Badge } from '@core/ui/badge';
import type { MenuTreeNode } from '../../domain/entities/MenuItem';
import { MenuOverrideScope } from '../../domain/entities/MenuItemRequests';
import type {
      CustomizeDropPosition,
      CustomizeDropTarget,
} from '../viewmodels/useMenuCustomizeViewModel';
import {
      ChevronRight,
      ChevronDown,
      FolderOpen,
      FileText,
      EyeOff,
      Pencil,
      GripVertical,
} from 'lucide-react';
import { cn } from '@core/common/utils';

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface CustomizePreviewTreeProps {
      menuTree: MenuTreeNode[];
      language: string;
      scope: MenuOverrideScope;
      selectedItemId: string | null;
      expandedNodes: Set<string>;
      onToggleExpand: (nodeId: string) => void;
      onSelectItem: (nodeId: string) => void;

      // DnD props
      draggedNode: MenuTreeNode | null;
      dropTarget: CustomizeDropTarget | null;
      onDragStart: (node: MenuTreeNode) => void;
      onDragOver: (nodeId: string, position: CustomizeDropPosition) => void;
      onDragLeave: () => void;
      onDragEnd: () => void;
      onDrop: (targetNodeId: string, position: CustomizeDropPosition) => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CustomizePreviewTree({
      menuTree,
      language,
      scope,
      selectedItemId,
      expandedNodes,
      onToggleExpand,
      onSelectItem,
      draggedNode,
      dropTarget,
      onDragStart,
      onDragOver,
      onDragLeave,
      onDragEnd,
      onDrop,
}: CustomizePreviewTreeProps) {
      return (
            <div className="space-y-0.5">
                  {menuTree
                        .sort((a, b) => a.order - b.order)
                        .map(node => (
                              <PreviewTreeNode
                                    key={node.id}
                                    node={node}
                                    depth={0}
                                    language={language}
                                    scope={scope}
                                    selectedItemId={selectedItemId}
                                    expandedNodes={expandedNodes}
                                    onToggleExpand={onToggleExpand}
                                    onSelectItem={onSelectItem}
                                    draggedNode={draggedNode}
                                    dropTarget={dropTarget}
                                    onDragStart={onDragStart}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDragEnd={onDragEnd}
                                    onDrop={onDrop}
                              />
                        ))}
            </div>
      );
}

/* -------------------------------------------------------------------------- */
/*  Tree Node (recursive) — with native HTML5 DnD                              */
/* -------------------------------------------------------------------------- */

interface PreviewTreeNodeProps {
      node: MenuTreeNode;
      depth: number;
      language: string;
      scope: MenuOverrideScope;
      selectedItemId: string | null;
      expandedNodes: Set<string>;
      onToggleExpand: (nodeId: string) => void;
      onSelectItem: (nodeId: string) => void;
      // DnD
      draggedNode: MenuTreeNode | null;
      dropTarget: CustomizeDropTarget | null;
      onDragStart: (node: MenuTreeNode) => void;
      onDragOver: (nodeId: string, position: CustomizeDropPosition) => void;
      onDragLeave: () => void;
      onDragEnd: () => void;
      onDrop: (targetNodeId: string, position: CustomizeDropPosition) => void;
}

function PreviewTreeNode({
      node,
      depth,
      language,
      scope,
      selectedItemId,
      expandedNodes,
      onToggleExpand,
      onSelectItem,
      draggedNode,
      dropTarget,
      onDragStart,
      onDragOver,
      onDragLeave,
      onDragEnd,
      onDrop,
}: PreviewTreeNodeProps) {
      const { t } = useI18n();
      const rowRef = useRef<HTMLDivElement>(null);
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);
      const isSelected = selectedItemId === node.id;
      const isDragging = draggedNode?.id === node.id;
      const isDropTarget = dropTarget?.nodeId === node.id;
      const dropPosition = isDropTarget ? dropTarget?.position : null;

      // Get override for current scope
      const override = scope === MenuOverrideScope.User
            ? node.userOverride
            : node.tenantOverride;
      const hasOverride = !!override;
      const isHidden = override?.isHidden ?? false;

      // Display name: show override name if available
      const getDisplayName = useCallback(() => {
            if (language === 'ar') {
                  return override?.nameArOverride || node.nameAr;
            }
            return override?.nameEnOverride || node.nameEn;
      }, [language, override, node]);

      const handleClick = useCallback((e: React.MouseEvent) => {
            e.stopPropagation();
            onSelectItem(node.id);
      }, [node.id, onSelectItem]);

      const handleExpandClick = useCallback((e: React.MouseEvent) => {
            e.stopPropagation();
            onToggleExpand(node.id);
      }, [node.id, onToggleExpand]);

      // ── DnD Handlers ───────────────────────────────────────────────────

      const handleDragStartEvent = useCallback(
            (e: React.DragEvent) => {
                  e.stopPropagation();
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', node.id);
                  onDragStart(node);
            },
            [node, onDragStart]
      );

      const handleDragOverEvent = useCallback(
            (e: React.DragEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!rowRef.current || !draggedNode) return;

                  const rect = rowRef.current.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const height = rect.height;

                  // 3-zone detection: top 25% = before, bottom 25% = after, middle 50% = inside
                  let position: CustomizeDropPosition;
                  if (y < height * 0.25) {
                        position = 'before';
                  } else if (y > height * 0.75) {
                        position = 'after';
                  } else {
                        position = 'inside';
                  }

                  onDragOver(node.id, position);
            },
            [node.id, draggedNode, onDragOver]
      );

      const handleDragLeaveEvent = useCallback(
            (e: React.DragEvent) => {
                  e.stopPropagation();
                  // Only fire if we're truly leaving this element (not entering a child)
                  if (rowRef.current && !rowRef.current.contains(e.relatedTarget as Node)) {
                        onDragLeave();
                  }
            },
            [onDragLeave]
      );

      const handleDropEvent = useCallback(
            (e: React.DragEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!rowRef.current || !draggedNode) return;

                  const rect = rowRef.current.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const height = rect.height;

                  let position: CustomizeDropPosition;
                  if (y < height * 0.25) {
                        position = 'before';
                  } else if (y > height * 0.75) {
                        position = 'after';
                  } else {
                        position = 'inside';
                  }

                  onDrop(node.id, position);
            },
            [node.id, draggedNode, onDrop]
      );

      const handleDragEndEvent = useCallback(
            (e: React.DragEvent) => {
                  e.stopPropagation();
                  onDragEnd();
            },
            [onDragEnd]
      );

      return (
            <div className={cn(isDragging && 'opacity-30')}>
                  {/* Drop indicator line (before) */}
                  {isDropTarget && dropPosition === 'before' && (
                        <div
                              className="h-0.5 rounded-full bg-primary mx-2 mb-0.5 transition-all"
                              style={{ marginInlineStart: depth * 20 + 8 }}
                        />
                  )}

                  {/* Node Row */}
                  <div
                        ref={rowRef}
                        onClick={handleClick}
                        draggable
                        onDragStart={handleDragStartEvent}
                        onDragOver={handleDragOverEvent}
                        onDragLeave={handleDragLeaveEvent}
                        onDrop={handleDropEvent}
                        onDragEnd={handleDragEndEvent}
                        className={cn(
                              'group relative flex items-center gap-1.5 py-2 px-2 rounded-lg cursor-pointer',
                              'transition-all duration-150',
                              'border-l-2',
                              // Selected state
                              isSelected
                                    ? 'bg-primary/10 border-l-primary ring-1 ring-primary/20'
                                    : 'hover:bg-muted/50 border-l-transparent',
                              // Override indicator
                              hasOverride && !isSelected && 'border-l-amber-500',
                              // Hidden item styling
                              isHidden && 'opacity-40',
                              // Drop target highlight
                              isDropTarget && dropPosition === 'inside' && 'bg-primary/5 ring-1 ring-primary/30 ring-dashed',
                        )}
                        style={{ marginInlineStart: depth * 20 }}
                  >
                        {/* Drag Handle */}
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 hover:text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />

                        {/* Expand / Collapse */}
                        {hasChildren ? (
                              <button
                                    onClick={handleExpandClick}
                                    className="p-0.5 hover:bg-muted rounded-sm shrink-0"
                              >
                                    {isExpanded ? (
                                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    ) : (
                                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                              </button>
                        ) : (
                              <div className="w-4.5 shrink-0" />
                        )}

                        {/* Icon */}
                        {hasChildren ? (
                              <FolderOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : (
                              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}

                        {/* Name */}
                        <span
                              className={cn(
                                    'text-sm truncate flex-1',
                                    isSelected && 'font-semibold',
                                    isHidden && 'line-through',
                              )}
                        >
                              {getDisplayName()}
                        </span>

                        {/* Override badge */}
                        {hasOverride && (
                              <Badge
                                    variant="outline"
                                    className={cn(
                                          'text-[9px] px-1.5 py-0 font-medium border-0 shrink-0',
                                          isHidden
                                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                    )}
                              >
                                    {isHidden ? (
                                          <><EyeOff className="h-2.5 w-2.5 mr-0.5" /> {t('menus.badgeHidden')}</>
                                    ) : (
                                          <><Pencil className="h-2.5 w-2.5 mr-0.5" /> {t('menus.customized')}</>
                                    )}
                              </Badge>
                        )}
                  </div>

                  {/* Drop indicator line (after) */}
                  {isDropTarget && dropPosition === 'after' && (
                        <div
                              className="h-0.5 rounded-full bg-primary mx-2 mt-0.5 transition-all"
                              style={{ marginInlineStart: depth * 20 + 8 }}
                        />
                  )}

                  {/* Children */}
                  {isExpanded && hasChildren && (
                        <div className="mt-0.5">
                              {node.children
                                    .sort((a, b) => a.order - b.order)
                                    .map(child => (
                                          <PreviewTreeNode
                                                key={child.id}
                                                node={child}
                                                depth={depth + 1}
                                                language={language}
                                                scope={scope}
                                                selectedItemId={selectedItemId}
                                                expandedNodes={expandedNodes}
                                                onToggleExpand={onToggleExpand}
                                                onSelectItem={onSelectItem}
                                                draggedNode={draggedNode}
                                                dropTarget={dropTarget}
                                                onDragStart={onDragStart}
                                                onDragOver={onDragOver}
                                                onDragLeave={onDragLeave}
                                                onDragEnd={onDragEnd}
                                                onDrop={onDrop}
                                          />
                                    ))}
                        </div>
                  )}
            </div>
      );
}
