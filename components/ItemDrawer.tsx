"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { ClothingSlot, seasonLabel, slotLabels } from "@/lib/wardrobe";
import Image from "next/image";
import { Check, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ItemDrawerProps = {
  activeSlot: ClothingSlot | null;
  onClose: () => void;
};

function HighlightedText({ query, text }: { query: string; text: string }) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return text;

  const normalizedText = text.toLowerCase();
  const parts = [];
  let cursor = 0;
  let matchIndex = normalizedText.indexOf(normalizedQuery);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push({
        highlighted: false,
        text: text.slice(cursor, matchIndex)
      });
    }

    parts.push({
      highlighted: true,
      text: text.slice(matchIndex, matchIndex + normalizedQuery.length)
    });

    cursor = matchIndex + normalizedQuery.length;
    matchIndex = normalizedText.indexOf(normalizedQuery, cursor);
  }

  if (cursor < text.length) {
    parts.push({
      highlighted: false,
      text: text.slice(cursor)
    });
  }

  return (
    <>
      {parts.map((part, index) =>
        part.highlighted ? (
          <mark
            key={`${part.text}-${index}`}
            className="rounded bg-amber-200 px-0.5 text-stone-950"
          >
            {part.text}
          </mark>
        ) : (
          <span key={`${part.text}-${index}`}>{part.text}</span>
        )
      )}
    </>
  );
}

export function ItemDrawer({ activeSlot, onClose }: ItemDrawerProps) {
  const { getItemsForSlot, outfit, selectItem } = useWardrobe();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const items = useMemo(
    () => (activeSlot ? getItemsForSlot(activeSlot) : []),
    [activeSlot, getItemsForSlot]
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort(),
    [items]
  );
  const brandOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.brand))).sort(),
    [items]
  );
  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.brand.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesBrand = brandFilter === "all" || item.brand === brandFilter;

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [brandFilter, categoryFilter, items, searchQuery]);

  useEffect(() => {
    setSearchQuery("");
    setCategoryFilter("all");
    setBrandFilter("all");
  }, [activeSlot]);

  return (
    <div
      className={`fixed inset-0 z-40 transition ${
        activeSlot ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!activeSlot}
    >
      <div
        className={`absolute inset-0 bg-stone-950/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          activeSlot ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-white/60 bg-stone-50/[0.72] px-5 pb-5 shadow-[-24px_0_70px_rgba(28,25,23,0.18)] backdrop-blur-2xl transition-transform duration-300 sm:px-6 sm:pb-6 ${
          activeSlot ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-20 -mx-5 mb-5 flex items-center justify-between gap-4 border-b border-white/60 bg-stone-50/70 px-5 py-4 backdrop-blur-2xl sm:-mx-6 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
              Pick item
            </p>
            <h2 className="text-2xl font-semibold text-stone-950">
              {activeSlot ? slotLabels[activeSlot] : "Items"}
            </h2>
          </div>
          <button
            className="flex size-10 items-center justify-center rounded-md border border-white/80 bg-white/[0.55] text-stone-700 shadow-sm backdrop-blur-xl transition hover:border-stone-400 hover:bg-white/80"
            onClick={onClose}
            type="button"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 grid gap-3 rounded-lg border border-white/70 bg-white/[0.42] p-3 shadow-[0_12px_35px_rgba(28,25,23,0.08)] backdrop-blur-xl">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              size={18}
            />
            <input
              className="h-11 w-full rounded-md border border-white/80 bg-white/[0.55] pl-10 pr-3 text-sm text-stone-950 shadow-inner backdrop-blur-md placeholder:text-stone-500"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or brand"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                Category
              </span>
              <select
                className="h-10 w-full rounded-md border border-white/80 bg-white/[0.55] px-3 text-sm text-stone-950 shadow-inner backdrop-blur-md"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                Brand
              </span>
              <select
                className="h-10 w-full rounded-md border border-white/80 bg-white/[0.55] px-3 text-sm text-stone-950 shadow-inner backdrop-blur-md"
                value={brandFilter}
                onChange={(event) => setBrandFilter(event.target.value)}
              >
                <option value="all">All brands</option>
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-3">
          {filteredItems.map((item) => {
            const isSelected = activeSlot ? outfit[activeSlot] === item.id : false;
            const selectedElsewhere = Object.entries(outfit).find(
              ([slot, selectedId]) => slot !== activeSlot && selectedId === item.id
            )?.[0] as ClothingSlot | undefined;
            const isSelectedElsewhere = Boolean(selectedElsewhere);
            return (
              <button
                key={item.id}
                className={`grid grid-cols-[94px_1fr_auto] items-center gap-3 rounded-lg border bg-white/[0.48] p-2 text-left shadow-[0_8px_24px_rgba(28,25,23,0.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-700/70 hover:bg-white/[0.72] hover:shadow-[0_14px_32px_rgba(28,25,23,0.1)] ${
                  isSelected
                    ? "border-emerald-800/80 bg-emerald-50/[0.55]"
                    : isSelectedElsewhere
                      ? "border-white/60 opacity-55 grayscale"
                      : "border-white/70"
                }`}
                onClick={() => {
                  if (!activeSlot) return;
                  selectItem(activeSlot, item.id);
                  onClose();
                }}
                type="button"
              >
                <div className="relative h-24 overflow-hidden rounded-md bg-stone-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="94px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-stone-950">
                    <HighlightedText query={searchQuery} text={item.name} />
                  </div>
                  <div className="mt-1 text-sm text-stone-600">
                    <HighlightedText query={searchQuery} text={item.brand} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-600">
                    <span className="rounded-md border border-white/60 bg-white/[0.45] px-2 py-1">
                      {item.category}
                    </span>
                    <span className="rounded-md border border-white/60 bg-white/[0.45] px-2 py-1">
                      {seasonLabel(item.season)}
                    </span>
                    {selectedElsewhere && (
                      <span className="rounded-md border border-white/60 bg-stone-200/[0.55] px-2 py-1 text-stone-700">
                        Selected in {slotLabels[selectedElsewhere]}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`flex size-9 items-center justify-center rounded-md ${
                    isSelected
                      ? "bg-emerald-800 text-white"
                      : "border border-stone-300 text-stone-400"
                  }`}
                >
                  <Check size={17} />
                </span>
              </button>
            );
          })}
        </div>

        {!items.length && (
          <div className="rounded-lg border border-dashed border-white/80 bg-white/[0.42] p-8 text-center text-sm text-stone-500 shadow-sm backdrop-blur-xl">
            No clothes for this slot yet.
          </div>
        )}

        {!!items.length && !filteredItems.length && (
          <div className="rounded-lg border border-dashed border-white/80 bg-white/[0.42] p-8 text-center text-sm text-stone-500 shadow-sm backdrop-blur-xl">
            No items match these filters.
          </div>
        )}
      </aside>
    </div>
  );
}
