import type { LocalizationMap } from "discord-api-types/v10";
import type {
	AutocompleteInteraction,
	Interaction,
} from "../types/interaction";

export abstract class BaseSubcommand {
	abstract name: string;
	name_localizations?: LocalizationMap;
	description?: string;
	description_localizations?: LocalizationMap;

	autocomplete(_: AutocompleteInteraction): unknown | Promise<unknown> {
		throw new Error("No autocomplete implemented");
	}
	abstract run(interaction: Interaction): unknown | Promise<unknown>;
}
