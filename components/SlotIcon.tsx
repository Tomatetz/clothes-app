"use client";

import { ClothingSlot } from "@/lib/wardrobe";
import {
  Footprints,
  Package,
  Shirt,
  ShoppingBag,
  SquareMenu
} from "lucide-react";

type SlotIconProps = {
  slot: ClothingSlot;
  size?: number;
};

export function SlotIcon({ slot, size = 18 }: SlotIconProps) {
  if (slot === "outerTop") return <SquareMenu size={size} />;
  if (slot === "bottom") return <Package size={size} />;
  if (slot === "shoes") return <Footprints size={size} />;
  if (slot === "bag") return <ShoppingBag size={size} />;

  return <Shirt size={size} />;
}
