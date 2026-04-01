/**
 * BuilderPropsPanel — Properties editor for the selected canvas component
 *
 * Shows grid placement controls and component-specific props.
 * Renders dynamically based on the selected component's type.
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { cn } from "@/core/common/utils";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Trash2, Eye, EyeOff, Copy, ArrowUp, ArrowDown, Lock, Unlock } from "lucide-react";
import type { CanvasComponent, CanvasComponentType, GridAlignment, PositionMode } from "../../../domain/entities/CanvasComponent";
import { COMPONENT_CATALOG } from "../../../domain/entities/CanvasComponent";
import { useI18n } from "@core/providers/i18n-provider";

interface BuilderPropsPanelProps {
  component: CanvasComponent;
  positionMode: PositionMode;
  onUpdate: (id: string, updates: Partial<CanvasComponent>) => void;
  onUpdateProps: (id: string, props: Record<string, unknown>) => void;
  onRemove: (id: string) => boolean;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onReorderZ: (id: string, direction: 'forward' | 'back') => void;
  onLock: (id: string) => void;
  onUnlock: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
}

const ALIGNMENT_OPTIONS: { value: GridAlignment; label: string }[] = [
  { value: 'start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'end', label: 'End' },
];

/** Parse "N / M" grid string into [start, end] */
function parseGridSpan(span: string): [number, number] {
  const match = span.match(/(\d+)\s*\/\s*(\d+)/);
  if (match) return [parseInt(match[1], 10), parseInt(match[2], 10)];
  return [1, 2];
}

export function BuilderPropsPanel({ component, positionMode, onUpdate, onUpdateProps, onRemove, onDuplicate, onToggleVisibility, onReorderZ, onLock, onUnlock, onResize,
}: BuilderPropsPanelProps) {
  const { t } = useI18n();
  const catalog = COMPONENT_CATALOG.find(c => c.type === component.type);
  const [colStart, colEnd] = parseGridSpan(component.gridColumn);
  const [rowStart, rowEnd] = parseGridSpan(component.gridRow);
  const isAbsolute = positionMode === 'absolute';

  return (
    <div className="space-y-4 border-t border-border pt-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">
          {t(catalog?.labelKey || '') || component.type}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleVisibility(component.id)}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            title={component.visible ? 'Hide' : 'Show'}
          >
            {component.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
          <button
            onClick={() => onDuplicate(component.id)}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            title={t('studio.builder.duplicate') || 'Duplicate'}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          {!catalog?.required && (
            <button
              onClick={() => onRemove(component.id)}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive transition-colors"
              title={t('studio.builder.remove') || 'Remove'}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Position Section */}
      <div className="space-y-3">
        {isAbsolute ? (
          /* ── Free-form position controls ── */
          <>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {t('studio.builder.props.position') || 'Position'}
              </p>
              <button
                onClick={() => component.locked ? onUnlock(component.id) : onLock(component.id)}
                className={cn(
                  "h-6 w-6 flex items-center justify-center rounded-md transition-colors",
                  component.locked
                    ? "bg-destructive/10 text-destructive"
                    : "hover:bg-muted text-muted-foreground"
                )}
                title={component.locked ? 'Unlock' : 'Lock'}
              >
                {component.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">X</Label>
                <Input
                  type="number"
                  min={0}
                  value={component.x}
                  onChange={(e) => onUpdate(component.id, { x: parseInt(e.target.value, 10) || 0 })}
                  className="h-8 text-xs font-mono"
                  disabled={component.locked}
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Y</Label>
                <Input
                  type="number"
                  min={0}
                  value={component.y}
                  onChange={(e) => onUpdate(component.id, { y: parseInt(e.target.value, 10) || 0 })}
                  className="h-8 text-xs font-mono"
                  disabled={component.locked}
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">W</Label>
                <Input
                  type="number"
                  min={catalog?.minWidth || 40}
                  value={component.width || ''}
                  onChange={(e) => onResize(component.id, parseInt(e.target.value, 10) || 200, component.height || 0)}
                  className="h-8 text-xs font-mono"
                  disabled={component.locked}
                  placeholder="auto"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">H</Label>
                <Input
                  type="number"
                  min={catalog?.minHeight || 20}
                  value={component.height || ''}
                  onChange={(e) => onResize(component.id, component.width || 200, parseInt(e.target.value, 10) || 0)}
                  className="h-8 text-xs font-mono"
                  disabled={component.locked}
                  placeholder="auto"
                />
              </div>
            </div>
          </>
        ) : (
          /* ── Grid placement controls ── */
          <>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {t('studio.builder.props.gridPlacement') || 'Grid Placement'}
            </p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Col Start</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={colStart}
              onChange={(e) => onUpdate(component.id, { gridColumn: `${e.target.value} / ${colEnd}` })}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Col End</Label>
            <Input
              type="number"
              min={2}
              max={13}
              value={colEnd}
              onChange={(e) => onUpdate(component.id, { gridColumn: `${colStart} / ${e.target.value}` })}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Row Start</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={rowStart}
              onChange={(e) => onUpdate(component.id, { gridRow: `${e.target.value} / ${rowEnd}` })}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Row End</Label>
            <Input
              type="number"
              min={2}
              max={21}
              value={rowEnd}
              onChange={(e) => onUpdate(component.id, { gridRow: `${rowStart} / ${e.target.value}` })}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Alignment */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">H-Align</Label>
            <select
              value={component.alignment}
              onChange={(e) => onUpdate(component.id, { alignment: e.target.value as GridAlignment })}
              className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              {ALIGNMENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">V-Align</Label>
            <select
              value={component.verticalAlignment}
              onChange={(e) => onUpdate(component.id, { verticalAlignment: e.target.value as GridAlignment })}
              className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              {ALIGNMENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
          </>
        )}

        {/* Z-Order */}
        <div className="flex items-center gap-2">
          <Label className="text-[10px] text-muted-foreground flex-1">Layer</Label>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onReorderZ(component.id, 'forward')}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <span className="text-xs font-mono w-6 text-center">{component.zIndex}</span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onReorderZ(component.id, 'back')}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Component-Specific Props */}
      <div className="space-y-3 border-t border-border pt-3">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {t('studio.builder.props.componentSettings') || 'Settings'}
        </p>
        <ComponentSpecificProps type={component.type}
          props={component.props}
          onUpdateProps={(newProps) => onUpdateProps(component.id, newProps)}
        />
      </div>
    </div>
  );
}

/** Render props editor based on component type */
function ComponentSpecificProps({ type,
  props,
  onUpdateProps,
}: {
  type: CanvasComponentType;
  props: Record<string, unknown>;
  onUpdateProps: (props: Record<string, unknown>) => void;
}) {
  const { t } = useI18n();
  switch (type) {
    case 'logo':
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Max Width (px)</Label>
            <Input
              type="number"
              min={50}
              max={400}
              value={(props.maxWidth as number) || 200}
              onChange={(e) => onUpdateProps({ maxWidth: parseInt(e.target.value, 10) || 200 })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      );

    case 'loginForm':
      return (
        <div className="space-y-2">
          {[
            { key: 'showSocial', label: 'Show Social Login' },
            { key: 'showRemember', label: 'Show Remember Me' },
            { key: 'showForgot', label: 'Show Forgot Password' },
            { key: 'showRegister', label: 'Show Register Link' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(props[key])}
                onChange={(e) => onUpdateProps({ [key]: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-border"
              />
              <span className="text-xs text-foreground">{label}</span>
            </label>
          ))}
        </div>
      );

    case 'heading':
    case 'subtitle':
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Text</Label>
            <Input
              value={(props.text as string) || ''}
              onChange={(e) => onUpdateProps({ text: e.target.value })}
              placeholder={type === 'heading' ? 'Welcome Back' : 'Sign in to continue'}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Font Size (px)</Label>
            <Input
              type="number"
              min={10}
              max={72}
              value={(props.fontSize as number) || (type === 'heading' ? 32 : 16)}
              onChange={(e) => onUpdateProps({ fontSize: parseInt(e.target.value, 10) })}
              className="h-8 text-xs"
            />
          </div>
          {type === 'heading' && (
            <div>
              <Label className="text-[10px] text-muted-foreground">Font Weight</Label>
              <select
                value={(props.fontWeight as number) || 700}
                onChange={(e) => onUpdateProps({ fontWeight: parseInt(e.target.value, 10) })}
                className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
              >
                {[400, 500, 600, 700, 800, 900].map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      );

    case 'ctaButton':
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Label</Label>
            <Input
              value={(props.label as string) || ''}
              onChange={(e) => onUpdateProps({ label: e.target.value })}
              placeholder="Get Started"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">URL</Label>
            <Input
              value={(props.url as string) || ''}
              onChange={(e) => onUpdateProps({ url: e.target.value })}
              placeholder="https://..."
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Variant</Label>
            <select
              value={(props.variant as string) || 'default'}
              onChange={(e) => onUpdateProps({ variant: e.target.value })}
              className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="default">Default</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
            </select>
          </div>
        </div>
      );

    case 'image':
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Image URL</Label>
            <Input
              value={(props.src as string) || ''}
              onChange={(e) => onUpdateProps({ src: e.target.value })}
              placeholder="https://..."
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Alt Text</Label>
            <Input
              value={(props.alt as string) || ''}
              onChange={(e) => onUpdateProps({ alt: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Object Fit</Label>
            <select
              value={(props.objectFit as string) || 'cover'}
              onChange={(e) => onUpdateProps({ objectFit: e.target.value })}
              className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Border Radius (px)</Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={(props.borderRadius as number) || 8}
              onChange={(e) => onUpdateProps({ borderRadius: parseInt(e.target.value, 10) })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      );

    case 'testimonial':
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Quote</Label>
            <textarea
              value={(props.quote as string) || ''}
              onChange={(e) => onUpdateProps({ quote: e.target.value })}
              placeholder="This product changed..."
              className="w-full h-16 rounded-md border border-border bg-background px-2 py-1.5 text-xs resize-none"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Author</Label>
            <Input
              value={(props.author as string) || ''}
              onChange={(e) => onUpdateProps({ author: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Role</Label>
            <Input
              value={(props.role as string) || ''}
              onChange={(e) => onUpdateProps({ role: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        </div>
      );

    case 'divider':
      return (
        <div>
          <Label className="text-[10px] text-muted-foreground">Style</Label>
          <select
            value={(props.style as string) || 'line'}
            onChange={(e) => onUpdateProps({ style: e.target.value })}
            className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="line">Line</option>
            <option value="space">Space</option>
            <option value="dots">Dots</option>
          </select>
        </div>
      );

    case 'copyright':
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Text</Label>
            <Input
              value={(props.text as string) || ''}
              onChange={(e) => onUpdateProps({ text: e.target.value })}
              placeholder="© 2026 Company Name"
              className="h-8 text-xs"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(props.poweredBy)}
              onChange={(e) => onUpdateProps({ poweredBy: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-border"
            />
            <span className="text-xs text-foreground">Show &quot;Powered by&quot;</span>
          </label>
        </div>
      );

    case 'socialLogin':
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Layout</Label>
            <select
              value={(props.layout as string) || 'row'}
              onChange={(e) => onUpdateProps({ layout: e.target.value })}
              className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="row">Row</option>
              <option value="column">Column</option>
              <option value="grid">Grid</option>
            </select>
          </div>
        </div>
      );

    case 'featureList': {
      const featureItems = (Array.isArray(props.items) ? props.items : []) as Array<{ title: string; desc?: string }>;
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">{t('studio.builder.props.variant') || 'Variant'}</Label>
            <select
              value={(props.variant as string) || 'list'}
              onChange={(e) => onUpdateProps({ variant: e.target.value })}
              className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="list">{t('studio.builder.props.variantList') || 'List'}</option>
              <option value="grid">{t('studio.builder.props.variantGrid') || 'Grid'}</option>
            </select>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">{t('studio.builder.props.maxItems') || 'Max Items'}</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={(props.maxItems as number) || 6}
              onChange={(e) => onUpdateProps({ maxItems: parseInt(e.target.value, 10) || 6 })}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">{t('studio.builder.props.items') || 'Items'}</Label>
              <button
                onClick={() => {
                  const newItems = [...featureItems, { title: `Feature ${featureItems.length + 1}`, desc: '' }];
                  onUpdateProps({ items: newItems });
                }}
                className="text-[10px] text-primary hover:text-primary/80 transition-colors"
              >
                + {t('studio.builder.props.addItem') || 'Add'}
              </button>
            </div>
            {featureItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-1 rounded border border-border/50 p-1.5 bg-muted/20">
                <div className="flex-1 space-y-1">
                  <Input
                    value={item.title || ''}
                    onChange={(e) => {
                      const updated = [...featureItems];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      onUpdateProps({ items: updated });
                    }}
                    placeholder={t('studio.builder.props.featureTitle') || 'Title'}
                    className="h-6 text-[10px]"
                  />
                  <Input
                    value={item.desc || ''}
                    onChange={(e) => {
                      const updated = [...featureItems];
                      updated[idx] = { ...updated[idx], desc: e.target.value };
                      onUpdateProps({ items: updated });
                    }}
                    placeholder={t('studio.builder.props.featureDesc') || 'Description'}
                    className="h-6 text-[10px]"
                  />
                </div>
                <button
                  onClick={() => {
                    const updated = featureItems.filter((_, i) => i !== idx);
                    onUpdateProps({ items: updated });
                  }}
                  className="p-0.5 text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {featureItems.length === 0 && (
              <p className="text-[10px] text-muted-foreground italic">{t('studio.builder.props.noItems') || 'Default items shown. Add custom items above.'}</p>
            )}
          </div>
        </div>
      );
    }

    case 'footer': {
      const footerLinks = (Array.isArray(props.links) ? props.links : []) as Array<{ label: string; url: string }>;
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">{t('studio.builder.props.links') || 'Links'}</Label>
            <button
              onClick={() => {
                const newLinks = [...footerLinks, { label: `Link ${footerLinks.length + 1}`, url: '#' }];
                onUpdateProps({ links: newLinks });
              }}
              className="text-[10px] text-primary hover:text-primary/80 transition-colors"
            >
              + {t('studio.builder.props.addLink') || 'Add'}
            </button>
          </div>
          {footerLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-1 rounded border border-border/50 p-1.5 bg-muted/20">
              <div className="flex-1 space-y-1">
                <Input
                  value={link.label || ''}
                  onChange={(e) => {
                    const updated = [...footerLinks];
                    updated[idx] = { ...updated[idx], label: e.target.value };
                    onUpdateProps({ links: updated });
                  }}
                  placeholder={t('studio.builder.props.linkLabel') || 'Label'}
                  className="h-6 text-[10px]"
                />
                <Input
                  value={link.url || ''}
                  onChange={(e) => {
                    const updated = [...footerLinks];
                    updated[idx] = { ...updated[idx], url: e.target.value };
                    onUpdateProps({ links: updated });
                  }}
                  placeholder={t('studio.builder.props.linkUrl') || 'URL'}
                  className="h-6 text-[10px]"
                />
              </div>
              <button
                onClick={() => {
                  const updated = footerLinks.filter((_, i) => i !== idx);
                  onUpdateProps({ links: updated });
                }}
                className="p-0.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {footerLinks.length === 0 && (
            <p className="text-[10px] text-muted-foreground italic">{t('studio.builder.props.noLinks') || 'Default links shown. Add custom links above.'}</p>
          )}
        </div>
      );
    }

    case 'customHtml':
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">{t('studio.builder.props.htmlContent') || 'HTML Content'}</Label>
            <textarea
              value={(props.content as string) || ''}
              onChange={(e) => onUpdateProps({ content: e.target.value })}
              placeholder={'<div class="my-block">...</div>'}
              className="w-full h-24 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-mono resize-y"
              spellCheck={false}
            />
            <p className="text-[9px] text-amber-500 mt-1">{t('studio.builder.props.htmlWarning') || '⚠ Content is sanitized before rendering.'}</p>
          </div>
        </div>
      );

    case 'videoBg':
      return (
        <div className="space-y-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">{t('studio.builder.props.videoUrl') || 'Video URL'}</Label>
            <Input
              value={(props.src as string) || ''}
              onChange={(e) => onUpdateProps({ src: e.target.value })}
              placeholder="https://example.com/video.mp4"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">{t('studio.builder.props.posterUrl') || 'Poster Image URL'}</Label>
            <Input
              value={(props.poster as string) || ''}
              onChange={(e) => onUpdateProps({ poster: e.target.value })}
              placeholder="https://example.com/poster.jpg"
              className="h-8 text-xs"
            />
          </div>
          {[
            { key: 'autoplay', label: t('studio.builder.props.autoplay') || 'Autoplay' },
            { key: 'muted', label: t('studio.builder.props.muted') || 'Muted' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(props[key] ?? true)}
                onChange={(e) => onUpdateProps({ [key]: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-border"
              />
              <span className="text-xs text-foreground">{label}</span>
            </label>
          ))}
        </div>
      );

    default:
      return (
        <p className="text-[10px] text-muted-foreground italic">
          {t('studio.builder.props.noSettings') || 'No configurable settings'}
        </p>
      );
  }
}
