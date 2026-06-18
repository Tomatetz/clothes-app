"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { ClothingSlot, slotLabels } from "@/lib/wardrobe";
import Image from "next/image";
import { Minus } from "lucide-react";

type ClosetViewProps = {
  slot: ClothingSlot;
  onOpen: () => void;
  compact?: boolean;
  index: string;
};

export function ClosetView({
  slot,
  onOpen,
  compact = false,
  index
}: ClosetViewProps) {
  const { clearSelection, getItemsForSlot, getSelectedItem } = useWardrobe();
  const selected = getSelectedItem(slot);
  const count = getItemsForSlot(slot).length;

  return (
    <article className="group flex h-full min-h-0 flex-col border-stone-950/20 bg-[#f3f1eb] text-left">
      <div className="flex h-full flex-col">
        <header className="flex items-end justify-between gap-3 border-b border-stone-950/20 px-3 py-3 sm:px-4">
          <button
            className="flex min-w-0 items-baseline gap-2 text-left"
            onClick={onOpen}
            type="button"
          >
            <span className="text-[10px] font-semibold tracking-[0.2em] text-stone-500">
              {index}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-950">
              {slotLabels[slot]}
            </span>
            <span className="text-[10px] tabular-nums text-stone-400">
              ({String(count).padStart(2, "0")})
            </span>
          </button>
          <button
            className="flex size-7 items-center justify-center text-stone-500 transition hover:text-stone-950 disabled:pointer-events-none disabled:opacity-0"
            disabled={!selected}
            onClick={() => clearSelection(slot)}
            type="button"
            title={`Clear ${slotLabels[slot]}`}
          >
            <Minus size={15} strokeWidth={1.5} />
          </button>
        </header>

        {selected ? (
          <button
            className="flex flex-1 flex-col text-left"
            onClick={onOpen}
            type="button"
          >
            <div
              className={`relative w-full flex-1 overflow-hidden bg-[#e7e4dc] ${
                compact ? "min-h-[260px]" : "min-h-[300px] lg:min-h-0"
              }`}
            >
              <Image
                src={selected.imageUrl}
                alt={selected.name}
                fill
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.025] group-focus-within:scale-[1.025]"
                unoptimized
                priority={slot === "top"}
                sizes={
                  compact
                    ? "(max-width: 1024px) 100vw, 312px"
                    : "(max-width: 768px) 100vw, (max-width: 1280px) 40vw, 430px"
                }
              />
              <span className="absolute bottom-3 right-3 translate-y-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white opacity-0 mix-blend-difference transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                View selection
              </span>
            </div>
            <div className="h-[74px] min-w-0 shrink-0 border-t border-stone-950/20 px-3 py-3 sm:px-4">
              <div className="fashion-display truncate text-[clamp(1.45rem,2vw,2.15rem)] leading-[0.95] tracking-[-0.035em] text-stone-950">
                {selected.name}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.14em] text-stone-500">
                <span className="truncate">{selected.brand}</span>
                <span className="truncate text-right">{selected.category}</span>
              </div>
            </div>
          </button>
        ) : (
          <button
            className="flex w-full flex-1 flex-col text-left"
            onClick={onOpen}
            type="button"
          >
            <div
              className={`relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#ebe8e0] px-4 text-center transition hover:bg-[#e1ded5] ${
                compact ? "min-h-[260px]" : "min-h-[300px] lg:min-h-0"
              }`}
            >
              <span className="absolute inset-x-5 top-1/2 border-t border-stone-950/15" />
              <span className="absolute inset-y-5 left-1/2 border-l border-stone-950/15" />
              <span className="relative bg-[#ebe8e0] px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 transition group-hover:bg-[#e1ded5] group-hover:text-stone-950">
                Select {slotLabels[slot]}
              </span>
            </div>
            <div
              className="h-[74px] shrink-0 border-t border-stone-950/20 px-3 py-3 sm:px-4"
              aria-hidden="true"
            >
              <div className="fashion-display text-[1.45rem] leading-[0.95] text-stone-400">
                No selection
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-stone-400">
                Open wardrobe
              </div>
            </div>
          </button>
        )}
      </div>
    </article>
  );
}
