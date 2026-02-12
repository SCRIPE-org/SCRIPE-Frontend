/**
 * Customize Preview Tree
 *
 * Left panel: shows the menu tree as it will appear.
 * Click-to-select an item to edit in the panel.
 * Override indicators show colored left borders and badges.
 */
'use client';

import { useCallback } from 'react';
import { useI18n } from '@core/providers/i18n-provider';
import { Badge } from '@core/ui/badge';
import type { MenuTreeNode } from '../../domain/entities/MenuItem';
import { MenuOverrideScope } from '../../domain/entities/MenuItemRequests';
import {
      ChevronRight,
      ChevronDown,
      FolderOpen,
      FileText,
      EyeOff,
      Pencil,
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
                              />
                        ))}
            </div>
      );
}

/* -------------------------------------------------------------------------- */
/*  Tree Node (recursive)                                                      */
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
}: PreviewTreeNodeProps) {
      const { t } = useI18n();
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);
      const isSelected = selectedItemId === node.id;

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

      return (
            <div>
                  {/* Node Row */}
                  <div
                        onClick={handleClick}
                        className={cn(
                              'group relative flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer',
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
                        )}
                        style={{ marginInlineStart: depth * 20 }}
                  >
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
                                          />
                                    ))}
                        </div>
                  )}
            </div>
      );
}
