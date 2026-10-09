import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { DishGrid } from "@/components/sections/kitchen/DishGrid";
import { VccWay } from "@/components/sections/kitchen/VccWay";
import { CtaBand } from "@/components/sections/CtaBand";
import { kitchen } from "@/data/dishes";

export const metadata: Metadata = {
  title: "Thatha's Kitchen",
  description: "Signature dishes from Village Cooking Channel's open-air kitchen: firewood, giant pots and hand-ground masala.",
  alternates: { canonical: "/kitchen" },
};

export default function KitchenPage() {
  return (
    <>
      <PageHeader {...kitchen.header} seed={41} />
      <DishGrid />
      <VccWay />
      <CtaBand />
    </>
  );
}
