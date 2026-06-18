"use client";

import { ClothingSlot, slotLabels } from "@/lib/wardrobe";
import { ClosetView } from "@/components/ClosetView";
import { ItemDrawer } from "@/components/ItemDrawer";
import { ManagePanel } from "@/components/ManagePanel";
import { SlotIcon } from "@/components/SlotIcon";
import { useState } from "react";
import { BriefcaseBusiness, Settings2 } from "lucide-react";

const outfitSlots: ClothingSlot[] = ["top", "outerTop", "bottom", "shoes"];

export default function Home() {
  const [activeSlot, setActiveSlot] = useState<ClothingSlot | null>(null);
  const [isManaging, setIsManaging] = useState(false);

  return (
    <main className="h-screen overflow-y-auto px-4 py-3 sm:px-8 sm:py-4 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col pb-8">
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_312px]">
          <div className="grid content-start gap-3 md:grid-cols-2">
            {outfitSlots.map((slot) => (
              <ClosetView
                key={slot}
                slot={slot}
                onOpen={() => setActiveSlot(slot)}
              />
            ))}
          </div>

          <aside className="grid content-start gap-3">
            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-medium text-white shadow-[0_8px_20px_rgba(28,25,23,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-950"
              onClick={() => setIsManaging(true)}
              type="button"
            >
              <Settings2 size={18} />
              Manage
            </button>
            <ClosetView
              compact
              slot="bag"
              onOpen={() => setActiveSlot("bag")}
            />
            <div className="rounded-md bg-white/70 p-3 shadow-[0_10px_30px_rgba(28,25,23,0.08)] ring-1 ring-stone-950/5 backdrop-blur">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <BriefcaseBusiness size={17} />
                Quick pick
              </div>
              <div className="grid grid-cols-5 gap-2 lg:grid-cols-1">
                {[...outfitSlots, "bag" as ClothingSlot].map((slot) => (
                  <button
                    key={slot}
                    className="flex h-12 items-center justify-center gap-2 rounded-md bg-stone-100/80 text-sm font-medium text-stone-800 transition duration-200 hover:bg-emerald-100/80 hover:text-emerald-950"
                    onClick={() => setActiveSlot(slot)}
                    type="button"
                    title={`Open ${slotLabels[slot]}`}
                  >
                    <SlotIcon slot={slot} />
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
