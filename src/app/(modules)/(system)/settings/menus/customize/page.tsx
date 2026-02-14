import { MenuCustomizeView } from "@/modules/system/menus/src/presentation/views/MenuCustomizeView";
import { Metadata } from "next";

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
