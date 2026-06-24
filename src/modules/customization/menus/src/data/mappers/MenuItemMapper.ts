import { MenuItem } from "../../domain/entities/MenuItem";
import type { MenuItemData } from "../../domain/entities/MenuItem";

export class MenuItemMapper {
  static toEntity(dto: MenuItemData): MenuItem {
    return new MenuItem({
      ...dto,
      id: dto.id ?? "",
      slug: dto.slug ?? "",
      nameEn: dto.nameEn ?? "",
      nameAr: dto.nameAr ?? "",
      href: dto.href ?? "",
      icon: dto.icon ?? "",
      parentMenuItemId: dto.parentMenuItemId ?? "",
      order: dto.order ?? 0,
      resource: dto.resource ?? "",
      isActive: dto.isActive ?? false,
      children: dto.children ?? [],
      workspaceId: dto.workspaceId ?? "",
    });
  }
}
