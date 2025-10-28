import type { BaseContext, CombinedCtx, InteractionHook } from "../types/hooks";
import type {
	AutocompleteInteraction,
	Interaction,
} from "../types/interaction";

export function includeHooksAutocomplete<
	H extends readonly InteractionHook<object>[],
	I extends AutocompleteInteraction = AutocompleteInteraction,
>(
	hooks: [...H],
	callback: (
		interaction: I,
		ctx: BaseContext & CombinedCtx<H>,
	) => unknown | Promise<unknown>,
) {
	return includeHooks<H, I>(hooks, callback);
}

export function includeHooks<
	H extends readonly InteractionHook<object>[],
	I extends Interaction | AutocompleteInteraction = Interaction,
>(
	hooks: [...H],
	callback: (
		interaction: I,
		ctx: BaseContext & CombinedCtx<H>,
	) => unknown | Promise<unknown>,
) {
	return async (interaction: I) => {
		const ctx = {} as BaseContext & CombinedCtx<H>;
		let ended = false;

		for (const hook of hooks) {
			let called = false;
			await hook.before?.(interaction, ctx, () => {
				if (ended) {
					throw new Error(
						"Cannot call next() after finishing initial function",
					);
				}
				called = true;
			});
			if (!called) {
				ended = true;
				return;
			}
		}

		await callback(interaction, ctx);

		for (const hook of [...hooks].reverse()) {
			let called = false;
			await hook.after?.(interaction, ctx, () => {
				if (ended) {
					throw new Error(
						"Cannot call next() after finishing initial function",
					);
				}
				called = true;
			});
			if (!called) {
				ended = true;
				return;
			}
		}
	};
}
