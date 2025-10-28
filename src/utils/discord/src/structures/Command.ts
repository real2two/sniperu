import {
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import type { BuildableOption, OptionBuilder } from "../types/options";
import { createOptions } from "../utils/createOption";
import { BaseCommand } from "./BaseCommand";

export abstract class Command<
	O extends Record<string, BuildableOption> = Record<string, BuildableOption>,
> extends BaseCommand {
	opts?: (o: OptionBuilder) => O;
	private get _parsedOpts() {
		return this.opts?.(createOptions());
	}

	serialize(): RESTPostAPIApplicationCommandsJSONBody {
		return {
			type: this.type,
			name: this.name,
			name_localizations: this.name_localizations,
			description: (this.type === ApplicationCommandType.ChatInput
				? (this.description ?? "No description has been set")
				: undefined) as string,
			description_localizations: this.description_localizations,
			options: Object.entries(this._parsedOpts || {})
				.map(([n, o]) => {
					const serializedOption = o.serialize();
					if (!serializedOption.name) serializedOption.name = n;
					return serializedOption;
				})
				.sort(
					(a, b) => Number(b.required || false) - Number(a.required || false),
				),
			default_member_permissions: this.default_member_permissions?.toString(),
			nsfw: this.nsfw,
			integration_types: this.integration_types,
			contexts: this.contexts,
			handler: this.handler,
		};
	}
}
