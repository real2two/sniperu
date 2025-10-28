import type { AutocompleteInteraction, Interaction } from "./interaction";

export type BaseContext = object;

export interface InteractionHook<AddedCtx extends object> {
	before?(
		data: Interaction | AutocompleteInteraction,
		ctx: BaseContext & AddedCtx,
		next: () => void,
	): unknown | Promise<unknown>;
	after?(
		data: Interaction | AutocompleteInteraction,
		ctx: BaseContext & AddedCtx,
		next: () => void,
	): unknown | Promise<unknown>;
}

export type CombinedCtx<H extends readonly InteractionHook<object>[]> =
	H extends readonly [infer First, ...infer Rest]
		? First extends InteractionHook<infer C1>
			? Rest extends readonly InteractionHook<object>[]
				? C1 & CombinedCtx<Rest>
				: C1
			: never
		: unknown;
