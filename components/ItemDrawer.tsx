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
        className={`absolute inset-0 bg-stone-950/30 transition-opacity ${
          activeSlot ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-[#fbfaf7] p-5 shadow-soft transition-transform duration-300 sm:p-6 ${
          activeSlot ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
              Pick item
            </p>
            <h2 className="text-2xl font-semibold text-stone-950">
              {activeSlot ? slotLabels[activeSlot] : "Items"}
            </h2>
          </div>
          <button
            className="flex size-10 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 hover:border-stone-950"
            onClick={onClose}
            type="button"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 grid gap-3 rounded-lg border border-stone-300 bg-white p-3">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              size={18}
            />
            <input
              className="h-11 w-full rounded-md border border-stone-300 bg-stone-50 pl-10 pr-3 text-sm text-stone-950"
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
                className="h-10 w-full rounded-md border border-stone-300 bg-stone-50 px-3 text-sm text-stone-950"
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
                className="h-10 w-full rounded-md border border-stone-300 bg-stone-50 px-3 text-sm text-stone-950"
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
            return (
              <button
                key={item.id}
                className={`grid grid-cols-[94px_1fr_auto] items-center gap-3 rounded-lg border bg-white p-2 text-left transition hover:border-emerald-700 ${
                  isSelected ? "border-emerald-800" : "border-stone-300"
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
                    <span className="rounded-md bg-stone-100 px-2 py-1">
                      {item.category}
                    </span>
                    <span className="rounded-md bg-stone-100 px-2 py-1">
                      {seasonLabel(item.season)}
                    </span>
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
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
            No clothes for this slot yet.
          </div>
        )}

        {!!items.length && !filteredItems.length && (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
            No items match these filters.
          </div>
        )}
      </aside>
    </div>
  );
}
