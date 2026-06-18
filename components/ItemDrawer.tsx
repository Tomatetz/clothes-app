"use client";

import { CustomSelect } from "@/components/CustomSelect";
import { HighlightedText } from "@/components/HighlightedText";
import { useWardrobe } from "@/context/WardrobeContext";
import { ClothingSlot, slotLabels } from "@/lib/wardrobe";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ItemDrawerProps = {
	activeSlot: ClothingSlot | null;
	onClose: () => void;
};

export function ItemDrawer({ activeSlot, onClose }: ItemDrawerProps) {
	const { getItemsForSlot, outfit, selectItem } = useWardrobe();
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [brandFilter, setBrandFilter] = useState("all");
	const items = useMemo(
		() => (activeSlot ? getItemsForSlot(activeSlot) : []),
		[activeSlot, getItemsForSlot],
	);
	const categoryOptions = useMemo(
		() => Array.from(new Set(items.map((item) => item.category))).sort(),
		[items],
	);
	const brandOptions = useMemo(
		() => Array.from(new Set(items.map((item) => item.brand))).sort(),
		[items],
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
				className={`absolute inset-0 bg-stone-950/35 transition-opacity duration-300 ${
					activeSlot ? "opacity-100" : "opacity-0"
				}`}
				onClick={onClose}
			/>
			<aside
				className={`absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto border-l border-stone-950/30 bg-[#f3f1eb] px-4 pb-6 transition-transform duration-300 sm:px-6 ${
					activeSlot ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="sticky top-0 z-20 -mx-4 bg-[#f3f1eb] sm:-mx-6">
					<div className="flex items-end justify-between gap-4 border-b border-stone-950/30 px-4 py-5 sm:px-6">
						<div>
							<div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
								Select garment / {String(items.length).padStart(2, "0")} items
							</div>
							<h2 className="fashion-display mt-2 text-5xl leading-[0.8] tracking-[-0.045em] text-stone-950 sm:text-6xl">
								{activeSlot ? slotLabels[activeSlot] : "Items"}
							</h2>
						</div>
						<button
							className="flex size-9 items-center justify-center border border-stone-950/30 text-stone-700 transition hover:bg-stone-950 hover:text-[#f3f1eb]"
							onClick={onClose}
							type="button"
							title="Close"
						>
							<X size={17} strokeWidth={1.5} />
						</button>
					</div>

					<div className="grid grid-cols-2 border-b border-stone-950/30 px-4 sm:grid-cols-[minmax(180px,1fr)_160px_160px] sm:px-6">
						<label className="relative col-span-2 block sm:col-span-1">
							<Search
								className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-stone-500"
								size={15}
								strokeWidth={1.5}
							/>
							<input
								className="h-12 w-full border-0 border-r border-stone-950/20 bg-transparent pl-6 pr-3 text-xs uppercase tracking-[0.08em] text-stone-950 placeholder:text-stone-500"
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								placeholder="Search by name or brand"
							/>
						</label>

						<CustomSelect
							ariaLabel="Category"
							className="min-w-0 border-r border-stone-950/20"
							value={categoryFilter}
							onChange={setCategoryFilter}
							options={[
								{ label: "All categories", value: "all" },
								...categoryOptions.map((category) => ({
									label: category,
									value: category,
								})),
							]}
						/>

						<CustomSelect
							ariaLabel="Brand"
							className="min-w-0"
							value={brandFilter}
							onChange={setBrandFilter}
							options={[
								{ label: "All brands", value: "all" },
								...brandOptions.map((brand) => ({
									label: brand,
									value: brand,
								})),
							]}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 border-l border-stone-950/20 sm:grid-cols-3">
					{filteredItems.map((item) => {
						const isSelected = activeSlot
							? outfit[activeSlot] === item.id
							: false;
						const selectedElsewhere = Object.entries(outfit).find(
							([slot, selectedId]) =>
								slot !== activeSlot && selectedId === item.id,
						)?.[0] as ClothingSlot | undefined;
						const isSelectedElsewhere = Boolean(selectedElsewhere);
						return (
							<button
								key={item.id}
								className={`group/item relative flex min-w-0 flex-col border-b border-r border-stone-950/20 text-left transition duration-300 ${
									isSelected
										? "bg-stone-950 text-[#f3f1eb]"
										: isSelectedElsewhere
											? "opacity-45 grayscale hover:opacity-70"
											: "hover:bg-[#e8e4da]"
								}`}
								onClick={() => {
									if (!activeSlot) return;
									selectItem(activeSlot, item.id);
									onClose();
								}}
								type="button"
							>
								<div className="relative aspect-[3/4] overflow-hidden bg-[#e7e4dc]">
									<Image
										src={item.imageUrl}
										alt={item.name}
										fill
										className="object-cover transition duration-700 group-hover/item:scale-[1.025]"
										unoptimized
										sizes="(max-width: 640px) 50vw, 240px"
									/>
									{isSelected && (
										<span className="absolute left-2 top-2 bg-[#f3f1eb] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-stone-950">
											Selected
										</span>
									)}
								</div>
								<div className="min-w-0 p-3">
									<div className={`fashion-display line-clamp-2 text-xl leading-[0.95] tracking-[-0.025em] ${isSelected ? "text-[#f3f1eb]" : "text-stone-950"}`}>
										<HighlightedText query={searchQuery} text={item.name} />
									</div>
									<div className={`mt-2 truncate text-[10px] uppercase tracking-[0.13em] ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
										<HighlightedText query={searchQuery} text={item.brand} />
									</div>
									<div className={`mt-1 text-[9px] uppercase tracking-[0.1em] ${isSelected ? "text-stone-400" : "text-stone-400"}`}>
										{item.category}
										{selectedElsewhere && (
											<span> / In {slotLabels[selectedElsewhere]}</span>
										)}
									</div>
								</div>
							</button>
						);
					})}
				</div>

				{!items.length && (
					<div className="border-x border-b border-stone-950/20 p-12 text-center text-xs uppercase tracking-[0.14em] text-stone-500">
						No clothes for this slot yet.
					</div>
				)}

				{!!items.length && !filteredItems.length && (
					<div className="border-x border-b border-stone-950/20 p-12 text-center text-xs uppercase tracking-[0.14em] text-stone-500">
						No items match these filters.
					</div>
				)}
			</aside>
		</div>
	);
}
