/** biome-ignore-all lint/suspicious/noExplicitAny: allow any */

import {
	type APIActionRowComponent,
	type APIBaseInteraction,
	ComponentType,
	type InteractionType,
} from "discord-api-types/v10";

export function getModal(
	interaction: APIBaseInteraction<InteractionType, any>,
) {
	return {
		text: (customId: string): string | undefined =>
			(interaction.data?.components as APIActionRowComponent<any>[])
				?.flatMap((c) => c.components)
				.find(
					(c) => c.type === ComponentType.TextInput && c.custom_id === customId,
				)?.value,
	};
}
