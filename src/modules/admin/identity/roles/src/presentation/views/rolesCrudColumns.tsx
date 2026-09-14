/**
 * rolesCrudColumns — Column definitions and localized cell renderers for the roles management grid.
 */

import type { CrudColumn } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import type { Role } from "../../domain/entities/Role";

/**
 * Constructs the columns configuration for the roles CRUD table.
 *
 * @param t Translation function.
 * @param language Current UI language code ('en' or 'ar').
 * @returns Array of column specifications for Role entities.
 */
export function getRolesCrudColumns(
  t: (key: string) => string,
  language: string
): CrudColumn<Role>[] {
  return [
    {
      key: "nameAr",
      label: t("roles.name"),
      sortable: true,
      className: "font-medium",
      render: (_value: unknown, role: Role) => role.getLocalizedName(language),
    },
    {
      key: "code",
      label: t("roles.code"),
      sortable: true,
      className: "font-mono text-xs text-nx-ink-3",
    },
    {
      key: "description",
      label: t("roles.descriptionField"),
      className: "hidden max-w-[28rem] truncate md:table-cell",
      render: (_value: unknown, role: Role) => {
        const text = role.getLocalizedDescription(language);
        return text ? (
          <span className="block truncate text-nx-ink-2" title={text}>
            {text}
          </span>
        ) : (
          <span className="text-nx-ink-3">-</span>
        );
      },
    },
    {
      key: "priority",
      label: t("roles.priority"),
      sortable: true,
      className: "text-end tabular-nums",
    },
    {
      key: "groups",
      label: t("roles.groups"),
      render: (_val: unknown, role: Role) => {
        const groups = role.getLocalizedGroups(language);
        if (groups.length === 0) {
          return <span className="text-nx-ink-3">-</span>;
        }
        const shown = groups.slice(0, 2);
        const overflow = groups.length - shown.length;
        return (
          <div className="flex items-center gap-1 truncate">
            {shown.map((groupName, index) => (
              <Badge
                key={`${index}-${groupName}`}
                variant="secondary"
                className="max-w-[10rem] shrink-0 truncate text-xs"
              >
                {groupName}
              </Badge>
            ))}
            {overflow > 0 && (
              <Badge variant="outline" className="shrink-0 text-xs tabular-nums">
                +{overflow}
              </Badge>
            )}
          </div>
        );
      },
    },
  ];
}
