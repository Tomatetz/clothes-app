"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { ClothingSlot, seasonLabel, slotLabels } from "@/lib/wardrobe";
import Image from "next/image";
import { Check, Minus } from "lucide-react";
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
    <div className="group relative min-h-[180px] overflow-hidden rounded-md bg-white/78 text-left shadow-[0_10px_32px_rgba(28,25,23,0.08)] ring-1 ring-stone-950/5 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(28,25,23,0.12)] hover:ring-emerald-800/30">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(232,238,233,0.3))]" />
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
            className={`grid flex-1 gap-4 ${
              compact ? "grid-rows-[minmax(170px,1fr)_auto]" : "sm:grid-cols-[minmax(280px,330px)_1fr]"
            }`}
            onClick={onOpen}
            type="button"
          >
            <div className="relative min-h-[190px] overflow-hidden rounded-md bg-stone-100">
              <Image
                src={selected.imageUrl}
                alt={selected.name}
                fill
                className="object-cover"
                unoptimized
                priority={slot === "top"}
                sizes="(max-width: 1024px) 100vw, 330px"
              />
              <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-emerald-800 text-white shadow-md ring-2 ring-white/80">
                <Check size={16} strokeWidth={2.5} />
              </span>
            </div>
            <div className="flex min-w-0 flex-col justify-end">
              <div className={`${compact ? "text-lg" : "text-xl sm:text-2xl"} truncate font-semibold text-stone-950`}>
                {selected.name}
              </div>
              {!compact && (
                <>
                  <div className="mt-1 text-sm text-stone-600">
                    {selected.brand} · {selected.category}
                  </div>
                  <div className="mt-3 inline-flex w-fit rounded-full bg-emerald-100/80 px-2.5 py-1 text-xs font-medium text-emerald-950">
                    {seasonLabel(selected.season)}
                  </div>
                </>
              )}
            </div>
          </button>
        ) : (
          <button
            className="flex flex-1 items-center justify-center rounded-md border border-dashed border-stone-300/80 bg-stone-100/55 px-4 text-center text-sm font-medium text-stone-500 transition hover:border-emerald-700/60 hover:bg-emerald-50 hover:text-emerald-900"
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
