"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { ClothingSlot, slotLabels } from "@/lib/wardrobe";
import Image from "next/image";
import { Minus } from "lucide-react";
import { SlotIcon } from "@/components/SlotIcon";

type ClosetViewProps = {
  slot: ClothingSlot;
  onOpen: () => void;
  compact?: boolean;
};

export function ClosetView({ slot, onOpen, compact = false }: ClosetViewProps) {
  const { clearSelection, getItemsForSlot, getSelectedItem } = useWardrobe();
  const selected = getSelectedItem(slot);
  const count = getItemsForSlot(slot).length;

  return (
    <div className="group relative overflow-hidden rounded-md bg-white/78 text-left shadow-[0_10px_32px_rgba(28,25,23,0.08)] ring-1 ring-stone-950/5 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(28,25,23,0.12)] hover:ring-emerald-800/30">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(232,238,233,0.3))]" />
      <div className="relative flex h-full flex-col p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            className="flex min-w-0 items-center gap-2 text-left"
            onClick={onOpen}
            type="button"
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-stone-950 text-white">
              <SlotIcon slot={slot} />
            </span>
            <div>
              <div className="text-base font-semibold text-stone-950">
                {slotLabels[slot]}
              </div>
              <div className="text-xs text-stone-500">{count} items</div>
            </div>
          </button>
          <button
            className="flex size-9 items-center justify-center rounded-md bg-white/70 text-stone-600 shadow-sm ring-1 ring-stone-950/10 transition hover:bg-red-50 hover:text-red-700 hover:ring-red-700/30 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!selected}
            onClick={() => clearSelection(slot)}
            type="button"
            title={`Clear ${slotLabels[slot]}`}
          >
            <Minus size={18} />
          </button>
        </div>

        {selected ? (
          <button
            className="flex flex-1 flex-col gap-3 text-left"
            onClick={onOpen}
            type="button"
          >
            <div
              className={`relative w-full overflow-hidden rounded-md bg-stone-100 ${
                compact ? "aspect-[4/3]" : "aspect-[16/10]"
              }`}
            >
              <Image
                src={selected.imageUrl}
                alt={selected.name}
                fill
                className="object-cover"
                unoptimized
                priority={slot === "top"}
                sizes={
                  compact
                    ? "(max-width: 1024px) 100vw, 312px"
                    : "(max-width: 768px) 100vw, (max-width: 1280px) 40vw, 430px"
                }
              />
            </div>
            <div className="min-w-0 px-0.5 pb-0.5">
              <div
                className={`truncate font-semibold text-stone-950 ${
                  compact ? "text-lg" : "text-xl"
                }`}
              >
                {selected.name}
              </div>
              {!compact && (
                <div className="mt-1 truncate text-sm text-stone-600">
                  {selected.brand} · {selected.category}
                </div>
              )}
            </div>
          </button>
        ) : (
          <button
            className={`flex w-full flex-1 items-center justify-center rounded-md border border-dashed border-stone-300/80 bg-stone-100/55 px-4 text-center text-sm font-medium text-stone-500 transition hover:border-emerald-700/60 hover:bg-emerald-50 hover:text-emerald-900 ${
              compact ? "aspect-[4/3]" : "aspect-[16/10]"
            }`}
            onClick={onOpen}
            type="button"
          >
            Choose {slotLabels[slot].toLowerCase()}
          </button>
        )}
      </div>
    </div>
  );
}
