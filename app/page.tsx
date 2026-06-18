"use client";

import { ClosetView } from "@/components/ClosetView";
import { ItemDrawer } from "@/components/ItemDrawer";
import { ManagePanel } from "@/components/ManagePanel";
import { ClothingSlot, slotLabels } from "@/lib/wardrobe";
import { Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const outfitSlots: ClothingSlot[] = ["top", "outerTop", "bottom", "shoes"];
const slotNumbers: Record<ClothingSlot, string> = {
	top: "01",
	outerTop: "02",
	bottom: "03",
	shoes: "04",
	bag: "05",
};

export default function Home() {
	const [activeSlot, setActiveSlot] = useState<ClothingSlot | null>(null);
	const [isManaging, setIsManaging] = useState(false);
	const [modeTransition, setModeTransition] = useState<
		"to-manage" | "to-outfit" | null
	>(null);
	const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
		},
		[],
	);

	function toggleMode() {
		if (modeTransition) return;

		const nextManaging = !isManaging;
		setModeTransition(nextManaging ? "to-manage" : "to-outfit");

		window.setTimeout(() => setIsManaging(nextManaging), 260);
		transitionTimerRef.current = setTimeout(
			() => setModeTransition(null),
			620,
		);
	}

	return (
		<main className="min-h-screen overflow-x-clip bg-[#f3f1eb] px-4 py-4 text-stone-950 sm:px-7 lg:px-10">
			<div
				className="mx-auto max-w-[1600px]"
			>
				<header className="flex items-center justify-end gap-6 border-b border-stone-950/30 pb-4">
					<button
						className="mb-0.5 inline-flex h-9 items-center justify-center gap-2 border border-stone-950/30 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition hover:border-stone-950 hover:bg-stone-950 hover:text-[#f3f1eb]"
						onClick={toggleMode}
						type="button"
					>
						<Settings2 size={14} strokeWidth={1.5} />
						{isManaging ? "Back to outfit" : "Manage wardrobe"}
					</button>
				</header>

				<div
					className={`mode-canvas relative min-h-[620px] lg:h-[calc(100vh-146px)] ${
						modeTransition ? `mode-canvas-${modeTransition}` : ""
					}`}
				>
				<section
					className={`absolute inset-0 border-b border-stone-950/30 bg-[#f3f1eb] transition-opacity duration-300 lg:grid lg:grid-cols-12 ${
						isManaging
							? "pointer-events-none opacity-0"
							: "pointer-events-auto opacity-100"
					}`}
					aria-hidden={isManaging}
				>
					<div className="grid border-stone-950/20 md:grid-cols-2 lg:col-span-9 lg:grid-rows-2 lg:border-r">
						{outfitSlots.map((slot) => (
							<div
								className="h-full border-b border-stone-950/20 md:odd:border-r lg:[&:nth-child(n+3)]:border-b-0"
								key={slot}
							>
								<ClosetView
									index={slotNumbers[slot]}
									slot={slot}
									onOpen={() => setActiveSlot(slot)}
								/>
							</div>
						))}
					</div>

					<aside className="flex min-h-[420px] flex-col lg:col-span-3">
						<ClosetView
							compact
							index={slotNumbers.bag}
							slot="bag"
							onOpen={() => setActiveSlot("bag")}
						/>
					</aside>
				</section>
					<ManagePanel active={isManaging} />
					<div
						className="mode-bag-wipe pointer-events-none absolute bottom-0 right-0 top-0 z-30 hidden w-1/4 overflow-hidden lg:block"
						aria-hidden="true"
					>
						<span className="mode-bag-wipe-fill absolute inset-0" />
						<span className="mode-bag-wipe-line absolute left-0 right-0 h-px bg-stone-950/55" />
					</div>
				</div>

				<nav className="flex flex-wrap items-center justify-between gap-3 py-3 text-[10px] uppercase tracking-[0.16em] text-stone-500">
					<span>
						{isManaging
							? "Edit your wardrobe collection"
							: "Build an outfit, one piece at a time"}
					</span>
					{!isManaging && <div className="flex flex-wrap gap-x-5 gap-y-2">
						{[...outfitSlots, "bag" as ClothingSlot].map((slot) => (
							<button
								key={slot}
								className="transition hover:text-stone-950"
								onClick={() => setActiveSlot(slot)}
								type="button"
							>
								{slotNumbers[slot]} {slotLabels[slot]}
							</button>
						))}
					</div>}
				</nav>
			</div>

			<ItemDrawer activeSlot={activeSlot} onClose={() => setActiveSlot(null)} />
		</main>
	);
}
