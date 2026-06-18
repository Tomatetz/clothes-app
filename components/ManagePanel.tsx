"use client";

import { CustomSelect } from "@/components/CustomSelect";
import { HighlightedText } from "@/components/HighlightedText";
import { useWardrobe } from "@/context/WardrobeContext";
import {
	categories,
	ClothingSlot,
	defaultSlotByCategory,
	slotLabels,
} from "@/lib/wardrobe";
import { ImagePlus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import {
	ChangeEvent,
	FormEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

const fallbackImage = "/samples/item.svg";
const allSlots: ClothingSlot[] = ["top", "outerTop", "bottom", "shoes", "bag"];
const slotNumbers: Record<ClothingSlot, string> = {
	top: "01",
	outerTop: "02",
	bottom: "03",
	shoes: "04",
	bag: "05",
};

type ManagePanelProps = {
	active: boolean;
};

export function ManagePanel({ active }: ManagePanelProps) {
	const { addItem, error, items, removeItem, updateItem, uploadImage } =
		useWardrobe();
	const panelScrollRef = useRef<HTMLDivElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
	const [deletePassword, setDeletePassword] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [adminPassword, setAdminPassword] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [name, setName] = useState("");
	const [category, setCategory] = useState(categories[0]);
	const [brand, setBrand] = useState("");
	const [slots, setSlots] = useState<ClothingSlot[]>(
		defaultSlotByCategory[categories[0]],
	);
	const [imageUrl, setImageUrl] = useState(fallbackImage);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [listSearchQuery, setListSearchQuery] = useState("");
	const [listCategoryFilter, setListCategoryFilter] = useState("all");
	const [listBrandFilter, setListBrandFilter] = useState("all");
	const listCategoryOptions = useMemo(
		() => Array.from(new Set(items.map((item) => item.category))).sort(),
		[items],
	);
	const listBrandOptions = useMemo(
		() => Array.from(new Set(items.map((item) => item.brand))).sort(),
		[items],
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
	const deletingItem = deletingItemId
		? items.find((item) => item.id === deletingItemId)
		: null;

	useEffect(() => {
		setAdminPassword(
			window.sessionStorage.getItem("clothes-admin-password") ?? "",
		);
	}, []);

	function resetForm() {
		setEditingItemId(null);
		setName("");
		setCategory(categories[0]);
		setBrand("");
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
		setSlots(item.slots);
		setImageUrl(item.imageUrl);
		setPhotoFile(null);

		requestAnimationFrame(() => {
			panelScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
			formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
		});
	}

	function requestDelete(itemId: string) {
		setDeletingItemId(itemId);
		setDeletePassword("");
	}

	function cancelDelete() {
		if (isDeleting) return;
		setDeletingItemId(null);
		setDeletePassword("");
	}

	async function confirmDelete() {
		if (!deletingItemId || !deletePassword) return;

		setIsDeleting(true);
		window.sessionStorage.setItem("clothes-admin-password", deletePassword);
		const removed = await removeItem(deletingItemId, deletePassword);
		setIsDeleting(false);

		if (!removed) return;

		if (editingItemId === deletingItemId) resetForm();
		setAdminPassword(deletePassword);
		setDeletingItemId(null);
		setDeletePassword("");
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
			imageUrl: finalImageUrl,
			slots,
		};

		const saved = editingItemId
			? await updateItem(
					{
						...itemData,
						id: editingItemId,
					},
					adminPassword,
				)
			: await addItem(itemData, adminPassword);

		setIsSaving(false);

		if (!saved) return;

		resetForm();
	}

	return (
		<section
			ref={panelScrollRef}
			className={`manage-inline absolute inset-0 grid min-h-[620px] border-b border-stone-950/30 bg-[#e8ebe7] transition-opacity duration-300 lg:h-full lg:grid-cols-12 lg:overflow-hidden ${
				active
					? "pointer-events-auto opacity-100"
					: "pointer-events-none opacity-0"
			}`}
			aria-hidden={!active}
		>
			<form
				ref={formRef}
				className="order-1 border-b border-stone-950/30 bg-[#dedbd1] px-5 pb-6 lg:order-2 lg:col-span-3 lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-l overscroll-y-none"
				onSubmit={handleSubmit}
			>
				<div className="-mx-5 mb-5 border-b border-stone-950/30 bg-[#dedbd1] px-5 py-5 lg:sticky lg:top-0 lg:z-20">
					<div>
						<div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
							Wardrobe editor / {String(items.length).padStart(2, "0")}
						</div>
						<h2 className="fashion-display mt-2 text-5xl leading-[0.82] tracking-[-0.045em] text-stone-950">
							{editingItemId ? "Edit piece" : "New piece"}
						</h2>
					</div>
				</div>

				<label className="relative mb-3 block">
					<span className="pointer-events-none absolute left-3 top-1.5 z-10 text-[10px] font-semibold uppercase text-stone-500">
						Admin password
					</span>
					<input
						className="h-12 w-full border border-stone-950/25 bg-transparent px-3 pb-1 pt-4 text-sm text-stone-950 placeholder:text-stone-500"
						value={adminPassword}
						onChange={(event) => setAdminPassword(event.target.value)}
						placeholder="Required for saving"
						type="password"
					/>
				</label>

				<label className="relative mb-3 block">
					<span className="pointer-events-none absolute left-3 top-1.5 z-10 text-[10px] font-semibold uppercase text-stone-500">
						Name
					</span>
					<input
						className="h-12 w-full border border-stone-950/25 bg-transparent px-3 pb-1 pt-4 text-sm text-stone-950 placeholder:text-stone-500"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Black jacket"
					/>
				</label>

				<label className="relative mb-3 block">
					<span className="pointer-events-none absolute left-3 top-1.5 z-10 text-[10px] font-semibold uppercase text-stone-500">
						Category
					</span>
					<CustomSelect
						ariaLabel="Category"
						variant="field"
						value={category}
						onChange={(nextCategory) => {
							setCategory(nextCategory);
							setSlots(defaultSlotByCategory[nextCategory] ?? ["top"]);
						}}
						options={categories.map((itemCategory) => ({
							label: itemCategory,
							value: itemCategory,
						}))}
					/>
				</label>

				<label className="relative mb-3 block">
					<span className="pointer-events-none absolute left-3 top-1.5 z-10 text-[10px] font-semibold uppercase text-stone-500">
						Brand
					</span>
					<input
						className="h-12 w-full border border-stone-950/25 bg-transparent px-3 pb-1 pt-4 text-sm text-stone-950 placeholder:text-stone-500"
						value={brand}
						onChange={(event) => setBrand(event.target.value)}
						placeholder="Brand"
					/>
				</label>

				<div className="mb-4">
					<span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
						Placement
					</span>
					<div className="grid grid-cols-5 border-l border-t border-stone-950/25">
						{allSlots.map((slot) => (
							<button
								key={slot}
								className={`flex h-12 flex-col items-center justify-center border-b border-r border-stone-950/25 text-[9px] font-semibold uppercase tracking-[0.1em] transition ${
									slots.includes(slot)
										? "bg-stone-950 text-[#f3f1eb]"
										: "text-stone-600 hover:bg-[#ded9cd] hover:text-stone-950"
								}`}
								onClick={() => toggleSlot(slot)}
								type="button"
							>
								<span>{slotNumbers[slot]}</span>
								<span className="mt-0.5 hidden sm:inline">
									{slotLabels[slot]}
								</span>
							</button>
						))}
					</div>
				</div>

				<label className="mb-5 block cursor-pointer border border-stone-950/25 p-3 transition hover:bg-[#ded9cd]">
					<input
						className="sr-only"
						type="file"
						accept="image/*"
						onChange={handlePhoto}
					/>
					<div className="grid grid-cols-[92px_1fr] items-center gap-3">
						<div className="relative h-24 overflow-hidden bg-[#e2ded4]">
							<Image
								src={imageUrl}
								alt="Preview"
								fill
								className="object-cover"
								unoptimized
								sizes="92px"
							/>
						</div>
						<div className="text-stone-700">
							<div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em]">
								<ImagePlus size={16} strokeWidth={1.5} />
								Upload image
							</div>
							<div className="mt-2 text-xs text-stone-500">
								JPG, PNG or WebP
							</div>
						</div>
					</div>
				</label>

				<button
					className="h-11 w-full bg-stone-950 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f3f1eb] transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
					disabled={isSaving}
					type="submit"
				>
					{isSaving ? "Saving..." : editingItemId ? "Update item" : "Save item"}
				</button>

				{error && (
					<div className="mt-3 border border-red-700/30 bg-red-50 px-3 py-2 text-xs text-red-800">
						{error}
					</div>
				)}

				{editingItemId && (
					<button
						className="mt-3 h-10 w-full border border-stone-950/30 px-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-700 transition hover:bg-stone-950 hover:text-[#f3f1eb]"
						onClick={resetForm}
						type="button"
					>
						Cancel edit
					</button>
				)}
			</form>

			<div className="order-2 min-w-0 overflow-x-hidden bg-[#e8ebe7] pb-5 lg:order-1 lg:col-span-9 lg:h-full lg:overflow-y-auto overscroll-y-none">
				<div
					className={`manage-filter-row sticky top-0 z-10 mb-0 overflow-visible border-b border-stone-950/30 bg-[#e8ebe7] ${
						active ? "manage-filter-row-open" : ""
					}`}
				>
					<div className="grid grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_170px_150px]">
						<label className="relative block">
							<Search
								className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-stone-500"
								size={15}
								strokeWidth={1.5}
							/>
							<input
								className="h-12 w-full border-0 border-r border-stone-950/20 bg-transparent pl-6 pr-3 text-xs uppercase tracking-[0.08em] text-stone-950 placeholder:text-stone-500"
								value={listSearchQuery}
								onChange={(event) => setListSearchQuery(event.target.value)}
								placeholder="Search by name or brand"
							/>
						</label>

						<CustomSelect
							ariaLabel="Category"
							className="min-w-0 border-r border-stone-950/20"
							value={listCategoryFilter}
							onChange={setListCategoryFilter}
							options={[
								{ label: "All categories", value: "all" },
								...listCategoryOptions.map((itemCategory) => ({
									label: itemCategory,
									value: itemCategory,
								})),
							]}
						/>

						<CustomSelect
							ariaLabel="Brand"
							className="col-span-2 min-w-0 lg:col-span-1"
							value={listBrandFilter}
							onChange={setListBrandFilter}
							options={[
								{ label: "All brands", value: "all" },
								...listBrandOptions.map((itemBrand) => ({
									label: itemBrand,
									value: itemBrand,
								})),
							]}
						/>
					</div>
				</div>

				<div className="grid border-l border-stone-950/20 sm:grid-cols-2 xl:grid-cols-3">
					{filteredItems.map((item) => (
						<article
							key={item.id}
							className={`group/item relative flex cursor-pointer flex-col border-b border-r border-stone-950/20 text-left transition duration-300 hover:bg-[#e8e4da] ${
								editingItemId === item.id ? "bg-stone-950 text-[#f3f1eb]" : ""
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
							<div className="relative aspect-[4/3] overflow-hidden bg-[#e7e4dc]">
								<Image
									src={item.imageUrl}
									alt={item.name}
									fill
									className="object-cover transition duration-700 group-hover/item:scale-[1.025]"
									unoptimized
									sizes="(max-width: 768px) 50vw, 300px"
								/>
							</div>
							<div className="min-w-0 p-3 pr-11">
								<div
									className={`fashion-display line-clamp-2 text-2xl leading-[0.95] tracking-[-0.03em] ${editingItemId === item.id ? "text-[#f3f1eb]" : "text-stone-950"}`}
								>
									<HighlightedText query={listSearchQuery} text={item.name} />
								</div>
								<div
									className={`mt-2 truncate text-[10px] uppercase tracking-[0.12em] ${editingItemId === item.id ? "text-stone-300" : "text-stone-500"}`}
								>
									<HighlightedText query={listSearchQuery} text={item.brand} />
								</div>
								<div
									className={`mt-1 flex flex-wrap gap-x-2 text-[9px] uppercase tracking-[0.1em] ${editingItemId === item.id ? "text-stone-400" : "text-stone-400"}`}
								>
									<span>{item.category}</span>
									{item.slots.map((slot) => (
										<span key={slot}>{slotNumbers[slot]}</span>
									))}
								</div>
							</div>
							<button
								className={`absolute bottom-3 right-3 flex size-8 items-center justify-center border transition hover:border-red-700 hover:bg-red-700 hover:text-white ${
									editingItemId === item.id
										? "border-stone-500 text-stone-300"
										: "border-stone-950/25 text-stone-500"
								}`}
								onClick={(event) => {
									event.stopPropagation();
									requestDelete(item.id);
								}}
								type="button"
								title="Remove"
							>
								<Trash2 size={15} strokeWidth={1.5} />
							</button>
						</article>
					))}
				</div>

				{!!items.length && !filteredItems.length && (
					<div className="border-x border-b border-stone-950/20 p-12 text-center text-xs uppercase tracking-[0.14em] text-stone-500">
						No items match these filters.
					</div>
				)}
			</div>

			{deletingItem && (
				<div className="absolute inset-0 z-30 flex items-center justify-center bg-stone-950/55 p-4">
					<div
						className="w-full max-w-sm border border-stone-950/30 bg-[#f3f1eb] p-5"
						role="dialog"
						aria-modal="true"
						aria-labelledby="delete-item-title"
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<h3
									id="delete-item-title"
									className="fashion-display text-4xl leading-none tracking-[-0.04em] text-stone-950"
								>
									Delete item?
								</h3>
								<p className="mt-3 text-xs uppercase leading-relaxed tracking-[0.08em] text-stone-500">
									{deletingItem.name} will be removed permanently.
								</p>
							</div>
							<button
								className="flex size-9 shrink-0 items-center justify-center border border-stone-950/30 text-stone-600 transition hover:bg-stone-950 hover:text-[#f3f1eb]"
								onClick={cancelDelete}
								type="button"
								title="Cancel"
							>
								<X size={17} />
							</button>
						</div>

						<label className="relative mt-4 block">
							<span className="pointer-events-none absolute left-3 top-1.5 z-10 text-[10px] font-semibold uppercase text-stone-500">
								Admin password
							</span>
							<input
								className="h-12 w-full border border-stone-950/30 bg-transparent px-3 pb-1 pt-4 text-sm text-stone-950 placeholder:text-stone-500"
								value={deletePassword}
								onChange={(event) => setDeletePassword(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") confirmDelete();
								}}
								placeholder="Required to delete"
								type="password"
								autoFocus
							/>
						</label>

						<div className="mt-4 grid grid-cols-2 gap-2">
							<button
								className="h-10 border border-stone-950/30 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-700 transition hover:bg-stone-950 hover:text-[#f3f1eb]"
								onClick={cancelDelete}
								disabled={isDeleting}
								type="button"
							>
								Cancel
							</button>
							<button
								className="h-10 bg-red-800 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
								onClick={confirmDelete}
								disabled={!deletePassword || isDeleting}
								type="button"
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
