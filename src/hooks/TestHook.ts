import type {
	AutocompleteInteraction,
	BaseContext,
	Interaction,
	InteractionHook,
} from "$utils/discord";

// biome-ignore lint/suspicious/noEmptyInterface: This is an example
export interface TestHookContext {}

export class TestHook implements InteractionHook<TestHookContext> {
	async before(
		_interaction: Interaction | AutocompleteInteraction,
		_ctx: BaseContext & TestHookContext,
		next: () => void,
	) {
		// Code here

		next();
	}
}
