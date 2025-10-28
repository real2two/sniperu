import {
	type APIApplicationCommandSubcommandGroupOption,
	ApplicationCommandOptionType,
} from "discord-api-types/v10";
import type {
	AutocompleteInteraction,
	Interaction,
} from "../types/interaction";
import { BaseSubcommand } from "./BaseSubcommand";
import type { Subcommand } from "./Subcommand";

export abstract class SubcommandGroup extends BaseSubcommand {
	type = ApplicationCommandOptionType.SubcommandGroup as const;
	abstract subcommands: Subcommand[];

	override autocomplete(data: AutocompleteInteraction) {
		const subcommand = this.subcommands.find(
			(c) =>
				c.type === data.interaction.data?.options?.[0]?.options?.[0]?.type &&
				c.name === data.interaction.data?.options?.[0]?.options?.[0]?.name,
		);
		if (!subcommand) return;
		return subcommand?.autocomplete?.(data);
	}
	run(data: Interaction) {
		const subcommand = this.subcommands.find(
			(c) =>
				c.type === data.interaction.data?.options?.[0]?.options?.[0]?.type &&
				c.name === data.interaction.data?.options?.[0]?.options?.[0]?.name,
		);
		if (!subcommand) return;
		return subcommand?.run?.(data);
	}

	serialize(): APIApplicationCommandSubcommandGroupOption {
		return {
			type: this.type,
			name: this.name,
			name_localizations: this.name_localizations,
			description: this.description ?? "No description has been set",
			description_localizations: this.description_localizations,
			options: this.subcommands.map((o) => o.serialize()),
		};
	}
}
