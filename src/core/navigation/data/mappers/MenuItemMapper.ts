/**
 * MenuItemMapper — Data Layer Mapper
 *
 * Converts raw API MenuItemDto → MenuItem domain entity.
 * All null-coalescing and default values live here.
 */

import { MenuItem, type MenuItemData, type MenuItemActions } from "../../domain/entities/MenuItem";
import type { MenuItemDto, MenuItemActionsDto } from "../models/MenuItemDto";

export class MenuItemMapper {
  /** Map a raw API DTO → MenuItem domain entity */
  static fromDto(dto: MenuItemDto): MenuItem {
    return new MenuItem(MenuItemMapper.dtoToData(dto));
  }

  /** Map a raw API DTO → MenuItemData plain object */
  static dtoToData(dto: MenuItemDto): MenuItemData {
    return {
      id: dto.id ?? "",
      slug: dto.slug ?? "",
      name: dto.name ?? dto.nameEn ?? "",
      nameEn: dto.nameEn ?? "",
      nameAr: dto.nameAr ?? "",
      href: dto.href ?? null,
      icon: dto.icon ?? "",
      order: dto.order ?? 0,
      resource: dto.resource ?? null,
      actions: dto.actions ? MenuItemMapper.actionsFromDto(dto.actions) : null,
      children: (dto.children ?? []).map(MenuItemMapper.dtoToData),
    };
  }

  /** Map raw any-shaped JSON (legacy or new) → MenuItem (tolerant parsing) */
  static fromJson(json: Record<string, unknown>): MenuItem {
    return new MenuItem({
      id: String(json.id ?? ""),
      slug: String(json.slug ?? ""),
      name: String(json.name ?? json.nameEn ?? ""),
      nameEn: String(json.nameEn ?? json.name ?? ""),
      nameAr: String(json.nameAr ?? ""),
      href: (json.href as string | null) ?? null,
      icon: String(json.icon ?? ""),
      order: Number(json.order ?? 0),
      resource: (json.resource as string | null) ?? null,
      actions: json.actions
        ? MenuItemMapper.actionsFromDto(json.actions as MenuItemActionsDto)
        : null,
      children: Array.isArray(json.children)
        ? json.children.map((c: unknown) =>
            MenuItemMapper.fromJson(c as Record<string, unknown>)
          )
        : [],
    });
  }

  private static actionsFromDto(dto: MenuItemActionsDto): MenuItemActions {
    return {
      canView: dto.canView ?? true,
      canCreate: dto.canCreate ?? false,
      canUpdate: dto.canUpdate ?? false,
      canDelete: dto.canDelete ?? false,
    };
  }
}
