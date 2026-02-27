import { Metadata } from "next";
import dynamic from "next/dynamic";

const RecycleBinView = dynamic(
  () => import("@modules/system/recycle-bin").then((m) => ({ default: m.RecycleBinView }))
);

export const metadata: Metadata = {
  title: "Recycle Bin | NEXORA",
  description: "View and restore recently deleted items",
};

export default function RecycleBinPage() {
  return (
    <main>
      <RecycleBinView />
    </main>
  );
}
