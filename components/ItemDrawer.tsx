"use client";

import { useWardrobe } from "@/context/WardrobeContext";
import { ClothingSlot, slotLabels } from "@/lib/wardrobe";
import { Search, X } from "lucide-react";
import Image from "next/image";
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
				text: text.slice(cursor, matchIndex),
			});
		}

		parts.push({
			highlighted: true,
			text: text.slice(matchIndex, matchIndex + normalizedQuery.length),
		});

		cursor = matchIndex + normalizedQuery.length;
		matchIndex = normalizedText.indexOf(normalizedQuery, cursor);
	}

	if (cursor < text.length) {
		parts.push({
			highlighted: false,
			text: text.slice(cursor),
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
				),
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
				className={`absolute inset-0 bg-stone-950/55 backdrop-blur-[3px] transition-opacity duration-300 ${
					activeSlot ? "opacity-100" : "opacity-0"
				}`}
				onClick={onClose}
			/>
			<aside
				className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-white/90 bg-white/20 px-5 pb-5 shadow-[-28px_0_90px_rgba(0,0,0,0.42)] backdrop-blur-md transition-transform duration-300 sm:px-6 sm:pb-6 ${
					activeSlot ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="sticky top-0 z-20 -mx-5 flex min-h-16 items-center justify-between gap-4 border-b border-white/50 bg-white/20 px-5 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
					<h2 className="text-xl font-semibold text-stone-950">
						{activeSlot ? slotLabels[activeSlot] : "Items"}
					</h2>
					<button
						className="flex size-9 items-center justify-center rounded-md bg-white/60 text-stone-700 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-xl transition hover:bg-white/85 hover:ring-stone-950/20"
						onClick={onClose}
						type="button"
						title="Close"
					>
						<X size={18} />
					</button>
				</div>

				<div className="sticky top-16 z-10 -mx-5 mb-3 grid grid-cols-2 gap-2 border-b border-white/40 bg-white/20 px-5 py-3 backdrop-blur-md sm:-mx-6 sm:grid-cols-[minmax(180px,1fr)_150px_150px] sm:px-6">
					<label className="relative col-span-2 block sm:col-span-1">
						<Search
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
							size={18}
						/>
						<input
							className="h-10 w-full rounded-md border-0 bg-white/65 pl-9 pr-3 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md placeholder:text-stone-500"
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder="Search by name or brand"
						/>
					</label>

					<select
						className="h-10 min-w-0 rounded-md border-0 bg-white/65 px-3 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md"
						value={categoryFilter}
						onChange={(event) => setCategoryFilter(event.target.value)}
						aria-label="Category"
					>
						<option value="all">All categories</option>
						{categoryOptions.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>

					<select
						className="h-10 min-w-0 rounded-md border-0 bg-white/65 px-3 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md"
						value={brandFilter}
						onChange={(event) => setBrandFilter(event.target.value)}
						aria-label="Brand"
					>
						<option value="all">All brands</option>
						{brandOptions.map((brand) => (
							<option key={brand} value={brand}>
								{brand}
							</option>
						))}
					</select>
				</div>

				<div className="grid gap-3">
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
								className={`grid grid-cols-[86px_1fr] items-center gap-3 rounded-md bg-white/50 p-2 text-left shadow-[0_8px_24px_rgba(28,25,23,0.06)] ring-1 backdrop-blur-xl transition duration-200 sm:grid-cols-[112px_1fr] sm:p-2.5 ${
									isSelected
										? "bg-emerald-50/65 ring-2 ring-emerald-700"
										: isSelectedElsewhere
											? "opacity-55 grayscale ring-white/50 hover:opacity-75"
											: "ring-white/60 hover:-translate-y-0.5 hover:bg-white/75 hover:ring-emerald-700/50 hover:shadow-[0_14px_32px_rgba(28,25,23,0.1)]"
								}`}
								onClick={() => {
									if (!activeSlot) return;
									selectItem(activeSlot, item.id);
									onClose();
								}}
								type="button"
							>
								<div className="relative h-24 overflow-hidden rounded-md bg-stone-100 sm:h-28">
									<Image
										src={item.imageUrl}
										alt={item.name}
										fill
										className="object-cover"
										unoptimized
										sizes="(max-width: 640px) 86px, 112px"
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
										<span className="rounded-full bg-stone-100/85 px-2.5 py-1">
											{item.category}
										</span>
										{selectedElsewhere && (
											<span className="rounded-full bg-stone-200/80 px-2.5 py-1 text-stone-700">
												Selected in {slotLabels[selectedElsewhere]}
											</span>
										)}
									</div>
								</div>
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
