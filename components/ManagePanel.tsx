"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import {
  categories,
  ClothingSlot,
  defaultSlotByCategory,
  seasonLabel,
  Season,
  slotLabels
} from "@/lib/wardrobe";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Search, Trash2, X } from "lucide-react";

const fallbackImage = "/samples/item.svg";
const seasons: Season[] = ["all-season", "summer", "winter"];
const allSlots: ClothingSlot[] = ["top", "outerTop", "bottom", "shoes", "bag"];

type ManagePanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ManagePanel({ open, onClose }: ManagePanelProps) {
  const { addItem, error, items, removeItem, updateItem, uploadImage } =
    useWardrobe();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [brand, setBrand] = useState("");
  const [season, setSeason] = useState<Season>("all-season");
  const [slots, setSlots] = useState<ClothingSlot[]>(defaultSlotByCategory[categories[0]]);
  const [imageUrl, setImageUrl] = useState(fallbackImage);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [listSearchQuery, setListSearchQuery] = useState("");
  const [listCategoryFilter, setListCategoryFilter] = useState("all");
  const [listBrandFilter, setListBrandFilter] = useState("all");
  const listCategoryOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort(),
    [items]
  );
  const listBrandOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.brand))).sort(),
    [items]
  );
  const filteredItems = useMemo(() => {
    const normalizedSearch = listSearchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.brand.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        listCategoryFilter === "all" || item.category === listCategoryFilter;
      const matchesBrand =
        listBrandFilter === "all" || item.brand === listBrandFilter;

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [items, listBrandFilter, listCategoryFilter, listSearchQuery]);

  useEffect(() => {
    setAdminPassword(window.sessionStorage.getItem("clothes-admin-password") ?? "");
  }, []);

  function resetForm() {
    setEditingItemId(null);
    setName("");
    setCategory(categories[0]);
    setBrand("");
    setSeason("all-season");
    setSlots(defaultSlotByCategory[categories[0]]);
    setImageUrl(fallbackImage);
    setPhotoFile(null);
  }

  function startEditing(itemId: string) {
    const item = items.find((currentItem) => currentItem.id === itemId);
    if (!item) return;

    setEditingItemId(item.id);
    setName(item.name);
    setCategory(item.category);
    setBrand(item.brand);
    setSeason(item.season);
    setSlots(item.slots);
    setImageUrl(item.imageUrl);
    setPhotoFile(null);
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
    setPhotoFile(file);
  }

  function toggleSlot(slot: ClothingSlot) {
    setSlots((current) => {
      if (current.includes(slot)) {
        return current.length === 1
          ? current
          : current.filter((currentSlot) => currentSlot !== slot);
      }
      return [...current, slot];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    window.sessionStorage.setItem("clothes-admin-password", adminPassword);

    const uploadedImageUrl = photoFile
      ? await uploadImage(photoFile, adminPassword)
      : imageUrl;

    if (photoFile && !uploadedImageUrl) {
      setIsSaving(false);
      return;
    }

    const finalImageUrl = uploadedImageUrl ?? imageUrl;
    const itemData = {
      name: name.trim() || category,
      category,
      brand: brand.trim() || "No brand",
      season,
      imageUrl: finalImageUrl,
      slots
    };

    const saved = editingItemId
      ? await updateItem(
          {
            ...itemData,
            id: editingItemId
          },
          adminPassword
        )
      : await addItem(itemData, adminPassword);

    setIsSaving(false);

    if (!saved) return;

    resetForm();
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-stone-950/30 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <section
        className={`absolute left-1/2 top-1/2 flex max-h-[92vh] w-[min(1120px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-lg border border-stone-300 bg-[#fbfaf7] shadow-soft transition ${
          open ? "-translate-y-1/2 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="grid max-h-[92vh] w-full grid-cols-1 overflow-y-auto lg:grid-cols-[420px_1fr]">
          <form className="border-b border-stone-300 p-5 lg:border-b-0 lg:border-r" onSubmit={handleSubmit}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
                  Wardrobe
                </p>
                <h2 className="text-2xl font-semibold text-stone-950">
                  {editingItemId ? "Edit clothes" : "Add clothes"}
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

            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">
                Admin password
              </span>
              <input
                className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-stone-950"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                placeholder="Required for saving"
                type="password"
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">
                Name
              </span>
              <input
                className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-stone-950"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Black jacket"
              />
            </label>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  Category
                </span>
                <select
                  className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-stone-950"
                  value={category}
                  onChange={(event) => {
                    const nextCategory = event.target.value;
                    setCategory(nextCategory);
                    setSlots(defaultSlotByCategory[nextCategory] ?? ["top"]);
                  }}
                >
                  {categories.map((itemCategory) => (
                    <option key={itemCategory}>{itemCategory}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-stone-700">
                  Season
                </span>
                <select
                  className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-stone-950"
                  value={season}
                  onChange={(event) => setSeason(event.target.value as Season)}
                >
                  {seasons.map((itemSeason) => (
                    <option key={itemSeason} value={itemSeason}>
                      {seasonLabel(itemSeason)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">
                Brand
              </span>
              <input
                className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-stone-950"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder="Brand"
              />
            </label>

            <div className="mb-4">
              <span className="mb-2 block text-sm font-medium text-stone-700">
                Slot
              </span>
              <div className="grid grid-cols-5 gap-2">
                {allSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`h-10 rounded-md border text-sm font-medium transition ${
                      slots.includes(slot)
                        ? "border-emerald-800 bg-emerald-800 text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:border-emerald-700"
                    }`}
                    onClick={() => toggleSlot(slot)}
                    type="button"
                  >
                    {slotLabels[slot]}
                  </button>
                ))}
              </div>
            </div>

            <label className="mb-5 block cursor-pointer rounded-lg border border-dashed border-stone-300 bg-white p-3 transition hover:border-emerald-700">
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={handlePhoto}
              />
              <div className="grid grid-cols-[92px_1fr] items-center gap-3">
                <div className="relative h-24 overflow-hidden rounded-md bg-stone-100">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="92px"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                  <ImagePlus size={18} />
                  Upload photo
                </div>
              </div>
            </label>

            <button
              className="h-11 w-full rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-950 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? "Saving..."
                : editingItemId
                  ? "Update item"
                  : "Save item"}
            </button>

            {error && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {editingItemId && (
              <button
                className="mt-3 h-10 w-full rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:border-stone-950"
                onClick={resetForm}
                type="button"
              >
                Cancel edit
              </button>
            )}
          </form>

          <div className="p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
                  Saved locally
                </p>
                <h3 className="text-xl font-semibold text-stone-950">
                  All clothes
                </h3>
              </div>
              <span className="rounded-md bg-stone-100 px-2.5 py-1 text-sm text-stone-600">
                {filteredItems.length}/{items.length}
              </span>
            </div>

            <div className="mb-4 grid gap-3 rounded-lg border border-stone-300 bg-white p-3">
              <label className="relative block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  size={18}
                />
                <input
                  className="h-11 w-full rounded-md border border-stone-300 bg-stone-50 pl-10 pr-3 text-sm text-stone-950"
                  value={listSearchQuery}
                  onChange={(event) => setListSearchQuery(event.target.value)}
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
                    value={listCategoryFilter}
                    onChange={(event) => setListCategoryFilter(event.target.value)}
                  >
                    <option value="all">All categories</option>
                    {listCategoryOptions.map((itemCategory) => (
                      <option key={itemCategory} value={itemCategory}>
                        {itemCategory}
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
                    value={listBrandFilter}
                    onChange={(event) => setListBrandFilter(event.target.value)}
                  >
                    <option value="all">All brands</option>
                    {listBrandOptions.map((itemBrand) => (
                      <option key={itemBrand} value={itemBrand}>
                        {itemBrand}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className={`grid cursor-pointer grid-cols-[88px_1fr_auto] gap-3 rounded-lg border bg-white p-2 text-left transition hover:border-emerald-700 ${
                    editingItemId === item.id
                      ? "border-emerald-800"
                      : "border-stone-300"
                  }`}
                  onClick={() => startEditing(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      startEditing(item.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative h-24 overflow-hidden rounded-md bg-stone-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="88px"
                    />
                  </div>
                  <div className="min-w-0 py-1">
                    <div className="truncate font-semibold text-stone-950">
                      {item.name}
                    </div>
                    <div className="mt-1 text-sm text-stone-600">
                      {item.brand} · {item.category}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-stone-600">
                      {item.slots.map((slot) => (
                        <span
                          key={slot}
                          className="rounded-md bg-stone-100 px-2 py-1"
                        >
                          {slotLabels[slot]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="flex size-9 items-center justify-center rounded-md border border-stone-300 text-stone-500 transition hover:border-red-700 hover:text-red-700"
                    onClick={(event) => {
                      event.stopPropagation();
                      window.sessionStorage.setItem(
                        "clothes-admin-password",
                        adminPassword
                      );
                      removeItem(item.id, adminPassword).then((removed) => {
                        if (removed && editingItemId === item.id) resetForm();
                      });
                    }}
                    type="button"
                    title="Remove"
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>

            {!!items.length && !filteredItems.length && (
              <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
                No items match these filters.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
