import {
	type APIApplicationCommandSubcommandOption,
	ApplicationCommandOptionType,
} from "discord-api-types/v10";
import type { BuildableOption, OptionBuilder } from "../types/options";
import { createOptions } from "../utils/createOption";
import { BaseSubcommand } from "./BaseSubcommand";

export abstract class Subcommand<
	O extends Record<string, BuildableOption> = Record<string, BuildableOption>,
> extends BaseSubcommand {
	type = ApplicationCommandOptionType.Subcommand as const;
	opts?: (o: OptionBuilder) => O;
	private get _parsedOpts() {
		return this.opts?.(createOptions());
	}

	serialize(): APIApplicationCommandSubcommandOption {
		return {
			type: this.type,
			name: this.name,
			name_localizations: this.name_localizations,
			description: this.description ?? "No description has been set",
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
		};
	}
}
