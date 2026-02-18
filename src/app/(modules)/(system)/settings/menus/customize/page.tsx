import { Metadata } from "next";
import dynamic from "next/dynamic";

const MenuCustomizeView = dynamic(
  () =>
    import("@/modules/system/menus/src/presentation/views/MenuCustomizeView").then((m) => ({
      default: m.MenuCustomizeView,
    }))
);

export const metadata: Metadata = {
  title: "Customize Menu",
  description: "Personalize your menu layout, names, and visibility",
};

export default function MenuCustomizePage() {
  return (
    <main>
      <MenuCustomizeView />
    </main>
  );
}
