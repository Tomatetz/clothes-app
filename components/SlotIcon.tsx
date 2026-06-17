"use client";

import { ClothingSlot } from "@/lib/wardrobe";
import {
  Footprints,
  Shirt,
  ShoppingBag,
  SquareMenu
} from "lucide-react";

type SlotIconProps = {
  slot: ClothingSlot;
  size?: number;
};

function PantsIcon({ size }: { size: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M8 3h8" />
      <path d="M9 3 7 21h4l1-10 1 10h4L15 3" />
      <path d="M9 7h6" />
    </svg>
  );
}

export function SlotIcon({ slot, size = 18 }: SlotIconProps) {
  if (slot === "outerTop") return <SquareMenu size={size} />;
  if (slot === "bottom") return <PantsIcon size={size} />;
  if (slot === "shoes") return <Footprints size={size} />;
  if (slot === "bag") return <ShoppingBag size={size} />;

  return <Shirt size={size} />;
}
