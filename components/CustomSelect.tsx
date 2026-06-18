"use client";

import { Check, ChevronDown } from "lucide-react";
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";

export type CustomSelectOption = {
	label: string;
	value: string;
};

type CustomSelectProps = {
	ariaLabel: string;
	options: CustomSelectOption[];
	value: string;
	onChange: (value: string) => void;
	variant?: "filter" | "field";
	className?: string;
};

export function CustomSelect({
	ariaLabel,
	options,
	value,
	onChange,
	variant = "filter",
	className = "",
}: CustomSelectProps) {
	const [open, setOpen] = useState(false);
	const [menuMounted, setMenuMounted] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const rootRef = useRef<HTMLDivElement>(null);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const listboxId = useId();
	const selectedIndex = Math.max(
		0,
		options.findIndex((option) => option.value === value),
	);
	const selectedOption = options[selectedIndex] ?? options[0];

	useEffect(() => {
		if (!open) return;

		function closeOnOutsideClick(event: MouseEvent) {
			if (!rootRef.current?.contains(event.target as Node)) closeMenu();
		}

		document.addEventListener("mousedown", closeOnOutsideClick);
		return () => document.removeEventListener("mousedown", closeOnOutsideClick);
	}, [open]);

	useEffect(
		() => () => {
			if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		},
		[],
	);

	function openMenu() {
		if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		setActiveIndex(selectedIndex);
		setMenuMounted(true);
		setOpen(true);
	}

	function closeMenu() {
		setOpen(false);
		if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		closeTimerRef.current = setTimeout(() => setMenuMounted(false), 190);
	}

	function choose(index: number) {
		const option = options[index];
		if (!option) return;
		onChange(option.value);
		closeMenu();
	}

	function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key === "Escape") {
			closeMenu();
			return;
		}

		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			if (!open) {
				openMenu();
				return;
			}

			const direction = event.key === "ArrowDown" ? 1 : -1;
			setActiveIndex(
				(current) => (current + direction + options.length) % options.length,
			);
			return;
		}

		if ((event.key === "Enter" || event.key === " ") && open) {
			event.preventDefault();
			choose(activeIndex);
		}
	}

	const isField = variant === "field";

	return (
		<div className={`relative ${className}`} ref={rootRef}>
			<button
				aria-controls={listboxId}
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-label={ariaLabel}
				className={`flex w-full items-center justify-between gap-3 text-left transition ${
					isField
						? "h-12 border border-stone-950/25 bg-transparent px-3 pb-1 pt-4 text-sm text-stone-950 hover:bg-[#e2ded3]"
						: "h-12 bg-transparent px-3 text-xs uppercase tracking-[0.08em] text-stone-950 hover:bg-[#e8e4da]"
				}`}
				onClick={() => (open ? closeMenu() : openMenu())}
				onKeyDown={handleKeyDown}
				type="button"
			>
				<span className="truncate">{selectedOption?.label}</span>
				<ChevronDown
					className={`shrink-0 transition-transform duration-200 ${
						open ? "rotate-180" : ""
					}`}
					size={14}
					strokeWidth={1.5}
				/>
			</button>

			{menuMounted && (
				<div
					aria-label={ariaLabel}
					className={`dropdown-unfold absolute left-0 right-0 z-50 max-h-64 overflow-y-auto border border-stone-950/30 bg-[#f3f1eb] ${
						open ? "dropdown-unfold-open" : "dropdown-unfold-closed"
					} ${
						isField ? "top-[calc(100%-1px)]" : "top-full"
					}`}
					id={listboxId}
					role="listbox"
				>
					{options.map((option, index) => {
						const selected = option.value === value;
						const active = index === activeIndex;

						return (
							<button
								aria-selected={selected}
								className={`flex min-h-10 w-full items-center justify-between gap-3 border-b border-stone-950/15 px-3 py-2 text-left last:border-b-0 ${
									isField
										? "text-sm"
										: "text-[10px] uppercase tracking-[0.1em]"
								} ${
									selected
										? "bg-stone-950 text-[#f3f1eb]"
										: active
											? "bg-[#ddd8cc] text-stone-950"
											: "text-stone-700 hover:bg-[#e8e4da]"
								}`}
								key={option.value}
								onClick={() => choose(index)}
								onMouseEnter={() => setActiveIndex(index)}
								role="option"
								style={{
									animationDelay: open
										? `${Math.min(index, 8) * 18 + 45}ms`
										: "0ms",
								}}
								type="button"
							>
								<span>{option.label}</span>
								{selected && <Check size={13} strokeWidth={1.5} />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
