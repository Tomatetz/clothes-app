"use client";

import { ClothingSlot, slotLabels } from "@/lib/wardrobe";
import { ClosetView } from "@/components/ClosetView";
import { ItemDrawer } from "@/components/ItemDrawer";
import { ManagePanel } from "@/components/ManagePanel";
import { useState } from "react";
import { BriefcaseBusiness, Settings2, Shirt, ShoppingBag } from "lucide-react";

const outfitSlots: ClothingSlot[] = ["top", "outerTop", "bottom", "shoes"];

export default function Home() {
  const [activeSlot, setActiveSlot] = useState<ClothingSlot | null>(null);
  const [isManaging, setIsManaging] = useState(false);

  return (
    <main className="h-screen overflow-y-auto px-4 py-5 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 pb-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300/70 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
              Local wardrobe
            </p>
            <h1 className="text-3xl font-semibold text-stone-950 sm:text-4xl">
              Outfit Builder
            </h1>
          </div>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-medium text-white shadow-soft transition hover:bg-emerald-950"
            onClick={() => setIsManaging(true)}
            type="button"
          >
            <Settings2 size={18} />
            Manage
          </button>
        </header>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_156px]">
          <div className="grid gap-4">
            {outfitSlots.map((slot) => (
              <ClosetView
                key={slot}
                slot={slot}
                onOpen={() => setActiveSlot(slot)}
              />
            ))}
          </div>

          <aside className="grid gap-4 lg:grid-rows-[1fr_auto]">
            <ClosetView
              compact
              slot="bag"
              onOpen={() => setActiveSlot("bag")}
            />
            <div className="rounded-lg border border-stone-300 bg-white/80 p-3 shadow-soft backdrop-blur">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <BriefcaseBusiness size={17} />
                Quick pick
              </div>
              <div className="grid grid-cols-5 gap-2 lg:grid-cols-1">
                {[...outfitSlots, "bag" as ClothingSlot].map((slot) => (
                  <button
                    key={slot}
                    className="flex h-12 items-center justify-center gap-2 rounded-md border border-stone-300 bg-stone-50 text-sm font-medium text-stone-800 transition hover:border-emerald-700 hover:bg-emerald-50"
                    onClick={() => setActiveSlot(slot)}
                    type="button"
                    title={`Open ${slotLabels[slot]}`}
                  >
                    {slot === "bag" ? (
                      <ShoppingBag size={18} />
                    ) : (
                      <Shirt size={18} />
                    )}
                    <span className="hidden sm:inline lg:inline">
                      {slotLabels[slot]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>

      <ItemDrawer activeSlot={activeSlot} onClose={() => setActiveSlot(null)} />
      <ManagePanel open={isManaging} onClose={() => setIsManaging(false)} />
    </main>
  );
}
