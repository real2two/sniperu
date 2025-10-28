import {
	ApplicationCommandType,
	type ApplicationIntegrationType,
	type EntryPointCommandHandlerType,
	type InteractionContextType,
	type LocalizationMap,
} from "discord-api-types/v10";
import type {
	AutocompleteInteraction,
	Interaction,
} from "../types/interaction";

export abstract class BaseCommand {
	type: ApplicationCommandType = ApplicationCommandType.ChatInput;
	abstract name: string;
	name_localizations?: LocalizationMap;
	description?: string;
	description_localizations?: LocalizationMap;
	default_member_permissions?: bigint | string | number;
	nsfw?: boolean;
	integration_types?: ApplicationIntegrationType[];
	contexts?: InteractionContextType[];
	handler?: EntryPointCommandHandlerType;

	autocomplete(_: AutocompleteInteraction): unknown | Promise<unknown> {
		throw new Error("No autocomplete implemented");
	}
	abstract run(interaction: Interaction): unknown | Promise<unknown>;
}
