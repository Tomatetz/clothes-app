"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { ClothingSlot, seasonLabel, slotLabels } from "@/lib/wardrobe";
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
    <div
      className="group relative min-h-[180px] overflow-hidden rounded-lg border border-stone-300 bg-white text-left shadow-soft transition hover:-translate-y-0.5 hover:border-emerald-700"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.74),rgba(238,241,237,0.52))]" />
      <div className="relative flex h-full min-h-inherit flex-col p-4 sm:p-5">
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
              <div className="text-lg font-semibold text-stone-950">
                {slotLabels[slot]}
              </div>
              <div className="text-xs text-stone-500">{count} items</div>
            </div>
          </button>
          <button
            className="flex size-9 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 transition hover:border-red-700 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-35"
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
            className={`grid flex-1 gap-4 ${
              compact ? "grid-rows-[minmax(150px,1fr)_auto]" : "sm:grid-cols-[minmax(0,260px)_1fr]"
            }`}
            onClick={onOpen}
            type="button"
          >
            <div className="relative min-h-[170px] overflow-hidden rounded-md bg-stone-100">
              <Image
                src={selected.imageUrl}
                alt={selected.name}
                fill
                className="object-cover"
                unoptimized
                sizes="(max-width: 1024px) 100vw, 280px"
              />
            </div>
            <div className="flex min-w-0 flex-col justify-end">
              <div className={`${compact ? "text-lg" : "text-2xl"} truncate font-semibold text-stone-950`}>
                {selected.name}
              </div>
              {!compact && (
                <>
                  <div className="mt-1 text-sm text-stone-600">
                    {selected.brand} · {selected.category}
                  </div>
                  <div className="mt-3 inline-flex w-fit rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900">
                    {seasonLabel(selected.season)}
                  </div>
                </>
              )}
            </div>
          </button>
        ) : (
          <button
            className="flex flex-1 items-center justify-center rounded-md border border-dashed border-stone-300 bg-stone-50/80 px-4 text-center text-sm text-stone-500 transition hover:border-emerald-700 hover:bg-emerald-50"
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
