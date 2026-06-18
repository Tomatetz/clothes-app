"use client";

import { CSSProperties, PointerEvent, ReactNode } from "react";

type MagneticSurfaceProps = {
	children: ReactNode;
	className?: string;
};

type MagneticStyle = CSSProperties & {
	"--magnetic-x": string;
	"--magnetic-y": string;
	"--parallax-y": string;
};

export function MagneticSurface({
	children,
	className = "",
}: MagneticSurfaceProps) {
	function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
		if (event.pointerType === "touch") return;

		const rect = event.currentTarget.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
		const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;

		event.currentTarget.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
		event.currentTarget.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
	}

	function reset(event: PointerEvent<HTMLDivElement>) {
		event.currentTarget.style.setProperty("--magnetic-x", "0px");
		event.currentTarget.style.setProperty("--magnetic-y", "0px");
	}

	return (
		<div
			className={`magnetic-surface ${className}`}
			onPointerLeave={reset}
			onPointerMove={handlePointerMove}
			style={
				{
					"--magnetic-x": "0px",
					"--magnetic-y": "0px",
					"--parallax-y": "0px",
				} as MagneticStyle
			}
		>
			{children}
		</div>
	);
}
