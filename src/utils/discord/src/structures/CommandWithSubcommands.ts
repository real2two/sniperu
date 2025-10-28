import {
	ApplicationCommandType,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import type {
	AutocompleteInteraction,
	Interaction,
} from "../types/interaction.js";
import { BaseCommand } from "./BaseCommand.js";
import type { Subcommand } from "./Subcommand.js";
import type { SubcommandGroup } from "./SubcommandGroup.js";

export abstract class CommandWithSubcommands extends BaseCommand {
	override type = ApplicationCommandType.ChatInput as const;
	abstract subcommands: (Subcommand | SubcommandGroup)[];

	override autocomplete(data: AutocompleteInteraction) {
		const subcommand = this.subcommands.find(
			(c) =>
				c.type === data.interaction.data?.options?.[0]?.type &&
				c.name === data.interaction.data?.options?.[0]?.name,
		);
		if (!subcommand) return;
		return subcommand?.autocomplete?.(data);
	}
	run(data: Interaction) {
		const subcommand = this.subcommands.find(
			(c) =>
				c.type === data.interaction.data?.options?.[0]?.type &&
				c.name === data.interaction.data?.options?.[0]?.name,
		);
		if (!subcommand) return;
		return subcommand?.run?.(data);
	}

	serialize(): RESTPostAPIChatInputApplicationCommandsJSONBody {
		return {
			type: this.type,
			name: this.name,
			name_localizations: this.name_localizations,
			description: (this.type === ApplicationCommandType.ChatInput
				? (this.description ?? "No description has been set")
				: undefined) as string,
			description_localizations: this.description_localizations,
			options: this.subcommands.map((o) => o.serialize()),
			default_member_permissions: this.default_member_permissions?.toString(),
			nsfw: this.nsfw,
			integration_types: this.integration_types,
			contexts: this.contexts,
			handler: this.handler,
		};
	}
}
