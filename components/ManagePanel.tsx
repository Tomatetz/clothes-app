"use client";

import { SlotIcon } from "@/components/SlotIcon";
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

type ManagePanelProps = {
	open: boolean;
	onClose: () => void;
};

export function ManagePanel({ open, onClose }: ManagePanelProps) {
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
		<div
			className={`fixed inset-0 z-50 transition ${
				open ? "pointer-events-auto" : "pointer-events-none"
			}`}
			aria-hidden={!open}
		>
			<div
				className={`absolute inset-0 bg-stone-950/55 backdrop-blur-[4px] transition-opacity duration-300 ${
					open ? "opacity-100" : "opacity-0"
				}`}
				onClick={onClose}
			/>
			<section
				className={`absolute left-1/2 top-1/2 flex max-h-[92vh] w-[min(1120px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-md border border-white/90 bg-white/30 shadow-[0_18px_48px_rgba(0,0,0,0.56),0_4px_14px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.35)] backdrop-blur-xl transition duration-300 ${
					open
						? "-translate-y-1/2 scale-100 opacity-100"
						: "translate-y-4 scale-[0.985] opacity-0"
				}`}
			>
				<div
					ref={panelScrollRef}
					className="grid h-[92vh] max-h-[92vh] w-full grid-cols-1 overflow-y-auto lg:grid-cols-[420px_1fr] lg:overflow-hidden"
				>
					<form
						ref={formRef}
						className="border-b border-white/45 bg-white/15 px-5 pb-5 lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r overscroll-y-none"
						onSubmit={handleSubmit}
					>
						<div className="-mx-5 mb-5 flex min-h-16 items-center justify-between gap-4 border-b border-white/40 bg-white/45 px-5 py-3 backdrop-blur-xl lg:sticky lg:top-0 lg:z-20">
							<h2 className="text-xl font-semibold text-stone-950">
								{editingItemId ? "Edit clothes" : "Add clothes"}
							</h2>
							<button
								className="flex size-10 items-center justify-center rounded-md bg-white/55 text-stone-700 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md transition hover:bg-white/80 hover:ring-stone-950/20"
								onClick={onClose}
								type="button"
								title="Close"
							>
								<X size={18} />
							</button>
						</div>

						<label className="relative mb-3 block">
							<span className="pointer-events-none absolute left-3 top-1.5 z-10 text-[10px] font-semibold uppercase text-stone-500">
								Admin password
							</span>
							<input
								className="h-12 w-full rounded-md border-0 bg-white/60 px-3 pb-1 pt-4 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md placeholder:text-stone-500"
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
								className="h-12 w-full rounded-md border-0 bg-white/60 px-3 pb-1 pt-4 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md placeholder:text-stone-500"
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder="Black jacket"
							/>
						</label>

						<label className="relative mb-3 block">
							<span className="pointer-events-none absolute left-3 top-1.5 z-10 text-[10px] font-semibold uppercase text-stone-500">
								Category
							</span>
							<select
								className="h-12 w-full rounded-md border-0 bg-white/60 px-3 pb-1 pt-4 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md"
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

						<label className="relative mb-3 block">
							<span className="pointer-events-none absolute left-3 top-1.5 z-10 text-[10px] font-semibold uppercase text-stone-500">
								Brand
							</span>
							<input
								className="h-12 w-full rounded-md border-0 bg-white/60 px-3 pb-1 pt-4 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md placeholder:text-stone-500"
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
										className={`flex h-10 items-center justify-center gap-1.5 rounded-md text-sm font-medium transition ${
											slots.includes(slot)
												? "bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-950/20"
												: "bg-white/45 text-stone-700 ring-1 ring-stone-950/10 backdrop-blur-md hover:bg-emerald-50 hover:text-emerald-950 hover:ring-emerald-700/30"
										}`}
										onClick={() => toggleSlot(slot)}
										type="button"
									>
										<SlotIcon slot={slot} size={15} />
										<span className="hidden sm:inline">{slotLabels[slot]}</span>
									</button>
								))}
							</div>
						</div>

						<label className="mb-5 block cursor-pointer rounded-md border border-dashed border-stone-500/35 bg-white/35 p-3 shadow-sm backdrop-blur-md transition hover:border-emerald-700 hover:bg-white/55">
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
								className="mt-3 h-10 w-full rounded-md border border-white/70 bg-white/40 px-4 text-sm font-semibold text-stone-700 backdrop-blur-md transition hover:border-stone-950 hover:bg-white/65"
								onClick={resetForm}
								type="button"
							>
								Cancel edit
							</button>
						)}
					</form>

					<div className="bg-white/10 px-5 pb-5 lg:h-full lg:overflow-y-auto overscroll-y-none">
						<div className="sticky top-0 z-10 -mx-5 mb-4 min-h-16 border-b border-white/40 bg-white/45 px-5 py-3 backdrop-blur-xl">
							<div className="grid grid-cols-[1fr_auto] gap-2 lg:grid-cols-[minmax(180px,1fr)_150px_150px_auto]">
								<label className="relative block">
									<Search
										className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
										size={17}
									/>
									<input
										className="h-10 w-full rounded-md border-0 bg-white/60 pl-9 pr-3 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md placeholder:text-stone-500"
										value={listSearchQuery}
										onChange={(event) => setListSearchQuery(event.target.value)}
										placeholder="Search by name or brand"
									/>
								</label>

								<select
									className="col-span-2 h-10 min-w-0 rounded-md border-0 bg-white/60 px-3 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md lg:col-span-1"
									value={listCategoryFilter}
									onChange={(event) =>
										setListCategoryFilter(event.target.value)
									}
									aria-label="Category"
								>
									<option value="all">All categories</option>
									{listCategoryOptions.map((itemCategory) => (
										<option key={itemCategory} value={itemCategory}>
											{itemCategory}
										</option>
									))}
								</select>

								<select
									className="col-span-2 h-10 min-w-0 rounded-md border-0 bg-white/60 px-3 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/10 backdrop-blur-md lg:col-span-1"
									value={listBrandFilter}
									onChange={(event) => setListBrandFilter(event.target.value)}
									aria-label="Brand"
								>
									<option value="all">All brands</option>
									{listBrandOptions.map((itemBrand) => (
										<option key={itemBrand} value={itemBrand}>
											{itemBrand}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="grid gap-3 md:grid-cols-2">
							{filteredItems.map((item) => (
								<article
									key={item.id}
									className={`grid cursor-pointer grid-cols-[96px_1fr_auto] gap-3 rounded-md bg-white/42 p-2.5 text-left shadow-[0_8px_24px_rgba(28,25,23,0.06)] ring-1 backdrop-blur-lg transition duration-200 hover:-translate-y-0.5 hover:bg-white/65 hover:ring-emerald-700/45 hover:shadow-[0_14px_32px_rgba(28,25,23,0.1)] ${
										editingItemId === item.id
											? "bg-emerald-50/55 ring-2 ring-emerald-700"
											: "ring-white/60"
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
									<div className="relative h-28 overflow-hidden rounded-md bg-stone-100">
										<Image
											src={item.imageUrl}
											alt={item.name}
											fill
											className="object-cover"
											unoptimized
											sizes="96px"
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
													className="rounded-full bg-stone-100/80 px-2.5 py-1"
												>
													{slotLabels[slot]}
												</span>
											))}
										</div>
									</div>
									<button
										className="flex size-9 items-center justify-center rounded-md bg-white/40 text-stone-500 ring-1 ring-stone-950/10 backdrop-blur-md transition hover:bg-red-50 hover:text-red-700 hover:ring-red-700/30"
										onClick={(event) => {
											event.stopPropagation();
											requestDelete(item.id);
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
							<div className="rounded-lg border border-dashed border-white/70 bg-white/30 p-8 text-center text-sm text-stone-500 backdrop-blur-lg">
								No items match these filters.
							</div>
						)}
					</div>
				</div>

				{deletingItem && (
					<div className="absolute inset-0 z-30 flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm">
						<div
							className="w-full max-w-sm rounded-md border border-white/80 bg-white/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl"
							role="dialog"
							aria-modal="true"
							aria-labelledby="delete-item-title"
						>
							<div className="flex items-start justify-between gap-4">
								<div>
									<h3
										id="delete-item-title"
										className="text-lg font-semibold text-stone-950"
									>
										Delete item?
									</h3>
									<p className="mt-1 text-sm text-stone-600">
										{deletingItem.name} will be removed permanently.
									</p>
								</div>
								<button
									className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/60 text-stone-600 ring-1 ring-stone-950/10 transition hover:bg-white"
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
									className="h-12 w-full rounded-md border-0 bg-white/75 px-3 pb-1 pt-4 text-sm text-stone-950 shadow-sm ring-1 ring-stone-950/15 placeholder:text-stone-500"
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
									className="h-10 rounded-md bg-white/60 text-sm font-semibold text-stone-700 ring-1 ring-stone-950/10 transition hover:bg-white"
									onClick={cancelDelete}
									disabled={isDeleting}
									type="button"
								>
									Cancel
								</button>
								<button
									className="h-10 rounded-md bg-red-700 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
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
		</div>
	);
}
