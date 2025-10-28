export function createParam(
	customId: string,
	params?: Record<string, string | number | null | undefined>,
) {
	const filteredParams = Object.fromEntries(
		Object.entries(params ?? {}).filter(([_, v]) => v != null),
	) as Record<string, string>;

	const parsedParams = new URLSearchParams(filteredParams).toString();
	return `${customId}${parsedParams.length ? `?${parsedParams}` : ""}`;
}
