type HighlightedTextProps = {
	query: string;
	text: string;
};

export function HighlightedText({ query, text }: HighlightedTextProps) {
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
						className="bg-[#d9d2bf] text-stone-950"
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
